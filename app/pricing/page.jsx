import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import PricingCards from './PricingCards'

export const metadata = {
  title: '48co Voice Pricing — AI Grammar & Dictation Plans for Professionals',
  description: 'AI grammar correction + voice-to-text on every device. Free to start, Pro at $12/mo, Business $29/mo for 10 users. 60% cheaper than Grammarly.',
  openGraph: {
    title: '48co Voice Pricing — Professional AI Grammar & Dictation',
    description: 'Free grammar checks, $12/mo Pro, $29/mo Business for 10 users. 60% cheaper than Grammarly Premium.',
  },
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />

      <div className="max-w-5xl mx-auto px-4 pt-32 pb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">Straightforward pricing</h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Free to start. No credit card needed. Upgrade when you&apos;re ready for unlimited AI.
          </p>
        </div>

        {/* Business Highlight */}
        <div className="mb-12 p-5 rounded-xl bg-navy-50 border border-navy-100 text-center">
          <p className="text-navy-800 text-[15px] font-semibold mb-1">Business: $29/mo for your whole team (up to 10)</p>
          <p className="text-gray-500 text-[13px]">
            That&apos;s just $2.90 per user. Grammarly Business charges $15/user/mo — 5x more.
          </p>
        </div>

        {/* Plans — client component with Stripe checkout */}
        <PricingCards />

        {/* vs Grammarly */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-navy-900 mb-2">48co Pro vs Grammarly Premium</h2>
            <p className="text-[14px] text-gray-500">Same job, better AI, lower price.</p>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-[#FAFAF8]">
                  <th className="text-left py-3.5 px-5 text-gray-500 font-medium">Feature</th>
                  <th className="text-center py-3.5 px-5 text-navy-900 font-bold">48co Pro</th>
                  <th className="text-center py-3.5 px-5 text-gray-400 font-medium">Grammarly Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'Monthly price', us: '$12/mo', them: '$30/mo' },
                  { f: 'Annual price', us: '$99/year', them: '$144/year' },
                  { f: 'Business (10 users)', us: '$29/mo', them: '$150/mo' },
                  { f: 'AI grammar correction', us: true, them: true },
                  { f: 'Tone adjustment', us: true, them: true },
                  { f: 'Voice-to-text dictation', us: true, them: false },
                  { f: 'AI Rewrite Mode', us: true, them: 'Limited' },
                  { f: 'Context-aware (app detection)', us: true, them: false },
                  { f: 'Desktop app (types into any app)', us: true, them: false },
                  { f: 'Offline mode (privacy-first)', us: true, them: false },
                  { f: 'Real-time translation (200+ languages)', us: true, them: false },
                  { f: 'iPhone & Android keyboard', us: true, them: true },
                  { f: 'AI engine', us: 'Claude (latest)', them: 'Proprietary' },
                ].map((row) => (
                  <tr key={row.f} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-5 text-gray-600">{row.f}</td>
                    <td className="py-3 px-5 text-center font-medium">
                      {row.us === true ? <span className="text-emerald-600">Yes</span> :
                       row.us === false ? <span className="text-gray-300">No</span> :
                       <span className="text-navy-900">{row.us}</span>}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {row.them === true ? <span className="text-emerald-600">Yes</span> :
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
        <div className="mt-24 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-navy-900 mb-10 text-center">Frequently asked questions</h2>
          <div className="space-y-8">
            {[
              { q: 'How does the free tier work?', a: 'You get 10 AI grammar corrections per day in the Chrome extension, plus 60 minutes of voice dictation per month. No credit card required. The free tier never expires.' },
              { q: 'What does Pro include that Free doesn\'t?', a: 'Unlimited corrections, unlimited voice, AI Rewrite Mode (polishes your tone), context-aware formatting, desktop app, offline mode, real-time translation (200+ languages), mobile keyboard apps, and Preserve My Voice (the AI learns your writing style).' },
              { q: 'How is this better than Grammarly?', a: '48co uses Claude AI (the latest model) instead of rules-based checking. It includes voice-to-text, works as a desktop app that types into ANY application (not just browsers), costs $12/mo vs $30/mo, and our Business plan is $29/mo for 10 users vs Grammarly\'s $150/mo.' },
              { q: 'Is my data secure?', a: 'Yes. You can run everything locally with our offline mode — zero data leaves your device. When using cloud features, all data is encrypted with TLS 1.3 and never stored on our servers. Designed for attorney-client privilege compliance.' },
              { q: 'Will it work on my phone?', a: 'Yes. We have custom keyboard apps for both iPhone and Android. They work as a system-level keyboard in every app — texts, emails, notes, everything. Voice dictation and grammar checking built right into the keyboard.' },
              { q: 'Can I cancel anytime?', a: 'Yes, instantly. No contracts, no cancellation fees, no questions asked. Monthly plans cancel at the end of the billing period. Annual plans can be refunded within 14 days.' },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-gray-100 pb-6">
                <h3 className="text-[15px] text-navy-900 font-semibold mb-2">{faq.q}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
