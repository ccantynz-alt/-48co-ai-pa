import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InvoiceActions } from "./InvoiceActions";

function statusVariant(s: string): "default" | "success" | "warning" | "destructive" | "secondary" {
  const m: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    DRAFT: "secondary", SENT: "default", PAID: "success", OVERDUE: "destructive", CANCELLED: "secondary",
  };
  return m[s] || "secondary";
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session!.userId },
    include: { items: true, client: true, quote: true },
  });
  if (!invoice) notFound();

  const user = await prisma.user.findUnique({ where: { id: session!.userId } });

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/invoices" className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-zinc-900">{invoice.title}</h1>
          <p className="text-zinc-500 text-sm">{invoice.number} · {formatDate(invoice.createdAt)}</p>
        </div>
        <Badge variant={statusVariant(invoice.status)} className="text-sm px-3 py-1">{invoice.status}</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-zinc-400 uppercase mb-1">Bill To</p>
            <p className="text-sm font-medium text-zinc-900">{invoice.client?.name || "No client"}</p>
            {invoice.client?.email && <p className="text-xs text-zinc-400">{invoice.client.email}</p>}
            {invoice.client?.phone && <p className="text-xs text-zinc-400">{invoice.client.phone}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-zinc-400 uppercase mb-1">Due Date</p>
            <p className="text-sm font-medium text-zinc-900">
              {invoice.dueDate ? formatDate(invoice.dueDate) : "No due date"}
            </p>
            {invoice.paidAt && <p className="text-xs text-green-600">Paid {formatDate(invoice.paidAt)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-zinc-400 uppercase mb-1">From</p>
            <p className="text-sm font-medium text-zinc-900">{user?.companyName || user?.name}</p>
            <p className="text-xs text-zinc-400">{user?.abn ? `ABN ${user.abn}` : user?.tradeType}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-medium text-zinc-400 uppercase">
                <th className="text-left pb-2">Description</th>
                <th className="text-right pb-2">Qty</th>
                <th className="text-right pb-2 hidden sm:table-cell">Unit Price</th>
                <th className="text-right pb-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 pr-4 text-sm text-zinc-700">{item.description}</td>
                  <td className="py-2 text-right text-sm text-zinc-600">{item.quantity}</td>
                  <td className="py-2 text-right text-sm text-zinc-600 hidden sm:table-cell">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right text-sm font-medium text-zinc-900">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-zinc-100 mt-4 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-600">
              <span>GST (10%)</span>
              <span>{formatCurrency(invoice.gst)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-zinc-900 pt-1 border-t border-zinc-200">
              <span>TOTAL</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-600 whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
    </div>
  );
}
