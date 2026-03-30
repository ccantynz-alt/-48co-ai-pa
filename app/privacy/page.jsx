import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Privacy Policy — AlecRae Voice',
  description: 'AlecRae Voice privacy policy. How we collect, use, and protect your personal data.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-[13px] text-gray-400 mb-12">Last updated: 30 March 2026</p>

        <div className="prose-style space-y-8 text-[14px] text-gray-500 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Who we are</h2>
            <p>AlecRae Voice is operated by AlecRae Ltd, a company registered in New Zealand. Our primary domain is alecrae.ai. For privacy inquiries, contact <a href="mailto:privacy@alecrae.ai" className="text-indigo-600 hover:underline">privacy@alecrae.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. What we collect</h2>
            <p><strong className="text-gray-700">Account information:</strong> Email address, hashed password, and plan type when you create an account.</p>
            <p className="mt-2"><strong className="text-gray-700">Usage data:</strong> We record the number of grammar checks, rewrites, and voice minutes used per day for billing and rate limiting. We do not record the content of your text.</p>
            <p className="mt-2"><strong className="text-gray-700">Voice samples (optional):</strong> If you opt into &ldquo;Preserve My Voice,&rdquo; you may provide writing samples so the AI can match your style. These are stored only at your direction and can be deleted at any time.</p>
            <p className="mt-2"><strong className="text-gray-700">What we do not collect:</strong> We do not store the text you submit for grammar checking. We do not store audio recordings. We do not track your browsing activity outside of our own website.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How we use your data</h2>
            <p>Your data is used solely to provide and improve the AlecRae Voice service. Specifically:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>To authenticate you and manage your subscription</li>
              <li>To enforce usage limits based on your plan</li>
              <li>To provide grammar correction and voice transcription services</li>
              <li>To match your writing style if you opt into Preserve My Voice</li>
            </ul>
            <p className="mt-2">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Third-party processors</h2>
            <p>When using cloud mode, your text is processed by:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong className="text-gray-700">Anthropic (Claude API)</strong> — for grammar correction and AI rewrite. Anthropic does not use API inputs for model training.</li>
              <li><strong className="text-gray-700">OpenAI (Whisper API)</strong> — for cloud voice transcription. OpenAI does not retain audio data submitted via the API.</li>
              <li><strong className="text-gray-700">Stripe</strong> — for payment processing. Stripe handles all payment data; we never see or store your card details.</li>
              <li><strong className="text-gray-700">Vercel</strong> — for hosting. Infrastructure runs on AWS in the United States.</li>
            </ul>
            <p className="mt-2">When using offline mode, no data is sent to any third party. All processing occurs on your device.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data retention</h2>
            <p>Account data is retained for the duration of your subscription plus 30 days. Usage records are retained for 90 days. Voice samples are retained until you delete them or close your account. You may request full data deletion at any time by contacting <a href="mailto:privacy@alecrae.ai" className="text-indigo-600 hover:underline">privacy@alecrae.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your rights</h2>
            <p>Under GDPR and the New Zealand Privacy Act 2020, you have the right to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for optional data processing (e.g., voice samples)</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, email <a href="mailto:privacy@alecrae.ai" className="text-indigo-600 hover:underline">privacy@alecrae.ai</a>. We will respond within 20 working days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies</h2>
            <p>We use essential cookies for authentication (session tokens). We do not use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Changes to this policy</h2>
            <p>We will notify registered users by email of any material changes to this policy at least 14 days before they take effect.</p>
          </section>

        </div>
      </div>

      <Footer />
    </main>
  )
}
