/**
 * 48co Voice Database Layer
 *
 * Uses @vercel/postgres in production (Vercel), or plain pg locally.
 * All database operations go through this module.
 */

import pg from 'pg'

const isLocalhost = (process.env.POSTGRES_URL || '').includes('localhost')

// Pool for local Postgres (pg package)
let pool
function getPool() {
  if (!pool) {
    pool = new pg.Pool({ connectionString: process.env.POSTGRES_URL })
  }
  return pool
}

// sql tagged template — works like @vercel/postgres sql`...`
// Extracts ${values} as parameterised query ($1, $2, …) to prevent SQL injection
async function sql(strings, ...values) {
  if (isLocalhost) {
    const text = strings.reduce((acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ''), '')
    const result = await getPool().query(text, values)
    return result
  }
  // Production: use @vercel/postgres
  const { sql: vercelSql } = await import('@vercel/postgres')
  return vercelSql(strings, ...values)
}

// Also expose sql.query(text, params) for dynamic queries (used by marketplace)
sql.query = async function (text, params = []) {
  if (isLocalhost) {
    return getPool().query(text, params)
  }
  const { sql: vercelSql } = await import('@vercel/postgres')
  return vercelSql.query(text, params)
}

export { sql }

// ── Initialize tables on first use ──────────────────────
let initialized = false

export async function initDb() {
  if (initialized) return
  initialized = true

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      created_at TIMESTAMP DEFAULT NOW(),
      stripe_customer_id TEXT
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS usage (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      tokens_used INTEGER DEFAULT 0
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS voice_samples (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      source TEXT DEFAULT 'manual',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage(user_id, created_at)`
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`
  await sql`CREATE INDEX IF NOT EXISTS idx_voice_samples_user ON voice_samples(user_id)`

  // ── SaleOnline.co.nz marketplace tables ─────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS domains (
      id TEXT PRIMARY KEY,
      domain TEXT UNIQUE NOT NULL,
      tld TEXT NOT NULL,
      status TEXT DEFAULT 'available',
      industry TEXT,
      location TEXT,
      country TEXT,
      estimated_value INTEGER DEFAULT 0,
      registration_cost INTEGER DEFAULT 0,
      checked_at TIMESTAMP,
      registered_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS generated_sites (
      id TEXT PRIMARY KEY,
      domain_id TEXT REFERENCES domains(id),
      template TEXT NOT NULL,
      content JSONB NOT NULL DEFAULT '{}',
      pages JSONB NOT NULL DEFAULT '{}',
      seo_data JSONB DEFAULT '{}',
      deploy_url TEXT,
      preview_html TEXT,
      status TEXT DEFAULT 'generating',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      site_id TEXT REFERENCES generated_sites(id),
      title TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      monthly_price INTEGER DEFAULT 2900,
      industry TEXT,
      location TEXT,
      country TEXT,
      featured BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'active',
      views INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      listing_id TEXT REFERENCES listings(id),
      buyer_id TEXT REFERENCES users(id),
      stripe_payment_id TEXT,
      stripe_subscription_id TEXT,
      domain_transferred BOOLEAN DEFAULT FALSE,
      status TEXT DEFAULT 'pending',
      purchased_at TIMESTAMP DEFAULT NOW()
    )
  `

  await sql`CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_domains_industry ON domains(industry)`
  await sql`CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_listings_industry ON listings(industry, country)`
  await sql`CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id)`
}

// ── Auth helpers ─────────────────────────────────────────
export async function authenticate(request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null

  await initDb()

  const { rows } = await sql`
    SELECT s.*, u.id as user_id, u.email, u.plan
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `

  return rows[0] || null
}

// ── Usage tracking ───────────────────────────────────────
const LIMITS = {
  free: { grammar_per_day: 10, voice_minutes_per_month: 60, rewrite_per_day: 5 },
  pro: { grammar_per_day: 999999, voice_minutes_per_month: 999999, rewrite_per_day: 999999 },
  business: { grammar_per_day: 999999, voice_minutes_per_month: 999999, rewrite_per_day: 999999 },
  enterprise: { grammar_per_day: 999999, voice_minutes_per_month: 999999, rewrite_per_day: 999999 },
}

export async function checkLimit(user, type) {
  const limits = LIMITS[user.plan] || LIMITS.free

  if (type === 'grammar') {
    const { rows } = await sql`
      SELECT COUNT(*) as count FROM usage
      WHERE user_id = ${user.user_id} AND type = 'grammar'
      AND created_at > NOW() - INTERVAL '1 day'
    `
    return (rows[0]?.count || 0) < limits.grammar_per_day
  }

  if (type === 'rewrite') {
    const { rows } = await sql`
      SELECT COUNT(*) as count FROM usage
      WHERE user_id = ${user.user_id} AND type = 'rewrite'
      AND created_at > NOW() - INTERVAL '1 day'
    `
    return (rows[0]?.count || 0) < limits.rewrite_per_day
  }

  if (type === 'voice') {
    const { rows } = await sql`
      SELECT COUNT(*) as count FROM usage
      WHERE user_id = ${user.user_id} AND type = 'voice'
      AND created_at > NOW() - INTERVAL '30 days'
    `
    return (rows[0]?.count || 0) < limits.voice_minutes_per_month
  }

  return false
}

export async function recordUsage(userId, type, tokens = 0) {
  await sql`INSERT INTO usage (user_id, type, tokens_used) VALUES (${userId}, ${type}, ${tokens})`
}

// ── Voice samples (Preserve My Voice) ────────────────────
export async function getVoiceContext(userId) {
  const { rows } = await sql`
    SELECT content FROM voice_samples
    WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT 10
  `

  if (rows.length === 0) return ''

  const excerpts = rows.map(s => s.content.substring(0, 300)).join('\n---\n')
  return `\n\nIMPORTANT: The user has a specific writing voice. Here are examples of how they naturally write. Preserve their tone, word choice, sentence structure, and personality. Do NOT make it sound generic or corporate:\n\n${excerpts}`
}
