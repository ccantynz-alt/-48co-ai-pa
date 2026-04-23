import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";

export default function MemoryPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Brain className="size-8" /> Memory
        </h1>
        <p className="text-muted-foreground mt-2">
          Everything 48Co remembers across all your projects. This is the moat the competitors don&rsquo;t have.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Episodic</CardTitle>
            <CardDescription>Every turn, every edit, every deploy</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Session 2 wires the event log.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Semantic</CardTitle>
            <CardDescription>Vector search across all history</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Session 2 wires pgvector.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procedural</CardTitle>
            <CardDescription>Learned preferences, distilled from corrections</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Session 2 wires the curator.</CardContent>
        </Card>
      </div>
    </div>
  );
}
