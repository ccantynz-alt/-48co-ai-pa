"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRADE_TYPES } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tradeType, setTradeType] = useState("");
  const [country, setCountry] = useState("AU");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        companyName: form.get("companyName"),
        phone: form.get("phone"),
        tradeType,
        country,
        abn: form.get("abn"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-zinc-900">48co</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">Create your account</h1>
          <p className="text-zinc-500 text-sm mt-1">Free to get started. No credit card required.</p>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Smith" required />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="At least 8 characters" required minLength={8} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="companyName">Business Name (optional)</Label>
                <Input id="companyName" name="companyName" placeholder="Smith Electrical Pty Ltd" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Trade Type</Label>
                <Select onValueChange={setTradeType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your trade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Select defaultValue="AU" onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="NZ">New Zealand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="abn">{country === "NZ" ? "NZBN" : "ABN"} (optional)</Label>
                <Input id="abn" name="abn" placeholder={country === "NZ" ? "13 digits" : "11 digits"} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" name="phone" type="tel" placeholder="04XX XXX XXX" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading || !tradeType}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-orange-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
