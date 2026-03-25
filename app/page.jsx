'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Waveform from '../components/Waveform'

// ── Typing simulator for hero ────────────────────────────────
function useTypingDemo() {
  const phrases = [
    { spoken: 'Hey Claude comma can you refactor this function to use async await question mark', typed: 'Hey Claude, can you refactor this function to use async/await?' },
    { spoken: 'Send an email to the team new line we ship tomorrow exclamation point', typed: 'Send an email to the team\nWe ship tomorrow!' },
    { spoken: 'Create a React component called dashboard with a dark theme', typed: 'Create a React component called Dashboard with a dark theme' },
    { spoken: 'The meeting is at 3 PM period Please send the agenda beforehand period', typed: 'The meeting is at 3 PM. Please send the agenda beforehand.' },
  ]

  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [paused, setPaused] = useState(false)

  const phrase = phrases[phraseIdx]

  useEffect(() => {
    if (paused) return

    if (isTyping && charIdx < phrase.typed.length) {
      const timeout = setTimeout(() => setCharIdx(c => c + 1), 35 + Math.random() * 25)
      return () => clearTimeout(timeout)
    }

    if (isTyping && charIdx >= phrase.typed.length) {
      setIsTyping(false)
      const timeout = setTimeout(() => {
        setPaused(true)
        setTimeout(() => {
          setPhraseIdx(i => (i + 1) % phrases.length)
          setCharIdx(0)
          setIsTyping(true)
          setPaused(false)
        }, 1200)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [charIdx, isTyping, paused, phrase.typed.length, phraseIdx, phrases.length])

  return {
    spoken: phrase.spoken,
    typed: phrase.typed.slice(0, charIdx),
    isTyping: isTyping && charIdx < phrase.typed.length,
    progress: charIdx / phrase.typed.length,
  }
}

// ── Scroll reveal hook ───────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

// ── Stats counter ────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '', duration = 2000 }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const start = performance.now()
        const animate = (now) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(target * eased))
          if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
        observer.disconnect()
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{value}{suffix}</span>
}

const FEATURES = [
  { icon: '\u{26A1}', title: 'Types Automatically', desc: 'Text appears directly in the focused field. No copy-paste. No clipboard. Just speak and it types.', color: '#00ff88' },
  { icon: '\u{1F3AF}', title: 'Whisper Accuracy', desc: 'Desktop app uses OpenAI Whisper for near-perfect transcription. Web tools use free browser speech API.', color: '#00f0ff' },
  { icon: '\u{2328}\u{FE0F}', title: 'Global Hotkey', desc: 'Ctrl+Shift+Space from anywhere. Works system-wide in the desktop app, per-page in browser.', color: '#00f0ff' },
  { icon: '\u{1F399}\u{FE0F}', title: 'Voice Commands', desc: 'Say punctuation naturally. Developer prompts like \u201Crefactor this\u201D. Emoji by voice.', color: '#ff3b5c' },
  { icon: '\u{27E8}/\u{27E9}', title: 'Auto Code Fences', desc: 'Detects coding keywords and wraps in markdown fences with language detection.', color: '#ffb800' },
  { icon: '\u{1F6E1}\u{FE0F}', title: 'Privacy First', desc: 'Audio goes direct to the speech API. Nothing stored on our servers. Your key, your data.', color: '#00f0ff' },
]

const COMPETITORS = [
  { name: 'WhisperTyping', type: 'Desktop', price: '$5/mo', anyApp: true, codeFence: false, voiceCmd: false, free: false },
  { name: 'Wispr Flow', type: 'Desktop', price: '$15/mo', anyApp: true, codeFence: false, voiceCmd: false, free: false },
  { name: 'Voicy', type: 'Extension', price: '$8.49/mo', anyApp: false, codeFence: false, voiceCmd: false, free: false },
  { name: 'Superwhisper', type: 'Mac Only', price: '$8.49/mo', anyApp: true, codeFence: false, voiceCmd: false, free: false },
  { name: '48co', type: 'All 3', price: 'Free*', anyApp: true, codeFence: true, voiceCmd: true, free: true },
]

export default function LandingPage() {
  const [demoStatus, setDemoStatus] = useState('idle')
  const [demoTranscript, setDemoTranscript] = useState('')
  const recognitionRef = useRef(null)
  const typing = useTypingDemo()

  const r1 = useReveal()
  const r2 = useReveal()
  const r3 = useReveal()
  const r4 = useReveal()
  const r5 = useReveal()
  const r6 = useReveal()

  useEffect(() => {
    return () => { if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null } }
  }, [])

  function handleDemoClick() {
    if (demoStatus === 'recording') {
      if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
      return
    }
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SR) {
      setDemoTranscript('Speech Recognition requires Chrome or Edge.')
      setDemoStatus('done')
      setTimeout(() => setDemoStatus('idle'), 3000)
      return
    }
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en'
    rec.onstart = () => { setDemoStatus('recording'); setDemoTranscript('') }
    rec.onresult = (e) => { let f = ''; for (let i = 0; i < e.results.length; i++) f += e.results[i][0].transcript; setDemoTranscript(f) }
    rec.onend = () => { setDemoStatus('done'); setTimeout(() => setDemoStatus('idle'), 2500) }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') setDemoTranscript('Microphone access denied.')
      else if (e.error === 'no-speech') setDemoTranscript('No speech detected. Try again.')
      setDemoStatus('done')
      setTimeout(() => setDemoStatus('idle'), 3000)
    }
    recognitionRef.current = rec
    rec.start()
  }

  return (
    <main className="min-h-screen bg-[#0a0a0e] text-white font-mono overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center grid-bg">
        {/* Animated glow orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none">
          <div className="absolute inset-0 bg-[#00f0ff]/[0.04] rounded-full blur-[150px] animate-glow-pulse" />
          <div className="absolute top-20 -left-20 w-[300px] h-[300px] bg-[#ff3b5c]/[0.03] rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-10 -right-10 w-[250px] h-[250px] bg-[#00ff88]/[0.03] rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating orbit dots */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none">
          <div className="absolute w-1.5 h-1.5 rounded-full bg-[#00f0ff]/30" style={{ animation: 'orbit 20s linear infinite' }} />
          <div className="absolute w-1 h-1 rounded-full bg-[#ff3b5c]/20" style={{ animation: 'orbit 28s linear infinite reverse' }} />
          <div className="absolute w-1 h-1 rounded-full bg-[#00ff88]/20" style={{ animation: 'orbit 35s linear infinite', animationDelay: '-10s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-[11px] tracking-[0.4em] text-[#00f0ff]/50 mb-6 uppercase animate-fade-up">
            Voice-to-text for everything
          </p>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <span className="text-white">48</span>
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#00ff88] bg-clip-text text-transparent">co</span>
          </h1>

          <p className="text-white/30 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-12 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Speak and it types. Into any app, any website, any text field. Free and open source.
          </p>

          {/* ── Typing Demo ─────────────────────────────────────── */}
          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="glass gradient-border rounded-2xl w-full max-w-[540px] mx-auto overflow-hidden mb-10 animate-float" style={{ animationDuration: '6s' }}>
              {/* Header bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff3b5c]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffb800]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]/60" />
                  </div>
                  <span className="text-[10px] text-white/20 ml-2">Any App</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${typing.isTyping ? 'bg-[#ff3b5c] shadow-[0_0_6px_rgba(255,59,92,0.6)]' : 'bg-[#00ff88] shadow-[0_0_6px_rgba(0,255,136,0.4)]'}`} />
                  <span className="text-[9px] text-white/25">{typing.isTyping ? 'LISTENING' : 'DONE'}</span>
                </div>
              </div>

              {/* Waveform */}
              <div className="py-3 border-b border-white/[0.04]">
                <Waveform isRecording={typing.isTyping} />
              </div>

              {/* Spoken text (faded) */}
              <div className="px-5 py-3 border-b border-white/[0.04]">
                <p className="text-[9px] text-white/15 tracking-wider mb-1">YOU SAID</p>
                <p className="text-[11px] text-white/25 leading-relaxed">{typing.spoken}</p>
              </div>

              {/* Typed result */}
              <div className="px-5 py-4 bg-[#00f0ff]/[0.02]">
                <p className="text-[9px] text-[#00f0ff]/30 tracking-wider mb-1">48CO TYPES</p>
                <p className={`text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap min-h-[40px] ${typing.isTyping ? 'animate-typing-cursor pr-0.5' : ''}`}>
                  {typing.typed || <span className="text-white/10">|</span>}
                </p>
              </div>

              {/* Progress bar */}
              <div className="h-[2px] bg-white/[0.03]">
                <div
                  className="h-full bg-gradient-to-r from-[#00f0ff] to-[#00ff88] transition-all duration-100"
                  style={{ width: `${typing.progress * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <a href="/download" className="group relative px-8 py-3.5 rounded-xl text-sm tracking-wider transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/20 to-[#00ff88]/10 group-hover:from-[#00f0ff]/30 group-hover:to-[#00ff88]/20 transition-all" />
              <div className="absolute inset-0 border border-[#00f0ff]/30 group-hover:border-[#00f0ff]/50 rounded-xl transition-all" />
              <span className="relative text-[#00f0ff]">DOWNLOAD FOR FREE</span>
            </a>
            <a href="/live" className="px-8 py-3.5 rounded-xl border border-white/10 text-white/40 text-sm tracking-wider hover:border-white/20 hover:text-white/60 transition-all">
              TRY IN BROWSER
            </a>
          </div>

          <p className="text-[10px] text-white/10 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            Windows + Mac + Web &middot; No account needed &middot; Open source
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-up" style={{ animationDelay: '1s' }}>
          <span className="text-[9px] text-white/15 tracking-wider">SCROLL</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/15 to-transparent" />
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────── */}
      <section ref={r1} className="reveal border-y border-white/[0.04] py-12 bg-[#0a0a0e]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: 50, s: '+', label: 'Languages' },
            { n: 3, s: '', label: 'Delivery Modes' },
            { n: 40, s: '+', label: 'Voice Commands' },
            { n: 0, s: '', label: 'Monthly Cost', prefix: '$' },
          ].map((stat, i) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-bold text-white/90 mb-1">
                {stat.prefix || ''}<AnimatedNumber target={stat.n} suffix={stat.s} />
              </p>
              <p className="text-[10px] text-white/25 tracking-wider uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section ref={r2} className="reveal max-w-5xl mx-auto px-4 py-28">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.4em] text-[#00ff88]/40 mb-3 uppercase">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white/90">Three ways to use 48co</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: 'Desktop App',
              desc: 'Download for Windows or Mac. Lives in your system tray. Press the hotkey, speak, and text appears in whatever app you\u2019re using \u2014 browsers, Slack, VS Code, email, anything.',
              badge: 'Best experience',
              badgeColor: 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/5',
              accent: '#00f0ff',
              href: '/download',
            },
            {
              num: '02',
              title: 'Web Bookmarklet',
              desc: 'Zero download. Visit the live page, drag a bookmark, and click it on any website. Injects a voice widget that types directly into text fields.',
              badge: 'Zero friction',
              badgeColor: 'text-white/40 border-white/10 bg-white/[0.03]',
              accent: '#ffb800',
              href: '/live',
            },
            {
              num: '03',
              title: 'Chrome Extension',
              desc: 'Always-on voice widget with developer commands. Optimized for AI chat sites: Claude, ChatGPT, Gemini, DeepSeek. Works on other sites too.',
              badge: 'Power users',
              badgeColor: 'text-white/40 border-white/10 bg-white/[0.03]',
              accent: '#ff3b5c',
              href: '/install',
            },
          ].map((mode) => (
            <a key={mode.num} href={mode.href} className="group glass rounded-2xl p-6 hover:border-white/15 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `linear-gradient(to right, ${mode.accent}, transparent)` }} />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[32px] font-bold text-white/[0.04]">{mode.num}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded border ${mode.badgeColor}`}>{mode.badge}</span>
              </div>
              <h3 className="text-lg font-bold text-white/80 mb-3" style={{ color: mode.accent + 'cc' }}>{mode.title}</h3>
              <p className="text-[11px] text-white/35 leading-relaxed">{mode.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-[10px] text-white/20 group-hover:text-white/40 transition-colors">
                <span>Learn more</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── LIVE DEMO ────────────────────────────────────────────── */}
      <section ref={r3} className="reveal py-28 bg-gradient-to-b from-transparent via-[#00f0ff]/[0.02] to-transparent">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-[10px] tracking-[0.4em] text-[#00f0ff]/40 mb-3 uppercase">Try it now</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white/90 mb-4">Live Demo</h2>
          <p className="text-[12px] text-white/30 mb-10 max-w-md mx-auto">Click the microphone, speak, and see your words appear. This runs entirely in your browser &mdash; no download needed.</p>

          <div className="glass gradient-border rounded-2xl max-w-md mx-auto overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
              <span className="text-[11px] font-bold tracking-[0.2em] text-white/50">&equiv; 48CO</span>
              <span className={`text-[9px] px-2 py-0.5 rounded border transition-all ${
                demoStatus === 'recording' ? 'border-[#ff3b5c]/40 text-[#ff3b5c] bg-[#ff3b5c]/10' :
                demoStatus === 'done' ? 'border-[#00ff88]/40 text-[#00ff88] bg-[#00ff88]/10' :
                'border-white/10 text-white/25'
              }`}>
                {demoStatus === 'recording' ? 'LISTENING' : demoStatus === 'done' ? 'DONE' : 'LIVE DEMO'}
              </span>
            </div>

            <div className="py-4 border-b border-white/[0.04]">
              <Waveform isRecording={demoStatus === 'recording'} />
            </div>

            {demoTranscript && (
              <div className="px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
                <p className="text-[11px] text-white/50 leading-relaxed">{demoTranscript}</p>
              </div>
            )}

            <div className="py-8 flex flex-col items-center gap-3">
              <button
                onClick={handleDemoClick}
                className={`w-16 h-16 rounded-full glass flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  demoStatus === 'recording' ? 'ring-2 ring-[#ff3b5c] shadow-[0_0_24px_rgba(255,59,92,0.4)]' :
                  demoStatus === 'done' ? 'ring-2 ring-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.3)]' :
                  'ring-2 ring-white/15 hover:ring-white/25 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                }`}
              >
                {demoStatus === 'recording' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff3b5c" strokeWidth="1.5"><path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"/></svg>
                ) : demoStatus === 'done' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="21" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
                )}
              </button>
              <span className={`text-[11px] tracking-wider ${
                demoStatus === 'recording' ? 'text-[#ff3b5c]' : demoStatus === 'done' ? 'text-[#00ff88]' : 'text-white/25'
              }`}>
                {demoStatus === 'recording' ? 'Click to stop' : demoStatus === 'done' ? 'Done' : 'Click to try'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section ref={r4} className="reveal max-w-5xl mx-auto px-4 py-28">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.4em] text-[#00f0ff]/40 mb-3 uppercase">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white/90">Everything you need</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:border-white/10 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{f.icon}</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: f.color + 'cc' }}>{f.title}</h3>
              <p className="text-[11px] text-white/30 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VS COMPETITORS ───────────────────────────────────────── */}
      <section ref={r5} className="reveal max-w-4xl mx-auto px-4 py-28">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.4em] text-[#00ff88]/40 mb-3 uppercase">Comparison</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white/90">vs the competition</h2>
        </div>

        <div className="glass gradient-border rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Tool', 'Type', 'Price', 'Any App', 'Code Fences', 'Voice Cmds', 'Free'].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-white/25 font-normal text-[10px] tracking-wider uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c) => {
                const is48 = c.name === '48co'
                const Check = () => <span className="text-[#00ff88]">{'\u2713'}</span>
                const Cross = () => <span className="text-white/10">{'\u2014'}</span>
                return (
                  <tr key={c.name} className={`border-b border-white/[0.03] ${is48 ? 'bg-[#00f0ff]/[0.04]' : 'hover:bg-white/[0.01]'} transition-colors`}>
                    <td className={`px-4 py-3.5 font-bold ${is48 ? 'text-[#00f0ff]' : 'text-white/50'}`}>{c.name}</td>
                    <td className="px-4 py-3.5 text-white/25">{c.type}</td>
                    <td className={`px-4 py-3.5 ${c.price.includes('Free') ? 'text-[#00ff88]' : 'text-white/25'}`}>{c.price}</td>
                    <td className="px-4 py-3.5">{c.anyApp ? <Check /> : <Cross />}</td>
                    <td className="px-4 py-3.5">{c.codeFence ? <Check /> : <Cross />}</td>
                    <td className="px-4 py-3.5">{c.voiceCmd ? <Check /> : <Cross />}</td>
                    <td className="px-4 py-3.5">{c.free ? <Check /> : <Cross />}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[9px] text-white/10 text-center mt-4">*Web tools use free browser speech. Desktop uses Whisper API (~$0.006/min, your own key).</p>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section ref={r6} className="reveal py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f0ff]/[0.02] to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white/90">Get </span>
            <span className="bg-gradient-to-r from-[#00f0ff] to-[#00ff88] bg-clip-text text-transparent">48co</span>
          </h2>
          <p className="text-white/30 text-sm mb-12 max-w-md mx-auto">
            Pick what works for you. All options are free. No account required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { title: 'Desktop App', desc: 'Windows + Mac. Types into any app.', badge: 'Recommended', color: '#00f0ff', href: '/download' },
              { title: 'Web Bookmarklet', desc: 'Zero download. Any website.', badge: 'Instant', color: '#ffb800', href: '/live' },
              { title: 'Chrome Extension', desc: 'AI chat sites + more.', badge: 'Always on', color: '#ff3b5c', href: '/install' },
            ].map((opt) => (
              <a key={opt.title} href={opt.href} className="group glass rounded-2xl p-6 text-left hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold" style={{ color: opt.color }}>{opt.title}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded border border-white/[0.06] text-white/20">{opt.badge}</span>
                </div>
                <p className="text-[10px] text-white/25">{opt.desc}</p>
                <div className="mt-4 h-[1px] w-0 group-hover:w-full transition-all duration-500" style={{ background: `linear-gradient(to right, ${opt.color}40, transparent)` }} />
              </a>
            ))}
          </div>

          <a href="https://github.com/ccantynz-alt/-48co-ai-pa" target="_blank" className="text-[11px] text-white/15 hover:text-white/30 transition-colors">
            View source on GitHub
          </a>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-sm font-bold text-white/40">48</span>
          <span className="text-sm font-bold text-[#00f0ff]/40">co</span>
        </div>
        <p className="text-[10px] text-white/10 tracking-wider">Built in New Zealand &middot; Open Source &middot; Free Forever</p>
      </footer>
    </main>
  )
}
