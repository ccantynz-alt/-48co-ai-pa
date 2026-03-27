export const dynamic = "force-dynamic"
/**
 * POST /api/stripe/webhook
 *
 * Stripe sends events here when payments happen.
 * Handles: new subscription, payment success, cancellation, payment failure.
 * Updates the user's plan in our database automatically.
 *
 * Required env: STRIPE_WEBHOOK_SECRET
 */
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { getStripe } from '../../../../lib/stripe'
import { initDb } from '../../../../lib/db'

// Stripe needs the raw body to verify the webhook signature
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    await initDb()

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not set')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    let event
    try {
      event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerId = session.customer
        await activatePlan(customerId)
        break
      }

      case 'invoice.paid': {
        // Recurring payment succeeded — keep plan active
        const invoice = event.data.object
        const customerId = invoice.customer
        await activatePlan(customerId)
        break
      }

      case 'customer.subscription.deleted': {
        // User canceled or subscription expired
        const sub = event.data.object
        const customerId = sub.customer
        await sql`UPDATE users SET plan = 'free' WHERE stripe_customer_id = ${customerId}`
        break
      }

      case 'invoice.payment_failed': {
        // Card declined — downgrade after grace period
        const invoice = event.data.object
        const customerId = invoice.customer
        // Don't downgrade immediately — Stripe retries failed payments
        // Only downgrade after subscription is actually deleted (handled above)
        console.warn(`Payment failed for customer ${customerId}. Stripe will retry.`)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function activatePlan(customerId) {
  // Get the active subscription to determine plan
  const subscriptions = await getStripe().subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  })

  if (subscriptions.data.length === 0) return

  const sub = subscriptions.data[0]
  const priceId = sub.items.data[0]?.price?.id

  // Determine plan from price ID
  let plan = 'pro' // default for any paid plan
  if (priceId === process.env.STRIPE_BIZ_PRICE_ID) {
    plan = 'business'
  }

  await sql`UPDATE users SET plan = ${plan}, stripe_customer_id = ${customerId} WHERE stripe_customer_id = ${customerId}`
}
