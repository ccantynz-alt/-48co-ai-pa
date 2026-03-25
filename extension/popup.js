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
setupToggle($('#noise-toggle'), 'noiseSuppression')
setupToggle($('#auto-coding-toggle'), 'autoCoding')
setupToggle($('#coding-mode-toggle'), 'codingMode')
setupToggle($('#auto-submit-toggle'), 'autoSubmit')
setupToggle($('#ptt-toggle'), 'pushToTalk')

// Set initial toggle states from stored defaults
chrome.storage.local.get(['noiseSuppression', 'autoCoding'], (data) => {
  if (data.noiseSuppression !== false) $('#noise-toggle').classList.add('on')
  if (data.autoCoding !== false) $('#auto-coding-toggle').classList.add('on')
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

// Vocabulary
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

// Text replacements
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

// ── Mic toggle button ──────────────────────────────────────────────
const micToggleBtn = $('#mic-toggle-btn')
const micStatus = $('#mic-status')

micToggleBtn.addEventListener('click', () => {
  // Send toggle to background, which forwards to active tab content script
  chrome.runtime.sendMessage({ type: 'TOGGLE_RECORDING' })
  // Close popup so it doesn't block the page
  window.close()
})

// ── Init ───────────────────────────────────────────────────────────
detectSite()
