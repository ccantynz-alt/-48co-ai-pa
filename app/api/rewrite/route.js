import { NextResponse } from 'next/server'
import { authenticate, checkLimit, recordUsage, getVoiceContext, initDb } from '../../../lib/db'

export async function POST(request) {
  await initDb()
  const user = await authenticate(request)
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })

  const withinLimit = await checkLimit(user, 'rewrite')
  if (!withinLimit) {
    return NextResponse.json({ error: 'Daily rewrite limit reached', upgrade: user.plan === 'free' }, { status: 429 })
  }

  const { text, mode = 'professional', preserveVoice = true } = await request.json()
  if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

  const claudeKey = process.env.CLAUDE_API_KEY
  if (!claudeKey) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  const voiceContext = (preserveVoice && user.plan !== 'free') ? await getVoiceContext(user.user_id) : ''

  const prompts = {
    professional: 'Rewrite this dictated text into clean, professional prose. Fix grammar, remove filler words. Keep original meaning. Return ONLY the rewritten text.',
    casual: 'Clean up this dictated text into natural, casual writing. Fix errors but keep the conversational tone. Return ONLY the cleaned text.',
    concise: 'Rewrite this to be as concise as possible. Remove all filler and redundancy. Return ONLY the rewritten text.',
    email: 'Rewrite this as a professional email with greeting and sign-off. Return ONLY the email text.',
    slack: 'Clean up for a Slack message. Keep it casual and brief. Return ONLY the message.',
    code: 'Convert this spoken description into a clear technical request or code comment. Return ONLY the formatted text.',
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: (prompts[mode] || prompts.professional) + voiceContext,
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) return NextResponse.json({ error: 'Rewrite failed' }, { status: 502 })

    const data = await response.json()
    const rewritten = data.content?.[0]?.text?.trim() || text

    await recordUsage(user.user_id, 'rewrite', data.usage?.output_tokens || 0)
    return NextResponse.json({ text: rewritten })
  } catch (err) {
    console.error('Rewrite error:', err)
    return NextResponse.json({ error: 'Rewrite failed' }, { status: 500 })
  }
}
