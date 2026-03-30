export default function Nav() {
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
      </div>
    </nav>
  )
}
