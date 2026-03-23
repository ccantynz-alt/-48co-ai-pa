/**
 * Base Site Adapter
 * Every AI chat site gets its own adapter that extends this.
 * The adapter knows how to find the input, inject text, and trigger send.
 */
export class BaseSiteAdapter {
  get name() {
    throw new Error('Adapter must implement name')
  }

  // Return the main text input element (contenteditable div or textarea)
  getInputElement() {
    throw new Error('Adapter must implement getInputElement')
  }

  // Return the send/submit button
  getSendButton() {
    throw new Error('Adapter must implement getSendButton')
  }

  // Check if the chat interface is loaded and ready
  isReady() {
    return !!this.getInputElement()
  }

  /**
   * Insert text into the chat input.
   * Uses document.execCommand('insertText') — the ONLY reliable method
   * for ProseMirror/contenteditable editors used by Claude and ChatGPT.
   */
  async insertText(text) {
    const el = this.getInputElement()
    if (!el) return false

    el.focus()

    // For contenteditable divs (ProseMirror)
    if (el.contentEditable === 'true') {
      document.execCommand('insertText', false, text)
      // Also fire input event so React/ProseMirror state updates
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
      return true
    }

    // For regular textareas (fallback)
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      // Use native setter to bypass React's internal value tracking
      const nativeSetter = Object.getOwnPropertyDescriptor(
        el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
        'value'
      ).set
      const current = el.value
      nativeSetter.call(el, current + text)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    }

    return false
  }

  /**
   * Trigger the send button click, with Enter key fallback.
   * Small delay to let the UI framework process the inserted text.
   */
  async triggerSend() {
    await new Promise((r) => setTimeout(r, 80))

    const btn = this.getSendButton()
    if (btn && !btn.disabled) {
      btn.click()
      return true
    }

    // Fallback: simulate Enter keypress
    const el = this.getInputElement()
    if (el) {
      el.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
        })
      )
      return true
    }

    return false
  }

  // Try multiple selectors in order, return first match
  queryFirst(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel)
        if (el) return el
      } catch {
        // Invalid selector, skip
      }
    }
    return null
  }
}
