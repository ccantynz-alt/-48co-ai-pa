export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          <div className="max-w-xs">
            <span className="text-[17px] font-bold tracking-tight">
              48<span className="text-gold-400">co</span>
              <span className="text-[10px] font-medium text-white/40 tracking-widest uppercase ml-2">Voice</span>
            </span>
            <p className="text-[13px] text-white/50 mt-3 leading-relaxed">
              AI grammar, voice-to-text, and translation for legal, accounting, and medical professionals.
            </p>
            <p className="text-[11px] text-white/30 mt-4">Built in New Zealand</p>
          </div>

          <div className="flex gap-20">
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-4">Product</p>
              <div className="flex flex-col gap-3 text-[13px] text-white/50">
                <a href="/download" className="hover:text-white transition-colors">Download</a>
                <a href="/install" className="hover:text-white transition-colors">Chrome Extension</a>
                <a href="/live" className="hover:text-white transition-colors">Try Live</a>
                <a href="/compare" className="hover:text-white transition-colors">Compare</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-4">Company</p>
              <div className="flex flex-col gap-3 text-[13px] text-white/50">
                <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="mailto:support@48co.nz" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/30">&copy; {new Date().getFullYear()} 48co Ltd. All rights reserved.</p>
          <p className="text-[11px] text-white/30">Your data is encrypted and never shared with third parties.</p>
        </div>
      </div>
    </footer>
  )
}
