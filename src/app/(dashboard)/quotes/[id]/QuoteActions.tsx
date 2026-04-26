"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle, XCircle, Receipt, Trash2 } from "lucide-react";

interface QuoteActionsProps {
  quoteId: string;
  status: string;
}

export function QuoteActions({ quoteId, status }: QuoteActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(null);
  }

  async function convertToInvoice() {
    setLoading("invoice");
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromQuoteId: quoteId }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/invoices/${data.id}`);
    }
    setLoading(null);
  }

  async function deleteQuote() {
    if (!confirm("Delete this quote?")) return;
    setLoading("delete");
    await fetch(`/api/quotes/${quoteId}`, { method: "DELETE" });
    router.push("/quotes");
  }

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {status === "DRAFT" && (
        <Button onClick={() => updateStatus("SENT")} disabled={!!loading}>
          {loading === "SENT" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Mark as Sent
        </Button>
      )}
      {status === "SENT" && (
        <>
          <Button onClick={() => updateStatus("ACCEPTED")} disabled={!!loading} className="bg-green-600 hover:bg-green-700">
            {loading === "ACCEPTED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Accept
          </Button>
          <Button onClick={() => updateStatus("REJECTED")} variant="destructive" disabled={!!loading}>
            {loading === "REJECTED" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </Button>
        </>
      )}
      {status === "ACCEPTED" && (
        <Button onClick={convertToInvoice} disabled={!!loading} className="bg-green-600 hover:bg-green-700">
          {loading === "invoice" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
          Convert to Invoice
        </Button>
      )}
      <Button variant="outline" onClick={deleteQuote} disabled={!!loading} className="text-red-500 hover:text-red-700 hover:border-red-300 ml-auto">
        {loading === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        Delete
      </Button>
    </div>
  );
}
