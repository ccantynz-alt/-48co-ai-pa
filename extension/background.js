/**
 * 48co Voice Background Service Worker
 * Routes messages between content script, popup, and offscreen document.
 * Tracks which tab started recording so results go to the RIGHT tab.
 */

// ── Offscreen document management ──────────────────────────────────
let offscreenCreating = null

async function ensureOffscreen() {
  try {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
    })
    if (contexts.length > 0) return true
  } catch {
    // getContexts not available — try creating anyway
  }

  if (offscreenCreating) {
    await offscreenCreating
    return true
  }

  try {
    offscreenCreating = chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Microphone access for voice-to-text recording',
    })
    await offscreenCreating
    offscreenCreating = null
    return true
  } catch (err) {
    offscreenCreating = null
    console.error('[48co] Failed to create offscreen:', err)
    return false
  }
}

// ── Recording state — track which tab is recording ─────────────────
let recordingTabId = null // the tab that STARTED recording

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
    deepgramApiKey: '',
    engine: 'web-speech',
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
    error:      { text: '!',  color: '#ff3b5c' },
  }
  const { text, color } = config[status] || config.idle
  chrome.action.setBadgeText({ text })
  chrome.action.setBadgeBackgroundColor({ color })
}

// ── Send message to the recording tab (not just active tab) ────────
async function sendToRecordingTab(message) {
  // Always send to the tab that STARTED recording, not whatever's active now
  const tabId = recordingTabId
  if (tabId) {
    try {
      await chrome.tabs.sendMessage(tabId, message)
      return true
    } catch {
      // Tab may have been closed — fall through to active tab
    }
  }
  // Fallback: try active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, message)
      return true
    }
  } catch {}
  return false
}

// ── Keyboard shortcut handler ──────────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-recording') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_RECORDING' })
    }
  }
})

// ── Message router ─────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleMessage(msg, sender).then(sendResponse).catch((err) => {
    console.error('[48co] Error:', err)
    sendResponse({ error: err.message })
  })
  return true
})

async function handleMessage(msg, sender) {
  switch (msg.type) {
    case 'START_RECORDING': {
      const state = await getState()

      // Track which tab started recording
      if (sender.tab?.id) {
        recordingTabId = sender.tab.id
      } else {
        // Message from popup — get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.id) recordingTabId = tab.id
      }

      if (state.engine === 'whisper') {
        const ok = await ensureOffscreen()
        if (!ok) {
          // Tell content script offscreen failed
          await sendToRecordingTab({
            type: 'TRANSCRIPTION_READY',
            text: '',
            error: 'Failed to start recorder. Try reloading the extension.',
          })
          return { ok: false, error: 'offscreen failed' }
        }
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
      // From popup — forward to the right tab
      const tabId = recordingTabId
      if (tabId) {
        try {
          await chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_RECORDING' })
          return { ok: true }
        } catch {}
      }
      // Fallback to active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_RECORDING' })
      }
      return { ok: true }
    }

    // ── Deepgram streaming handlers ──────────────────────────────
    case 'START_DEEPGRAM': {
      // Track which tab started recording
      if (sender.tab?.id) {
        recordingTabId = sender.tab.id
      } else {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.id) recordingTabId = tab.id
      }

      const ok = await ensureOffscreen()
      if (!ok) {
        await sendToRecordingTab({
          type: 'DEEPGRAM_FINAL',
          text: '',
          error: 'Failed to start recorder. Try reloading the extension.',
        })
        return { ok: false, error: 'offscreen failed' }
      }

      const dgState = await getState()
      chrome.runtime.sendMessage({
        type: 'DEEPGRAM_START',
        apiKey: dgState.deepgramApiKey || '',
        language: dgState.language || 'en',
      })
      await setState({ isRecording: true })
      updateBadge('recording')
      return { ok: true, engine: 'deepgram' }
    }

    case 'STOP_DEEPGRAM': {
      chrome.runtime.sendMessage({ type: 'DEEPGRAM_STOP' })
      await setState({ isRecording: false })
      updateBadge('idle')
      return { ok: true }
    }

    case 'DEEPGRAM_INTERIM': {
      // Forward interim results from offscreen to the recording tab
      await sendToRecordingTab({
        type: 'DEEPGRAM_INTERIM',
        text: msg.text || '',
        error: msg.error || '',
      })
      return { ok: true }
    }

    case 'DEEPGRAM_FINAL': {
      // Forward final results from offscreen to the recording tab
      if (msg.error) {
        updateBadge('error')
        setTimeout(() => updateBadge('idle'), 3000)
        await setState({ isRecording: false })
      }
      await sendToRecordingTab({
        type: 'DEEPGRAM_FINAL',
        text: msg.text || '',
        error: msg.error || '',
      })
      return { ok: true }
    }

    // ── Deepgram streaming handlers ──────────────────────────────
    case 'START_DEEPGRAM': {
      // Track which tab started recording
      if (sender.tab?.id) {
        recordingTabId = sender.tab.id
      } else {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.id) recordingTabId = tab.id
      }

      const ok = await ensureOffscreen()
      if (!ok) {
        await sendToRecordingTab({
          type: 'DEEPGRAM_FINAL',
          text: '',
          error: 'Failed to start recorder. Try reloading the extension.',
        })
        return { ok: false, error: 'offscreen failed' }
      }

      const dgState = await getState()
      chrome.runtime.sendMessage({
        type: 'DEEPGRAM_START',
        apiKey: dgState.deepgramApiKey || '',
        language: dgState.language || 'en',
      })
      await setState({ isRecording: true })
      updateBadge('recording')
      return { ok: true, engine: 'deepgram' }
    }

    case 'STOP_DEEPGRAM': {
      chrome.runtime.sendMessage({ type: 'DEEPGRAM_STOP' })
      await setState({ isRecording: false })
      updateBadge('idle')
      return { ok: true }
    }

    case 'DEEPGRAM_INTERIM': {
      // Forward interim results from offscreen to the recording tab
      await sendToRecordingTab({
        type: 'DEEPGRAM_INTERIM',
        text: msg.text || '',
        error: msg.error || '',
      })
      return { ok: true }
    }

    case 'DEEPGRAM_FINAL': {
      // Forward final results from offscreen to the recording tab
      if (msg.error) {
        updateBadge('error')
        setTimeout(() => updateBadge('idle'), 3000)
        await setState({ isRecording: false })
      }
      await sendToRecordingTab({
        type: 'DEEPGRAM_FINAL',
        text: msg.text || '',
        error: msg.error || '',
      })
      return { ok: true }
    }

    case 'UPDATE_BADGE': {
      updateBadge(msg.status || 'idle')
      return { ok: true }
    }

    case 'OFFSCREEN_STARTED': {
      // Offscreen confirmed it's recording — update badge
      updateBadge('recording')
      return { ok: true }
    }

    case 'TRANSCRIPTION_READY': {
      // From offscreen → forward to the RECORDING tab (not active tab)
      await setState({ isRecording: false })

      if (msg.error) {
        updateBadge('error')
        // Clear error badge after 3s
        setTimeout(() => updateBadge('idle'), 3000)
      } else {
        updateBadge(msg.text ? 'done' : 'idle')
      }

      await sendToRecordingTab({
        type: 'TRANSCRIPTION_READY',
        text: msg.text || '',
        error: msg.error || '',
      })

      // Clear recording tab after delivery
      recordingTabId = null
      return { ok: true }
    }

    case 'GET_STATE': {
      return await getState()
    }

    case 'SET_STATE': {
      await setState(msg.updates)
      // Broadcast to all tabs
      const tabs = await chrome.tabs.query({})
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: 'STATE_UPDATED', updates: msg.updates }).catch(() => {})
      }
      return { ok: true }
    }

    case 'GET_RECORDING_STATE': {
      // For popup to check current state
      const state = await getState()
      return {
        isRecording: state.isRecording,
        recordingTabId,
      }
    }

    default:
      return { error: 'Unknown message type' }
  }
}

// ── Extension install / update ─────────────────────────────────────
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    setState({
      isRecording: false,
      codingMode: false,
      autoCoding: true,
      noiseSuppression: true,
      typeSpeed: 30,
      autoSubmit: false,
      engine: 'web-speech',
      deepgramApiKey: '',
      language: 'en',
      pushToTalk: false,
      vocabulary: [],
      replacements: [],
    })
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') })
  }
  updateBadge('idle')
})
