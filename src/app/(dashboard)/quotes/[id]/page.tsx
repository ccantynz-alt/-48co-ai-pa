import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, FileText, Zap } from "lucide-react";
import { QuoteActions } from "./QuoteActions";

function statusVariant(s: string): "default" | "success" | "warning" | "destructive" | "secondary" {
  const m: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    DRAFT: "secondary", SENT: "default", ACCEPTED: "success", REJECTED: "destructive", EXPIRED: "warning",
  };
  return m[s] || "secondary";
}

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const quote = await prisma.quote.findFirst({
    where: { id, userId: session!.userId },
    include: { items: true, client: true, job: true },
  });
  if (!quote) notFound();

  const user = await prisma.user.findUnique({ where: { id: session!.userId } });

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/quotes" className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900">{quote.title}</h1>
            {quote.aiGenerated && (
              <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" /> AI Generated
              </span>
            )}
          </div>
          <p className="text-zinc-500 text-sm">{quote.number} · {formatDate(quote.createdAt)}</p>
        </div>
        <Badge variant={statusVariant(quote.status)} className="text-sm px-3 py-1">{quote.status}</Badge>
      </div>

      {/* Client + Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-zinc-400 uppercase mb-1">Client</p>
            <p className="text-sm font-medium text-zinc-900">{quote.client?.name || "No client"}</p>
            {quote.client?.email && <p className="text-xs text-zinc-400">{quote.client.email}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-zinc-400 uppercase mb-1">Valid Until</p>
            <p className="text-sm font-medium text-zinc-900">
              {quote.validUntil ? formatDate(quote.validUntil) : "No expiry"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-zinc-400 uppercase mb-1">From</p>
            <p className="text-sm font-medium text-zinc-900">{user?.companyName || user?.name}</p>
            <p className="text-xs text-zinc-400">{user?.tradeType}</p>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-medium text-zinc-400 uppercase">
                <th className="text-left pb-2">Description</th>
                <th className="text-right pb-2">Qty</th>
                <th className="text-right pb-2 hidden sm:table-cell">Unit</th>
                <th className="text-right pb-2">Unit Price</th>
                <th className="text-right pb-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {quote.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 pr-4 text-sm text-zinc-700">{item.description}</td>
                  <td className="py-2 text-right text-sm text-zinc-600">{item.quantity}</td>
                  <td className="py-2 text-right text-sm text-zinc-500 hidden sm:table-cell">{item.unit}</td>
                  <td className="py-2 text-right text-sm text-zinc-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right text-sm font-medium text-zinc-900">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-zinc-100 mt-4 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-600">
              <span>GST (10%)</span>
              <span>{formatCurrency(quote.gst)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-zinc-900 pt-1 border-t border-zinc-200">
              <span>Total</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {quote.notes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notes & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 whitespace-pre-wrap">{quote.notes}</p>
          </CardContent>
        </Card>
      )}

      <QuoteActions quoteId={quote.id} status={quote.status} />
    </div>
  );
}
