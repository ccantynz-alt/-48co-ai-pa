'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Waveform from '../components/Waveform'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// ── Typing demo — shows AI correction in action ─────────────
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
      label: 'Client Communication',
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
  const [demoStatus, setDemoStatus] = useState('idle')
  const [demoTranscript, setDemoTranscript] = useState('')
  const recognitionRef = useRef(null)
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal(), r5 = useReveal(), r6 = useReveal()

  useEffect(() => { return () => { if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null } } }, [])

  function handleDemoClick() {
    if (demoStatus === 'recording') { if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null } return }
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SR) { setDemoTranscript('Requires Chrome or Edge.'); setDemoStatus('done'); setTimeout(() => setDemoStatus('idle'), 3000); return }
    const rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = 'en'
    rec.onstart = () => { setDemoStatus('recording'); setDemoTranscript('') }
    rec.onresult = (e) => { let f = ''; for (let i = 0; i < e.results.length; i++) f += e.results[i][0].transcript; setDemoTranscript(f) }
    rec.onend = () => { setDemoStatus('done'); setTimeout(() => setDemoStatus('idle'), 2500) }
    rec.onerror = (e) => { if (e.error === 'not-allowed') setDemoTranscript('Mic access denied.'); else if (e.error === 'no-speech') setDemoTranscript('No speech detected.'); setDemoStatus('done'); setTimeout(() => setDemoStatus('idle'), 3000) }
    recognitionRef.current = rec; rec.start()
  }

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">

      <Nav />

      {/* ── HERO ────────────────────────────────────── */}
      <section className="hero-gradient pt-36 pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span className="text-[12px] text-indigo-600 font-medium">Trusted by legal and financial professionals</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Every word you write,
            <br />
            <span className="text-indigo-600">beyond reproach.</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            AI-powered grammar correction and voice-to-text built for professionals who cannot afford errors in client communications, contracts, and financial reports.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <a href="/download" className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[15px] font-medium transition-all shadow-sm">
              Start Free Trial
            </a>
            <a href="/security" className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 text-[15px] font-medium hover:border-gray-300 hover:text-gray-700 transition-all">
              View Security
            </a>
          </div>

          {/* ── Demo Card ──────────────────────── */}
          <div className="max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="card overflow-hidden shadow-lg shadow-black/[0.03]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.04] bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="text-[12px] text-slate-400 font-mono font-medium">{typing.label}</span>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${typing.isTyping ? 'bg-red-400' : 'bg-emerald-400'}`} />
              </div>

              <div className="px-5 py-3 border-b border-black/[0.04]">
                <p className="text-[10px] text-gray-300 uppercase tracking-wider mb-1.5">Original draft</p>
                <p className="text-[13px] text-gray-400 leading-relaxed line-through decoration-red-300/40">{typing.before}</p>
              </div>

              <div className="px-5 py-4 bg-indigo-50/30">
                <p className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1.5">AlecRae corrected</p>
                <p className={`text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[44px] ${typing.isTyping ? 'animate-typing-cursor pr-0.5' : ''}`}>
                  {typing.after || <span className="text-gray-200">|</span>}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[12px] text-gray-300 mt-8 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            Mac &middot; Windows &middot; Chrome Extension &middot; Free to start &middot; No credit card required
          </p>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────── */}
      <section className="py-8 px-4 border-b border-black/[0.04] bg-gray-50/50">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-[12px] text-gray-400">
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            256-bit AES encryption
          </span>
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            GDPR compliant
          </span>
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            SOC 2 in progress
          </span>
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            Full offline mode available
          </span>
        </div>
      </section>

      {/* ── WHO IT'S FOR ──────────────────────────── */}
      <section ref={r1} className="reveal py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Built for professionals who write for a living</h2>
            <p className="text-[15px] text-gray-400 max-w-lg mx-auto">Every profession has its own language. AlecRae learns yours and ensures every document is flawless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Legal Professionals',
                desc: 'Contracts, briefs, client correspondence, and court filings — corrected with precision. Confidentiality mode ensures privileged communications stay on your device.',
                features: ['Legal terminology recognition', 'Confidential offline mode', 'Citation formatting'],
              },
              {
                title: 'Accounting & Finance',
                desc: 'Financial reports, engagement letters, and tax correspondence — polished to the standard your clients expect. Perfect number dictation every time.',
                features: ['Financial term accuracy', 'Number formatting', 'Report template support'],
              },
              {
                title: 'Executive Communication',
                desc: 'Board reports, investor updates, and client proposals — every word carries weight. AlecRae ensures your writing matches your authority.',
                features: ['Tone adjustment by context', 'AI rewrite modes', 'Preserve My Voice'],
              },
            ].map((p) => (
              <div key={p.title} className="card p-7">
                <h3 className="text-[16px] font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-[13px] text-gray-400 leading-relaxed mb-5">{p.desc}</p>
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[12px] text-gray-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ─────────────────────────── */}
      <section ref={r2} className="reveal py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Comprehensive writing intelligence</h2>
            <p className="text-[15px] text-gray-400">More than a grammar checker. A complete writing assistant powered by the latest AI.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'AI Grammar Correction', desc: 'Powered by Claude AI — catches grammar, spelling, punctuation, and word choice errors that rule-based tools miss.', color: 'text-indigo-600 bg-indigo-50' },
              { title: 'Context-Aware Tone', desc: 'Automatically detects the context — formal for client emails, precise for contracts, concise for internal memos.', color: 'text-emerald-600 bg-emerald-50' },
              { title: 'Voice-to-Text Dictation', desc: 'Dictate at natural speaking speed with 99%+ accuracy. Ideal for lengthy documents, meeting notes, and correspondence.', color: 'text-blue-600 bg-blue-50' },
              { title: 'Preserve My Voice', desc: 'AlecRae learns your writing style from samples. Corrections match your tone — not generic corporate language.', color: 'text-amber-600 bg-amber-50' },
              { title: 'Confidential Offline Mode', desc: 'Full on-device processing. No data leaves your machine. Audit trail proves zero cloud transmission for compliance.', color: 'text-purple-600 bg-purple-50' },
              { title: 'Works Everywhere', desc: 'Desktop app, Chrome extension, and upcoming mobile keyboards. Types directly into any application on any device.', color: 'text-rose-600 bg-rose-50' },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <h3 className="text-[15px] font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE/AFTER ──────────────────────────── */}
      <section ref={r3} className="reveal py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Precision that matters</h2>
            <p className="text-[15px] text-gray-400">Real corrections from professional documents. Every detail caught.</p>
          </div>

          <div className="space-y-5">
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
                context: 'Client Correspondence',
              },
            ].map((ex, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="px-5 py-2 border-b border-black/[0.04] bg-gray-50/50">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{ex.context}</span>
                </div>
                <div className="grid md:grid-cols-2">
                  <div className="p-5 border-b md:border-b-0 md:border-r border-black/[0.04]">
                    <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2 font-medium">Draft</p>
                    <p className="text-[13px] text-gray-400 leading-relaxed">{ex.before}</p>
                  </div>
                  <div className="p-5 bg-green-50/30">
                    <p className="text-[10px] text-green-600 uppercase tracking-wider mb-2 font-medium">Corrected</p>
                    <p className="text-[13px] text-gray-800 leading-relaxed">{ex.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ─────────────────────────────── */}
      <section ref={r4} className="reveal py-24 px-4 bg-gray-50">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Try voice dictation</h2>
          <p className="text-[15px] text-gray-400 mb-10">Click the microphone and speak. Runs entirely in your browser.</p>

          <div className="card overflow-hidden shadow-xl shadow-black/[0.04]">
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/70">
              <span className="text-[13px] font-semibold text-slate-500">Live Demo</span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${
                demoStatus === 'recording' ? 'border-red-200 text-red-500 bg-red-50' :
                demoStatus === 'done' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                'border-slate-200 text-slate-400'
              }`}>
                {demoStatus === 'recording' ? 'Listening...' : demoStatus === 'done' ? 'Done' : 'Ready'}
              </span>
            </div>

            <div className="py-5 border-b border-slate-100">
              <Waveform isRecording={demoStatus === 'recording'} />
            </div>

            {demoTranscript && (
              <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/30">
                <p className="text-[14px] text-slate-700 leading-relaxed">{demoTranscript}</p>
              </div>
            )}

            <div className="py-10 flex flex-col items-center gap-4">
              <button
                onClick={handleDemoClick}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                  demoStatus === 'recording' ? 'border-red-400 bg-red-50 shadow-[0_0_24px_rgba(220,38,38,0.2)]' :
                  demoStatus === 'done' ? 'border-emerald-400 bg-emerald-50' :
                  'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {demoStatus === 'recording' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5"><path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"/></svg>
                ) : demoStatus === 'done' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.5"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="21" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
                )}
              </button>
              <span className={`text-[13px] font-medium ${
                demoStatus === 'recording' ? 'text-red-500' : demoStatus === 'done' ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {demoStatus === 'recording' ? 'Click to stop' : demoStatus === 'done' ? 'Done' : 'Click to try'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ────────────────────────── */}
      <section ref={r5} className="reveal py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Straightforward pricing</h2>
          <p className="text-[15px] text-gray-400 mb-10">Start free. Upgrade when your practice requires unlimited AI corrections.</p>

          <div className="grid md:grid-cols-3 gap-5 mb-12">
            {[
              { name: 'Free', price: '$0', desc: 'Basic grammar and 60 min voice/month', highlight: false },
              { name: 'Professional', price: '$12/mo', desc: 'Unlimited AI corrections, voice, and offline mode', highlight: true },
              { name: 'Firm', price: '$29/mo', desc: 'Up to 10 practitioners. $2.90 per seat.', highlight: false },
            ].map((p) => (
              <div key={p.name} className={`card p-6 ${p.highlight ? 'border-indigo-200 bg-indigo-50/30 shadow-md shadow-indigo-500/5' : ''}`}>
                <p className="text-[14px] font-semibold text-gray-600 mb-1">{p.name}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{p.price}</p>
                <p className="text-[12px] text-gray-400">{p.desc}</p>
              </div>
            ))}
          </div>

          <a href="/pricing" className="text-[13px] text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
            View full pricing and comparison &rarr;
          </a>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section ref={r6} className="reveal py-24 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your reputation depends on<br />every word you write.
          </h2>
          <p className="text-gray-400 text-[15px] mb-10 max-w-lg mx-auto leading-relaxed">
            Professionals across legal, accounting, and executive roles rely on AlecRae Voice to ensure flawless written communication. Start your free trial today.
          </p>
          <a href="/download" className="inline-block px-10 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[15px] font-medium transition-all shadow-sm">
            Start Free Trial
          </a>
          <p className="text-[12px] text-gray-300 mt-4">Mac + Windows + Chrome. 7-day Pro trial. No credit card required.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
