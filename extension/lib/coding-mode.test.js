import { describe, it, expect } from 'vitest'
import { isCodingContent, wrapInCodeFence } from './coding-mode.js'

describe('isCodingContent', () => {
  // ── Positive matches ─────────────────────────────────
  it('detects "function" keyword', () => {
    expect(isCodingContent('create a function that adds two numbers')).toBe(true)
  })

  it('detects "class" keyword', () => {
    expect(isCodingContent('define a class called UserService')).toBe(true)
  })

  it('detects "import" keyword', () => {
    expect(isCodingContent('import React from react')).toBe(true)
  })

  it('detects "async await" keywords', () => {
    expect(isCodingContent('make it async with await')).toBe(true)
  })

  it('detects "useState" (React hook)', () => {
    expect(isCodingContent('use useState for the counter')).toBe(true)
  })

  it('detects "try catch"', () => {
    expect(isCodingContent('wrap it in a try catch block')).toBe(true)
  })

  it('detects "for loop"', () => {
    expect(isCodingContent('use a for loop to iterate')).toBe(true)
  })

  it('detects "struct"', () => {
    expect(isCodingContent('define a struct for the user')).toBe(true)
  })

  it('detects "enum"', () => {
    expect(isCodingContent('create an enum for status values')).toBe(true)
  })

  // ── Case insensitivity ───────────────────────────────
  it('is case-insensitive', () => {
    expect(isCodingContent('Create A FUNCTION')).toBe(true)
  })

  // ── Negative matches ─────────────────────────────────
  it('returns false for plain English text', () => {
    expect(isCodingContent('please send the email to John about the meeting tomorrow')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isCodingContent('')).toBe(false)
  })
})

describe('wrapInCodeFence', () => {
  // ── Language detection ───────────────────────────────
  it('detects Python', () => {
    const result = wrapInCodeFence('python def hello self')
    expect(result).toContain('```python')
    expect(result).toMatch(/```$/)
  })

  it('detects Rust', () => {
    const result = wrapInCodeFence('rust fn main impl struct')
    expect(result).toContain('```rust')
  })

  it('detects Go', () => {
    const result = wrapInCodeFence('golang goroutine channel')
    expect(result).toContain('```go')
  })

  it('detects Java (not JavaScript)', () => {
    const result = wrapInCodeFence('java public static void')
    expect(result).toContain('```java')
  })

  it('detects TypeScript', () => {
    const result = wrapInCodeFence('typescript interface Props')
    expect(result).toContain('```typescript')
  })

  it('detects CSS', () => {
    const result = wrapInCodeFence('css flexbox grid style')
    expect(result).toContain('```css')
  })

  it('detects HTML', () => {
    const result = wrapInCodeFence('html div span section')
    expect(result).toContain('```html')
  })

  it('detects SQL', () => {
    const result = wrapInCodeFence('sql select from where query')
    expect(result).toContain('```sql')
  })

  it('detects Bash', () => {
    const result = wrapInCodeFence('bash terminal command')
    expect(result).toContain('```bash')
  })

  it('defaults to JavaScript', () => {
    const result = wrapInCodeFence('create a component with useState')
    expect(result).toContain('```javascript')
  })

  // ── Fence structure ──────────────────────────────────
  it('wraps content in triple backtick fences', () => {
    const result = wrapInCodeFence('some code')
    expect(result).toMatch(/^```\w+\n/)
    expect(result).toMatch(/\n```$/)
  })

  it('preserves original text inside fence', () => {
    const text = 'function hello() { return 42 }'
    const result = wrapInCodeFence(text)
    expect(result).toContain(text)
  })
})
