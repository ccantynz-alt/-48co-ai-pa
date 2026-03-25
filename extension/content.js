/**
 * 48co Content Script — STREAMING VOICE-TO-TEXT
 *
 * Works like WhisperTyping: text appears in the chat box WORD BY WORD
 * as you speak. No popups. No overlays. No visible UI.
 *
 * Trigger: Mouse wheel click (auxclick button 1) or Ctrl+Shift+Space
 *
 * How it works:
 * 1. User clicks mouse wheel → recording starts
 * 2. Web Speech API streams interim results
 * 3. Each word is IMMEDIATELY inserted into the focused text field
 * 4. User clicks mouse wheel again → recording stops
 * 5. Final text is cleaned up (punctuation, capitalization)
 */
;(function () {
  'use strict'

  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  let state = {
    status: 'idle', // idle | recording
    engine: 'web-speech',
    language: 'en',
    codingMode: false,
    autoCoding: true,
    autoSubmit: false,
    pushToTalk: false,
    vocabulary: [],
    replacements: [],
  }

  let recognition = null
  let lastInsertedText = '' // track what we've already typed so we only insert new chars

  // Load settings
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

  // ═══════════════════════════════════════════════════════════════
  // TEXT INSERTION — multiple methods for different editors
  // ═══════════════════════════════════════════════════════════════

  let lastFocusedInput = null

  // Remember the last text field the user clicked/focused
  document.addEventListener('focusin', (e) => {
    const t = e.target
    if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.contentEditable === 'true') {
      lastFocusedInput = t
    }
  }, true)

  function findTextInput() {
    // Try site-specific selectors first
    const host = window.location.hostname
    const selectors = []

    if (host.includes('claude.ai')) {
      selectors.push(
        'div.ProseMirror[contenteditable="true"]',
        'div[contenteditable="true"][data-placeholder]',
        'fieldset div[contenteditable="true"]',
      )
    } else if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) {
      selectors.push('#prompt-textarea', 'div[id="prompt-textarea"]', 'div.ProseMirror[contenteditable="true"]')
    } else if (host.includes('gemini.google.com')) {
      selectors.push('rich-textarea div[contenteditable="true"]', 'div.ql-editor[contenteditable="true"]')
    } else if (host.includes('chat.deepseek.com')) {
      selectors.push('textarea#chat-input', 'textarea[placeholder*="message"]')
    }

    // Site-specific
    for (const sel of selectors) {
      try { const el = document.querySelector(sel); if (el) return el } catch {}
    }

    // Last focused
    if (lastFocusedInput && document.body.contains(lastFocusedInput)) return lastFocusedInput

    // Generic fallback
    const generic = ['textarea:focus', 'div[contenteditable="true"]:focus', 'textarea', 'div[contenteditable="true"]', 'input[type="text"]']
    for (const sel of generic) {
      try { const el = document.querySelector(sel); if (el) return el } catch {}
    }

    return null
  }

  // Insert text at cursor position
  function insertAtCursor(text) {
    const el = findTextInput()
    if (!el) return false
    el.focus()

    if (el.contentEditable === 'true') {
      // Method 1: execCommand (works on many editors)
      const ok = document.execCommand('insertText', false, text)
      if (ok) {
        el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
        return true
      }

      // Method 2: Synthetic paste (works on ProseMirror — Claude, ChatGPT)
      try {
        const dt = new DataTransfer()
        dt.setData('text/plain', text)
        el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }))
        return true
      } catch {}

      // Method 3: Direct DOM insert
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
      } catch {}

      return false
    }

    // Textarea / input
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      const start = el.selectionStart || el.value.length
      const before = el.value.substring(0, start)
      const after = el.value.substring(el.selectionEnd || start)
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
      setter.call(el, before + text + after)
      el.selectionStart = el.selectionEnd = start + text.length
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    }

    return false
  }

  // Replace ALL text in the field (used for final cleanup)
  function replaceAllText(el, newText) {
    if (!el) return
    el.focus()

    if (el.contentEditable === 'true') {
      // Select all then replace
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(el)
      sel.removeAllRanges()
      sel.addRange(range)
      document.execCommand('insertText', false, newText)
      el.dispatchEvent(new InputEvent('input', { bubbles: true }))
    } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
      setter.call(el, newText)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // STREAMING SPEECH RECOGNITION
  // Text appears word-by-word as user speaks — like WhisperTyping
  // ═══════════════════════════════════════════════════════════════

  function startStreaming() {
    if (state.status !== 'idle') return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      console.warn('[48co] Speech API not available — use Chrome or Edge')
      return
    }

    // Remember which text field we're typing into
    const targetEl = findTextInput()
    if (!targetEl) {
      console.warn('[48co] No text field found — click on a text box first')
      return
    }
    targetEl.focus()

    // Track what's already in the field so we don't overwrite it
    const existingText = targetEl.contentEditable === 'true'
      ? (targetEl.innerText || '')
      : (targetEl.value || '')

    recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true // KEY: this enables real-time streaming
    recognition.lang = state.language || 'en'

    lastInsertedText = ''
    let finalText = ''

    recognition.onstart = () => {
      state.status = 'recording'
      updateBadge('recording')
    }

    recognition.onresult = (e) => {
      // Build the full transcript from all results
      let full = ''
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript
      }

      // Calculate what's NEW since last update
      if (full.length > lastInsertedText.length) {
        const newChars = full.substring(lastInsertedText.length)
        insertAtCursor(newChars)
        lastInsertedText = full
      } else if (full !== lastInsertedText) {
        // Speech API revised earlier text — need to replace
        // This happens when interim results change
        // For now, just update our tracker (don't rewrite — too disruptive)
        lastInsertedText = full
      }

      finalText = full
    }

    recognition.onend = () => {
      state.status = 'idle'
      recognition = null

      // Apply post-processing to the final text
      if (finalText) {
        const processed = postProcess(finalText)
        if (processed !== finalText) {
          // Replace the raw transcript with polished version
          const el = findTextInput()
          if (el) {
            const currentContent = el.contentEditable === 'true'
              ? (el.innerText || '')
              : (el.value || '')
            // Only replace the part we dictated (after existing text)
            const ourPart = currentContent.substring(existingText.length)
            if (ourPart) {
              const newContent = existingText + processed
              replaceAllText(el, newContent)
            }
          }
        }
      }

      lastInsertedText = ''
      updateBadge('idle')
    }

    recognition.onerror = (e) => {
      if (e.error === 'aborted') return
      console.warn('[48co]', e.error)
      state.status = 'idle'
      recognition = null
      lastInsertedText = ''
      updateBadge('idle')
    }

    try {
      recognition.start()
    } catch (err) {
      console.warn('[48co] Failed to start:', err)
      state.status = 'idle'
      recognition = null
    }
  }

  function stopStreaming() {
    if (recognition && state.status === 'recording') {
      try { recognition.stop() } catch {}
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // POST-PROCESSING (cleanup after recording stops)
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
  ]

  function postProcess(text) {
    let result = text

    for (const [p, r] of PUNCTUATION_MAP) result = result.replace(p, r)

    // Custom vocabulary
    if (state.vocabulary && state.vocabulary.length > 0) {
      for (const { from, to } of state.vocabulary) {
        if (from && to) {
          const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          result = result.replace(new RegExp('\\b' + escaped + '\\b', 'gi'), to)
        }
      }
    }

    // Custom replacements
    if (state.replacements && state.replacements.length > 0) {
      for (const { from, to } of state.replacements) {
        if (from && to) result = result.replaceAll(from, to)
      }
    }

    // Cleanup
    result = result.replace(/\s+([.,;:!?)\]}])/g, '$1')
    result = result.replace(/([.,;:!?])([A-Za-z])/g, '$1 $2')
    result = result.replace(/^(\s*)([a-z])/, (_, ws, ch) => ws + ch.toUpperCase())
    result = result.replace(/([.!?]\s+)([a-z])/g, (_, p, ch) => p + ch.toUpperCase())
    result = result.replace(/ {2,}/g, ' ')

    return result.trim()
  }

  // ═══════════════════════════════════════════════════════════════
  // BADGE (the ONLY UI — just the extension icon)
  // ═══════════════════════════════════════════════════════════════

  function updateBadge(status) {
    try { chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', status }) } catch {}
  }

  // ═══════════════════════════════════════════════════════════════
  // EVENT HANDLERS — mouse wheel click + keyboard shortcut
  // ═══════════════════════════════════════════════════════════════

  // Mouse wheel CLICK (not scroll) — auxclick only fires on press+release
  window.addEventListener('auxclick', (e) => {
    if (e.button !== 1) return
    e.preventDefault()
    e.stopPropagation()
    if (state.status === 'idle') startStreaming()
    else if (state.status === 'recording') stopStreaming()
  }, true)

  // Prevent middle-click auto-scroll
  window.addEventListener('mousedown', (e) => { if (e.button === 1) e.preventDefault() })

  // Messages from popup/background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'TOGGLE_RECORDING') {
      if (state.status === 'idle') startStreaming()
      else if (state.status === 'recording') stopStreaming()
    }
    if (msg.type === 'FORCE_RESET') {
      if (recognition) { try { recognition.abort() } catch {} recognition = null }
      state.status = 'idle'
      lastInsertedText = ''
      updateBadge('idle')
    }
    if (msg.type === 'STATE_UPDATED') {
      Object.assign(state, msg.updates)
    }
    // Whisper engine: transcription comes back as complete text
    if (msg.type === 'TRANSCRIPTION_READY') {
      if (msg.error) { console.warn('[48co]', msg.error); updateBadge('idle'); return }
      if (msg.text) {
        const processed = postProcess(msg.text)
        insertAtCursor(processed)
      }
      state.status = 'idle'
      updateBadge('idle')
    }
  })

  // Push-to-talk
  let pttActive = false
  window.addEventListener('keydown', (e) => {
    if (!state.pushToTalk) return
    if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey && e.key === 'Shift' && !pttActive) {
      pttActive = true
      startStreaming()
      e.preventDefault()
    }
  })
  window.addEventListener('keyup', (e) => {
    if (!state.pushToTalk) return
    if (pttActive && (e.key === 'Shift' || e.key === 'Control')) {
      pttActive = false
      stopStreaming()
      e.preventDefault()
    }
  })

})()
