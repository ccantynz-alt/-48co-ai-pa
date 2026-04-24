import Anthropic from '@anthropic-ai/sdk';
import { getProjectMemory, formatMemoryForPrompt } from './memory';
import { getSql } from './db';
import { ModelId, MODELS } from './models';

let _client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type Row = Record<string, unknown>;

export async function buildSystemPrompt(projectId: string, repoContext?: string): Promise<string> {
  const memory = await getProjectMemory(projectId);
  const memoryText = formatMemoryForPrompt(memory);

  const db = getSql();
  const projects = await db`SELECT name, description FROM projects WHERE id = ${projectId}` as unknown as Row[];
  const project = projects[0];

  let system = `You are Cortex, an expert AI coding assistant with persistent memory across sessions.

## Project: ${project?.name || 'Unknown'}
${project?.description ? `Description: ${project.description}` : ''}

You have full memory of this project from previous sessions. You never start from scratch. You always know what was decided, what was built, and what the current state is.

## Rules
- Never undo work that has already been completed unless explicitly asked
- Always check what exists before creating new files
- Be precise and targeted — surgical edits, not rewrites
- When unsure about the current state, ask rather than assume
- Keep responses concise but complete`;

  if (memoryText) {
    system += `\n\n## What I Know About This Project\n${memoryText}`;
  }

  if (repoContext) {
    system += `\n\n## Repository Context\n${repoContext}`;
  }

  return system;
}

export async function getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
  const db = getSql();
  const rows = await db`
    SELECT role, content FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
    LIMIT 40
  ` as unknown as ChatMessage[];
  return rows;
}

export async function streamChat(
  projectId: string,
  conversationId: string,
  userMessage: string,
  modelId: ModelId,
  repoContext: string | undefined,
  onChunk: (text: string) => void
): Promise<string> {
  const client = getClient();
  const model = MODELS[modelId];

  const [systemPrompt, history] = await Promise.all([
    buildSystemPrompt(projectId, repoContext),
    getConversationHistory(conversationId),
  ]);

  const messages: ChatMessage[] = [...history, { role: 'user', content: userMessage }];

  const stream = client.messages.stream({
    model: model.id,
    max_tokens: model.maxTokens,
    system: systemPrompt,
    messages,
  });

  let fullResponse = '';

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullResponse += chunk.delta.text;
      onChunk(chunk.delta.text);
    }
  }

  return fullResponse;
}

export async function extractAndUpdateMemory(
  projectId: string,
  conversationId: string,
  userMessage: string,
  assistantResponse: string
) {
  const client = getClient();

  const extractionPrompt = `Analyze this conversation exchange and extract any important facts that should be remembered for future sessions.

User said: ${userMessage}

Assistant responded: ${assistantResponse.slice(0, 2000)}

Extract facts in this JSON format (return empty array if nothing important):
[
  { "key": "short-key-name", "value": "what to remember", "category": "architecture|decision|progress|context|general" }
]

Only extract genuinely important facts: architectural decisions, completed work, technical choices, current state of features.
Do NOT extract trivial chat.`;

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: extractionPrompt }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return;

    const entries = JSON.parse(jsonMatch[0]);
    if (entries.length > 0) {
      const { upsertMemory } = await import('./memory');
      await upsertMemory(projectId, entries);
    }
  } catch {
    // Memory extraction is best-effort, never block the main flow
  }
}
