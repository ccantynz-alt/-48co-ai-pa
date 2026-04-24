import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { getProjectMemory, upsertMemory, deleteMemoryKey } from '@/lib/memory';

type Row = Record<string, unknown>;

async function verifyProjectAccess(projectId: string, userId: string) {
  const db = getSql();
  const rows = await db`SELECT id FROM projects WHERE id = ${projectId} AND user_id = ${userId}` as unknown as Row[];
  return !!rows[0];
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!await verifyProjectAccess(id, user.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const memory = await getProjectMemory(id);
  return NextResponse.json({ memory });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!await verifyProjectAccess(id, user.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { entries } = await request.json();
  await upsertMemory(id, entries);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (!await verifyProjectAccess(id, user.id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { key } = await request.json();
  await deleteMemoryKey(id, key);
  return NextResponse.json({ ok: true });
}
