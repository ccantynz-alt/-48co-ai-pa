import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Zap, MapPin, Clock, DollarSign, Star, ShieldCheck } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BidForm } from "./BidForm";
import { AwardBidButton } from "./AwardBidButton";

const URGENCY_LABELS: Record<string, { label: string; color: string }> = {
  EMERGENCY: { label: "Emergency", color: "bg-red-50 text-red-700" },
  URGENT: { label: "Urgent", color: "bg-amber-50 text-amber-700" },
  FLEXIBLE: { label: "Flexible", color: "bg-blue-50 text-blue-700" },
  PLANNED: { label: "Planned", color: "bg-zinc-100 text-zinc-700" },
};

export default async function MarketplaceJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const job = await prisma.marketplaceJob.findUnique({
    where: { id },
    include: {
      homeowner: { select: { id: true, name: true, country: true } },
      bids: {
        include: {
          tradie: {
            select: { id: true, name: true, companyName: true, slug: true, tradeType: true, isVerified: true, rating: true, reviewCount: true, jobsCompleted: true },
          },
        },
        orderBy: { amount: "asc" },
      },
    },
  });
  if (!job) notFound();

  const isOwner = session?.userId === job.homeowner.id;
  const isTradie = session?.role === "TRADIE";
  const userBid = isTradie ? job.bids.find((b) => b.tradie.id === session.userId) : null;
  const urg = URGENCY_LABELS[job.urgency] || URGENCY_LABELS.FLEXIBLE;

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
          <Link href="/jobs-board" className="text-sm text-zinc-600 hover:text-zinc-900">← All jobs</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-2xl font-bold text-zinc-900">{job.title}</h1>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${urg.color}`}>{urg.label}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500 flex-wrap mb-5">
                <span className="font-medium text-orange-600">{job.tradeType}</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.suburb ? `${job.suburb}${job.postcode ? ` ${job.postcode}` : ""}` : job.address}
                </div>
                {job.budget && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Budget {formatCurrency(job.budget, job.country)}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Posted {formatDate(job.createdAt)}
                </div>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-700 uppercase mb-2">Description</h2>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h2 className="text-base font-semibold text-zinc-900 mb-4">
                Bids · {job.bids.length}
              </h2>
              {job.bids.length === 0 ? (
                <p className="text-zinc-400 text-sm">No bids yet. Tradies usually bid within 24 hours.</p>
              ) : (
                <div className="space-y-3">
                  {job.bids.map((b) => (
                    <div key={b.id} className="border border-zinc-100 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <Link href={`/tradies/${b.tradie.slug || b.tradie.id}`} className="inline-flex items-center gap-2 hover:underline">
                            <span className="font-semibold text-zinc-900">{b.tradie.companyName || b.tradie.name}</span>
                            {b.tradie.isVerified && <ShieldCheck className="w-4 h-4 text-green-500" />}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                            {b.tradie.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {b.tradie.rating.toFixed(1)} ({b.tradie.reviewCount})
                              </div>
                            )}
                            {b.tradie.jobsCompleted > 0 && <span>{b.tradie.jobsCompleted} jobs</span>}
                            {b.estimatedDays && <span>~{b.estimatedDays} days</span>}
                          </div>
                          <p className="text-sm text-zinc-600 mt-2 whitespace-pre-wrap">{b.message}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-zinc-900">{formatCurrency(b.amount, job.country)}</p>
                          {b.status === "ACCEPTED" && <span className="text-xs font-medium text-green-600">Accepted</span>}
                          {b.status === "REJECTED" && <span className="text-xs text-zinc-400">Not selected</span>}
                          {isOwner && job.status === "OPEN" && b.status === "PENDING" && (
                            <div className="mt-2">
                              <AwardBidButton jobId={job.id} bidId={b.id} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase mb-2">Posted by</h2>
              <p className="font-medium text-zinc-900">{job.homeowner.name}</p>
              <p className="text-xs text-zinc-500">{job.homeowner.country === "NZ" ? "New Zealand" : "Australia"}</p>
            </div>

            {isTradie && job.status === "OPEN" && (
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h2 className="text-base font-semibold text-zinc-900 mb-3">
                  {userBid ? "Update your bid" : "Submit a bid"}
                </h2>
                <BidForm jobId={job.id} country={job.country} existingBid={userBid ? { amount: userBid.amount, message: userBid.message, estimatedDays: userBid.estimatedDays || undefined } : undefined} />
                <p className="text-xs text-zinc-400 mt-3">Free to bid. 6% success fee on completed jobs only.</p>
              </div>
            )}

            {!session && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <h3 className="font-semibold text-orange-900 mb-1">Are you a tradie?</h3>
                <p className="text-sm text-orange-700 mb-3">Sign up free and start bidding on jobs in your area.</p>
                <Link href="/register" className="inline-flex bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
