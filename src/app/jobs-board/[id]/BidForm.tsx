"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BidForm({ jobId, country, existingBid }: { jobId: string; country: string; existingBid?: { amount: number; message: string; estimatedDays?: number } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currency = country === "NZ" ? "NZD" : "AUD";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/marketplace/bids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marketplaceJobId: jobId,
        amount: form.get("amount"),
        message: form.get("message"),
        estimatedDays: form.get("estimatedDays"),
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to submit bid");
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error && <div className="bg-red-50 text-red-700 text-xs px-3 py-2 rounded">{error}</div>}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Quote Amount ({currency}, ex-GST)</Label>
        <Input id="amount" name="amount" type="number" step="0.01" defaultValue={existingBid?.amount} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="estimatedDays">Estimated days (optional)</Label>
        <Input id="estimatedDays" name="estimatedDays" type="number" defaultValue={existingBid?.estimatedDays} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">Message to homeowner</Label>
        <Textarea id="message" name="message" rows={4} defaultValue={existingBid?.message} placeholder="Briefly describe your approach, materials included, and what's not." required />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {existingBid ? "Update Bid" : "Submit Bid"}
      </Button>
    </form>
  );
}
