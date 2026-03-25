export const metadata = {
  title: '48co Pricing — Voice-to-Text Plans | Free, Pro & Teams',
  description: 'Choose your 48co plan. Free basic dictation, Pro with AI rewrite and offline mode for $12/mo, or Teams with meeting transcription. Lifetime deal available.',
  openGraph: {
    title: '48co Pricing — AI Voice-to-Text That Works Everywhere',
    description: 'Free tier, $12/mo Pro with AI rewrite, $89 lifetime deal. Cheaper than Wispr Flow, more features than SuperWhisper.',
  },
}

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      highlight: false,
      features: [
        'Basic voice dictation',
        '60 minutes per month',
        'Web Speech API (Chrome/Edge)',
        'Works in any app',
        'Voice punctuation commands',
      ],
      cta: 'Download Free',
      ctaHref: '/download',
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/month or $99/year',
      highlight: true,
      badge: 'MOST POPULAR',
      features: [
        'Unlimited dictation',
        'Whisper API (99%+ accuracy)',
        'AI Rewrite Mode (Claude)',
        'Context-aware formatting',
        'Offline mode (whisper.cpp)',
        '50+ languages',
        'Custom vocabulary',
        'Voice macros & templates',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      ctaHref: '/download',
    },
    {
      name: 'Teams',
      price: '$25',
      period: '/user/month (min 3)',
      highlight: false,
      features: [
        'Everything in Pro',
        'Meeting transcription',
        'Speaker identification',
        'Shared team macros',
        'Admin dashboard',
        'Usage analytics',
        'Priority support',
        'Custom onboarding',
      ],
      cta: 'Contact Us',
      ctaHref: 'mailto:team@48co.nz',
    },
  ]

  return (
    <main className="min-h-screen bg-[#0a0a0e] text-white font-mono">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <a href="/" className="text-sm font-bold tracking-[0.2em]">
          <span className="text-white/80">48</span><span className="text-[#00f0ff]">co</span>
        </a>
        <div className="flex gap-4">
          <a href="/download" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Download</a>
          <a href="/compare" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Compare</a>
          <a href="/live" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Try Live</a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold mb-3">
            Simple, honest pricing
          </h1>
          <p className="text-white/35 text-sm max-w-md mx-auto">
            No hidden fees. No per-minute charges on Pro. Cancel anytime.
          </p>
        </div>

        {/* Lifetime Deal Banner */}
        <div className="mb-12 p-4 rounded-2xl bg-[#00ff88]/[0.05] border border-[#00ff88]/20 text-center">
          <p className="text-[#00ff88] text-sm font-bold mb-1">Launch Special: Lifetime Deal</p>
          <p className="text-white/50 text-xs">
            Get Pro features forever for <span className="text-[#00ff88] font-bold">$89 one-time</span>.
            Limited to first 1,000 users. No subscription, no renewals, ever.
          </p>
          <a href="/download" className="inline-block mt-3 px-6 py-2 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-[11px] tracking-wider hover:bg-[#00ff88]/20 transition-all">
            Claim Lifetime Deal
          </a>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col ${
                plan.highlight
                  ? 'bg-[#00f0ff]/[0.05] border-2 border-[#00f0ff]/30 relative'
                  : 'bg-white/[0.02] border border-white/[0.06]'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00f0ff] text-[#0a0a0e] text-[9px] font-bold tracking-wider px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <h2 className="text-lg font-bold text-white/90 mb-1">{plan.name}</h2>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-[11px] text-white/30 ml-1">{plan.period}</span>
              </div>

              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-[11px] text-white/50 flex items-start gap-2">
                    <span className="text-[#00f0ff] mt-0.5 flex-shrink-0">+</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaHref}
                className={`block text-center py-2.5 rounded-xl text-[11px] tracking-wider transition-all ${
                  plan.highlight
                    ? 'bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/30'
                    : 'bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/80'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-white/80 mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-white/60 font-bold mb-1">Do I need an API key?</h3>
              <p className="text-[11px] text-white/35 leading-relaxed">
                The Free tier uses Web Speech API (no key needed, Chrome/Edge only). Pro uses OpenAI Whisper API for higher accuracy — you&apos;ll need an OpenAI key (~$0.006/min). AI Rewrite uses Claude API (~$0.003/rewrite).
              </p>
            </div>
            <div>
              <h3 className="text-sm text-white/60 font-bold mb-1">How is this different from Wispr Flow?</h3>
              <p className="text-[11px] text-white/35 leading-relaxed">
                Wispr Flow sends all audio to the cloud. 48co offers fully offline mode — your voice never leaves your computer. We also cost $3/mo less and offer a $89 lifetime deal that Wispr never will.
              </p>
            </div>
            <div>
              <h3 className="text-sm text-white/60 font-bold mb-1">What about SuperWhisper?</h3>
              <p className="text-[11px] text-white/35 leading-relaxed">
                SuperWhisper is excellent but started Mac-only. 48co works on both Mac and Windows from day one, with AI rewrite and context-aware formatting that SuperWhisper doesn&apos;t offer.
              </p>
            </div>
            <div>
              <h3 className="text-sm text-white/60 font-bold mb-1">Can I cancel anytime?</h3>
              <p className="text-[11px] text-white/35 leading-relaxed">
                Yes. No contracts, no penalties. Or grab the lifetime deal and never think about it again.
              </p>
            </div>
            <div>
              <h3 className="text-sm text-white/60 font-bold mb-1">What&apos;s AI Rewrite Mode?</h3>
              <p className="text-[11px] text-white/35 leading-relaxed">
                You speak rough thoughts, and Claude AI polishes them before typing. It automatically adjusts tone based on which app you&apos;re in — professional for email, casual for Slack, technical for code editors. No other dictation tool does this.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/[0.06] py-6 text-center">
        <p className="text-[10px] text-white/15 tracking-wider">48co &middot; Built in NZ &middot; Privacy-first voice-to-text</p>
      </footer>
    </main>
  )
}
