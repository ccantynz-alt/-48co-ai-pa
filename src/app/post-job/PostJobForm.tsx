"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRADE_TYPES } from "@/lib/utils";

export function PostJobForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tradeType, setTradeType] = useState("");
  const [country, setCountry] = useState("AU");
  const [urgency, setUrgency] = useState("FLEXIBLE");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/marketplace/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        tradeType,
        address: form.get("address"),
        suburb: form.get("suburb"),
        postcode: form.get("postcode"),
        country,
        budget: form.get("budget"),
        urgency,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to post job");
      setLoading(false);
    } else {
      router.push(`/jobs-board/${data.id}`);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}

          <div className="space-y-1.5">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" name="title" placeholder="e.g. Replace hot water system" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Describe the Job</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What needs doing? Be as detailed as you like — better descriptions get better quotes."
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Trade Required</Label>
              <Select onValueChange={setTradeType} required>
                <SelectTrigger><SelectValue placeholder="Select trade..." /></SelectTrigger>
                <SelectContent>
                  {TRADE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Urgency</Label>
              <Select defaultValue="FLEXIBLE" onValueChange={setUrgency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMERGENCY">Emergency (today)</SelectItem>
                  <SelectItem value="URGENT">Urgent (within a week)</SelectItem>
                  <SelectItem value="FLEXIBLE">Flexible (within a month)</SelectItem>
                  <SelectItem value="PLANNED">Planned (next 3 months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Main Street" required />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="suburb">Suburb</Label>
              <Input id="suburb" name="suburb" placeholder="Bondi" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" name="postcode" placeholder="2026" />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Select defaultValue="AU" onValueChange={setCountry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="NZ">New Zealand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="budget">Budget Range (optional)</Label>
            <Input id="budget" name="budget" type="number" placeholder="e.g. 2500" />
            <p className="text-xs text-zinc-400">Helps tradies submit relevant bids. You can leave blank.</p>
          </div>

          <Button type="submit" disabled={loading || !tradeType} className="w-full">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Post Job & Get Quotes
          </Button>
          <p className="text-xs text-zinc-400 text-center">
            Free to post. We charge tradies a 6% success fee only when work completes — no leads sold, no contracts.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
