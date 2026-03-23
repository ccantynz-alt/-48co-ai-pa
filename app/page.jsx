'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import MicToggle from '../components/MicToggle'
import Waveform from '../components/Waveform'

// Voice commands that trigger specific actions
const VOICE_COMMANDS = {
  'claude refactor this': 'Refactor the following code. Identify inefficiencies, simplify logic, and rewrite it cleanly:\n\n',
  'claude explain this':  'Explain what the following code does, step by step:\n\n',
  'claude debug this':    'Debug the following code. Find any errors, explain them, and provide a fix:\n\n',
  'send it':              '__SUBMIT__',
  'cancel':               '__CANCEL__',
}

// Keywords that trigger auto code-fence wrapping
const CODING_KEYWORDS = ['function', 'class', 'import', 'const', 'let', 'var',
  'loop', 'array', 'object', 'return', 'async', 'await', 'def']

export default function HUD() {
  const [status, setStatus] = useState('idle')       // idle | record | process | done
  const [transcript, setTranscript] = useState('')
  const [codingMode, setCodingMode] = useState(false) // manual code mode toggle
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    noiseSuppression: true,
    autoCoding: true,
    typeSpeed: 30,
    autoSubmit: false,
  })
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')

  // Keep ref in sync so onend callback reads latest value
  useEffect(() => { transcriptRef.current = transcript }, [transcript])

  // ── Detect coding content ────────────────────────────────────────
  const isCodingText = (text) =>
    CODING_KEYWORDS.some(k => text.toLowerCase().includes(k))

  const wrapAsCode = (text) => {
    const lower = text.toLowerCase()
    const lang = lower.includes('python') || lower.includes('def') ? 'python' : 'javascript'
    return `\`\`\`${lang}\n${text}\n\`\`\``
  }

  // ── Check for voice commands ─────────────────────────────────────
  const checkVoiceCommands = (text) => {
    const lower = text.toLowerCase().trim()
    for (const [trigger, action] of Object.entries(VOICE_COMMANDS)) {
      if (lower.includes(trigger)) return action
    }
    return null
  }

  // ── Paste text into the active window via clipboard ──────────────
  const pasteText = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('done')
      setTimeout(() => {
        setStatus('idle')
        setTranscript('')
      }, 1500)
    } catch {
      setStatus('idle')
    }
  }, [])

  // ── Process transcript after recording ends ──────────────────────
  const processTranscript = useCallback((text) => {
    if (!text) {
      setStatus('idle')
      return
    }

    setStatus('process')

    const command = checkVoiceCommands(text)

    if (command === '__CANCEL__') {
      setTranscript('')
      setStatus('idle')
      return
    }

    if (command === '__SUBMIT__') {
      // Simulate Enter key press on the focused element
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      )
      setTranscript('')
      setStatus('idle')
      return
    }

    let output = command || text

    // Auto coding mode: wrap in fences if coding keywords detected
    if (codingMode || (settings.autoCoding && isCodingText(output))) {
      output = wrapAsCode(output)
    }

    pasteText(output)
  }, [codingMode, settings.autoCoding, pasteText])

  // ── Start recording ──────────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (status !== 'idle') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-NZ'

    recognition.onstart = () => setStatus('record')

    recognition.onresult = (e) => {
      // Build full transcript from all results
      let full = ''
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript
      }
      setTranscript(full)
    }

    recognition.onend = () => {
      processTranscript(transcriptRef.current)
    }

    recognition.onerror = (e) => {
      if (e.error !== 'aborted') setStatus('idle')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [status, processTranscript])

  // ── Stop recording ───────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  // ── Handle toggle from MicToggle (scroll + click) ────────────────
  const handleToggle = useCallback((action) => {
    if (action === 'start') startRecording()
    if (action === 'stop')  stopRecording()
  }, [startRecording, stopRecording])

  // ── Keyboard shortcut: Ctrl/Cmd + Shift + Space ──────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'Space') {
        e.preventDefault()
        if (status === 'idle')   startRecording()
        if (status === 'record') stopRecording()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [status, startRecording, stopRecording])

  // ── Update a settings field ──────────────────────────────────────
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0e] relative">

      {/* ── HUD Panel ──────────────────────────────────────────── */}
      <div className="glass rounded-2xl w-[380px] overflow-hidden select-none z-10">

        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <span className="text-[13px] font-bold tracking-[0.2em] text-white/80">
            &#8803; 48CO
          </span>
          <div className="flex items-center gap-2">
            {/* Code mode toggle */}
            <button
              onClick={() => setCodingMode(m => !m)}
              className={`text-[10px] px-2 py-1 rounded border transition-all ${
                codingMode
                  ? 'border-[#00f0ff] text-[#00f0ff]'
                  : 'border-white/10 text-white/30 hover:border-white/20'
              }`}
            >
              CODE
            </button>

            {/* Settings gear */}
            <button
              onClick={() => setShowSettings(s => !s)}
              className="text-white/30 hover:text-white/60 transition-colors text-[16px] leading-none"
              title="Settings"
            >
              &#9881;
            </button>
          </div>
        </div>

        {/* Waveform */}
        <div className="py-4 border-b border-white/[0.06]">
          <Waveform isRecording={status === 'record'} />
        </div>

        {/* Mic toggle — the star of the show */}
        <div className="py-6 flex flex-col items-center gap-4">
          <MicToggle status={status} onToggle={handleToggle} />

          {/* Transcript preview */}
          {transcript && (
            <p className="text-[11px] text-white/40 text-center px-6 leading-relaxed max-h-16 overflow-hidden">
              {transcript}
            </p>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-white/[0.06]">
          <p className="text-[10px] text-white/20 text-center tracking-wider">
            CTRL+SHIFT+SPACE &middot; SCROLL &uarr;&darr; &middot; CLICK
          </p>
        </div>
      </div>

      {/* ── Settings Panel (slides from right) ─────────────────── */}
      <div
        className={`
          glass rounded-2xl w-[300px] p-5 fixed right-4 top-4 bottom-4 overflow-y-auto z-20
          transition-transform duration-300 ease-in-out
          ${showSettings ? 'translate-x-0' : 'translate-x-[340px]'}
        `}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[12px] tracking-[0.2em] text-white/60">SETTINGS</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="text-white/30 hover:text-white/60 transition-colors text-lg"
          >
            &times;
          </button>
        </div>

        {/* Audio */}
        <Section title="AUDIO">
          <Setting label="Input device">
            <select className="bg-white/5 border border-white/10 text-white/60 text-[11px] rounded px-2 py-1 w-full outline-none">
              <option>Default Mic</option>
            </select>
          </Setting>
          <Setting label="Noise suppression">
            <Toggle
              on={settings.noiseSuppression}
              onChange={(v) => updateSetting('noiseSuppression', v)}
            />
          </Setting>
        </Section>

        {/* Transcription */}
        <Section title="TRANSCRIPTION">
          <Setting label="Engine">
            <select className="bg-white/5 border border-white/10 text-white/60 text-[11px] rounded px-2 py-1 w-full outline-none">
              <option>Browser (Web Speech)</option>
              <option>Whisper (coming soon)</option>
            </select>
          </Setting>
          <Setting label="Auto coding mode">
            <Toggle
              on={settings.autoCoding}
              onChange={(v) => updateSetting('autoCoding', v)}
            />
          </Setting>
        </Section>

        {/* Behaviour */}
        <Section title="BEHAVIOUR">
          <Setting label={`Type speed: ${settings.typeSpeed}ms`}>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.typeSpeed}
              onChange={(e) => updateSetting('typeSpeed', Number(e.target.value))}
              className="w-full accent-[#00f0ff]"
            />
          </Setting>
          <Setting label="Auto-submit on paste">
            <Toggle
              on={settings.autoSubmit}
              onChange={(v) => updateSetting('autoSubmit', v)}
            />
          </Setting>
        </Section>

        {/* Templates */}
        <Section title="TEMPLATES">
          {Object.keys(VOICE_COMMANDS)
            .filter(k => k !== 'send it' && k !== 'cancel')
            .map(cmd => (
              <div key={cmd} className="text-[10px] text-white/30 py-1.5 border-b border-white/5">
                &ldquo;{cmd}&rdquo;
              </div>
            ))}
        </Section>
      </div>

      {/* Backdrop when settings open */}
      {showSettings && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSettings(false)}
        />
      )}
    </main>
  )
}

// ── Small helper components ──────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] tracking-[0.15em] text-white/30 mb-2">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Setting({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-white/50 flex-1">{label}</span>
      {children}
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${
        on ? 'bg-[#00f0ff]/40' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
          on ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}
