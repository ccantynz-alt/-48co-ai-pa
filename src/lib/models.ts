export const MODELS = {
  'claude-haiku-4-5': {
    id: 'claude-haiku-4-5',
    label: 'Haiku',
    description: 'Fast. Best for simple edits, quick questions, formatting.',
    maxTokens: 4096,
    costTier: 1,
  },
  'claude-sonnet-4-6': {
    id: 'claude-sonnet-4-6',
    label: 'Sonnet',
    description: 'Reliable. Best for coding, debugging, building features.',
    maxTokens: 8192,
    costTier: 2,
  },
  'claude-opus-4-7': {
    id: 'claude-opus-4-7',
    label: 'Opus',
    description: 'Powerful. Best for architecture, complex reasoning, hard problems.',
    maxTokens: 8192,
    costTier: 3,
  },
} as const;

export type ModelId = keyof typeof MODELS;

const SIMPLE_PATTERNS = [
  /^(what|who|when|where|how|why)\s/i,
  /^(explain|describe|summarise|summarize|list)\s/i,
  /^(fix the typo|rename|format|add a comment)/i,
  /\?([\s]*)$/,
];

const COMPLEX_PATTERNS = [
  /architect|design|refactor the (whole|entire|full)/i,
  /from scratch|rewrite everything/i,
  /performance|scalability|security audit/i,
];

export function selectModel(prompt: string, userPreference?: ModelId): ModelId {
  if (userPreference) return userPreference;

  if (COMPLEX_PATTERNS.some((p) => p.test(prompt))) return 'claude-opus-4-7';
  if (SIMPLE_PATTERNS.some((p) => p.test(prompt))) return 'claude-haiku-4-5';

  // Default to the reliable workhorse
  return 'claude-sonnet-4-6';
}
