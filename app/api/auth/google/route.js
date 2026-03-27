export const dynamic = "force-dynamic"
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { initDb } from '../../../../lib/db'

export async function POST(request) {
  try {
    await initDb()
    const { credential } = await request.json()
    if (!credential) return NextResponse.json({ error: 'No Google credential' }, { status: 400 })

    const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    if (!verifyResponse.ok) return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 })

    const googleUser = await verifyResponse.json()
    const googleClientId = process.env.GOOGLE_CLIENT_ID
    if (googleClientId && googleUser.aud !== googleClientId) {
      return NextResponse.json({ error: 'Google token not issued for this app' }, { status: 401 })
    }

    const email = googleUser.email?.toLowerCase()
    if (!email) return NextResponse.json({ error: 'No email in Google account' }, { status: 400 })

    const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`
    let user = rows[0]

    if (!user) {
      const id = nanoid()
      const hash = await bcrypt.hash(nanoid(32), 10)
      await sql`INSERT INTO users (id, email, password_hash) VALUES (${id}, ${email}, ${hash})`
      user = { id, email, plan: 'free' }
    }

    const token = nanoid(32)
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await sql`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${user.id}, ${expires})`

    return NextResponse.json({ token, plan: user.plan || 'free', email: user.email, name: googleUser.name || '' })
  } catch (err) {
    console.error('Google auth error:', err)
    return NextResponse.json({ error: 'Google sign-in failed' }, { status: 500 })
  }
}
