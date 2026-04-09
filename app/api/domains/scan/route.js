export const dynamic = 'force-dynamic'

/**
 * POST /api/domains/scan
 *
 * Scans for available domains in a given industry + location.
 * Generates domain name candidates, checks availability via GoDaddy API,
 * and stores results in the database.
 *
 * Body: { industry: "plumber", location: "auckland", country: "nz" }
 * Auth: Requires admin (checked via ADMIN_SECRET header)
 */
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { sql, initDb } from '../../../../lib/db'
import { checkDomainsInBatch, generateDomainCandidates, estimateDomainValue, INDUSTRIES } from '../../../../lib/domains'
import { scoreDomainOpportunity } from '../../../../lib/site-generator'

export async function POST(request) {
  try {
    // Admin auth check
    const adminSecret = request.headers.get('x-admin-secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await initDb()

    const { industry, location, country } = await request.json()

    if (!industry || !location || !country) {
      return NextResponse.json({ error: 'industry, location, and country are required' }, { status: 400 })
    }

    if (!INDUSTRIES[industry]) {
      return NextResponse.json({ error: `Unknown industry: ${industry}. Valid: ${Object.keys(INDUSTRIES).join(', ')}` }, { status: 400 })
    }

    if (!['nz', 'au'].includes(country)) {
      return NextResponse.json({ error: 'country must be "nz" or "au"' }, { status: 400 })
    }

    // Generate domain candidates
    const candidates = generateDomainCandidates(industry, location, country)

    // Check availability in batch
    const results = await checkDomainsInBatch(candidates)
    const available = results.filter(r => r.available && !r.error)

    // Store available domains
    const stored = []
    for (const domain of available) {
      const id = nanoid()
      const tld = domain.domain.includes('.co.nz') ? 'co.nz'
        : domain.domain.includes('.com.au') ? 'com.au'
        : domain.domain.includes('.net.au') ? 'net.au'
        : domain.domain.split('.').slice(1).join('.')

      const estimatedValue = estimateDomainValue(domain.domain, industry, location)

      try {
        await sql`
          INSERT INTO domains (id, domain, tld, status, industry, location, country, estimated_value, registration_cost, checked_at)
          VALUES (${id}, ${domain.domain}, ${tld}, 'available', ${industry}, ${location}, ${country}, ${estimatedValue}, ${domain.price || 0}, NOW())
          ON CONFLICT (domain) DO UPDATE SET
            status = 'available',
            checked_at = NOW(),
            estimated_value = ${estimatedValue}
        `
        stored.push({ id, domain: domain.domain, estimatedValue, registrationCost: domain.price })
      } catch (err) {
        console.error(`Failed to store domain ${domain.domain}:`, err.message)
      }
    }

    return NextResponse.json({
      scanned: candidates.length,
      available: available.length,
      stored: stored.length,
      domains: stored,
    })
  } catch (err) {
    console.error('Domain scan error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
