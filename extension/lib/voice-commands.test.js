import { describe, it, expect } from 'vitest'
import { matchVoiceCommand } from './voice-commands.js'

describe('matchVoiceCommand', () => {
  // ── Text action commands ─────────────────────────────
  it('matches "refactor this"', () => {
    const result = matchVoiceCommand('refactor this')
    expect(result).not.toBeNull()
    expect(result.action).toBe('text')
    expect(result.output).toContain('Refactor')
  })

  it('matches "claude refactor this" (with prefix)', () => {
    const result = matchVoiceCommand('claude refactor this')
    expect(result).not.toBeNull()
    expect(result.action).toBe('text')
  })

  it('matches "explain this"', () => {
    const result = matchVoiceCommand('explain this')
    expect(result).not.toBeNull()
    expect(result.action).toBe('text')
    expect(result.output).toContain('Explain')
  })

  it('matches "debug this"', () => {
    const result = matchVoiceCommand('debug this')
    expect(result).not.toBeNull()
    expect(result.action).toBe('text')
    expect(result.output).toContain('Debug')
  })

  it('matches "fix this"', () => {
    const result = matchVoiceCommand('fix this')
    expect(result).not.toBeNull()
    expect(result.action).toBe('text')
    expect(result.output).toContain('Fix')
  })

  it('matches "test this"', () => {
    const result = matchVoiceCommand('test this')
    expect(result).not.toBeNull()
    expect(result.action).toBe('text')
    expect(result.output).toContain('tests')
  })

  it('matches "optimize this"', () => {
    const result = matchVoiceCommand('optimize this')
    expect(result).not.toBeNull()
    expect(result.action).toBe('text')
    expect(result.output).toContain('Optimize')
  })

  // ── Submit command ───────────────────────────────────
  it('matches "send it"', () => {
    const result = matchVoiceCommand('send it')
    expect(result).not.toBeNull()
    expect(result.action).toBe('submit')
    expect(result.output).toBeNull()
  })

  it('matches "send message"', () => {
    const result = matchVoiceCommand('send message')
    expect(result).not.toBeNull()
    expect(result.action).toBe('submit')
  })

  // ── Cancel command ───────────────────────────────────
  it('matches "cancel"', () => {
    const result = matchVoiceCommand('cancel')
    expect(result).not.toBeNull()
    expect(result.action).toBe('cancel')
  })

  it('matches "cancel that"', () => {
    const result = matchVoiceCommand('cancel that')
    expect(result).not.toBeNull()
    expect(result.action).toBe('cancel')
  })

  it('matches "never mind"', () => {
    const result = matchVoiceCommand('never mind')
    expect(result).not.toBeNull()
    expect(result.action).toBe('cancel')
  })

  // ── Case insensitivity ───────────────────────────────
  it('is case-insensitive', () => {
    const result = matchVoiceCommand('REFACTOR THIS')
    expect(result).not.toBeNull()
    expect(result.action).toBe('text')
  })

  it('handles mixed case', () => {
    const result = matchVoiceCommand('Claude Fix This')
    expect(result).not.toBeNull()
  })

  // ── Commands embedded in longer speech ───────────────
  it('matches command within longer transcript', () => {
    const result = matchVoiceCommand('hey can you refactor this code please')
    expect(result).not.toBeNull()
    expect(result.action).toBe('text')
  })

  // ── No match ─────────────────────────────────────────
  it('returns null for unrecognized speech', () => {
    const result = matchVoiceCommand('the weather is nice today')
    expect(result).toBeNull()
  })

  it('returns null for empty string', () => {
    const result = matchVoiceCommand('')
    expect(result).toBeNull()
  })

  it('returns null for whitespace', () => {
    const result = matchVoiceCommand('   ')
    expect(result).toBeNull()
  })
})
