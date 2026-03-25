export const metadata = {
  title: '48co vs Wispr Flow vs SuperWhisper vs WhisperTyping — 2026 Comparison',
  description: 'Honest comparison of the best voice-to-text apps in 2026. See how 48co compares to Wispr Flow, SuperWhisper, and WhisperTyping on price, features, privacy, and accuracy.',
  openGraph: {
    title: 'Best Voice-to-Text Software 2026 — Full Comparison',
    description: '48co vs Wispr Flow vs SuperWhisper vs WhisperTyping. Privacy, pricing, AI features, offline mode compared.',
  },
}

export default function ComparePage() {
  const features = [
    { name: 'Price (monthly)', fortyeight: '$12/mo', wispr: '$15/mo', superwhisper: '$7/mo', whispertyping: 'Subscription' },
    { name: 'Lifetime deal', fortyeight: '$89', wispr: 'No', superwhisper: '$249', whispertyping: 'No' },
    { name: 'AI Rewrite Mode', fortyeight: true, wispr: 'Basic', superwhisper: 'Basic', whispertyping: false, highlight: true },
    { name: 'Context-Aware Formatting', fortyeight: true, wispr: false, superwhisper: false, whispertyping: false, highlight: true },
    { name: 'Offline Mode', fortyeight: true, wispr: false, superwhisper: true, whispertyping: false },
    { name: 'Privacy (local-first)', fortyeight: true, wispr: false, superwhisper: true, whispertyping: false },
    { name: 'Windows Support', fortyeight: true, wispr: true, superwhisper: true, whispertyping: true },
    { name: 'macOS Support', fortyeight: true, wispr: true, superwhisper: true, whispertyping: false },
    { name: 'Works in ANY App', fortyeight: true, wispr: true, superwhisper: true, whispertyping: true },
    { name: 'Global Hotkey', fortyeight: true, wispr: true, superwhisper: true, whispertyping: true },
    { name: 'Whisper API', fortyeight: true, wispr: true, superwhisper: true, whispertyping: true },
    { name: '50+ Languages', fortyeight: true, wispr: true, superwhisper: true, whispertyping: true },
    { name: 'Voice Commands', fortyeight: true, wispr: true, superwhisper: 'Limited', whispertyping: false },
    { name: 'Custom Vocabulary', fortyeight: true, wispr: true, superwhisper: true, whispertyping: false },
    { name: 'Auto Code Detection', fortyeight: true, wispr: false, superwhisper: false, whispertyping: false, highlight: true },
    { name: 'Meeting Transcription', fortyeight: 'Coming Q2', wispr: false, superwhisper: false, whispertyping: false },
    { name: 'Speaker ID', fortyeight: 'Coming Q2', wispr: false, superwhisper: false, whispertyping: false },
    { name: 'Real-time Streaming', fortyeight: 'Coming Q2', wispr: true, superwhisper: false, whispertyping: false },
    { name: 'Chrome Extension', fortyeight: true, wispr: false, superwhisper: false, whispertyping: false },
    { name: 'Open Source', fortyeight: 'Partial', wispr: false, superwhisper: false, whispertyping: false },
  ]

  function renderCell(val) {
    if (val === true) return <span className="text-[#00ff88]">Yes</span>
    if (val === false) return <span className="text-white/20">No</span>
    return <span className="text-white/50">{val}</span>
  }

  return (
    <main className="min-h-screen bg-[#0a0a0e] text-white font-mono">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <a href="/" className="text-sm font-bold tracking-[0.2em]">
          <span className="text-white/80">48</span><span className="text-[#00f0ff]">co</span>
        </a>
        <div className="flex gap-4">
          <a href="/download" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Download</a>
          <a href="/pricing" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Pricing</a>
          <a href="/live" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Try Live</a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3">
            <span className="text-[#00f0ff]">48co</span> vs the competition
          </h1>
          <p className="text-white/35 text-sm max-w-lg mx-auto">
            An honest, side-by-side comparison. We highlight where competitors beat us too — because you deserve the truth before choosing.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left py-3 px-3 text-white/30 font-normal w-[200px]">Feature</th>
                <th className="text-center py-3 px-3 text-[#00f0ff] font-bold">48co</th>
                <th className="text-center py-3 px-3 text-white/40 font-normal">Wispr Flow</th>
                <th className="text-center py-3 px-3 text-white/40 font-normal">SuperWhisper</th>
                <th className="text-center py-3 px-3 text-white/40 font-normal">WhisperTyping</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr
                  key={f.name}
                  className={`border-b border-white/[0.04] ${f.highlight ? 'bg-[#00f0ff]/[0.03]' : ''}`}
                >
                  <td className="py-2.5 px-3 text-white/50">{f.name}</td>
                  <td className="py-2.5 px-3 text-center font-bold">{renderCell(f.fortyeight)}</td>
                  <td className="py-2.5 px-3 text-center">{renderCell(f.wispr)}</td>
                  <td className="py-2.5 px-3 text-center">{renderCell(f.superwhisper)}</td>
                  <td className="py-2.5 px-3 text-center">{renderCell(f.whispertyping)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Honest Takes */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.06]">
            <h2 className="text-sm font-bold text-white/80 mb-3">Where Wispr Flow beats us (for now)</h2>
            <ul className="space-y-2 text-[11px] text-white/40">
              <li>+ iOS/Android mobile app (we&apos;re desktop-only for now)</li>
              <li>+ 200+ app integrations (we do 30+)</li>
              <li>+ Real-time streaming already shipped (ours is coming Q2)</li>
              <li>+ $81M in VC funding = faster dev speed</li>
            </ul>
            <p className="mt-3 text-[10px] text-white/25">But: They send all audio to the cloud. $15/mo. No lifetime deal.</p>
          </div>

          <div className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.06]">
            <h2 className="text-sm font-bold text-white/80 mb-3">Where SuperWhisper beats us (for now)</h2>
            <ul className="space-y-2 text-[11px] text-white/40">
              <li>+ Mature offline model (been local-first from day 1)</li>
              <li>+ iOS companion app</li>
              <li>+ Slightly lower monthly price ($7/mo annual)</li>
            </ul>
            <p className="mt-3 text-[10px] text-white/25">But: No AI rewrite, no context-aware formatting, no auto code detection.</p>
          </div>

          <div className="rounded-2xl p-6 bg-[#00f0ff]/[0.03] border border-[#00f0ff]/20 md:col-span-2">
            <h2 className="text-sm font-bold text-[#00f0ff] mb-3">Where 48co wins</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-[11px] text-white/60 font-bold mb-1">AI Rewrite Mode</h3>
                <p className="text-[10px] text-white/35">You ramble, it writes professionally. Auto-adjusts tone for email, Slack, code. Nobody else does this.</p>
              </div>
              <div>
                <h3 className="text-[11px] text-white/60 font-bold mb-1">Context-Aware</h3>
                <p className="text-[10px] text-white/35">Detects which app you&apos;re in and formats accordingly. Zero configuration needed.</p>
              </div>
              <div>
                <h3 className="text-[11px] text-white/60 font-bold mb-1">$89 Lifetime</h3>
                <p className="text-[10px] text-white/35">Pay once, use forever. Wispr charges $180/year. SuperWhisper&apos;s lifetime is $249. Ours is $89.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/download"
            className="inline-block px-8 py-3 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-sm tracking-wider hover:bg-[#00f0ff]/20 transition-all"
          >
            Download 48co Free
          </a>
          <p className="text-[10px] text-white/20 mt-3">Mac + Windows. Free tier available. No credit card needed.</p>
        </div>
      </div>

      <footer className="border-t border-white/[0.06] py-6 text-center">
        <p className="text-[10px] text-white/15 tracking-wider">48co &middot; Built in NZ &middot; Privacy-first voice-to-text</p>
      </footer>
    </main>
  )
}
