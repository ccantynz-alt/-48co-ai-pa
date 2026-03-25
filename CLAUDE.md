# CLAUDE.md — 48co Engineering Standards & Rules

## Project Owner Context
- The owner is NOT a developer. Never assume coding knowledge.
- Explain decisions in plain English. No jargon without explanation.
- If something can't be done, say WHY and offer the next-best alternative immediately.
- Never present a half-solution without flagging what's missing.

## Hard Rules — Non-Negotiable

### 1. Engineering Gap Detection (MANDATORY)
Before writing ANY code or proposing ANY solution:
- Research what competitors ship (WhisperTyping, Wispr Flow, SuperWhisper, Voicy)
- Identify what technology they use and why
- Flag EVERY gap between our product and theirs BEFORE building
- If a browser security limitation blocks a feature, say so IMMEDIATELY — don't build a workaround and pretend it's equivalent
- If an approach requires copy-paste, manual steps, or user friction — REJECT IT and find a better way

### 2. Bug Prevention & Auto-Repair
- Test every code path mentally before writing it
- Handle ALL error states (mic permission denied, API failures, network loss, browser incompatibility)
- Never ship code that fails silently — every failure must show a clear message to the user
- If a bug is found during development, fix it BEFORE moving on
- Run through the full user flow start-to-finish before marking anything as done

### 3. Technology Research (MANDATORY)
Before implementing any feature:
- Search for the best current technology/library for the job (2024-2026 state of the art)
- Compare at least 2-3 approaches and pick the best one
- Document WHY a technology was chosen over alternatives
- If a better approach exists than what we're currently using, FLAG IT and recommend migration

### 4. Autonomous Operation
- Don't wait for the user to find problems — find them yourself
- Don't ask permission to fix obvious bugs — just fix them
- Don't present options when one is clearly better — make the call and explain why
- If a task requires 5 steps, do all 5 — don't stop at step 2 and wait for instructions
- If something breaks during implementation, fix it before reporting back

### 5. No Half-Measures
- Every feature must work end-to-end with zero user friction
- "Copy to clipboard" is NOT a solution when auto-typing is possible
- "Drag to bookmarks bar" is NOT zero-friction — find a better way or be honest about the tradeoff
- If the web platform can't do something, the desktop app MUST, and vice versa
- Every user-facing flow must be tested: install → configure → use → edge cases

### 6. Honest Communication
- If something is technically impossible in a browser, say so clearly
- If a feature requires a download, don't dress it up as "web-based"
- Separate WHAT WORKS from WHAT'S ASPIRATIONAL
- Give time/effort estimates for complex features
- Flag risks and blockers at the START, not when they become problems

## Architecture Decisions (Locked In)

### Product Delivery — Two Modes:
1. **Desktop App (PRIMARY)** — Electron app for Windows + Mac
   - System tray with global hotkey (Ctrl+Shift+Space / Cmd+Shift+Space)
   - Uses OS-level keyboard simulation to type into ANY focused text field
   - Works in ANY app: browsers, Slack, Discord, VS Code, anything
   - Uses @nut-tree/nut-js for cross-platform keyboard simulation
   - Whisper API for transcription (high accuracy) + Web Speech API fallback
   - Auto-updates via electron-updater
   - This is how WhisperTyping/Wispr Flow/SuperWhisper do it — proven approach

2. **Web Bookmarklet (SECONDARY)** — Zero-download option
   - User clicks a button on 48co.nz → injects voice widget into current page
   - Uses javascript: URI or hosted script injection
   - Types DIRECTLY into the page's text fields (not clipboard)
   - Limited to browser only, but zero friction for web-only users
   - HONEST TRADEOFF: Only works in browser, only on the current page, must re-inject per page
   - Chrome extension remains as the BEST browser-only experience

3. **Website (48co.nz)** — Marketing + Live Demo + Downloads
   - Landing page with clear value prop
   - Live demo that actually works (uses Web Speech API on the page itself)
   - Download page with platform detection
   - Bookmarklet activation page

### Tech Stack:
- **Website**: Next.js 14, React 18, Tailwind CSS 3.4 (LIGHT THEME — white bg, indigo accent)
- **Desktop App**: Electron 28+, @nut-tree/nut-js, OpenAI Whisper API, Claude API (grammar + rewrite)
- **Browser Extension**: Chrome MV3 with AI grammar checker + voice-to-text
- **Mobile Keyboard**: React Native/Expo companion app + native keyboard extensions (Swift/Kotlin)
- **AI Grammar**: Claude Haiku API (fast grammar) + Claude Sonnet (rewrite/polish)
- **Speech-to-Text**: OpenAI Whisper API (primary), Web Speech API (free fallback)
- **Build/Package**: electron-builder for Win + Mac, EAS Build for iOS + Android

### Product Delivery — Five Platforms:
1. **Desktop App** (PRIMARY) — Electron, system tray, global hotkey, types into any app
2. **Chrome Extension** (VIRAL ENGINE) — Grammar check on any website, free tier drives upgrades
3. **iPhone Keyboard** — Custom keyboard extension, corrects as you type, voice button
4. **Android Keyboard** — Same as iPhone, InputMethodService
5. **Website** (48co.nz) — Marketing, live demo, SEO, downloads

### Quality Checklist (Run Before Every Commit):
- [ ] Does every feature work end-to-end?
- [ ] Are all error states handled with user-friendly messages?
- [ ] Is there any copy-paste or manual friction that could be automated?
- [ ] Would a competitor's user be impressed or disappointed switching to us?
- [ ] Has every engineering gap been flagged and addressed?

## Known Limitations (Be Honest About These):
- **Web bookmarklet** cannot type into other tabs — only the current page
- **Web Speech API** is Chrome/Edge only and less accurate than Whisper
- **Desktop app requires a download** — there is no way around this for system-wide typing
- **Whisper API requires an API key** — costs ~$0.006/minute
- **Electron apps are large** (~150MB) — this is a known Electron tradeoff
- **macOS requires accessibility permissions** for keyboard simulation

## File Structure Convention:
```
/app/              → Next.js website pages
/components/       → React components
/extension/        → Chrome extension (maintained)
/desktop/          → Electron desktop app
/desktop/main/     → Electron main process
/desktop/renderer/ → Electron renderer (UI)
/desktop/assets/   → Icons, images for desktop app
/public/           → Static web assets
```
