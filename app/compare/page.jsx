import Link from 'next/link'

export const metadata = {
  title: 'AlecRae Voice vs Grammarly vs Wispr Flow vs SuperWhisper — 2026 Comparison',
  description: 'Honest comparison of AI grammar and voice-to-text tools in 2026. See how AlecRae Voice compares on price, features, privacy, and AI quality.',
  openGraph: {
    title: 'Best AI Grammar & Voice-to-Text 2026 — Full Comparison',
    description: 'AlecRae Voice vs Grammarly vs Wispr Flow vs SuperWhisper. Price, features, privacy compared honestly.',
  },
}

import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export default function ComparePage() {
  const features = [
    { name: 'Price (monthly)', co: '$12/mo', gram: '$30/mo', wispr: '$15/mo', sw: '$7/mo' },
    { name: 'Business (10 users)', co: '$29/mo', gram: '$150/mo', wispr: 'N/A', sw: 'N/A' },
    { name: 'AI Grammar Check', co: true, gram: true, wispr: false, sw: false, highlight: true },
    { name: 'AI Rewrite / Polish', co: true, gram: 'Limited', wispr: 'Basic', sw: 'Basic' },
    { name: 'Context-Aware Tone', co: true, gram: false, wispr: false, sw: false, highlight: true },
    { name: 'Voice-to-Text', co: true, gram: false, wispr: true, sw: true, highlight: true },
    { name: 'Desktop App (any app)', co: true, gram: false, wispr: true, sw: true },
    { name: 'Chrome Extension', co: true, gram: true, wispr: false, sw: false },
    { name: 'iPhone / iPad', co: 'Coming Soon', gram: true, wispr: true, sw: true },
    { name: 'Android', co: 'Coming Soon', gram: true, wispr: true, sw: false },
    { name: 'Offline Mode', co: true, gram: false, wispr: false, sw: true },
    { name: 'Privacy (local-first)', co: true, gram: false, wispr: false, sw: true },
    { name: 'Windows + Mac', co: true, gram: true, wispr: true, sw: true },
    { name: '200+ Languages', co: true, gram: true, wispr: true, sw: true },
    { name: 'Custom Vocabulary', co: 'Coming Soon', gram: false, wispr: true, sw: true },
    { name: 'Real-time Translation', co: 'Coming Soon', gram: false, wispr: false, sw: false, highlight: true },
    { name: 'AI Engine', co: 'Claude', gram: 'Proprietary', wispr: 'Mixed', sw: 'Whisper' },
  ]

  function renderCell(val) {
    if (val === true) return <span className="text-gold-400 font-medium">Yes</span>
    if (val === false) return <span className="text-white/15">No</span>
    if (val === 'Coming Soon') return <span className="text-gold-400/50 text-[11px] italic">Coming Soon</span>
    return <span className="text-white/30">{val}</span>
  }

  return (
    <main className="min-h-screen bg-navy-950">
      <Nav />

      <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            How <span className="text-gold-400">AlecRae Voice</span> compares
          </h1>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            An honest comparison. We highlight where competitors beat us too.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="border border-white/[0.06] rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.04] bg-white/[0.03]">
                <th className="text-left py-3 px-4 text-white/40 font-normal w-[180px]">Feature</th>
                <th className="text-center py-3 px-4 text-gold-400 font-bold">AlecRae Voice</th>
                <th className="text-center py-3 px-4 text-white/40 font-normal">Grammarly</th>
                <th className="text-center py-3 px-4 text-white/40 font-normal">Wispr Flow</th>
                <th className="text-center py-3 px-4 text-white/40 font-normal">SuperWhisper</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${f.highlight ? 'bg-gold-400/[0.03]' : ''}`}>
                  <td className="py-3 px-4 text-white/30">{f.name}</td>
                  <td className="py-3 px-4 text-center font-medium">{renderCell(f.co)}</td>
                  <td className="py-3 px-4 text-center">{renderCell(f.gram)}</td>
                  <td className="py-3 px-4 text-center">{renderCell(f.wispr)}</td>
                  <td className="py-3 px-4 text-center">{renderCell(f.sw)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Honest Takes */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03]">
            <h2 className="text-[15px] font-bold text-white mb-3">Where Grammarly beats us (for now)</h2>
            <ul className="space-y-2 text-[13px] text-white/30">
              <li>+ Microsoft Office plugin (Word, Outlook)</li>
              <li>+ 15+ years of user data training their models</li>
              <li>+ Brand recognition — everyone knows Grammarly</li>
            </ul>
            <p className="mt-4 text-[12px] text-white/20">But: $30/mo, no voice-to-text, no desktop typing, rules-based not AI-native.</p>
          </div>

          <div className="rounded-xl p-6 border border-white/[0.06] bg-white/[0.03]">
            <h2 className="text-[15px] font-bold text-white mb-3">Where Wispr Flow beats us (for now)</h2>
            <ul className="space-y-2 text-[13px] text-white/30">
              <li>+ Established iOS/Android apps with large user base</li>
              <li>+ 200+ app integrations</li>
              <li>+ $81M in VC funding = fast development</li>
            </ul>
            <p className="mt-4 text-[12px] text-white/20">But: No grammar checking, cloud-only (no privacy), $15/mo.</p>
          </div>

          <div className="rounded-2xl p-6 border border-gold-400/20 bg-gold-400/[0.04] md:col-span-2">
            <h2 className="text-[15px] font-bold text-gold-400 mb-4">Where AlecRae Voice wins</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-[13px] text-white font-semibold mb-1">Grammar + Voice</h3>
                <p className="text-[12px] text-white/30">Only tool that does AI grammar AND voice-to-text. Grammarly can&apos;t dictate. Wispr can&apos;t grammar check.</p>
              </div>
              <div>
                <h3 className="text-[13px] text-white font-semibold mb-1">Context-Aware</h3>
                <p className="text-[12px] text-white/30">Auto-detects which app you&apos;re in. Professional for email, casual for Slack, technical for code.</p>
              </div>
              <div>
                <h3 className="text-[13px] text-white font-semibold mb-1">$29/mo for 10 users</h3>
                <p className="text-[12px] text-white/30">Business plan: $2.90/user. Grammarly charges $15/user ($150/mo for 10). We&apos;re 80% cheaper.</p>
              </div>
              <div>
                <h3 className="text-[13px] text-white font-semibold mb-1">200+ Languages <span className="text-[10px] text-gold-400/50 italic font-normal">(coming soon)</span></h3>
                <p className="text-[12px] text-white/30">Real-time translation with domain-aware terminology for legal, medical, and finance contexts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a href="/download" className="inline-block px-8 py-3 rounded-xl bg-gold-400 text-navy-950 text-[15px] font-medium hover:bg-gold-300 transition-all">
            Download AlecRae Voice Free
          </a>
          <p className="text-[12px] text-white/20 mt-3">Mac + Windows + Chrome. Free tier available. No credit card.</p>
        </div>
      </div>

      <Footer />
    </main>
  )
}
