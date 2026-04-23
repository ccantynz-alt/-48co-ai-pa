import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_ROLE_MODELS, SWAP_CANDIDATES, AgentRole } from "@/lib/agents/types";
import { Settings, KeyRound, Cpu } from "lucide-react";

const ROLE_LABEL: Record<AgentRole, string> = {
  PLANNER: "Planner",
  ARCHITECT: "Architect",
  REVIEWER: "Reviewer",
  BUILDER: "Builder",
  DESIGNER: "Designer",
  BROWSER: "Browser",
  MEMORY_CURATOR: "Memory Curator",
  COST_SENTINEL: "Cost Sentinel",
};

export default function SettingsPage() {
  const roles = Object.keys(DEFAULT_ROLE_MODELS) as AgentRole[];
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="size-8" /> Settings
        </h1>
        <p className="text-muted-foreground mt-2">API keys, model routing, and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" /> API keys (BYOK)
          </CardTitle>
          <CardDescription>
            Your keys, your bills. 48Co never marks up tokens. Keys are stored encrypted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span>ANTHROPIC_API_KEY</span>
            <span className="text-muted-foreground">set via .env — UI editor in Session 2</span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span>OPENROUTER_API_KEY (optional)</span>
            <span className="text-muted-foreground">unlocks DeepSeek, GPT-5, Gemini, Llama</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="size-4" /> Model routing per agent role
          </CardTitle>
          <CardDescription>
            Each agent role runs on its own model. Change any one without touching code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {roles.map((role) => {
              const current = DEFAULT_ROLE_MODELS[role];
              const alts = SWAP_CANDIDATES[role];
              return (
                <div
                  key={role}
                  className="grid grid-cols-[8rem,1fr,auto] items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="text-sm font-medium">{ROLE_LABEL[role]}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {current.provider}:{current.model}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {alts.length > 0 ? `${alts.length} swap option${alts.length === 1 ? "" : "s"}` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
