"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle, XCircle, Trash2 } from "lucide-react";

export function InvoiceActions({ invoiceId, status }: { invoiceId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    await fetch(`/api/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(null);
  }

  async function deleteInvoice() {
    if (!confirm("Delete this invoice?")) return;
    setLoading("delete");
    await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
    router.push("/invoices");
  }

  return (
    <div className="flex flex-wrap gap-3">
      {status === "DRAFT" && (
        <Button onClick={() => updateStatus("SENT")} disabled={!!loading}>
          {loading === "SENT" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Mark as Sent
        </Button>
      )}
      {(status === "SENT" || status === "OVERDUE") && (
        <Button onClick={() => updateStatus("PAID")} disabled={!!loading} className="bg-green-600 hover:bg-green-700">
          {loading === "PAID" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Mark as Paid
        </Button>
      )}
      {status !== "PAID" && status !== "CANCELLED" && (
        <Button onClick={() => updateStatus("CANCELLED")} variant="outline" disabled={!!loading}>
          {loading === "CANCELLED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Cancel
        </Button>
      )}
      <Button variant="outline" onClick={deleteInvoice} disabled={!!loading} className="text-red-500 hover:text-red-700 hover:border-red-300 ml-auto">
        {loading === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        Delete
      </Button>
    </div>
  );
}
