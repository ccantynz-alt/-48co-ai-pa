/**
 * Voice Command Engine
 * Detects trigger phrases in transcripts and returns actions.
 * Actions: text to paste, __SUBMIT__ (send), __CANCEL__ (clear).
 */

const COMMANDS = [
  {
    triggers: ['claude refactor this', 'refactor this'],
    action: 'text',
    output: 'Refactor the following code. Identify inefficiencies, simplify logic, and rewrite it cleanly:\n\n',
  },
  {
    triggers: ['claude explain this', 'explain this'],
    action: 'text',
    output: 'Explain what the following code does, step by step:\n\n',
  },
  {
    triggers: ['claude debug this', 'debug this'],
    action: 'text',
    output: 'Debug the following code. Find errors, explain them, and provide a fix:\n\n',
  },
  {
    triggers: ['claude fix this', 'fix this'],
    action: 'text',
    output: 'Fix the following code. Identify the bug and provide the corrected version:\n\n',
  },
  {
    triggers: ['claude test this', 'test this'],
    action: 'text',
    output: 'Write comprehensive tests for the following code:\n\n',
  },
  {
    triggers: ['claude optimize this', 'optimize this'],
    action: 'text',
    output: 'Optimize the following code for performance:\n\n',
  },
  {
    triggers: ['send it', 'send message'],
    action: 'submit',
    output: null,
  },
  {
    triggers: ['cancel', 'cancel that', 'never mind'],
    action: 'cancel',
    output: null,
  },
]

/**
 * Check transcript for voice commands.
 * Returns { action, output } or null if no command found.
 */
export function matchVoiceCommand(transcript) {
  const lower = transcript.toLowerCase().trim()

  for (const cmd of COMMANDS) {
    for (const trigger of cmd.triggers) {
      if (lower.includes(trigger)) {
        return { action: cmd.action, output: cmd.output }
      }
    }
  }

  return null
}
