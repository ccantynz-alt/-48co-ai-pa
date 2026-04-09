export const dynamic = 'force-dynamic'

/**
 * POST /api/marketplace/purchase
 *
 * Create a Stripe checkout session for purchasing a website listing.
 * Combines one-time payment (website) + subscription (hosting).
 *
 * Body: { listingId: "abc123" }
 * Auth: Requires logged-in user
 */
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { sql, authenticate, initDb } from '../../../../lib/db'
import { getStripe, APP_URL } from '../../../../lib/stripe'

export async function POST(request) {
  try {
    await initDb()

    const user = await authenticate(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to purchase' }, { status: 401 })
    }

    const { listingId } = await request.json()
    if (!listingId) {
      return NextResponse.json({ error: 'listingId required' }, { status: 400 })
    }

    // Get the listing
    const { rows } = await sql`
      SELECT l.*, d.domain, gs.content
      FROM listings l
      JOIN generated_sites gs ON l.site_id = gs.id
      JOIN domains d ON gs.domain_id = d.id
      WHERE l.id = ${listingId} AND l.status = 'active'
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found or already sold' }, { status: 404 })
    }

    const listing = rows[0]
    const stripe = getStripe()

    // Create a purchase record
    const purchaseId = nanoid()
    await sql`
      INSERT INTO purchases (id, listing_id, buyer_id, status)
      VALUES (${purchaseId}, ${listingId}, ${user.user_id}, 'pending')
    `

    // Create Stripe checkout session with one-time payment
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: `Website: ${listing.domain}`,
              description: listing.title,
            },
            unit_amount: listing.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        purchase_id: purchaseId,
        listing_id: listingId,
        buyer_id: user.user_id,
        domain: listing.domain,
        type: 'marketplace_purchase',
      },
      success_url: `${APP_URL}/marketplace/dashboard?purchased=${purchaseId}`,
      cancel_url: `${APP_URL}/marketplace/${listingId}`,
    })

    return NextResponse.json({
      checkoutUrl: session.url,
      purchaseId,
    })
  } catch (err) {
    console.error('Purchase error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
