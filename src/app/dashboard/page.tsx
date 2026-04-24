'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Quote {
  id: string;
  quote_number: string;
  title: string;
  total: number;
  status: string;
  customer_name?: string;
  created_at: string;
}

const statusColor: Record<string, string> = {
  draft: 'bg-zinc-500/20 text-zinc-400',
  sent: 'bg-blue-500/20 text-blue-400',
  accepted: 'bg-green-500/20 text-green-400',
  declined: 'bg-red-500/20 text-red-400',
  expired: 'bg-yellow-500/20 text-yellow-400',
};

export default function DashboardPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quotes')
      .then((r) => {
        if (r.status === 401) { router.push('/login'); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) setQuotes(data.quotes || []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const totalValue = quotes.reduce((s, q) => s + Number(q.total), 0);
  const accepted = quotes.filter((q) => q.status === 'accepted').length;
  const pending = quotes.filter((q) => q.status === 'sent').length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 border-r flex flex-col" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="font-black text-lg gradient-text">TradeOS</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { label: 'Dashboard', href: '/dashboard', icon: '◉' },
            { label: 'New Quote', href: '/quotes/new', icon: '⚡' },
            { label: 'Quotes', href: '/quotes', icon: '📄' },
            { label: 'Jobs', href: '/jobs', icon: '🔧' },
            { label: 'Customers', href: '/customers', icon: '👥' },
            { label: 'Invoices', href: '/invoices', icon: '💳' },
            { label: 'Settings', href: '/settings', icon: '⚙️' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5 cursor-pointer" style={{ color: item.href === '/dashboard' ? 'var(--primary)' : 'var(--muted)' }}>
                <span>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: 'var(--muted)' }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-56 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black">Dashboard</h1>
          <Link href="/quotes/new">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white" style={{ background: 'var(--primary)' }}>
              ⚡ New Quote
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Quote Value', value: `$${totalValue.toLocaleString('en-NZ', { minimumFractionDigits: 0 })}`, sub: 'All time' },
            { label: 'Accepted', value: accepted, sub: 'Quotes accepted' },
            { label: 'Awaiting Response', value: pending, sub: 'Quotes sent' },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <p className="text-sm mb-1" style={{ color: 'var(--muted)' }}>{s.label}</p>
              <p className="text-3xl font-black gradient-text">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Recent quotes */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold">Recent Quotes</h2>
            <Link href="/quotes/new">
              <button className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                + New Quote
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>Loading...</div>
          ) : quotes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-4">⚡</p>
              <p className="font-semibold mb-2">No quotes yet</p>
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>Generate your first AI quote in 30 seconds</p>
              <Link href="/quotes/new">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--primary)' }}>
                  Create your first quote
                </button>
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ color: 'var(--muted)' }}>
                  <th className="text-left text-xs font-medium px-5 py-3">Quote</th>
                  <th className="text-left text-xs font-medium px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-medium px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium px-5 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="border-t hover:bg-white/5 cursor-pointer transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-sm">{q.title}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{q.quote_number}</p>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: 'var(--muted)' }}>
                      {q.customer_name || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[q.status] || statusColor.draft}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-sm">
                      ${Number(q.total).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
