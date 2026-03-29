'use client'

import { useState, useRef, useEffect } from 'react'
import Waveform from '../components/Waveform'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// ── Typing demo ─────────────────────────────────────────
function useTypingDemo() {
  const phrases = [
    {
      before: 'the defendant breached there fiduciary duty per say and we should of filed a motion in limine before the deposition',
      after: 'The defendant breached their fiduciary duty per se, and we should have filed a motion in limine before the deposition.',
      label: 'Legal Writing',
    },
    {
      before: 'Hey can u send me the report asap i need it for the meeting tmrw thx',
      after: 'Hey, can you send me the report ASAP? I need it for the meeting tomorrow. Thanks!',
      label: 'Email Polish',
    },
    {
      before: 'the total revenue was twelve million four hundred thousand dollars which is a increase of 8.3 percent year on year',
      after: 'The total revenue was $12,400,000, which is an increase of 8.3% year on year.',
      label: 'Financial Report',
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
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal(), r5 = useReveal(), r6 = useReveal(), r7 = useReveal()

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

      {/* ═══════════════════════════════════════════════
          HERO — Big, bold, confident
      ═══════════════════════════════════════════════ */}
      <section className="hero-gradient pt-36 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-10 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[13px] text-indigo-700 font-semibold tracking-tight">AI Grammar + Voice + Translation</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 animate-fade-up leading-[1.05]" style={{ animationDelay: '0.1s' }}>
            Everything you write,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">perfected by AI.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Grammar correction, voice-to-text, and real-time translation — in every app, on every device.
            <span className="block mt-2 text-slate-400">Built for lawyers, accountants, and professionals who write for a living.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <a href="/download" className="btn-primary text-base px-10">
              Download Free
            </a>
            <a href="/live" className="btn-secondary text-base px-10">
              Try in Browser
            </a>
          </div>

          {/* Demo Card — floating effect */}
          <div className="max-w-xl mx-auto animate-fade-up animate-float" style={{ animationDelay: '0.4s' }}>
            <div className="card overflow-hidden shadow-xl shadow-indigo-500/[0.06] border-indigo-100/50">
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-black/[0.04] bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/70" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="text-[12px] text-slate-400 font-mono font-medium">{typing.label}</span>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${typing.isTyping ? 'bg-red-400' : 'bg-emerald-400'}`} />
              </div>

              <div className="px-6 py-4 border-b border-black/[0.04]">
                <p className="text-[10px] text-red-400/80 uppercase tracking-widest mb-2 font-semibold">You wrote</p>
                <p className="text-[14px] text-slate-400 leading-relaxed line-through decoration-red-300/40">{typing.before}</p>
              </div>

              <div className="px-6 py-5 bg-gradient-to-br from-indigo-50/40 to-violet-50/30">
                <p className="text-[10px] text-indigo-500 uppercase tracking-widest mb-2 font-semibold">48co corrects to</p>
                <p className={`text-[15px] text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[48px] font-medium ${typing.isTyping ? 'animate-typing-cursor pr-0.5' : ''}`}>
                  {typing.after || <span className="text-slate-200">|</span>}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[13px] text-slate-400 mt-12 animate-fade-up font-medium" style={{ animationDelay: '0.5s' }}>
            Mac &middot; Windows &middot; iPhone &middot; Android &middot; Chrome &middot; Free to start
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════ */}
      <section className="py-16 px-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { stat: '60+', label: 'Languages' },
            { stat: '5', label: 'Platforms' },
            { stat: '<500ms', label: 'Streaming Latency' },
            { stat: '$12', label: '/month Pro' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-extrabold stat-number mb-1">{s.stat}</p>
              <p className="text-[13px] text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PLATFORMS
      ═══════════════════════════════════════════════ */}
      <section ref={r1} className="reveal py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Works everywhere you write</h2>
            <p className="text-base text-slate-400 max-w-lg mx-auto">One tool for every device and every app. No copy-paste. No switching windows.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { title: 'Desktop App', desc: 'Mac + Windows. Types into any app. 5MB, launches in 2 seconds.',
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
              { title: 'Chrome Extension', desc: 'Real-time grammar on every website. Gmail, Slack, Claude, ChatGPT.',
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/></svg> },
              { title: 'iPhone & iPad', desc: 'Custom keyboard with voice and grammar. Works in every iOS app.',
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
              { title: 'Android', desc: 'Material 3 keyboard with voice, grammar, and translation built in.',
                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-500"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
            ].map(p => (
              <div key={p.title} className="feature-card text-center">
                <div className="flex justify-center mb-5">{p.icon}</div>
                <h3 className="text-[15px] font-bold text-slate-800 mb-2">{p.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          KEY FEATURES — Bold cards with accent tops
      ═══════════════════════════════════════════════ */}
      <section ref={r2} className="reveal py-28 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">More than just grammar</h2>
            <p className="text-base text-slate-400 max-w-lg mx-auto">Six capabilities no competitor combines in one product.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'AI Grammar + Rewrite', desc: 'Catches every error — spelling, grammar, punctuation, word choice. Rewrites for tone: professional for contracts, casual for Slack. Powered by Claude AI.' },
              { title: 'Voice-to-Text', desc: 'Press a hotkey, speak naturally, get perfect text. Three engines: Web Speech (free), Whisper (accurate), Deepgram Nova-3 (real-time streaming).' },
              { title: 'Real-time Translation', desc: 'Speak in one language, text appears in another. 60+ languages including Te Reo Māori. Domain-aware for legal, medical, and finance.' },
              { title: 'Custom Vocabulary', desc: 'Add industry terms the AI never gets wrong. "per se" not "per say". "fiduciary" not "fudiciary". Perfect for law, medicine, and accounting.' },
              { title: 'Offline Mode', desc: 'Local Whisper model runs entirely on your device. Zero data leaves your computer. Audit-ready for attorney-client privilege.' },
              { title: 'Number Dictation', desc: '"twelve million four hundred fifty-three thousand dollars" becomes $12,453,000. Currency-aware: NZD, USD, GBP, EUR.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <h3 className="text-[16px] font-bold text-slate-800 mb-3">{f.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          BEFORE / AFTER — Side by side
      ═══════════════════════════════════════════════ */}
      <section ref={r3} className="reveal py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">See the difference</h2>
            <p className="text-base text-slate-400">Real examples — including legal and financial writing.</p>
          </div>

          <div className="space-y-5">
            {[
              { before: 'hey can u send me the report i need it for tmrw thx', after: 'Hey, can you send me the report? I need it for tomorrow. Thanks!', tag: 'Email' },
              { before: 'the defendant breached there fiduciary duty per say and we should of filed a motion in limine before the deposition', after: 'The defendant breached their fiduciary duty per se, and we should have filed a motion in limine before the deposition.', tag: 'Legal' },
              { before: 'the total revenue was twelve million four hundred thousand which is a increase of 8.3 percent year on year', after: 'The total revenue was $12,400,000, an increase of 8.3% year on year.', tag: 'Finance' },
            ].map((ex, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="px-5 py-2 border-b border-slate-100 bg-slate-50/50">
                  <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">{ex.tag}</span>
                </div>
                <div className="grid md:grid-cols-2">
                  <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100">
                    <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2 font-bold">Before</p>
                    <p className="text-[14px] text-slate-400 leading-relaxed">{ex.before}</p>
                  </div>
                  <div className="p-6 bg-emerald-50/30">
                    <p className="text-[10px] text-emerald-600 uppercase tracking-wider mb-2 font-bold">After 48co</p>
                    <p className="text-[14px] text-slate-800 leading-relaxed font-medium">{ex.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TRANSLATION SHOWCASE
      ═══════════════════════════════════════════════ */}
      <section ref={r4} className="reveal py-28 px-4 bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm mb-8">
            <span className="text-[13px] text-indigo-700 font-semibold">Live Translation</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Speak English. Text appears in any language.</h2>
          <p className="text-base text-slate-400 mb-14 max-w-lg mx-auto">Real-time translation while you dictate. Domain-aware for legal, medical, and finance terminology.</p>

          <div className="card overflow-hidden max-w-lg mx-auto shadow-xl shadow-indigo-500/[0.06]">
            <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <span className="text-[12px] text-slate-500 font-mono font-medium">English &rarr; Spanish (Legal)</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] text-emerald-600 font-medium">Live</span>
              </span>
            </div>
            <div className="px-6 py-4 border-b border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-semibold">You speak</p>
              <p className="text-[14px] text-slate-500 leading-relaxed italic">&ldquo;The defendant breached the fiduciary duty owed to the plaintiff under section twelve of the contract.&rdquo;</p>
            </div>
            <div className="px-6 py-5 bg-gradient-to-br from-indigo-50/40 to-violet-50/30">
              <p className="text-[10px] text-indigo-500 uppercase tracking-widest mb-2 font-semibold">48co translates</p>
              <p className="text-[15px] text-slate-800 leading-relaxed font-medium">&ldquo;El demandado incumplió el deber fiduciario adeudado al demandante en virtud del artículo doce del contrato.&rdquo;</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-10">
            {['English','Spanish','French','German','Japanese','Chinese','Te Reo Māori','Korean','Arabic','Hindi','+ 50 more'].map(l => (
              <span key={l} className="text-[12px] px-4 py-1.5 rounded-full bg-white border border-slate-100 text-slate-400 font-medium shadow-sm">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          LIVE DEMO
      ═══════════════════════════════════════════════ */}
      <section ref={r5} className="reveal py-28 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Try voice-to-text now</h2>
          <p className="text-base text-slate-400 mb-12">Click the mic and speak. Runs entirely in your browser.</p>

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

      {/* ═══════════════════════════════════════════════
          TRUST / SECURITY
      ═══════════════════════════════════════════════ */}
      <section ref={r6} className="reveal py-24 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for professionals who handle sensitive data</h2>
            <p className="text-slate-400 text-base">Lawyers, accountants, and doctors trust 48co with their most confidential work.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Offline mode', desc: 'Run everything on your device. Zero data leaves your computer. Audit-ready for attorney-client privilege.',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> },
              { title: 'Encrypted everywhere', desc: 'TLS 1.3 in transit. We never store your text, voice, or documents. Your API keys stay on your device.',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { title: 'Your data, your control', desc: 'Clear privacy policy. No data selling. No model training on your content. Delete your account and all data anytime.',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
            ].map(t => (
              <div key={t.title} className="text-center">
                <div className="flex justify-center mb-4">{t.icon}</div>
                <h3 className="text-[16px] font-bold text-white mb-2">{t.title}</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════ */}
      <section ref={r7} className="reveal py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, honest pricing</h2>
          <p className="text-base text-slate-400 mb-12">Free to start. No credit card needed.</p>

          <div className="grid md:grid-cols-3 gap-5 mb-12">
            {[
              { name: 'Free', price: '$0', period: 'forever', desc: '10 corrections/day, 60 min voice/month', highlight: false },
              { name: 'Pro', price: '$12', period: '/month', desc: 'Unlimited everything. Offline mode. Translation.', highlight: true },
              { name: 'Business', price: '$29', period: '/month', desc: 'Up to 10 users. That\'s $2.90 each.', highlight: false },
            ].map(p => (
              <div key={p.name} className={`rounded-2xl p-8 text-center transition-all ${p.highlight ? 'bg-gradient-to-b from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20 scale-105' : 'bg-white border border-slate-200'}`}>
                <p className={`text-[14px] font-semibold mb-3 ${p.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{p.name}</p>
                <p className={`text-4xl font-extrabold mb-1 ${p.highlight ? 'text-white' : 'text-slate-900'}`}>{p.price}<span className={`text-lg font-normal ${p.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{p.period}</span></p>
                <p className={`text-[13px] mt-3 ${p.highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{p.desc}</p>
              </div>
            ))}
          </div>

          <a href="/pricing" className="text-[14px] text-indigo-600 hover:text-indigo-500 font-semibold transition-colors">
            See full pricing &amp; comparison &rarr;
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════ */}
      <section className="py-28 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Never send a badly<br />written message again.
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
            AI grammar, voice-to-text, and translation — on every device, in every app. Free to start.
          </p>
          <a href="/download" className="btn-primary text-base px-12 py-4">
            Download 48co Free
          </a>
          <p className="text-[13px] text-slate-300 mt-6 font-medium">Mac + Windows + iPhone + Android + Chrome. No credit card required.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
