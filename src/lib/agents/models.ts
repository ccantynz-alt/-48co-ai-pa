// Pluggable model layer. Agents call invokeModel(role, ...) and this layer
// routes to the right provider. Swap providers per-role without touching
// agent code. Anthropic adapter uses prompt caching. OpenRouter adapter is
// OpenAI-compatible so it works with GPT-5, DeepSeek V4, Gemini 2.5, etc.

import Anthropic from "@anthropic-ai/sdk";
import {
  AgentRole,
  DEFAULT_ROLE_MODELS,
  ModelInvocation,
  ModelResponse,
  RoleModelConfig,
} from "./types";

let _anthropic: Anthropic | null = null;
function anthropic() {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY missing");
    }
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

// Claude API pricing (USD per 1M tokens) — used by the cost meter.
// Update these when Anthropic pricing changes.
const ANTHROPIC_PRICES: Record<string, { input: number; output: number; cached: number }> = {
  "claude-opus-4-7":               { input: 15,   output: 75,   cached: 1.5 },
  "claude-sonnet-4-6":             { input: 3,    output: 15,   cached: 0.3 },
  "claude-haiku-4-5-20251001":     { input: 1,    output: 5,    cached: 0.1 },
};

function estimateAnthropicCost(model: string, inp: number, out: number, cached: number): number {
  const p = ANTHROPIC_PRICES[model];
  if (!p) return 0;
  const nonCachedInput = Math.max(0, inp - cached);
  return (
    (nonCachedInput * p.input) / 1_000_000 +
    (cached * p.cached) / 1_000_000 +
    (out * p.output) / 1_000_000
  );
}

async function invokeAnthropic(inv: ModelInvocation, model: string): Promise<ModelResponse> {
  const system = inv.cachedSystemPrompt
    ? [{ type: "text" as const, text: inv.cachedSystemPrompt, cache_control: { type: "ephemeral" as const } }]
    : undefined;

  const tools = inv.tools?.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
  }));

  const res = await anthropic().messages.create({
    model,
    max_tokens: inv.maxTokens ?? 4096,
    system,
    messages: inv.messages,
    tools,
  });

  const textBlocks = res.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  const toolUses = res.content
    .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
    .map((b) => ({ id: b.id, name: b.name, input: b.input as Record<string, unknown> }));

  const usage = res.usage;
  const cached = (usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0;
  const costUsd = estimateAnthropicCost(model, usage.input_tokens, usage.output_tokens, cached);

  return {
    content: textBlocks.map((b) => b.text).join("\n"),
    toolUses,
    usage: {
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      cachedInputTokens: cached,
      costUsd,
    },
    stopReason: res.stop_reason ?? "end_turn",
    model,
    provider: "anthropic",
  };
}

async function invokeOpenRouter(inv: ModelInvocation, model: string): Promise<ModelResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing — configure it to use non-Anthropic models");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://app.48co.ai",
      "X-Title": "48Co",
    },
    body: JSON.stringify({
      model,
      max_tokens: inv.maxTokens ?? 4096,
      messages: inv.cachedSystemPrompt
        ? [{ role: "system", content: inv.cachedSystemPrompt }, ...inv.messages]
        : inv.messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${body}`);
  }
  const data = await res.json();
  const choice = data.choices[0];
  const usage = data.usage ?? { prompt_tokens: 0, completion_tokens: 0 };

  return {
    content: choice.message?.content ?? "",
    toolUses: [],
    usage: {
      inputTokens: usage.prompt_tokens ?? 0,
      outputTokens: usage.completion_tokens ?? 0,
      costUsd: data.usage?.total_cost ?? 0,
    },
    stopReason: choice.finish_reason ?? "stop",
    model,
    provider: "openrouter",
  };
}

export async function invokeModel(
  inv: ModelInvocation,
  overrideConfig?: RoleModelConfig,
): Promise<ModelResponse> {
  const config = overrideConfig ?? DEFAULT_ROLE_MODELS[inv.role];
  if (config.provider === "anthropic") return invokeAnthropic(inv, config.model);
  return invokeOpenRouter(inv, config.model);
}

export function getDefaultModelForRole(role: AgentRole): RoleModelConfig {
  return DEFAULT_ROLE_MODELS[role];
}
