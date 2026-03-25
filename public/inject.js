/**
 * 48co Bookmarklet Injector
 *
 * Zero UI on page — no floating widget, nothing blocking the page.
 * Triggers: middle-click anywhere, or Ctrl+Shift+Space.
 * Shows a tiny toast at top-center for status, then fades away.
 *
 * Usage (bookmarklet):
 *   javascript:void(fetch('https://48co.nz/inject.js').then(r=>r.text()).then(eval))
 */
;(function () {
  'use strict'

  // Prevent double-injection — re-clicking bookmarklet toggles recording
  if (window._foureightco) {
    if (window._foureightco.status === 'idle') window._foureightco.start()
    else if (window._foureightco.status === 'recording') window._foureightco.stop()
    return
  }

  // ═══════════════════════════════════════════════════════════════
  // TEXT PROCESSING
  // ═══════════════════════════════════════════════════════════════

  const PUNCTUATION_MAP = [
    [/\b(full stop|period)\b/gi, '.'],
    [/\bcomma\b/gi, ','],
    [/\b(question mark)\b/gi, '?'],
    [/\b(exclamation mark|exclamation point)\b/gi, '!'],
    [/\bsemicolon\b/gi, ';'],
    [/\bcolon\b/gi, ':'],
    [/\bellipsis\b/gi, '...'],
    [/\bdash\b/gi, ' — '],
    [/\bhyphen\b/gi, '-'],
    [/\b(new line|newline)\b/gi, '\n'],
    [/\b(new paragraph)\b/gi, '\n\n'],
    [/\btab\b/gi, '\t'],
    [/\b(open parenthesis|open paren|left paren)\b/gi, '('],
    [/\b(close parenthesis|close paren|right paren)\b/gi, ')'],
    [/\b(open bracket|left bracket)\b/gi, '['],
    [/\b(close bracket|right bracket)\b/gi, ']'],
    [/\b(open brace|left brace|open curly)\b/gi, '{'],
    [/\b(close brace|right brace|close curly)\b/gi, '}'],
    [/\b(open quote|begin quote)\b/gi, '"'],
    [/\b(close quote|end quote|unquote)\b/gi, '"'],
    [/\bsingle quote\b/gi, "'"],
    [/\b(at sign|at symbol)\b/gi, '@'],
    [/\b(hash sign|hashtag|pound sign)\b/gi, '#'],
    [/\b(dollar sign)\b/gi, '$'],
    [/\b(percent sign|percentage)\b/gi, '%'],
    [/\b(ampersand)\b/gi, '&'],
    [/\b(asterisk|star)\b/gi, '*'],
    [/\bforward slash\b/gi, '/'],
    [/\bbackslash\b/gi, '\\'],
    [/\b(pipe|vertical bar)\b/gi, '|'],
    [/\b(underscore)\b/gi, '_'],
    [/\b(equals sign)\b/gi, '='],
    [/\b(plus sign)\b/gi, '+'],
    [/\b(less than|left angle)\b/gi, '<'],
    [/\b(greater than|right angle)\b/gi, '>'],
    [/\btilde\b/gi, '~'],
    [/\b(thumbs up emoji|thumbsup emoji)\b/gi, '\u{1F44D}'],
    [/\b(thumbs down emoji)\b/gi, '\u{1F44E}'],
    [/\b(smiley face|smiley emoji|smile emoji)\b/gi, '\u{1F60A}'],
    [/\b(heart emoji)\b/gi, '\u{2764}\u{FE0F}'],
    [/\b(fire emoji)\b/gi, '\u{1F525}'],
    [/\b(check mark emoji|checkmark emoji)\b/gi, '\u{2705}'],
    [/\b(cross mark emoji|x emoji)\b/gi, '\u{274C}'],
    [/\b(warning emoji)\b/gi, '\u{26A0}\u{FE0F}'],
    [/\b(rocket emoji)\b/gi, '\u{1F680}'],
    [/\b(thinking emoji)\b/gi, '\u{1F914}'],
  ]

  const VOICE_COMMANDS = [
    { triggers: ['refactor this'], output: 'Refactor the following code. Identify inefficiencies, simplify logic, and rewrite it cleanly:\n\n' },
    { triggers: ['explain this'], output: 'Explain what the following code does, step by step:\n\n' },
    { triggers: ['debug this'], output: 'Debug the following code. Find errors, explain them, and provide a fix:\n\n' },
    { triggers: ['fix this'], output: 'Fix the following code. Identify the bug and provide the corrected version:\n\n' },
    { triggers: ['test this'], output: 'Write comprehensive tests for the following code:\n\n' },
    { triggers: ['optimize this'], output: 'Optimize the following code for performance:\n\n' },
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

  const CODING_KEYWORDS = [
    'function', 'class', 'import', 'export', 'const', 'let', 'var',
    'loop', 'array', 'object', 'return', 'async', 'await', 'def',
    'interface', 'struct', 'enum', 'module', 'require', 'extends',
    'constructor', 'prototype', 'promise', 'component', 'useState',
    'useEffect', 'middleware', 'endpoint', 'callback',
  ]

  function isCodingContent(text) {
    const lower = text.toLowerCase()
    return CODING_KEYWORDS.some(kw => lower.includes(kw))
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

  function postProcess(text) {
    let result = text
    const cmd = matchCommand(result)
    if (cmd) return cmd.output

    for (const [pattern, replacement] of PUNCTUATION_MAP) {
      result = result.replace(pattern, replacement)
    }
    result = result.replace(/\s+([.,;:!?)\]}])/g, '$1')
    result = result.replace(/([.,;:!?])([A-Za-z])/g, '$1 $2')
    result = result.replace(/^(\s*)([a-z])/, (_, ws, ch) => ws + ch.toUpperCase())
    result = result.replace(/([.!?]\s+)([a-z])/g, (_, punct, ch) => punct + ch.toUpperCase())
    result = result.replace(/(\n\s*)([a-z])/g, (_, nl, ch) => nl + ch.toUpperCase())
    result = result.replace(/ {2,}/g, ' ')
    result = result.trim()

    if (isCodingContent(result)) {
      result = wrapCode(result)
    }
    return result
  }

  // ═══════════════════════════════════════════════════════════════
  // TEXT INSERTION
  // ═══════════════════════════════════════════════════════════════

  let lastFocusedInput = null

  document.addEventListener('focusin', (e) => {
    const t = e.target
    if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.contentEditable === 'true') {
      lastFocusedInput = t
    }
  }, true)

  function findTextInput() {
    if (lastFocusedInput && document.body.contains(lastFocusedInput)) {
      return lastFocusedInput
    }
    const selectors = [
      'div.ProseMirror[contenteditable="true"]',
      '#prompt-textarea',
      'textarea:focus',
      'div[contenteditable="true"]:focus',
      'textarea',
      'div[contenteditable="true"]',
      'input[type="text"]',
    ]
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel)
        if (el) return el
      } catch { /* skip */ }
    }
    return null
  }

  function insertText(text) {
    const el = findTextInput()
    if (!el) return false
    el.focus()

    if (el.contentEditable === 'true') {
      const placeholder = el.querySelector('p.is-empty, p.is-editor-empty')
      if (placeholder) placeholder.textContent = ''

      // Try execCommand first
      const ok = document.execCommand('insertText', false, text)
      if (ok && el.textContent.includes(text.slice(0, 20))) {
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
        return true
      }

      // Fallback: synthetic paste event (works on ProseMirror editors like Claude/ChatGPT)
      try {
        const dt = new DataTransfer()
        dt.setData('text/plain', text)
        el.dispatchEvent(new ClipboardEvent('paste', {
          bubbles: true, cancelable: true, clipboardData: dt,
        }))
        return true
      } catch { return false }
    }

    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
      setter.call(el, el.value + text)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    }

    return false
  }

  // ═══════════════════════════════════════════════════════════════
  // TOAST NOTIFICATION (no floating widget — just a brief status)
  // Positioned top-center, never blocks page UI.
  // ═══════════════════════════════════════════════════════════════

  let toastHost = null
  let toastEl = null
  let toastTimeout = null

  function createToast() {
    if (toastHost) return
    toastHost = document.createElement('div')
    toastHost.id = 'foureightco-toast'
    toastHost.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;pointer-events:none;'
    const shadow = toastHost.attachShadow({ mode: 'closed' })

    const style = document.createElement('style')
    style.textContent = `
      .toast {
        font-family: 'SF Mono', 'JetBrains Mono', monospace;
        font-size: 11px;
        padding: 6px 14px;
        border-radius: 8px;
        background: rgba(10, 10, 14, 0.92);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.6);
        display: flex;
        align-items: center;
        gap: 8px;
        opacity: 0;
        transform: translateY(-8px);
        transition: opacity 0.25s ease, transform 0.25s ease;
        white-space: nowrap;
      }
      .toast.show { opacity: 1; transform: translateY(0); }
      .dot {
        width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
      }
      .dot.idle { background: rgba(255,255,255,0.3); }
      .dot.recording { background: #ff3b5c; box-shadow: 0 0 8px rgba(255,59,92,0.6); animation: pulse 1s ease-in-out infinite; }
      .dot.processing { background: #ffb800; }
      .dot.done { background: #00ff88; }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
    `

    toastEl = document.createElement('div')
    toastEl.className = 'toast'
    toastEl.innerHTML = '<span class="dot idle"></span><span class="text"></span>'

    shadow.appendChild(style)
    shadow.appendChild(toastEl)
    document.body.appendChild(toastHost)
  }

  function showToast(message, dotClass, duration) {
    createToast()
    toastEl.querySelector('.dot').className = 'dot ' + dotClass
    toastEl.querySelector('.text').textContent = message
    requestAnimationFrame(() => toastEl.classList.add('show'))
    clearTimeout(toastTimeout)
    if (duration > 0) {
      toastTimeout = setTimeout(() => toastEl.classList.remove('show'), duration)
    }
  }

  function hideToast() {
    if (toastEl) toastEl.classList.remove('show')
    clearTimeout(toastTimeout)
  }

  // ═══════════════════════════════════════════════════════════════
  // SPEECH RECOGNITION
  // ═══════════════════════════════════════════════════════════════

  let status = 'idle'
  let recognition = null
  let transcript = ''
  let lang = 'en'
  try { lang = localStorage.getItem('48co-lang') || 'en' } catch {}

  function startRecording() {
    if (status !== 'idle') return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      showToast('Speech API not supported — use Chrome or Edge', 'idle', 3000)
      return
    }

    recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onstart = () => {
      status = 'recording'
      transcript = ''
      showToast('Recording... middle-click to stop', 'recording', 0)
    }

    recognition.onresult = (e) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript
      transcript = full
    }

    recognition.onend = () => {
      if (!transcript || !transcript.trim()) {
        status = 'idle'
        hideToast()
        return
      }

      status = 'processing'
      showToast('Transcribing...', 'processing', 0)
      const processed = postProcess(transcript)
      const inserted = insertText(processed)

      if (inserted) {
        status = 'done'
        showToast('Typed \u2713', 'done', 1500)
      } else {
        navigator.clipboard.writeText(processed).then(() => {
          status = 'done'
          showToast('Copied to clipboard (no text field found)', 'done', 2000)
        }).catch(() => {
          status = 'done'
          showToast('No text field found — click one first', 'idle', 3000)
        })
      }

      setTimeout(() => { status = 'idle'; transcript = '' }, 2000)
    }

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') {
        showToast('Mic access denied — check browser permissions', 'idle', 3000)
      } else if (e.error === 'no-speech') {
        showToast('No speech detected — try again', 'idle', 2000)
      } else if (e.error !== 'aborted') {
        showToast('Error: ' + e.error, 'idle', 3000)
      }
      status = 'idle'
    }

    recognition.start()
  }

  function stopRecording() {
    if (recognition && status === 'recording') {
      recognition.stop()
      recognition = null
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // EVENT HANDLERS (no widget — just global triggers)
  // ═══════════════════════════════════════════════════════════════

  // Middle-click (wheel button PRESS) toggle
  // Guard: ignore if user was scrolling (wheel event in last 200ms)
  let lastWheelTime = 0
  window.addEventListener('wheel', () => { lastWheelTime = Date.now() }, { passive: true })

  window.addEventListener('mousedown', (e) => {
    if (e.button !== 1) return
    e.preventDefault()
    if (Date.now() - lastWheelTime < 200) return // scroll, not click
    if (status === 'idle') startRecording()
    else if (status === 'recording') stopRecording()
  })
  window.addEventListener('auxclick', (e) => { if (e.button === 1) e.preventDefault() })

  // Keyboard shortcut: Ctrl+Shift+Space
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
      e.preventDefault()
      if (status === 'idle') startRecording()
      else if (status === 'recording') stopRecording()
    }
  })

  // Expose for re-click toggle
  window._foureightco = {
    get status() { return status },
    start: startRecording,
    stop: stopRecording,
  }

  // Show confirmation toast on inject
  showToast('48co ready — middle-click or Ctrl+Shift+Space', 'idle', 2500)

  console.log('[48co] Voice-to-text active. Middle-click or Ctrl+Shift+Space to record. No UI on page.')
})()
