'use client'

import { useState, useEffect } from 'react'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export default function DownloadPage() {
  const [platform, setPlatform] = useState('unknown')
  const [tab, setTab] = useState('mac')

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('mac')) { setPlatform('mac'); setTab('mac') }
    else if (ua.includes('win')) { setPlatform('windows'); setTab('windows') }
  }, [])

  const STEPS = {
    mac: [
      'Click the Download button to get the .dmg file',
      'Open it and drag 48co to your Applications folder',
      'Launch 48co — it appears in your menu bar (top-right)',
      'Allow Accessibility + Microphone when prompted',
      'Right-click the menu bar icon and sign in',
      'Press Cmd+Shift+Space anywhere to start dictating',
    ],
    windows: [
      'Click the Download button to get the installer',
      'Run it — click "Yes" if Windows asks permission',
      '48co appears in your system tray (bottom-right near the clock)',
      'Right-click the tray icon and sign in',
      'Press Ctrl+Shift+Space anywhere to start dictating',
    ],
  }

  return (
    <main className="min-h-screen bg-white">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Download <span className="text-gold-500">48co</span>
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            AI grammar, voice dictation, and translation that works in every app on your computer. Free to start.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-14">
          <a
            href="https://github.com/ccantynz-alt/-48co-ai-pa/releases/latest/download/48co-mac.dmg"
            className={`flex items-center gap-4 px-8 py-5 rounded-xl border transition-all ${
              platform === 'mac'
                ? 'bg-navy-50 border-navy-200 shadow-md shadow-navy-500/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#0B1A2E" opacity="0.5">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div>
              <p className="text-[15px] font-semibold text-navy-900">Download for macOS</p>
              <p className="text-[12px] text-gray-500">Intel + Apple Silicon (.dmg)</p>
            </div>
            {platform === 'mac' && <span className="text-[10px] text-gold-600 ml-auto font-semibold">Recommended</span>}
          </a>

          <a
            href="https://github.com/ccantynz-alt/-48co-ai-pa/releases/latest/download/48co-win.exe"
            className={`flex items-center gap-4 px-8 py-5 rounded-xl border transition-all ${
              platform === 'windows'
                ? 'bg-navy-50 border-navy-200 shadow-md shadow-navy-500/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#0B1A2E" opacity="0.5">
              <path d="M3 12V6.75l8-1.25V12H3zm0 .5h8v6.5l-8-1.25V12.5zM11.5 5.33L21 3.75V12h-9.5V5.33zm0 7.17H21v8.25l-9.5-1.58V12.5z"/>
            </svg>
            <div>
              <p className="text-[15px] font-semibold text-navy-900">Download for Windows</p>
              <p className="text-[12px] text-gray-500">Windows 10+ (.exe)</p>
            </div>
            {platform === 'windows' && <span className="text-[10px] text-gold-600 ml-auto font-semibold">Recommended</span>}
          </a>
        </div>

        {/* Also available */}
        <div className="flex flex-wrap justify-center gap-3 mb-20">
          <a href="/install" className="text-[12px] px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-navy-200 hover:text-navy-700 transition-all font-medium">
            Chrome Extension
          </a>
          <a href="/live" className="text-[12px] px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:border-navy-200 hover:text-navy-700 transition-all font-medium">
            Try in Browser (no download)
          </a>
        </div>

        {/* Setup Steps */}
        <div className="mb-20">
          <h2 className="text-xl font-bold text-navy-900 mb-8 text-center">Setup in {tab === 'mac' ? '6' : '5'} steps</h2>

          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setTab('mac')}
              className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                tab === 'mac' ? 'bg-navy-900 text-white' : 'text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              macOS
            </button>
            <button
              onClick={() => setTab('windows')}
              className={`px-5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                tab === 'windows' ? 'bg-navy-900 text-white' : 'text-gray-500 border border-gray-200 hover:border-gray-300'
              }`}
            >
              Windows
            </button>
          </div>

          <div className="max-w-lg mx-auto space-y-3">
            {(STEPS[tab] || STEPS.mac).map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-[#FAFAF8]">
                <span className="w-7 h-7 rounded-lg bg-navy-900 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-[13px] text-gray-600 leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-xl font-bold text-navy-900 mb-8 text-center">What you get</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'AI Grammar & Rewrite', desc: 'Fixes grammar, removes filler words, adjusts tone — all powered by Claude AI.' },
              { title: 'Works in Every App', desc: 'Types into any focused text field — browsers, Slack, VS Code, email, Word, anything.' },
              { title: 'Voice-to-Text Dictation', desc: 'Press a hotkey, speak naturally, text appears. 99%+ accuracy with Whisper in 200+ languages.' },
              { title: 'Context-Aware', desc: 'Automatically detects Gmail for professional tone, Slack for casual, code editors for technical.' },
              { title: 'Real-Time Translation', desc: 'Speak English, text appears in 200+ languages. Domain-aware for legal, medical, and finance.' },
              { title: 'Privacy First', desc: 'Local Whisper model for fully offline voice-to-text. Your voice and text never leave your device.' },
            ].map((f) => (
              <div key={f.title} className="card p-5">
                <h3 className="text-[14px] font-semibold text-navy-900 mb-1">{f.title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing hint */}
        <div className="text-center">
          <div className="inline-block p-6 rounded-xl bg-[#FAFAF8] border border-gray-100">
            <p className="text-[14px] text-navy-900 font-semibold mb-1">Free to start. Pro is $12/mo.</p>
            <p className="text-[12px] text-gray-500">10 free grammar corrections per day. Upgrade for unlimited AI.</p>
            <a href="/pricing" className="text-[12px] text-navy-700 hover:text-navy-900 font-semibold mt-3 inline-block transition-colors">See pricing &rarr;</a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
