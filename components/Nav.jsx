'use client'

import { useState } from 'react'

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <a href="/" className="text-base font-bold tracking-tight">
          48<span className="text-indigo-600">co</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          <a href="/compare" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Compare</a>
          <a href="/pricing" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Pricing</a>
          <a href="/live" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Try Live</a>
          <a href="/download" className="text-[13px] px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all">
            Download
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-[1.5px] bg-gray-600 transition-all duration-200 ${open ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-gray-600 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-[1.5px] bg-gray-600 transition-all duration-200 ${open ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden bg-white border-t border-black/[0.04] px-6 py-4 flex flex-col gap-3">
          <a href="/compare" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors py-1">Compare</a>
          <a href="/pricing" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors py-1">Pricing</a>
          <a href="/live" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors py-1">Try Live</a>
          <a href="/install" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors py-1">Chrome Extension</a>
          <a href="/download" className="text-[14px] text-center px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all mt-1">
            Download
          </a>
        </div>
      )}
    </nav>
  )
}
