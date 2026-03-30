import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Terms of Service — 48co Voice',
  description: 'Terms of service for using 48co Voice AI grammar and voice-to-text product.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-20">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-14">Last updated: 29 March 2026</p>

        <div className="prose prose-gray prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-navy-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:text-gray-600 [&_ul]:mb-4 [&_li]:mb-1">

          <h2>Agreement</h2>
          <p>By using 48co Voice (&ldquo;the Service&rdquo;), you agree to these terms. If you do not agree, do not use the Service. The Service is provided by 48co Ltd, a New Zealand company.</p>

          <h2>What You Get</h2>
          <ul className="list-disc pl-6">
            <li><strong>Free plan:</strong> 10 grammar corrections per day, 60 minutes of voice transcription per month, 5 AI rewrites per day.</li>
            <li><strong>Pro plan ($12/month or $99/year):</strong> Unlimited grammar, voice, and rewrites. Offline mode. Preserve My Voice personalisation. Priority support.</li>
            <li><strong>Business plan ($29/month per 10 users):</strong> Everything in Pro plus team management, admin dashboard, and priority onboarding.</li>
          </ul>

          <h2>Payments & Cancellation</h2>
          <p>Paid plans are billed through Stripe. You can cancel at any time through your billing portal. When you cancel, your plan continues until the end of the current billing period, then reverts to Free. No refunds for partial months, but we offer a 30-day money-back guarantee for new subscribers.</p>

          <h2>Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6">
            <li>Reverse-engineer, decompile, or attempt to extract the source code of the Service.</li>
            <li>Use the Service to generate spam, malware, or illegal content.</li>
            <li>Share your account credentials with others (Business plan has multi-user access).</li>
            <li>Exceed reasonable usage limits (we reserve the right to throttle excessive automated use).</li>
          </ul>

          <h2>Your Content</h2>
          <p>You own everything you create with 48co Voice. We do not claim any ownership or licence over your text, voice recordings, or any content you process through the Service. We process your content only to provide the Service and do not use it for any other purpose.</p>

          <h2>Accuracy</h2>
          <p>48co Voice uses AI to check grammar and transcribe speech. While we strive for high accuracy, AI is not perfect. You are responsible for reviewing all output before using it in professional contexts. We recommend reviewing all corrections before applying them to legal documents, financial reports, or medical records.</p>

          <h2>Availability</h2>
          <p>We aim for 99.9% uptime but do not guarantee uninterrupted service. The local/offline modes of the desktop app work without an internet connection.</p>

          <h2>Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, 48co Ltd is not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid us in the 12 months preceding the claim.</p>

          <h2>Changes</h2>
          <p>We may update these terms from time to time. Material changes will be communicated via email. Continued use after changes constitutes acceptance.</p>

          <h2>Governing Law</h2>
          <p>These terms are governed by the laws of New Zealand. Any disputes will be resolved in the courts of New Zealand.</p>

          <h2>Contact</h2>
          <p>Questions about these terms? Email <a href="mailto:support@48co.nz" className="text-navy-700 hover:text-navy-900 font-medium">support@48co.nz</a>.</p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
