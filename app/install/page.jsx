import Nav from '../../components/Nav'
import Footer from '../../components/Footer'

export default function InstallPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Chrome Extension
          </h1>
          <p className="text-gray-400 text-base max-w-md mx-auto">
            AI grammar checking on any website. Corrects your writing in real-time as you type in Gmail, Slack, Google Docs, and everywhere else.
          </p>
        </div>

        {/* Quick install */}
        <div className="max-w-lg mx-auto mb-16">
          <div className="card p-6 shadow-md shadow-black/[0.03]">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Install in 3 minutes</h2>

            <div className="space-y-4">
              {[
                { step: '1', title: 'Download the extension', desc: 'Click below to download the extension package (.zip file).', action: true },
                { step: '2', title: 'Open Chrome Extensions', desc: 'Go to chrome://extensions in your browser. Turn on "Developer mode" (top-right toggle).' },
                { step: '3', title: 'Load the extension', desc: 'Unzip the downloaded file. Click "Load unpacked" and select the unzipped folder.' },
                { step: '4', title: 'Start using it', desc: 'Open any website. Start typing in a text field. 48co will check your grammar automatically.' },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-[13px] font-bold flex-shrink-0">
                    {s.step}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-semibold text-gray-800 mb-0.5">{s.title}</h3>
                    <p className="text-[12px] text-gray-400 leading-relaxed">{s.desc}</p>
                    {s.action && (
                      <a
                        href="/48co-extension.zip"
                        download
                        className="inline-block mt-2 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-[12px] font-medium hover:bg-indigo-500 transition-all"
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
        <div className="mb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">What the extension does</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'AI Grammar Check', desc: 'Scans every text field you type in. Shows corrections in a clean tooltip. Click to fix.' },
              { title: 'Voice-to-Text', desc: 'Press mouse wheel or Ctrl+Shift+Space to dictate. Text streams into the focused field as you speak.' },
              { title: 'Works Everywhere', desc: 'Gmail, Claude, ChatGPT, Slack, Google Docs, Twitter, LinkedIn — any website with a text field.' },
            ].map((f) => (
              <div key={f.title} className="card p-5">
                <h3 className="text-[14px] font-semibold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-[12px] text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Want more? */}
        <div className="text-center">
          <p className="text-[13px] text-gray-400 mb-3">Want voice-to-text in ANY app (not just the browser)?</p>
          <a href="/download" className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-medium hover:bg-indigo-500 transition-all">
            Download the Desktop App
          </a>
        </div>
      </div>

      <Footer />
    </main>
  )
}
