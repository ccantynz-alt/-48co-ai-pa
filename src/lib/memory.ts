import { getSql } from './db';

export interface MemoryEntry {
  key: string;
  value: string;
  category: 'architecture' | 'decision' | 'progress' | 'context' | 'general';
}

export async function getProjectMemory(projectId: string): Promise<MemoryEntry[]> {
  const db = getSql();
  const rows = await db`
    SELECT key, value, category FROM project_memory
    WHERE project_id = ${projectId}
    ORDER BY updated_at DESC
  ` as unknown as MemoryEntry[];
  return rows;
}

export async function upsertMemory(projectId: string, entries: MemoryEntry[]) {
  const db = getSql();
  for (const entry of entries) {
    await db`
      INSERT INTO project_memory (project_id, key, value, category)
      VALUES (${projectId}, ${entry.key}, ${entry.value}, ${entry.category})
      ON CONFLICT (project_id, key)
      DO UPDATE SET value = EXCLUDED.value, category = EXCLUDED.category, updated_at = NOW()
    `;
  }
}

export async function deleteMemoryKey(projectId: string, key: string) {
  const db = getSql();
  await db`DELETE FROM project_memory WHERE project_id = ${projectId} AND key = ${key}`;
}

export function formatMemoryForPrompt(memory: MemoryEntry[]): string {
  if (memory.length === 0) return '';

  const grouped: Record<string, MemoryEntry[]> = {};
  for (const m of memory) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }

  const sections: string[] = [];

  if (grouped.architecture?.length) {
    sections.push('## Architecture\n' + grouped.architecture.map((m) => `- ${m.key}: ${m.value}`).join('\n'));
  }
  if (grouped.decision?.length) {
    sections.push('## Decisions Made\n' + grouped.decision.map((m) => `- ${m.key}: ${m.value}`).join('\n'));
  }
  if (grouped.progress?.length) {
    sections.push('## Current Progress\n' + grouped.progress.map((m) => `- ${m.key}: ${m.value}`).join('\n'));
  }
  if (grouped.context?.length) {
    sections.push('## Important Context\n' + grouped.context.map((m) => `- ${m.key}: ${m.value}`).join('\n'));
  }
  if (grouped.general?.length) {
    sections.push('## Notes\n' + grouped.general.map((m) => `- ${m.key}: ${m.value}`).join('\n'));
  }

  return sections.join('\n\n');
}
