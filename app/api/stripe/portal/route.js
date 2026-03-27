/**
 * POST /api/stripe/portal
 *
 * Opens Stripe's Customer Portal so users can:
 * - Update their credit card
 * - Switch plans (Pro <-> Business)
 * - Cancel their subscription
 * - View invoices/receipts
 *
 * User must be logged in and have an active Stripe customer.
 * Returns: { url: "https://billing.stripe.com/..." }
 */
import { NextResponse } from 'next/server'
import { stripe, APP_URL } from '../../../../lib/stripe'
import { authenticate, initDb } from '../../../../lib/db'

export async function POST(request) {
  try {
    await initDb()
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in first' }, { status: 401 })
    }

    if (!user.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found. Choose a plan first.' }, { status: 400 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${APP_URL}/pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Portal error:', err)
    return NextResponse.json({ error: 'Could not open billing portal. Try again.' }, { status: 500 })
  }
}
