export const dynamic = 'force-dynamic'

/**
 * GET /api/marketplace
 *
 * List marketplace listings with filters.
 * Query params: industry, country, sort (price_asc, price_desc, newest), search, page, limit
 */
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '../../../lib/db'

export async function GET(request) {
  try {
    await initDb()

    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    const country = searchParams.get('country')
    const sort = searchParams.get('sort') || 'newest'
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = (page - 1) * limit

    // Build query with filters
    let query = `
      SELECT l.*, d.domain, gs.template, gs.preview_html IS NOT NULL as has_preview
      FROM listings l
      JOIN generated_sites gs ON l.site_id = gs.id
      JOIN domains d ON gs.domain_id = d.id
      WHERE l.status = 'active'
    `
    const params = []
    let paramIdx = 1

    if (industry) {
      query += ` AND l.industry = $${paramIdx++}`
      params.push(industry)
    }
    if (country) {
      query += ` AND l.country = $${paramIdx++}`
      params.push(country)
    }
    if (search) {
      query += ` AND (l.title ILIKE $${paramIdx} OR d.domain ILIKE $${paramIdx} OR l.description ILIKE $${paramIdx})`
      params.push(`%${search}%`)
      paramIdx++
    }

    // Sort
    if (sort === 'price_asc') query += ' ORDER BY l.price ASC'
    else if (sort === 'price_desc') query += ' ORDER BY l.price DESC'
    else if (sort === 'popular') query += ' ORDER BY l.views DESC'
    else query += ' ORDER BY l.created_at DESC'

    query += ` LIMIT $${paramIdx++} OFFSET $${paramIdx++}`
    params.push(limit, offset)

    // Count total
    let countQuery = `
      SELECT COUNT(*) as total FROM listings l
      JOIN generated_sites gs ON l.site_id = gs.id
      JOIN domains d ON gs.domain_id = d.id
      WHERE l.status = 'active'
    `
    const countParams = []
    let countIdx = 1
    if (industry) { countQuery += ` AND l.industry = $${countIdx++}`; countParams.push(industry) }
    if (country) { countQuery += ` AND l.country = $${countIdx++}`; countParams.push(country) }
    if (search) { countQuery += ` AND (l.title ILIKE $${countIdx} OR d.domain ILIKE $${countIdx} OR l.description ILIKE $${countIdx})`; countParams.push(`%${search}%`); countIdx++ }

    // Use raw query via sql.query
    const { rows } = await sql.query(query, params)
    const countResult = await sql.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0]?.total || '0')

    // Format results — strip preview_html to keep response size small
    const listings = rows.map(r => ({
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
      views: r.views,
      hasPreview: r.has_preview,
      createdAt: r.created_at,
    }))

    return NextResponse.json({
      listings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Marketplace list error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
