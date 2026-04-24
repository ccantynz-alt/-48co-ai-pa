import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { streamChat, extractAndUpdateMemory } from '@/lib/context';
import { selectModel, ModelId } from '@/lib/models';
import { getFileContent } from '@/lib/github';
import { v4 as uuidv4 } from 'uuid';

type Row = Record<string, unknown>;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { id: conversationId } = await params;
  const { message, modelPreference, repoFile } = await request.json();

  if (!message?.trim()) return new Response(JSON.stringify({ error: 'Message required' }), { status: 400 });

  const db = getSql();

  // Verify access
  const convRows = await db`
    SELECT c.*, p.user_id, p.id as project_id
    FROM conversations c JOIN projects p ON p.id = c.project_id
    WHERE c.id = ${conversationId}
  ` as unknown as Row[];
  const conv = convRows[0];
  if (!conv || conv.user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }

  const projectId = conv.project_id as string;
  const modelId = selectModel(message, modelPreference as ModelId | undefined);

  // Build repo context if a file was requested
  let repoContext: string | undefined;
  if (repoFile) {
    try {
      const userRows = await db`SELECT github_token FROM users WHERE id = ${user.id}` as unknown as Row[];
      const token = userRows[0]?.github_token as string;
      if (token) {
        const [owner, repo, ...pathParts] = repoFile.split('/');
        const content = await getFileContent(token, owner, repo, pathParts.join('/'));
        repoContext = `## File: ${repoFile}\n\`\`\`\n${content.slice(0, 8000)}\n\`\`\``;
      }
    } catch {
      // Repo context is optional
    }
  }

  // Save user message
  await db`
    INSERT INTO messages (id, conversation_id, role, content)
    VALUES (${uuidv4()}, ${conversationId}, 'user', ${message})
  `;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = '';

      try {
        fullResponse = await streamChat(
          projectId,
          conversationId,
          message,
          modelId,
          repoContext,
          (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk, model: modelId })}\n\n`));
          }
        );

        // Save assistant message
        await db`
          INSERT INTO messages (id, conversation_id, role, content, model)
          VALUES (${uuidv4()}, ${conversationId}, 'assistant', ${fullResponse}, ${modelId})
        `;

        // Update conversation
        await db`
          UPDATE conversations SET
            message_count = message_count + 2,
            updated_at = NOW()
          WHERE id = ${conversationId}
        `;

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, model: modelId })}\n\n`));

        // Extract memory in background — don't block the response
        extractAndUpdateMemory(projectId, conversationId, message, fullResponse).catch(() => {});

      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: conversationId } = await params;
  const db = getSql();

  const messages = await db`
    SELECT m.* FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    JOIN projects p ON p.id = c.project_id
    WHERE m.conversation_id = ${conversationId} AND p.user_id = ${user.id}
    ORDER BY m.created_at ASC
  ` as unknown as Row[];

  return NextResponse.json({ messages });
}
