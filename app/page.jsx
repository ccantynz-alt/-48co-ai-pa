'use client'

import { useState, useRef, useEffect } from 'react'
import Waveform from '../components/Waveform'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

// ── Typing demo — shows AI rewrite in action ─────────────
function useTypingDemo() {
  const phrases = [
    {
      before: 'uh so like I think we should probly redo the the dashboard cos users are confused about where to click',
      after: 'I think we should redesign the dashboard — users are confused about where to click.',
      label: 'AI Grammar',
    },
    {
      before: 'Hey can u send me the report asap i need it for the meeting tmrw thx',
      after: 'Hey, can you send me the report ASAP? I need it for the meeting tomorrow. Thanks!',
      label: 'Email Polish',
    },
    {
      before: 'the function should take an array of numbers and return only the ones that are greater then 10',
      after: 'The function should take an array of numbers and return only the ones that are greater than 10.',
      label: 'Technical Writing',
    },
  ]

  const [idx, setIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [phase, setPhase] = useState('typing')
  const phrase = phrases[idx]

  useEffect(() => {
    if (phase === 'typing' && charIdx < phrase.after.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), 25 + Math.random() * 15)
      return () => clearTimeout(t)
    }
    if (phase === 'typing' && charIdx >= phrase.after.length) {
      setPhase('pause')
      const t = setTimeout(() => {
        setPhase('next')
        setTimeout(() => { setIdx(i => (i + 1) % phrases.length); setCharIdx(0); setPhase('typing') }, 400)
      }, 2800)
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
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal(), r4 = useReveal(), r5 = useReveal()

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
      <section className="hero-gradient pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span className="text-[12px] text-indigo-600 font-medium">AI Grammar + Voice-to-Text</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Everything you write,
            <br />
            <span className="text-indigo-600">perfected by AI.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            AI grammar, voice-to-text, and real-time translation — in every app, on every device. Built for lawyers, accountants, and professionals who write for a living.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <a href="/download" className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[15px] font-medium transition-all shadow-sm">
              Download Free
            </a>
            <a href="/live" className="px-8 py-3 rounded-xl border border-gray-200 text-gray-500 text-[15px] font-medium hover:border-gray-300 hover:text-gray-700 transition-all">
              Try in Browser
            </a>
          </div>

          {/* ── Demo Card ──────────────────────── */}
          <div className="max-w-lg mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="card overflow-hidden shadow-lg shadow-black/[0.03]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.04] bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <span className="text-[11px] text-gray-400 ml-2 font-mono">{typing.label}</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${typing.isTyping ? 'bg-red-400' : 'bg-green-400'}`} />
              </div>

              <div className="px-5 py-3 border-b border-black/[0.04]">
                <p className="text-[10px] text-gray-300 uppercase tracking-wider mb-1.5">You wrote</p>
                <p className="text-[13px] text-gray-400 leading-relaxed line-through decoration-red-300/40">{typing.before}</p>
              </div>

              <div className="px-5 py-4 bg-indigo-50/30">
                <p className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1.5">48co corrects to</p>
                <p className={`text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[44px] ${typing.isTyping ? 'animate-typing-cursor pr-0.5' : ''}`}>
                  {typing.after || <span className="text-gray-200">|</span>}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[12px] text-gray-300 mt-8 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            Mac &middot; Windows &middot; iPhone &middot; Android &middot; Chrome &middot; Free to start
          </p>
        </div>
      </section>

      {/* ── WORKS EVERYWHERE ───────────────────────── */}
      <section ref={r1} className="reveal py-24 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Works everywhere you write</h2>
            <p className="text-[15px] text-gray-400">One tool for every device and every app.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: 'Desktop App', desc: 'Mac + Windows. Types into any app with a global hotkey. 5MB, launches in under 2 seconds.', status: 'Available',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
              { title: 'Chrome Extension', desc: 'Real-time grammar on every website. Gmail, Slack, Claude, ChatGPT, Docs.', status: 'Available',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg> },
              { title: 'iPhone & iPad', desc: 'Custom keyboard with voice-to-text and grammar. Works in every app on your phone.', status: 'Available',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
              { title: 'Android', desc: 'Material Design keyboard with voice, grammar, and real-time translation built in.', status: 'Available',
                icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
            ].map((p) => (
              <div key={p.title} className="card p-6 text-center">
                <div className="flex justify-center mb-4">{p.icon}</div>
                <h3 className="text-[14px] font-semibold text-gray-800 mb-1.5">{p.title}</h3>
                <p className="text-[12px] text-gray-400 leading-relaxed mb-3">{p.desc}</p>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES ──────────────────────────── */}
      <section ref={r2} className="reveal py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">More than just grammar</h2>
            <p className="text-[15px] text-gray-400">AI that understands what you mean, not just what you wrote.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'AI Grammar + Rewrite', desc: 'Catches every error — spelling, grammar, punctuation, word choice. Rewrites for tone: professional for contracts, casual for Slack. Powered by Claude AI.', color: 'text-indigo-600 bg-indigo-50' },
              { title: 'Voice-to-Text', desc: 'Press a hotkey, speak naturally, get perfect text. Choose between Web Speech (free), Whisper (accurate), or Deepgram Nova-3 (real-time streaming).', color: 'text-blue-600 bg-blue-50' },
              { title: 'Real-time Translation', desc: 'Speak in one language, text appears in another. 60+ languages including Te Reo Māori. Domain-aware for legal, medical, and finance terminology.', color: 'text-emerald-600 bg-emerald-50' },
              { title: 'Custom Vocabulary', desc: 'Add industry terms the AI never gets wrong. "per se" not "per say". "fiduciary" not "fudiciary". Perfect for law, medicine, and accounting.', color: 'text-amber-600 bg-amber-50' },
              { title: 'Works Offline', desc: 'Local Whisper model runs entirely on your device. Zero data leaves your computer. Audit-ready for attorney-client privilege.', color: 'text-purple-600 bg-purple-50' },
              { title: 'Number Dictation', desc: '"twelve million four hundred fifty-three thousand dollars" becomes $12,453,000. Currency-aware: NZD, USD, GBP, EUR. Built for accountants.', color: 'text-rose-600 bg-rose-50' },
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
      <section ref={r3} className="reveal py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">See the difference</h2>
            <p className="text-[15px] text-gray-400">Real examples of 48co improving everyday writing.</p>
          </div>

          <div className="space-y-4">
            {[
              { before: 'hey can u send me the report i need it for tmrw thx', after: 'Hey, can you send me the report? I need it for tomorrow. Thanks!' },
              { before: 'i thinkt he main issue is that there server is not responding properly and we need too fix it asap', after: 'I think the main issue is that their server is not responding properly, and we need to fix it ASAP.' },
              { before: 'the defendant breached there fiduciary duty per say and we should of filed a motion in limine before the deposition', after: 'The defendant breached their fiduciary duty per se, and we should have filed a motion in limine before the deposition.' },
            ].map((ex, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="p-5 border-b md:border-b-0 md:border-r border-black/[0.04]">
                    <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2 font-medium">Before</p>
                    <p className="text-[13px] text-gray-400 leading-relaxed">{ex.before}</p>
                  </div>
                  <div className="p-5 bg-green-50/30">
                    <p className="text-[10px] text-green-600 uppercase tracking-wider mb-2 font-medium">After 48co</p>
                    <p className="text-[13px] text-gray-800 leading-relaxed">{ex.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ─────────────────────────────── */}
      <section ref={r4} className="reveal py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Try voice-to-text now</h2>
          <p className="text-[15px] text-gray-400 mb-10">Click the mic and speak. Runs in your browser.</p>

          <div className="card overflow-hidden shadow-lg shadow-black/[0.04]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.04] bg-gray-50/50">
              <span className="text-[12px] font-medium text-gray-500">Live Demo</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                demoStatus === 'recording' ? 'border-red-200 text-red-500 bg-red-50' :
                demoStatus === 'done' ? 'border-green-200 text-green-600 bg-green-50' :
                'border-gray-200 text-gray-400'
              }`}>
                {demoStatus === 'recording' ? 'Listening...' : demoStatus === 'done' ? 'Done' : 'Ready'}
              </span>
            </div>

            <div className="py-4 border-b border-black/[0.04]">
              <Waveform isRecording={demoStatus === 'recording'} />
            </div>

            {demoTranscript && (
              <div className="px-5 py-3 border-b border-black/[0.04] bg-indigo-50/30">
                <p className="text-[13px] text-gray-700 leading-relaxed">{demoTranscript}</p>
              </div>
            )}

            <div className="py-8 flex flex-col items-center gap-3">
              <button
                onClick={handleDemoClick}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                  demoStatus === 'recording' ? 'border-red-400 bg-red-50 shadow-[0_0_20px_rgba(220,38,38,0.15)]' :
                  demoStatus === 'done' ? 'border-green-400 bg-green-50' :
                  'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                {demoStatus === 'recording' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5"><path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"/></svg>
                ) : demoStatus === 'done' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="21" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
                )}
              </button>
              <span className={`text-[12px] ${
                demoStatus === 'recording' ? 'text-red-500' : demoStatus === 'done' ? 'text-green-600' : 'text-gray-400'
              }`}>
                {demoStatus === 'recording' ? 'Click to stop' : demoStatus === 'done' ? 'Done' : 'Click to try'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── REAL-TIME TRANSLATION ────────────────── */}
      <section className="py-24 px-4 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <span className="text-[12px] text-indigo-600 font-medium">New: Live Translation</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Speak English. Text appears in any language.</h2>
          <p className="text-[15px] text-gray-400 mb-12 max-w-lg mx-auto">Real-time translation while you dictate. 60+ languages including Te Reo Māori. Domain-aware for legal, medical, and finance.</p>

          <div className="card overflow-hidden max-w-md mx-auto shadow-lg shadow-black/[0.03]">
            <div className="px-5 py-3 border-b border-black/[0.04] bg-gray-50/50 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-mono">English → Spanish (Legal)</span>
              <span className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div className="px-5 py-3 border-b border-black/[0.04]">
              <p className="text-[10px] text-gray-300 uppercase tracking-wider mb-1.5">You speak</p>
              <p className="text-[13px] text-gray-500 leading-relaxed">&ldquo;The defendant breached the fiduciary duty owed to the plaintiff under section twelve of the contract.&rdquo;</p>
            </div>
            <div className="px-5 py-4 bg-indigo-50/30">
              <p className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1.5">48co translates</p>
              <p className="text-[14px] text-gray-800 leading-relaxed">&ldquo;El demandado incumplió el deber fiduciario adeudado al demandante en virtud del artículo doce del contrato.&rdquo;</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['English','Spanish','French','German','Japanese','Chinese','Te Reo Māori','Korean','Arabic','Hindi','+ 50 more'].map(l => (
              <span key={l} className="text-[11px] px-3 py-1 rounded-full bg-white border border-gray-100 text-gray-400">{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST / SECURITY ─────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Built for professionals who handle sensitive data</h2>
            <p className="text-[14px] text-gray-400">Lawyers, accountants, and doctors trust 48co with their work.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-5">
              <div className="flex justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-800 mb-1">Offline mode</h3>
              <p className="text-[12px] text-gray-400 leading-relaxed">Run everything on your device. Zero data leaves your computer. Audit-ready for attorney-client privilege.</p>
            </div>
            <div className="text-center p-5">
              <div className="flex justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-800 mb-1">Encrypted in transit</h3>
              <p className="text-[12px] text-gray-400 leading-relaxed">All data encrypted with TLS 1.3. We never store your text, voice recordings, or documents on our servers.</p>
            </div>
            <div className="text-center p-5">
              <div className="flex justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-800 mb-1">Privacy policy</h3>
              <p className="text-[12px] text-gray-400 leading-relaxed">Clear, plain-English privacy policy. Your data is yours. We don&apos;t sell it, train on it, or share it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ────────────────────────── */}
      <section ref={r5} className="reveal py-24 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple pricing</h2>
          <p className="text-[15px] text-gray-400 mb-10">Free to start. Upgrade when you need AI grammar.</p>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { name: 'Free', price: '$0', desc: 'Basic dictation and grammar hints', highlight: false },
              { name: 'Pro', price: '$12/mo', desc: 'Unlimited AI grammar, voice, offline', highlight: true },
              { name: 'Business', price: '$29/mo', desc: 'Up to 10 users. $2.90 each.', highlight: false },
            ].map((p) => (
              <div key={p.name} className={`card p-6 ${p.highlight ? 'border-indigo-200 bg-indigo-50/30 shadow-md shadow-indigo-500/5' : ''}`}>
                <p className="text-[14px] font-semibold text-gray-600 mb-1">{p.name}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{p.price}</p>
                <p className="text-[12px] text-gray-400">{p.desc}</p>
              </div>
            ))}
          </div>

          <a href="/pricing" className="text-[13px] text-indigo-600 hover:text-indigo-500 font-medium transition-colors">
            See full pricing &rarr;
          </a>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Never send a badly<br />written message again.
          </h2>
          <p className="text-gray-400 text-base mb-10 max-w-md mx-auto">
            Join thousands who write with confidence. AI grammar that works on every device, in every app.
          </p>
          <a href="/download" className="inline-block px-10 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[15px] font-medium transition-all shadow-sm">
            Download 48co Free
          </a>
          <p className="text-[12px] text-gray-300 mt-4">Mac + Windows + Chrome. Free tier. No credit card.</p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────── */}
      <Footer />
    </main>
  )
}
