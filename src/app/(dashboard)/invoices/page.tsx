import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";

function statusVariant(s: string): "default" | "success" | "warning" | "destructive" | "secondary" {
  const m: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    DRAFT: "secondary", SENT: "default", PAID: "success", OVERDUE: "destructive", CANCELLED: "secondary",
  };
  return m[s] || "secondary";
}

export default async function InvoicesPage() {
  const session = await getSession();
  const invoices = await prisma.invoice.findMany({
    where: { userId: session!.userId },
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });

  const outstanding = invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((s, i) => s + i.total, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Invoices</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            {outstanding > 0 && <> · <span className="text-amber-600 font-medium">{formatCurrency(outstanding)} outstanding</span></>}
          </p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
          <Receipt className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No invoices yet</h3>
          <p className="text-zinc-400 text-sm">Accept a quote and convert it to an invoice to get started</p>
          <Link href="/quotes" className="inline-flex items-center gap-1.5 mt-4 text-sm text-orange-500 hover:underline">
            Go to Quotes
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Invoice</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Client</th>
                <th className="text-left text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Due</th>
                <th className="text-right text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Total</th>
                <th className="text-center text-xs font-medium text-zinc-400 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/invoices/${inv.id}`} className="block">
                      <p className="text-sm font-medium text-zinc-900">{inv.title}</p>
                      <p className="text-xs text-zinc-400">{inv.number}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-zinc-600">{inv.client?.name || <span className="text-zinc-300">—</span>}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-zinc-500">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-zinc-900">{formatCurrency(inv.total)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusVariant(inv.status)}>{inv.status}</Badge>
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
