import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { getUserRepos } from '@/lib/github';
import { v4 as uuidv4 } from 'uuid';

type Row = Record<string, unknown>;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const db = getSql();

  const repos = await db`
    SELECT * FROM project_repos WHERE project_id = ${id}
    ORDER BY created_at DESC
  ` as unknown as Row[];

  // If user has a GitHub token, also return their available repos
  const userRows = await db`SELECT github_token FROM users WHERE id = ${user.id}` as unknown as Row[];
  const token = userRows[0]?.github_token as string | undefined;

  let availableRepos: Row[] = [];
  if (token) {
    try {
      availableRepos = await getUserRepos(token) as unknown as Row[];
    } catch {
      // Token invalid or no access
    }
  }

  return NextResponse.json({ repos, availableRepos, hasToken: !!token });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { owner, name, defaultBranch } = await request.json();

  const db = getSql();

  // Verify project belongs to user
  const projects = await db`SELECT id FROM projects WHERE id = ${id} AND user_id = ${user.id}` as unknown as Row[];
  if (!projects[0]) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const rows = await db`
    INSERT INTO project_repos (id, project_id, owner, name, full_name, default_branch)
    VALUES (${uuidv4()}, ${id}, ${owner}, ${name}, ${`${owner}/${name}`}, ${defaultBranch || 'main'})
    ON CONFLICT DO NOTHING
    RETURNING *
  ` as unknown as Row[];

  return NextResponse.json({ repo: rows[0] }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { repoId } = await request.json();
  const db = getSql();

  await db`
    DELETE FROM project_repos
    WHERE id = ${repoId}
    AND project_id IN (SELECT id FROM projects WHERE id = ${id} AND user_id = ${user.id})
  `;

  return NextResponse.json({ ok: true });
}
