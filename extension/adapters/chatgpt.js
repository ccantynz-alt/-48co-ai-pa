import { BaseSiteAdapter } from './base.js'

/**
 * ChatGPT Adapter (chat.openai.com / chatgpt.com)
 * ChatGPT uses a ProseMirror contenteditable div with id #prompt-textarea.
 */
export class ChatGPTAdapter extends BaseSiteAdapter {
  get name() {
    return 'ChatGPT'
  }

  getInputElement() {
    return this.queryFirst([
      '#prompt-textarea',
      'div[id="prompt-textarea"]',
      'div.ProseMirror[contenteditable="true"]',
      'textarea[data-id="root"]',
      'textarea',
    ])
  }

  getSendButton() {
    return this.queryFirst([
      'button[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send"]',
      'form button[type="submit"]',
    ])
  }
}
