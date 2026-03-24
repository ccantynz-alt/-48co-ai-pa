'use client'

import { useState } from 'react'
import Waveform from '../components/Waveform'

const FEATURES = [
  {
    icon: '&#127760;',
    title: '50+ Languages',
    desc: 'Dictate in English, Spanish, French, German, Chinese, Japanese, Korean, Arabic and 40+ more languages.',
    color: '#00f0ff',
  },
  {
    icon: '&#8679;&#8681;',
    title: 'Scroll Wheel Toggle',
    desc: 'Scroll up to record, down to stop. Or use push-to-talk. No clicking. No fumbling.',
    color: '#00f0ff',
  },
  {
    icon: '&#128483;',
    title: 'Voice Commands & Punctuation',
    desc: '"Period", "new line", "question mark" — say punctuation naturally. Plus developer commands like "refactor this".',
    color: '#ff3b5c',
  },
  {
    icon: '&#10547;',
    title: 'Works Everywhere',
    desc: 'Types into any website — Claude, ChatGPT, Gemini, DeepSeek, Gmail, Slack, Notion, and every text field on the web.',
    color: '#00ff88',
  },
  {
    icon: '&#9881;',
    title: 'Whisper API Support',
    desc: 'Free Web Speech by default. Upgrade to OpenAI Whisper for 99%+ accuracy with your own key.',
    color: '#ffb800',
  },
  {
    icon: '&#128218;',
    title: 'Custom Vocabulary',
    desc: 'Add technical terms, brand names, and jargon. Create text replacement rules for abbreviations and corrections.',
    color: '#00f0ff',
  },
  {
    icon: '&#8997;',
    title: 'Push-to-Talk & Shortcuts',
    desc: 'Hold Ctrl+Shift for push-to-talk, or use Ctrl+Shift+Space to toggle. Multiple activation modes.',
    color: '#00f0ff',
  },
  {
    icon: '&#9001;/&#9002;',
    title: 'Auto Code Fences',
    desc: 'Detects coding keywords and wraps your transcript in markdown code blocks with language detection.',
    color: '#00f0ff',
  },
  {
    icon: '&#128172;',
    title: 'Smart Post-Processing',
    desc: 'Auto-capitalizes sentences, formats punctuation, and cleans up transcription for natural-sounding text.',
    color: '#ffb800',
  },
]

const COMPETITORS = [
  { name: 'WhisperTyping', type: 'Desktop', price: '$5/mo', languages: '50+', anySite: 'Yes', codeFence: 'No', voiceCmd: 'Limited', pushToTalk: 'Yes' },
  { name: 'Wispr Flow', type: 'Desktop', price: '$15/mo', languages: '~10', anySite: 'Yes', codeFence: 'No', voiceCmd: 'No', pushToTalk: 'Yes' },
  { name: 'Voicy', type: 'Extension', price: '$8.49/mo', languages: '~30', anySite: 'No', codeFence: 'No', voiceCmd: 'No', pushToTalk: 'No' },
  { name: 'Superwhisper', type: 'Desktop', price: '$8.49/mo', languages: '~90', anySite: 'Yes', codeFence: 'No', voiceCmd: 'No', pushToTalk: 'Yes' },
  { name: '48co', type: 'Extension', price: 'Free', languages: '50+', anySite: 'Yes', codeFence: 'Yes', voiceCmd: 'Yes', pushToTalk: 'Yes' },
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
        {/* Subtle gradient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00f0ff]/5 rounded-full blur-[120px] pointer-events-none" />

        <p className="text-[11px] tracking-[0.3em] text-[#00f0ff]/60 mb-4 uppercase">
          Voice-to-AI for developers
        </p>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="text-white/90">48</span>
          <span className="text-[#00f0ff]">co</span>
        </h1>

        <p className="text-white/40 text-sm md:text-base max-w-lg leading-relaxed mb-8">
          A Chrome extension that types your voice into any website.
          50+ languages. Push-to-talk. Voice punctuation. Custom vocabulary.
          Like WhisperTyping, but free and in your browser.
        </p>

        {/* Demo widget */}
        <div className="glass rounded-2xl w-[340px] overflow-hidden mb-8">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-[11px] font-bold tracking-[0.2em] text-white/60">&equiv; 48CO</span>
            <span className="text-[9px] px-2 py-0.5 rounded border border-white/10 text-white/30">Claude</span>
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

        <a
          href="/install"
          className="px-8 py-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-sm tracking-wider hover:bg-[#00f0ff]/20 transition-all"
        >
          DOWNLOAD CHROME EXTENSION
        </a>

        <p className="text-[10px] text-white/15 mt-4">Free &middot; No account required &middot; 60-second install</p>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <h2 className="text-[11px] tracking-[0.3em] text-[#00f0ff]/40 text-center mb-12 uppercase">
          Everything WhisperTyping does, free in your browser
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-5 hover:border-white/[0.12] transition-all"
            >
              <span
                className="text-2xl mb-3 block"
                style={{ color: f.color }}
                dangerouslySetInnerHTML={{ __html: f.icon }}
              />
              <h3 className="text-sm font-bold text-white/80 mb-2">{f.title}</h3>
              <p className="text-[11px] text-white/35 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Voice Commands ────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-24">
        <h2 className="text-[11px] tracking-[0.3em] text-[#ff3b5c]/40 text-center mb-12 uppercase">
          Voice Commands & Punctuation
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
                <th className="text-left px-4 py-3 text-white/30 font-normal">Any Site</th>
                <th className="text-left px-4 py-3 text-white/30 font-normal">Code Fences</th>
                <th className="text-left px-4 py-3 text-white/30 font-normal">Voice Cmds</th>
                <th className="text-left px-4 py-3 text-white/30 font-normal">Push-to-Talk</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c) => {
                const is48 = c.name === '48co'
                return (
                  <tr key={c.name} className={`border-b border-white/[0.04] ${is48 ? 'bg-[#00f0ff]/5' : ''}`}>
                    <td className={`px-4 py-3 font-bold ${is48 ? 'text-[#00f0ff]' : 'text-white/60'}`}>{c.name}</td>
                    <td className="px-4 py-3 text-white/30">{c.type}</td>
                    <td className={`px-4 py-3 ${c.price === 'Free' ? 'text-[#00ff88]' : 'text-white/30'}`}>{c.price}</td>
                    <td className="px-4 py-3 text-white/30">{c.languages}</td>
                    <td className={`px-4 py-3 ${c.anySite === 'Yes' ? 'text-[#00ff88]' : 'text-white/20'}`}>{c.anySite}</td>
                    <td className={`px-4 py-3 ${c.codeFence === 'Yes' ? 'text-[#00ff88]' : 'text-white/20'}`}>{c.codeFence}</td>
                    <td className={`px-4 py-3 ${c.voiceCmd === 'Yes' ? 'text-[#00ff88]' : c.voiceCmd === 'Limited' ? 'text-[#ffb800]' : 'text-white/20'}`}>{c.voiceCmd}</td>
                    <td className={`px-4 py-3 ${c.pushToTalk === 'Yes' ? 'text-[#00ff88]' : 'text-white/20'}`}>{c.pushToTalk}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Install Section ───────────────────────────────────────── */}
      <section id="install" className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4 text-white/90">Get 48co</h2>
        <p className="text-white/35 text-sm mb-10 max-w-md mx-auto">
          Install the Chrome extension and start dictating into any text field on any website in seconds.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
          <a
            href="/install"
            className="px-8 py-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-sm tracking-wider hover:bg-[#00f0ff]/20 transition-all"
          >
            Download + Install Guide
          </a>
          <a
            href="https://github.com/ccantynz-alt/-48co-ai-pa"
            target="_blank"
            className="px-8 py-3 rounded-xl border border-white/10 text-white/40 text-sm tracking-wider hover:border-white/20 transition-all"
          >
            View on GitHub
          </a>
        </div>

        <p className="text-[11px] text-white/25 max-w-md mx-auto text-center leading-relaxed">
          Download the .zip, unzip it, load it into Chrome. Takes 60 seconds.
          No accounts, no API keys, no config. Just works.
        </p>
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
