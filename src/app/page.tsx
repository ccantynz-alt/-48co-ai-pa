'use client';

import Link from 'next/link';
import { useState } from 'react';

const features = [
  {
    icon: '⚡',
    title: 'AI Quote in 30 Seconds',
    desc: 'Describe the job, get a professional quote instantly. Stop spending evenings on paperwork.',
  },
  {
    icon: '📄',
    title: 'One-Click Invoicing',
    desc: 'Turn any accepted quote into an invoice. Chase payments automatically.',
  },
  {
    icon: '📅',
    title: 'Job Scheduling',
    desc: 'Manage your jobs, subcontractors and team in one place. No more double-bookings.',
  },
  {
    icon: '💰',
    title: 'Get Paid Faster',
    desc: 'Online payments via Stripe. Customers pay on the spot, not 30 days later.',
  },
  {
    icon: '📊',
    title: 'Business Insights',
    desc: 'See exactly where your money is coming from, what jobs are most profitable.',
  },
  {
    icon: '🔒',
    title: 'Built for the Trade',
    desc: 'H&S docs, GST tracking, subcontractor management. Everything a tradie actually needs.',
  },
];

const trades = ['Builder', 'Plumber', 'Electrician', 'HVAC', 'Painter', 'Tiler', 'Landscaper', 'Roofer'];

export default function LandingPage() {
  const [demoPrompt, setDemoPrompt] = useState('');

  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xl font-bold gradient-text">TradeOS</span>
        <div className="flex gap-3">
          <Link href="/login">
            <button className="text-sm px-4 py-2 rounded-lg font-medium transition-colors hover:text-orange-400" style={{ color: 'var(--muted)' }}>
              Log in
            </button>
          </Link>
          <Link href="/register">
            <button className="text-sm px-4 py-2 rounded-lg font-semibold text-white" style={{ background: 'var(--primary)' }}>
              Start free
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-6 border" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--surface)' }}>
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Built by a tradie, for tradies
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Stop drowning in<br />
          <span className="gradient-text">paperwork.</span>
        </h1>

        <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
          You spend all day on the tools. The last thing you need is hours of quoting, invoicing
          and chasing payments. TradeOS handles all of it — with AI.
        </p>

        {/* Demo prompt */}
        <div className="max-w-xl mx-auto">
          <div className="flex gap-2 p-1 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <input
              type="text"
              placeholder='e.g. "Replace hot water cylinder, 2-bed house Auckland"'
              value={demoPrompt}
              onChange={(e) => setDemoPrompt(e.target.value)}
              className="flex-1 bg-transparent border-none px-3 py-2 text-sm outline-none"
              style={{ color: 'var(--foreground)' }}
            />
            <Link href={demoPrompt ? `/quotes/new?prompt=${encodeURIComponent(demoPrompt)}` : '/register'}>
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap" style={{ background: 'var(--primary)' }}>
                Generate quote →
              </button>
            </Link>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Free to try. No credit card required.</p>
        </div>

        {/* Trade pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {trades.map((t) => (
            <span key={t} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--surface)' }}>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <div className="card p-10">
          <h2 className="text-3xl font-black mb-4">Ready to get your evenings back?</h2>
          <p className="mb-6" style={{ color: 'var(--muted)' }}>
            Join tradespeople across NZ, AU, UK and the US who&apos;ve stopped drowning in admin.
          </p>
          <Link href="/register">
            <button className="px-8 py-3 rounded-lg font-bold text-white text-lg" style={{ background: 'var(--primary)' }}>
              Start free today →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
        <p>TradeOS — Built in New Zealand 🇳🇿 · For tradies everywhere</p>
      </footer>
    </main>
  );
}
