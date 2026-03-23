# -48co-ai-pa
AI Personal Assistant — Voice-to-context desktop app
# 48co AI Personal Assistant

> Voice-to-context desktop app — 40–50% beyond simple transcription.

## What it does

- 🎙️ **Local speech-to-text** via Faster-Whisper (private, offline, fast)
- 🧠 **Context-aware** — reads your active window to adapt output
- ⌨️ **Injects text** directly into Claude, VS Code, or any chat box
- 🖥️ **Cross-platform** — Windows (.exe) and macOS (.dmg)
- 🎛️ **Mic switching** — toggle between internal and external microphones

## Folder Structure

```
48co-ai-pa/
├── app/                  # Electron + React frontend
│   ├── main.js           # Electron main process
│   ├── preload.js        # Secure IPC bridge
│   └── src/              # React UI components
├── core/                 # Python backend
│   └── transcribe.py     # Faster-Whisper transcription engine
├── assets/               # Icons for Win/Mac builds
├── package.json
├── claude.md             # Project build plan
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- `pip install faster-whisper pyaudio`

### Run in development
```bash
npm install
npm run dev
```

## Hotkey
| Platform | Hotkey |
|---|---|
| Windows / Linux | `Ctrl + Shift + Space` |
| macOS | `Cmd + Shift + Space` |

## Build for distribution
```bash
npm run dist:win   # → dist/*.exe
npm run dist:mac   # → dist/*.dmg
```

## Roadmap
- [ ] Phase 1: Repo & monorepo setup
- [ ] Phase 2: Audio bridge + transcription pipeline
- [ ] Phase 3: Clean Stack UI (waveform HUD, options panel)
- [ ] Phase 4: Windows + Mac packaging & 48co.nz landing page
