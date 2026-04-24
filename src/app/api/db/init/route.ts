import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    return NextResponse.json({ ok: true, message: 'Database initialized successfully' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Database initialization failed', detail: String(err) },
      { status: 500 }
    );
  }
}
