/**
 * 48co Grammar Checker
 * Watches text fields on any page. When user pauses typing, checks grammar
 * via Claude API and shows inline corrections in a tooltip.
 *
 * Injected by content.js when grammar mode is enabled.
 * Zero visible UI until a correction is found.
 */
;(function () {
  'use strict'

  // ── State ──────────────────────────────────────────────
  let enabled = false
  let claudeApiKey = ''
  let checkTimeout = null
  let lastCheckedText = ''
  let activeTooltip = null
  let correctionsToday = 0
  let maxFreeCorrections = 10 // free tier limit per day

  // ── Init: load settings ────────────────────────────────
  chrome.storage.local.get(['grammarEnabled', 'claudeApiKey', 'correctionsToday', 'correctionDate'], (data) => {
    enabled = data.grammarEnabled || false
    claudeApiKey = data.claudeApiKey || ''
    // Reset daily counter
    const today = new Date().toDateString()
    if (data.correctionDate !== today) {
      correctionsToday = 0
      chrome.storage.local.set({ correctionsToday: 0, correctionDate: today })
    } else {
      correctionsToday = data.correctionsToday || 0
    }
    if (enabled) attachListeners()
  })

  // Listen for settings changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.grammarEnabled) {
      enabled = changes.grammarEnabled.newValue
      if (enabled) attachListeners()
      else detachListeners()
    }
    if (changes.claudeApiKey) {
      claudeApiKey = changes.claudeApiKey.newValue
    }
  })

  // ── Attach to all text fields ──────────────────────────
  let observing = false

  function attachListeners() {
    if (observing) return
    observing = true
    document.addEventListener('input', onInput, true)
    document.addEventListener('focusout', onBlur, true)
  }

  function detachListeners() {
    observing = false
    document.removeEventListener('input', onInput, true)
    document.removeEventListener('focusout', onBlur, true)
    hideTooltip()
  }

  function onInput(e) {
    if (!enabled) return
    const el = e.target
    if (!isTextField(el)) return

    // Debounce: check 1.5s after user stops typing
    clearTimeout(checkTimeout)
    checkTimeout = setTimeout(() => checkGrammar(el), 1500)
  }

  function onBlur() {
    clearTimeout(checkTimeout)
    // Don't hide tooltip immediately — user might be clicking it
    setTimeout(() => {
      if (activeTooltip && !activeTooltip.matches(':hover')) {
        hideTooltip()
      }
    }, 300)
  }

  function isTextField(el) {
    if (!el) return false
    if (el.tagName === 'TEXTAREA') return true
    if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'email' || el.type === 'search' || !el.type)) return true
    if (el.contentEditable === 'true') return true
    return false
  }

  // ── Grammar check via Claude API ───────────────────────
  async function checkGrammar(el) {
    if (!claudeApiKey) return
    if (!enabled) return

    const text = getTextFromField(el)
    if (!text || text.length < 10) return // too short to check
    if (text === lastCheckedText) return // already checked
    if (text.length > 2000) return // too long for free check

    lastCheckedText = text

    try {
      const corrections = await callGrammarAPI(text)
      if (corrections && corrections.length > 0) {
        showCorrections(el, text, corrections)
      } else {
        hideTooltip()
      }
    } catch (err) {
      console.warn('[48co grammar]', err.message)
    }
  }

  function getTextFromField(el) {
    if (el.contentEditable === 'true') return el.innerText || el.textContent || ''
    return el.value || ''
  }

  async function callGrammarAPI(text) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: `You are a grammar checker. Analyze the text for grammar, spelling, and punctuation errors. Return a JSON array of corrections. Each correction has: "original" (the wrong text), "corrected" (the fixed text), "reason" (brief explanation, max 8 words). If the text is correct, return an empty array []. Return ONLY valid JSON, nothing else.`,
          messages: [{ role: 'user', content: text }],
        }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        if (response.status === 401) throw new Error('Invalid API key')
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.content?.[0]?.text?.trim() || '[]'

      // Parse JSON — handle markdown code fences if present
      const jsonStr = content.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim()
      return JSON.parse(jsonStr)
    } catch (err) {
      clearTimeout(timeout)
      if (err.name === 'AbortError') return []
      if (err instanceof SyntaxError) return [] // JSON parse failed
      throw err
    }
  }

  // ── Show corrections UI ────────────────────────────────
  // Minimal tooltip above the text field showing what to fix

  function showCorrections(el, originalText, corrections) {
    hideTooltip()

    if (correctionsToday >= maxFreeCorrections && !claudeApiKey) {
      // Free tier exhausted
      return
    }

    const tooltip = document.createElement('div')
    tooltip.id = 'foureightco-grammar'
    tooltip.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      max-width: 380px;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      background: white;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
      padding: 0;
      overflow: hidden;
    `

    // Header
    const header = document.createElement('div')
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(0,0,0,0.06);background:#f8f9fa;'
    header.innerHTML = `
      <span style="font-weight:600;font-size:12px;color:#4f46e5;">48co Grammar</span>
      <span style="font-size:11px;color:#888;">${corrections.length} correction${corrections.length > 1 ? 's' : ''}</span>
    `
    tooltip.appendChild(header)

    // Corrections list
    const list = document.createElement('div')
    list.style.cssText = 'max-height:200px;overflow-y:auto;'

    corrections.slice(0, 5).forEach((c) => {
      const row = document.createElement('div')
      row.style.cssText = 'padding:10px 14px;border-bottom:1px solid rgba(0,0,0,0.04);cursor:pointer;transition:background 0.15s;'
      row.onmouseenter = () => { row.style.background = '#f0f0ff' }
      row.onmouseleave = () => { row.style.background = 'transparent' }

      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="color:#dc2626;text-decoration:line-through;font-size:12px;">${escapeHtml(c.original)}</span>
          <span style="color:#888;font-size:10px;">→</span>
          <span style="color:#16a34a;font-weight:500;font-size:12px;">${escapeHtml(c.corrected)}</span>
        </div>
        <div style="font-size:11px;color:#888;">${escapeHtml(c.reason)}</div>
      `

      // Click to apply correction
      row.addEventListener('click', () => {
        applyCorrection(el, c.original, c.corrected)
        correctionsToday++
        chrome.storage.local.set({ correctionsToday })
        row.style.background = '#f0fff4'
        row.innerHTML = '<div style="font-size:12px;color:#16a34a;text-align:center;padding:4px 0;">Applied!</div>'
        setTimeout(() => {
          row.remove()
          if (list.children.length === 0) hideTooltip()
        }, 600)
      })

      list.appendChild(row)
    })

    tooltip.appendChild(list)

    // "Fix All" button
    if (corrections.length > 1) {
      const fixAll = document.createElement('div')
      fixAll.style.cssText = 'padding:10px 14px;text-align:center;border-top:1px solid rgba(0,0,0,0.06);cursor:pointer;transition:background 0.15s;'
      fixAll.innerHTML = '<span style="font-size:12px;font-weight:500;color:#4f46e5;">Fix all</span>'
      fixAll.onmouseenter = () => { fixAll.style.background = '#f0f0ff' }
      fixAll.onmouseleave = () => { fixAll.style.background = 'transparent' }
      fixAll.addEventListener('click', () => {
        corrections.forEach((c) => applyCorrection(el, c.original, c.corrected))
        correctionsToday += corrections.length
        chrome.storage.local.set({ correctionsToday })
        hideTooltip()
      })
      tooltip.appendChild(fixAll)
    }

    document.body.appendChild(tooltip)
    activeTooltip = tooltip

    // Position above the text field
    const rect = el.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    let top = rect.top - tooltipRect.height - 8
    let left = rect.left

    // If above viewport, show below
    if (top < 8) top = rect.bottom + 8
    // Keep within viewport
    if (left + tooltipRect.width > window.innerWidth - 8) left = window.innerWidth - tooltipRect.width - 8
    if (left < 8) left = 8

    tooltip.style.top = top + 'px'
    tooltip.style.left = left + 'px'
  }

  function hideTooltip() {
    if (activeTooltip) {
      activeTooltip.remove()
      activeTooltip = null
    }
  }

  function applyCorrection(el, original, corrected) {
    if (el.contentEditable === 'true') {
      const html = el.innerHTML
      // Replace first occurrence
      const idx = el.innerText.indexOf(original)
      if (idx !== -1) {
        // Use execCommand for undo support
        const sel = window.getSelection()
        const range = document.createRange()

        // Find text node containing the original
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
        let node, offset = 0
        while ((node = walker.nextNode())) {
          if (offset + node.length > idx) {
            range.setStart(node, idx - offset)
            range.setEnd(node, Math.min(idx - offset + original.length, node.length))
            sel.removeAllRanges()
            sel.addRange(range)
            document.execCommand('insertText', false, corrected)
            break
          }
          offset += node.length
        }
      }
    } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      const val = el.value
      const idx = val.indexOf(original)
      if (idx !== -1) {
        el.focus()
        el.setSelectionRange(idx, idx + original.length)
        document.execCommand('insertText', false, corrected)
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div')
    div.textContent = str
    return div.innerHTML
  }

  // ── Public API for popup ───────────────────────────────
  window._48coGrammar = {
    get enabled() { return enabled },
    get correctionsToday() { return correctionsToday },
  }

})()
