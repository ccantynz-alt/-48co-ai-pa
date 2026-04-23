import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectCard } from "@/components/project-card";

export default async function ProjectsIndexPage() {
  const { userId } = await auth();
  const user = userId ? await prisma.user.findUnique({ where: { clerkId: userId } }).catch(() => null) : null;
  const projects = user
    ? await prisma.project.findMany({
        where: { userId: user.id },
        orderBy: [{ lastOpenedAt: { sort: "desc", nulls: "last" } }, { updatedAt: "desc" }],
      }).catch(() => [])
    : [];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} {projects.length === 1 ? "project" : "projects"} in your portfolio.
          </p>
        </div>
        <Link href="/app/projects/new">
          <Button>
            <Plus className="size-4" /> New project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground">
          No projects yet. Create your first one to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
