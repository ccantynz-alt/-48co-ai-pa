'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import Waveform from '../../components/Waveform'

export default function LivePage() {
  const [status, setStatus] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [language, setLanguage] = useState('en')
  const recognitionRef = useRef(null)

  const LANGUAGES = [
    { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' }, { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }, { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }, { code: 'ru', name: 'Russian' },
    { code: 'nl', name: 'Dutch' }, { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' }, { code: 'mi', name: 'Maori' },
  ]

  function postProcess(text) {
    let result = text
    const PUNCT = [
      [/\b(full stop|period)\b/gi, '.'], [/\bcomma\b/gi, ','],
      [/\b(question mark)\b/gi, '?'], [/\b(exclamation mark)\b/gi, '!'],
      [/\bcolon\b/gi, ':'], [/\bsemicolon\b/gi, ';'],
      [/\b(new line|newline)\b/gi, '\n'], [/\b(new paragraph)\b/gi, '\n\n'],
    ]
    for (const [p, r] of PUNCT) result = result.replace(p, r)
    result = result.replace(/\s+([.,;:!?)\]}])/g, '$1')
    result = result.replace(/([.,;:!?])([A-Za-z])/g, '$1 $2')
    result = result.replace(/^(\s*)([a-z])/, (_, ws, ch) => ws + ch.toUpperCase())
    result = result.replace(/([.!?]\s+)([a-z])/g, (_, p, ch) => p + ch.toUpperCase())
    return result.trim()
  }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setTranscript('Speech Recognition requires Chrome or Edge.'); return }

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
    rec.onend = () => { setStatus('done'); setTimeout(() => setStatus('idle'), 2000) }
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') setTranscript('Microphone access denied. Allow it in browser settings.')
      setStatus('idle')
    }

    recognitionRef.current = rec
    rec.start()
  }

  function stopRecording() {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null }
  }

  function handleMicClick() {
    if (status === 'idle') startRecording()
    else if (status === 'recording') stopRecording()
  }

  useEffect(() => {
    return () => { if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null } }
  }, [])

  const processedText = transcript ? postProcess(transcript) : ''

  return (
    <main className="min-h-screen bg-navy-950">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Try <span className="text-gold-400">AlecRae Voice</span> live
          </h1>
          <p className="text-white/40 text-base max-w-md mx-auto">
            Click the mic, speak, see your words. Runs entirely in your browser — no download or sign-up needed.
          </p>
        </div>

        {/* Voice Recorder */}
        <div className="max-w-lg mx-auto mb-14">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-white">Live Demo</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-[11px] text-white/40 bg-transparent border border-white/[0.06] rounded-lg px-2.5 py-1 outline-none"
                >
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${
                status === 'recording' ? 'border-red-400/30 text-red-400 bg-red-400/10' :
                status === 'done' ? 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10' :
                'border-white/[0.06] text-white/30'
              }`}>
                {status === 'recording' ? 'Listening...' : status === 'done' ? 'Done' : 'Ready'}
              </span>
            </div>

            {/* Waveform */}
            <div className="py-4 border-b border-white/[0.04] bg-navy-950">
              <Waveform isRecording={status === 'recording'} />
            </div>

            {/* Raw transcript */}
            {transcript && (
              <div className="px-5 py-3 border-b border-white/[0.04]">
                <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">Raw</p>
                <p className="text-[12px] text-white/30 leading-relaxed">{transcript}</p>
              </div>
            )}

            {/* Processed */}
            {processedText && status !== 'recording' && (
              <div className="px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-gold-400 uppercase tracking-wider font-medium">Processed</p>
                  <button
                    onClick={() => navigator.clipboard?.writeText(processedText)}
                    className="text-[10px] text-white/40 hover:text-white/70 transition-colors font-medium"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[13px] text-white leading-relaxed whitespace-pre-wrap">{processedText}</p>
              </div>
            )}

            {/* Mic button */}
            <div className="py-8 flex flex-col items-center gap-3">
              <button
                onClick={handleMicClick}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                  status === 'recording' ? 'border-red-400 bg-red-400/10 shadow-[0_0_20px_rgba(220,38,38,0.12)]' :
                  status === 'done' ? 'border-emerald-400 bg-emerald-400/10' :
                  'border-white/[0.12] bg-white/[0.04] hover:border-white/[0.2]'
                }`}
              >
                {status === 'recording' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5"><path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"/></svg>
                ) : status === 'done' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#daa73b" strokeWidth="1.5"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="21" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/></svg>
                )}
              </button>
              <span className={`text-[12px] font-medium ${
                status === 'recording' ? 'text-red-400' : status === 'done' ? 'text-emerald-400' : 'text-white/30'
              }`}>
                {status === 'recording' ? 'Click to stop' : status === 'done' ? 'Done' : 'Click to try'}
              </span>
            </div>
          </div>
        </div>

        {/* What this demo shows */}
        <div className="max-w-lg mx-auto mb-14">
          <h2 className="text-lg font-bold text-white mb-5 text-center">What this demo shows</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Voice punctuation', desc: 'Say "comma", "period", "new line" — they convert automatically' },
              { title: 'Auto-capitalization', desc: 'First letter + after periods get capitalized' },
              { title: '200+ languages', desc: 'Switch language above. Full app supports real-time translation.' },
              { title: 'Real-time', desc: 'Words appear as you speak, not after you stop' },
            ].map(f => (
              <div key={f.title} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.03]">
                <h3 className="text-[12px] font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-[11px] text-white/30 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Want more? */}
        <div className="text-center">
          <h2 className="text-lg font-bold text-white mb-2">Want AI grammar + rewrite?</h2>
          <p className="text-[13px] text-white/40 mb-5">This demo uses free browser speech. The full app adds AI grammar correction, tone adjustment, and 99%+ accuracy.</p>
          <Link href="/download" className="inline-block px-6 py-3 rounded-lg bg-gold-400 text-navy-950 text-[13px] font-semibold hover:bg-gold-300 transition-all">
            Download the Full App
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
