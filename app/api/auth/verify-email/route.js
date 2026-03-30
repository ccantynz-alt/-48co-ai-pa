export const dynamic = "force-dynamic"
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { initDb } from '../../../../lib/db'

/**
 * POST /api/auth/verify-email — send a verification code to the user's email
 * GET  /api/auth/verify-email?token=xxx — verify the code
 *
 * For now, generates a code and stores it. Email delivery requires
 * a transactional email provider (Resend, Postmark, etc.) to be
 * configured via SMTP_* or RESEND_API_KEY env vars.
 */

export async function POST(request) {
  try {
    await initDb()

    // Ensure verification_tokens table exists
    await sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL
      )
    `

    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '')
    if (!sessionToken) return NextResponse.json({ error: 'Please sign in first' }, { status: 401 })

    const { rows: sessions } = await sql`
      SELECT s.user_id, u.email FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ${sessionToken} AND s.expires_at > NOW()
    `
    if (sessions.length === 0) return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })

    const user = sessions[0]

    // Check if already verified
    const { rows: userData } = await sql`SELECT email_verified FROM users WHERE id = ${user.user_id}`
    if (userData[0]?.email_verified) {
      return NextResponse.json({ message: 'Email already verified', verified: true })
    }

    // Generate verification token (6-digit code for simplicity)
    const code = nanoid(6).toUpperCase()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Remove old tokens for this user
    await sql`DELETE FROM verification_tokens WHERE user_id = ${user.user_id}`
    await sql`INSERT INTO verification_tokens (token, user_id, expires_at) VALUES (${code}, ${user.user_id}, ${expires})`

    // TODO: Send email via transactional email provider
    // For now, log the code (in production, this would be emailed)
    console.log(`[48co] Verification code for ${user.email}: ${code}`)

    return NextResponse.json({
      message: 'Verification code generated. Check your email.',
      // In dev/staging, include the code for testing. Remove in production.
      ...(process.env.NODE_ENV !== 'production' ? { code } : {}),
    })
  } catch (err) {
    console.error('Verify email error:', err)
    return NextResponse.json({ error: 'Could not send verification email. Please try again.' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await initDb()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('token') || searchParams.get('code')

    if (!code) return NextResponse.json({ error: 'Verification code required' }, { status: 400 })

    const { rows } = await sql`
      SELECT * FROM verification_tokens WHERE token = ${code.toUpperCase()} AND expires_at > NOW()
    `
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    const { user_id } = rows[0]

    // Mark user as verified (add column if it doesn't exist)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`
    } catch { /* column may already exist */ }

    await sql`UPDATE users SET email_verified = TRUE WHERE id = ${user_id}`
    await sql`DELETE FROM verification_tokens WHERE user_id = ${user_id}`

    return NextResponse.json({ success: true, message: 'Email verified successfully' })
  } catch (err) {
    console.error('Verify email GET error:', err)
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}
