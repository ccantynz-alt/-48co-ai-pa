/**
 * 48co Managed API Proxy
 *
 * Users sign up with email → get a token → extension uses token.
 * This server adds our API keys and forwards requests to Claude/Whisper.
 * Users NEVER see or need an API key.
 *
 * Endpoints:
 *   POST /auth/signup     — create account (email + password)
 *   POST /auth/login      — get session token
 *   POST /grammar         — grammar check (Claude Haiku)
 *   POST /rewrite         — AI rewrite (Claude Sonnet)
 *   POST /transcribe      — voice transcription (Whisper)
 *   GET  /usage           — check usage this month
 *
 * Rate limits:
 *   Free: 10 grammar/day, 60 min voice/month
 *   Pro:  unlimited (checked via plan field in DB)
 */

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const Database = require('better-sqlite3')
const { nanoid } = require('nanoid')
const bcrypt = require('bcrypt')
const path = require('path')

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(cors({ origin: ['https://48co.nz', 'chrome-extension://*', 'http://localhost:3000'] }))
app.use(helmet())

// Rate limit: 60 requests per minute per IP
app.use(rateLimit({ windowMs: 60 * 1000, max: 60 }))

// ── Database ─────────────────────────────────────────────
const db = new Database(path.join(__dirname, '48co.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at TEXT DEFAULT (datetime('now')),
    stripe_customer_id TEXT
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    tokens_used INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS voice_samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT DEFAULT 'manual',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage(user_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_voice_samples_user ON voice_samples(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
`)

// ── Config ───────────────────────────────────────────────
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const PORT = process.env.PORT || 3001

const LIMITS = {
  free: { grammar_per_day: 10, voice_minutes_per_month: 60, rewrite_per_day: 5 },
  pro: { grammar_per_day: 999999, voice_minutes_per_month: 999999, rewrite_per_day: 999999 },
  business: { grammar_per_day: 999999, voice_minutes_per_month: 999999, rewrite_per_day: 999999 },
  enterprise: { grammar_per_day: 999999, voice_minutes_per_month: 999999, rewrite_per_day: 999999 },
}

// ── Auth helpers ─────────────────────────────────────────
function authenticate(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null

  const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")').get(token)
  if (!session) return null

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id)
  return user
}

function getUsageToday(userId, type) {
  const row = db.prepare(
    'SELECT COUNT(*) as count FROM usage WHERE user_id = ? AND type = ? AND created_at > datetime("now", "-1 day")'
  ).get(userId, type)
  return row?.count || 0
}

function getUsageThisMonth(userId, type) {
  const row = db.prepare(
    'SELECT COUNT(*) as count FROM usage WHERE user_id = ? AND type = ? AND created_at > datetime("now", "-30 days")'
  ).get(userId, type)
  return row?.count || 0
}

function recordUsage(userId, type, tokens = 0) {
  db.prepare('INSERT INTO usage (user_id, type, tokens_used) VALUES (?, ?, ?)').run(userId, type, tokens)
}

function checkLimit(user, type) {
  const limits = LIMITS[user.plan] || LIMITS.free

  if (type === 'grammar') {
    return getUsageToday(user.id, 'grammar') < limits.grammar_per_day
  }
  if (type === 'rewrite') {
    return getUsageToday(user.id, 'rewrite') < limits.rewrite_per_day
  }
  if (type === 'voice') {
    return getUsageThisMonth(user.id, 'voice') < limits.voice_minutes_per_month
  }
  return false
}

// ── Auth Routes ──────────────────────────────────────────

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
    if (existing) return res.status(409).json({ error: 'Account already exists. Try logging in.' })

    const id = nanoid()
    const hash = await bcrypt.hash(password, 10)
    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(id, email.toLowerCase(), hash)

    // Create session
    const token = nanoid(32)
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, id, expires)

    res.json({ token, plan: 'free', email: email.toLowerCase() })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Signup failed. Try again.' })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    const token = nanoid(32)
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.id, expires)

    res.json({ token, plan: user.plan, email: user.email })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed. Try again.' })
  }
})

// ── Google Sign-In (one click, no password) ──────────────

app.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ error: 'No Google credential provided' })

    // Verify the Google ID token
    // Google's tokeninfo endpoint validates the JWT without needing a library
    const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    if (!verifyResponse.ok) return res.status(401).json({ error: 'Invalid Google credential' })

    const googleUser = await verifyResponse.json()

    // Verify the token was issued for our app
    if (GOOGLE_CLIENT_ID && googleUser.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Google token not issued for this app' })
    }

    const email = googleUser.email?.toLowerCase()
    if (!email) return res.status(400).json({ error: 'No email in Google account' })

    // Find or create user
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

    if (!user) {
      // New user — create account (no password needed for Google auth)
      const id = nanoid()
      const hash = await bcrypt.hash(nanoid(32), 10) // random password placeholder
      db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)').run(id, email, hash)
      user = { id, email, plan: 'free' }
    }

    // Create session
    const token = nanoid(32)
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.id, expires)

    res.json({
      token,
      plan: user.plan || 'free',
      email: user.email,
      name: googleUser.name || '',
    })
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(500).json({ error: 'Google sign-in failed. Try again.' })
  }
})

// ── Grammar Check (Claude Haiku — fast + cheap) ─────────

app.post('/grammar', async (req, res) => {
  const user = authenticate(req)
  if (!user) return res.status(401).json({ error: 'Please sign in' })
  if (!checkLimit(user, 'grammar')) {
    return res.status(429).json({
      error: 'Daily grammar limit reached',
      limit: LIMITS[user.plan]?.grammar_per_day || 10,
      upgrade: user.plan === 'free',
    })
  }

  const { text } = req.body
  if (!text || text.length < 5) return res.status(400).json({ error: 'Text too short' })
  if (text.length > 3000) return res.status(400).json({ error: 'Text too long (max 3000 chars)' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: 'You are a grammar checker. Analyze the text for grammar, spelling, and punctuation errors. Return a JSON array of corrections. Each correction has: "original" (wrong text), "corrected" (fixed text), "reason" (brief, max 8 words). If correct, return []. Return ONLY valid JSON.',
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) {
      const err = await response.text().catch(() => '')
      console.error('Claude API error:', response.status, err)
      return res.status(502).json({ error: 'Grammar check failed. Try again.' })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text?.trim() || '[]'
    const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()

    let corrections
    try { corrections = JSON.parse(jsonStr) } catch { corrections = [] }

    recordUsage(user.id, 'grammar', data.usage?.output_tokens || 0)
    res.json({ corrections })
  } catch (err) {
    console.error('Grammar check error:', err)
    res.status(500).json({ error: 'Grammar check failed' })
  }
})

// ── AI Rewrite (Claude Sonnet — higher quality) ─────────

// ── "Preserve My Voice" — Upload Writing Samples ─────────

app.post('/voice-samples', (req, res) => {
  const user = authenticate(req)
  if (!user) return res.status(401).json({ error: 'Please sign in' })
  if (user.plan === 'free') return res.status(403).json({ error: 'Voice learning is a Pro feature', upgrade: true })

  const { samples } = req.body // array of text strings
  if (!samples || !Array.isArray(samples) || samples.length === 0) {
    return res.status(400).json({ error: 'Provide an array of writing samples' })
  }

  const insert = db.prepare('INSERT INTO voice_samples (user_id, content, source) VALUES (?, ?, ?)')
  const insertMany = db.transaction((items) => {
    for (const text of items) {
      if (text && text.length > 20) { // min 20 chars per sample
        insert.run(user.id, text.substring(0, 5000), 'upload') // max 5000 chars each
      }
    }
  })

  insertMany(samples.slice(0, 50)) // max 50 samples
  const count = db.prepare('SELECT COUNT(*) as n FROM voice_samples WHERE user_id = ?').get(user.id)

  res.json({ stored: count.n, message: `${count.n} writing samples stored. AI will now preserve your voice.` })
})

app.get('/voice-samples', (req, res) => {
  const user = authenticate(req)
  if (!user) return res.status(401).json({ error: 'Please sign in' })

  const count = db.prepare('SELECT COUNT(*) as n FROM voice_samples WHERE user_id = ?').get(user.id)
  res.json({ count: count.n })
})

app.delete('/voice-samples', (req, res) => {
  const user = authenticate(req)
  if (!user) return res.status(401).json({ error: 'Please sign in' })

  db.prepare('DELETE FROM voice_samples WHERE user_id = ?').run(user.id)
  res.json({ message: 'All writing samples deleted.' })
})

// Helper: build voice context from user's samples
function getVoiceContext(userId) {
  const samples = db.prepare(
    'SELECT content FROM voice_samples WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(userId)

  if (samples.length === 0) return ''

  const excerpts = samples.map(s => s.content.substring(0, 300)).join('\n---\n')
  return `\n\nIMPORTANT: The user has a specific writing voice. Here are examples of how they naturally write. Preserve their tone, word choice, sentence structure, and personality. Do NOT make it sound generic or corporate:\n\n${excerpts}`
}

// ── AI Rewrite (Claude Sonnet — now with voice preservation) ──

app.post('/rewrite', async (req, res) => {
  const user = authenticate(req)
  if (!user) return res.status(401).json({ error: 'Please sign in' })
  if (!checkLimit(user, 'rewrite')) {
    return res.status(429).json({ error: 'Daily rewrite limit reached', upgrade: user.plan === 'free' })
  }

  const { text, mode = 'professional', preserveVoice = true } = req.body
  if (!text) return res.status(400).json({ error: 'No text provided' })

  // Get user's voice context if they have samples and want to preserve voice
  const voiceContext = (preserveVoice && user.plan !== 'free') ? getVoiceContext(user.id) : ''

  const prompts = {
    professional: 'Rewrite this dictated text into clean, professional prose. Fix grammar, remove filler words. Keep original meaning. Return ONLY the rewritten text.',
    casual: 'Clean up this dictated text into natural, casual writing. Fix errors but keep the conversational tone. Return ONLY the cleaned text.',
    concise: 'Rewrite this to be as concise as possible. Remove all filler and redundancy. Return ONLY the rewritten text.',
    email: 'Rewrite this as a professional email with greeting and sign-off. Return ONLY the email text.',
    slack: 'Clean up for a Slack message. Keep it casual and brief. Return ONLY the message.',
    code: 'Convert this spoken description into a clear technical request or code comment. Return ONLY the formatted text.',
  }

  const systemPrompt = (prompts[mode] || prompts.professional) + voiceContext

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: prompts[mode] || prompts.professional,
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) return res.status(502).json({ error: 'Rewrite failed' })

    const data = await response.json()
    const rewritten = data.content?.[0]?.text?.trim() || text

    recordUsage(user.id, 'rewrite', data.usage?.output_tokens || 0)
    res.json({ text: rewritten })
  } catch (err) {
    console.error('Rewrite error:', err)
    res.status(500).json({ error: 'Rewrite failed' })
  }
})

// ── Voice Transcription (Whisper) ────────────────────────

app.post('/transcribe', async (req, res) => {
  const user = authenticate(req)
  if (!user) return res.status(401).json({ error: 'Please sign in' })
  if (!checkLimit(user, 'voice')) {
    return res.status(429).json({ error: 'Monthly voice limit reached', upgrade: user.plan === 'free' })
  }

  // Expect audio as base64 in request body
  const { audio, language = 'en' } = req.body
  if (!audio) return res.status(400).json({ error: 'No audio data' })

  try {
    const audioBuffer = Buffer.from(audio, 'base64')
    const blob = new Blob([audioBuffer], { type: 'audio/webm' })

    const formData = new FormData()
    formData.append('file', blob, 'recording.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', language.split('-')[0])
    formData.append('response_format', 'json')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: formData,
    })

    if (!response.ok) return res.status(502).json({ error: 'Transcription failed' })

    const data = await response.json()

    recordUsage(user.id, 'voice')
    res.json({ text: data.text || '' })
  } catch (err) {
    console.error('Transcription error:', err)
    res.status(500).json({ error: 'Transcription failed' })
  }
})

// ── Usage Stats ──────────────────────────────────────────

app.get('/usage', (req, res) => {
  const user = authenticate(req)
  if (!user) return res.status(401).json({ error: 'Please sign in' })

  const limits = LIMITS[user.plan] || LIMITS.free
  const grammarToday = getUsageToday(user.id, 'grammar')
  const rewriteToday = getUsageToday(user.id, 'rewrite')
  const voiceMonth = getUsageThisMonth(user.id, 'voice')

  res.json({
    plan: user.plan,
    grammar: { used: grammarToday, limit: limits.grammar_per_day },
    rewrite: { used: rewriteToday, limit: limits.rewrite_per_day },
    voice: { used: voiceMonth, limit: limits.voice_minutes_per_month },
  })
})

// ── Health Check ─────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' })
})

// ── Start ────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`48co API running on port ${PORT}`)
  if (!CLAUDE_API_KEY) console.warn('WARNING: CLAUDE_API_KEY not set — grammar/rewrite will fail')
  if (!OPENAI_API_KEY) console.warn('WARNING: OPENAI_API_KEY not set — transcription will fail')
})
