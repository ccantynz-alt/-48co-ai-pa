export const metadata = {
  title: '48co Pricing — AI Grammar & Voice Plans | Free, Pro & Teams',
  description: 'AI grammar correction + voice-to-text on every device. Free to start, Pro at $12/mo, Business $29/mo for 10 users. 60% cheaper than Grammarly.',
  openGraph: {
    title: '48co Pricing — AI Grammar That Works Everywhere',
    description: 'Free grammar checks, $12/mo Pro, $29/mo Business for 10 users. 60% cheaper than Grammarly Premium.',
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
        '10 AI grammar corrections per day',
        'Basic voice dictation (60 min/mo)',
        'Chrome extension',
        'Works on any website',
        'Spelling + punctuation fixes',
      ],
      cta: 'Get Started Free',
      ctaHref: '/download',
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/month or $99/year',
      highlight: true,
      badge: 'MOST POPULAR',
      features: [
        'Unlimited AI grammar corrections',
        'Unlimited voice-to-text',
        'AI Rewrite Mode (tone + polish)',
        'Preserve My Voice (learns your style)',
        'Context-aware (email, Slack, code)',
        'Desktop app (Mac + Windows)',
        'Chrome extension (all websites)',
        'iPhone + Android keyboard (coming)',
        'Offline mode (privacy-first)',
        '50+ languages',
        'Custom vocabulary + macros',
      ],
      cta: 'Start 7-Day Free Trial',
      ctaHref: '/download',
    },
    {
      name: 'Business',
      price: '$29',
      period: '/month — up to 10 users',
      highlight: false,
      badge: 'BEST VALUE',
      features: [
        'Everything in Pro for up to 10 users',
        'Team style guide enforcement',
        'Shared vocabulary across team',
        'Admin dashboard + usage analytics',
        'Priority support',
        'Invoice billing',
        'That\u2019s just $2.90 per user',
      ],
      cta: 'Start Business Trial',
      ctaHref: 'mailto:team@48co.nz',
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <a href="/" className="text-base font-bold tracking-tight">48<span className="text-indigo-600">co</span></a>
          <div className="hidden sm:flex items-center gap-6">
            <a href="/compare" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Compare</a>
            <a href="/live" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Try Live</a>
            <a href="/download" className="text-[13px] px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all">Download</a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Simple, honest pricing</h1>
          <p className="text-gray-400 text-base max-w-md mx-auto">
            Free to start. No credit card needed. Upgrade when you&apos;re ready.
          </p>
        </div>

        {/* Business Highlight */}
        <div className="mb-12 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
          <p className="text-indigo-700 text-[15px] font-semibold mb-1">Business: $29/mo for your whole team (up to 10)</p>
          <p className="text-gray-500 text-[13px]">
            That&apos;s just $2.90 per user. Grammarly Business charges $15/user/mo — 5x more.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl p-6 flex flex-col border ${
              plan.highlight ? 'border-indigo-200 bg-indigo-50/30 shadow-lg shadow-indigo-500/5 relative' : 'border-gray-200'
            }`}>
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <h2 className="text-lg font-bold text-gray-800 mb-1">{plan.name}</h2>
              <div className="mb-5">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-[13px] text-gray-400 ml-1">{plan.period}</span>
              </div>
              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-[13px] text-gray-500 flex items-start gap-2">
                    <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href={plan.ctaHref} className={`block text-center py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* vs Grammarly */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">48co Pro vs Grammarly Premium</h2>
            <p className="text-[14px] text-gray-400">Same job, better AI, lower price.</p>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-5 text-gray-400 font-normal">Feature</th>
                  <th className="text-center py-3 px-5 text-indigo-600 font-semibold">48co Pro</th>
                  <th className="text-center py-3 px-5 text-gray-400 font-normal">Grammarly Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'Monthly price', us: '$12/mo', them: '$30/mo' },
                  { f: 'Annual price', us: '$99/year', them: '$144/year' },
                  { f: 'Business (10 users)', us: '$29/mo', them: '$150/mo' },
                  { f: 'AI grammar correction', us: true, them: true },
                  { f: 'Tone adjustment', us: true, them: true },
                  { f: 'Voice-to-text', us: true, them: false },
                  { f: 'AI Rewrite Mode', us: true, them: 'Limited' },
                  { f: 'Context-aware (app detection)', us: true, them: false },
                  { f: 'Desktop app (types into any app)', us: true, them: false },
                  { f: 'Offline mode', us: true, them: false },
                  { f: 'AI engine', us: 'Claude (latest)', them: 'Proprietary' },
                  { f: 'Developer mode (code fences)', us: true, them: false },
                ].map((row) => (
                  <tr key={row.f} className="border-b border-gray-50">
                    <td className="py-2.5 px-5 text-gray-500">{row.f}</td>
                    <td className="py-2.5 px-5 text-center font-medium">
                      {row.us === true ? <span className="text-green-600">Yes</span> :
                       row.us === false ? <span className="text-gray-300">No</span> :
                       <span className="text-gray-700">{row.us}</span>}
                    </td>
                    <td className="py-2.5 px-5 text-center">
                      {row.them === true ? <span className="text-green-600">Yes</span> :
                       row.them === false ? <span className="text-gray-300">No</span> :
                       <span className="text-gray-400">{row.them}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'How does the free tier work?', a: 'You get 10 AI grammar corrections per day in the Chrome extension, plus 60 minutes of voice dictation per month. No credit card required. The free tier never expires.' },
              { q: 'What does Pro include that Free doesn\'t?', a: 'Unlimited corrections, unlimited voice, AI Rewrite Mode (polishes your tone), context-aware formatting, desktop app, offline mode, and the upcoming mobile keyboards.' },
              { q: 'How is this better than Grammarly?', a: '48co uses Claude AI (the latest model) instead of rules-based checking. It also includes voice-to-text, works as a desktop app that types into ANY application (not just browsers), costs $12/mo vs $30/mo, and our Business plan is $29/mo for 10 users vs Grammarly\'s $150/mo.' },
              { q: 'Do I need an API key?', a: 'The free tier works out of the box. Pro uses Claude API for grammar and Whisper API for voice — you bring your own keys (costs ~$0.003 per correction). We\'re adding managed API access so you won\'t need keys soon.' },
              { q: 'Will it work on my phone?', a: 'iPhone and Android keyboard apps are coming soon. They\'ll replace your default keyboard and correct everything you type — texts, emails, notes, everything.' },
              { q: 'Can I cancel anytime?', a: 'Yes, instantly. No contracts, no cancellation fees, no questions asked. Monthly plans cancel at the end of the billing period. Annual plans can be refunded within 14 days.' },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="text-[14px] text-gray-800 font-semibold mb-1">{faq.q}</h3>
                <p className="text-[13px] text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-black/[0.06] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[14px] font-bold text-gray-400">48<span className="text-indigo-500">co</span></span>
          <div className="flex gap-6 text-[12px] text-gray-400">
            <a href="/download" className="hover:text-gray-700 transition-colors">Download</a>
            <a href="/compare" className="hover:text-gray-700 transition-colors">Compare</a>
            <a href="/live" className="hover:text-gray-700 transition-colors">Try Live</a>
          </div>
          <p className="text-[11px] text-gray-300">Built in New Zealand</p>
        </div>
      </footer>
    </main>
  )
}
