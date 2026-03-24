/**
 * 48co Offscreen Document
 * Handles microphone recording + Whisper API transcription.
 * Service workers cannot access getUserMedia, so this offscreen doc does it.
 */

let mediaRecorder = null
let audioChunks = []
let apiKey = ''
let language = 'en'

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'OFFSCREEN_START') {
    apiKey = msg.apiKey || ''
    language = msg.language || 'en'
    startRecording()
  }
  if (msg.type === 'OFFSCREEN_STOP') {
    stopRecording()
  }
})

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    audioChunks = []
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }

    mediaRecorder.onstop = async () => {
      // Release mic immediately
      stream.getTracks().forEach((t) => t.stop())

      const blob = new Blob(audioChunks, { type: 'audio/webm' })

      if (apiKey) {
        const text = await transcribeWithWhisper(blob)
        chrome.runtime.sendMessage({ type: 'TRANSCRIPTION_READY', text })
      } else {
        // No API key — fall back to sending raw audio is not possible,
        // so signal an error
        chrome.runtime.sendMessage({
          type: 'TRANSCRIPTION_READY',
          text: '',
          error: 'No Whisper API key configured. Go to 48co settings.',
        })
      }
    }

    mediaRecorder.start(250) // collect chunks every 250ms
  } catch (err) {
    console.error('[48co offscreen] Mic access error:', err)
    // Send error back to background → content script so UI doesn't hang
    chrome.runtime.sendMessage({
      type: 'TRANSCRIPTION_READY',
      text: '',
      error: 'Microphone access denied. Check browser permissions and try again.',
    })
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
}

async function transcribeWithWhisper(audioBlob) {
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')
    formData.append('model', 'whisper-1')
    // Extract base language code for Whisper API (e.g., 'en-US' → 'en')
    const langCode = (language || 'en').split('-')[0]
    formData.append('language', langCode)
    formData.append('response_format', 'json')

    // 30-second timeout to prevent hanging on network issues
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const err = await response.text()
      console.error('[48co offscreen] Whisper API error:', err)
      return '[Whisper API error — check your API key]'
    }

    const data = await response.json()
    return data.text || ''
  } catch (err) {
    console.error('[48co offscreen] Transcription failed:', err)
    return '[Transcription failed — check connection]'
  }
}
