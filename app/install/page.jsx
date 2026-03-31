import Link from 'next/link'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export default function InstallPage() {
  return (
    <main className="min-h-screen bg-navy-950">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 pt-32 pb-16">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Chrome Extension
          </h1>
          <p className="text-white/40 text-base max-w-md mx-auto">
            AI grammar checking on any website. Corrects your writing in real-time as you type in Gmail, Slack, Google Docs, and everywhere else.
          </p>
        </div>

        {/* Quick install */}
        <div className="max-w-lg mx-auto mb-20">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-7">
            <h2 className="text-lg font-bold text-white mb-5">Install in 3 minutes</h2>

            <div className="space-y-5">
              {[
                { step: '1', title: 'Download the extension', desc: 'Click below to download the extension package (.zip file).', action: true },
                { step: '2', title: 'Open Chrome Extensions', desc: 'Go to chrome://extensions in your browser. Turn on "Developer mode" (top-right toggle).' },
                { step: '3', title: 'Load the extension', desc: 'Unzip the downloaded file. Click "Load unpacked" and select the unzipped folder.' },
                { step: '4', title: 'Start using it', desc: 'Open any website. Start typing in a text field. AlecRae Voice will check your grammar automatically.' },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-lg bg-gold-400 flex items-center justify-center text-navy-950 text-[13px] font-bold flex-shrink-0">
                    {s.step}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold text-white mb-0.5">{s.title}</h3>
                    <p className="text-[12px] text-white/30 leading-relaxed">{s.desc}</p>
                    {s.action && (
                      <a
                        href="/alecrae-extension.zip"
                        download
                        className="inline-block mt-3 px-5 py-2 rounded-lg bg-gold-400 text-navy-950 text-[12px] font-semibold hover:bg-gold-300 transition-all"
                      >
                        Download Extension (.zip)
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What it does */}
        <div className="mb-20">
          <h2 className="text-xl font-bold text-white mb-8 text-center">What the extension does</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'AI Grammar Check', desc: 'Scans every text field you type in. Shows corrections in a clean tooltip. Click to fix.' },
              { title: 'Voice-to-Text', desc: 'Press middle-click or Ctrl+Shift+Space to dictate. Text streams into the focused field as you speak.' },
              { title: 'Live Translation (Coming Soon)', desc: 'Speak English, text appears in 200+ languages. Domain-aware for legal, medical, and finance.' },
              { title: 'Real-Time Streaming (Coming Soon)', desc: 'Deepgram Nova-3 engine option for sub-500ms latency. Words appear as you speak.' },
              { title: 'Custom Vocabulary (Coming Soon)', desc: 'Add specialist terms the AI should never get wrong — legal Latin, medical terms, client names.' },
              { title: 'Works Everywhere', desc: 'Gmail, Claude, ChatGPT, Slack, Google Docs, LinkedIn — any website with a text field.' },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
                <h3 className="text-[14px] font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-[12px] text-white/30 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Want more? */}
        <div className="text-center">
          <p className="text-[13px] text-white/40 mb-4">Want voice-to-text in ANY app (not just the browser)?</p>
          <Link href="/download" className="inline-block px-6 py-3 rounded-lg bg-gold-400 text-navy-950 text-[13px] font-semibold hover:bg-gold-300 transition-all">
            Download the Desktop App
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  )
}
