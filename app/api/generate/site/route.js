export const dynamic = 'force-dynamic'

/**
 * POST /api/generate/site
 *
 * Full pipeline: Takes a domain ID, generates AI content, builds the site,
 * and creates a marketplace listing.
 *
 * Body: { domainId: "abc123" } or { domain: "aucklandplumber.co.nz", industry: "plumber", location: "auckland", country: "nz" }
 * Auth: Requires admin (checked via ADMIN_SECRET header)
 */
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { sql, initDb } from '../../../../lib/db'
import { generateSiteContent } from '../../../../lib/site-generator'
import { generateTradesSite } from '../../../../lib/templates/trades'
import { generateHospitalitySite } from '../../../../lib/templates/hospitality'
import { generateHealthSite } from '../../../../lib/templates/health'
import { generateRealEstateSite } from '../../../../lib/templates/realestate'
import { generateLegalSite } from '../../../../lib/templates/legal'
import { generateTourismSite } from '../../../../lib/templates/tourism'
import { generateMiningSite } from '../../../../lib/templates/mining'
import { INDUSTRIES } from '../../../../lib/domains'

// Map industries to their template generator
const TEMPLATE_MAP = {
  // Trades — bold, emergency-ready
  plumber: generateTradesSite,
  electrician: generateTradesSite,
  builder: generateTradesSite,
  painter: generateTradesSite,
  landscaper: generateTradesSite,
  roofing: generateTradesSite,
  hvac: generateTradesSite,
  cleaner: generateTradesSite,
  mechanic: generateTradesSite,
  // Health — calming, patient-focused
  dentist: generateHealthSite,
  physio: generateHealthSite,
  vet: generateHealthSite,
  gym: generateHealthSite,
  // Legal/Professional — authoritative, premium
  lawyer: generateLegalSite,
  accountant: generateLegalSite,
  // Real Estate — aspirational, property-focused
  realestate: generateRealEstateSite,
  // Hospitality — warm, menu/booking focused
  restaurant: generateHospitalitySite,
  hotel: generateHospitalitySite,
  // Tourism — vibrant, experiential
  tourism: generateTourismSite,
  // Mining — industrial, capability focused
  mining: generateMiningSite,
}

export async function POST(request) {
  try {
    const adminSecret = request.headers.get('x-admin-secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await initDb()

    const body = await request.json()
    let domain, industry, location, country, domainId

    if (body.domainId) {
      // Look up domain from database
      const { rows } = await sql`SELECT * FROM domains WHERE id = ${body.domainId}`
      if (rows.length === 0) {
        return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
      }
      const d = rows[0]
      domainId = d.id
      domain = d.domain
      industry = d.industry
      location = d.location
      country = d.country
    } else {
      domain = body.domain
      industry = body.industry
      location = body.location
      country = body.country

      if (!domain || !industry || !location || !country) {
        return NextResponse.json({ error: 'domain, industry, location, and country required' }, { status: 400 })
      }

      // Create domain record if it doesn't exist
      domainId = nanoid()
      const tld = domain.includes('.co.nz') ? 'co.nz'
        : domain.includes('.com.au') ? 'com.au'
        : domain.split('.').slice(1).join('.')
      await sql`
        INSERT INTO domains (id, domain, tld, status, industry, location, country, checked_at)
        VALUES (${domainId}, ${domain}, ${tld}, 'available', ${industry}, ${location}, ${country}, NOW())
        ON CONFLICT (domain) DO UPDATE SET checked_at = NOW()
        RETURNING id
      `.then(r => { if (r.rows[0]) domainId = r.rows[0].id })
    }

    // Step 1: Generate AI content
    const content = await generateSiteContent({ domain, industry, location, country })

    // Step 2: Build static site using appropriate template
    const templateFn = TEMPLATE_MAP[industry] || generateTradesSite
    const sitePages = templateFn(content)

    // Step 3: Store generated site
    const siteId = nanoid()
    await sql`
      INSERT INTO generated_sites (id, domain_id, template, content, pages, seo_data, preview_html, status)
      VALUES (
        ${siteId},
        ${domainId},
        ${industry},
        ${JSON.stringify(content)},
        ${JSON.stringify(Object.keys(sitePages))},
        ${JSON.stringify(content.seo || {})},
        ${sitePages['index.html'] || ''},
        'generated'
      )
    `

    // Step 4: Create marketplace listing
    const listingId = nanoid()
    const industryData = INDUSTRIES[industry] || { label: industry, basePrice: 99900 }
    const cityName = location.charAt(0).toUpperCase() + location.slice(1).replace(/-/g, ' ')
    const countryName = country === 'nz' ? 'New Zealand' : 'Australia'

    await sql`
      INSERT INTO listings (id, site_id, title, description, price, monthly_price, industry, location, country, status)
      VALUES (
        ${listingId},
        ${siteId},
        ${`${content.businessName || domain} — ${industryData.label} Website`},
        ${`Professional ${industryData.label.toLowerCase()} website for ${cityName}, ${countryName}. AI-generated, SEO-optimised, ready to launch. Includes ${Object.keys(sitePages).length} pages: homepage, about, services, and contact.`},
        ${industryData.basePrice},
        ${2900},
        ${industry},
        ${location},
        ${country},
        'active'
      )
    `

    // Update domain status
    await sql`UPDATE domains SET status = 'listed' WHERE id = ${domainId}`

    return NextResponse.json({
      success: true,
      siteId,
      listingId,
      domainId,
      domain,
      businessName: content.businessName,
      pages: Object.keys(sitePages),
      price: industryData.basePrice,
    })
  } catch (err) {
    console.error('Site generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
