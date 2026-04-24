'use client';

import Link from 'next/link';

const problems = [
  { pain: 'No memory', fix: 'Every session starts fresh. You explain everything again.' },
  { pain: 'One repo at a time', fix: 'Can\'t cross-reference another project while building.' },
  { pain: 'Model goes rogue', fix: 'Opus undoes your fixes and rewrites working code.' },
  { pain: 'No project structure', fix: 'All sessions are ephemeral. Nothing is organised.' },
];

const features = [
  {
    icon: '🧠',
    title: 'Persistent Memory',
    desc: 'Every decision, every file, every architectural choice is remembered. Pick up exactly where you left off — days later.',
  },
  {
    icon: '📦',
    title: 'Multi-Repo Access',
    desc: 'Connect all your repos. Working on Project A? Pull context from Project B without switching tools or pasting code.',
  },
  {
    icon: '⚡',
    title: 'Smart Model Routing',
    desc: 'Haiku for fast questions. Sonnet for reliable coding. Opus only when the problem demands it. Never waste tokens.',
  },
  {
    icon: '🗂',
    title: 'Project Workspaces',
    desc: 'Every project has its own memory, repos, and conversation history. Clean separation. No cross-contamination.',
  },
  {
    icon: '🔒',
    title: 'Repo Access Control',
    desc: 'Connect repos with a personal access token. Revoke any time. Your code stays yours.',
  },
  {
    icon: '🔄',
    title: 'Auto-Summarisation',
    desc: 'After every conversation, the AI extracts what matters and saves it to memory. You never have to manage context manually.',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xl font-black gradient-text">Cortex</span>
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
          The AI coding platform with memory
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Build with AI that<br />
          <span className="gradient-text">never forgets.</span>
        </h1>

        <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
          Every project. Every decision. Every line of context — remembered across every session.
          Connect your repos, chat with your codebase, and pick up exactly where you left off.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <button className="px-8 py-3 rounded-xl font-bold text-white text-lg" style={{ background: 'var(--primary)' }}>
              Start building →
            </button>
          </Link>
          <Link href="/login">
            <button className="px-8 py-3 rounded-xl font-bold text-lg border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              Sign in
            </button>
          </Link>
        </div>
      </section>

      {/* Pain points */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-bold text-sm" style={{ color: 'var(--muted)' }}>WHY EXISTING TOOLS FAIL</h2>
          </div>
          {problems.map((p, i) => (
            <div key={i} className="flex items-start gap-4 px-6 py-4 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <span className="text-red-400 text-lg flex-shrink-0">✗</span>
              <div>
                <span className="font-bold text-sm">{p.pain} — </span>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>{p.fix}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-black text-center mb-10">Everything you needed. Finally built.</h2>
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
          <h2 className="text-3xl font-black mb-4">Stop starting from scratch.</h2>
          <p className="mb-6" style={{ color: 'var(--muted)' }}>
            One platform. Every project. Full memory. Built for developers who ship.
          </p>
          <Link href="/register">
            <button className="px-8 py-3 rounded-xl font-bold text-white text-lg" style={{ background: 'var(--primary)' }}>
              Create your workspace →
            </button>
          </Link>
        </div>
      </section>

      <footer className="border-t px-6 py-8 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
        <p>Cortex — Built in New Zealand 🇳🇿</p>
      </footer>
    </main>
  );
}
