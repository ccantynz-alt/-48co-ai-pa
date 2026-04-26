import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, FileText, Plus } from "lucide-react";

function statusVariant(s: string): "default" | "success" | "warning" | "destructive" | "secondary" {
  const m: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    LEAD: "secondary", QUOTED: "default", WON: "success", IN_PROGRESS: "default", COMPLETED: "success", LOST: "destructive",
  };
  return m[s] || "secondary";
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const job = await prisma.job.findFirst({
    where: { id, userId: session!.userId },
    include: { client: true, quotes: { include: { items: true } }, complianceChecks: true },
  });
  if (!job) notFound();

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/jobs" className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-zinc-900">{job.title}</h1>
          <p className="text-zinc-500 text-sm">{job.client?.name || "No client"} · {formatDate(job.createdAt)}</p>
        </div>
        <Badge variant={statusVariant(job.status)} className="text-sm px-3 py-1">{job.status.replace("_", " ")}</Badge>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Job Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase mb-1">Description</p>
            <p className="text-sm text-zinc-700">{job.description}</p>
          </div>
          {job.address && (
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase mb-1">Address</p>
              <p className="text-sm text-zinc-700">{job.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Quotes</CardTitle>
            <Link href={`/quotes/new?jobId=${job.id}`} className="inline-flex items-center gap-1 text-sm text-orange-500 hover:underline">
              <Plus className="w-3 h-3" /> New Quote
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {job.quotes.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No quotes yet</p>
              <Link href={`/quotes/new?jobId=${job.id}`} className="text-sm text-orange-500 hover:underline mt-1 inline-block">
                Generate a quote
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {job.quotes.map((q) => (
                <Link key={q.id} href={`/quotes/${q.id}`} className="flex items-center justify-between py-2 hover:bg-zinc-50 -mx-2 px-2 rounded-lg">
                  <p className="text-sm font-medium text-zinc-900">{formatCurrency(q.total)}</p>
                  <Badge variant={q.status === "ACCEPTED" ? "success" : "secondary"}>{q.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {job.complianceChecks.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Compliance Checks</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {job.complianceChecks.map((check) => (
                <div key={check.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${check.status === "DONE" ? "bg-green-500" : check.status === "NA" ? "bg-zinc-300" : "bg-amber-400"}`} />
                  <p className="text-sm text-zinc-700">{check.item}</p>
                  <span className="text-xs text-zinc-400 ml-auto">{check.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
