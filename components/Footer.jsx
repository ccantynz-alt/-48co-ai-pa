export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] py-12 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">
          <div>
            <span className="text-[15px] font-bold text-gray-800">48<span className="text-indigo-600">co</span></span>
            <p className="text-[12px] text-gray-400 mt-1.5">AI grammar & voice-to-text for professionals.</p>
            <p className="text-[11px] text-gray-300 mt-3">Built in New Zealand</p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Product</p>
              <div className="flex flex-col gap-2 text-[12px] text-gray-400">
                <a href="/download" className="hover:text-gray-700 transition-colors">Download</a>
                <a href="/install" className="hover:text-gray-700 transition-colors">Chrome Extension</a>
                <a href="/live" className="hover:text-gray-700 transition-colors">Try Live</a>
                <a href="/compare" className="hover:text-gray-700 transition-colors">Compare</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Company</p>
              <div className="flex flex-col gap-2 text-[12px] text-gray-400">
                <a href="/pricing" className="hover:text-gray-700 transition-colors">Pricing</a>
                <a href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</a>
                <a href="mailto:support@48co.nz" className="hover:text-gray-700 transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-black/[0.04] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-300">&copy; {new Date().getFullYear()} 48co Ltd. All rights reserved.</p>
          <p className="text-[11px] text-gray-300">Your data is encrypted and never shared with third parties.</p>
        </div>
      </div>
    </footer>
  )
}
