'use client'

import { useState } from 'react'

const STEPS = [
  {
    number: '1',
    title: 'Download',
    desc: 'Click the button above. You\'ll get a .zip file called 48co-extension.zip.',
    detail: null,
  },
  {
    number: '2',
    title: 'Unzip',
    desc: 'Extract the zip file. You\'ll see a folder called extension/ with these files inside:',
    detail: 'manifest.json, background.js, content.js, popup.html, and more.',
  },
  {
    number: '3',
    title: 'Open Chrome Extensions',
    desc: 'Type this into your Chrome address bar and press Enter:',
    detail: 'chrome://extensions',
  },
  {
    number: '4',
    title: 'Enable Developer Mode',
    desc: 'In the top-right corner of the extensions page, flip the "Developer mode" toggle ON.',
    detail: null,
  },
  {
    number: '5',
    title: 'Load the extension',
    desc: 'Click "Load unpacked" (top-left), then select the extension/ folder you unzipped.',
    detail: null,
  },
  {
    number: '6',
    title: 'Done — go to an AI chat',
    desc: 'Open Claude.ai, ChatGPT, Gemini, or DeepSeek. The 48co mic widget appears in the bottom-right. Scroll up to record.',
    detail: null,
  },
]

export default function InstallPage() {
  const [downloaded, setDownloaded] = useState(false)

  return (
    <main className="min-h-screen bg-[#0a0a0e] text-white font-mono">
      <div className="max-w-xl mx-auto px-4 py-16">
        {/* Back link */}
        <a href="/" className="text-[11px] text-white/20 hover:text-white/40 transition-colors">
          &larr; Back to 48co.nz
        </a>

        <h1 className="text-3xl font-bold mt-8 mb-2">Install 48co</h1>
        <p className="text-white/35 text-sm mb-10">
          Takes about 60 seconds. No account needed.
        </p>

        {/* Download button */}
        <a
          href="/48co-extension.zip"
          download="48co-extension.zip"
          onClick={() => setDownloaded(true)}
          className={`
            inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold tracking-wider transition-all mb-12
            ${downloaded
              ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]'
              : 'bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/20'
            }
          `}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {downloaded ? 'Downloaded! Now follow the steps below' : 'Download 48co-extension.zip'}
        </a>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] flex items-center justify-center text-sm font-bold">
                  {step.number}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white/80 mb-1">{step.title}</h3>
                  <p className="text-[12px] text-white/40 leading-relaxed">{step.desc}</p>
                  {step.detail && (
                    <code className="inline-block mt-2 text-[11px] text-[#00f0ff]/70 bg-[#00f0ff]/5 px-3 py-1.5 rounded border border-[#00f0ff]/10">
                      {step.detail}
                    </code>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Troubleshooting */}
        <div className="mt-12 glass rounded-2xl p-6">
          <h3 className="text-[11px] tracking-[0.15em] text-white/25 mb-4 uppercase">Troubleshooting</h3>
          <div className="space-y-3 text-[12px] text-white/35 leading-relaxed">
            <p><span className="text-white/50">Widget not showing?</span> Refresh the AI chat page after installing. The extension only loads on claude.ai, chatgpt.com, gemini.google.com, and chat.deepseek.com.</p>
            <p><span className="text-white/50">Mic not working?</span> Chrome will ask for microphone permission the first time. Click "Allow".</p>
            <p><span className="text-white/50">Nothing happens when you speak?</span> Make sure you&apos;re using Chrome or Edge. Firefox and Safari don&apos;t support the Web Speech API.</p>
          </div>
        </div>

        {/* Quick start after install */}
        <div className="mt-8 text-center">
          <p className="text-white/20 text-[11px] mb-4">After installing, try it on:</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="https://claude.ai" target="_blank" className="px-4 py-2 rounded-lg border border-white/10 text-white/40 text-[11px] hover:border-white/20 transition-all">Claude.ai</a>
            <a href="https://chatgpt.com" target="_blank" className="px-4 py-2 rounded-lg border border-white/10 text-white/40 text-[11px] hover:border-white/20 transition-all">ChatGPT</a>
            <a href="https://gemini.google.com" target="_blank" className="px-4 py-2 rounded-lg border border-white/10 text-white/40 text-[11px] hover:border-white/20 transition-all">Gemini</a>
            <a href="https://chat.deepseek.com" target="_blank" className="px-4 py-2 rounded-lg border border-white/10 text-white/40 text-[11px] hover:border-white/20 transition-all">DeepSeek</a>
          </div>
        </div>
      </div>
    </main>
  )
}
