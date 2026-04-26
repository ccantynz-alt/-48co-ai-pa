"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, Circle, MinusCircle, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ComplianceCheck {
  id: string;
  category: string;
  item: string;
  status: string;
  notes: string | null;
  checkedAt: string | null;
}

interface Job {
  id: string;
  title: string;
}

export default function CompliancePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [checks, setChecks] = useState<ComplianceCheck[]>([]);
  const [loadingChecks, setLoadingChecks] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/jobs").then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setJobs(data);
    });
  }, []);

  async function loadChecks(jobId: string) {
    setLoadingChecks(true);
    const res = await fetch(`/api/compliance?jobId=${jobId}`);
    if (res.ok) setChecks(await res.json());
    setLoadingChecks(false);
  }

  async function generateChecklist() {
    if (!selectedJobId) return;
    setGenerating(true);
    const res = await fetch("/api/compliance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: selectedJobId, generateFromTrade: true }),
    });
    if (res.ok) setChecks(await res.json());
    setGenerating(false);
  }

  async function updateCheck(id: string, status: string) {
    const res = await fetch("/api/compliance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setChecks((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  }

  function toggleCategory(cat: string) {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const categories = [...new Set(checks.map((c) => c.category))];
  const doneCount = checks.filter((c) => c.status === "DONE").length;
  const progress = checks.length > 0 ? Math.round((doneCount / checks.length) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Compliance Checklists</h1>
        <p className="text-zinc-500 text-sm mt-0.5">NZ & Australian trade compliance, H&S, and documentation requirements</p>
      </div>

      {/* Job selector */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-48 space-y-1.5">
          <label className="text-sm font-medium text-zinc-700">Select Job</label>
          <Select
            onValueChange={(v) => {
              setSelectedJobId(v);
              setChecks([]);
              loadChecks(v);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a job..." />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedJobId && checks.length === 0 && !loadingChecks && (
          <Button onClick={generateChecklist} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Generate Checklist for My Trade
          </Button>
        )}
        {checks.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-500">
              <span className="font-semibold text-zinc-900">{doneCount}/{checks.length}</span> complete
            </div>
            <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-zinc-700">{progress}%</span>
          </div>
        )}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
          <ShieldCheck className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No jobs yet</h3>
          <p className="text-zinc-400 text-sm">Create a job first, then generate compliance checklists</p>
        </div>
      )}

      {loadingChecks && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      )}

      {checks.length > 0 && (
        <div className="space-y-4">
          {categories.map((cat) => {
            const catChecks = checks.filter((c) => c.category === cat);
            const catDone = catChecks.filter((c) => c.status === "DONE").length;
            const collapsed = collapsedCategories.has(cat);

            return (
              <div key={cat} className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {collapsed ? <ChevronRight className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                    <span className="font-semibold text-zinc-900">{cat}</span>
                    <Badge variant={catDone === catChecks.length ? "success" : "secondary"}>
                      {catDone}/{catChecks.length}
                    </Badge>
                  </div>
                </button>

                {!collapsed && (
                  <div className="border-t border-zinc-100 divide-y divide-zinc-50">
                    {catChecks.map((check) => (
                      <div key={check.id} className="flex items-center gap-3 px-4 py-3">
                        <button
                          onClick={() => updateCheck(check.id, check.status === "DONE" ? "PENDING" : "DONE")}
                          className="flex-shrink-0 text-zinc-400 hover:text-green-500 transition-colors"
                        >
                          {check.status === "DONE" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : check.status === "NA" ? (
                            <MinusCircle className="w-5 h-5 text-zinc-300" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <span className={`text-sm flex-1 ${check.status === "DONE" ? "line-through text-zinc-400" : "text-zinc-700"}`}>
                          {check.item}
                        </span>
                        {check.status !== "DONE" && (
                          <button
                            onClick={() => updateCheck(check.id, "NA")}
                            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                          >
                            N/A
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
