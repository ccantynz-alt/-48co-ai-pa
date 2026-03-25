/**
 * 48co Background Service Worker
 * Orchestrates messaging between content script and offscreen document.
 * Handles keyboard shortcuts, badge updates, and extension lifecycle.
 */

// ── Offscreen document management ──────────────────────────────────
let offscreenCreating = null

async function ensureOffscreen() {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
  })
  if (contexts.length > 0) return

  if (offscreenCreating) {
    await offscreenCreating
    return
  }

  offscreenCreating = chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'Microphone access for voice-to-text recording',
  })
  await offscreenCreating
  offscreenCreating = null
}

// ── State persisted in chrome.storage ──────────────────────────────
async function getState() {
  const defaults = {
    isRecording: false,
    codingMode: false,
    autoCoding: true,
    noiseSuppression: true,
    typeSpeed: 30,
    autoSubmit: false,
    whisperApiKey: '',
    engine: 'web-speech', // 'web-speech' | 'whisper'
    language: 'en',
    pushToTalk: false,
    vocabulary: [],
    replacements: [],
  }
  const stored = await chrome.storage.local.get(Object.keys(defaults))
  return { ...defaults, ...stored }
}

async function setState(updates) {
  await chrome.storage.local.set(updates)
}

// ── Badge / icon state ─────────────────────────────────────────────
function updateBadge(status) {
  const config = {
    idle:       { text: '',    color: '#666666' },
    recording:  { text: 'REC', color: '#ff3b5c' },
    processing: { text: '...', color: '#ffb800' },
    done:       { text: '\u2713',   color: '#00ff88' },
  }
  const { text, color } = config[status] || config.idle
  chrome.action.setBadgeText({ text })
  chrome.action.setBadgeBackgroundColor({ color })
}

// ── Keyboard shortcut handler ──────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-recording') {
    // Forward toggle to the active tab's content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_RECORDING' })
    }
  }
})

// ── Message router ─────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleMessage(msg, sender).then(sendResponse).catch((err) => {
    console.error('[48co bg] Error:', err)
    sendResponse({ error: err.message })
  })
  return true // keep channel open for async response
})

async function handleMessage(msg, sender) {
  switch (msg.type) {
    case 'START_RECORDING': {
      const state = await getState()
      if (state.engine === 'whisper') {
        // Use offscreen document for Whisper API recording
        await ensureOffscreen()
        chrome.runtime.sendMessage({
          type: 'OFFSCREEN_START',
          apiKey: state.whisperApiKey,
          language: state.language || 'en',
        })
      }
      await setState({ isRecording: true })
      updateBadge('recording')
      return { ok: true, engine: state.engine }
    }

    case 'STOP_RECORDING': {
      const state = await getState()
      if (state.engine === 'whisper') {
        chrome.runtime.sendMessage({ type: 'OFFSCREEN_STOP' })
      }
      await setState({ isRecording: false })
      updateBadge('processing')
      return { ok: true }
    }

    case 'TOGGLE_RECORDING': {
      // From popup — forward to active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_RECORDING' })
      }
      return { ok: true }
    }

    case 'UPDATE_BADGE': {
      updateBadge(msg.status || 'idle')
      return { ok: true }
    }

    case 'TRANSCRIPTION_READY': {
      // Forward transcription from offscreen → content script
      await setState({ isRecording: false })
      updateBadge('done')
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'TRANSCRIPTION_READY',
          text: msg.text,
          error: msg.error,
        })
      }
      return { ok: true }
    }

    case 'GET_STATE': {
      return await getState()
    }

    case 'SET_STATE': {
      await setState(msg.updates)
      // Broadcast state change to all tabs
      const tabs = await chrome.tabs.query({})
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: 'STATE_UPDATED', updates: msg.updates }).catch(() => {})
      }
      return { ok: true }
    }

    default:
      return { error: 'Unknown message type' }
  }
}

// ── Extension install / update ─────────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set defaults on first install
    setState({
      isRecording: false,
      codingMode: false,
      autoCoding: true,
      noiseSuppression: true,
      typeSpeed: 30,
      autoSubmit: false,
      engine: 'web-speech',
      language: 'en',
      pushToTalk: false,
      vocabulary: [],
      replacements: [],
    })

    // Open welcome page so user knows what to do next
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') })
  }

  // Clear badge on install/update
  updateBadge('idle')
})
