"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NewJobDialog({ open, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        address: form.get("address"),
        status: "LEAD",
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to create job");
      setLoading(false);
    } else {
      onCreated();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
          <div className="space-y-1.5">
            <Label htmlFor="j-title">Job Title</Label>
            <Input id="j-title" name="title" placeholder="e.g. Kitchen reno — Smith residence" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="j-desc">Description</Label>
            <Textarea id="j-desc" name="description" placeholder="What's the job?" required rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="j-address">Address (optional)</Label>
            <Input id="j-address" name="address" placeholder="123 Main St, Sydney NSW" />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
