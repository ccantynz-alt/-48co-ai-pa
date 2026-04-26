"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, calcGST } from "@/lib/utils";

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export default function NewQuotePage() {
  const router = useRouter();
  const [aiDescription, setAiDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [clientName, setClientName] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [error, setError] = useState("");

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const gst = calcGST(subtotal);
  const total = subtotal + gst;

  async function generateWithAI() {
    if (!aiDescription.trim()) return;
    setAiLoading(true);
    setError("");
    const res = await fetch("/api/quotes/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: aiDescription }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "AI generation failed");
    } else {
      setTitle(data.title);
      setItems(data.items);
      setNotes(data.notes || "");
    }
    setAiLoading(false);
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unit: "each", unitPrice: 0 }]);
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  async function saveQuote() {
    if (!title || items.length === 0) {
      setError("Quote title and at least one item are required");
      return;
    }
    setSaving(true);
    setError("");

    let clientId: string | undefined;
    if (clientName.trim()) {
      const clientRes = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clientName }),
      });
      if (clientRes.ok) {
        const c = await clientRes.json();
        clientId = c.id;
      }
    }

    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, items, notes, clientId, aiGenerated: items.length > 0 && !!aiDescription }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to save");
      setSaving(false);
    } else {
      router.push(`/quotes/${data.id}`);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">New Quote</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Describe the job and let AI build it, or add items manually</p>
      </div>

      {/* AI Generator */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <CardTitle className="text-base text-orange-700">AI Quote Generator</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              placeholder="Describe the job in plain English, e.g. 'Replace hot water system in 3-bedroom home, includes drainage and new pressure valve' ..."
              value={aiDescription}
              onChange={(e) => setAiDescription(e.target.value)}
              rows={3}
              className="bg-white"
            />
            <Button onClick={generateWithAI} disabled={aiLoading || !aiDescription.trim()} variant="default">
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {aiLoading ? "Generating..." : "Generate Quote with AI"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-100">{error}</div>
      )}

      {/* Quote Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Quote Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Hot Water System Replacement" />
            </div>
            <div className="space-y-1.5">
              <Label>Client Name (optional)</Label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. John Smith" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-lg">
              <p className="text-zinc-400 text-sm">Use AI to generate items, or add them manually</p>
              <Button variant="ghost" size="sm" onClick={addItem} className="mt-2">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-zinc-400 uppercase px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1"></div>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(idx, "description", e.target.value)}
                      placeholder="Description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(idx, "unit", e.target.value)}
                      placeholder="each"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="text-right"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removeItem(idx)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="border-t border-zinc-100 pt-3 mt-4 space-y-1">
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>GST (10%)</span>
                  <span>{formatCurrency(gst)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-zinc-900 pt-1 border-t border-zinc-100">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes & Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, exclusions, special conditions..."
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={saveQuote} disabled={saving} className="px-8">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Quote
        </Button>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
