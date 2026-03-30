export const dynamic = "force-dynamic"
/**
 * POST /api/admin/promote
 *
 * Promotes a user account to a specified plan (pro, business, enterprise).
 * Protected by ADMIN_SECRET environment variable.
 *
 * Body: { email: "you@example.com", plan: "pro" }
 * Header: Authorization: Bearer <ADMIN_SECRET>
 *
 * Use this to give yourself full access without Stripe.
 */
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '../../../../lib/db'

export async function POST(request) {
  try {
    const adminSecret = process.env.ADMIN_SECRET
    if (!adminSecret) {
      return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (token !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 403 })
    }

    await initDb()
    const { email, plan } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const validPlans = ['free', 'pro', 'business', 'enterprise']
    const targetPlan = validPlans.includes(plan) ? plan : 'pro'

    const { rows } = await sql`
      UPDATE users SET plan = ${targetPlan}
      WHERE email = ${email.toLowerCase()}
      RETURNING id, email, plan
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No account found with that email. Sign up first.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `${email} upgraded to ${targetPlan}`,
      user: rows[0],
    })
  } catch (err) {
    console.error('Admin promote error:', err)
    return NextResponse.json({ error: 'Failed to promote user' }, { status: 500 })
  }
}
