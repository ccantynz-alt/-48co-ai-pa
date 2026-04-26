import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Hammer, ExternalLink } from "lucide-react";

function statusVariant(s: string): "default" | "success" | "warning" | "destructive" | "secondary" {
  return ({ PENDING: "secondary", ACCEPTED: "success", REJECTED: "destructive" } as Record<string, "default" | "success" | "warning" | "destructive" | "secondary">)[s] || "secondary";
}

export default async function MyBidsPage() {
  const session = await getSession();
  if (session!.role !== "TRADIE") redirect("/dashboard");

  const bids = await prisma.bid.findMany({
    where: { tradieId: session!.userId },
    orderBy: { createdAt: "desc" },
    include: { marketplaceJob: { include: { homeowner: { select: { name: true } } } } },
  });

  const stats = {
    pending: bids.filter((b) => b.status === "PENDING").length,
    accepted: bids.filter((b) => b.status === "ACCEPTED").length,
    rejected: bids.filter((b) => b.status === "REJECTED").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Bids</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{stats.pending} pending · {stats.accepted} won · {stats.rejected} lost</p>
        </div>
        <Link href="/jobs-board" className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
          Find more jobs
        </Link>
      </div>

      {bids.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
          <Hammer className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No bids yet</h3>
          <p className="text-zinc-400 text-sm mb-4">Browse open jobs in your trade and submit your first bid</p>
          <Link href="/jobs-board" className="inline-flex bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3">Job</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3 hidden md:table-cell">Homeowner</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase px-4 py-3 hidden sm:table-cell">Date</th>
                <th className="text-right text-xs font-medium text-zinc-400 uppercase px-4 py-3">Bid</th>
                <th className="text-center text-xs font-medium text-zinc-400 uppercase px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {bids.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-zinc-900">{b.marketplaceJob.title}</p>
                    <p className="text-xs text-zinc-400">{b.marketplaceJob.tradeType}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-zinc-600">{b.marketplaceJob.homeowner.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm text-zinc-500">{formatDate(b.createdAt)}</td>
                  <td className="px-4 py-3 text-right text-sm font-semibold">{formatCurrency(b.amount, b.marketplaceJob.country)}</td>
                  <td className="px-4 py-3 text-center"><Badge variant={statusVariant(b.status)}>{b.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/jobs-board/${b.marketplaceJobId}`} className="text-orange-500 hover:underline text-sm inline-flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
