'use client'

import { useState, useEffect } from 'react'

export default function DownloadPage() {
  const [platform, setPlatform] = useState('unknown')

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('mac')) setPlatform('mac')
    else if (ua.includes('win')) setPlatform('windows')
    else if (ua.includes('linux')) setPlatform('linux')
  }, [])

  const FEATURES = [
    {
      icon: '\u{1F310}',
      title: 'Works in ANY App',
      desc: 'Types into any focused text field — browsers, Slack, Discord, VS Code, email, Word, anything on your computer.',
    },
    {
      icon: '\u{2328}',
      title: 'Global Hotkey',
      desc: 'Press Ctrl+Shift+Space (Cmd+Shift+Space on Mac) from anywhere. No need to switch windows.',
    },
    {
      icon: '\u{1F3AF}',
      title: '99%+ Accuracy',
      desc: 'Powered by OpenAI Whisper API for near-perfect transcription in 50+ languages.',
    },
    {
      icon: '\u{26A1}',
      title: 'Instant Typing',
      desc: 'Text appears in the focused field instantly. No copy-paste. No clipboard juggling.',
    },
    {
      icon: '\u{1F504}',
      title: 'Auto-Updates',
      desc: 'Stays up to date automatically. New features and improvements delivered seamlessly.',
    },
    {
      icon: '\u{1F512}',
      title: 'Privacy First',
      desc: 'Audio is sent directly to OpenAI for transcription. Nothing stored on our servers. Your API key, your data.',
    },
  ]

  const STEPS = {
    mac: [
      'Download the .dmg file',
      'Open the .dmg and drag 48co to Applications',
      'Launch 48co from Applications',
      'Grant Accessibility permission when prompted (required for typing into other apps)',
      'Grant Microphone permission when prompted',
      'Add your OpenAI API key in Settings',
      'Press Cmd+Shift+Space to start talking',
    ],
    windows: [
      'Download the .exe installer',
      'Run the installer (click "Yes" if Windows asks for permission)',
      '48co starts automatically and appears in the system tray',
      'Add your OpenAI API key in Settings (right-click tray icon)',
      'Press Ctrl+Shift+Space to start talking',
    ],
  }

  return (
    <main className="min-h-screen bg-[#0a0a0e] text-white font-mono overflow-y-auto">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <a href="/" className="text-sm font-bold tracking-[0.2em]">
          <span className="text-white/80">48</span><span className="text-[#00f0ff]">co</span>
        </a>
        <div className="flex gap-4">
          <a href="/live" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Use Live</a>
          <a href="/" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Home</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">
            <span className="text-white/90">Download </span>
            <span className="text-[#00f0ff]">48co</span>
          </h1>
          <p className="text-white/35 text-sm max-w-md mx-auto">
            System-wide voice-to-text. Press a hotkey, speak, and it types into whatever app you&apos;re using.
          </p>
        </section>

        {/* Download buttons */}
        <section className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <a
            href="https://github.com/ccantynz-alt/-48co-ai-pa/releases/latest/download/48co-mac.dmg"
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all ${
              platform === 'mac'
                ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff]'
                : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div>
              <p className="text-sm font-bold">macOS</p>
              <p className="text-[10px] opacity-50">Intel + Apple Silicon</p>
            </div>
            {platform === 'mac' && <span className="text-[9px] ml-auto opacity-50">Recommended</span>}
          </a>

          <a
            href="https://github.com/ccantynz-alt/-48co-ai-pa/releases/latest/download/48co-win.exe"
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all ${
              platform === 'windows'
                ? 'bg-[#00f0ff]/10 border-[#00f0ff]/40 text-[#00f0ff]'
                : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
              <path d="M3 12V6.75l8-1.25V12H3zm0 .5h8v6.5l-8-1.25V12.5zM11.5 5.33L21 3.75V12h-9.5V5.33zm0 7.17H21v8.25l-9.5-1.58V12.5z"/>
            </svg>
            <div>
              <p className="text-sm font-bold">Windows</p>
              <p className="text-[10px] opacity-50">Windows 10+</p>
            </div>
            {platform === 'windows' && <span className="text-[9px] ml-auto opacity-50">Recommended</span>}
          </a>
        </section>

        {/* Requirements */}
        <section className="glass rounded-2xl p-5 mb-8">
          <h2 className="text-[11px] tracking-[0.2em] text-white/30 mb-3 uppercase">Requirements</h2>
          <div className="space-y-2 text-[11px] text-white/40">
            <p>&#x2022; <strong>OpenAI API key</strong> — for Whisper transcription (~$0.006/minute). Get one at <span className="text-[#00f0ff]/60">platform.openai.com/api-keys</span></p>
            <p>&#x2022; <strong>macOS:</strong> Accessibility permission (for typing into other apps) + Microphone permission</p>
            <p>&#x2022; <strong>Windows:</strong> No special permissions needed</p>
            <p>&#x2022; Works offline with free Web Speech fallback (lower accuracy, Chrome only)</p>
          </div>
        </section>

        {/* Setup steps */}
        <section className="glass rounded-2xl overflow-hidden mb-8">
          <div className="flex border-b border-white/[0.06]">
            <button
              onClick={() => setPlatform('mac')}
              className={`flex-1 py-3 text-[11px] tracking-wider transition-colors ${
                platform === 'mac' ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' : 'text-white/30'
              }`}
            >
              macOS Setup
            </button>
            <button
              onClick={() => setPlatform('windows')}
              className={`flex-1 py-3 text-[11px] tracking-wider transition-colors ${
                platform === 'windows' ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]' : 'text-white/30'
              }`}
            >
              Windows Setup
            </button>
          </div>

          <div className="p-5">
            {(STEPS[platform] || STEPS.mac).map((step, i) => (
              <div key={i} className="flex items-start gap-3 mb-3">
                <span className="text-[11px] text-[#00f0ff]/40 font-bold mt-0.5">{i + 1}.</span>
                <p className="text-[11px] text-white/40 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-8">
          <h2 className="text-[11px] tracking-[0.3em] text-[#00f0ff]/40 text-center mb-8 uppercase">
            What the desktop app does
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="glass rounded-2xl p-5">
                <span className="text-xl mb-2 block">{f.icon}</span>
                <h3 className="text-[12px] font-bold text-white/70 mb-1">{f.title}</h3>
                <p className="text-[10px] text-white/30 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Alternative */}
        <section className="text-center py-8">
          <p className="text-[11px] text-white/25 mb-3">Don&apos;t want to download anything?</p>
          <a
            href="/live"
            className="inline-block px-6 py-2 rounded-xl border border-white/10 text-white/40 text-[11px] tracking-wider hover:border-white/20 transition-all"
          >
            Use 48co in Your Browser (free, no download)
          </a>
        </section>
      </div>

      <footer className="border-t border-white/[0.06] py-6 text-center">
        <p className="text-[10px] text-white/15 tracking-wider">48co &middot; Built in NZ &middot; Open Source</p>
      </footer>
    </main>
  )
}
