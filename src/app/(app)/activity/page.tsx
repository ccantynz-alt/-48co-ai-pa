import { Activity } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
        <Activity className="size-8" /> Activity
      </h1>
      <p className="text-muted-foreground mt-2">
        Live feed of every agent action across every project. Wired in Session 2.
      </p>
    </div>
  );
}
