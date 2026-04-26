"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface UserData {
  name: string;
  phone: string | null;
  companyName: string | null;
  tradeType: string;
  bio: string | null;
  serviceArea: string | null;
  hourlyRate: number | null;
  yearsExperience: number | null;
  isPublic: boolean;
  abn: string | null;
  nzbn: string | null;
  country: string;
  role: string;
}

export function ProfileForm({ user }: { user: UserData }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPublic, setIsPublic] = useState(user.isPublic);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        companyName: form.get("companyName"),
        bio: form.get("bio"),
        serviceArea: form.get("serviceArea"),
        hourlyRate: form.get("hourlyRate"),
        yearsExperience: form.get("yearsExperience"),
        isPublic,
        abn: form.get("abn"),
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={user.name} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Business Name</Label>
              <Input id="companyName" name="companyName" defaultValue={user.companyName || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={user.phone || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="abn">{user.country === "NZ" ? "NZBN" : "ABN"}</Label>
              <Input id="abn" name="abn" defaultValue={user.abn || ""} />
            </div>
          </div>
        </CardContent>
      </Card>

      {user.role === "TRADIE" && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Public Profile</CardTitle>
              <p className="text-sm text-zinc-500">Shown to homeowners on the marketplace</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="bio">About You</Label>
                <Textarea id="bio" name="bio" defaultValue={user.bio || ""} rows={4} placeholder="Tell homeowners about your experience, your speciality, and what makes your work different." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="serviceArea">Service Area</Label>
                  <Input id="serviceArea" name="serviceArea" defaultValue={user.serviceArea || ""} placeholder="e.g. Inner West Sydney" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input id="hourlyRate" name="hourlyRate" type="number" defaultValue={user.hourlyRate || ""} placeholder="95" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="yearsExperience">Years Experience</Label>
                  <Input id="yearsExperience" name="yearsExperience" type="number" defaultValue={user.yearsExperience || ""} placeholder="10" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-100">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="isPublic" className="text-sm text-zinc-700">
                  List my profile publicly on 48co marketplace (free, never charged)
                </label>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Profile
        </Button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
      </div>
    </form>
  );
}
