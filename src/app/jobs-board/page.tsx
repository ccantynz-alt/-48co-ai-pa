import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TRADE_TYPES, formatCurrency, formatDate } from "@/lib/utils";
import { Zap, MapPin, Clock, DollarSign } from "lucide-react";

const URGENCY_LABELS: Record<string, { label: string; color: string }> = {
  EMERGENCY: { label: "Emergency", color: "bg-red-50 text-red-700" },
  URGENT: { label: "Urgent", color: "bg-amber-50 text-amber-700" },
  FLEXIBLE: { label: "Flexible", color: "bg-blue-50 text-blue-700" },
  PLANNED: { label: "Planned", color: "bg-zinc-100 text-zinc-700" },
};

export default async function JobsBoardPage({ searchParams }: { searchParams: Promise<{ trade?: string; country?: string }> }) {
  const params = await searchParams;
  const where: Record<string, unknown> = { status: "OPEN" };
  if (params.trade && params.trade !== "all") where.tradeType = params.trade;
  if (params.country) where.country = params.country;

  const jobs = await prisma.marketplaceJob.findMany({
    where,
    orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
    include: { bids: { select: { id: true } } },
    take: 80,
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900">48co</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900">Open Jobs</h1>
          <p className="text-zinc-500 mt-1">Bid on work in your area · No lead fees, no contracts · 6% success fee on completed jobs</p>
        </div>

        <form className="bg-white border border-zinc-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select name="trade" defaultValue={params.trade || "all"} className="h-10 px-3 rounded-lg border border-zinc-200 text-sm">
            <option value="all">All trades</option>
            {TRADE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="country" defaultValue={params.country || ""} className="h-10 px-3 rounded-lg border border-zinc-200 text-sm">
            <option value="">All regions</option>
            <option value="AU">Australia</option>
            <option value="NZ">New Zealand</option>
          </select>
          <button type="submit" className="h-10 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600">
            Filter
          </button>
        </form>

        {jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900">No open jobs match your filter</h3>
            <p className="text-zinc-400 text-sm mt-1">Check back soon — homeowners post new jobs every day</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {jobs.map((j) => {
              const urg = URGENCY_LABELS[j.urgency] || URGENCY_LABELS.FLEXIBLE;
              return (
                <Link
                  key={j.id}
                  href={`/jobs-board/${j.id}`}
                  className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-orange-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-zinc-900 text-lg">{j.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urg.color} flex-shrink-0`}>{urg.label}</span>
                  </div>
                  <p className="text-sm text-zinc-600 line-clamp-2 mb-3">{j.description}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                    <span className="font-medium text-orange-600">{j.tradeType}</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {j.suburb || j.address.split(",")[0]}
                    </div>
                    {j.budget && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Budget {formatCurrency(j.budget, j.country)}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(j.createdAt)}
                    </div>
                    <span className="ml-auto text-zinc-400">{j.bids.length} bid{j.bids.length !== 1 ? "s" : ""}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
