import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, daysUntil } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Receipt, Briefcase, Award, AlertTriangle, Plus, ArrowRight } from "lucide-react";

function statusBadgeVariant(status: string) {
  const map: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    DRAFT: "secondary",
    SENT: "default",
    ACCEPTED: "success",
    REJECTED: "destructive",
    PAID: "success",
    OVERDUE: "destructive",
    WON: "success",
    IN_PROGRESS: "default",
    COMPLETED: "success",
    LOST: "destructive",
    LEAD: "secondary",
    QUOTED: "default",
    ACTIVE: "success",
    EXPIRING_SOON: "warning",
    EXPIRED: "destructive",
  };
  return map[status] || "secondary";
}

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.userId;

  const [jobCount, quoteCount, invoiceCount, recentJobs, recentQuotes, pendingInvoices, expiringLicenses] =
    await Promise.all([
      prisma.job.count({ where: { userId } }),
      prisma.quote.count({ where: { userId } }),
      prisma.invoice.count({ where: { userId } }),
      prisma.job.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { client: true },
      }),
      prisma.quote.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { client: true },
      }),
      prisma.invoice.findMany({
        where: { userId, status: { in: ["SENT", "OVERDUE"] } },
        orderBy: { dueDate: "asc" },
        take: 5,
        include: { client: true },
      }),
      prisma.license.findMany({
        where: {
          userId,
          expiresAt: { lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
          status: { not: "EXPIRED" },
        },
        orderBy: { expiresAt: "asc" },
        take: 3,
      }),
    ]);

  const totalOutstanding = pendingInvoices.reduce((s, i) => s + i.total, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Good day, {session!.name.split(" ")[0]}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{session!.tradeType} · Here&apos;s your business at a glance</p>
        </div>
        <div className="flex gap-2">
          <Link href="/quotes/new" className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
            <Plus className="w-4 h-4" /> New Quote
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">Active Jobs</p>
                <p className="text-3xl font-bold text-zinc-900 mt-1">{jobCount}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">Quotes</p>
                <p className="text-3xl font-bold text-zinc-900 mt-1">{quoteCount}</p>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">Invoices</p>
                <p className="text-3xl font-bold text-zinc-900 mt-1">{invoiceCount}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-zinc-500">Outstanding</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{formatCurrency(totalOutstanding)}</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Jobs</CardTitle>
              <Link href="/jobs" className="text-sm text-orange-500 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">No jobs yet</p>
                <Link href="/jobs/new" className="text-orange-500 text-sm hover:underline mt-1 inline-block">Create your first job</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between py-2 hover:bg-zinc-50 -mx-2 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{job.title}</p>
                      <p className="text-xs text-zinc-400">{job.client?.name || "No client"} · {formatDate(job.createdAt)}</p>
                    </div>
                    <Badge variant={statusBadgeVariant(job.status)}>{job.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Quotes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Quotes</CardTitle>
              <Link href="/quotes" className="text-sm text-orange-500 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentQuotes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">No quotes yet</p>
                <Link href="/quotes/new" className="text-orange-500 text-sm hover:underline mt-1 inline-block">Generate your first quote</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuotes.map((quote) => (
                  <Link key={quote.id} href={`/quotes/${quote.id}`} className="flex items-center justify-between py-2 hover:bg-zinc-50 -mx-2 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{quote.title}</p>
                      <p className="text-xs text-zinc-400">{quote.number} · {formatCurrency(quote.total)}</p>
                    </div>
                    <Badge variant={statusBadgeVariant(quote.status)}>{quote.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(pendingInvoices.length > 0 || expiringLicenses.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingInvoices.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-500" />
                  <CardTitle className="text-base">Unpaid Invoices</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingInvoices.map((inv) => (
                    <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between py-1.5 hover:bg-zinc-50 -mx-2 px-2 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{inv.title}</p>
                        <p className="text-xs text-zinc-400">{inv.number} · Due {inv.dueDate ? formatDate(inv.dueDate) : "no date"}</p>
                      </div>
                      <span className="text-sm font-semibold text-zinc-900">{formatCurrency(inv.total)}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {expiringLicenses.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <CardTitle className="text-base">Expiring Licenses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiringLicenses.map((lic) => {
                    const days = lic.expiresAt ? daysUntil(lic.expiresAt) : null;
                    return (
                      <Link key={lic.id} href="/licenses" className="flex items-center justify-between py-1.5 hover:bg-zinc-50 -mx-2 px-2 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{lic.name}</p>
                          <p className="text-xs text-zinc-400">{lic.type}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${days !== null && days <= 14 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                          {days !== null ? `${days}d left` : "Expires soon"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
