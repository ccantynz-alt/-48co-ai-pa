/**
 * 48co Voice Content Script — STREAMING VOICE-TO-TEXT
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
    translateEnabled: false,
    translateTarget: 'es',
    translateDomain: 'general',
    translateFormality: 'auto',
  }

  let recognition = null
  let lastInsertedText = '' // track what we've already typed so we only insert new chars
  let deepgramInterimText = '' // current interim preview from Deepgram (replaced on each update)
  let deepgramFinalizedText = '' // all finalized Deepgram segments concatenated

  // Load settings
  chrome.storage.local.get([
    'codingMode', 'autoCoding', 'autoSubmit', 'engine', 'language',
    'pushToTalk', 'vocabulary', 'replacements',
    'translateEnabled', 'translateTarget', 'translateDomain', 'translateFormality',
  ], (stored) => {
    if (stored.codingMode !== undefined) state.codingMode = stored.codingMode
    if (stored.autoCoding !== undefined) state.autoCoding = stored.autoCoding
    if (stored.autoSubmit !== undefined) state.autoSubmit = stored.autoSubmit
    if (stored.engine !== undefined) state.engine = stored.engine
    if (stored.language !== undefined) state.language = stored.language
    if (stored.pushToTalk !== undefined) state.pushToTalk = stored.pushToTalk
    if (stored.vocabulary) state.vocabulary = stored.vocabulary
    if (stored.replacements) state.replacements = stored.replacements
    if (stored.translateEnabled !== undefined) state.translateEnabled = stored.translateEnabled
    if (stored.translateTarget) state.translateTarget = stored.translateTarget
    if (stored.translateDomain) state.translateDomain = stored.translateDomain
    if (stored.translateFormality) state.translateFormality = stored.translateFormality
  })

  // ═══════════════════════════════════════════════════════════════
  // STATUS TOAST — shows mic status so user knows what's happening
  // ═══════════════════════════════════════════════════════════════

  let toastEl = null
  let toastTimeout = null

  function showToast(message, type = 'info', duration = 3000) {
    if (toastEl) toastEl.remove()

    const colors = {
      recording: 'background:rgba(79,70,229,0.95);color:white;',
      error:     'background:rgba(220,38,38,0.95);color:white;',
      success:   'background:rgba(5,150,105,0.95);color:white;',
      info:      'background:rgba(26,26,46,0.92);color:rgba(255,255,255,0.95);',
    }

    toastEl = document.createElement('div')
    toastEl.setAttribute('style', `
      position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(8px);
      z-index:2147483647;padding:10px 22px;border-radius:10px;
      font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:13px;font-weight:500;pointer-events:none;
      transition:opacity 0.25s ease,transform 0.25s ease;opacity:0;
      box-shadow:0 4px 20px rgba(0,0,0,0.12);letter-spacing:-0.01em;
      ${colors[type] || colors.info}
    `)
    toastEl.textContent = message
    document.body.appendChild(toastEl)
    requestAnimationFrame(() => {
      toastEl.style.opacity = '1'
      toastEl.style.transform = 'translateX(-50%) translateY(0)'
    })

    if (toastTimeout) clearTimeout(toastTimeout)
    if (duration > 0) {
      toastTimeout = setTimeout(() => {
        if (toastEl) {
          toastEl.style.opacity = '0'
          toastEl.style.transform = 'translateX(-50%) translateY(8px)'
          setTimeout(() => { if (toastEl) toastEl.remove(); toastEl = null }, 250)
        }
      }, duration)
    }
  }

  function hideToast() {
    if (toastEl) { toastEl.style.opacity = '0'; setTimeout(() => { if (toastEl) toastEl.remove(); toastEl = null }, 300) }
    if (toastTimeout) clearTimeout(toastTimeout)
  }

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
    } else if (host.includes('mail.google.com')) {
      selectors.push('div[aria-label="Message Body"][contenteditable="true"]', 'div.Am.Al.editable[contenteditable="true"]')
    } else if (host.includes('slack.com')) {
      selectors.push('div[data-qa="message_input"] div[contenteditable="true"]', 'div.ql-editor[contenteditable="true"]')
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

  // Insert text at cursor position — tries modern methods first, deprecated last
  function insertAtCursor(text) {
    const el = findTextInput()
    if (!el) return false
    el.focus()

    if (el.contentEditable === 'true') {
      // Method 1: Selection/Range API (modern, not deprecated)
      try {
        const sel = window.getSelection()
        if (sel.rangeCount) {
          const range = sel.getRangeAt(0)
          range.deleteContents()
          const textNode = document.createTextNode(text)
          range.insertNode(textNode)
          range.setStartAfter(textNode)
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)
          el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }))
          return true
        }
      } catch {}

      // Method 2: Synthetic paste (works on ProseMirror — Claude, ChatGPT)
      try {
        const dt = new DataTransfer()
        dt.setData('text/plain', text)
        el.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }))
        return true
      } catch {}

      // Method 3: execCommand fallback (deprecated but still works in some editors)
      try {
        const ok = document.execCommand('insertText', false, text)
        if (ok) {
          el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
          return true
        }
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
      // Select all then replace via Selection API
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(el)
      sel.removeAllRanges()
      sel.addRange(range)

      // Try modern method first
      range.deleteContents()
      const textNode = document.createTextNode(newText)
      range.insertNode(textNode)
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText', data: newText }))
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

    // ── Deepgram engine — real-time streaming via offscreen WebSocket ──
    if (state.engine === 'deepgram') {
      const targetEl = findTextInput()
      if (!targetEl) {
        showToast('Click on a text box first, then try again.', 'error', 4000)
        return
      }
      targetEl.focus()

      deepgramInterimText = ''
      deepgramFinalizedText = ''
      state.status = 'recording'
      updateBadge('recording')
      showToast('Listening (Deepgram)... speak now', 'recording', 0)

      // Tell background to start Deepgram streaming via offscreen
      chrome.runtime.sendMessage({ type: 'START_DEEPGRAM' })
      return
    }

    // ── Whisper engine — handled by offscreen (record-then-transcribe) ──
    if (state.engine === 'whisper') {
      const targetEl = findTextInput()
      if (!targetEl) {
        showToast('Click on a text box first, then try again.', 'error', 4000)
        return
      }
      targetEl.focus()

      state.status = 'recording'
      updateBadge('recording')
      showToast('Recording (Whisper)... speak now', 'recording', 0)

      chrome.runtime.sendMessage({ type: 'START_RECORDING' })
      return
    }

    // ── Web Speech API — default free engine ──
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      showToast('Voice not supported in this browser. Use Chrome or Edge.', 'error', 5000)
      return
    }

    // Remember which text field we're typing into
    const targetEl = findTextInput()
    if (!targetEl) {
      showToast('Click on a text box first, then try again.', 'error', 4000)
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
      showToast('Listening... speak now', 'recording', 0)
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
        // Speech API revised earlier text — update tracker
        lastInsertedText = full
      }

      finalText = full
    }

    recognition.onend = async () => {
      state.status = 'idle'
      recognition = null

      // Apply post-processing to the final text
      if (finalText) {
        let processed = postProcess(finalText)

        // Translate if enabled
        if (state.translateEnabled) {
          showToast('Translating...', 'info', 0)
          processed = await translateText(processed)
        }

        // Replace the raw transcript with polished/translated version
        const el = findTextInput()
        if (el) {
          const currentContent = el.contentEditable === 'true'
            ? (el.innerText || '')
            : (el.value || '')
          const ourPart = currentContent.substring(existingText.length)
          if (ourPart) {
            const newContent = existingText + processed
            replaceAllText(el, newContent)
          }
        }
        showToast(state.translateEnabled ? 'Translated' : 'Done', 'success', 1500)
      } else {
        hideToast()
      }

      lastInsertedText = ''
      updateBadge('idle')
    }

    recognition.onerror = (e) => {
      if (e.error === 'aborted') return

      // Show user-friendly error messages
      const messages = {
        'not-allowed': 'Microphone blocked. Click the lock icon in your browser address bar and allow microphone access.',
        'no-speech': 'No speech detected. Try speaking louder or check your microphone.',
        'audio-capture': 'No microphone found. Check that a microphone is connected and selected as your default.',
        'network': 'Network error. Check your internet connection.',
        'service-not-allowed': 'Speech service not available. Try refreshing the page.',
      }

      const msg = messages[e.error] || `Mic error: ${e.error}`
      showToast(msg, 'error', 6000)
      console.warn('[48co Voice]', e.error, msg)

      state.status = 'idle'
      recognition = null
      lastInsertedText = ''
      updateBadge('idle')
    }

    try {
      recognition.start()
    } catch (err) {
      showToast('Could not start microphone. Try refreshing the page.', 'error', 5000)
      console.warn('[48co Voice] Failed to start:', err)
      state.status = 'idle'
      recognition = null
    }
  }

  function stopStreaming() {
    if (state.status !== 'recording') return

    if (state.engine === 'deepgram') {
      // Stop Deepgram streaming
      chrome.runtime.sendMessage({ type: 'STOP_DEEPGRAM' })

      // Commit any remaining interim text as final
      if (deepgramInterimText) {
        // Remove the interim preview and commit it
        removeDeepgramInterimPreview()
        const processed = postProcess(deepgramFinalizedText + deepgramInterimText)
        // The finalized segments were already inserted; just finalize the last interim
        const lastInterim = postProcess(deepgramInterimText)
        insertAtCursor(lastInterim)
        deepgramInterimText = ''
      }

      deepgramFinalizedText = ''
      state.status = 'idle'
      updateBadge('idle')
      showToast('Done', 'success', 1500)
      return
    }

    if (state.engine === 'whisper') {
      showToast('Transcribing...', 'info', 0)
      chrome.runtime.sendMessage({ type: 'STOP_RECORDING' })
      return
    }

    // Web Speech API
    if (recognition) {
      showToast('Processing...', 'info', 2000)
      try { recognition.stop() } catch {}
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // DEEPGRAM INTERIM PREVIEW — faded text that updates in place
  // ═══════════════════════════════════════════════════════════════

  let interimPreviewEl = null

  function showDeepgramInterimPreview(text) {
    if (!interimPreviewEl) {
      interimPreviewEl = document.createElement('div')
      interimPreviewEl.setAttribute('style', `
        position:fixed;bottom:60px;left:50%;transform:translateX(-50%);
        z-index:2147483647;padding:8px 18px;border-radius:8px;
        font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        font-size:13px;font-weight:400;pointer-events:none;
        background:rgba(26,26,46,0.85);color:rgba(255,255,255,0.6);
        box-shadow:0 2px 12px rgba(0,0,0,0.1);letter-spacing:-0.01em;
        max-width:80vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        transition:opacity 0.15s ease;
      `)
      interimPreviewEl.setAttribute('data-48co-interim', 'true')
      document.body.appendChild(interimPreviewEl)
    }
    interimPreviewEl.textContent = text
  }

  function removeDeepgramInterimPreview() {
    if (interimPreviewEl) {
      interimPreviewEl.remove()
      interimPreviewEl = null
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
      hideToast()
      updateBadge('idle')
    }
    if (msg.type === 'STATE_UPDATED') {
      Object.assign(state, msg.updates)
    }
    // ── Deepgram streaming: interim results (faded preview) ──
    if (msg.type === 'DEEPGRAM_INTERIM') {
      if (msg.error) {
        showToast(msg.error, 'error', 6000)
        return
      }
      deepgramInterimText = msg.text || ''
      showDeepgramInterimPreview(deepgramInterimText)
    }

    // ── Deepgram streaming: final results (commit text permanently) ──
    if (msg.type === 'DEEPGRAM_FINAL') {
      removeDeepgramInterimPreview()

      if (msg.error) {
        showToast(msg.error, 'error', 6000)
        state.status = 'idle'
        updateBadge('idle')
        deepgramInterimText = ''
        deepgramFinalizedText = ''
        return
      }

      if (msg.text) {
        const finalSegment = msg.text
        // Add a space before new segments if we already have text
        const prefix = deepgramFinalizedText.length > 0 ? ' ' : ''
        const processed = postProcess(finalSegment)
        insertAtCursor(prefix + processed)
        deepgramFinalizedText += prefix + processed
      }

      // Clear interim since this segment is now finalized
      deepgramInterimText = ''
    }

    // Whisper engine: transcription comes back as complete text
    if (msg.type === 'TRANSCRIPTION_READY') {
      if (msg.error) {
        showToast(msg.error, 'error', 6000)
        updateBadge('idle')
        return
      }
      if (msg.text) {
        const processed = postProcess(msg.text)
        insertAtCursor(processed)
        showToast('Done', 'success', 1500)
      }
      state.status = 'idle'
      updateBadge('idle')
    }
  })

  // Push-to-talk — hold Ctrl+Shift to record, release to stop
  let pttActive = false
  let pttKeys = { ctrl: false, shift: false }

  window.addEventListener('keydown', (e) => {
    if (!state.pushToTalk) return

    if (e.key === 'Control') pttKeys.ctrl = true
    if (e.key === 'Shift') pttKeys.shift = true

    if (pttKeys.ctrl && pttKeys.shift && !pttActive) {
      pttActive = true
      startStreaming()
      e.preventDefault()
    }
  })

  window.addEventListener('keyup', (e) => {
    if (!state.pushToTalk) return

    if (e.key === 'Control') pttKeys.ctrl = false
    if (e.key === 'Shift') pttKeys.shift = false

    if (pttActive && (!pttKeys.ctrl || !pttKeys.shift)) {
      pttActive = false
      stopStreaming()
      e.preventDefault()
    }
  })

  // ═══════════════════════════════════════════════════════════════
  // REAL-TIME TRANSLATION
  // Speak in one language, text appears in another.
  // Uses the managed API (48co.nz) or user's Claude key as fallback.
  // ═══════════════════════════════════════════════════════════════

  async function translateText(text) {
    if (!state.translateEnabled || !text || text.length < 3) return text

    const authToken = (await chrome.storage.local.get('authToken')).authToken
    const claudeApiKey = (await chrome.storage.local.get('claudeApiKey')).claudeApiKey

    // Try managed API first
    if (authToken) {
      try {
        const resp = await fetch('https://48co.nz/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + authToken },
          body: JSON.stringify({
            text,
            sourceLang: 'auto',
            targetLang: state.translateTarget || 'es',
            domain: state.translateDomain || 'general',
            formality: state.translateFormality || 'auto',
          }),
        })
        if (resp.ok) {
          const data = await resp.json()
          return data.translatedText || text
        }
      } catch { /* fall through to direct API */ }
    }

    // Fallback: direct Claude API call
    if (!claudeApiKey) return text

    try {
      const langNames = {
        es: 'Spanish', fr: 'French', de: 'German', it: 'Italian', pt: 'Portuguese',
        'pt-BR': 'Brazilian Portuguese', nl: 'Dutch', ru: 'Russian',
        zh: 'Chinese (Simplified)', 'zh-TW': 'Chinese (Traditional)',
        ja: 'Japanese', ko: 'Korean', ar: 'Arabic', hi: 'Hindi',
        mi: 'Te Reo Māori', sv: 'Swedish', da: 'Danish', no: 'Norwegian',
        fi: 'Finnish', pl: 'Polish', uk: 'Ukrainian', tr: 'Turkish',
        vi: 'Vietnamese', th: 'Thai', id: 'Indonesian', he: 'Hebrew',
        fa: 'Persian', sw: 'Swahili', af: 'Afrikaans',
      }
      const target = langNames[state.translateTarget] || state.translateTarget

      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: `Translate the following text to ${target}. Return ONLY the translated text, nothing else. Preserve formatting, numbers, and proper nouns. Use ${state.translateFormality === 'formal' ? 'formal' : state.translateFormality === 'informal' ? 'informal' : 'appropriate'} register.`,
          messages: [{ role: 'user', content: text }],
        }),
      })

      if (resp.ok) {
        const data = await resp.json()
        return data.content?.[0]?.text?.trim() || text
      }
    } catch {}

    return text
  }

})()
