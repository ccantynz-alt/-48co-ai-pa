import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

type Row = Record<string, unknown>;

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getSql();
  const projects = await db`
    SELECT p.*,
      (SELECT COUNT(*) FROM conversations c WHERE c.project_id = p.id) as conversation_count,
      (SELECT COUNT(*) FROM project_repos r WHERE r.project_id = p.id) as repo_count,
      (SELECT COUNT(*) FROM project_memory m WHERE m.project_id = p.id) as memory_count,
      (SELECT MAX(c.updated_at) FROM conversations c WHERE c.project_id = p.id) as last_active
    FROM projects p
    WHERE p.user_id = ${user.id}
    ORDER BY p.updated_at DESC
  ` as unknown as Row[];

  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description, color } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const db = getSql();
  const rows = await db`
    INSERT INTO projects (id, user_id, name, description, color)
    VALUES (${uuidv4()}, ${user.id}, ${name}, ${description || null}, ${color || '#f97316'})
    RETURNING *
  ` as unknown as Row[];

  return NextResponse.json({ project: rows[0] }, { status: 201 });
}
