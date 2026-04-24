import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

type Row = Record<string, unknown>;

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projectId = new URL(request.url).searchParams.get('projectId');
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 });

  const db = getSql();
  const conversations = await db`
    SELECT c.* FROM conversations c
    JOIN projects p ON p.id = c.project_id
    WHERE c.project_id = ${projectId} AND p.user_id = ${user.id}
    ORDER BY c.updated_at DESC
    LIMIT 30
  ` as unknown as Row[];

  return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId, title } = await request.json();
  const db = getSql();

  const projects = await db`SELECT id FROM projects WHERE id = ${projectId} AND user_id = ${user.id}` as unknown as Row[];
  if (!projects[0]) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const rows = await db`
    INSERT INTO conversations (id, project_id, title)
    VALUES (${uuidv4()}, ${projectId}, ${title || 'New conversation'})
    RETURNING *
  ` as unknown as Row[];

  return NextResponse.json({ conversation: rows[0] }, { status: 201 });
}
