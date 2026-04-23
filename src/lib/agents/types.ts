// Agent role taxonomy. Every task in 48Co is routed to one of these roles,
// and each role has a configurable model (pluggable via settings).

export type AgentRole =
  | "PLANNER"
  | "ARCHITECT"
  | "BUILDER"
  | "DESIGNER"
  | "REVIEWER"
  | "BROWSER"
  | "MEMORY_CURATOR"
  | "COST_SENTINEL";

export type ModelProvider = "anthropic" | "openrouter";

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolUse {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ModelInvocation {
  role: AgentRole;
  messages: AgentMessage[];
  tools?: ToolDefinition[];
  cachedSystemPrompt?: string;
  maxTokens?: number;
  thinking?: boolean;
}

export interface ModelUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  costUsd?: number;
}

export interface ModelResponse {
  content: string;
  toolUses: ToolUse[];
  usage: ModelUsage;
  stopReason: string;
  model: string;
  provider: ModelProvider;
}

export interface RoleModelConfig {
  provider: ModelProvider;
  model: string;
}

// Opinionated defaults. User can override any of these in settings.
// Opus on the brain (planning + critique). Sonnet on the hands (building).
// Haiku on the bookkeeping (memory + cost sentinel).
export const DEFAULT_ROLE_MODELS: Record<AgentRole, RoleModelConfig> = {
  PLANNER:        { provider: "anthropic", model: "claude-opus-4-7" },
  ARCHITECT:      { provider: "anthropic", model: "claude-opus-4-7" },
  REVIEWER:       { provider: "anthropic", model: "claude-sonnet-4-6" },
  BUILDER:        { provider: "anthropic", model: "claude-sonnet-4-6" },
  DESIGNER:       { provider: "anthropic", model: "claude-sonnet-4-6" },
  BROWSER:        { provider: "anthropic", model: "claude-sonnet-4-6" },
  MEMORY_CURATOR: { provider: "anthropic", model: "claude-haiku-4-5-20251001" },
  COST_SENTINEL:  { provider: "anthropic", model: "claude-haiku-4-5-20251001" },
};

// Alternative models users can swap to via OpenRouter — shown in settings.
export const SWAP_CANDIDATES: Record<AgentRole, RoleModelConfig[]> = {
  PLANNER:        [{ provider: "openrouter", model: "openai/gpt-5" }, { provider: "openrouter", model: "google/gemini-2.5-pro" }],
  ARCHITECT:      [{ provider: "openrouter", model: "openai/gpt-5" }, { provider: "openrouter", model: "google/gemini-2.5-pro" }],
  REVIEWER:       [{ provider: "openrouter", model: "openai/gpt-5-mini" }],
  BUILDER:        [{ provider: "openrouter", model: "deepseek/deepseek-chat-v4" }, { provider: "openrouter", model: "openai/gpt-5-mini" }],
  DESIGNER:       [{ provider: "openrouter", model: "google/gemini-2.5-pro" }],
  BROWSER:        [],
  MEMORY_CURATOR: [{ provider: "openrouter", model: "deepseek/deepseek-chat-v4" }, { provider: "openrouter", model: "google/gemini-2.5-flash" }],
  COST_SENTINEL:  [{ provider: "openrouter", model: "google/gemini-2.5-flash" }],
};
