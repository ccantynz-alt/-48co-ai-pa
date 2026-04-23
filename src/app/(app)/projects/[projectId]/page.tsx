import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Code2, Eye, Brain } from "lucide-react";

async function getProject(projectId: string, clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return null;
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
  });
  return project;
}

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId } = await auth();
  const project = userId ? await getProject(projectId, userId).catch(() => null) : null;
  if (!project) notFound();

  // Mark as most-recently-opened (fire-and-forget).
  void prisma.project.update({
    where: { id: project.id },
    data: { lastOpenedAt: new Date() },
  }).catch(() => undefined);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{project.name}</h1>
          <p className="text-xs text-muted-foreground font-mono">{project.slug}.48co.ai</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full border border-border text-muted-foreground capitalize">
          {project.status.toLowerCase()}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        <section className="col-span-4 border-r border-border flex flex-col">
          <div className="px-4 py-2 border-b border-border text-xs font-mono text-muted-foreground flex items-center gap-2">
            <MessageSquare className="size-3.5" /> chat
          </div>
          <div className="flex-1 overflow-auto p-4">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Chat with your agents</CardTitle>
                <CardDescription>
                  The multi-agent loop (Planner → Architect → Builder → Reviewer) lands in Session 2.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Once wired, you&rsquo;ll see each agent&rsquo;s step stream in here, with token cost per turn.</p>
                <p>Memory spans all your projects — not just this one.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="col-span-5 border-r border-border flex flex-col">
          <div className="px-4 py-2 border-b border-border text-xs font-mono text-muted-foreground flex items-center gap-2">
            <Eye className="size-3.5" /> preview
          </div>
          <div className="flex-1 flex items-center justify-center bg-muted/20 text-muted-foreground text-sm">
            Live preview (WebContainer) — Session 3
          </div>
        </section>

        <section className="col-span-3 flex flex-col">
          <div className="px-4 py-2 border-b border-border text-xs font-mono text-muted-foreground flex items-center gap-2">
            <Code2 className="size-3.5" /> files
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
            File tree + Monaco editor land in Session 3
          </div>
          <div className="border-t border-border px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="size-3.5" /> Memory scope: project + portfolio
          </div>
        </section>
      </div>
    </div>
  );
}
