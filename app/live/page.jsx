'use client'

import { useState, useEffect, useRef } from 'react'

export default function LivePage() {
  const [status, setStatus] = useState('idle') // idle | recording | processing | done
  const [transcript, setTranscript] = useState('')
  const [language, setLanguage] = useState('en')
  const [bookmarkletCopied, setBookmarkletCopied] = useState(false)
  const recognitionRef = useRef(null)

  // Bookmarklet code — loads inject.js from the site
  const bookmarkletCode = `javascript:void(fetch(location.origin+'/inject.js').then(r=>r.text()).then(eval))`

  // For production, use actual domain:
  // const bookmarkletCode = `javascript:void(fetch('https://48co.nz/inject.js').then(r=>r.text()).then(eval))`

  const LANGUAGES = [
    { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' }, { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }, { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }, { code: 'ru', name: 'Russian' },
    { code: 'nl', name: 'Dutch' }, { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' }, { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' }, { code: 'sv', name: 'Swedish' },
    { code: 'mi', name: 'Maori' },
  ]

  // Punctuation post-processing
  function postProcess(text) {
    let result = text
    const PUNCT = [
      [/\b(full stop|period)\b/gi, '.'], [/\bcomma\b/gi, ','],
      [/\b(question mark)\b/gi, '?'], [/\b(exclamation mark|exclamation point)\b/gi, '!'],
      [/\bsemicolon\b/gi, ';'], [/\bcolon\b/gi, ':'],
      [/\bellipsis\b/gi, '...'], [/\bdash\b/gi, ' — '], [/\bhyphen\b/gi, '-'],
      [/\b(new line|newline)\b/gi, '\n'], [/\b(new paragraph)\b/gi, '\n\n'],
      [/\b(open paren|left paren)\b/gi, '('], [/\b(close paren|right paren)\b/gi, ')'],
      [/\b(open bracket|left bracket)\b/gi, '['], [/\b(close bracket|right bracket)\b/gi, ']'],
    ]
    for (const [p, r] of PUNCT) result = result.replace(p, r)
    result = result.replace(/\s+([.,;:!?)\]}])/g, '$1')
    result = result.replace(/([.,;:!?])([A-Za-z])/g, '$1 $2')
    result = result.replace(/^(\s*)([a-z])/, (_, ws, ch) => ws + ch.toUpperCase())
    result = result.replace(/([.!?]\s+)([a-z])/g, (_, p, ch) => p + ch.toUpperCase())
    result = result.replace(/ {2,}/g, ' ')
    return result.trim()
  }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setTranscript('Speech Recognition not supported. Use Chrome or Edge.')
      return
    }

    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = language

    rec.onstart = () => setStatus('recording')
    rec.onresult = (e) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript
      setTranscript(full)
    }
    rec.onend = () => {
      setStatus('processing')
      setTimeout(() => {
        setStatus('done')
        setTimeout(() => setStatus('idle'), 2000)
      }, 300)
    }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setTranscript('Microphone access denied. Allow it in your browser settings.')
      }
      setStatus('idle')
    }

    recognitionRef.current = rec
    rec.start()
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }

  function handleMicClick() {
    if (status === 'idle') startRecording()
    else if (status === 'recording') stopRecording()
  }

  const processedText = transcript ? postProcess(transcript) : ''

  function copyProcessedText() {
    if (processedText) {
      navigator.clipboard.writeText(processedText)
    }
  }

  function copyBookmarklet() {
    navigator.clipboard.writeText(bookmarkletCode).then(() => {
      setBookmarkletCopied(true)
      setTimeout(() => setBookmarkletCopied(false), 2000)
    })
  }

  return (
    <main className="min-h-screen bg-[#0a0a0e] text-white font-mono overflow-y-auto">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <a href="/" className="text-sm font-bold tracking-[0.2em]">
          <span className="text-white/80">48</span><span className="text-[#00f0ff]">co</span>
        </a>
        <div className="flex gap-4">
          <a href="/download" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Download App</a>
          <a href="/" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Home</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* ── Live Demo Section ──────────────────────────────── */}
        <section className="text-center mb-16">
          <h1 className="text-3xl font-bold mb-3">
            <span className="text-white/90">Try </span>
            <span className="text-[#00f0ff]">48co</span>
            <span className="text-white/90"> Live</span>
          </h1>
          <p className="text-white/35 text-sm max-w-md mx-auto">
            Test voice-to-text right here. For typing into other websites, use the bookmarklet below or download the desktop app.
          </p>
        </section>

        {/* ── Voice Recorder ────────────────────────────────── */}
        <section className="glass rounded-2xl overflow-hidden mb-8">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <span className="text-[11px] font-bold tracking-[0.2em] text-white/60">LIVE DEMO</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border border-white/10 rounded px-2 py-1 text-[10px] text-white/40 outline-none"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-[#0a0a0e]">{l.name}</option>
              ))}
            </select>
          </div>

          {/* Waveform */}
          <div className="flex items-center justify-center gap-[3px] h-12 border-b border-white/[0.06]">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`w-[3px] rounded-sm transition-all duration-300 ${
                  status === 'recording'
                    ? 'bg-[#00f0ff] animate-bar'
                    : 'bg-white/10'
                }`}
                style={{
                  height: status === 'recording' ? undefined : `${4 + (i % 5) * 3}px`,
                  animationDelay: `${(i % 5) * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="px-5 py-3 border-b border-white/[0.06]">
              <p className="text-[11px] text-white/40 leading-relaxed">{transcript}</p>
            </div>
          )}

          {/* Processed output */}
          {processedText && status !== 'recording' && (
            <div className="px-5 py-3 border-b border-white/[0.06] bg-[#00f0ff]/[0.03]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] tracking-wider text-[#00f0ff]/50">PROCESSED OUTPUT</span>
                <button
                  onClick={copyProcessedText}
                  className="text-[9px] text-[#00f0ff]/50 hover:text-[#00f0ff] transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-[12px] text-white/70 leading-relaxed whitespace-pre-wrap">{processedText}</p>
            </div>
          )}

          {/* Mic button + status */}
          <div className="py-6 flex flex-col items-center gap-3">
            <button
              onClick={handleMicClick}
              className={`w-16 h-16 rounded-full glass flex items-center justify-center transition-all duration-300 cursor-pointer ${
                status === 'recording' ? 'ring-record' :
                status === 'processing' ? 'ring-process' :
                status === 'done' ? 'ring-done' :
                'ring-idle'
              }`}
            >
              {status === 'recording' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff3b5c" strokeWidth="1.5">
                  <path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"/>
                </svg>
              ) : status === 'done' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                  <rect x="9" y="2" width="6" height="11" rx="3"/>
                  <path d="M5 10a7 7 0 0014 0"/>
                  <line x1="12" y1="21" x2="12" y2="17"/>
                  <line x1="9" y1="21" x2="15" y2="21"/>
                </svg>
              )}
            </button>
            <span className={`text-[11px] tracking-wider ${
              status === 'recording' ? 'text-[#ff3b5c]' :
              status === 'done' ? 'text-[#00ff88]' :
              'text-white/30'
            }`}>
              {status === 'idle' ? 'Click to record' :
               status === 'recording' ? 'Click to stop' :
               status === 'processing' ? 'Processing...' :
               'Done'}
            </span>
          </div>
        </section>

        {/* ── Bookmarklet Section ──────────────────────────── */}
        <section className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold text-white/80 mb-2">Use on ANY Website</h2>
          <p className="text-[11px] text-white/35 leading-relaxed mb-4">
            The bookmarklet injects the 48co voice widget into any webpage. It types directly into the page&apos;s text fields — no copy-paste needed.
          </p>

          <div className="flex flex-col gap-3">
            {/* Drag instruction */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#00f0ff]/[0.05] border border-[#00f0ff]/20">
              <span className="text-[#00f0ff] text-lg">1</span>
              <div>
                <p className="text-[11px] text-white/60 font-bold">Drag to your bookmarks bar:</p>
                <a
                  href={bookmarkletCode}
                  className="inline-block mt-1 px-4 py-1.5 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-[11px] font-bold no-underline cursor-grab"
                  onClick={(e) => e.preventDefault()}
                >
                  48co Voice
                </a>
                <p className="text-[9px] text-white/20 mt-1">Drag this link to your bookmarks bar</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
              <span className="text-white/30 text-lg">2</span>
              <div>
                <p className="text-[11px] text-white/40">Go to any website (ChatGPT, Gmail, Slack, etc.)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
              <span className="text-white/30 text-lg">3</span>
              <div>
                <p className="text-[11px] text-white/40">Click the &quot;48co Voice&quot; bookmark — the voice widget appears</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
              <span className="text-white/30 text-lg">4</span>
              <div>
                <p className="text-[11px] text-white/40">Click the mic, speak, and it types directly into the text field</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <button
              onClick={copyBookmarklet}
              className="text-[10px] text-white/25 hover:text-white/50 transition-colors"
            >
              {bookmarkletCopied ? 'Copied!' : 'Or copy the bookmarklet code manually'}
            </button>
          </div>
        </section>

        {/* ── Honest Tradeoffs ──────────────────────────────── */}
        <section className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold text-white/80 mb-3">Web vs Desktop — What You Need to Know</h2>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="text-[#00f0ff] text-sm mt-0.5">WEB</span>
              <div>
                <p className="text-[11px] text-white/50">The bookmarklet works on any website in Chrome/Edge. It uses the free Web Speech API. You need to click the bookmark on each page you visit. Only works in the browser.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-[#00ff88] text-sm mt-0.5">APP</span>
              <div>
                <p className="text-[11px] text-white/50">The desktop app works in ANY application — browser, Slack, VS Code, email, anything. One global hotkey. Higher accuracy with Whisper API. Auto-starts at login. This is what WhisperTyping/Wispr Flow do.</p>
              </div>
            </div>
          </div>

          <a
            href="/download"
            className="inline-block mt-4 px-6 py-2 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-[11px] tracking-wider hover:bg-[#00ff88]/20 transition-all"
          >
            Download Desktop App
          </a>
        </section>

      </div>

      <footer className="border-t border-white/[0.06] py-6 text-center">
        <p className="text-[10px] text-white/15 tracking-wider">48co &middot; Built in NZ &middot; Open Source</p>
      </footer>
    </main>
  )
}
