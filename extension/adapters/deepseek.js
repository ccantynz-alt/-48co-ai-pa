import { BaseSiteAdapter } from './base.js'

/**
 * DeepSeek Adapter (chat.deepseek.com)
 * DeepSeek uses a textarea element for input.
 */
export class DeepSeekAdapter extends BaseSiteAdapter {
  get name() {
    return 'DeepSeek'
  }

  getInputElement() {
    return this.queryFirst([
      'textarea#chat-input',
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="Message"]',
      'div[contenteditable="true"]',
      'textarea',
    ])
  }

  getSendButton() {
    return this.queryFirst([
      'button[aria-label="Send"]',
      'div[role="button"][aria-label="Send"]',
      'button.send-btn',
      'button[class*="send"]',
    ])
  }
}
