/**
 * 48co Content Script
 * Injected into all pages. NO visible widget on the page.
 * All controls are in the toolbar icon (extension popup).
 * Triggers: middle-click, Ctrl+Shift+Space, push-to-talk, or click extension icon.
 * Shows a brief toast notification for status changes, then disappears.
 */
;(function () {
  'use strict'

  // ═══════════════════════════════════════════════════════════════════
  // SITE ADAPTERS (inlined to avoid module import issues)
  // ═══════════════════════════════════════════════════════════════════

  function queryFirst(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel)
        if (el) return el
      } catch { /* skip invalid selectors */ }
    }
    return null
  }

  const ADAPTERS = {
    claude: {
      name: 'Claude',
      input: [
        'div.ProseMirror[contenteditable="true"]',
        'div[contenteditable="true"][data-testid]',
        'div[contenteditable="true"][class*="ProseMirror"]',
        'fieldset div[contenteditable="true"]',
        'div[contenteditable="true"][data-placeholder]',
        'div[contenteditable="true"]',
      ],
      send: [
        'button[aria-label="Send Message"]',
        'button[aria-label="Send message"]',
        'fieldset button[type="button"]:last-of-type',
        'button[data-testid="send-button"]',
      ],
    },
    chatgpt: {
      name: 'ChatGPT',
      input: [
        '#prompt-textarea',
        'div[id="prompt-textarea"]',
        'div.ProseMirror[contenteditable="true"]',
        'textarea[data-id="root"]',
        'textarea',
      ],
      send: [
        'button[data-testid="send-button"]',
        'button[aria-label="Send prompt"]',
        'button[aria-label="Send"]',
        'form button[type="submit"]',
      ],
    },
    gemini: {
      name: 'Gemini',
      input: [
        'rich-textarea div[contenteditable="true"]',
        'div.ql-editor[contenteditable="true"]',
        'div[contenteditable="true"][aria-label*="prompt"]',
        'div[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"]',
      ],
      send: [
        'button[aria-label="Send message"]',
        'button.send-button',
        'button[data-test-id="send-button"]',
      ],
    },
    deepseek: {
      name: 'DeepSeek',
      input: [
        'textarea#chat-input',
        'textarea[placeholder*="message"]',
        'textarea[placeholder*="Message"]',
        'div[contenteditable="true"]',
        'textarea',
      ],
      send: [
        'button[aria-label="Send"]',
        'div[role="button"][aria-label="Send"]',
        'button.send-btn',
        'button[class*="send"]',
      ],
    },
  }

  // Generic adapter — works on any website by finding the focused/active text input
  const ADAPTERS_GENERIC = {
    name: 'Any Site',
    input: [
      'textarea:focus',
      'input[type="text"]:focus',
      'div[contenteditable="true"]:focus',
      // Fallbacks: find first visible text input on page
      'textarea',
      'div[contenteditable="true"]',
      'input[type="text"]',
      'input:not([type])',
    ],
    send: [
      'button[type="submit"]',
      'form button:last-of-type',
    ],
  }

  function detectSite() {
    const host = window.location.hostname
    if (host.includes('claude.ai')) return ADAPTERS.claude
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) return ADAPTERS.chatgpt
    if (host.includes('gemini.google.com')) return ADAPTERS.gemini
    if (host.includes('chat.deepseek.com')) return ADAPTERS.deepseek
    return ADAPTERS_GENERIC // fallback to generic adapter for any site
  }

  function getInput(adapter) { return queryFirst(adapter.input) }
  function getSend(adapter) { return queryFirst(adapter.send) }

  // Track the last focused text input for generic mode
  let lastFocusedInput = null
  document.addEventListener('focusin', (e) => {
    const t = e.target
    if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.contentEditable === 'true') {
      lastFocusedInput = t
    }
  }, true)

  function insertText(adapter, text) {
    // On generic sites, prefer the last focused input element
    let el = getInput(adapter)
    if (!el && lastFocusedInput) el = lastFocusedInput
    if (!el) return false
    el.focus()

    // Try execCommand first (works on many sites)
    if (el.contentEditable === 'true') {
      const placeholder = el.querySelector('p.is-empty, p.is-editor-empty')
      if (placeholder) placeholder.textContent = ''

      // execCommand works on some editors
      const ok = document.execCommand('insertText', false, text)
      if (ok && el.textContent.includes(text.slice(0, 20))) {
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
        return true
      }

      // Fallback: clipboard-paste approach (reliable for ProseMirror/contentEditable)
      return clipboardInsert(el, text)
    }

    // Regular textarea/input
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
      setter.call(el, el.value + text)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    }

    return false
  }

  // Clipboard-paste insertion — most reliable method for ProseMirror editors
  function clipboardInsert(el, text) {
    try {
      el.focus()
      const dt = new DataTransfer()
      dt.setData('text/plain', text)
      const pasteEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dt,
      })
      el.dispatchEvent(pasteEvent)
      return true
    } catch {
      // Last resort: write to clipboard and simulate Ctrl+V
      return false
    }
  }

  function triggerSend(adapter) {
    setTimeout(() => {
      const btn = getSend(adapter)
      if (btn && !btn.disabled) {
        btn.click()
        return
      }
      const el = getInput(adapter)
      if (el) {
        el.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true,
        }))
      }
    }, 80)
  }

  // ═══════════════════════════════════════════════════════════════════
  // VOICE COMMANDS
  // ═══════════════════════════════════════════════════════════════════

  const VOICE_COMMANDS = [
    { triggers: ['claude refactor this', 'refactor this'], action: 'text', output: 'Refactor the following code. Identify inefficiencies, simplify logic, and rewrite it cleanly:\n\n' },
    { triggers: ['claude explain this', 'explain this'], action: 'text', output: 'Explain what the following code does, step by step:\n\n' },
    { triggers: ['claude debug this', 'debug this'], action: 'text', output: 'Debug the following code. Find errors, explain them, and provide a fix:\n\n' },
    { triggers: ['claude fix this', 'fix this'], action: 'text', output: 'Fix the following code. Identify the bug and provide the corrected version:\n\n' },
    { triggers: ['claude test this', 'test this'], action: 'text', output: 'Write comprehensive tests for the following code:\n\n' },
    { triggers: ['claude optimize this', 'optimize this'], action: 'text', output: 'Optimize the following code for performance:\n\n' },
    { triggers: ['send it', 'send message'], action: 'submit', output: null },
    { triggers: ['cancel', 'cancel that', 'never mind'], action: 'cancel', output: null },
  ]

  function matchCommand(text) {
    const lower = text.toLowerCase().trim()
    for (const cmd of VOICE_COMMANDS) {
      for (const trigger of cmd.triggers) {
        if (lower.includes(trigger)) return cmd
      }
    }
    return null
  }

  // ═══════════════════════════════════════════════════════════════════
  // PUNCTUATION & EMOJI VOICE SUBSTITUTIONS (WhisperTyping parity)
  // ═══════════════════════════════════════════════════════════════════

  const PUNCTUATION_MAP = [
    // Sentence punctuation
    { pattern: /\b(full stop|period)\b/gi, replacement: '.' },
    { pattern: /\bcomma\b/gi, replacement: ',' },
    { pattern: /\b(question mark)\b/gi, replacement: '?' },
    { pattern: /\b(exclamation mark|exclamation point)\b/gi, replacement: '!' },
    { pattern: /\bsemicolon\b/gi, replacement: ';' },
    { pattern: /\bcolon\b/gi, replacement: ':' },
    { pattern: /\bellipsis\b/gi, replacement: '...' },
    { pattern: /\bdash\b/gi, replacement: ' — ' },
    { pattern: /\bhyphen\b/gi, replacement: '-' },

    // Whitespace / structure
    { pattern: /\b(new line|newline)\b/gi, replacement: '\n' },
    { pattern: /\b(new paragraph)\b/gi, replacement: '\n\n' },
    { pattern: /\btab\b/gi, replacement: '\t' },

    // Brackets / quotes
    { pattern: /\b(open parenthesis|open paren|left paren)\b/gi, replacement: '(' },
    { pattern: /\b(close parenthesis|close paren|right paren)\b/gi, replacement: ')' },
    { pattern: /\b(open bracket|left bracket)\b/gi, replacement: '[' },
    { pattern: /\b(close bracket|right bracket)\b/gi, replacement: ']' },
    { pattern: /\b(open brace|left brace|open curly)\b/gi, replacement: '{' },
    { pattern: /\b(close brace|right brace|close curly)\b/gi, replacement: '}' },
    { pattern: /\b(open quote|begin quote)\b/gi, replacement: '"' },
    { pattern: /\b(close quote|end quote|unquote)\b/gi, replacement: '"' },
    { pattern: /\bsingle quote\b/gi, replacement: "'" },

    // Symbols
    { pattern: /\b(at sign|at symbol)\b/gi, replacement: '@' },
    { pattern: /\b(hash sign|hashtag|pound sign)\b/gi, replacement: '#' },
    { pattern: /\b(dollar sign)\b/gi, replacement: '$' },
    { pattern: /\b(percent sign|percentage)\b/gi, replacement: '%' },
    { pattern: /\b(ampersand)\b/gi, replacement: '&' },
    { pattern: /\b(asterisk|star)\b/gi, replacement: '*' },
    { pattern: /\bforward slash\b/gi, replacement: '/' },
    { pattern: /\bbackslash\b/gi, replacement: '\\' },
    { pattern: /\b(pipe|vertical bar)\b/gi, replacement: '|' },
    { pattern: /\b(underscore)\b/gi, replacement: '_' },
    { pattern: /\b(equals sign)\b/gi, replacement: '=' },
    { pattern: /\b(plus sign)\b/gi, replacement: '+' },
    { pattern: /\b(less than|left angle)\b/gi, replacement: '<' },
    { pattern: /\b(greater than|right angle)\b/gi, replacement: '>' },
    { pattern: /\btilde\b/gi, replacement: '~' },

    // Common emojis
    { pattern: /\b(thumbs up emoji|thumbsup emoji)\b/gi, replacement: '👍' },
    { pattern: /\b(thumbs down emoji)\b/gi, replacement: '👎' },
    { pattern: /\b(smiley face|smiley emoji|smile emoji)\b/gi, replacement: '😊' },
    { pattern: /\b(heart emoji)\b/gi, replacement: '❤️' },
    { pattern: /\b(fire emoji)\b/gi, replacement: '🔥' },
    { pattern: /\b(check mark emoji|checkmark emoji)\b/gi, replacement: '✅' },
    { pattern: /\b(cross mark emoji|x emoji)\b/gi, replacement: '❌' },
    { pattern: /\b(warning emoji)\b/gi, replacement: '⚠️' },
    { pattern: /\b(rocket emoji)\b/gi, replacement: '🚀' },
    { pattern: /\b(thinking emoji)\b/gi, replacement: '🤔' },
    { pattern: /\b(clap emoji)\b/gi, replacement: '👏' },
    { pattern: /\b(laughing emoji|lol emoji)\b/gi, replacement: '😂' },
    { pattern: /\b(crying emoji|sad emoji)\b/gi, replacement: '😢' },
    { pattern: /\b(wave emoji)\b/gi, replacement: '👋' },
    { pattern: /\b(party emoji)\b/gi, replacement: '🎉' },
    { pattern: /\b(eyes emoji)\b/gi, replacement: '👀' },
    { pattern: /\b(100 emoji)\b/gi, replacement: '💯' },
    { pattern: /\b(bug emoji)\b/gi, replacement: '🐛' },
  ]

  function applyPunctuation(text) {
    let result = text
    for (const { pattern, replacement } of PUNCTUATION_MAP) {
      result = result.replace(pattern, replacement)
    }
    return result
  }

  // ═══════════════════════════════════════════════════════════════════
  // TEXT POST-PROCESSING (auto-capitalize, clean whitespace)
  // ═══════════════════════════════════════════════════════════════════

  function postProcess(text) {
    let result = text

    // Apply punctuation/emoji substitutions
    result = applyPunctuation(result)

    // Apply custom vocabulary replacements
    if (state.vocabulary && state.vocabulary.length > 0) {
      for (const { from, to } of state.vocabulary) {
        if (from && to) {
          const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          result = result.replace(new RegExp('\\b' + escaped + '\\b', 'gi'), to)
        }
      }
    }

    // Apply custom text replacements
    if (state.replacements && state.replacements.length > 0) {
      for (const { from, to } of state.replacements) {
        if (from && to) {
          result = result.replaceAll(from, to)
        }
      }
    }

    // Remove space before punctuation that was substituted
    result = result.replace(/\s+([.,;:!?)\]}])/g, '$1')
    // Add space after punctuation if missing (but not for newlines/tabs)
    result = result.replace(/([.,;:!?])([A-Za-z])/g, '$1 $2')

    // Auto-capitalize first letter of text
    result = result.replace(/^(\s*)([a-z])/, (_, ws, ch) => ws + ch.toUpperCase())

    // Auto-capitalize after sentence-ending punctuation
    result = result.replace(/([.!?]\s+)([a-z])/g, (_, punct, ch) => punct + ch.toUpperCase())

    // Auto-capitalize after newlines
    result = result.replace(/(\n\s*)([a-z])/g, (_, nl, ch) => nl + ch.toUpperCase())

    // Clean up multiple spaces (but preserve intentional newlines)
    result = result.replace(/ {2,}/g, ' ')

    return result.trim()
  }

  // ═══════════════════════════════════════════════════════════════════
  // AUTO CODING MODE
  // ═══════════════════════════════════════════════════════════════════

  const CODING_KEYWORDS = [
    'function', 'class', 'import', 'export', 'const', 'let', 'var',
    'loop', 'array', 'object', 'return', 'async', 'await', 'def',
    'interface', 'struct', 'enum', 'module', 'require', 'extends',
    'constructor', 'prototype', 'promise', 'component', 'useState',
    'useEffect', 'middleware', 'endpoint', 'callback',
  ]

  function isCodingContent(text) {
    const lower = text.toLowerCase()
    return CODING_KEYWORDS.some((kw) => lower.includes(kw))
  }

  function detectLang(text) {
    const l = text.toLowerCase()
    if (l.includes('python') || l.includes('def ')) return 'python'
    if (l.includes('rust') || l.includes('fn ')) return 'rust'
    if (l.includes('go ') || l.includes('goroutine')) return 'go'
    if (l.includes('typescript')) return 'typescript'
    if (l.includes('bash') || l.includes('terminal')) return 'bash'
    if (l.includes('sql') || l.includes('query')) return 'sql'
    if (l.includes('html') || l.includes('div ')) return 'html'
    if (l.includes('css') || l.includes('flexbox')) return 'css'
    return 'javascript'
  }

  function wrapCode(text) {
    return '```' + detectLang(text) + '\n' + text + '\n```'
  }

  // ═══════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════

  let state = {
    status: 'idle', // idle | recording | processing | done
    transcript: '',
    codingMode: false,
    autoCoding: true,
    autoSubmit: false,
    engine: 'web-speech',
    language: 'en',
    pushToTalk: false,
    vocabulary: [],    // [{from, to}] custom word replacements
    replacements: [],  // [{from, to}] text replacement rules
  }

  let recognition = null
  const adapter = detectSite()

  // Load persisted settings
  chrome.storage.local.get([
    'codingMode', 'autoCoding', 'autoSubmit', 'engine', 'language',
    'pushToTalk', 'vocabulary', 'replacements',
  ], (stored) => {
    if (stored.codingMode !== undefined) state.codingMode = stored.codingMode
    if (stored.autoCoding !== undefined) state.autoCoding = stored.autoCoding
    if (stored.autoSubmit !== undefined) state.autoSubmit = stored.autoSubmit
    if (stored.engine !== undefined) state.engine = stored.engine
    if (stored.language !== undefined) state.language = stored.language
    if (stored.pushToTalk !== undefined) state.pushToTalk = stored.pushToTalk
    if (stored.vocabulary) state.vocabulary = stored.vocabulary
    if (stored.replacements) state.replacements = stored.replacements
  })

  // ═══════════════════════════════════════════════════════════════════
  // NO ON-PAGE UI — zero DOM elements injected.
  // All status is shown via the extension toolbar icon badge only.
  // ═══════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════
  // UI UPDATE (badge only — zero page DOM)
  // ═══════════════════════════════════════════════════════════════════

  function updateUI() {
    // Tell background to update the extension icon badge
    try {
      chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', status: state.status })
    } catch { /* extension context may be invalid */ }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SPEECH RECOGNITION (Web Speech API — free engine)
  // ═══════════════════════════════════════════════════════════════════

  function startWebSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('[48co] Speech API not supported — use Chrome')
      return
    }

    recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = state.language || 'en'

    recognition.onstart = () => {
      state.status = 'recording'
      updateUI()
    }

    recognition.onresult = (e) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript
      }
      state.transcript = full
    }

    recognition.onend = () => {
      processTranscript(state.transcript)
    }

    recognition.onerror = (e) => {
      if (e.error === 'aborted') return
      state.status = 'idle'

      const errorMessages = {
        'not-allowed': 'Mic access denied — check browser permissions',
        'no-speech': 'No speech detected — try again',
        'network': 'Network error — check connection',
        'audio-capture': 'No mic found — check audio devices',
        'service-not-allowed': 'Speech service unavailable — try Chrome',
      }
      console.warn('[48co]', errorMessages[e.error] || 'Error: ' + e.error)
      updateUI()
    }

    recognition.start()
  }

  function stopWebSpeech() {
    if (recognition) {
      recognition.stop()
      recognition = null
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RECORDING CONTROL
  // ═══════════════════════════════════════════════════════════════════

  let recordingTimeout = null

  function startRecording() {
    if (state.status !== 'idle') return

    // Safety timeout — if stuck in recording/processing for 60s, reset
    clearTimeout(recordingTimeout)
    recordingTimeout = setTimeout(() => {
      if (state.status === 'recording' || state.status === 'processing') {
        console.warn('[48co] Recording timed out — resetting')
        if (recognition) { try { recognition.abort() } catch {} recognition = null }
        state.status = 'idle'
        state.transcript = ''
        updateUI()
      }
    }, 60000)

    if (state.engine === 'whisper') {
      chrome.runtime.sendMessage({ type: 'START_RECORDING' })
      state.status = 'recording'
      updateUI()
    } else {
      startWebSpeech()
    }
  }

  function stopRecording() {
    if (state.status !== 'recording') return

    if (state.engine === 'whisper') {
      chrome.runtime.sendMessage({ type: 'STOP_RECORDING' })
      state.status = 'processing'
      updateUI()
      // Whisper processing timeout — if no result in 15s, reset
      clearTimeout(recordingTimeout)
      recordingTimeout = setTimeout(() => {
        if (state.status === 'processing') {
          console.warn('[48co] Whisper processing timed out — resetting')
          state.status = 'idle'
          state.transcript = ''
          updateUI()
        }
      }, 15000)
    } else {
      stopWebSpeech()
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // TRANSCRIPT PROCESSING
  // ═══════════════════════════════════════════════════════════════════

  function processTranscript(text) {
    if (!text || !text.trim()) {
      state.status = 'idle'
      state.transcript = ''
      updateUI()
      return
    }

    state.status = 'processing'
    updateUI()

    // Check voice commands first
    const cmd = matchCommand(text)

    if (cmd && cmd.action === 'cancel') {
      state.status = 'idle'
      state.transcript = ''
      updateUI()
      return
    }

    if (cmd && cmd.action === 'submit') {
      triggerSend(adapter)
      state.status = 'done'
      updateUI()
      setTimeout(() => { state.status = 'idle'; state.transcript = ''; updateUI() }, 1500)
      return
    }

    let output = (cmd && cmd.action === 'text') ? cmd.output : postProcess(text)

    // Auto coding mode — wrap in code fences if coding content detected
    if (state.codingMode || (state.autoCoding && isCodingContent(output))) {
      output = wrapCode(output)
    }

    // Insert into the text input
    const inserted = insertText(adapter, output)

    if (inserted) {
      clearTimeout(recordingTimeout)
      state.status = 'done'
      updateUI()

      // Auto-submit if enabled
      if (state.autoSubmit) {
        triggerSend(adapter)
      }

      setTimeout(() => {
        state.status = 'idle'
        state.transcript = ''
        updateUI()
      }, 500) // fast reset — ready for next recording quickly
    } else {
      // Fallback: copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(output).then(() => {
          console.log('[48co] Copied to clipboard (no input found)')
          state.status = 'done'
          updateUI()
          setTimeout(() => { state.status = 'idle'; state.transcript = ''; updateUI() }, 2000)
        }).catch(() => {
          console.warn('[48co] No text field found — click input first')
          state.status = 'idle'
          updateUI()
        })
      } else {
        console.warn('[48co] No text field found — click input first')
        state.status = 'idle'
        updateUI()
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  // Middle-click (wheel button PRESS) toggle — works anywhere on the page
  // Uses 'auxclick' which only fires on a full press+release of the button.
  // Scrolling the wheel does NOT fire auxclick — only a deliberate click does.
  window.addEventListener('auxclick', (e) => {
    if (e.button !== 1) return
    e.preventDefault()
    e.stopPropagation()
    if (state.status === 'idle') {
      startRecording()
    } else if (state.status === 'recording') {
      stopRecording()
    }
  }, true) // capture phase so we get it before the page does
  // Also prevent default on mousedown to stop auto-scroll cursor
  window.addEventListener('mousedown', (e) => { if (e.button === 1) e.preventDefault() })

  // Listen for messages from background (keyboard shortcut, Whisper result, popup toggle)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'START_RECORDING') startRecording()
    if (msg.type === 'STOP_RECORDING') stopRecording()
    if (msg.type === 'TOGGLE_RECORDING') {
      if (state.status === 'idle') startRecording()
      else if (state.status === 'recording') stopRecording()
    }
    if (msg.type === 'TRANSCRIPTION_READY') {
      clearTimeout(recordingTimeout) // cancel safety timeout
      if (msg.error) {
        console.warn('[48co]', msg.error)
        state.status = 'idle'
        state.transcript = ''
        updateUI()
        return
      }
      state.transcript = msg.text
      processTranscript(msg.text)
    }
    if (msg.type === 'STATE_UPDATED') {
      Object.assign(state, msg.updates)
    }
    if (msg.type === 'FORCE_RESET') {
      // Emergency reset — kills any stuck recording/processing
      clearTimeout(recordingTimeout)
      if (recognition) { try { recognition.abort() } catch {} recognition = null }
      state.status = 'idle'
      state.transcript = ''
      updateUI()
      console.log('[48co] Force reset — ready for new recording')
    }
  })

  // ── Push-to-talk: Hold Ctrl+Shift to record, release to stop ─────
  let pttActive = false

  window.addEventListener('keydown', (e) => {
    if (!state.pushToTalk) return
    // Hold Ctrl+Shift (no other keys) to start push-to-talk
    if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && e.key === 'Shift' && !pttActive) {
      pttActive = true
      startRecording()
      e.preventDefault()
    }
  })

  window.addEventListener('keyup', (e) => {
    if (!state.pushToTalk) return
    if (pttActive && (e.key === 'Shift' || e.key === 'Control')) {
      pttActive = false
      stopRecording()
      e.preventDefault()
    }
  })

})()
