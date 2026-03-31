'use client'

import { useState, useRef, useEffect } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

function useTypingDemo() {
  const phrases = [
    {
      before: 'The defendant has failed to comply with there obligations under the contract and we beleive this constitutes a material breach',
      after: 'The defendant has failed to comply with their obligations under the contract, and we believe this constitutes a material breach.',
      label: 'Legal Writing',
    },
    {
      before: 'Revenue for the quater was $2.4M which is a increase of 12% compaired to the previous period however expenses have also rised',
      after: 'Revenue for the quarter was $2.4M, which is an increase of 12% compared to the previous period; however, expenses have also risen.',
      label: 'Financial Report',
    },
    {
      before: 'Please find attached the ammended engagement letter for your review we have updated the scope of services and the fee schedule accordingly',
      after: 'Please find attached the amended engagement letter for your review. We have updated the scope of services and the fee schedule accordingly.',
      label: 'Client Correspondence',
    },
  ]

  const [idx, setIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [phase, setPhase] = useState('typing')
  const phrase = phrases[idx]

  useEffect(() => {
    if (phase === 'typing' && charIdx < phrase.after.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), 18 + Math.random() * 10)
      return () => clearTimeout(t)
    }
    if (phase === 'typing' && charIdx >= phrase.after.length) {
      setPhase('pause')
      const t = setTimeout(() => {
        setPhase('next')
        setTimeout(() => { setIdx(i => (i + 1) % phrases.length); setCharIdx(0); setPhase('typing') }, 400)
      }, 3200)
      return () => clearTimeout(t)
    }
  }, [charIdx, phase, phrase.after.length, idx, phrases.length])

  return { before: phrase.before, after: phrase.after.slice(0, charIdx), label: phrase.label, isTyping: phase === 'typing' && charIdx < phrase.after.length }
}

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) el.classList.add('visible') }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

export default function LandingPage() {
  const typing = useTypingDemo()
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal(), r5 = useReveal()

  return (
    <main className="min-h-screen bg-navy-950 overflow-x-hidden">

      <Nav />

      {/* ── HERO ──────────────────────────────────── */}
      <section className="pt-44 pb-32 px-6 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_-5%,rgba(218,167,59,0.12),transparent_70%)]" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-white mb-6 animate-fade-up leading-[1.15]">
            Every word you write,
            <br />
            <span className="text-gold-400">beyond reproach.</span>
          </h1>

          <p className="text-[17px] text-white/60 max-w-lg mx-auto leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            AI-powered grammar correction and voice-to-text for lawyers, accountants, and executives who cannot afford errors.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20 animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <a href="/download" className="px-8 py-3.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-navy-950 text-[15px] font-semibold transition-all shadow-lg shadow-gold-400/20">
              Start Free Trial
            </a>
            <a href="/security" className="px-8 py-3.5 rounded-xl border border-white/20 text-white/60 text-[15px] font-medium hover:border-white/40 hover:text-white/80 transition-all">
              View Security
            </a>
          </div>

          {/* Demo Card */}
          <div className="max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.35s' }}>
            <div className="rounded-2xl overflow-hidden bg-navy-900 border border-white/10">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <span className="text-[11px] text-white/40 font-mono">{typing.label}</span>
                <span className={`w-2 h-2 rounded-full ${typing.isTyping ? 'bg-gold-400' : 'bg-white/30'}`} />
              </div>
              <div className="px-5 py-3 border-b border-white/10">
                <p className="text-[13px] text-white/35 leading-relaxed line-through decoration-white/20">{typing.before}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[14px] text-white/80 leading-relaxed whitespace-pre-wrap min-h-[44px]">
                  {typing.after || <span className="text-white/20">|</span>}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-white/30 mt-10 tracking-wide">
            Mac &middot; Windows &middot; Chrome &middot; Free to start
          </p>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────── */}
      <section className="py-5 px-6 md:px-8 border-y border-white/10">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-10 text-[11px] text-white/40 tracking-wide">
          <span>256-bit encryption</span>
          <span>GDPR compliant</span>
          <span>SOC 2 in progress</span>
          <span>Full offline mode</span>
        </div>
      </section>

      {/* ── WHO IT'S FOR ──────────────────────────── */}
      <section ref={r1} className="reveal py-28 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] text-gold-400 uppercase tracking-[0.2em] text-center mb-4">Built for precision</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-16">
            Professionals who write for a living
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: 'Legal',
                desc: 'Contracts, briefs, client correspondence, and court filings. Confidentiality mode for privileged work.',
              },
              {
                title: 'Accounting',
                desc: 'Financial reports, engagement letters, tax correspondence. Perfect number dictation every time.',
              },
              {
                title: 'Executive',
                desc: 'Board reports, investor updates, client proposals. Your writing matches your authority.',
              },
            ].map((p) => (
              <div key={p.title} className="rounded-xl border border-white/15 bg-navy-900 p-8">
                <h3 className="text-[15px] font-semibold text-white mb-3">{p.title}</h3>
                <p className="text-[13px] text-white/50 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ─────────────────────────── */}
      <section ref={r2} className="reveal py-28 px-6 md:px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] text-gold-400 uppercase tracking-[0.2em] text-center mb-4">Capabilities</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-16">
            Comprehensive writing intelligence
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'AI Grammar Correction', desc: 'Powered by Claude AI. Catches grammar, spelling, punctuation, and word choice errors that rule-based tools miss.' },
              { title: 'Voice-to-Text Dictation', desc: 'Dictate at natural speaking speed. 99%+ accuracy in 50+ languages. Cloud or fully offline.' },
              { title: 'Context-Aware Tone', desc: 'Formal for client emails. Precise for contracts. Concise for internal memos. Detected automatically.' },
              { title: 'Preserve My Voice', desc: 'Learns your writing style from samples. Corrections match your tone — not generic corporate language.' },
              { title: 'Confidential Offline Mode', desc: 'Full on-device processing. No data leaves your machine. Audit trail for compliance.' },
              { title: 'Every Platform', desc: 'Desktop app and Chrome extension. Mobile keyboards coming soon. Types directly into any application.' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-white/15 bg-navy-900 p-6">
                <h3 className="text-[14px] font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[13px] text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE/AFTER ──────────────────────────── */}
      <section ref={r3} className="reveal py-28 px-6 md:px-8 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] text-gold-400 uppercase tracking-[0.2em] text-center mb-4">Precision</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-16">
            Every detail caught
          </h2>

          <div className="space-y-4">
            {[
              {
                before: 'The parties here by agree to ammend the indemnification clause to include consequencial damages as outlined in the addendum',
                after: 'The parties hereby agree to amend the indemnification clause to include consequential damages, as outlined in the addendum.',
                context: 'Contract Amendment',
              },
              {
                before: 'Revenue for Q3 was effected by the aquisition which resulted in a one-time charge of $2.1M that was not forseen in the original forcast',
                after: 'Revenue for Q3 was affected by the acquisition, which resulted in a one-time charge of $2.1M that was not foreseen in the original forecast.',
                context: 'Financial Report',
              },
              {
                before: 'Dear Mr Thompson, Further to our discussion I am writing to confirm that we will procede with the engagment on the terms previously discussed',
                after: 'Dear Mr. Thompson, further to our discussion, I am writing to confirm that we will proceed with the engagement on the terms previously discussed.',
                context: 'Client Letter',
              },
            ].map((ex, i) => (
              <div key={i} className="rounded-xl border border-white/10 overflow-hidden bg-navy-900">
                <div className="px-5 py-2 border-b border-white/10">
                  <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{ex.context}</span>
                </div>
                <div className="grid md:grid-cols-2">
                  <div className="p-5 border-b md:border-b-0 md:border-r border-white/10">
                    <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2 font-medium">Before</p>
                    <p className="text-[13px] text-white/40 leading-relaxed">{ex.before}</p>
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] text-gold-400/70 uppercase tracking-wider mb-2 font-medium">After</p>
                    <p className="text-[13px] text-white/80 leading-relaxed">{ex.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────── */}
      <section ref={r4} className="reveal py-28 px-6 md:px-8 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] text-gold-400 uppercase tracking-[0.2em] mb-4">Pricing</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-16">Straightforward</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Free', price: '$0', desc: 'Basic grammar. 60 min voice/month.' },
              { name: 'Professional', price: '$12', period: '/mo', desc: 'Unlimited corrections, voice, offline mode.', highlight: true },
              { name: 'Firm', price: '$29', period: '/mo', desc: 'Up to 10 practitioners. $2.90 per seat.' },
            ].map((p) => (
              <div key={p.name} className={`rounded-xl border p-8 text-center ${
                p.highlight
                  ? 'border-gold-400/40 bg-gold-400/5 shadow-lg shadow-gold-400/10'
                  : 'border-white/15 bg-navy-900'
              }`}>
                <p className="text-[12px] text-white/50 font-medium mb-3">{p.name}</p>
                <p className="text-3xl font-bold text-white mb-1">{p.price}<span className="text-[14px] text-white/40 font-normal">{p.period || ''}</span></p>
                <p className="text-[12px] text-white/40 mt-3">{p.desc}</p>
              </div>
            ))}
          </div>

          <a href="/pricing" className="inline-block mt-8 text-[13px] text-white/50 hover:text-white/70 transition-colors">
            View full pricing &rarr;
          </a>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section ref={r5} className="reveal py-28 px-6 md:px-8 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">
            Your reputation depends on<br />every word you write.
          </h2>
          <p className="text-white/50 text-[15px] mb-10 max-w-md mx-auto leading-relaxed">
            Start your free trial today. No credit card required.
          </p>
          <a href="/download" className="inline-block px-10 py-3.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-navy-950 text-[15px] font-semibold transition-all shadow-lg shadow-gold-400/20">
            Get Started
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
