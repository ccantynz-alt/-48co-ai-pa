'use client'

import { useState, useRef, useEffect } from 'react'
import Waveform from '../components/Waveform'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// ── Typing demo — shows AI rewrite in action ─────────────
function useTypingDemo() {
  const phrases = [
    {
      before: 'the defendant breached there fiduciary duty per say and we should of filed a motion in limine before the deposition',
      after: 'The defendant breached their fiduciary duty per se, and we should have filed a motion in limine before the deposition.',
      label: 'Legal Writing',
    },
    {
      before: 'hey can u send me the report i need it for the board meeting tmrw and make sure the numbers add up thx',
      after: 'Hi, can you send me the report? I need it for the board meeting tomorrow. Please ensure the figures reconcile. Thanks.',
      label: 'Professional Email',
    },
    {
      before: 'the patients vitals are stable and there responding well to the new dosage we should of adjusted sooner',
      after: 'The patient\'s vitals are stable and they\'re responding well to the new dosage. We should have adjusted sooner.',
      label: 'Medical Notes',
    },
    {
      before: 'pursuant to section 12 of the agreement the indemnification clause should of covered consequential damages but it dont',
      after: 'Pursuant to Section 12 of the agreement, the indemnification clause should have covered consequential damages, but it does not.',
      label: 'Contract Review',
    },
  ]

  const [idx, setIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [phase, setPhase] = useState('typing')
  const phrase = phrases[idx]

  useEffect(() => {
    if (phase === 'typing' && charIdx < phrase.after.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), 22 + Math.random() * 12)
      return () => clearTimeout(t)
    }
    if (phase === 'typing' && charIdx >= phrase.after.length) {
      setPhase('pause')
      const t = setTimeout(() => {
        setPhase('next')
        setTimeout(() => { setIdx(i => (i + 1) % phrases.length); setCharIdx(0); setPhase('typing') }, 400)
      }, 3000)
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

      {/* ── HERO — Dark, commanding, professional ──────── */}
      <section className="bg-navy-950 pt-36 pb-24 px-4 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 via-transparent to-navy-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-500/[0.03] rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto text-center relative z-10">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-10 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
            <span className="text-[12px] text-white/60 font-medium">AI Grammar + Voice-to-Text + Translation</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Professional writing,
            <br />
            <span className="text-gold-400">perfected by AI.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            AI grammar correction, voice-to-text dictation, and real-time translation — built for lawyers, accountants, and medical professionals.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <a href="/download" className="px-8 py-3.5 rounded-lg bg-white text-navy-900 text-[15px] font-semibold transition-all hover:bg-gray-100 shadow-lg shadow-black/20">
              Download Free
            </a>
            <a href="/live" className="px-8 py-3.5 rounded-lg border border-white/15 text-white/70 text-[15px] font-medium hover:border-white/25 hover:text-white transition-all">
              Try in Browser
            </a>
          </div>

          {/* ── Demo Card ──────────────────────── */}
          <div className="max-w-lg mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-navy-900/80 backdrop-blur-sm shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                  </div>
                  <span className="text-[11px] text-white/30 ml-2 font-mono">{typing.label}</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${typing.isTyping ? 'bg-gold-400' : 'bg-emerald-400'}`} />
              </div>

              <div className="px-5 py-3 border-b border-white/[0.06]">
                <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1.5">Dictated</p>
                <p className="text-[13px] text-white/35 leading-relaxed line-through decoration-red-400/30">{typing.before}</p>
              </div>

              <div className="px-5 py-4 bg-white/[0.03]">
                <p className="text-[10px] text-gold-400/60 uppercase tracking-wider mb-1.5">48co corrects to</p>
                <p className={`text-[14px] text-white/90 leading-relaxed whitespace-pre-wrap min-h-[44px] ${typing.isTyping ? 'animate-typing-cursor pr-0.5' : ''}`}>
                  {typing.after || <span className="text-white/15">|</span>}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[12px] text-white/25 mt-10 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            Mac &middot; Windows &middot; iPhone &middot; Android &middot; Chrome Extension &middot; Free to start
          </p>
        </div>
      </section>

      {/* ── TRUSTED BY PROFESSIONALS ──────────────────── */}
      <section className="py-16 px-4 border-b border-black/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[12px] text-gray-400 uppercase tracking-widest font-medium mb-8">Built for professionals who demand precision</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {['Law Firms', 'Accounting Practices', 'Medical Clinics', 'Executive Teams', 'Consulting Firms'].map(t => (
              <span key={t} className="text-[14px] text-gray-300 font-medium">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKS EVERYWHERE ───────────────────────── */}
      <section ref={r1} className="reveal py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">One tool, every device</h2>
            <p className="text-[15px] text-gray-500 max-w-lg mx-auto">Works wherever you write. Desktop, browser, phone — your AI assistant follows you.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: 'Desktop App', desc: 'Mac + Windows. Types into any application with a global hotkey. Under 10MB.', status: 'Available',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-navy-700"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
              { title: 'Chrome Extension', desc: 'Real-time grammar on every website. Gmail, Slack, Google Docs, and more.', status: 'Available',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-navy-700"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg> },
              { title: 'iPhone & iPad', desc: 'Custom keyboard with voice dictation and grammar. Works system-wide in every app.', status: 'Available',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-navy-700"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
              { title: 'Android', desc: 'Material Design keyboard with voice, grammar, and translation built in.', status: 'Available',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-navy-700"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
            ].map((p) => (
              <div key={p.title} className="card p-6 text-center">
                <div className="flex justify-center mb-4">{p.icon}</div>
                <h3 className="text-[14px] font-semibold text-navy-900 mb-1.5">{p.title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{p.desc}</p>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES ──────────────────────────── */}
      <section ref={r2} className="reveal py-24 px-4 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">Built for precision work</h2>
            <p className="text-[15px] text-gray-500 max-w-lg mx-auto">Every feature designed for professionals who can&apos;t afford mistakes in their writing.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'AI Grammar & Rewrite', desc: 'Catches every error — spelling, grammar, punctuation, word choice. Adjusts tone for contracts, emails, or clinical notes. Powered by Claude AI.', icon: '01' },
              { title: 'Voice-to-Text Dictation', desc: 'Press a hotkey, speak naturally, get polished text. Choose cloud (Whisper) for accuracy or local processing for complete privacy.', icon: '02' },
              { title: 'Real-Time Translation', desc: 'Speak in one language, text appears in another. 200+ languages. Domain-aware for legal, medical, and financial terminology.', icon: '03' },
              { title: 'Custom Vocabulary', desc: 'Add industry terms the AI never gets wrong. "Per se" not "per say". "Fiduciary" not "fudiciary". Essential for specialist writing.', icon: '04' },
              { title: 'Offline & Private', desc: 'Local Whisper model runs entirely on your device. Zero data leaves your computer. Audit-ready for attorney-client privilege.', icon: '05' },
              { title: 'Number Dictation', desc: '"Twelve million four hundred fifty-three thousand dollars" becomes $12,453,000. Currency-aware: NZD, USD, GBP, EUR.', icon: '06' },
            ].map((f) => (
              <div key={f.title} className="card p-6">
                <span className="text-[11px] font-bold text-gold-500 mb-3 block">{f.icon}</span>
                <h3 className="text-[15px] font-semibold text-navy-900 mb-2">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE/AFTER ──────────────────────────── */}
      <section ref={r3} className="reveal py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">See the difference</h2>
            <p className="text-[15px] text-gray-500">Real examples from legal, medical, and business writing.</p>
          </div>

          <div className="space-y-4">
            {[
              { context: 'Legal Brief', before: 'the defendant breached there fiduciary duty per say and we should of filed a motion in limine before the deposition', after: 'The defendant breached their fiduciary duty per se, and we should have filed a motion in limine before the deposition.' },
              { context: 'Client Email', before: 'hey can u send me the report i need it for the board meeting tmrw and make sure the numbers add up thx', after: 'Hi, can you send me the report? I need it for the board meeting tomorrow. Please ensure the figures reconcile. Thanks.' },
              { context: 'Medical Notes', before: 'the patients vitals are stable and there responding well to the new dosage we should of adjusted sooner', after: 'The patient\'s vitals are stable and they\'re responding well to the new dosage. We should have adjusted sooner.' },
            ].map((ex, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="px-5 py-2 border-b border-black/[0.04] bg-[#FAFAF8]">
                  <span className="text-[10px] font-semibold text-navy-600 uppercase tracking-wider">{ex.context}</span>
                </div>
                <div className="grid md:grid-cols-2">
                  <div className="p-5 border-b md:border-b-0 md:border-r border-black/[0.04]">
                    <p className="text-[10px] text-red-400/80 uppercase tracking-wider mb-2 font-medium">Before</p>
                    <p className="text-[13px] text-gray-400 leading-relaxed">{ex.before}</p>
                  </div>
                  <div className="p-5 bg-emerald-50/30">
                    <p className="text-[10px] text-emerald-600 uppercase tracking-wider mb-2 font-medium">After 48co</p>
                    <p className="text-[13px] text-navy-900 leading-relaxed">{ex.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ─────────────────────────────── */}
      <section ref={r4} className="reveal py-24 px-4 bg-[#FAFAF8]">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">Try voice-to-text now</h2>
          <p className="text-[15px] text-gray-500 mb-10">Click the mic and speak. Runs in your browser — no download required.</p>

          <div className="card overflow-hidden shadow-lg shadow-black/[0.03]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.04]">
              <span className="text-[12px] font-medium text-gray-600">Live Demo</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${
                demoStatus === 'recording' ? 'border-red-200 text-red-500 bg-red-50' :
                demoStatus === 'done' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                'border-gray-200 text-gray-400'
              }`}>
                {demoStatus === 'recording' ? 'Listening...' : demoStatus === 'done' ? 'Done' : 'Ready'}
              </span>
            </div>

            <div className="py-4 border-b border-black/[0.04] bg-navy-950">
              <Waveform isRecording={demoStatus === 'recording'} />
            </div>

            {demoTranscript && (
              <div className="px-5 py-3 border-b border-black/[0.04] bg-navy-50/30">
                <p className="text-[13px] text-navy-900 leading-relaxed">{demoTranscript}</p>
              </div>
            )}

            <div className="py-8 flex flex-col items-center gap-3">
              <button
                onClick={handleDemoClick}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                  demoStatus === 'recording' ? 'border-red-400 bg-red-50 shadow-[0_0_20px_rgba(220,38,38,0.12)]' :
                  demoStatus === 'done' ? 'border-emerald-400 bg-emerald-50' :
                  'border-navy-200 bg-navy-50 hover:border-navy-300'
                }`}
              >
                {demoStatus === 'recording' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5"><path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"/></svg>
                ) : demoStatus === 'done' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e3554" strokeWidth="1.5"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="21" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
                )}
              </button>
              <span className={`text-[12px] font-medium ${
                demoStatus === 'recording' ? 'text-red-500' : demoStatus === 'done' ? 'text-emerald-600' : 'text-gray-400'
              }`}>
                {demoStatus === 'recording' ? 'Click to stop' : demoStatus === 'done' ? 'Done' : 'Click to try'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── REAL-TIME TRANSLATION ────────────────── */}
      <section ref={r5} className="reveal py-24 px-4 bg-navy-950">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-8">
            <span className="text-[12px] text-gold-400 font-medium">Real-Time Translation</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Speak English. Text appears in any language.</h2>
          <p className="text-[15px] text-white/50 mb-12 max-w-lg mx-auto">200+ languages with domain-aware terminology for legal, medical, and financial contexts.</p>

          <div className="card-dark overflow-hidden max-w-md mx-auto">
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-white/30 font-mono">English &rarr; Spanish (Legal)</span>
              <span className="w-2 h-2 rounded-full bg-gold-400" />
            </div>
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1.5">You speak</p>
              <p className="text-[13px] text-white/50 leading-relaxed">&ldquo;The defendant breached the fiduciary duty owed to the plaintiff under section twelve of the contract.&rdquo;</p>
            </div>
            <div className="px-5 py-4 bg-white/[0.03]">
              <p className="text-[10px] text-gold-400/60 uppercase tracking-wider mb-1.5">48co translates</p>
              <p className="text-[14px] text-white/90 leading-relaxed">&ldquo;El demandado incumplió el deber fiduciario adeudado al demandante en virtud del artículo doce del contrato.&rdquo;</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-10">
            {['English','Spanish','French','German','Japanese','Chinese','Te Reo Māori','Korean','Arabic','Hindi','+ 190 more'].map(l => (
              <span key={l} className="text-[11px] px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / SECURITY ─────────────────────── */}
      <section ref={r6} className="reveal py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">Built for confidential work</h2>
            <p className="text-[15px] text-gray-500">Your clients trust you with their most sensitive information. You can trust us with yours.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e3554" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <h3 className="text-[15px] font-semibold text-navy-900 mb-2">Offline mode</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">Run everything on your device. Zero data leaves your computer. Audit-ready for attorney-client privilege and HIPAA compliance.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e3554" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-[15px] font-semibold text-navy-900 mb-2">End-to-end encryption</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">All data encrypted with TLS 1.3. We never store your text, voice recordings, or documents on our servers.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e3554" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3 className="text-[15px] font-semibold text-navy-900 mb-2">Your data stays yours</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">Clear, plain-English privacy policy. We don&apos;t sell your data, train on it, or share it. Ever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ────────────────────────── */}
      <section className="py-24 px-4 bg-[#FAFAF8]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">Straightforward pricing</h2>
          <p className="text-[15px] text-gray-500 mb-12">Free to start. No credit card needed. Upgrade when you need unlimited AI.</p>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { name: 'Free', price: '$0', desc: 'Basic dictation and grammar', highlight: false },
              { name: 'Pro', price: '$12/mo', desc: 'Unlimited AI grammar, voice, offline mode', highlight: true },
              { name: 'Business', price: '$29/mo', desc: 'Up to 10 users. Just $2.90 each.', highlight: false },
            ].map((p) => (
              <div key={p.name} className={`card p-6 ${p.highlight ? 'border-gold-300 bg-gold-50/20 shadow-md shadow-gold-500/5 ring-1 ring-gold-200' : ''}`}>
                <p className="text-[13px] font-semibold text-gray-500 mb-1">{p.name}</p>
                <p className="text-3xl font-bold text-navy-900 mb-2">{p.price}</p>
                <p className="text-[12px] text-gray-500">{p.desc}</p>
              </div>
            ))}
          </div>

          <a href="/pricing" className="text-[13px] text-navy-700 hover:text-navy-900 font-semibold transition-colors">
            See full pricing &rarr;
          </a>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="py-28 px-4 bg-navy-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
            Every word matters<br />in your profession.
          </h2>
          <p className="text-white/50 text-base mb-12 max-w-md mx-auto leading-relaxed">
            Join professionals who write with confidence. AI grammar, voice dictation, and translation — on every device.
          </p>
          <a href="/download" className="inline-block px-10 py-4 rounded-lg bg-white text-navy-900 text-[15px] font-semibold transition-all hover:bg-gray-100 shadow-lg shadow-black/20">
            Download 48co Free
          </a>
          <p className="text-[12px] text-white/25 mt-5">Mac + Windows + Chrome + iOS + Android. Free tier. No credit card.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
