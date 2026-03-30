'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.04]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <a href="/" className="flex items-center gap-2">
          <span className="text-[17px] font-bold tracking-tight text-gray-900">
            Alec<span className="text-indigo-600">Rae</span>
          </span>
          <span className="text-[10px] text-gray-300 font-medium tracking-wider uppercase hidden sm:inline">Voice</span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          <a href="/pricing" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Pricing</a>
          <a href="/compare" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Compare</a>
          <a href="/security" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Security</a>
          <a href="/live" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Try Live</a>
        </div>

        <div className="flex items-center gap-3">
          <a href="/download" className="text-[13px] px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-medium">
            Get Started
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
          <Link href="/compare" className="text-[14px] text-gray-600 hover:text-navy-900 transition-colors font-medium py-1">Compare</Link>
          <Link href="/pricing" className="text-[14px] text-gray-600 hover:text-navy-900 transition-colors font-medium py-1">Pricing</Link>
          <Link href="/live" className="text-[14px] text-gray-600 hover:text-navy-900 transition-colors font-medium py-1">Try Live</Link>
          <Link href="/install" className="text-[14px] text-gray-600 hover:text-navy-900 transition-colors font-medium py-1">Chrome Extension</Link>
          <Link href="/download" className="text-[14px] text-center px-5 py-2.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-all font-medium mt-2">
            Download
          </Link>
        </div>
      )}
    </nav>
  )
}
