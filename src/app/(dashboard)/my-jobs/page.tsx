import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, MapPin } from "lucide-react";

function statusVariant(s: string): "default" | "success" | "warning" | "destructive" | "secondary" {
  return ({ OPEN: "default", AWARDED: "success", COMPLETED: "success", CANCELLED: "secondary" } as Record<string, "default" | "success" | "warning" | "destructive" | "secondary">)[s] || "secondary";
}

export default async function MyPostedJobsPage() {
  const session = await getSession();
  if (session!.role !== "HOMEOWNER") redirect("/dashboard");

  const jobs = await prisma.marketplaceJob.findMany({
    where: { homeownerId: session!.userId },
    orderBy: { createdAt: "desc" },
    include: { bids: { select: { id: true, amount: true, status: true } } },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Posted Jobs</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Track your jobs and review tradie bids</p>
        </div>
        <Link href="/post-job" className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Post a Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
          <Briefcase className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No jobs posted yet</h3>
          <p className="text-zinc-400 text-sm mb-4">Post your first job and get bids from verified local tradies</p>
          <Link href="/post-job" className="inline-flex bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Post a Job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map((j) => {
            const lowestBid = j.bids.length > 0 ? Math.min(...j.bids.map((b) => b.amount)) : null;
            return (
              <Link key={j.id} href={`/jobs-board/${j.id}`} className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-orange-200 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-zinc-900">{j.title}</h3>
                  <Badge variant={statusVariant(j.status)}>{j.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3 flex-wrap">
                  <span className="text-orange-600 font-medium">{j.tradeType}</span>
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.suburb || j.address.split(",")[0]}</div>
                  <span>{formatDate(j.createdAt)}</span>
                </div>
                <p className="text-sm text-zinc-600 line-clamp-2 mb-3">{j.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">{j.bids.length} bid{j.bids.length !== 1 ? "s" : ""}</span>
                  {lowestBid !== null && <span className="font-semibold text-zinc-900">From {formatCurrency(lowestBid, j.country)}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
