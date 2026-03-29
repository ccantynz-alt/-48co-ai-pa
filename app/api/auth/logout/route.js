export const dynamic = "force-dynamic"
import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { initDb } from '../../../../lib/db'

export async function POST(request) {
  try {
    await initDb()
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No session token provided' }, { status: 400 })
    }

    await sql`DELETE FROM sessions WHERE token = ${token}`

    return NextResponse.json({ success: true, message: 'Signed out successfully' })
  } catch (err) {
    console.error('Logout error:', err)
    return NextResponse.json({ error: 'Sign out failed. Please try again.' }, { status: 500 })
  }
}
