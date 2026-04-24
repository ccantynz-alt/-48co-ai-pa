import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getSql();
  const quotes = await db`
    SELECT q.*, c.name as customer_name
    FROM quotes q
    LEFT JOIN customers c ON q.customer_id = c.id
    WHERE q.user_id = ${user.id}
    ORDER BY q.created_at DESC
    LIMIT 50
  `;

  return NextResponse.json({ quotes });
}

export async function PATCH(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status } = await request.json();
  const db = getSql();

  const rows = await db`
    UPDATE quotes SET status = ${status}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${user.id}
    RETURNING *
  ` as unknown as Record<string, unknown>[];

  const quote = rows[0];
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

  return NextResponse.json({ quote });
}
