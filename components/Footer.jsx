import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-black/[0.06] py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-[16px] font-bold text-gray-900">Alec<span className="text-indigo-600">Rae</span></span>
            <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
              AI-powered grammar correction and voice-to-text for professionals who demand precision.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Product</p>
            <div className="flex flex-col gap-2">
              <a href="/download" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Download</a>
              <a href="/install" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Chrome Extension</a>
              <a href="/pricing" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Pricing</a>
              <a href="/compare" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Compare</a>
              <a href="/live" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Live Demo</a>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Company</p>
            <div className="flex flex-col gap-2">
              <a href="/security" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Security</a>
              <a href="/privacy" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Terms of Service</a>
              <a href="mailto:support@alecrae.ai" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors">Contact</a>
            </div>
          </div>
        </div>

          {/* Trust */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Trust</p>
            <div className="flex flex-col gap-2">
              <span className="text-[12px] text-gray-400">256-bit AES encryption</span>
              <span className="text-[12px] text-gray-400">GDPR compliant</span>
              <span className="text-[12px] text-gray-400">SOC 2 in progress</span>
              <span className="text-[12px] text-gray-400">Full offline mode</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-black/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-300">
            &copy; {year} AlecRae Ltd. Built in New Zealand. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-gray-300">
            <a href="/privacy" className="hover:text-gray-500 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-gray-500 transition-colors">Terms</a>
            <a href="/security" className="hover:text-gray-500 transition-colors">Security</a>
            <a href="mailto:support@alecrae.ai" className="hover:text-gray-500 transition-colors">support@alecrae.ai</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
