export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { sql, authenticate, initDb } from '../../../lib/db'

export async function GET(request) {
  await initDb()
  const user = await authenticate(request)
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })

  const limits = {
    free: { grammar_per_day: 10, voice_minutes_per_month: 60, rewrite_per_day: 5 },
    pro: { grammar_per_day: 999999, voice_minutes_per_month: 999999, rewrite_per_day: 999999 },
    business: { grammar_per_day: 999999, voice_minutes_per_month: 999999, rewrite_per_day: 999999 },
  }

  const plan = limits[user.plan] || limits.free

  const { rows: grammarRows } = await sql`
    SELECT COUNT(*) as count FROM usage WHERE user_id = ${user.user_id} AND type = 'grammar' AND created_at > NOW() - INTERVAL '1 day'
  `
  const { rows: rewriteRows } = await sql`
    SELECT COUNT(*) as count FROM usage WHERE user_id = ${user.user_id} AND type = 'rewrite' AND created_at > NOW() - INTERVAL '1 day'
  `
  const { rows: voiceRows } = await sql`
    SELECT COUNT(*) as count FROM usage WHERE user_id = ${user.user_id} AND type = 'voice' AND created_at > NOW() - INTERVAL '30 days'
  `

  return NextResponse.json({
    plan: user.plan,
    grammar: { used: grammarRows[0]?.count || 0, limit: plan.grammar_per_day },
    rewrite: { used: rewriteRows[0]?.count || 0, limit: plan.rewrite_per_day },
    voice: { used: voiceRows[0]?.count || 0, limit: plan.voice_minutes_per_month },
  })
}
