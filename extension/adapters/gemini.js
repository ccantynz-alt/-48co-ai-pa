import { BaseSiteAdapter } from './base.js'

/**
 * Gemini Adapter (gemini.google.com)
 * Gemini uses a custom rich-textarea or contenteditable div.
 */
export class GeminiAdapter extends BaseSiteAdapter {
  get name() {
    return 'Gemini'
  }

  getInputElement() {
    return this.queryFirst([
      'rich-textarea div[contenteditable="true"]',
      'div.ql-editor[contenteditable="true"]',
      'div[contenteditable="true"][aria-label*="prompt"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
    ])
  }

  getSendButton() {
    return this.queryFirst([
      'button[aria-label="Send message"]',
      'button.send-button',
      'button[data-test-id="send-button"]',
      'mat-icon-button[aria-label="Send message"]',
    ])
  }
}
