/**
 * 48co Voice Popup Script
 * Settings UI. Shows real recording state. Force-reset if stuck.
 * No optimistic updates — waits for actual state confirmation.
 */

const $ = (sel) => document.querySelector(sel)

// ── Toggle helper ──────────────────────────────────────────────────
function setupToggle(el, key) {
  chrome.storage.local.get(key, (data) => {
    if (data[key]) el.classList.add('on')
  })
  el.addEventListener('click', () => {
    el.classList.toggle('on')
    const val = el.classList.contains('on')
    chrome.storage.local.set({ [key]: val })
    chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { [key]: val } })
  })
}

// ── Detect active site ─────────────────────────────────────────────
async function detectSite() {
  const badge = $('#status-badge')
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const url = tab?.url || ''
    const sites = {
      'claude.ai': 'Claude',
      'chatgpt.com': 'ChatGPT',
      'chat.openai.com': 'ChatGPT',
      'gemini.google.com': 'Gemini',
      'chat.deepseek.com': 'DeepSeek',
    }
    for (const [domain, name] of Object.entries(sites)) {
      if (url.includes(domain)) {
        badge.textContent = name + ' \u2713'
        badge.className = 'status-badge connected'
        return
      }
    }
    // Works on any site
    badge.textContent = 'Ready'
    badge.className = 'status-badge connected'
  } catch {
    badge.textContent = 'Unknown'
    badge.className = 'status-badge disconnected'
  }
}

// ── Engine selector ────────────────────────────────────────────────
const engineSelect = $('#engine')
const apiKeyRow = $('#api-key-row')
const apiKeyInput = $('#api-key')
const deepgramKeyRow = $('#deepgram-key-row')
const deepgramKeyInput = $('#deepgram-key')

chrome.storage.local.get(['engine', 'whisperApiKey', 'deepgramApiKey'], (data) => {
  if (data.engine) engineSelect.value = data.engine
  if (data.whisperApiKey) apiKeyInput.value = data.whisperApiKey
  if (data.deepgramApiKey) deepgramKeyInput.value = data.deepgramApiKey
  apiKeyRow.style.display = (data.engine === 'whisper') ? 'flex' : 'none'
  deepgramKeyRow.style.display = (data.engine === 'deepgram') ? 'flex' : 'none'
})

engineSelect.addEventListener('change', () => {
  const engine = engineSelect.value
  apiKeyRow.style.display = (engine === 'whisper') ? 'flex' : 'none'
  deepgramKeyRow.style.display = (engine === 'deepgram') ? 'flex' : 'none'
  chrome.storage.local.set({ engine })
  chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { engine } })
})

apiKeyInput.addEventListener('change', () => {
  chrome.storage.local.set({ whisperApiKey: apiKeyInput.value })
})

deepgramKeyInput.addEventListener('change', () => {
  chrome.storage.local.set({ deepgramApiKey: deepgramKeyInput.value })
})

// Claude API key (for grammar + AI rewrite)
const claudeKeyInput = $('#claude-key')
chrome.storage.local.get('claudeApiKey', (data) => {
  if (data.claudeApiKey) claudeKeyInput.value = data.claudeApiKey
})
claudeKeyInput.addEventListener('change', () => {
  chrome.storage.local.set({ claudeApiKey: claudeKeyInput.value })
})

// ── Language selector ─────────────────────────────────────────────
const langSelect = $('#language')
chrome.storage.local.get('language', (data) => {
  if (data.language) langSelect.value = data.language
})
langSelect.addEventListener('change', () => {
  const language = langSelect.value
  chrome.storage.local.set({ language })
  chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { language } })
})

// ── Type speed slider ──────────────────────────────────────────────
const typeSpeedSlider = $('#type-speed')
chrome.storage.local.get('typeSpeed', (data) => {
  if (data.typeSpeed) typeSpeedSlider.value = data.typeSpeed
})
typeSpeedSlider.addEventListener('input', () => {
  const val = Number(typeSpeedSlider.value)
  chrome.storage.local.set({ typeSpeed: val })
  chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { typeSpeed: val } })
})

// ── Setup toggles ──────────────────────────────────────────────────
setupToggle($('#grammar-toggle'), 'grammarEnabled')
setupToggle($('#noise-toggle'), 'noiseSuppression')
setupToggle($('#auto-coding-toggle'), 'autoCoding')
setupToggle($('#coding-mode-toggle'), 'codingMode')
setupToggle($('#auto-submit-toggle'), 'autoSubmit')
setupToggle($('#ptt-toggle'), 'pushToTalk')

chrome.storage.local.get(['noiseSuppression', 'autoCoding'], (data) => {
  if (data.noiseSuppression !== false) $('#noise-toggle').classList.add('on')
  if (data.autoCoding !== false) $('#auto-coding-toggle').classList.add('on')
})

// ── Translation settings ──────────────────────────────────────────
const translateToggle = $('#translate-toggle')
const translateOptions = $('#translate-options')
const translateTarget = $('#translate-target')
const translateDomain = $('#translate-domain')
const translateFormality = $('#translate-formality')

chrome.storage.local.get(['translateEnabled', 'translateTarget', 'translateDomain', 'translateFormality'], (data) => {
  if (data.translateEnabled) {
    translateToggle.classList.add('on')
    translateOptions.style.display = 'block'
  }
  if (data.translateTarget) translateTarget.value = data.translateTarget
  if (data.translateDomain) translateDomain.value = data.translateDomain
  if (data.translateFormality) translateFormality.value = data.translateFormality
})

translateToggle.addEventListener('click', () => {
  translateToggle.classList.toggle('on')
  const enabled = translateToggle.classList.contains('on')
  translateOptions.style.display = enabled ? 'block' : 'none'
  chrome.storage.local.set({ translateEnabled: enabled })
  chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { translateEnabled: enabled } })
})

translateTarget.addEventListener('change', () => {
  chrome.storage.local.set({ translateTarget: translateTarget.value })
  chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { translateTarget: translateTarget.value } })
})

translateDomain.addEventListener('change', () => {
  chrome.storage.local.set({ translateDomain: translateDomain.value })
  chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { translateDomain: translateDomain.value } })
})

translateFormality.addEventListener('change', () => {
  chrome.storage.local.set({ translateFormality: translateFormality.value })
  chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { translateFormality: translateFormality.value } })
})

// ── Custom vocabulary manager ─────────────────────────────────────
function renderList(containerId, storageKey, items) {
  const container = document.getElementById(containerId)
  container.innerHTML = ''
  items.forEach((item, i) => {
    const row = document.createElement('div')
    row.className = 'entry-row'
    row.innerHTML = `<span class="entry-from">${item.from}</span><span class="entry-to">${item.to}</span><button class="entry-del" data-idx="${i}">&times;</button>`
    row.querySelector('.entry-del').addEventListener('click', () => {
      items.splice(i, 1)
      chrome.storage.local.set({ [storageKey]: items })
      chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { [storageKey]: items } })
      renderList(containerId, storageKey, items)
    })
    container.appendChild(row)
  })
}

let vocabItems = []
chrome.storage.local.get('vocabulary', (data) => {
  vocabItems = data.vocabulary || []
  renderList('vocab-list', 'vocabulary', vocabItems)
})
$('#vocab-add').addEventListener('click', () => {
  const from = $('#vocab-from').value.trim()
  const to = $('#vocab-to').value.trim()
  if (from && to) {
    vocabItems.push({ from, to })
    chrome.storage.local.set({ vocabulary: vocabItems })
    chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { vocabulary: vocabItems } })
    renderList('vocab-list', 'vocabulary', vocabItems)
    $('#vocab-from').value = ''
    $('#vocab-to').value = ''
  }
})

let replaceItems = []
chrome.storage.local.get('replacements', (data) => {
  replaceItems = data.replacements || []
  renderList('replace-list', 'replacements', replaceItems)
})
$('#replace-add').addEventListener('click', () => {
  const from = $('#replace-from').value.trim()
  const to = $('#replace-to').value.trim()
  if (from && to) {
    replaceItems.push({ from, to })
    chrome.storage.local.set({ replacements: replaceItems })
    chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { replacements: replaceItems } })
    renderList('replace-list', 'replacements', replaceItems)
    $('#replace-from').value = ''
    $('#replace-to').value = ''
  }
})

// ── Mic toggle — real state, no guessing ───────────────────────────
const micToggleBtn = $('#mic-toggle-btn')
const micStatus = $('#mic-status')
let currentRecState = 'idle'

function updateMicUI(newState) {
  currentRecState = newState
  const svg = micToggleBtn.querySelector('svg')

  switch (newState) {
    case 'recording':
      micToggleBtn.classList.add('recording')
      svg.setAttribute('stroke', '#ff3b5c')
      micStatus.textContent = 'Recording... click to stop'
      micStatus.className = 'mic-status recording'
      micStatus.style.color = ''
      break
    case 'processing':
      micToggleBtn.classList.remove('recording')
      svg.setAttribute('stroke', '#ffb800')
      micStatus.textContent = 'Transcribing... click to force-reset'
      micStatus.className = 'mic-status'
      micStatus.style.color = '#ffb800'
      break
    case 'done':
      micToggleBtn.classList.remove('recording')
      svg.setAttribute('stroke', '#00ff88')
      micStatus.textContent = 'Typed!'
      micStatus.className = 'mic-status'
      micStatus.style.color = '#00ff88'
      break
    case 'error':
      micToggleBtn.classList.remove('recording')
      svg.setAttribute('stroke', '#ff3b5c')
      micStatus.textContent = 'Error — click to retry'
      micStatus.className = 'mic-status'
      micStatus.style.color = '#ff3b5c'
      break
    default: // idle
      micToggleBtn.classList.remove('recording')
      svg.setAttribute('stroke', 'rgba(255,255,255,0.5)')
      micStatus.textContent = 'Click to record'
      micStatus.className = 'mic-status'
      micStatus.style.color = ''
  }
}

micToggleBtn.addEventListener('click', () => {
  if (currentRecState === 'processing' || currentRecState === 'error') {
    // Force reset — unstick everything
    forceReset()
    return
  }

  // Toggle recording on the active tab
  chrome.runtime.sendMessage({ type: 'TOGGLE_RECORDING' })

  // DON'T update UI here — wait for badge update from content script
  // This prevents the popup from showing wrong state
})

function forceReset() {
  chrome.storage.local.set({ isRecording: false })
  chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', status: 'idle' })

  chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'FORCE_RESET' }).catch(() => {})
    }
  })

  updateMicUI('idle')
}

// Listen for badge updates from background to reflect real state
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'UPDATE_BADGE') {
    updateMicUI(msg.status || 'idle')
  }
})

// Check actual state when popup opens
chrome.runtime.sendMessage({ type: 'GET_RECORDING_STATE' }, (response) => {
  if (chrome.runtime.lastError) return
  if (response && response.isRecording) {
    updateMicUI('recording')
  }
})

// ── Auto-detect microphone ────────────────────────────────────────
async function detectMicrophone() {
  const micDevice = $('#mic-device')
  try {
    // Request mic permission (triggers browser prompt if needed)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // Got permission — now enumerate devices to find the mic name
    const devices = await navigator.mediaDevices.enumerateDevices()
    const audioInputs = devices.filter(d => d.kind === 'audioinput' && d.deviceId !== 'default')
    // Release the stream immediately — we just needed permission
    stream.getTracks().forEach(t => t.stop())

    if (audioInputs.length > 0) {
      // Show the first real mic name (not "Default")
      const defaultDevice = devices.find(d => d.kind === 'audioinput' && d.deviceId === 'default')
      const micName = defaultDevice?.label || audioInputs[0].label || 'Microphone detected'
      micDevice.textContent = micName
      micDevice.style.color = '#00ff88'
    } else {
      micDevice.textContent = 'No microphone found'
      micDevice.style.color = '#ff3b5c'
    }
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      micDevice.innerHTML = 'Mic blocked — <a href="#" id="mic-fix-link" style="color:#00f0ff;text-decoration:underline">click to fix</a>'
      micDevice.style.color = '#ff3b5c'
      // Clicking the fix link re-prompts
      setTimeout(() => {
        const link = $('#mic-fix-link')
        if (link) link.addEventListener('click', (e) => { e.preventDefault(); detectMicrophone() })
      }, 0)
    } else {
      micDevice.textContent = 'No microphone found — plug one in'
      micDevice.style.color = '#ff3b5c'
    }
  }
}

// ── Init ───────────────────────────────────────────────────────────
detectSite()
detectMicrophone()
