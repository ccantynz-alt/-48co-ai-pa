export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] py-10 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-bold text-gray-800">48<span className="text-indigo-600">co</span></span>
            <span className="text-[11px] text-gray-300">|</span>
            <span className="text-[12px] text-gray-400">AI Grammar & Voice</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[12px] text-gray-400">
            <a href="/" className="hover:text-gray-700 transition-colors">Home</a>
            <a href="/download" className="hover:text-gray-700 transition-colors">Download</a>
            <a href="/compare" className="hover:text-gray-700 transition-colors">Compare</a>
            <a href="/pricing" className="hover:text-gray-700 transition-colors">Pricing</a>
            <a href="/live" className="hover:text-gray-700 transition-colors">Try Live</a>
            <a href="/install" className="hover:text-gray-700 transition-colors">Extension</a>
          </div>

          <p className="text-[11px] text-gray-300">Built in New Zealand</p>
        </div>
      </div>
    </footer>
  )
}
