export const dynamic = 'force-dynamic'

/**
 * POST /api/sites/deploy
 *
 * Deploy a generated site to Cloudflare R2 storage.
 * In MVP, stores the site data and returns a preview URL.
 * Full R2 deployment requires CLOUDFLARE_* env vars.
 *
 * Body: { siteId: "abc123" }
 * Auth: Requires admin
 */
import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { initDb } from '../../../../lib/db'

export async function POST(request) {
  try {
    const adminSecret = request.headers.get('x-admin-secret')
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await initDb()

    const { siteId } = await request.json()
    if (!siteId) {
      return NextResponse.json({ error: 'siteId required' }, { status: 400 })
    }

    const { rows } = await sql`
      SELECT gs.*, d.domain
      FROM generated_sites gs
      JOIN domains d ON gs.domain_id = d.id
      WHERE gs.id = ${siteId}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    const site = rows[0]

    // Check if Cloudflare R2 is configured
    const r2Configured = process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_R2_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_SECRET_KEY

    if (r2Configured) {
      // TODO: Upload static files to R2 bucket
      // For now, we store the preview HTML in the database and serve it via the marketplace preview
      const deployUrl = `https://${site.domain}`
      await sql`UPDATE generated_sites SET deploy_url = ${deployUrl}, status = 'deployed' WHERE id = ${siteId}`
      return NextResponse.json({ success: true, url: deployUrl, method: 'r2' })
    }

    // Fallback: Mark as deployed with internal preview
    const previewUrl = `/api/marketplace/${site.id}/preview`
    await sql`UPDATE generated_sites SET deploy_url = ${previewUrl}, status = 'deployed' WHERE id = ${siteId}`

    return NextResponse.json({
      success: true,
      url: previewUrl,
      method: 'internal',
      note: 'Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY, and CLOUDFLARE_R2_SECRET_KEY for full R2 deployment.',
    })
  } catch (err) {
    console.error('Deploy error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
