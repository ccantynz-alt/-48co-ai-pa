'use client'

import { useState } from 'react'

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.04]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-2">
          <span className="text-[17px] font-bold tracking-tight text-navy-900">
            48<span className="text-gold-500">co</span>
          </span>
          <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase hidden sm:inline">Voice</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/compare" className="text-[13px] text-gray-500 hover:text-navy-900 transition-colors font-medium">Compare</a>
          <a href="/pricing" className="text-[13px] text-gray-500 hover:text-navy-900 transition-colors font-medium">Pricing</a>
          <a href="/live" className="text-[13px] text-gray-500 hover:text-navy-900 transition-colors font-medium">Try Live</a>
          <a href="/download" className="text-[13px] px-5 py-2 rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-all font-medium">
            Download
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-[1.5px] bg-navy-900 transition-all duration-200 ${open ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-navy-900 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-navy-900 transition-all duration-200 ${open ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-black/[0.04] px-6 py-5 flex flex-col gap-4">
          <a href="/compare" className="text-[14px] text-gray-600 hover:text-navy-900 transition-colors font-medium py-1">Compare</a>
          <a href="/pricing" className="text-[14px] text-gray-600 hover:text-navy-900 transition-colors font-medium py-1">Pricing</a>
          <a href="/live" className="text-[14px] text-gray-600 hover:text-navy-900 transition-colors font-medium py-1">Try Live</a>
          <a href="/install" className="text-[14px] text-gray-600 hover:text-navy-900 transition-colors font-medium py-1">Chrome Extension</a>
          <a href="/download" className="text-[14px] text-center px-5 py-2.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-all font-medium mt-2">
            Download
          </a>
        </div>
      )}
    </nav>
  )
}
