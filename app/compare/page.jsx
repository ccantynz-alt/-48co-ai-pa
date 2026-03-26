export const metadata = {
  title: '48co vs Grammarly vs Wispr Flow vs SuperWhisper — 2026 Comparison',
  description: 'Honest comparison of AI grammar and voice-to-text tools in 2026. See how 48co compares on price, features, privacy, and AI quality.',
  openGraph: {
    title: 'Best AI Grammar & Voice-to-Text 2026 — Full Comparison',
    description: '48co vs Grammarly vs Wispr Flow vs SuperWhisper. Price, features, privacy compared honestly.',
  },
}

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
    { name: 'iPhone / iPad', co: 'Coming Q2', gram: true, wispr: true, sw: true },
    { name: 'Android', co: 'Coming Q2', gram: true, wispr: true, sw: false },
    { name: 'Offline Mode', co: true, gram: false, wispr: false, sw: true },
    { name: 'Privacy (local-first)', co: true, gram: false, wispr: false, sw: true },
    { name: 'Windows + Mac', co: true, gram: true, wispr: true, sw: true },
    { name: '50+ Languages', co: true, gram: true, wispr: true, sw: true },
    { name: 'Custom Vocabulary', co: true, gram: false, wispr: true, sw: true },
    { name: 'Developer Mode', co: true, gram: false, wispr: false, sw: false, highlight: true },
    { name: 'AI Engine', co: 'Claude', gram: 'Proprietary', wispr: 'Mixed', sw: 'Whisper' },
    { name: 'Meeting Transcription', co: 'Coming Q2', gram: false, wispr: false, sw: false },
  ]

  function renderCell(val) {
    if (val === true) return <span className="text-green-600 font-medium">Yes</span>
    if (val === false) return <span className="text-gray-300">No</span>
    return <span className="text-gray-500">{val}</span>
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <a href="/" className="text-base font-bold tracking-tight">48<span className="text-indigo-600">co</span></a>
          <div className="hidden sm:flex items-center gap-6">
            <a href="/pricing" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Pricing</a>
            <a href="/live" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">Try Live</a>
            <a href="/download" className="text-[13px] px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all">Download</a>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            How <span className="text-indigo-600">48co</span> compares
          </h1>
          <p className="text-gray-400 text-base max-w-lg mx-auto">
            An honest comparison. We highlight where competitors beat us too.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-gray-400 font-normal w-[180px]">Feature</th>
                <th className="text-center py-3 px-4 text-indigo-600 font-bold">48co</th>
                <th className="text-center py-3 px-4 text-gray-400 font-normal">Grammarly</th>
                <th className="text-center py-3 px-4 text-gray-400 font-normal">Wispr Flow</th>
                <th className="text-center py-3 px-4 text-gray-400 font-normal">SuperWhisper</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name} className={`border-b border-gray-50 ${f.highlight ? 'bg-indigo-50/40' : ''}`}>
                  <td className="py-2.5 px-4 text-gray-500">{f.name}</td>
                  <td className="py-2.5 px-4 text-center font-medium">{renderCell(f.co)}</td>
                  <td className="py-2.5 px-4 text-center">{renderCell(f.gram)}</td>
                  <td className="py-2.5 px-4 text-center">{renderCell(f.wispr)}</td>
                  <td className="py-2.5 px-4 text-center">{renderCell(f.sw)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Honest Takes */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 border border-gray-200">
            <h2 className="text-[15px] font-bold text-gray-800 mb-3">Where Grammarly beats us (for now)</h2>
            <ul className="space-y-2 text-[13px] text-gray-400">
              <li>+ Mobile keyboard already shipped (ours is coming Q2)</li>
              <li>+ Microsoft Office plugin (Word, Outlook)</li>
              <li>+ 15+ years of user data training their models</li>
              <li>+ Brand recognition — everyone knows Grammarly</li>
            </ul>
            <p className="mt-3 text-[11px] text-gray-300">But: $30/mo, no voice-to-text, no desktop typing, rules-based not AI-native.</p>
          </div>

          <div className="rounded-2xl p-6 border border-gray-200">
            <h2 className="text-[15px] font-bold text-gray-800 mb-3">Where Wispr Flow beats us (for now)</h2>
            <ul className="space-y-2 text-[13px] text-gray-400">
              <li>+ iOS/Android app already shipped</li>
              <li>+ 200+ app integrations</li>
              <li>+ Real-time streaming transcription</li>
              <li>+ $81M in VC funding = fast development</li>
            </ul>
            <p className="mt-3 text-[11px] text-gray-300">But: No grammar checking, cloud-only (no privacy), $15/mo.</p>
          </div>

          <div className="rounded-2xl p-6 border-2 border-indigo-200 bg-indigo-50/30 md:col-span-2">
            <h2 className="text-[15px] font-bold text-indigo-700 mb-4">Where 48co wins</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-[13px] text-gray-700 font-semibold mb-1">Grammar + Voice</h3>
                <p className="text-[12px] text-gray-400">Only tool that does AI grammar AND voice-to-text. Grammarly can&apos;t dictate. Wispr can&apos;t grammar check.</p>
              </div>
              <div>
                <h3 className="text-[13px] text-gray-700 font-semibold mb-1">Context-Aware</h3>
                <p className="text-[12px] text-gray-400">Auto-detects which app you&apos;re in. Professional for email, casual for Slack, technical for code.</p>
              </div>
              <div>
                <h3 className="text-[13px] text-gray-700 font-semibold mb-1">$29/mo for 10 users</h3>
                <p className="text-[12px] text-gray-400">Business plan: $2.90/user. Grammarly charges $15/user ($150/mo for 10). We&apos;re 80% cheaper.</p>
              </div>
              <div>
                <h3 className="text-[13px] text-gray-700 font-semibold mb-1">Claude AI</h3>
                <p className="text-[12px] text-gray-400">Powered by the latest Claude model. Smarter corrections, better tone detection, more natural rewrites.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a href="/download" className="inline-block px-8 py-3 rounded-xl bg-indigo-600 text-white text-[15px] font-medium hover:bg-indigo-500 transition-all shadow-sm">
            Download 48co Free
          </a>
          <p className="text-[12px] text-gray-300 mt-3">Mac + Windows + Chrome. Free tier available. No credit card.</p>
        </div>
      </div>

      <footer className="border-t border-black/[0.06] py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[14px] font-bold text-gray-400">48<span className="text-indigo-500">co</span></span>
          <div className="flex gap-6 text-[12px] text-gray-400">
            <a href="/download" className="hover:text-gray-700 transition-colors">Download</a>
            <a href="/pricing" className="hover:text-gray-700 transition-colors">Pricing</a>
            <a href="/live" className="hover:text-gray-700 transition-colors">Try Live</a>
          </div>
          <p className="text-[11px] text-gray-300">Built in New Zealand</p>
        </div>
      </footer>
    </main>
  )
}
