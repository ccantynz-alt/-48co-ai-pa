import { BaseSiteAdapter } from './base.js'

/**
 * Claude.ai Adapter
 * Claude uses ProseMirror contenteditable divs. Class names are hashed by React
 * and change frequently — we use attribute-based selectors with tiered fallbacks.
 */
export class ClaudeAdapter extends BaseSiteAdapter {
  get name() {
    return 'Claude'
  }

  getInputElement() {
    // Tiered fallback — most stable selectors first
    return this.queryFirst([
      'div.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"][data-testid]',
      'div[contenteditable="true"][class*="ProseMirror"]',
      'fieldset div[contenteditable="true"]',
      'div[contenteditable="true"][data-placeholder]',
      'div[contenteditable="true"]',
    ])
  }

  getSendButton() {
    return this.queryFirst([
      'button[aria-label="Send Message"]',
      'button[aria-label="Send message"]',
      'fieldset button[type="button"]:last-of-type',
      'button[data-testid="send-button"]',
    ])
  }

  // Claude sometimes needs a slightly different approach for long text
  async insertText(text) {
    const el = this.getInputElement()
    if (!el) return false

    el.focus()

    // Clear existing placeholder paragraph if empty
    const placeholder = el.querySelector('p.is-empty, p.is-editor-empty')
    if (placeholder) {
      placeholder.textContent = ''
    }

    document.execCommand('insertText', false, text)
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))

    return true
  }
}
