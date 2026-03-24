/**
 * 48co Desktop App — Main Process
 *
 * System tray app with global hotkey that captures speech and types
 * the transcribed text into whatever application/field is currently focused.
 *
 * Architecture:
 * - Main process: tray icon, global shortcuts, keyboard simulation
 * - Renderer: floating overlay window for recording feedback
 * - Transcription: OpenAI Whisper API (primary) + Web Speech API (fallback)
 * - Typing: @nut-tree-fork/nut-js for cross-platform keyboard simulation
 */

const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  ipcMain,
  nativeImage,
  screen,
  shell,
  dialog,
  systemPreferences,
} = require('electron')
const path = require('path')
const Store = require('electron-store')
const { autoUpdater } = require('electron-updater')

// ─── Config Store ──────────────────────────────────────────────
const store = new Store({
  defaults: {
    whisperApiKey: '',
    engine: 'whisper',        // 'whisper' (Whisper API) or 'web-speech'
    language: 'en',
    pushToTalk: false,
    autoCoding: true,
    codingMode: false,
    autoSubmit: false,
    vocabulary: [],           // [{from, to}]
    replacements: [],         // [{from, to}]
    launchAtLogin: true,
    showOverlay: true,
    typingSpeed: 0,           // 0 = instant (paste), >0 = ms between chars
  },
})

// ─── Globals ───────────────────────────────────────────────────
let tray = null
let overlayWindow = null
let settingsWindow = null
let isRecording = false
let pttActive = false

// ─── Overlay Window (floating recording indicator) ─────────────
function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  overlayWindow = new BrowserWindow({
    width: 320,
    height: 120,
    x: width - 340,
    y: height - 140,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,       // Critical: don't steal focus from the user's app
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  overlayWindow.loadFile(path.join(__dirname, '..', 'renderer', 'overlay.html'))
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  // macOS: allow overlay to appear above fullscreen apps
  if (process.platform === 'darwin') {
    overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1)
  }
}

// ─── Settings Window ───────────────────────────────────────────
function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 480,
    height: 700,
    frame: true,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  settingsWindow.loadFile(path.join(__dirname, '..', 'renderer', 'settings.html'))
  settingsWindow.once('ready-to-show', () => settingsWindow.show())
  settingsWindow.on('closed', () => { settingsWindow = null })
}

// ─── System Tray ───────────────────────────────────────────────
function createTray() {
  // Create a simple tray icon (16x16 template image)
  const iconPath = path.join(__dirname, '..', 'assets', 'tray-icon.png')
  let trayIcon
  try {
    trayIcon = nativeImage.createFromPath(iconPath)
    if (process.platform === 'darwin') {
      trayIcon = trayIcon.resize({ width: 16, height: 16 })
      trayIcon.setTemplateImage(true)
    }
  } catch {
    // Fallback: create a simple colored square icon
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)
  tray.setToolTip('48co — Voice to Text')

  updateTrayMenu()

  tray.on('click', () => {
    toggleRecording()
  })
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: isRecording ? '■ Stop Recording' : '● Start Recording',
      click: () => toggleRecording(),
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => createSettingsWindow(),
    },
    {
      label: `Language: ${store.get('language', 'en').toUpperCase()}`,
      enabled: false,
    },
    {
      label: `Engine: ${store.get('engine', 'whisper') === 'whisper' ? 'Whisper API' : 'Web Speech'}`,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Launch at Login',
      type: 'checkbox',
      checked: store.get('launchAtLogin'),
      click: (item) => {
        store.set('launchAtLogin', item.checked)
        app.setLoginItemSettings({ openAtLogin: item.checked })
      },
    },
    {
      label: 'Check for Updates',
      click: () => autoUpdater.checkForUpdatesAndNotify(),
    },
    { type: 'separator' },
    {
      label: 'Quit 48co',
      click: () => app.quit(),
    },
  ])

  tray.setContextMenu(contextMenu)
}

// ─── Recording Control ─────────────────────────────────────────
async function toggleRecording() {
  if (isRecording) {
    await stopRecording()
  } else {
    await startRecording()
  }
}

async function startRecording() {
  if (isRecording) return
  isRecording = true

  updateTrayMenu()

  // Show overlay
  if (store.get('showOverlay') && overlayWindow) {
    overlayWindow.webContents.send('recording-state', { status: 'recording' })
    overlayWindow.showInactive() // showInactive = don't steal focus
  }

  // Tell renderer to start capturing audio
  if (overlayWindow) {
    overlayWindow.webContents.send('start-recording', {
      engine: store.get('engine'),
      language: store.get('language'),
      whisperApiKey: store.get('whisperApiKey'),
    })
  }
}

async function stopRecording() {
  if (!isRecording) return
  isRecording = false

  updateTrayMenu()

  // Tell renderer to stop and transcribe
  if (overlayWindow) {
    overlayWindow.webContents.send('stop-recording')
    overlayWindow.webContents.send('recording-state', { status: 'processing' })
  }
}

// ─── Keyboard Simulation (type into focused app) ──────────────
async function typeText(text) {
  try {
    const { keyboard } = require('@nut-tree-fork/nut-js')

    const speed = store.get('typingSpeed', 0)

    if (speed === 0) {
      // Instant mode: use clipboard paste (fastest, most reliable)
      const { clipboard } = require('electron')
      const originalClipboard = clipboard.readText()

      clipboard.writeText(text)

      // Small delay to ensure clipboard is ready
      await new Promise(r => setTimeout(r, 50))

      // Simulate Ctrl+V / Cmd+V
      if (process.platform === 'darwin') {
        await keyboard.pressKey(require('@nut-tree-fork/nut-js').Key.LeftSuper)
        await keyboard.pressKey(require('@nut-tree-fork/nut-js').Key.V)
        await keyboard.releaseKey(require('@nut-tree-fork/nut-js').Key.V)
        await keyboard.releaseKey(require('@nut-tree-fork/nut-js').Key.LeftSuper)
      } else {
        await keyboard.pressKey(require('@nut-tree-fork/nut-js').Key.LeftControl)
        await keyboard.pressKey(require('@nut-tree-fork/nut-js').Key.V)
        await keyboard.releaseKey(require('@nut-tree-fork/nut-js').Key.V)
        await keyboard.releaseKey(require('@nut-tree-fork/nut-js').Key.LeftControl)
      }

      // Restore original clipboard after a brief delay
      setTimeout(() => {
        clipboard.writeText(originalClipboard)
      }, 500)
    } else {
      // Character-by-character typing mode
      await keyboard.type(text)
    }

    return true
  } catch (err) {
    console.error('Keyboard simulation failed:', err)

    // Fallback: try clipboard paste via Electron
    try {
      const { clipboard } = require('electron')
      clipboard.writeText(text)
      dialog.showMessageBox({
        type: 'info',
        title: '48co',
        message: 'Text copied to clipboard',
        detail: 'Keyboard simulation failed. Text has been copied to your clipboard — press Ctrl+V / Cmd+V to paste.',
      })
    } catch (clipErr) {
      console.error('Clipboard fallback also failed:', clipErr)
    }

    return false
  }
}

// ─── Text Processing (same pipeline as extension) ──────────────
function postProcess(text, settings) {
  let result = text

  // Punctuation substitutions
  const PUNCTUATION_MAP = [
    [/\b(full stop|period)\b/gi, '.'],
    [/\bcomma\b/gi, ','],
    [/\b(question mark)\b/gi, '?'],
    [/\b(exclamation mark|exclamation point)\b/gi, '!'],
    [/\bsemicolon\b/gi, ';'],
    [/\bcolon\b/gi, ':'],
    [/\bellipsis\b/gi, '...'],
    [/\bdash\b/gi, ' — '],
    [/\bhyphen\b/gi, '-'],
    [/\b(new line|newline)\b/gi, '\n'],
    [/\b(new paragraph)\b/gi, '\n\n'],
    [/\btab\b/gi, '\t'],
    [/\b(open parenthesis|open paren|left paren)\b/gi, '('],
    [/\b(close parenthesis|close paren|right paren)\b/gi, ')'],
    [/\b(open bracket|left bracket)\b/gi, '['],
    [/\b(close bracket|right bracket)\b/gi, ']'],
    [/\b(open brace|left brace|open curly)\b/gi, '{'],
    [/\b(close brace|right brace|close curly)\b/gi, '}'],
    [/\b(open quote|begin quote)\b/gi, '"'],
    [/\b(close quote|end quote|unquote)\b/gi, '"'],
    [/\bsingle quote\b/gi, "'"],
    [/\b(at sign|at symbol)\b/gi, '@'],
    [/\b(hash sign|hashtag|pound sign)\b/gi, '#'],
    [/\b(dollar sign)\b/gi, '$'],
    [/\b(percent sign|percentage)\b/gi, '%'],
    [/\b(ampersand)\b/gi, '&'],
    [/\b(asterisk|star)\b/gi, '*'],
    [/\bforward slash\b/gi, '/'],
    [/\bbackslash\b/gi, '\\'],
    [/\b(pipe|vertical bar)\b/gi, '|'],
    [/\b(underscore)\b/gi, '_'],
    [/\b(equals sign)\b/gi, '='],
    [/\b(plus sign)\b/gi, '+'],
    [/\b(less than|left angle)\b/gi, '<'],
    [/\b(greater than|right angle)\b/gi, '>'],
    [/\btilde\b/gi, '~'],
    [/\b(thumbs up emoji|thumbsup emoji)\b/gi, '👍'],
    [/\b(thumbs down emoji)\b/gi, '👎'],
    [/\b(smiley face|smiley emoji|smile emoji)\b/gi, '😊'],
    [/\b(heart emoji)\b/gi, '❤️'],
    [/\b(fire emoji)\b/gi, '🔥'],
    [/\b(check mark emoji|checkmark emoji)\b/gi, '✅'],
    [/\b(cross mark emoji|x emoji)\b/gi, '❌'],
    [/\b(warning emoji)\b/gi, '⚠️'],
    [/\b(rocket emoji)\b/gi, '🚀'],
    [/\b(thinking emoji)\b/gi, '🤔'],
    [/\b(clap emoji)\b/gi, '👏'],
    [/\b(laughing emoji|lol emoji)\b/gi, '😂'],
    [/\b(crying emoji|sad emoji)\b/gi, '😢'],
    [/\b(wave emoji)\b/gi, '👋'],
    [/\b(party emoji)\b/gi, '🎉'],
    [/\b(eyes emoji)\b/gi, '👀'],
    [/\b(100 emoji)\b/gi, '💯'],
    [/\b(bug emoji)\b/gi, '🐛'],
  ]

  for (const [pattern, replacement] of PUNCTUATION_MAP) {
    result = result.replace(pattern, replacement)
  }

  // Custom vocabulary
  if (settings.vocabulary && settings.vocabulary.length > 0) {
    for (const { from, to } of settings.vocabulary) {
      if (from && to) {
        const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        result = result.replace(new RegExp('\\b' + escaped + '\\b', 'gi'), to)
      }
    }
  }

  // Custom text replacements
  if (settings.replacements && settings.replacements.length > 0) {
    for (const { from, to } of settings.replacements) {
      if (from && to) {
        result = result.replaceAll(from, to)
      }
    }
  }

  // Clean up punctuation spacing
  result = result.replace(/\s+([.,;:!?)\]}])/g, '$1')
  result = result.replace(/([.,;:!?])([A-Za-z])/g, '$1 $2')

  // Auto-capitalize
  result = result.replace(/^(\s*)([a-z])/, (_, ws, ch) => ws + ch.toUpperCase())
  result = result.replace(/([.!?]\s+)([a-z])/g, (_, punct, ch) => punct + ch.toUpperCase())
  result = result.replace(/(\n\s*)([a-z])/g, (_, nl, ch) => nl + ch.toUpperCase())

  // Clean up whitespace
  result = result.replace(/ {2,}/g, ' ')

  return result.trim()
}

// Voice commands
const VOICE_COMMANDS = [
  { triggers: ['refactor this'], output: 'Refactor the following code. Identify inefficiencies, simplify logic, and rewrite it cleanly:\n\n' },
  { triggers: ['explain this'], output: 'Explain what the following code does, step by step:\n\n' },
  { triggers: ['debug this'], output: 'Debug the following code. Find errors, explain them, and provide a fix:\n\n' },
  { triggers: ['fix this'], output: 'Fix the following code. Identify the bug and provide the corrected version:\n\n' },
  { triggers: ['test this'], output: 'Write comprehensive tests for the following code:\n\n' },
  { triggers: ['optimize this'], output: 'Optimize the following code for performance:\n\n' },
]

function matchCommand(text) {
  const lower = text.toLowerCase().trim()
  for (const cmd of VOICE_COMMANDS) {
    for (const trigger of cmd.triggers) {
      if (lower.includes(trigger)) return cmd
    }
  }
  return null
}

// Auto coding mode
const CODING_KEYWORDS = [
  'function', 'class', 'import', 'export', 'const', 'let', 'var',
  'loop', 'array', 'object', 'return', 'async', 'await', 'def',
  'interface', 'struct', 'enum', 'module', 'require', 'extends',
  'constructor', 'prototype', 'promise', 'component', 'useState',
  'useEffect', 'middleware', 'endpoint', 'callback',
]

function isCodingContent(text) {
  const lower = text.toLowerCase()
  return CODING_KEYWORDS.some(kw => lower.includes(kw))
}

function detectLang(text) {
  const l = text.toLowerCase()
  if (l.includes('python') || l.includes('def ')) return 'python'
  if (l.includes('rust') || l.includes('fn ')) return 'rust'
  if (l.includes('go ') || l.includes('goroutine')) return 'go'
  if (l.includes('typescript')) return 'typescript'
  if (l.includes('bash') || l.includes('terminal')) return 'bash'
  if (l.includes('sql') || l.includes('query')) return 'sql'
  if (l.includes('html') || l.includes('div ')) return 'html'
  if (l.includes('css') || l.includes('flexbox')) return 'css'
  return 'javascript'
}

function wrapCode(text) {
  return '```' + detectLang(text) + '\n' + text + '\n```'
}

// ─── IPC Handlers ──────────────────────────────────────────────
ipcMain.handle('get-settings', () => {
  return store.store
})

ipcMain.handle('set-setting', (_, key, value) => {
  store.set(key, value)
  return true
})

ipcMain.handle('get-setting', (_, key) => {
  return store.get(key)
})

// Transcription complete — process and type
ipcMain.on('transcription-ready', async (_, text) => {
  if (!text || !text.trim()) {
    isRecording = false
    updateTrayMenu()
    if (overlayWindow) {
      overlayWindow.webContents.send('recording-state', { status: 'idle' })
      overlayWindow.hide()
    }
    return
  }

  const settings = store.store

  // Check voice commands
  const cmd = matchCommand(text)
  let output

  if (cmd) {
    output = cmd.output
  } else {
    output = postProcess(text, settings)
  }

  // Auto coding mode
  if (settings.codingMode || (settings.autoCoding && isCodingContent(output))) {
    output = wrapCode(output)
  }

  // Show typing state
  if (overlayWindow) {
    overlayWindow.webContents.send('recording-state', { status: 'typing', text: output })
  }

  // Type into the focused application
  const success = await typeText(output)

  // Show done state
  if (overlayWindow) {
    overlayWindow.webContents.send('recording-state', {
      status: 'done',
      success,
      text: output.substring(0, 80) + (output.length > 80 ? '...' : ''),
    })

    // Hide overlay after 1.5s
    setTimeout(() => {
      if (overlayWindow && !isRecording) {
        overlayWindow.webContents.send('recording-state', { status: 'idle' })
        overlayWindow.hide()
      }
    }, 1500)
  }

  isRecording = false
  updateTrayMenu()
})

// Transcription error
ipcMain.on('transcription-error', (_, error) => {
  console.error('Transcription error:', error)
  isRecording = false
  updateTrayMenu()

  if (overlayWindow) {
    overlayWindow.webContents.send('recording-state', {
      status: 'error',
      message: error,
    })
    setTimeout(() => {
      if (overlayWindow) {
        overlayWindow.webContents.send('recording-state', { status: 'idle' })
        overlayWindow.hide()
      }
    }, 3000)
  }
})

// ─── macOS Accessibility Permission Check ──────────────────────
async function checkAccessibilityPermission() {
  if (process.platform !== 'darwin') return true

  const trusted = systemPreferences.isTrustedAccessibilityClient(false)
  if (!trusted) {
    const { response } = await dialog.showMessageBox({
      type: 'warning',
      title: '48co — Accessibility Permission Required',
      message: '48co needs accessibility permission to type text into other applications.',
      detail: 'Click "Open System Preferences" to grant permission, then restart 48co.',
      buttons: ['Open System Preferences', 'Later'],
      defaultId: 0,
    })

    if (response === 0) {
      systemPreferences.isTrustedAccessibilityClient(true) // triggers the permission prompt
      shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility')
    }
    return false
  }
  return true
}

// ─── App Lifecycle ─────────────────────────────────────────────
app.whenReady().then(async () => {
  // Check macOS accessibility permission
  await checkAccessibilityPermission()

  // Create tray and overlay
  createTray()
  createOverlayWindow()

  // Register global shortcut: Ctrl+Shift+Space (Cmd+Shift+Space on Mac)
  const shortcut = process.platform === 'darwin' ? 'CommandOrControl+Shift+Space' : 'Ctrl+Shift+Space'

  const registered = globalShortcut.register(shortcut, () => {
    toggleRecording()
  })

  if (!registered) {
    console.error('Failed to register global shortcut:', shortcut)
  }

  // Push-to-talk: Ctrl+Shift hold
  // Note: True push-to-talk with key hold detection requires platform-specific
  // native modules. For now, we use the toggle shortcut. Push-to-talk can be
  // added later with iohook or similar native key listener.

  // Auto-update check
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  // Set login item
  app.setLoginItemSettings({
    openAtLogin: store.get('launchAtLogin', true),
  })

  // Microphone permission check (macOS)
  if (process.platform === 'darwin') {
    const micStatus = systemPreferences.getMediaAccessStatus('microphone')
    if (micStatus !== 'granted') {
      await systemPreferences.askForMediaAccess('microphone')
    }
  }
})

// Don't quit when all windows are closed (we're a tray app)
app.on('window-all-closed', (e) => {
  e.preventDefault()
})

// Clean up on quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // If user tries to open another instance, show settings
    createSettingsWindow()
  })
}
