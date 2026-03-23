/**
 * Adapter Registry
 * Auto-selects the correct adapter based on the current hostname.
 */
import { ClaudeAdapter } from './claude.js'
import { ChatGPTAdapter } from './chatgpt.js'
import { GeminiAdapter } from './gemini.js'
import { DeepSeekAdapter } from './deepseek.js'

const ADAPTERS = [
  { match: (h) => h.includes('claude.ai'), adapter: ClaudeAdapter },
  { match: (h) => h.includes('chatgpt.com') || h.includes('chat.openai.com'), adapter: ChatGPTAdapter },
  { match: (h) => h.includes('gemini.google.com'), adapter: GeminiAdapter },
  { match: (h) => h.includes('chat.deepseek.com'), adapter: DeepSeekAdapter },
]

export function getAdapter() {
  const host = window.location.hostname
  for (const { match, adapter } of ADAPTERS) {
    if (match(host)) return new adapter()
  }
  return null
}
