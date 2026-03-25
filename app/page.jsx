'use client'

import { useState, useRef, useEffect } from 'react'
import Waveform from '../components/Waveform'

// ── Typing demo ──────────────────────────────────────────
function useTypingDemo() {
  const phrases = [
    {
      before: 'uh so like I think we should maybe redo the the dashboard because users are confused',
      after: 'I recommend redesigning the dashboard to improve user clarity and navigation.',
      label: 'AI Rewrite',
    },
    {
      before: 'Hey Claude comma can you refactor this function to use async await question mark',
      after: 'Hey Claude, can you refactor this function to use async/await?',
      label: 'Voice Punctuation',
    },
    {
      before: 'send an email to the team new line we ship tomorrow exclamation point',
      after: 'Send an email to the team\nWe ship tomorrow!',
      label: 'Natural Commands',
    },
  ]

  const [idx, setIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [phase, setPhase] = useState('typing') // typing | pause | next

  const phrase = phrases[idx]

  useEffect(() => {
    if (phase === 'typing' && charIdx < phrase.after.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), 30 + Math.random() * 20)
      return () => clearTimeout(t)
    }
    if (phase === 'typing' && charIdx >= phrase.after.length) {
      setPhase('pause')
      const t = setTimeout(() => {
        setPhase('next')
        setTimeout(() => {
          setIdx(i => (i + 1) % phrases.length)
          setCharIdx(0)
          setPhase('typing')
        }, 400)
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [charIdx, phase, phrase.after.length, idx, phrases.length])

  return {
    before: phrase.before,
    after: phrase.after.slice(0, charIdx),
    label: phrase.label,
    isTyping: phase === 'typing' && charIdx < phrase.after.length,
  }
}

// ── Scroll reveal ────────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.1 }
    )
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

  const r1 = useReveal()
  const r2 = useReveal()
  const r3 = useReveal()
  const r4 = useReveal()

  useEffect(() => {
    return () => { if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null } }
  }, [])

  function handleDemoClick() {
    if (demoStatus === 'recording') {
      if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
      return
    }
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SR) { setDemoTranscript('Requires Chrome or Edge.'); setDemoStatus('done'); setTimeout(() => setDemoStatus('idle'), 3000); return }
    const rec = new SR()
    rec.continuous = true; rec.interimResults = true; rec.lang = 'en'
    rec.onstart = () => { setDemoStatus('recording'); setDemoTranscript('') }
    rec.onresult = (e) => { let f = ''; for (let i = 0; i < e.results.length; i++) f += e.results[i][0].transcript; setDemoTranscript(f) }
    rec.onend = () => { setDemoStatus('done'); setTimeout(() => setDemoStatus('idle'), 2500) }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') setDemoTranscript('Microphone access denied.')
      else if (e.error === 'no-speech') setDemoTranscript('No speech detected.')
      setDemoStatus('done'); setTimeout(() => setDemoStatus('idle'), 3000)
    }
    recognitionRef.current = rec; rec.start()
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">

      {/* ── NAV ───────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <a href="/" className="text-base font-semibold tracking-tight">
            <span className="text-white/90">48</span><span className="text-indigo-400">co</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/compare" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Compare</a>
            <a href="/pricing" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Pricing</a>
            <a href="/live" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">Try Live</a>
            <a href="/download" className="text-[13px] px-4 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all">
              Download
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="hero-gradient pt-32 pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/15 mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            <span className="text-[12px] text-indigo-300/70">Now with AI Rewrite Mode</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Speak naturally.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Get perfect text.</span>
          </h1>

          <p className="text-lg text-white/45 max-w-xl mx-auto leading-relaxed mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Voice-to-text that types into any app. AI polishes your words automatically. Works on Mac and Windows.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <a href="/download" className="px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-all">
              Download Free
            </a>
            <a href="/live" className="px-8 py-3 rounded-xl border border-white/10 text-white/50 text-sm font-medium hover:border-white/20 hover:text-white/70 transition-all">
              Try in Browser
            </a>
          </div>

          {/* ── Demo Card ──────────────────────────────── */}
          <div className="max-w-lg mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                  </div>
                  <span className="text-[11px] text-white/20 ml-2 font-mono">{typing.label}</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${typing.isTyping ? 'bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.5)]' : 'bg-green-400'}`} />
              </div>

              <div className="px-5 py-3 border-b border-white/[0.04]">
                <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">You said</p>
                <p className="text-[13px] text-white/25 leading-relaxed">{typing.before}</p>
              </div>

              <div className="px-5 py-4 bg-indigo-500/[0.03]">
                <p className="text-[10px] text-indigo-400/40 uppercase tracking-wider mb-1">48co types</p>
                <p className={`text-[14px] text-white/75 leading-relaxed whitespace-pre-wrap min-h-[44px] ${typing.isTyping ? 'animate-typing-cursor pr-0.5' : ''}`}>
                  {typing.after || <span className="text-white/10">|</span>}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-white/15 mt-6 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            Mac + Windows &middot; Free tier available &middot; No account required
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section ref={r1} className="reveal py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white/90 mb-3">How it works</h2>
            <p className="text-sm text-white/35">Three steps. No configuration.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Press the hotkey', desc: 'Ctrl+Shift+Space (Cmd on Mac). Works from any app — browser, Slack, email, code editor, anything.' },
              { step: '2', title: 'Speak naturally', desc: 'Talk like you normally would. Say punctuation out loud or let AI figure it out. Supports 50+ languages.' },
              { step: '3', title: 'Text appears instantly', desc: 'AI rewrites your words into clean, professional text and types it directly into the focused field.' },
            ].map((s) => (
              <div key={s.step} className="card p-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-semibold mb-4">
                  {s.step}
                </div>
                <h3 className="text-[15px] font-semibold text-white/85 mb-2">{s.title}</h3>
                <p className="text-[13px] text-white/35 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KEY FEATURES ──────────────────────────────────── */}
      <section ref={r2} className="reveal py-24 px-4 bg-[#0c0c0f]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white/90 mb-3">What makes 48co different</h2>
            <p className="text-sm text-white/35">Features no other dictation tool has.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                title: 'AI Rewrite Mode',
                desc: 'You ramble, it writes professionally. Claude AI removes filler words, fixes grammar, and adjusts tone automatically. No other dictation tool does this.',
                tag: 'Exclusive',
                tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
              },
              {
                title: 'Context-Aware',
                desc: 'Automatically detects which app you\'re in. Professional tone for email, casual for Slack, technical for code editors. Zero configuration.',
                tag: 'Exclusive',
                tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
              },
              {
                title: 'Works Everywhere',
                desc: 'Types into any focused text field on your computer. Browsers, Slack, Discord, VS Code, Word, email — anything. Not limited to the browser.',
                tag: 'Desktop',
                tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              },
              {
                title: 'Privacy First',
                desc: 'Offline mode coming soon with local Whisper. Your voice never has to leave your computer. No data stored on our servers.',
                tag: 'Local-first',
                tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              },
              {
                title: 'Auto Code Detection',
                desc: 'Detects coding keywords and wraps in markdown fences with language detection. Perfect for ChatGPT, Claude, and GitHub.',
                tag: 'Developers',
                tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              },
              {
                title: '50+ Languages',
                desc: 'Powered by OpenAI Whisper for near-perfect accuracy in over 50 languages. English, Spanish, French, German, Japanese, and many more.',
                tag: 'Global',
                tagColor: 'text-white/40 bg-white/5 border-white/10',
              },
            ].map((f) => (
              <div key={f.title} className="card p-6 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-semibold text-white/85">{f.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${f.tagColor}`}>{f.tag}</span>
                </div>
                <p className="text-[13px] text-white/35 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ─────────────────────────────────────── */}
      <section ref={r3} className="reveal py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold text-white/90 mb-3">Try it now</h2>
          <p className="text-sm text-white/35 mb-10">Click the mic, speak, see your words. Runs in your browser — no download needed.</p>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
              <span className="text-[12px] font-medium text-white/40">Live Demo</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                demoStatus === 'recording' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                demoStatus === 'done' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                'border-white/10 text-white/25'
              }`}>
                {demoStatus === 'recording' ? 'Listening' : demoStatus === 'done' ? 'Done' : 'Ready'}
              </span>
            </div>

            <div className="py-4 border-b border-white/[0.04]">
              <Waveform isRecording={demoStatus === 'recording'} />
            </div>

            {demoTranscript && (
              <div className="px-5 py-3 border-b border-white/[0.04]">
                <p className="text-[13px] text-white/50 leading-relaxed">{demoTranscript}</p>
              </div>
            )}

            <div className="py-8 flex flex-col items-center gap-3">
              <button
                onClick={handleDemoClick}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                  demoStatus === 'recording' ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
                  demoStatus === 'done' ? 'border-green-500 bg-green-500/10' :
                  'border-white/15 bg-white/[0.03] hover:border-white/25'
                }`}
              >
                {demoStatus === 'recording' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"/></svg>
                ) : demoStatus === 'done' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="21" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
                )}
              </button>
              <span className={`text-[12px] ${
                demoStatus === 'recording' ? 'text-red-400' : demoStatus === 'done' ? 'text-green-400' : 'text-white/25'
              }`}>
                {demoStatus === 'recording' ? 'Click to stop' : demoStatus === 'done' ? 'Done' : 'Click to try'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ─────────────────────────────────── */}
      <section ref={r4} className="reveal py-24 px-4 bg-[#0c0c0f]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white/90 mb-3">Simple pricing</h2>
          <p className="text-sm text-white/35 mb-10">Free tier to get started. Pro when you need AI rewrite.</p>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              { name: 'Free', price: '$0', desc: 'Basic dictation, 60 min/mo', highlight: false },
              { name: 'Pro', price: '$12/mo', desc: 'Unlimited + AI Rewrite + Offline', highlight: true },
              { name: 'Lifetime', price: '$89', desc: 'Pro features forever. Limited.', highlight: false },
            ].map((p) => (
              <div key={p.name} className={`card p-6 ${p.highlight ? 'border-indigo-500/30 bg-indigo-500/[0.03]' : ''}`}>
                <p className="text-sm font-semibold text-white/70 mb-1">{p.name}</p>
                <p className="text-2xl font-bold text-white/90 mb-2">{p.price}</p>
                <p className="text-[12px] text-white/30">{p.desc}</p>
              </div>
            ))}
          </div>

          <a href="/pricing" className="text-[13px] text-indigo-400 hover:text-indigo-300 transition-colors">
            See full pricing details &rarr;
          </a>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white/90 mb-4">
            Stop typing. Start talking.
          </h2>
          <p className="text-white/35 text-base mb-10">
            Join thousands of writers, developers, and professionals who type 3x faster with their voice.
          </p>
          <a href="/download" className="inline-block px-10 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-all">
            Download 48co Free
          </a>
          <p className="text-[11px] text-white/15 mt-4">Mac + Windows. Free tier. No credit card.</p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white/40">48</span>
            <span className="text-sm font-semibold text-indigo-400/60">co</span>
          </div>
          <div className="flex gap-6 text-[12px] text-white/20">
            <a href="/download" className="hover:text-white/50 transition-colors">Download</a>
            <a href="/compare" className="hover:text-white/50 transition-colors">Compare</a>
            <a href="/pricing" className="hover:text-white/50 transition-colors">Pricing</a>
            <a href="/live" className="hover:text-white/50 transition-colors">Try Live</a>
          </div>
          <p className="text-[11px] text-white/10">Built in New Zealand</p>
        </div>
      </footer>
    </main>
  )
}
