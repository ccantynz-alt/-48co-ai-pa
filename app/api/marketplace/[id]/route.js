export const dynamic = 'force-dynamic'

/**
 * GET /api/marketplace/:id
 *
 * Get a single marketplace listing with full site preview.
 */
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '../../../../lib/db'

export async function GET(request, { params }) {
  try {
    await initDb()

    const { id } = await params

    const { rows } = await sql`
      SELECT l.*, d.domain, gs.template, gs.content, gs.preview_html, gs.pages, gs.seo_data
      FROM listings l
      JOIN generated_sites gs ON l.site_id = gs.id
      JOIN domains d ON gs.domain_id = d.id
      WHERE l.id = ${id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const r = rows[0]

    // Increment view count
    await sql`UPDATE listings SET views = views + 1 WHERE id = ${id}`

    return NextResponse.json({
      id: r.id,
      siteId: r.site_id,
      domain: r.domain,
      title: r.title,
      description: r.description,
      price: r.price,
      monthlyPrice: r.monthly_price,
      industry: r.industry,
      location: r.location,
      country: r.country,
      featured: r.featured,
      views: r.views + 1,
      template: r.template,
      content: r.content,
      previewHtml: r.preview_html,
      pages: r.pages,
      seoData: r.seo_data,
      createdAt: r.created_at,
      status: r.status,
    })
  } catch (err) {
    console.error('Listing detail error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
