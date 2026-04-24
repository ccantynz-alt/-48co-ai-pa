'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

interface QuoteData {
  title: string;
  description: string;
  line_items: LineItem[];
  notes: string;
  estimated_duration: string;
  valid_days: number;
}

interface SavedQuote {
  id: string;
  quote_number: string;
  title: string;
  total: number;
  status: string;
}

function QuoteGenerator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '');
  const [generating, setGenerating] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [savedQuote, setSavedQuote] = useState<SavedQuote | null>(null);
  const [error, setError] = useState('');
  const streamRef = useRef('');

  useEffect(() => {
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [searchParams]);

  async function generateQuote() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setStreamText('');
    setQuoteData(null);
    setSavedQuote(null);
    setError('');
    streamRef.current = '';

    try {
      const res = await fetch('/api/quotes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401) {
          router.push('/login?redirect=/quotes/new');
          return;
        }
        throw new Error(err.error || 'Failed to generate quote');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.chunk) {
            streamRef.current += data.chunk;
            setStreamText(streamRef.current);
          }

          if (data.done && data.quoteData) {
            setQuoteData(data.quoteData);
            setSavedQuote(data.quote);
          }

          if (data.error) {
            throw new Error(data.error);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  }

  const subtotal = quoteData?.line_items.reduce((s, i) => s + i.total, 0) ?? 0;
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/dashboard')} className="text-sm hover:text-orange-400 transition-colors" style={{ color: 'var(--muted)' }}>
          ← Dashboard
        </button>
        <h1 className="text-2xl font-black">New Quote</h1>
      </div>

      {/* Prompt input */}
      <div className="card p-6 mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
          Describe the job
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Supply and install new hot water cylinder, 180L, 2-bedroom house in Christchurch. Include labour, materials and disposal of old unit."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) generateQuote(); }}
          className="mb-4 resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>⌘ + Enter to generate</span>
          <button
            onClick={generateQuote}
            disabled={generating || !prompt.trim()}
            className="px-6 py-2 rounded-lg font-semibold text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: 'var(--primary)' }}
          >
            {generating ? 'Generating...' : 'Generate Quote ⚡'}
          </button>
        </div>
      </div>

      {/* Streaming indicator */}
      {generating && !quoteData && (
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-medium">AI is building your quote...</span>
          </div>
          <div className="text-xs font-mono overflow-hidden max-h-32 opacity-50" style={{ color: 'var(--muted)' }}>
            {streamText.slice(-200)}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-4 mb-6 border-red-500/30 bg-red-500/10">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Quote result */}
      {quoteData && (
        <div className="card p-6">
          {savedQuote && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                  {savedQuote.quote_number}
                </p>
                <h2 className="text-xl font-bold">{quoteData.title}</h2>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                Draft
              </span>
            </div>
          )}

          <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--muted)' }}>
            {quoteData.description}
          </p>

          {/* Line items */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="text-left" style={{ color: 'var(--muted)' }}>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Unit Price</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {quoteData.line_items.map((item, i) => (
                <tr key={i} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-right" style={{ color: 'var(--muted)' }}>
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 text-right" style={{ color: 'var(--muted)' }}>
                    ${item.unit_price.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-medium">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between text-sm" style={{ color: 'var(--muted)' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm" style={{ color: 'var(--muted)' }}>
              <span>GST (15%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2" style={{ borderColor: 'var(--border)' }}>
              <span>Total</span>
              <span className="gradient-text">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-4 pt-4 border-t text-xs space-y-1" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            {quoteData.estimated_duration && <p>Estimated duration: {quoteData.estimated_duration}</p>}
            {quoteData.notes && <p>Notes: {quoteData.notes}</p>}
            <p>Valid for {quoteData.valid_days} days</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button className="flex-1 py-2 rounded-lg font-semibold text-sm text-white" style={{ background: 'var(--primary)' }}>
              Send to Customer
            </button>
            <button className="py-2 px-4 rounded-lg text-sm border font-medium" style={{ borderColor: 'var(--border)' }}>
              Download PDF
            </button>
            <button
              onClick={() => {
                setQuoteData(null);
                setStreamText('');
              }}
              className="py-2 px-4 rounded-lg text-sm border font-medium"
              style={{ borderColor: 'var(--border)' }}
            >
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-6 max-w-4xl mx-auto">Loading...</div>}>
      <QuoteGenerator />
    </Suspense>
  );
}
