import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Privacy Policy — 48co Voice',
  description: 'How 48co Voice handles your data, voice recordings, and personal information.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-12">Last updated: 29 March 2026</p>

        <div className="prose prose-gray prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:text-gray-600 [&_ul]:mb-4 [&_li]:mb-1">

          <h2>What We Collect</h2>
          <p>48co Voice collects only what is necessary to provide the service:</p>
          <ul className="list-disc pl-6">
            <li><strong>Account information:</strong> Email address and encrypted password when you create an account.</li>
            <li><strong>Voice recordings:</strong> When using the Whisper API engine, audio is sent to OpenAI for transcription and immediately discarded after processing. We do not store your voice recordings.</li>
            <li><strong>Text for grammar checking:</strong> Text you submit for grammar correction is sent to Anthropic (Claude AI) for processing. We do not store the content of your corrections.</li>
            <li><strong>Usage data:</strong> We track how many grammar checks, rewrites, and voice minutes you use to enforce plan limits. We do not track the content.</li>
            <li><strong>Writing samples (optional):</strong> If you enable &ldquo;Preserve My Voice,&rdquo; writing samples you provide are stored to personalise AI responses to match your style.</li>
          </ul>

          <h2>What We Do Not Collect</h2>
          <ul className="list-disc pl-6">
            <li>We do not record or store your voice when using the free Web Speech engine. Processing happens entirely in your browser.</li>
            <li>We do not read, log, or analyse the content of your documents, emails, or messages.</li>
            <li>We do not sell your data to third parties. Ever.</li>
            <li>We do not use your data to train AI models.</li>
          </ul>

          <h2>Local Processing Mode</h2>
          <p>When you enable local Whisper (on-device transcription) in the desktop app, all voice processing happens on your computer. No audio data leaves your device. This mode is ideal for professionals handling confidential information such as attorney-client privileged communications, medical records, or financial data.</p>

          <h2>Data Storage & Security</h2>
          <ul className="list-disc pl-6">
            <li>Passwords are hashed with bcrypt (industry standard).</li>
            <li>Session tokens are cryptographically random with 30-day expiry.</li>
            <li>All data is transmitted over HTTPS (TLS 1.3).</li>
            <li>Database hosted on Vercel with encryption at rest.</li>
            <li>API keys you provide (OpenAI, Claude) are stored in your browser&rsquo;s local storage or your device&rsquo;s secure storage, not on our servers.</li>
          </ul>

          <h2>Third-Party Services</h2>
          <ul className="list-disc pl-6">
            <li><strong>Anthropic (Claude AI):</strong> Processes grammar checks and rewrites. Subject to <a href="https://www.anthropic.com/privacy" className="text-indigo-600 hover:text-indigo-800" target="_blank" rel="noopener">Anthropic&rsquo;s privacy policy</a>.</li>
            <li><strong>OpenAI (Whisper):</strong> Processes voice transcription when you choose the Whisper engine. Subject to <a href="https://openai.com/privacy" className="text-indigo-600 hover:text-indigo-800" target="_blank" rel="noopener">OpenAI&rsquo;s privacy policy</a>.</li>
            <li><strong>Stripe:</strong> Processes payments. We never see or store your card details. Subject to <a href="https://stripe.com/privacy" className="text-indigo-600 hover:text-indigo-800" target="_blank" rel="noopener">Stripe&rsquo;s privacy policy</a>.</li>
            <li><strong>Google (Web Speech API):</strong> The free voice engine in the Chrome extension uses Google&rsquo;s Web Speech API. Audio is processed by Google. Subject to <a href="https://policies.google.com/privacy" className="text-indigo-600 hover:text-indigo-800" target="_blank" rel="noopener">Google&rsquo;s privacy policy</a>.</li>
          </ul>

          <h2>Your Rights</h2>
          <p>You can request deletion of your account and all associated data at any time by contacting <a href="mailto:support@48co.nz" className="text-indigo-600 hover:text-indigo-800">support@48co.nz</a>. We will delete your data within 30 days of receiving your request.</p>

          <h2>Changes to This Policy</h2>
          <p>We may update this policy from time to time. We will notify you of any material changes via email or a notice on our website.</p>

          <h2>Contact</h2>
          <p>For privacy questions or data requests, email <a href="mailto:support@48co.nz" className="text-indigo-600 hover:text-indigo-800">support@48co.nz</a>.</p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
