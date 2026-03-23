/**
 * 48co Popup Script
 * Settings UI that persists to chrome.storage.local.
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
    badge.textContent = 'Not on AI chat'
    badge.className = 'status-badge disconnected'
  } catch {
    badge.textContent = 'Unknown'
    badge.className = 'status-badge disconnected'
  }
}

// ── Engine selector ────────────────────────────────────────────────
const engineSelect = $('#engine')
const apiKeyRow = $('#api-key-row')
const apiKeyInput = $('#api-key')

chrome.storage.local.get(['engine', 'whisperApiKey'], (data) => {
  if (data.engine) engineSelect.value = data.engine
  if (data.whisperApiKey) apiKeyInput.value = data.whisperApiKey
  apiKeyRow.style.display = (data.engine === 'whisper') ? 'flex' : 'none'
})

engineSelect.addEventListener('change', () => {
  const engine = engineSelect.value
  apiKeyRow.style.display = (engine === 'whisper') ? 'flex' : 'none'
  chrome.storage.local.set({ engine })
  chrome.runtime.sendMessage({ type: 'SET_STATE', updates: { engine } })
})

apiKeyInput.addEventListener('change', () => {
  chrome.storage.local.set({ whisperApiKey: apiKeyInput.value })
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
setupToggle($('#noise-toggle'), 'noiseSuppression')
setupToggle($('#auto-coding-toggle'), 'autoCoding')
setupToggle($('#coding-mode-toggle'), 'codingMode')
setupToggle($('#auto-submit-toggle'), 'autoSubmit')

// Set initial toggle states from stored defaults
chrome.storage.local.get(['noiseSuppression', 'autoCoding'], (data) => {
  if (data.noiseSuppression !== false) $('#noise-toggle').classList.add('on')
  if (data.autoCoding !== false) $('#auto-coding-toggle').classList.add('on')
})

// ── Init ───────────────────────────────────────────────────────────
detectSite()
