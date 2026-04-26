import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Zap, Star, ShieldCheck, MapPin, Briefcase, Award, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function PublicTradieProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tradie = await prisma.user.findFirst({
    where: { OR: [{ slug }, { id: slug }], role: "TRADIE", isPublic: true },
  });
  if (!tradie) notFound();

  const [licenses, reviews, completedJobs] = await Promise.all([
    prisma.license.findMany({ where: { userId: tradie.id, status: { not: "EXPIRED" } } }),
    prisma.review.findMany({
      where: { revieweeId: tradie.id },
      include: { reviewer: true, marketplaceJob: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.bid.count({ where: { tradieId: tradie.id, status: "ACCEPTED" } }),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="bg-white border-b border-zinc-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900">48co</span>
          </Link>
          <Link href="/find-tradies" className="text-sm text-zinc-600 hover:text-zinc-900">← Back to search</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {(tradie.companyName || tradie.name).charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-zinc-900">{tradie.companyName || tradie.name}</h1>
                {tradie.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-zinc-500 mt-1">{tradie.tradeType}</p>
              <div className="flex items-center gap-4 mt-3 flex-wrap text-sm">
                {tradie.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-zinc-900">{tradie.rating.toFixed(1)}</span>
                    <span className="text-zinc-500">({tradie.reviewCount} reviews)</span>
                  </div>
                )}
                {completedJobs > 0 && (
                  <div className="flex items-center gap-1 text-zinc-600">
                    <Briefcase className="w-4 h-4" />
                    {completedJobs} jobs completed
                  </div>
                )}
                {tradie.serviceArea && (
                  <div className="flex items-center gap-1 text-zinc-600">
                    <MapPin className="w-4 h-4" />
                    {tradie.serviceArea}
                  </div>
                )}
                {tradie.yearsExperience && (
                  <div className="flex items-center gap-1 text-zinc-600">
                    <Calendar className="w-4 h-4" />
                    {tradie.yearsExperience}+ years
                  </div>
                )}
              </div>
            </div>
            <Link
              href="/post-job"
              className="bg-orange-500 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Request Quote
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {tradie.bio && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 mb-3">About</h2>
                <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{tradie.bio}</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="text-zinc-400 text-sm">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`w-4 h-4 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-zinc-900">{r.reviewer.name}</span>
                        <span className="text-xs text-zinc-400">· {formatDate(r.createdAt)}</span>
                      </div>
                      {r.comment && <p className="text-sm text-zinc-700">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {licenses.length > 0 && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-orange-500" />
                  <h2 className="text-base font-semibold text-zinc-900">Licences & Certifications</h2>
                </div>
                <div className="space-y-2">
                  {licenses.map((l) => (
                    <div key={l.id} className="text-sm">
                      <p className="font-medium text-zinc-900">{l.name}</p>
                      <p className="text-xs text-zinc-500">
                        {l.type}{l.number ? ` · #${l.number}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tradie.hourlyRate && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h2 className="text-sm text-zinc-500 mb-1">Hourly Rate</h2>
                <p className="text-2xl font-bold text-zinc-900">
                  ${tradie.hourlyRate}<span className="text-sm font-normal text-zinc-500">/hr</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
