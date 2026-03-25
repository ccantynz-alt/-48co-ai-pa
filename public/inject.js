/**
 * 48co Bookmarklet Injector
 *
 * This script injects the 48co voice widget into ANY webpage.
 * No extension required — just load this script via bookmarklet or script tag.
 *
 * How it works:
 * 1. Creates a Shadow DOM widget (isolated from page CSS)
 * 2. Uses Web Speech API for transcription (free, no API key)
 * 3. Types directly into the focused text field on the page
 * 4. Full post-processing: punctuation, capitalization, coding mode
 *
 * Usage (bookmarklet):
 *   javascript:void(fetch('https://48co.nz/inject.js').then(r=>r.text()).then(eval))
 *
 * Usage (script tag):
 *   <script src="https://48co.nz/inject.js"></script>
 */
;(function () {
  'use strict'

  // Prevent double-injection
  if (document.getElementById('foureightco-injected')) {
    // Already injected — toggle the panel visibility
    const existing = document.getElementById('foureightco-injected')
    const shadow = existing._foureightcoShadow
    if (shadow) {
      const panel = shadow.querySelector('#panel')
      if (panel) panel.classList.toggle('open')
    }
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

  // ═══════════════════════════════════════════════════════════════
  // VOICE COMMANDS
  // ═══════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════
  // AUTO CODE FENCE DETECTION
  // ═══════════════════════════════════════════════════════════════

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

    // Check for voice commands first
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

    // Auto code fence detection
    if (isCodingContent(result)) {
      result = wrapCode(result)
    }

    return result
  }

  // ═══════════════════════════════════════════════════════════════
  // TEXT INSERTION (types into focused text field)
  // ═══════════════════════════════════════════════════════════════

  let lastFocusedInput = null

  document.addEventListener('focusin', (e) => {
    const t = e.target
    if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.contentEditable === 'true') {
      lastFocusedInput = t
    }
  }, true)

  function findTextInput() {
    // Try last focused input first
    if (lastFocusedInput && document.body.contains(lastFocusedInput)) {
      return lastFocusedInput
    }

    // Try common selectors
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
      document.execCommand('insertText', false, text)
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
      return true
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
  // WIDGET UI (Shadow DOM)
  // ═══════════════════════════════════════════════════════════════

  const host = document.createElement('div')
  host.id = 'foureightco-injected'
  host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483647;'

  const shadow = host.attachShadow({ mode: 'open' })
  host._foureightcoShadow = shadow

  // Stop events leaking
  host.addEventListener('click', e => e.stopPropagation(), true)
  host.addEventListener('keydown', e => e.stopPropagation(), true)

  const style = document.createElement('style')
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .widget { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; user-select: none; font-family: 'SF Mono', 'JetBrains Mono', monospace; }

    .panel {
      width: 300px;
      background: rgba(10, 10, 14, 0.94);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      overflow: hidden;
      display: none;
      animation: slideUp 0.2s ease-out;
    }
    .panel.open { display: block; }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .panel-title { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; color: rgba(255,255,255,0.8); }
    .panel-badge { font-size: 9px; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); }

    .waveform { display: flex; align-items: center; justify-content: center; gap: 3px; height: 36px; padding: 8px 14px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .bar { width: 3px; border-radius: 2px; background: rgba(255,255,255,0.12); transition: all 0.3s; }
    .bar.active { background: #00f0ff; animation: barPulse var(--s, 0.8s) ease-in-out infinite; animation-delay: var(--d, 0s); }
    @keyframes barPulse { 0%,100% { height: var(--mn, 4px); } 50% { height: var(--mx, 24px); } }

    .transcript { padding: 10px 14px; min-height: 20px; max-height: 60px; overflow: hidden; font-size: 11px; line-height: 1.5; color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.06); }
    .transcript:empty { display: none; }

    .status { text-align: center; padding: 6px 14px; font-size: 10px; letter-spacing: 0.1em; color: rgba(255,255,255,0.2); }

    .lang-select {
      padding: 6px 14px; border-top: 1px solid rgba(255,255,255,0.06);
      display: flex; align-items: center; gap: 8px;
    }
    .lang-select label { font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 0.1em; }
    .lang-select select {
      flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 4px; padding: 3px 6px; color: white; font-family: inherit; font-size: 10px; outline: none;
    }

    .mic-btn {
      width: 56px; height: 56px; border-radius: 50%;
      background: rgba(10, 10, 14, 0.94); backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.08); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.3s; position: relative;
    }
    .mic-btn:hover { border-color: rgba(255,255,255,0.15); transform: scale(1.05); }

    .mic-btn.idle { box-shadow: 0 0 0 2px rgba(255,255,255,0.15), 0 4px 16px rgba(0,0,0,0.4); }
    .mic-btn.recording { box-shadow: 0 0 0 2px #ff3b5c, 0 0 20px rgba(255,59,92,0.4); animation: pulse 1.2s ease-in-out infinite; }
    .mic-btn.processing { box-shadow: 0 0 0 2px #ffb800, 0 0 16px rgba(255,184,0,0.3); }
    .mic-btn.done { box-shadow: 0 0 0 2px #00ff88, 0 0 16px rgba(0,255,136,0.3); }

    @keyframes pulse {
      0%,100% { box-shadow: 0 0 0 2px #ff3b5c, 0 0 20px rgba(255,59,92,0.4); }
      50% { box-shadow: 0 0 0 4px #ff3b5c, 0 0 32px rgba(255,59,92,0.6); }
    }

    .close-btn {
      position: absolute; top: -4px; right: -4px; width: 18px; height: 18px;
      border-radius: 50%; background: rgba(255,59,92,0.8); border: none;
      color: white; font-size: 10px; cursor: pointer; display: flex;
      align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;
    }
    .widget:hover .close-btn { opacity: 1; }
  `

  const container = document.createElement('div')
  container.className = 'widget'
  container.innerHTML = `
    <div class="panel" id="panel">
      <div class="panel-header">
        <span class="panel-title">\u2261 48CO</span>
        <span class="panel-badge">Bookmarklet</span>
      </div>
      <div class="waveform" id="waveform"></div>
      <div class="transcript" id="transcript"></div>
      <div class="status" id="status">Click mic, middle-click, or Ctrl+Shift+Space</div>
      <div class="lang-select">
        <label>LANG</label>
        <select id="lang-sel">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="ar">Arabic</option>
          <option value="pt">Portuguese</option>
          <option value="ru">Russian</option>
          <option value="hi">Hindi</option>
          <option value="it">Italian</option>
          <option value="nl">Dutch</option>
          <option value="pl">Polish</option>
          <option value="tr">Turkish</option>
          <option value="vi">Vietnamese</option>
          <option value="th">Thai</option>
          <option value="sv">Swedish</option>
          <option value="mi">Maori</option>
        </select>
      </div>
    </div>
    <div style="position:relative">
      <button class="mic-btn idle" id="mic-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5">
          <rect x="9" y="2" width="6" height="11" rx="3"/>
          <path d="M5 10a7 7 0 0014 0"/>
          <line x1="12" y1="21" x2="12" y2="17"/>
          <line x1="9" y1="21" x2="15" y2="21"/>
        </svg>
      </button>
      <button class="close-btn" id="close-btn">\u00d7</button>
    </div>
  `

  // Build waveform
  const waveformEl = container.querySelector('#waveform')
  const configs = [
    { s: '0.7s', d: '0s', mn: 5, mx: 20 },
    { s: '0.9s', d: '0.1s', mn: 8, mx: 26 },
    { s: '0.6s', d: '0.2s', mn: 3, mx: 22 },
    { s: '1.0s', d: '0.05s', mn: 10, mx: 30 },
    { s: '0.75s', d: '0.15s', mn: 6, mx: 18 },
  ]
  for (let i = 0; i < 18; i++) {
    const c = configs[i % 5]
    const bar = document.createElement('div')
    bar.className = 'bar'
    bar.style.setProperty('--s', c.s)
    bar.style.setProperty('--d', c.d)
    bar.style.setProperty('--mn', c.mn + 'px')
    bar.style.setProperty('--mx', c.mx + 'px')
    bar.style.height = (3 + (i % 5) * 2) + 'px'
    waveformEl.appendChild(bar)
  }

  shadow.appendChild(style)
  shadow.appendChild(container)
  document.body.appendChild(host)

  // ═══════════════════════════════════════════════════════════════
  // SPEECH RECOGNITION
  // ═══════════════════════════════════════════════════════════════

  const micBtn = container.querySelector('#mic-btn')
  const panel = container.querySelector('#panel')
  const transcriptEl = container.querySelector('#transcript')
  const statusEl = container.querySelector('#status')
  const langSel = container.querySelector('#lang-sel')
  const closeBtn = container.querySelector('#close-btn')
  const bars = container.querySelectorAll('.bar')

  let status = 'idle' // idle | recording | processing | done
  let recognition = null

  const ICONS = {
    mic: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="21" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/></svg>',
    wave: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b5c" stroke-width="1.5"><path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"/></svg>',
    check: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }

  function updateUI() {
    bars.forEach((bar, i) => {
      if (status === 'recording') bar.classList.add('active')
      else { bar.classList.remove('active'); bar.style.height = (3 + (i % 5) * 2) + 'px' }
    })

    if (status === 'idle') {
      micBtn.innerHTML = ICONS.mic
      micBtn.className = 'mic-btn idle'
      statusEl.textContent = 'Click mic, middle-click, or Ctrl+Shift+Space'
    } else if (status === 'recording') {
      micBtn.innerHTML = ICONS.wave
      micBtn.className = 'mic-btn recording'
      statusEl.textContent = 'Listening... click to stop'
      panel.classList.add('open')
    } else if (status === 'processing') {
      micBtn.className = 'mic-btn processing'
      statusEl.textContent = 'Processing...'
    } else if (status === 'done') {
      micBtn.innerHTML = ICONS.check
      micBtn.className = 'mic-btn done'
    }
  }

  function startRecording() {
    if (status !== 'idle') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      statusEl.textContent = 'Speech API not supported — use Chrome or Edge'
      return
    }

    recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = langSel.value || 'en'

    recognition.onstart = () => { status = 'recording'; updateUI() }

    recognition.onresult = (e) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript
      transcriptEl.textContent = full
    }

    recognition.onend = () => {
      const rawText = transcriptEl.textContent
      if (!rawText || !rawText.trim()) {
        status = 'idle'; transcriptEl.textContent = ''; updateUI()
        return
      }

      status = 'processing'; updateUI()
      const processed = postProcess(rawText)
      const inserted = insertText(processed)

      if (inserted) {
        status = 'done'
        statusEl.textContent = 'Typed into text field'
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(processed).then(() => {
          status = 'done'
          statusEl.textContent = 'Copied to clipboard (no text field found)'
        }).catch(() => {
          status = 'done'
          statusEl.textContent = 'Ready — click a text field first'
        })
      }
      updateUI()

      setTimeout(() => {
        status = 'idle'; transcriptEl.textContent = ''; updateUI()
      }, 2000)
    }

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') {
        statusEl.textContent = 'Microphone access denied — check browser permissions'
      } else if (e.error !== 'aborted') {
        statusEl.textContent = 'Error: ' + e.error
      }
      status = 'idle'; updateUI()
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
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════

  micBtn.addEventListener('click', () => {
    if (status === 'idle') { panel.classList.add('open'); startRecording() }
    else if (status === 'recording') stopRecording()
    else panel.classList.toggle('open')
  })

  closeBtn.addEventListener('click', () => {
    if (status === 'recording') stopRecording()
    host.remove()
  })

  // Keyboard shortcut: Ctrl+Shift+Space
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
      e.preventDefault()
      if (status === 'idle') { panel.classList.add('open'); startRecording() }
      else if (status === 'recording') stopRecording()
    }
  })

  // Middle-click (wheel button press) toggle
  window.addEventListener('mousedown', (e) => {
    if (e.button !== 1) return
    e.preventDefault()
    if (status === 'idle') { startRecording(); panel.classList.add('open') }
    else if (status === 'recording') stopRecording()
  })
  window.addEventListener('auxclick', (e) => { if (e.button === 1) e.preventDefault() })

  // Save language preference
  langSel.addEventListener('change', () => {
    try { localStorage.setItem('48co-lang', langSel.value) } catch {}
  })
  try { const saved = localStorage.getItem('48co-lang'); if (saved) langSel.value = saved } catch {}

  // Initial render
  updateUI()
  panel.classList.add('open')

  console.log('[48co] Voice widget injected. Middle-click or Ctrl+Shift+Space to toggle.')
})()
