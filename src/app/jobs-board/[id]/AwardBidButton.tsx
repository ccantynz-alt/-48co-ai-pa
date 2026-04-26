"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function AwardBidButton({ jobId, bidId }: { jobId: string; bidId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function award() {
    if (!confirm("Award this job to this tradie? Other bids will be declined.")) return;
    setLoading(true);
    await fetch(`/api/marketplace/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ awardedBidId: bidId }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button size="sm" onClick={award} disabled={loading} className="bg-green-600 hover:bg-green-700">
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
      Accept
    </Button>
  );
}
