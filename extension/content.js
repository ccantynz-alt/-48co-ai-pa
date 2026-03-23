/**
 * 48co Content Script
 * Injected into AI chat pages. Creates a Shadow DOM widget for voice input.
 * Self-contained — no ES module imports (MV3 content scripts require bundling for imports).
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

  function detectSite() {
    const host = window.location.hostname
    if (host.includes('claude.ai')) return ADAPTERS.claude
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) return ADAPTERS.chatgpt
    if (host.includes('gemini.google.com')) return ADAPTERS.gemini
    if (host.includes('chat.deepseek.com')) return ADAPTERS.deepseek
    return null
  }

  function getInput(adapter) { return queryFirst(adapter.input) }
  function getSend(adapter) { return queryFirst(adapter.send) }

  function insertText(adapter, text) {
    const el = getInput(adapter)
    if (!el) return false
    el.focus()

    if (el.contentEditable === 'true') {
      // Clear placeholder if present
      const placeholder = el.querySelector('p.is-empty, p.is-editor-empty')
      if (placeholder) placeholder.textContent = ''
      document.execCommand('insertText', false, text)
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
      return true
    }

    // Regular textarea/input fallback
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
  }

  let recognition = null
  const adapter = detectSite()
  if (!adapter) return // not on a supported site

  // Load persisted settings
  chrome.storage.local.get(['codingMode', 'autoCoding', 'autoSubmit', 'engine'], (stored) => {
    if (stored.codingMode !== undefined) state.codingMode = stored.codingMode
    if (stored.autoCoding !== undefined) state.autoCoding = stored.autoCoding
    if (stored.autoSubmit !== undefined) state.autoSubmit = stored.autoSubmit
    if (stored.engine !== undefined) state.engine = stored.engine
  })

  // ═══════════════════════════════════════════════════════════════════
  // SHADOW DOM WIDGET
  // ═══════════════════════════════════════════════════════════════════

  const host = document.createElement('div')
  host.id = 'foureightco-widget-host'
  const shadow = host.attachShadow({ mode: 'closed' })

  // Prevent events from leaking to host page
  host.addEventListener('click', (e) => e.stopPropagation(), true)
  host.addEventListener('keydown', (e) => e.stopPropagation(), true)
  host.addEventListener('keyup', (e) => e.stopPropagation(), true)

  const style = document.createElement('style')
  style.textContent = `
    :host {
      all: initial;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .widget {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      user-select: none;
    }

    /* ── Expanded panel ─────────────────────────────── */
    .panel {
      width: 320px;
      background: rgba(10, 10, 14, 0.92);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
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

    /* Title bar */
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .panel-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: rgba(255, 255, 255, 0.8);
    }
    .panel-site {
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.3);
    }
    .panel-controls {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    /* Code mode button */
    .code-btn {
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: transparent;
      color: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }
    .code-btn:hover { border-color: rgba(255, 255, 255, 0.2); }
    .code-btn.active {
      border-color: #00f0ff;
      color: #00f0ff;
    }

    /* Waveform */
    .waveform {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      height: 40px;
      padding: 8px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .bar {
      width: 3px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.15);
      transition: all 0.3s ease;
    }
    .bar.active {
      background: #00f0ff;
      animation: barPulse var(--bar-speed, 0.8s) ease-in-out infinite;
      animation-delay: var(--bar-delay, 0s);
    }

    @keyframes barPulse {
      0%, 100% { height: var(--bar-min, 4px); }
      50% { height: var(--bar-max, 28px); }
    }

    /* Transcript area */
    .transcript {
      padding: 10px 14px;
      min-height: 24px;
      max-height: 60px;
      overflow: hidden;
      font-size: 11px;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.4);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .transcript:empty { display: none; }

    /* Status label */
    .status-label {
      text-align: center;
      padding: 6px 14px;
      font-size: 10px;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.2);
    }

    /* ── Floating mic button ────────────────────────── */
    .mic-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(10, 10, 14, 0.92);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
    }
    .mic-btn:hover {
      border-color: rgba(255, 255, 255, 0.15);
      transform: scale(1.05);
    }

    .mic-btn svg { transition: all 0.3s; }

    /* Ring states */
    .mic-btn.idle {
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(0, 0, 0, 0.4);
    }
    .mic-btn.recording {
      box-shadow: 0 0 0 2px #ff3b5c, 0 0 20px rgba(255, 59, 92, 0.4);
      animation: pulseRing 1.2s ease-in-out infinite;
    }
    .mic-btn.processing {
      box-shadow: 0 0 0 2px #ffb800, 0 0 16px rgba(255, 184, 0, 0.3);
    }
    .mic-btn.done {
      box-shadow: 0 0 0 2px #00ff88, 0 0 16px rgba(0, 255, 136, 0.3);
    }

    @keyframes pulseRing {
      0%, 100% { box-shadow: 0 0 0 2px #ff3b5c, 0 0 20px rgba(255, 59, 92, 0.4); }
      50% { box-shadow: 0 0 0 4px #ff3b5c, 0 0 32px rgba(255, 59, 92, 0.6); }
    }

    /* Spinner animation */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin { animation: spin 1s linear infinite; }

    /* Drag handle */
    .drag-zone {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.1);
      cursor: grab;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .widget:hover .drag-zone { opacity: 1; }
  `

  // ── Build the widget HTML ────────────────────────────────────────
  const container = document.createElement('div')
  container.className = 'widget'
  container.innerHTML = `
    <div class="panel" id="panel">
      <div class="panel-header">
        <span class="panel-title">\u2261 48CO</span>
        <div class="panel-controls">
          <span class="panel-site">${adapter.name}</span>
          <button class="code-btn" id="code-toggle">CODE</button>
        </div>
      </div>
      <div class="waveform" id="waveform"></div>
      <div class="transcript" id="transcript"></div>
      <div class="status-label" id="status-label">SCROLL \u2191\u2193 \u00b7 CLICK \u00b7 CTRL+SHIFT+SPACE</div>
    </div>
    <div class="drag-zone"></div>
    <button class="mic-btn idle" id="mic-btn">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5">
        <rect x="9" y="2" width="6" height="11" rx="3"/>
        <path d="M5 10a7 7 0 0014 0"/>
        <line x1="12" y1="21" x2="12" y2="17"/>
        <line x1="9" y1="21" x2="15" y2="21"/>
      </svg>
    </button>
  `

  // Build waveform bars
  const waveformEl = container.querySelector('#waveform')
  const barConfigs = [
    { speed: '0.7s', delay: '0s', min: 6, max: 22 },
    { speed: '0.9s', delay: '0.1s', min: 10, max: 30 },
    { speed: '0.6s', delay: '0.2s', min: 4, max: 26 },
    { speed: '1.0s', delay: '0.05s', min: 14, max: 36 },
    { speed: '0.75s', delay: '0.15s', min: 8, max: 20 },
  ]
  for (let i = 0; i < 20; i++) {
    const cfg = barConfigs[i % 5]
    const bar = document.createElement('div')
    bar.className = 'bar'
    bar.style.setProperty('--bar-speed', cfg.speed)
    bar.style.setProperty('--bar-delay', cfg.delay)
    bar.style.setProperty('--bar-min', cfg.min + 'px')
    bar.style.setProperty('--bar-max', cfg.max + 'px')
    bar.style.height = (4 + (i % 5) * 3) + 'px'
    waveformEl.appendChild(bar)
  }

  shadow.appendChild(style)
  shadow.appendChild(container)

  // ── Wait for page to be ready, then inject ───────────────────────
  function inject() {
    if (!document.body.contains(host)) {
      document.body.appendChild(host)
    }
  }

  // Use MutationObserver to wait for the chat input to appear (SPA)
  const observer = new MutationObserver(() => {
    if (getInput(adapter)) {
      inject()
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  // Also try immediately
  if (document.body) inject()

  // ── Widget element references ────────────────────────────────────
  const micBtn = container.querySelector('#mic-btn')
  const panel = container.querySelector('#panel')
  const transcriptEl = container.querySelector('#transcript')
  const statusLabel = container.querySelector('#status-label')
  const codeToggle = container.querySelector('#code-toggle')
  const bars = container.querySelectorAll('.bar')

  // ═══════════════════════════════════════════════════════════════════
  // UI UPDATE
  // ═══════════════════════════════════════════════════════════════════

  const ICONS = {
    mic: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0014 0"/><line x1="12" y1="21" x2="12" y2="17"/><line x1="9" y1="21" x2="15" y2="21"/></svg>',
    wave: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff3b5c" stroke-width="1.5"><path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"/></svg>',
    spinner: '<svg class="spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffb800" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>',
    check: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  }

  const STATUS_CONFIG = {
    idle:       { icon: 'mic',     label: 'Scroll \u2191 to record',            ringClass: 'idle' },
    recording:  { icon: 'wave',    label: 'Scroll \u2193 to stop \u00b7 Recording...', ringClass: 'recording' },
    processing: { icon: 'spinner', label: 'Transcribing\u2026',                 ringClass: 'processing' },
    done:       { icon: 'check',   label: 'Pasted \u2713',                      ringClass: 'done' },
  }

  function updateUI() {
    const cfg = STATUS_CONFIG[state.status]
    micBtn.innerHTML = ICONS[cfg.icon]
    micBtn.className = 'mic-btn ' + cfg.ringClass
    statusLabel.textContent = cfg.label
    transcriptEl.textContent = state.transcript

    // Waveform bars
    bars.forEach((bar, i) => {
      if (state.status === 'recording') {
        bar.classList.add('active')
      } else {
        bar.classList.remove('active')
        bar.style.height = (4 + (i % 5) * 3) + 'px'
      }
    })

    // Code toggle
    codeToggle.className = state.codingMode ? 'code-btn active' : 'code-btn'

    // Auto-show panel when recording
    if (state.status === 'recording' || state.status === 'processing') {
      panel.classList.add('open')
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SPEECH RECOGNITION (Web Speech API — free engine)
  // ═══════════════════════════════════════════════════════════════════

  function startWebSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      statusLabel.textContent = 'Speech API not supported — use Chrome'
      return
    }

    recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-NZ'

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
      transcriptEl.textContent = full
    }

    recognition.onend = () => {
      processTranscript(state.transcript)
    }

    recognition.onerror = (e) => {
      if (e.error !== 'aborted') {
        state.status = 'idle'
        updateUI()
      }
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

  function startRecording() {
    if (state.status !== 'idle') return

    if (state.engine === 'whisper') {
      // Tell background to start offscreen recording
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

    let output = (cmd && cmd.action === 'text') ? cmd.output : text

    // Auto coding mode — wrap in code fences if coding content detected
    if (state.codingMode || (state.autoCoding && isCodingContent(output))) {
      output = wrapCode(output)
    }

    // Insert into the AI chat input
    const inserted = insertText(adapter, output)

    if (inserted) {
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
      }, 1500)
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(output).then(() => {
        statusLabel.textContent = 'Copied to clipboard (no input found)'
        state.status = 'done'
        updateUI()
        setTimeout(() => { state.status = 'idle'; state.transcript = ''; updateUI() }, 2000)
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  // Click mic button
  micBtn.addEventListener('click', () => {
    if (state.status === 'idle') {
      panel.classList.add('open')
      startRecording()
    } else if (state.status === 'recording') {
      stopRecording()
    } else {
      // Toggle panel visibility when not recording
      panel.classList.toggle('open')
    }
  })

  // Code mode toggle
  codeToggle.addEventListener('click', () => {
    state.codingMode = !state.codingMode
    chrome.storage.local.set({ codingMode: state.codingMode })
    updateUI()
  })

  // Scroll wheel — anywhere on the page
  window.addEventListener('wheel', (e) => {
    // Only trigger if scrolled near the widget or if chat is at scroll boundary
    if (e.deltaY < -30 && state.status === 'idle') {
      startRecording()
      panel.classList.add('open')
    }
    if (e.deltaY > 30 && state.status === 'recording') {
      stopRecording()
    }
  }, { passive: true })

  // Listen for messages from background (keyboard shortcut, Whisper result)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'START_RECORDING') startRecording()
    if (msg.type === 'STOP_RECORDING') stopRecording()
    if (msg.type === 'TRANSCRIPTION_READY') {
      state.transcript = msg.text
      processTranscript(msg.text)
    }
    if (msg.type === 'STATE_UPDATED') {
      Object.assign(state, msg.updates)
      updateUI()
    }
  })

  // Draggable widget
  let isDragging = false
  let dragStartX, dragStartY, widgetStartX, widgetStartY

  host.addEventListener('mousedown', (e) => {
    if (e.target.closest('.drag-zone')) {
      isDragging = true
      dragStartX = e.clientX
      dragStartY = e.clientY
      const rect = host.getBoundingClientRect()
      widgetStartX = rect.left
      widgetStartY = rect.top
      e.preventDefault()
    }
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartX
    const dy = e.clientY - dragStartY
    host.style.right = 'auto'
    host.style.bottom = 'auto'
    host.style.left = (widgetStartX + dx) + 'px'
    host.style.top = (widgetStartY + dy) + 'px'
  })

  document.addEventListener('mouseup', () => { isDragging = false })

  // Initial UI render
  updateUI()

})()
