'use client'

import { useEffect } from 'react'

// Status config — ring class, label text, and label colour per state
const STATUS = {
  idle:    { label: 'Middle-click to record', ring: 'ring-idle',    color: 'text-white/40' },
  record:  { label: 'Middle-click to stop',   ring: 'ring-record',  color: 'text-[#ff3b5c]' },
  process: { label: 'Transcribing\u2026',      ring: 'ring-process', color: 'text-[#ffb800]' },
  done:    { label: 'Pasted \u2713',           ring: 'ring-done',    color: 'text-[#00ff88]' },
}

export default function MicToggle({ status, onToggle }) {
  const { label, ring, color } = STATUS[status] || STATUS.idle

  // ── Middle-click (wheel button press) listener — anywhere on page ──
  useEffect(() => {
    const handler = (e) => {
      if (e.button !== 1) return          // only middle mouse button
      e.preventDefault()                   // prevent auto-scroll
      if (status === 'idle')   onToggle('start')
      if (status === 'record') onToggle('stop')
    }
    // mousedown for the press, auxclick to prevent default browser behavior
    const preventAux = (e) => { if (e.button === 1) e.preventDefault() }
    window.addEventListener('mousedown', handler)
    window.addEventListener('auxclick', preventAux)
    return () => {
      window.removeEventListener('mousedown', handler)
      window.removeEventListener('auxclick', preventAux)
    }
  }, [onToggle, status])

  // ── Click handler — toggles between idle/recording ─────────────
  const handleClick = () => {
    if (status === 'idle')   onToggle('start')
    if (status === 'record') onToggle('stop')
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* The mic button */}
      <button
        onClick={handleClick}
        title="Click or middle-click to toggle mic"
        className={`
          w-14 h-14 rounded-full glass flex items-center justify-center
          transition-all duration-300 cursor-pointer select-none
          ${ring}
        `}
      >
        {status === 'idle'    && <MicIcon    className="w-6 h-6 text-white/60" />}
        {status === 'record'  && <WaveIcon   className="w-6 h-6 text-[#ff3b5c]" />}
        {status === 'process' && <SpinnerIcon className="w-6 h-6 text-[#ffb800] animate-spin" />}
        {status === 'done'    && <CheckIcon  className="w-6 h-6 text-[#00ff88]" />}
      </button>

      {/* Status label */}
      <span className={`text-[11px] font-mono tracking-wider transition-all duration-300 ${color}`}>
        {label}
      </span>
    </div>
  )
}

// ── Inline SVG icons (no external deps) ──────────────────────────────
function MicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0014 0" />
      <line x1="12" y1="21" x2="12" y2="17" />
      <line x1="9" y1="21" x2="15" y2="21" />
    </svg>
  )
}

function WaveIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2" />
    </svg>
  )
}

function SpinnerIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
