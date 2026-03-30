import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-950 border-t border-white/[0.04] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-[16px] font-bold text-white">Alec<span className="text-gold-400">Rae</span></span>
            <p className="text-[12px] text-white/25 mt-3 leading-relaxed">
              AI-powered grammar correction and voice-to-text for professionals who demand precision.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-4">Product</p>
            <div className="flex flex-col gap-2.5">
              <a href="/download" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Download</a>
              <a href="/install" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Chrome Extension</a>
              <a href="/pricing" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Pricing</a>
              <a href="/compare" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Compare</a>
              <a href="/live" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Live Demo</a>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-4">Company</p>
            <div className="flex flex-col gap-2.5">
              <a href="/security" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Security</a>
              <a href="/privacy" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Terms of Service</a>
              <a href="mailto:support@alecrae.ai" className="text-[12px] text-white/35 hover:text-white/70 transition-colors">Contact</a>
            </div>
          </div>

          {/* Trust */}
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-4">Trust</p>
            <div className="flex flex-col gap-2.5">
              <span className="text-[12px] text-white/25">256-bit AES encryption</span>
              <span className="text-[12px] text-white/25">GDPR compliant</span>
              <span className="text-[12px] text-white/25">SOC 2 in progress</span>
              <span className="text-[12px] text-white/25">Full offline mode</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/15">
            &copy; {year} AlecRae Ltd. Built in New Zealand. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-[11px] text-white/15">
            <a href="/privacy" className="hover:text-white/40 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white/40 transition-colors">Terms</a>
            <a href="/security" className="hover:text-white/40 transition-colors">Security</a>
            <a href="mailto:support@alecrae.ai" className="hover:text-white/40 transition-colors">support@alecrae.ai</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
