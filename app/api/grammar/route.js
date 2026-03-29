export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { authenticate, checkLimit, recordUsage, initDb } from '../../../lib/db'

export async function POST(request) {
  await initDb()
  const user = await authenticate(request)
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })

  const withinLimit = await checkLimit(user, 'grammar')
  if (!withinLimit) {
    return NextResponse.json({ error: 'Daily grammar limit reached', upgrade: user.plan === 'free' }, { status: 429 })
  }

  const { text } = await request.json()
  if (!text || text.length < 5) return NextResponse.json({ error: 'Please provide at least 5 characters of text' }, { status: 400 })
  if (text.length > 3000) return NextResponse.json({ error: 'Text exceeds the 3,000 character limit. Please split into smaller sections.' }, { status: 400 })

  const claudeKey = process.env.CLAUDE_API_KEY
  if (!claudeKey) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: 'You are a grammar checker. Analyze the text for grammar, spelling, and punctuation errors. Return a JSON array of corrections. Each correction has: "original" (wrong text), "corrected" (fixed text), "reason" (brief, max 8 words). If correct, return []. Return ONLY valid JSON.',
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) return NextResponse.json({ error: 'Grammar service is temporarily unavailable. Please try again in a moment.' }, { status: 502 })

    const data = await response.json()
    const content = data.content?.[0]?.text?.trim() || '[]'
    const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()

    let corrections
    try { corrections = JSON.parse(jsonStr) } catch { corrections = [] }

    await recordUsage(user.user_id, 'grammar', data.usage?.output_tokens || 0)
    return NextResponse.json({ corrections })
  } catch (err) {
    console.error('Grammar check error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again shortly.' }, { status: 500 })
  }
}
