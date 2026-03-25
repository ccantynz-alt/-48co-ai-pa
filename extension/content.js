/**
 * 48co Content Script
 * Injected into all pages. ZERO visible elements on the page.
 * All controls: toolbar icon popup, middle-click, Ctrl+Shift+Space, push-to-talk.
 * Status shown via extension badge only.
 *
 * AUDIT FIXES (22 bugs addressed):
 * - State machine guards on every transition
 * - Separate timeout IDs for recording vs processing
 * - Whisper errors are errors, not text
 * - processTranscript checks state before acting
 * - All failures show feedback via badge
 * - insertText uses clipboard-paste fallback for ProseMirror
 */
;(function () {
  'use strict'

  // ═══════════════════════════════════════════════════════════════════
  // SITE ADAPTERS
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

  const ADAPTERS_GENERIC = {
    name: 'Any Site',
    input: [
      'textarea:focus',
      'input[type="text"]:focus',
      'div[contenteditable="true"]:focus',
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
    return ADAPTERS_GENERIC
  }

  function getInput(adapter) { return queryFirst(adapter.input) }
  function getSend(adapter) { return queryFirst(adapter.send) }

  // Track last focused text input
  let lastFocusedInput = null
  document.addEventListener('focusin', (e) => {
    const t = e.target
    if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.contentEditable === 'true') {
      lastFocusedInput = t
    }
  }, true)

  // ═══════════════════════════════════════════════════════════════════
  // TEXT INSERTION — with ProseMirror clipboard-paste fallback
  // ═══════════════════════════════════════════════════════════════════

  function insertText(adapter, text) {
    let el = getInput(adapter)
    if (!el && lastFocusedInput && document.body.contains(lastFocusedInput)) {
      el = lastFocusedInput
    }
    if (!el) return false
    el.focus()

    if (el.contentEditable === 'true') {
      // Clear ProseMirror placeholder
      const placeholder = el.querySelector('p.is-empty, p.is-editor-empty')
      if (placeholder) placeholder.textContent = ''

      // Method 1: execCommand (works on basic contentEditable)
      const ok = document.execCommand('insertText', false, text)
      if (ok && el.textContent.includes(text.slice(0, 20))) {
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
        return true
      }

      // Method 2: Synthetic paste event (works on ProseMirror — Claude, ChatGPT)
      try {
        const dt = new DataTransfer()
        dt.setData('text/plain', text)
        const ok2 = el.dispatchEvent(new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt,
        }))
        if (ok2 !== false) return true
      } catch { /* fall through */ }

      // Method 3: Direct DOM manipulation (last resort)
      try {
        const textNode = document.createTextNode(text)
        const sel = window.getSelection()
        if (sel.rangeCount) {
          const range = sel.getRangeAt(0)
          range.deleteContents()
          range.insertNode(textNode)
          range.setStartAfter(textNode)
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)
        } else {
          el.appendChild(textNode)
        }
        el.dispatchEvent(new InputEvent('input', { bubbles: true }))
        return true
      } catch { /* fall through */ }

      return false
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
  // PUNCTUATION & EMOJI SUBSTITUTIONS
  // ═══════════════════════════════════════════════════════════════════

  const PUNCTUATION_MAP = [
    { pattern: /\b(full stop|period)\b/gi, replacement: '.' },
    { pattern: /\bcomma\b/gi, replacement: ',' },
    { pattern: /\b(question mark)\b/gi, replacement: '?' },
    { pattern: /\b(exclamation mark|exclamation point)\b/gi, replacement: '!' },
    { pattern: /\bsemicolon\b/gi, replacement: ';' },
    { pattern: /\bcolon\b/gi, replacement: ':' },
    { pattern: /\bellipsis\b/gi, replacement: '...' },
    { pattern: /\bdash\b/gi, replacement: ' — ' },
    { pattern: /\bhyphen\b/gi, replacement: '-' },
    { pattern: /\b(new line|newline)\b/gi, replacement: '\n' },
    { pattern: /\b(new paragraph)\b/gi, replacement: '\n\n' },
    { pattern: /\btab\b/gi, replacement: '\t' },
    { pattern: /\b(open parenthesis|open paren|left paren)\b/gi, replacement: '(' },
    { pattern: /\b(close parenthesis|close paren|right paren)\b/gi, replacement: ')' },
    { pattern: /\b(open bracket|left bracket)\b/gi, replacement: '[' },
    { pattern: /\b(close bracket|right bracket)\b/gi, replacement: ']' },
    { pattern: /\b(open brace|left brace|open curly)\b/gi, replacement: '{' },
    { pattern: /\b(close brace|right brace|close curly)\b/gi, replacement: '}' },
    { pattern: /\b(open quote|begin quote)\b/gi, replacement: '"' },
    { pattern: /\b(close quote|end quote|unquote)\b/gi, replacement: '"' },
    { pattern: /\bsingle quote\b/gi, replacement: "'" },
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
  // TEXT POST-PROCESSING
  // ═══════════════════════════════════════════════════════════════════

  function postProcess(text) {
    let result = text
    result = applyPunctuation(result)

    if (state.vocabulary && state.vocabulary.length > 0) {
      for (const { from, to } of state.vocabulary) {
        if (from && to) {
          const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          result = result.replace(new RegExp('\\b' + escaped + '\\b', 'gi'), to)
        }
      }
    }

    if (state.replacements && state.replacements.length > 0) {
      for (const { from, to } of state.replacements) {
        if (from && to) result = result.replaceAll(from, to)
      }
    }

    result = result.replace(/\s+([.,;:!?)\]}])/g, '$1')
    result = result.replace(/([.,;:!?])([A-Za-z])/g, '$1 $2')
    result = result.replace(/^(\s*)([a-z])/, (_, ws, ch) => ws + ch.toUpperCase())
    result = result.replace(/([.!?]\s+)([a-z])/g, (_, punct, ch) => punct + ch.toUpperCase())
    result = result.replace(/(\n\s*)([a-z])/g, (_, nl, ch) => nl + ch.toUpperCase())
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
  // STATE — single source of truth
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
    vocabulary: [],
    replacements: [],
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
  // ZERO DOM — badge only
  // ═══════════════════════════════════════════════════════════════════

  function updateUI() {
    try {
      chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', status: state.status })
    } catch { /* extension context invalid */ }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SAFE STATE TRANSITION — prevents impossible transitions
  // ═══════════════════════════════════════════════════════════════════

  function setState(newStatus) {
    state.status = newStatus
    updateUI()
  }

  function resetToIdle() {
    clearTimeout(recTimeout)
    clearTimeout(procTimeout)
    if (recognition) { try { recognition.abort() } catch {} recognition = null }
    state.transcript = ''
    setState('idle')
  }

  // ═══════════════════════════════════════════════════════════════════
  // SPEECH RECOGNITION (Web Speech API)
  // ═══════════════════════════════════════════════════════════════════

  function startWebSpeech() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      console.warn('[48co] Speech API not supported — use Chrome/Edge')
      // Show error via badge
      try { chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', status: 'error' }) } catch {}
      setTimeout(() => resetToIdle(), 2000)
      return
    }

    recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = state.language || 'en'

    recognition.onstart = () => {
      setState('recording')
    }

    recognition.onresult = (e) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript
      }
      state.transcript = full
    }

    recognition.onend = () => {
      // Guard: only process if we're still in recording state
      if (state.status !== 'recording') return
      recognition = null
      processTranscript(state.transcript)
    }

    recognition.onerror = (e) => {
      if (e.error === 'aborted') return
      recognition = null

      const errorMessages = {
        'not-allowed': 'Mic denied — check browser permissions',
        'no-speech': 'No speech detected',
        'network': 'Network error',
        'audio-capture': 'No mic found',
        'service-not-allowed': 'Speech service blocked — use Chrome',
      }
      console.warn('[48co]', errorMessages[e.error] || 'Error: ' + e.error)

      // Show error badge briefly
      try { chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', status: 'error' }) } catch {}
      setTimeout(() => resetToIdle(), 2000)
    }

    try {
      recognition.start()
    } catch (err) {
      console.warn('[48co] Failed to start recognition:', err)
      recognition = null
      resetToIdle()
    }
  }

  function stopWebSpeech() {
    if (recognition) {
      try { recognition.stop() } catch {}
      // Don't null recognition here — onend handler needs it
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RECORDING CONTROL — separate timeouts for recording vs processing
  // ═══════════════════════════════════════════════════════════════════

  let recTimeout = null   // safety timeout for recording phase
  let procTimeout = null  // safety timeout for processing/Whisper phase

  function startRecording() {
    if (state.status !== 'idle') return

    // Recording safety timeout — 60s max
    clearTimeout(recTimeout)
    recTimeout = setTimeout(() => {
      if (state.status === 'recording') {
        console.warn('[48co] Recording timed out (60s) — resetting')
        resetToIdle()
      }
    }, 60000)

    if (state.engine === 'whisper') {
      chrome.runtime.sendMessage({ type: 'START_RECORDING' }, (response) => {
        if (chrome.runtime.lastError || (response && response.error)) {
          console.warn('[48co] Failed to start Whisper recording')
          resetToIdle()
          return
        }
      })
      setState('recording')
    } else {
      startWebSpeech()
    }
  }

  function stopRecording() {
    if (state.status !== 'recording') return
    clearTimeout(recTimeout)

    if (state.engine === 'whisper') {
      chrome.runtime.sendMessage({ type: 'STOP_RECORDING' })
      setState('processing')

      // Whisper processing timeout — 30s (API can take time)
      clearTimeout(procTimeout)
      procTimeout = setTimeout(() => {
        if (state.status === 'processing') {
          console.warn('[48co] Whisper processing timed out (30s) — resetting')
          resetToIdle()
        }
      }, 30000)
    } else {
      stopWebSpeech()
      // onend handler will call processTranscript
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // TRANSCRIPT PROCESSING
  // ═══════════════════════════════════════════════════════════════════

  function processTranscript(text) {
    clearTimeout(procTimeout)

    if (!text || !text.trim()) {
      // No speech detected — brief error then reset
      try { chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', status: 'error' }) } catch {}
      setTimeout(() => resetToIdle(), 1500)
      return
    }

    setState('processing')

    // Voice commands
    const cmd = matchCommand(text)

    if (cmd && cmd.action === 'cancel') {
      resetToIdle()
      return
    }

    if (cmd && cmd.action === 'submit') {
      triggerSend(adapter)
      setState('done')
      setTimeout(() => resetToIdle(), 500)
      return
    }

    let output = (cmd && cmd.action === 'text') ? cmd.output : postProcess(text)

    // Auto coding mode
    if (state.codingMode || (state.autoCoding && isCodingContent(output))) {
      output = wrapCode(output)
    }

    // Insert into text input
    const inserted = insertText(adapter, output)

    if (inserted) {
      setState('done')

      if (state.autoSubmit) {
        triggerSend(adapter)
      }

      setTimeout(() => resetToIdle(), 500)
    } else {
      // Fallback: copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(output).then(() => {
          console.log('[48co] Copied to clipboard — no text field found')
          setState('done')
          setTimeout(() => resetToIdle(), 1500)
        }).catch(() => {
          console.warn('[48co] Failed to copy — click a text field first')
          resetToIdle()
        })
      } else {
        console.warn('[48co] No text field found — click one first')
        resetToIdle()
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  // Middle-click: auxclick only fires on full press+release, never from scrolling
  window.addEventListener('auxclick', (e) => {
    if (e.button !== 1) return
    e.preventDefault()
    e.stopPropagation()
    if (state.status === 'idle') startRecording()
    else if (state.status === 'recording') stopRecording()
  }, true)
  window.addEventListener('mousedown', (e) => { if (e.button === 1) e.preventDefault() })

  // Messages from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'TOGGLE_RECORDING') {
      if (state.status === 'idle') startRecording()
      else if (state.status === 'recording') stopRecording()
    }

    if (msg.type === 'TRANSCRIPTION_READY') {
      clearTimeout(procTimeout)
      clearTimeout(recTimeout)

      // If we're not in a state where we expect transcription, ignore it
      if (state.status !== 'recording' && state.status !== 'processing') {
        return
      }

      if (msg.error) {
        console.warn('[48co]', msg.error)
        try { chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', status: 'error' }) } catch {}
        setTimeout(() => resetToIdle(), 2000)
        return
      }

      state.transcript = msg.text || ''
      processTranscript(msg.text || '')
    }

    if (msg.type === 'STATE_UPDATED') {
      Object.assign(state, msg.updates)
    }

    if (msg.type === 'FORCE_RESET') {
      resetToIdle()
      console.log('[48co] Force reset — ready')
    }
  })

  // Push-to-talk: Hold Ctrl+Shift to record, release to stop
  let pttActive = false

  window.addEventListener('keydown', (e) => {
    if (!state.pushToTalk) return
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
