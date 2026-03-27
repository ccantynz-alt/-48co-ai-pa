import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { load } from '@tauri-apps/plugin-store'

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [claudeKey, setClaudeKey] = useState('')
  const [language, setLanguage] = useState('en')
  const [aiRewrite, setAiRewrite] = useState(false)
  const [useLocalWhisper, setUseLocalWhisper] = useState(false)
  const [localModel, setLocalModel] = useState('ggml-base.bin')
  const [modelDownloaded, setModelDownloaded] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [saved, setSaved] = useState(false)

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const store = await load('settings.json')
        setApiKey(await store.get('whisperApiKey') || '')
        setClaudeKey(await store.get('claudeApiKey') || '')
        setLanguage(await store.get('language') || 'en')
        setAiRewrite(await store.get('aiRewrite') || false)
        setUseLocalWhisper(await store.get('useLocalWhisper') || false)
        setLocalModel(await store.get('localModel') || 'ggml-base.bin')

        // Send to Rust backend
        if (await store.get('whisperApiKey')) invoke('set_api_key', { key: await store.get('whisperApiKey') })
        if (await store.get('claudeApiKey')) invoke('set_claude_key', { key: await store.get('claudeApiKey') })
        if (await store.get('language')) invoke('set_language', { lang: await store.get('language') })
        invoke('set_ai_rewrite', { enabled: await store.get('aiRewrite') || false })
        invoke('set_use_local_whisper', { enabled: await store.get('useLocalWhisper') || false })
        invoke('set_local_model', { model: await store.get('localModel') || 'ggml-base.bin' })

        // Check if model is downloaded
        const model = await store.get('localModel') || 'ggml-base.bin'
        const downloaded = await invoke('check_model_downloaded', { modelName: model })
        setModelDownloaded(downloaded)
      } catch (e) {
        console.warn('Settings load failed:', e)
      }
    }
    loadSettings()
  }, [])

  async function saveSettings() {
    try {
      const store = await load('settings.json')
      await store.set('whisperApiKey', apiKey)
      await store.set('claudeApiKey', claudeKey)
      await store.set('language', language)
      await store.set('aiRewrite', aiRewrite)
      await store.set('useLocalWhisper', useLocalWhisper)
      await store.set('localModel', localModel)
      await store.save()

      // Update Rust backend
      await invoke('set_api_key', { key: apiKey })
      await invoke('set_claude_key', { key: claudeKey })
      await invoke('set_language', { lang: language })
      await invoke('set_ai_rewrite', { enabled: aiRewrite })
      await invoke('set_use_local_whisper', { enabled: useLocalWhisper })
      await invoke('set_local_model', { model: localModel })

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setStatus('Save failed: ' + e)
    }
  }

  async function testRecording() {
    try {
      setStatus('Recording...')
      const result = await invoke('toggle_recording')
      setStatus(result)
    } catch (e) {
      setStatus('Error: ' + e)
    }
  }

  return (
    <div className="min-h-screen bg-white p-8" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div className="max-w-sm mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          48<span className="text-indigo-600">co</span> Settings
        </h1>
        <p className="text-sm text-gray-400 mb-8">Voice-to-text + AI grammar</p>

        {/* API Keys */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
          />
          <p className="text-xs text-gray-400 mt-1">For voice transcription. ~$0.006/min</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Claude API Key (optional)</label>
          <input
            type="password"
            value={claudeKey}
            onChange={(e) => setClaudeKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
          />
          <p className="text-xs text-gray-400 mt-1">For AI grammar rewrite. ~$0.003/rewrite</p>
        </div>

        {/* Local Whisper */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Local Voice (no API needed)</p>
              <p className="text-xs text-gray-400">Runs Whisper on your device. Free, private, works offline.</p>
            </div>
            <button
              onClick={() => setUseLocalWhisper(!useLocalWhisper)}
              className={`w-10 h-6 rounded-full transition-colors ${useLocalWhisper ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mx-1 ${useLocalWhisper ? 'translate-x-4' : ''}`} />
            </button>
          </div>

          {useLocalWhisper && (
            <>
              <select
                value={localModel}
                onChange={(e) => { setLocalModel(e.target.value); setModelDownloaded(false) }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:border-indigo-300"
              >
                <option value="ggml-tiny.bin">Tiny (~75MB, fastest)</option>
                <option value="ggml-base.bin">Base (~142MB, recommended)</option>
                <option value="ggml-small.bin">Small (~466MB, more accurate)</option>
                <option value="ggml-medium.bin">Medium (~1.5GB, very accurate)</option>
                <option value="ggml-large-v3-turbo.bin">Large V3 Turbo (~1.6GB, best)</option>
              </select>

              {modelDownloaded ? (
                <p className="text-xs text-green-600">Model ready</p>
              ) : (
                <button
                  onClick={async () => {
                    setDownloading(true)
                    setStatus('Downloading model...')
                    try {
                      await invoke('download_model', { modelName: localModel })
                      setModelDownloaded(true)
                      setStatus('Model downloaded!')
                    } catch (e) {
                      setStatus('Download failed: ' + e)
                    }
                    setDownloading(false)
                  }}
                  disabled={downloading}
                  className="w-full py-2 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium hover:bg-indigo-200 transition-colors disabled:opacity-50"
                >
                  {downloading ? 'Downloading...' : `Download ${localModel}`}
                </button>
              )}
            </>
          )}
        </div>

        {/* Language */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="nl">Dutch</option>
            <option value="ru">Russian</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="mi">Maori</option>
          </select>
        </div>

        {/* AI Rewrite Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">AI Rewrite</p>
            <p className="text-xs text-gray-400">Polish grammar + tone automatically</p>
          </div>
          <button
            onClick={() => setAiRewrite(!aiRewrite)}
            className={`w-10 h-6 rounded-full transition-colors ${aiRewrite ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mx-1 ${aiRewrite ? 'translate-x-4' : ''}`} />
          </button>
        </div>

        {/* Save */}
        <button
          onClick={saveSettings}
          className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors mb-4"
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </button>

        {/* Test */}
        <button
          onClick={testRecording}
          className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors mb-6"
        >
          Test Recording
        </button>

        {/* Status */}
        <p className="text-xs text-gray-400 text-center">{status}</p>

        {/* Shortcut info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 font-medium mb-2">Keyboard Shortcut</p>
          <p className="text-sm text-gray-700">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">Ctrl+Shift+Space</kbd>
            {' '}to toggle recording
          </p>
          <p className="text-xs text-gray-400 mt-2">Works in any app — browser, email, Slack, anywhere</p>
        </div>
      </div>
    </div>
  )
}
