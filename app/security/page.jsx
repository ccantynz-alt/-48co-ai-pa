import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Security — AlecRae Voice | Data Protection & Compliance',
  description: 'How AlecRae Voice protects your data. Encryption, offline mode, GDPR compliance, and data handling practices for legal and financial professionals.',
}

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-100 mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span className="text-[12px] text-green-700 font-medium">Security & Compliance</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your data is your business.<br />We keep it that way.</h1>
          <p className="text-gray-400 text-[15px] max-w-lg mx-auto leading-relaxed">
            AlecRae Voice is built for professionals handling confidential information. Here is exactly how we protect your data.
          </p>
        </div>

        <div className="space-y-8">

          {/* Encryption */}
          <div className="rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Encryption</h2>
            <div className="space-y-4 text-[14px] text-gray-500 leading-relaxed">
              <p><strong className="text-gray-700">In transit:</strong> All data transmitted between your device and our servers is encrypted using TLS 1.3, the latest industry standard.</p>
              <p><strong className="text-gray-700">At rest:</strong> Any data stored on our servers is encrypted using 256-bit AES encryption. Database backups are encrypted with separate keys.</p>
              <p><strong className="text-gray-700">API keys:</strong> Your API credentials are encrypted before storage and never logged or exposed in plaintext.</p>
            </div>
          </div>

          {/* Offline Mode */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Confidential Offline Mode</h2>
            <div className="space-y-4 text-[14px] text-gray-500 leading-relaxed">
              <p>For attorney-client privilege, financial confidentiality, or any situation where data must not leave the device:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>All transcription runs locally via on-device Whisper model</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>Grammar correction uses local rule engine — zero network calls</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>Audit log records whether each session used local or cloud processing</li>
                <li className="flex items-start gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>No text, audio, or metadata is transmitted to any external server</li>
              </ul>
              <p className="text-[13px] text-indigo-600 font-medium">Offline mode is available on the Professional and Firm plans.</p>
            </div>
          </div>

          {/* Data Handling */}
          <div className="rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Data Handling</h2>
            <div className="space-y-4 text-[14px] text-gray-500 leading-relaxed">
              <p><strong className="text-gray-700">What we process:</strong> When using cloud mode, text is sent to our API for grammar correction. Voice audio is transcribed and immediately discarded — we do not store audio recordings.</p>
              <p><strong className="text-gray-700">What we store:</strong> User account information (email, hashed password, plan). Usage counts for billing. Voice writing samples only if you opt into &ldquo;Preserve My Voice&rdquo; — and only what you explicitly provide.</p>
              <p><strong className="text-gray-700">What we never store:</strong> The text you correct. The audio you record. Your documents. Your files. We process in real-time and discard.</p>
              <p><strong className="text-gray-700">Third-party AI:</strong> Grammar corrections use Anthropic&apos;s Claude API. Anthropic does not train on API inputs. Voice transcription uses OpenAI&apos;s Whisper API, which does not retain audio data.</p>
            </div>
          </div>

          {/* Compliance */}
          <div className="rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Compliance</h2>
            <div className="space-y-4 text-[14px] text-gray-500 leading-relaxed">
              <p><strong className="text-gray-700">GDPR:</strong> AlecRae Voice is fully GDPR compliant. We process data lawfully, transparently, and only for the purposes you consent to. You may request data export or deletion at any time.</p>
              <p><strong className="text-gray-700">SOC 2 Type II:</strong> We are actively pursuing SOC 2 Type II certification. Contact us for our current security questionnaire and documentation.</p>
              <p><strong className="text-gray-700">Data residency:</strong> Our infrastructure runs on Vercel (AWS-backed) with primary data centres in the United States. For organisations requiring specific data residency, contact us to discuss options.</p>
              <p><strong className="text-gray-700">Data Processing Agreement:</strong> A DPA is available for Firm plan customers. Contact <a href="mailto:security@alecrae.ai" className="text-indigo-600 hover:underline">security@alecrae.ai</a> to request one.</p>
            </div>
          </div>

          {/* Authentication & Access */}
          <div className="rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication & Access Control</h2>
            <div className="space-y-4 text-[14px] text-gray-500 leading-relaxed">
              <p>Passwords are hashed using bcrypt with appropriate salt rounds. Session tokens are cryptographically random, expire after 30 days, and can be revoked. Google OAuth is supported with strict audience validation.</p>
              <p>API endpoints are rate-limited to prevent abuse. All authentication events are logged.</p>
            </div>
          </div>

          {/* Responsible Disclosure */}
          <div className="rounded-2xl border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Responsible Disclosure</h2>
            <div className="space-y-4 text-[14px] text-gray-500 leading-relaxed">
              <p>If you discover a security vulnerability, please report it to <a href="mailto:security@alecrae.ai" className="text-indigo-600 hover:underline">security@alecrae.ai</a>. We will acknowledge receipt within 24 hours and provide an initial assessment within 72 hours.</p>
            </div>
          </div>

        </div>

        <div className="mt-16 text-center">
          <p className="text-[13px] text-gray-400 mb-4">Have questions about our security practices?</p>
          <a href="mailto:security@alecrae.ai" className="inline-block px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[14px] font-medium transition-all">
            Contact Security Team
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}
