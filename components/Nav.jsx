export default function Nav() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <a href="/" className="text-base font-bold tracking-tight">
          Alec<span className="text-indigo-600">Rae</span>
        </a>
        <div className="hidden sm:flex items-center gap-6">
          <a href="/compare" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Compare</a>
          <a href="/pricing" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Pricing</a>
          <a href="/live" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Try Live</a>
          <a href="/download" className="text-[13px] px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all">
            Download
          </a>
        </div>
      </div>
    </nav>
  )
}
