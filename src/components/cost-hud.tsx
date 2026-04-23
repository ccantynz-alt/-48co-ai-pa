"use client";

import { useEffect, useState } from "react";
import { Zap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CostSnapshot = {
  todayUsd: number;
  monthUsd: number;
  budgetUsd: number;
  tokensToday: number;
};

export function CostHud() {
  const [snap, setSnap] = useState<CostSnapshot | null>(null);

  useEffect(() => {
    let timer: number;
    const load = async () => {
      try {
        const res = await fetch("/api/cost/snapshot");
        if (res.ok) setSnap(await res.json());
      } catch {
        /* endpoint not wired yet */
      }
      timer = window.setTimeout(load, 15_000);
    };
    void load();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const usedPct = snap ? Math.min(100, (snap.monthUsd / Math.max(snap.budgetUsd, 1)) * 100) : 0;
  const warn = usedPct > 80;

  return (
    <div className="flex items-center gap-4 px-3 py-1.5 rounded-md border border-border bg-card/60 text-xs font-mono">
      {warn ? <AlertCircle className="size-3.5 text-amber-400" /> : <Zap className="size-3.5 text-emerald-400" />}
      <span className="text-muted-foreground">Today</span>
      <span className="text-foreground">${snap ? snap.todayUsd.toFixed(2) : "0.00"}</span>
      <span className="text-muted-foreground">Month</span>
      <span className={cn("text-foreground", warn && "text-amber-400")}>
        ${snap ? snap.monthUsd.toFixed(2) : "0.00"} / ${snap ? snap.budgetUsd.toFixed(0) : "—"}
      </span>
      <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full transition-all", warn ? "bg-amber-400" : "bg-emerald-400")}
          style={{ width: `${usedPct}%` }}
        />
      </div>
    </div>
  );
}
