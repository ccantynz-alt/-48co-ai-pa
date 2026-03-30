import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import PricingCards from './PricingCards'

export const metadata = {
  title: 'AlecRae Voice Pricing — AI Grammar & Voice Plans | Free, Pro & Teams',
  description: 'AI grammar correction + voice-to-text on every device. Free to start, Pro at $12/mo, Business $29/mo for 10 users. 60% cheaper than Grammarly.',
  openGraph: {
    title: 'AlecRae Voice Pricing — AI Grammar That Works Everywhere',
    description: 'Free grammar checks, $12/mo Pro, $29/mo Business for 10 users. 60% cheaper than Grammarly Premium.',
  },
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />

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

        {/* Plans — client component with Stripe checkout */}
        <PricingCards />

        {/* vs Grammarly */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AlecRae Pro vs Grammarly Premium</h2>
            <p className="text-[14px] text-gray-400">Same job, better AI, lower price.</p>
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-3 px-5 text-gray-400 font-normal">Feature</th>
                  <th className="text-center py-3 px-5 text-indigo-600 font-semibold">AlecRae Pro</th>
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
              { q: 'How is this better than Grammarly?', a: 'AlecRae Voice uses Claude AI (the latest model) instead of rules-based checking. It also includes voice-to-text, works as a desktop app that types into ANY application (not just browsers), costs $12/mo vs $30/mo, and our Business plan is $29/mo for 10 users vs Grammarly\'s $150/mo.' },
              { q: 'Do I need an API key?', a: 'No. All plans use our managed AI service. You just sign up and start using it.' },
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

      <Footer />
    </main>
  )
}
