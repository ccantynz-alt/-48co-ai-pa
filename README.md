# 48co — Voice-to-Text That Types Into Any App

Speak and it types. Into any app, any website, any text field. Desktop app for Windows & Mac, web bookmarklet for zero-download, Chrome extension for AI chat sites.

**Website:** [48co.nz](https://48co.nz)

## Three Ways to Use 48co

### 1. Desktop App (Best Experience)
System tray app with global hotkey. Press Ctrl+Shift+Space (Cmd+Shift+Space on Mac), speak, and text appears in whatever app you're using — browsers, Slack, VS Code, email, anything.

- **Transcription:** OpenAI Whisper API (high accuracy, 50+ languages) or Web Speech API (free fallback)
- **Typing:** Cross-platform keyboard simulation via [@nut-tree-fork/nut-js](https://github.com/nut-tree/nut.js)
- **Features:** Voice commands, auto code fences, custom vocabulary, auto-updates

### 2. Web Bookmarklet (Zero Download)
Visit [48co.nz/live](https://48co.nz/live) and drag the bookmarklet to your bookmarks bar. Click it on any website to inject the voice widget. Types directly into text fields — no copy-paste.

- **Transcription:** Web Speech API (free, Chrome/Edge only)
- **Features:** Punctuation commands, voice commands, auto code fences, 19 languages

### 3. Chrome Extension
Install from [48co.nz/install](https://48co.nz/install). Always-on voice widget optimized for AI chat sites (Claude, ChatGPT, Gemini, DeepSeek). Works on other sites via generic adapter.

- **Transcription:** Web Speech API (free, Chrome/Edge only)
- **Features:** Voice commands (refactor, explain, debug, fix, test, optimize), auto-submit, punctuation

## Folder Structure

```
48co/
├── app/                  # Next.js website (marketing + live demo)
│   ├── page.jsx          # Landing page with live demo
│   ├── live/page.jsx     # Voice demo + bookmarklet setup
│   ├── download/page.jsx # Desktop app download page
│   ├── install/page.jsx  # Extension install guide
│   ├── layout.jsx        # Root layout
│   └── globals.css       # Tailwind + animations
├── components/           # React components
│   ├── MicToggle.jsx     # Mic button with status
│   └── Waveform.jsx      # Animated waveform bars
├── desktop/              # Electron desktop app
│   ├── main/index.js     # Main process (tray, hotkey, typing)
│   ├── main/preload.js   # Secure IPC bridge
│   ├── renderer/         # Overlay + settings windows
│   ├── assets/           # Icons, entitlements
│   └── package.json      # Electron dependencies
├── extension/            # Chrome Extension (MV3)
│   ├── manifest.json     # Extension manifest
│   ├── content.js        # Content script (voice widget)
│   ├── background.js     # Service worker
│   ├── popup.html        # Extension popup
│   └── adapters/         # Site-specific adapters
├── public/
│   ├── inject.js         # Bookmarklet script
│   └── 48co-extension.zip
├── package.json          # Next.js dependencies
├── next.config.js
├── tailwind.config.js
└── CLAUDE.md             # Engineering standards
```

## Quick Start

### Website (Next.js)
```bash
npm install
npm run dev
```

### Desktop App (Electron)
```bash
cd desktop
npm install
npm start          # Development
npm run build:mac  # Build macOS .dmg
npm run build:win  # Build Windows .exe
```

### Requirements
- **Website:** Node.js 18+
- **Desktop App:** Node.js 18+, OpenAI API key for Whisper (~$0.006/min)
- **Extension:** Chrome or Edge browser
- **Bookmarklet:** Chrome or Edge browser

## Hotkey

| Platform | Hotkey |
|---|---|
| Windows / Linux | `Ctrl + Shift + Space` |
| macOS | `Cmd + Shift + Space` |

## Voice Commands

| Command | Action |
|---|---|
| "period", "comma", "question mark" | Inserts punctuation |
| "new line", "new paragraph" | Inserts line breaks |
| "refactor this" | Pastes refactor prompt |
| "explain this" | Pastes explanation prompt |
| "debug this", "fix this", "test this" | Pastes dev prompts |
| "thumbs up emoji", "fire emoji" | Inserts emoji |

## Tech Stack

- **Website:** Next.js 14, React 18, Tailwind CSS 3.4
- **Desktop:** Electron 28, @nut-tree-fork/nut-js, electron-updater
- **Extension:** Chrome MV3, Web Speech API
- **Transcription:** OpenAI Whisper API (desktop), Web Speech API (web/extension)

## Known Limitations

- Web bookmarklet and extension use Web Speech API (Chrome/Edge only, less accurate than Whisper)
- Desktop app requires an OpenAI API key (~$0.006/minute)
- Electron apps are ~150MB (standard Electron tradeoff)
- macOS requires Accessibility permission for keyboard simulation
- Bookmarklet only works on the current page (re-click per page)
- Extension voice commands optimized for AI chat sites

## License

Open source. Built in New Zealand.
