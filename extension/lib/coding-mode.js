/**
 * Auto Coding Mode Detector
 * Detects programming keywords in transcripts and wraps them in code fences.
 */

const CODING_KEYWORDS = [
  'function', 'class', 'import', 'export', 'const', 'let', 'var',
  'loop', 'for loop', 'while loop', 'array', 'object', 'return',
  'async', 'await', 'def', 'if else', 'switch case', 'try catch',
  'interface', 'struct', 'enum', 'module', 'require', 'extends',
  'implements', 'constructor', 'prototype', 'arrow function',
  'callback', 'promise', 'observable', 'middleware', 'endpoint',
  'useState', 'useEffect', 'component', 'render',
]

/**
 * Check if transcript contains programming-related content.
 */
export function isCodingContent(text) {
  const lower = text.toLowerCase()
  let matchCount = 0
  for (const keyword of CODING_KEYWORDS) {
    if (lower.includes(keyword)) matchCount++
  }
  // Require at least 1 keyword match
  return matchCount >= 1
}

/**
 * Detect likely language from transcript content.
 */
function detectLanguage(text) {
  const lower = text.toLowerCase()
  if (lower.includes('python') || lower.includes('def ') || lower.includes('self.')) return 'python'
  if (lower.includes('rust') || lower.includes('fn ') || lower.includes('impl ')) return 'rust'
  if (lower.includes('golang') || lower.includes('go ') || lower.includes('goroutine')) return 'go'
  if (lower.includes('java') && !lower.includes('javascript')) return 'java'
  if (lower.includes('typescript') || lower.includes('interface ')) return 'typescript'
  if (lower.includes('css') || lower.includes('style') || lower.includes('flexbox')) return 'css'
  if (lower.includes('html') || lower.includes('div') || lower.includes('span')) return 'html'
  if (lower.includes('sql') || lower.includes('select') || lower.includes('query')) return 'sql'
  if (lower.includes('bash') || lower.includes('terminal') || lower.includes('command')) return 'bash'
  return 'javascript'
}

/**
 * Wrap text in markdown code fences with detected language.
 */
export function wrapInCodeFence(text) {
  const lang = detectLanguage(text)
  return `\`\`\`${lang}\n${text}\n\`\`\``
}
