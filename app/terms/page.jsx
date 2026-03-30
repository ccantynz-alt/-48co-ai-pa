import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Terms of Service — AlecRae Voice',
  description: 'AlecRae Voice terms of service. Usage conditions, subscription terms, and liability.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-[13px] text-gray-400 mb-12">Last updated: 30 March 2026</p>

        <div className="space-y-8 text-[14px] text-gray-500 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance</h2>
            <p>By creating an account or using AlecRae Voice (the &ldquo;Service&rdquo;), you agree to these Terms of Service. The Service is operated by AlecRae Ltd, a New Zealand company. If you are using the Service on behalf of an organisation, you represent that you have authority to bind that organisation to these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. The Service</h2>
            <p>AlecRae Voice provides AI-powered grammar correction, voice-to-text transcription, and writing assistance. The Service is available as a desktop application, Chrome browser extension, and web application. We strive to provide accurate corrections, but the Service is an AI tool and may occasionally produce incorrect suggestions. You are responsible for reviewing all output before use in professional communications.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials. Notify us immediately at <a href="mailto:support@alecrae.ai" className="text-indigo-600 hover:underline">support@alecrae.ai</a> if you suspect unauthorised access to your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Subscriptions and billing</h2>
            <p>Paid plans are billed monthly or annually via Stripe. Prices are displayed on our pricing page and are exclusive of applicable taxes. You may cancel at any time; cancellation takes effect at the end of the current billing period. Refunds for annual plans are available within 14 days of purchase. Free tier usage is subject to daily and monthly limits as described on the pricing page.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Use the Service to process content that violates applicable law</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the Service</li>
              <li>Circumvent usage limits or authentication mechanisms</li>
              <li>Use the Service to develop a competing product</li>
              <li>Share account credentials with unauthorised third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Intellectual property</h2>
            <p>You retain all rights to the content you submit to the Service. We do not claim ownership of your text, audio, or documents. The AlecRae Voice software, website, and branding are the property of AlecRae Ltd.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Limitation of liability</h2>
            <p>The Service is provided &ldquo;as is.&rdquo; While we strive for accuracy, AlecRae Voice is an AI tool and may produce incorrect suggestions. We are not liable for errors in grammar corrections, transcription inaccuracies, or any consequences arising from reliance on the Service&apos;s output. Our total liability is limited to the amount you have paid for the Service in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Service availability</h2>
            <p>We target 99.9% uptime for cloud services but do not guarantee uninterrupted availability. The offline mode of the desktop application operates independently of our servers and is not affected by service outages. We will provide reasonable notice of scheduled maintenance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p>Either party may terminate this agreement at any time. We may suspend or terminate your account if you violate these terms. Upon termination, your data will be retained for 30 days and then permanently deleted unless you request earlier deletion.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Governing law</h2>
            <p>These terms are governed by the laws of New Zealand. Any disputes will be resolved in the courts of New Zealand.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Changes</h2>
            <p>We may update these terms from time to time. Registered users will be notified by email of material changes at least 14 days before they take effect. Continued use of the Service after changes take effect constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>For questions about these terms, contact <a href="mailto:legal@alecrae.ai" className="text-indigo-600 hover:underline">legal@alecrae.ai</a>.</p>
          </section>

        </div>
      </div>

      <Footer />
    </main>
  )
}
