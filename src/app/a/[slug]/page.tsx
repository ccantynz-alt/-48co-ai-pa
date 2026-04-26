import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Star, ShieldCheck, MapPin, ExternalLink } from "lucide-react";

export default async function AssociationDirectory({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const association = await prisma.association.findUnique({
    where: { slug },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        include: {
          user: {
            select: {
              id: true, slug: true, name: true, companyName: true, tradeType: true,
              isVerified: true, rating: true, reviewCount: true, jobsCompleted: true,
              serviceArea: true, bio: true, isPublic: true,
            },
          },
        },
        orderBy: { user: { rating: "desc" } },
      },
    },
  });

  if (!association) notFound();

  const visibleMembers = association.memberships.filter((m) => m.user.isPublic);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header style={{ backgroundColor: association.brandColor }} className="text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium opacity-80 mb-1">Verified Members Directory</p>
              <h1 className="text-4xl font-bold">{association.name}</h1>
              {association.description && <p className="text-lg mt-2 max-w-2xl opacity-90">{association.description}</p>}
            </div>
            {association.websiteUrl && (
              <a href={association.websiteUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium">
                Association Website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <p className="mt-6 text-sm opacity-80">{visibleMembers.length} verified member{visibleMembers.length !== 1 ? "s" : ""} · Powered by 48co</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {visibleMembers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
            <p className="text-zinc-500">No public members yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleMembers.map((m) => (
              <Link
                key={m.user.id}
                href={`/tradies/${m.user.slug || m.user.id}`}
                className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-all"
                style={{ borderColor: undefined }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ backgroundColor: association.brandColor }}
                  >
                    {(m.user.companyName || m.user.name).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-zinc-900 truncate">{m.user.companyName || m.user.name}</h3>
                      {m.user.isVerified && <ShieldCheck className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-xs text-zinc-500">{m.user.tradeType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
                  {m.user.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-medium text-zinc-700">{m.user.rating.toFixed(1)}</span>
                      <span>({m.user.reviewCount})</span>
                    </div>
                  )}
                  {m.user.serviceArea && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{m.user.serviceArea}</span>
                    </div>
                  )}
                </div>
                {m.user.bio && <p className="text-sm text-zinc-600 line-clamp-2">{m.user.bio}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-zinc-200 bg-white py-6 mt-10">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-zinc-400">
          Powered by{" "}
          <Link href="/" className="font-semibold text-zinc-700 hover:underline">48co</Link>
          {" · "}AI-native platform for trades & construction
        </div>
      </footer>
    </div>
  );
}
