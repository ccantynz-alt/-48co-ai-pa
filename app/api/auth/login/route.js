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

    const { rows } = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`
    if (rows.length === 0) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const token = nanoid(32)
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    await sql`INSERT INTO sessions (token, user_id, expires_at) VALUES (${token}, ${user.id}, ${expires})`

    return NextResponse.json({ token, plan: user.plan, email: user.email })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Login failed. Try again.' }, { status: 500 })
  }
}
