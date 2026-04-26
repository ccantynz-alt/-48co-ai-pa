"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { NewJobDialog } from "./NewJobDialog";

function statusVariant(s: string): "default" | "success" | "warning" | "destructive" | "secondary" {
  const m: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    LEAD: "secondary", QUOTED: "default", WON: "success", IN_PROGRESS: "default", COMPLETED: "success", LOST: "destructive",
  };
  return m[s] || "secondary";
}

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  address: string | null;
  createdAt: string;
  client: { name: string } | null;
  quotes: { id: string; total: number; status: string }[];
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function load() {
    const res = await fetch("/api/jobs");
    if (res.ok) setJobs(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const pipeline: Record<string, Job[]> = {};
  ["LEAD", "QUOTED", "WON", "IN_PROGRESS", "COMPLETED", "LOST"].forEach((s) => {
    pipeline[s] = jobs.filter((j) => j.status === s);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Jobs</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{jobs.length} job{jobs.length !== 1 ? "s" : ""} in pipeline</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" /> New Job
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
          <Briefcase className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No jobs yet</h3>
          <p className="text-zinc-400 text-sm mb-4">Track leads, won jobs, and completed work</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" /> Add First Job
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {["LEAD", "QUOTED", "WON", "IN_PROGRESS", "COMPLETED", "LOST"].map((status) => (
            <div key={status} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{status.replace("_", " ")}</h3>
                <span className="text-xs bg-zinc-100 text-zinc-500 rounded-full px-1.5 py-0.5">{pipeline[status].length}</span>
              </div>
              {pipeline[status].map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block bg-white border border-zinc-200 rounded-lg p-3 hover:border-orange-200 hover:shadow-sm transition-all"
                >
                  <p className="text-sm font-medium text-zinc-900 line-clamp-1">{job.title}</p>
                  {job.client && <p className="text-xs text-zinc-400 mt-0.5">{job.client.name}</p>}
                  <p className="text-xs text-zinc-300 mt-1">{formatDate(job.createdAt)}</p>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}

      <NewJobDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={() => { setDialogOpen(false); load(); }} />
    </div>
  );
}
