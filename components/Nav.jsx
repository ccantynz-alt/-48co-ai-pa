'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-navy-950/95 backdrop-blur-xl border-b border-white/[0.10]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2.5">
          <span className="text-[18px] font-bold tracking-tight text-white">
            Alec<span className="text-gold-400">Rae</span>
          </span>
          <span className="text-[9px] text-white/30 font-semibold tracking-[0.2em] uppercase hidden sm:inline">Voice</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="/pricing" className="text-[13px] text-white/60 hover:text-white transition-colors">Pricing</a>
          <a href="/compare" className="text-[13px] text-white/60 hover:text-white transition-colors">Compare</a>
          <a href="/security" className="text-[13px] text-white/60 hover:text-white transition-colors">Security</a>
          <a href="/live" className="text-[13px] text-white/60 hover:text-white transition-colors">Try Live</a>
        </div>

        <div className="flex items-center gap-3">
          <a href="/download" className="text-[13px] px-6 py-2 rounded-lg bg-gold-400 text-navy-950 hover:bg-gold-300 transition-all font-semibold">
            Get Started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-[1.5px] bg-white/60 transition-all duration-200 ${open ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-white/60 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-white/60 transition-all duration-200 ${open ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-navy-950 border-t border-white/[0.06] px-6 py-5 flex flex-col gap-4">
          <Link href="/compare" className="text-[14px] text-white/50 hover:text-white transition-colors font-medium py-1">Compare</Link>
          <Link href="/pricing" className="text-[14px] text-white/50 hover:text-white transition-colors font-medium py-1">Pricing</Link>
          <Link href="/security" className="text-[14px] text-white/50 hover:text-white transition-colors font-medium py-1">Security</Link>
          <Link href="/live" className="text-[14px] text-white/50 hover:text-white transition-colors font-medium py-1">Try Live</Link>
          <Link href="/download" className="text-[14px] text-center px-5 py-2.5 rounded-lg bg-gold-400 text-navy-950 hover:bg-gold-300 transition-all font-semibold mt-2">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  )
}
