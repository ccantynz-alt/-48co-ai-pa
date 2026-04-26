import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TRADE_TYPES } from "@/lib/utils";
import { Zap, Star, ShieldCheck, MapPin, Search } from "lucide-react";

interface SearchParams {
  trade?: string;
  q?: string;
  country?: string;
}

export default async function FindTradiesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const where: Record<string, unknown> = { role: "TRADIE", isPublic: true };
  if (params.trade && params.trade !== "all") where.tradeType = params.trade;
  if (params.country) where.country = params.country;
  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { companyName: { contains: params.q } },
      { bio: { contains: params.q } },
      { serviceArea: { contains: params.q } },
    ];
  }

  const tradies = await prisma.user.findMany({
    where,
    orderBy: [{ isVerified: "desc" }, { rating: "desc" }, { jobsCompleted: "desc" }],
    take: 60,
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
            <Link href="/post-job" className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
              Post a Job
            </Link>
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-4 py-2">Sign In</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900">Find a verified tradie</h1>
          <p className="text-zinc-500 mt-1">{tradies.length} licensed local tradies on 48co</p>
        </div>

        <form className="bg-white border border-zinc-200 rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Search by name, business, or area..."
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            name="trade"
            defaultValue={params.trade || "all"}
            className="h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All trades</option>
            {TRADE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            type="submit"
            className="h-10 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors"
          >
            Search
          </button>
        </form>

        {tradies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
            <Search className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-zinc-900">No tradies match your search</h3>
            <p className="text-zinc-400 text-sm mt-1">Try a broader search or post a job to attract bids</p>
            <Link href="/post-job" className="inline-block mt-4 text-orange-500 font-medium hover:underline">Post a job instead</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tradies.map((t) => (
              <Link
                key={t.id}
                href={`/tradies/${t.slug || t.id}`}
                className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-orange-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {(t.companyName || t.name).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-zinc-900 truncate">{t.companyName || t.name}</h3>
                      {t.isVerified && <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-zinc-500">{t.tradeType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                  {t.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-zinc-700">{t.rating.toFixed(1)}</span>
                      <span>({t.reviewCount})</span>
                    </div>
                  )}
                  {t.jobsCompleted > 0 && <span>{t.jobsCompleted} jobs</span>}
                  {t.serviceArea && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{t.serviceArea}</span>
                    </div>
                  )}
                </div>
                {t.bio && <p className="text-sm text-zinc-600 line-clamp-2">{t.bio}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
