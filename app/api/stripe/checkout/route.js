/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout session for upgrading to Pro or Business.
 * User must be logged in. Sends them to Stripe's hosted payment page.
 *
 * Body: { plan: "pro" | "pro_annual" | "business" }
 * Returns: { url: "https://checkout.stripe.com/..." }
 */
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { stripe, PRICE_IDS, APP_URL } from '../../../../lib/stripe'
import { authenticate, initDb } from '../../../../lib/db'

export async function POST(request) {
  try {
    await initDb()
    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in first' }, { status: 401 })
    }

    const { plan } = await request.json()
    const priceId = PRICE_IDS[plan === 'pro' ? 'pro_monthly' : plan === 'pro_annual' ? 'pro_annual' : 'business_monthly']

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan. Choose pro, pro_annual, or business.' }, { status: 400 })
    }

    // Reuse existing Stripe customer if they've paid before
    let customerId = user.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.user_id },
      })
      customerId = customer.id
      await sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${user.user_id}`
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/pricing?success=true`,
      cancel_url: `${APP_URL}/pricing?canceled=true`,
      subscription_data: {
        trial_period_days: 7,
        metadata: { user_id: user.user_id },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Could not create checkout session. Try again.' }, { status: 500 })
  }
}
