export const dynamic = "force-dynamic"
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { initDb } from '../../../../lib/db'

export async function POST(request) {
  try {
    await initDb()
    const { email, password } = await request.json()

    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    const { rows: existing } = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`
    if (existing.length > 0) return NextResponse.json({ error: 'Account already exists. Try logging in.' }, { status: 409 })

    const id = nanoid()
    const hash = await bcrypt.hash(password, 10)
    await sql`INSERT INTO users (id, email, password_hash) VALUES (${id}, ${email.toLowerCase()}, ${hash})`

    const token = nanoid(32)
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await sql`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${id}, ${expires})`

    return NextResponse.json({ token, plan: 'free', email: email.toLowerCase() })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Signup failed. Try again.' }, { status: 500 })
  }
}
