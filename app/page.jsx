'use client'

import { useState } from 'react'
import Waveform from '../components/Waveform'

const FEATURES = [
  {
    icon: '\u{1F310}',
    title: '50+ Languages',
    desc: 'Dictate in English, Spanish, French, German, Chinese, Japanese, Korean, Arabic and 40+ more languages.',
    color: '#00f0ff',
  },
  {
    icon: '\u{1F3AF}',
    title: '99%+ Accuracy',
    desc: 'Powered by OpenAI Whisper for near-perfect transcription. Free Web Speech API fallback for zero cost.',
    color: '#00ff88',
  },
  {
    icon: '\u{1F399}',
    title: 'Voice Commands & Punctuation',
    desc: '"Period", "new line", "question mark" — say punctuation naturally. Plus developer commands like "refactor this".',
    color: '#ff3b5c',
  },
  {
    icon: '\u{26A1}',
    title: 'Types Automatically',
    desc: 'Text appears directly in the focused text field. No copy-paste. No clipboard. Completely automatic.',
    color: '#00ff88',
  },
  {
    icon: '\u{2328}',
    title: 'Global Hotkey',
    desc: 'Ctrl+Shift+Space from anywhere. Works system-wide — no need to switch windows or apps.',
    color: '#00f0ff',
  },
  {
    icon: '\u{1F4DA}',
    title: 'Custom Vocabulary',
    desc: 'Add technical terms, brand names, and jargon. Create text replacement rules for abbreviations and corrections.',
    color: '#00f0ff',
  },
  {
    icon: '\u{27E8}/\u{27E9}',
    title: 'Auto Code Fences',
    desc: 'Detects coding keywords and wraps your transcript in markdown code blocks with language detection.',
    color: '#ffb800',
  },
  {
    icon: '\u{1F4AC}',
    title: 'Smart Post-Processing',
    desc: 'Auto-capitalizes sentences, formats punctuation, and cleans up transcription for natural-sounding text.',
    color: '#ffb800',
  },
  {
    icon: '\u{1F6E1}',
    title: 'Privacy First',
    desc: 'Your audio goes directly to OpenAI for transcription. Nothing stored on our servers. Your API key, your data.',
    color: '#00f0ff',
  },
]

const COMPETITORS = [
  { name: 'WhisperTyping', type: 'Desktop', price: '$5/mo', languages: '50+', anyApp: 'Yes', codeFence: 'No', voiceCmd: 'Limited', free: 'No' },
  { name: 'Wispr Flow', type: 'Desktop', price: '$15/mo', languages: '~10', anyApp: 'Yes', codeFence: 'No', voiceCmd: 'No', free: 'No' },
  { name: 'Voicy', type: 'Extension', price: '$8.49/mo', languages: '~30', anyApp: 'No', codeFence: 'No', voiceCmd: 'No', free: 'No' },
  { name: 'Superwhisper', type: 'Mac Only', price: '$8.49/mo', languages: '~90', anyApp: 'Yes', codeFence: 'No', voiceCmd: 'No', free: 'No' },
  { name: '48co', type: 'App + Web + Ext', price: 'Free', languages: '50+', anyApp: 'Yes', codeFence: 'Yes', voiceCmd: 'Yes', free: 'Yes' },
]

const COMMANDS = [
  { trigger: 'period / comma / question mark', action: 'Inserts punctuation' },
  { trigger: 'new line / new paragraph', action: 'Inserts line breaks' },
  { trigger: 'open paren / close paren', action: 'Inserts brackets' },
  { trigger: 'thumbs up emoji / fire emoji', action: 'Inserts emoji' },
  { trigger: 'refactor this', action: 'Pastes refactor prompt' },
  { trigger: 'explain this', action: 'Pastes explain prompt' },
  { trigger: 'debug this / fix this / test this', action: 'Pastes dev prompt' },
  { trigger: 'optimize this', action: 'Pastes optimize prompt' },
  { trigger: 'send it', action: 'Submits the message' },
  { trigger: 'cancel', action: 'Clears and resets' },
]

export default function LandingPage() {
  const [demoRecording, setDemoRecording] = useState(false)

  return (
    <main className="min-h-screen bg-[#0a0a0e] text-white font-mono">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00f0ff]/5 rounded-full blur-[120px] pointer-events-none" />

        <p className="text-[11px] tracking-[0.3em] text-[#00f0ff]/60 mb-4 uppercase">
          Voice-to-text for everything
        </p>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="text-white/90">48</span>
          <span className="text-[#00f0ff]">co</span>
        </h1>

        <p className="text-white/40 text-sm md:text-base max-w-lg leading-relaxed mb-10">
          Speak and it types. Into any app, any website, any text field.
          Desktop app for Windows &amp; Mac. Web bookmarklet for zero-download.
          Chrome extension for power users. 50+ languages. Free.
        </p>

        {/* Demo widget */}
        <div className="glass rounded-2xl w-[340px] overflow-hidden mb-10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-[11px] font-bold tracking-[0.2em] text-white/60">&equiv; 48CO</span>
            <span className="text-[9px] px-2 py-0.5 rounded border border-white/10 text-white/30">Any App</span>
          </div>

          <div className="py-4 border-b border-white/[0.06]">
            <Waveform isRecording={demoRecording} />
          </div>

          <div className="py-6 flex flex-col items-center gap-3">
            <button
              onClick={() => setDemoRecording(r => !r)}
              className={`w-14 h-14 rounded-full glass flex items-center justify-center transition-all duration-300 cursor-pointer ${
                demoRecording
                  ? 'ring-2 ring-[#ff3b5c] shadow-[0_0_20px_rgba(255,59,92,0.4)]'
                  : 'ring-2 ring-white/15'
              }`}
            >
              {demoRecording ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b5c" strokeWidth="1.5">
                  <path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                  <rect x="9" y="2" width="6" height="11" rx="3"/>
                  <path d="M5 10a7 7 0 0014 0"/>
                  <line x1="12" y1="21" x2="12" y2="17"/>
                  <line x1="9" y1="21" x2="15" y2="21"/>
                </svg>
              )}
            </button>
            <span className={`text-[11px] tracking-wider transition-colors ${
              demoRecording ? 'text-[#ff3b5c]' : 'text-white/30'
            }`}>
              {demoRecording ? 'Click to stop' : 'Click to try'}
            </span>
          </div>
        </div>

        {/* Two CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <a
            href="/download"
            className="px-8 py-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-sm tracking-wider hover:bg-[#00f0ff]/20 transition-all"
          >
            DOWNLOAD DESKTOP APP
          </a>
          <a
            href="/live"
            className="px-8 py-3 rounded-xl border border-white/15 text-white/50 text-sm tracking-wider hover:border-white/25 hover:text-white/70 transition-all"
          >
            USE IN BROWSER (FREE)
          </a>
        </div>

        <p className="text-[10px] text-white/15 mt-2">Free &middot; No account required &middot; Open source</p>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-24">
        <h2 className="text-[11px] tracking-[0.3em] text-[#00ff88]/40 text-center mb-12 uppercase">
          Three ways to use 48co
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5 border-[#00f0ff]/20">
            <span className="text-[#00f0ff] text-lg mb-3 block">Desktop App</span>
            <p className="text-[11px] text-white/50 leading-relaxed mb-3">
              Download for Windows or Mac. Runs in your system tray. Global hotkey types into ANY app — browsers, Slack, VS Code, email, everything.
            </p>
            <p className="text-[9px] text-[#00ff88]">Best experience. Recommended.</p>
          </div>

          <div className="glass rounded-2xl p-5">
            <span className="text-white/60 text-lg mb-3 block">Web Bookmarklet</span>
            <p className="text-[11px] text-white/50 leading-relaxed mb-3">
              Zero download. Click a bookmark on any website to inject the voice widget. Types directly into the page's text fields.
            </p>
            <p className="text-[9px] text-white/30">Browser only. Re-click per page.</p>
          </div>

          <div className="glass rounded-2xl p-5">
            <span className="text-white/60 text-lg mb-3 block">Chrome Extension</span>
            <p className="text-[11px] text-white/50 leading-relaxed mb-3">
              Always-on browser widget. Automatically appears on every website. Best for browser-only users who want zero friction.
            </p>
            <p className="text-[9px] text-white/30">Browser only. One-time install.</p>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <h2 className="text-[11px] tracking-[0.3em] text-[#00f0ff]/40 text-center mb-12 uppercase">
          Everything WhisperTyping does, and more
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-5 hover:border-white/[0.12] transition-all"
            >
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="text-sm font-bold text-white/80 mb-2">{f.title}</h3>
              <p className="text-[11px] text-white/35 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Voice Commands ────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-24">
        <h2 className="text-[11px] tracking-[0.3em] text-[#ff3b5c]/40 text-center mb-12 uppercase">
          Voice Commands &amp; Punctuation
        </h2>

        <div className="glass rounded-2xl overflow-hidden">
          {COMMANDS.map((cmd, i) => (
            <div
              key={cmd.trigger}
              className={`flex items-center justify-between px-5 py-3 ${
                i < COMMANDS.length - 1 ? 'border-b border-white/[0.04]' : ''
              }`}
            >
              <span className="text-[12px] text-[#00f0ff]">&ldquo;{cmd.trigger}&rdquo;</span>
              <span className="text-[11px] text-white/30">{cmd.action}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison Table ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-24">
        <h2 className="text-[11px] tracking-[0.3em] text-[#00ff88]/40 text-center mb-12 uppercase">
          vs Competitors
        </h2>

        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-4 py-3 text-white/30 font-normal">Tool</th>
                <th className="text-left px-4 py-3 text-white/30 font-normal">Type</th>
                <th className="text-left px-4 py-3 text-white/30 font-normal">Price</th>
                <th className="text-left px-4 py-3 text-white/30 font-normal">Languages</th>
                <th className="text-left px-4 py-3 text-white/30 font-normal">Any App</th>
                <th className="text-left px-4 py-3 text-white/30 font-normal">Code Fences</th>
                <th className="text-left px-4 py-3 text-white/30 font-normal">Voice Cmds</th>
                <th className="text-left px-4 py-3 text-white/30 font-normal">Free Tier</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c) => {
                const is48 = c.name === '48co'
                return (
                  <tr key={c.name} className={`border-b border-white/[0.04] ${is48 ? 'bg-[#00f0ff]/5' : ''}`}>
                    <td className={`px-4 py-3 font-bold ${is48 ? 'text-[#00f0ff]' : 'text-white/60'}`}>{c.name}</td>
                    <td className={`px-4 py-3 ${is48 ? 'text-[#00f0ff]/60' : 'text-white/30'}`}>{c.type}</td>
                    <td className={`px-4 py-3 ${c.price === 'Free' ? 'text-[#00ff88]' : 'text-white/30'}`}>{c.price}</td>
                    <td className="px-4 py-3 text-white/30">{c.languages}</td>
                    <td className={`px-4 py-3 ${c.anyApp === 'Yes' ? 'text-[#00ff88]' : 'text-white/20'}`}>{c.anyApp}</td>
                    <td className={`px-4 py-3 ${c.codeFence === 'Yes' ? 'text-[#00ff88]' : 'text-white/20'}`}>{c.codeFence}</td>
                    <td className={`px-4 py-3 ${c.voiceCmd === 'Yes' ? 'text-[#00ff88]' : c.voiceCmd === 'Limited' ? 'text-[#ffb800]' : 'text-white/20'}`}>{c.voiceCmd}</td>
                    <td className={`px-4 py-3 ${c.free === 'Yes' ? 'text-[#00ff88]' : 'text-white/20'}`}>{c.free}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Get 48co Section ──────────────────────────────────────── */}
      <section id="get" className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4 text-white/90">Get 48co</h2>
        <p className="text-white/35 text-sm mb-10 max-w-md mx-auto">
          Choose how you want to use voice-to-text. All options are free.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-stretch mb-8">
          <a
            href="/download"
            className="flex-1 glass rounded-2xl p-6 text-left hover:border-[#00f0ff]/30 transition-all"
          >
            <span className="text-[#00f0ff] text-sm font-bold">Desktop App</span>
            <p className="text-[10px] text-white/30 mt-1">Windows + Mac. Types into any app.</p>
            <p className="text-[9px] text-[#00ff88] mt-3">Recommended</p>
          </a>
          <a
            href="/live"
            className="flex-1 glass rounded-2xl p-6 text-left hover:border-white/15 transition-all"
          >
            <span className="text-white/70 text-sm font-bold">Web Bookmarklet</span>
            <p className="text-[10px] text-white/30 mt-1">Zero download. Works in browser.</p>
          </a>
          <a
            href="/install"
            className="flex-1 glass rounded-2xl p-6 text-left hover:border-white/15 transition-all"
          >
            <span className="text-white/70 text-sm font-bold">Chrome Extension</span>
            <p className="text-[10px] text-white/30 mt-1">Always-on browser widget.</p>
          </a>
        </div>

        <a
          href="https://github.com/ccantynz-alt/-48co-ai-pa"
          target="_blank"
          className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
        >
          View on GitHub
        </a>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8 text-center">
        <p className="text-[10px] text-white/15 tracking-wider">
          48co &middot; Built in NZ &middot; Open Source
        </p>
      </footer>
    </main>
  )
}
