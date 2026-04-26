"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

export function ConnectStripeButton({ hasAccount }: { hasAccount: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function connect() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/stripe/connect", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to start onboarding");
      setLoading(false);
    } else if (data.url) {
      window.location.href = data.url;
    } else {
      setError("Stripe is not configured for this environment");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}
      <Button onClick={connect} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        {hasAccount ? "Continue Stripe onboarding" : "Connect Stripe"}
      </Button>
    </div>
  );
}
