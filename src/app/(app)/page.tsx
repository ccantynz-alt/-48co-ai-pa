import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Plus, FolderKanban, Activity, Brain } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";

async function getUserProjects(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      projects: {
        where: { status: { not: "ARCHIVED" } },
        orderBy: [{ lastOpenedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
        take: 12,
      },
    },
  });
  return user?.projects ?? [];
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const projects = userId ? await getUserProjects(userId).catch(() => []) : [];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Your portfolio of projects. Cross-project memory is on — 48Co remembers everything across them.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Active projects</CardTitle>
            <FolderKanban className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">of unlimited</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Memory entries</CardTitle>
            <Brain className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">Session 2 wires this up</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Events this week</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">Session 2 wires this up</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
          <Link href="/app/projects/new">
            <Button size="sm">
              <Plus className="size-4" /> New project
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="items-center text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-2">
                <FolderKanban className="size-6 text-muted-foreground" />
              </div>
              <CardTitle>No projects yet</CardTitle>
              <CardDescription className="max-w-md">
                Create your first project and 48Co&rsquo;s multi-agent system starts building. It will remember
                everything for next time.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
              <Link href="/app/projects/new">
                <Button>
                  <Plus className="size-4" /> Create first project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
