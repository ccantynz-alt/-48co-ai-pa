"use client";
import { useState, useEffect } from "react";
import { Plus, Award, AlertTriangle, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, daysUntil } from "@/lib/utils";

interface License {
  id: string;
  type: string;
  name: string;
  number: string | null;
  issuedBy: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  status: string;
}

const LICENSE_TYPES = [
  "Electrical Licence",
  "Plumbing Licence",
  "Builder Licence",
  "Gas Fitting",
  "Asbestos Removal",
  "Scaffolding",
  "Public Liability Insurance",
  "Workers Compensation",
  "White Card (Construction)",
  "Working with Children",
  "Police Check",
  "Other",
];

function statusIcon(s: string) {
  if (s === "ACTIVE") return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (s === "EXPIRING_SOON") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
}

function statusVariant(s: string): "success" | "warning" | "destructive" {
  if (s === "ACTIVE") return "success";
  if (s === "EXPIRING_SOON") return "warning";
  return "destructive";
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/licenses");
    if (res.ok) setLicenses(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.get("type"),
        name: form.get("name"),
        number: form.get("number"),
        issuedBy: form.get("issuedBy"),
        issuedAt: form.get("issuedAt"),
        expiresAt: form.get("expiresAt"),
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to save");
    } else {
      setDialogOpen(false);
      load();
    }
    setSaving(false);
  }

  async function deleteLicense(id: string) {
    if (!confirm("Delete this license?")) return;
    await fetch(`/api/licenses/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Licenses & Certifications</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {licenses.filter((l) => l.status === "EXPIRING_SOON" || l.status === "EXPIRED").length} need attention
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" /> Add License
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : licenses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
          <Award className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No licenses tracked</h3>
          <p className="text-zinc-400 text-sm mb-4">Add your trade licences, insurance, and certifications to get expiry alerts</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" /> Add First License
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {licenses.map((lic) => {
            const days = lic.expiresAt ? daysUntil(lic.expiresAt) : null;
            return (
              <div key={lic.id} className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-shrink-0">{statusIcon(lic.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-900">{lic.name}</p>
                    <Badge variant={statusVariant(lic.status)}>{lic.status.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <p className="text-xs text-zinc-400">{lic.type}</p>
                    {lic.number && <p className="text-xs text-zinc-400">#{lic.number}</p>}
                    {lic.issuedBy && <p className="text-xs text-zinc-400">Issued by {lic.issuedBy}</p>}
                    {lic.expiresAt && (
                      <p className={`text-xs font-medium ${days !== null && days < 0 ? "text-red-600" : days !== null && days <= 30 ? "text-amber-600" : "text-zinc-500"}`}>
                        {days !== null && days < 0 ? `Expired ${Math.abs(days)}d ago` : days !== null ? `Expires in ${days}d (${formatDate(lic.expiresAt)})` : formatDate(lic.expiresAt)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteLicense(lic.id)}
                  className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add License or Certification</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4 mt-2">
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div className="space-y-1.5">
              <Label htmlFor="l-type">Type</Label>
              <select name="type" required className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
                <option value="">Select type...</option>
                {LICENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-name">Name / Description</Label>
              <Input id="l-name" name="name" placeholder="e.g. NSW Electrical Contractor Licence" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="l-number">Licence Number</Label>
                <Input id="l-number" name="number" placeholder="EC12345" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-issuedBy">Issued By</Label>
                <Input id="l-issuedBy" name="issuedBy" placeholder="Fair Trading NSW" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-issuedAt">Issue Date</Label>
                <Input id="l-issuedAt" name="issuedAt" type="date" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-expiresAt">Expiry Date</Label>
                <Input id="l-expiresAt" name="expiresAt" type="date" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Add License
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
