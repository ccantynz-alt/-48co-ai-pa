/**
 * 48co Voice Offscreen Document
 * Handles microphone recording + Whisper API transcription.
 * Also handles Deepgram real-time streaming transcription via WebSocket.
 * Service workers cannot access getUserMedia, so this offscreen doc does it.
 */

let mediaRecorder = null
let audioChunks = []
let audioStream = null // track stream for cleanup
let apiKey = ''
let language = 'en'

// ── Deepgram streaming state ──────────────────────────────────────
let deepgramSocket = null
let deepgramStream = null
let deepgramReconnectAttempts = 0
let deepgramWsUrl = ''
let deepgramApiKeyStored = ''
const DEEPGRAM_MAX_RECONNECT = 3

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'OFFSCREEN_START') {
    apiKey = msg.apiKey || ''
    language = msg.language || 'en'

    // Pre-flight: validate API key BEFORE recording
    if (!apiKey) {
      chrome.runtime.sendMessage({
        type: 'TRANSCRIPTION_READY',
        text: '',
        error: 'No Whisper API key set. Open 48co Voice popup → set your OpenAI API key.',
      })
      return
    }

    startRecording()
  }
  if (msg.type === 'OFFSCREEN_STOP') {
    stopRecording()
  }

  // ── Deepgram streaming commands ───────────────────────────────
  if (msg.type === 'DEEPGRAM_START') {
    const dgKey = msg.apiKey || ''
    const dgLang = msg.language || 'en'

    if (!dgKey) {
      chrome.runtime.sendMessage({
        type: 'DEEPGRAM_FINAL',
        text: '',
        error: 'No Deepgram API key set. Open 48co Voice popup → set your Deepgram API key.',
      })
      return
    }

    startDeepgramStreaming(dgKey, dgLang)
  }
  if (msg.type === 'DEEPGRAM_STOP') {
    stopDeepgramStreaming()
  }
})

async function startRecording() {
  try {
    // Clean up any previous stream first
    releaseStream()

    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    audioChunks = []
    mediaRecorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm;codecs=opus' })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      // Release mic immediately
      releaseStream()

      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      audioChunks = []

      // Double-check API key (could have been cleared while recording)
      if (!apiKey) {
        chrome.runtime.sendMessage({
          type: 'TRANSCRIPTION_READY',
          text: '',
          error: 'No Whisper API key. Open 48co Voice settings.',
        })
        return
      }

      try {
        const text = await transcribeWithWhisper(blob)
        chrome.runtime.sendMessage({ type: 'TRANSCRIPTION_READY', text, error: '' })
      } catch (err) {
        chrome.runtime.sendMessage({
          type: 'TRANSCRIPTION_READY',
          text: '',
          error: err.message || 'Transcription failed',
        })
      }
    }

    // Tell background we're actually recording now
    chrome.runtime.sendMessage({ type: 'OFFSCREEN_STARTED' })
    mediaRecorder.start(250)
  } catch (err) {
    console.error('[48co Voice offscreen] Mic access error:', err)
    releaseStream()
    chrome.runtime.sendMessage({
      type: 'TRANSCRIPTION_READY',
      text: '',
      error: err.name === 'NotAllowedError'
        ? 'Microphone access denied. Allow mic in Chrome settings.'
        : 'Mic error: ' + (err.message || 'Unknown error'),
    })
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop()
  } else {
    // MediaRecorder wasn't recording — release stream and notify
    releaseStream()
    chrome.runtime.sendMessage({
      type: 'TRANSCRIPTION_READY',
      text: '',
      error: '',
    })
  }
}

function releaseStream() {
  if (audioStream) {
    audioStream.getTracks().forEach((t) => t.stop())
    audioStream = null
  }
}

// ═══════════════════════════════════════════════════════════════
// DEEPGRAM REAL-TIME STREAMING
// Opens WebSocket, sends audio chunks, receives words in real-time
// ═══════════════════════════════════════════════════════════════

async function startDeepgramStreaming(dgApiKey, dgLanguage) {
  try {
    // Clean up any previous Deepgram session
    stopDeepgramStreaming()

    deepgramReconnectAttempts = 0

    deepgramStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    // Build WebSocket URL with query params
    const langCode = (dgLanguage || 'en').split('-')[0]
    deepgramWsUrl = `wss://api.deepgram.com/v1/listen?model=nova-3&language=${langCode}&smart_format=true&punctuate=true&interim_results=true&encoding=linear16&sample_rate=16000&channels=1`
    deepgramApiKeyStored = dgApiKey

    connectDeepgramWebSocket(deepgramWsUrl, deepgramApiKeyStored)
  } catch (err) {
    console.error('[48co Voice offscreen] Deepgram mic access error:', err)
    releaseDeepgramStream()
    chrome.runtime.sendMessage({
      type: 'DEEPGRAM_FINAL',
      text: '',
      error: err.name === 'NotAllowedError'
        ? 'Microphone access denied. Allow mic in Chrome settings.'
        : 'Mic error: ' + (err.message || 'Unknown error'),
    })
  }
}

function connectDeepgramWebSocket(wsUrl, dgApiKey) {
  deepgramSocket = new WebSocket(wsUrl, ['token', dgApiKey])

  deepgramSocket.onopen = () => {
    console.log('[48co Voice] Deepgram WebSocket connected')
    deepgramReconnectAttempts = 0

    // Tell background we're actually recording now
    chrome.runtime.sendMessage({ type: 'OFFSCREEN_STARTED' })

    // Start capturing audio and sending chunks via AudioWorklet / ScriptProcessor
    startDeepgramAudioCapture()
  }

  deepgramSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)

      // Deepgram sends results in data.channel.alternatives
      if (data.channel && data.channel.alternatives && data.channel.alternatives.length > 0) {
        const transcript = data.channel.alternatives[0].transcript || ''

        if (transcript.trim() === '') return

        if (data.is_final) {
          // Final result — commit this text permanently
          chrome.runtime.sendMessage({
            type: 'DEEPGRAM_FINAL',
            text: transcript,
            error: '',
          })
        } else {
          // Interim result — show preview that will be replaced
          chrome.runtime.sendMessage({
            type: 'DEEPGRAM_INTERIM',
            text: transcript,
            error: '',
          })
        }
      }
    } catch (err) {
      console.warn('[48co Voice] Deepgram message parse error:', err)
    }
  }

  deepgramSocket.onerror = (err) => {
    console.error('[48co Voice] Deepgram WebSocket error:', err)
  }

  deepgramSocket.onclose = (event) => {
    console.log('[48co Voice] Deepgram WebSocket closed:', event.code, event.reason)

    // If we still have a stream (user didn't stop), try reconnecting
    if (deepgramStream && deepgramReconnectAttempts < DEEPGRAM_MAX_RECONNECT) {
      deepgramReconnectAttempts++
      console.log(`[48co Voice] Deepgram reconnecting (attempt ${deepgramReconnectAttempts})...`)
      setTimeout(() => {
        if (deepgramStream) {
          connectDeepgramWebSocket(deepgramWsUrl, deepgramApiKeyStored)
        }
      }, 1000 * deepgramReconnectAttempts)
    } else if (deepgramStream) {
      // Exhausted reconnect attempts
      releaseDeepgramStream()
      chrome.runtime.sendMessage({
        type: 'DEEPGRAM_FINAL',
        text: '',
        error: 'Deepgram connection lost. Check your API key and internet connection.',
      })
    }
  }
}

let deepgramAudioContext = null
let deepgramProcessor = null

function startDeepgramAudioCapture() {
  if (!deepgramStream) return

  deepgramAudioContext = new AudioContext({ sampleRate: 16000 })
  const source = deepgramAudioContext.createMediaStreamSource(deepgramStream)

  // Use ScriptProcessorNode for wide browser compatibility
  // Buffer size 4096 at 16kHz = 256ms chunks — good for streaming
  deepgramProcessor = deepgramAudioContext.createScriptProcessor(4096, 1, 1)

  deepgramProcessor.onaudioprocess = (e) => {
    if (!deepgramSocket || deepgramSocket.readyState !== WebSocket.OPEN) return

    const inputData = e.inputBuffer.getChannelData(0)
    // Convert float32 to int16 (linear16 PCM) for Deepgram
    const int16 = new Int16Array(inputData.length)
    for (let i = 0; i < inputData.length; i++) {
      const s = Math.max(-1, Math.min(1, inputData[i]))
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }
    deepgramSocket.send(int16.buffer)
  }

  source.connect(deepgramProcessor)
  deepgramProcessor.connect(deepgramAudioContext.destination)
}

function stopDeepgramStreaming() {
  // Stop audio processor
  if (deepgramProcessor) {
    try { deepgramProcessor.disconnect() } catch {}
    deepgramProcessor = null
  }
  if (deepgramAudioContext) {
    try { deepgramAudioContext.close() } catch {}
    deepgramAudioContext = null
  }

  // Close WebSocket gracefully — send empty byte to signal end of audio
  if (deepgramSocket) {
    if (deepgramSocket.readyState === WebSocket.OPEN) {
      try { deepgramSocket.send(new Uint8Array(0)) } catch {}
      try { deepgramSocket.close(1000, 'Recording stopped') } catch {}
    }
    deepgramSocket = null
  }

  // Release mic
  releaseDeepgramStream()
}

function releaseDeepgramStream() {
  if (deepgramStream) {
    deepgramStream.getTracks().forEach((t) => t.stop())
    deepgramStream = null
  }
}

// ═══════════════════════════════════════════════════════════════
// WHISPER API (record-then-transcribe)
// ═══════════════════════════════════════════════════════════════

async function transcribeWithWhisper(audioBlob) {
  const formData = new FormData()
  formData.append('file', audioBlob, 'recording.webm')
  formData.append('model', 'whisper-1')
  const langCode = (language || 'en').split('-')[0]
  formData.append('language', langCode)
  formData.append('response_format', 'json')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown')
      if (response.status === 401) {
        throw new Error('Invalid API key. Check your OpenAI key in 48co Voice settings.')
      }
      if (response.status === 429) {
        throw new Error('Rate limited. Wait a moment and try again.')
      }
      throw new Error('Whisper API error (' + response.status + '): ' + errText)
    }

    const data = await response.json()
    return data.text || ''
  } catch (err) {
    clearTimeout(timeout)
    releaseStream() // clean up on any failure
    if (err.name === 'AbortError') {
      throw new Error('Transcription timed out (30s). Check your internet connection.')
    }
    throw err // re-throw with the original message
  }
}
