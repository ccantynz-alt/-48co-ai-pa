import Link from "next/link";
import { formatDistanceToNow } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProjectCardInput = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  kind: string;
  status: string;
  lastOpenedAt: Date | null;
  updatedAt: Date;
};

export function ProjectCard({ project }: { project: ProjectCardInput }) {
  const updated = project.lastOpenedAt ?? project.updatedAt;
  return (
    <Link href={`/app/projects/${project.id}`} className="group">
      <Card className="h-full transition-colors group-hover:border-foreground/40">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="truncate">{project.name}</CardTitle>
              <CardDescription className="truncate font-mono text-xs mt-1">
                {project.slug}.48co.ai
              </CardDescription>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground capitalize">
              {project.kind.toLowerCase()}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
            {project.description ?? "No description yet. Open to start building."}
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            {project.status === "PUBLISHED" ? "Live" : "Draft"} · last activity {formatDistanceToNow(updated)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
