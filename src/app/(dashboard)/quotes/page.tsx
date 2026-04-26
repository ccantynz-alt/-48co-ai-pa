import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Plus, FileText, Zap } from "lucide-react";

function statusVariant(s: string): "default" | "success" | "warning" | "destructive" | "secondary" {
  const m: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    DRAFT: "secondary", SENT: "default", ACCEPTED: "success", REJECTED: "destructive", EXPIRED: "warning",
  };
  return m[s] || "secondary";
}

export default async function QuotesPage() {
  const session = await getSession();
  const quotes = await prisma.quote.findMany({
    where: { userId: session!.userId },
    orderBy: { createdAt: "desc" },
    include: { client: true, items: true },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Quotes</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{quotes.length} quote{quotes.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          href="/quotes/new"
          className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Quote
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
          <FileText className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No quotes yet</h3>
          <p className="text-zinc-400 text-sm mb-4">Use AI to generate your first professional quote in 30 seconds</p>
          <Link href="/quotes/new" className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
            <Zap className="w-4 h-4" /> Generate with AI
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Quote</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Client</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Date</th>
                <th className="text-right text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Total</th>
                <th className="text-center text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/quotes/${q.id}`} className="block">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{q.title}</p>
                          <p className="text-xs text-zinc-400">{q.number}{q.aiGenerated && <span className="ml-1 text-orange-500">· AI</span>}</p>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-zinc-600">{q.client?.name || <span className="text-zinc-300">—</span>}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-zinc-500">{formatDate(q.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-zinc-900">{formatCurrency(q.total)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusVariant(q.status)}>{q.status}</Badge>
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
