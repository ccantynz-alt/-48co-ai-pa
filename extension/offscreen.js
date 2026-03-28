/**
 * AlecRae Voice Offscreen Document
 * Handles microphone recording + Whisper API transcription.
 * Service workers cannot access getUserMedia, so this offscreen doc does it.
 */

let mediaRecorder = null
let audioChunks = []
let audioStream = null // track stream for cleanup
let apiKey = ''
let language = 'en'

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'OFFSCREEN_START') {
    apiKey = msg.apiKey || ''
    language = msg.language || 'en'

    // Pre-flight: validate API key BEFORE recording
    if (!apiKey) {
      chrome.runtime.sendMessage({
        type: 'TRANSCRIPTION_READY',
        text: '',
        error: 'No Whisper API key set. Open AlecRae Voice popup → set your OpenAI API key.',
      })
      return
    }

    startRecording()
  }
  if (msg.type === 'OFFSCREEN_STOP') {
    stopRecording()
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
          error: 'No Whisper API key. Open AlecRae Voice settings.',
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
    console.error('[AlecRae Voice offscreen] Mic access error:', err)
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
        throw new Error('Invalid API key. Check your OpenAI key in AlecRae Voice settings.')
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
