# CLAUDE.md — 48co Engineering Standards & Rules

## Project Owner Context
- The owner is NOT a developer. Never assume coding knowledge.
- Explain decisions in plain English. No jargon without explanation.
- If something can't be done, say WHY and offer the next-best alternative immediately.
- Never present a half-solution without flagging what's missing.

---

## THE 10 MANDATORY RULES — Non-Negotiable

These rules override everything. Every session. Every task. No exceptions.

### Rule 1: Scan Before You Build
Every session starts by checking for security issues, broken code, and problems BEFORE doing anything new.
- Run through the user flow: install → configure → use → edge cases
- Check if existing features actually work (don't assume they do)
- If something is broken, fix it FIRST before building new things
- Test on the actual platforms users will use (Claude.ai, ChatGPT, Gmail, etc.)

### Rule 2: Auto-Repair
If a bug is found while working on ANYTHING, fix it immediately.
- No "that's out of scope" excuses
- No "I'll fix that later" — fix it NOW
- No asking permission to fix obvious bugs — just fix them
- If a bug was reported before and not fixed, that's a failure — escalate priority

### Rule 3: Proactive Research
Before building anything significant, check if there's a better way.
- Search for the best current technology/library for the job (2025-2026 state of the art)
- Compare at least 2-3 approaches and pick the best one
- Research what competitors ship (WhisperTyping, Wispr Flow, SuperWhisper, Grammarly)
- If a better approach exists than what we're using, FLAG IT and recommend migration
- Document WHY a technology was chosen

### Rule 4: Engineering Gap Detection
Systematically check for features that promise something the code can't deliver.
- Flag EVERY gap between our product and competitors BEFORE building
- If a browser limitation blocks a feature, say so IMMEDIATELY
- Check every feature actually works on the target platform (Claude.ai, ChatGPT, Gmail)
- If an approach requires copy-paste or manual steps — REJECT IT
- Missing error handling = gap. Silent failures = gap. Find them all.

### Rule 5: Technology Currency
Check if our tools are up to date. If there's newer, faster, safer — upgrade.
- Review npm dependencies for security vulnerabilities
- Check if browser APIs have changed (SpeechRecognition, Clipboard, etc.)
- If a library we're using has a better alternative, migrate
- Stay on latest stable versions of Electron, React, Tailwind

### Rule 6: Explain Like You're Not A Developer
All communication in plain English.
- "Your users were seeing X, now they see Y" — not tech jargon
- Explain what changed, why, and what the user will experience
- If something is technically complex, explain with an analogy
- Never say "refactored the state machine" — say "fixed the recording getting stuck"

### Rule 7: Never Leave It Worse
Every file touched gets cleaned up. No leaving messes behind.
- If you open a file to fix one thing and see other issues, fix them too
- No commented-out code left behind
- No TODO comments without a plan to address them
- Code should be cleaner after every session, not messier

### Rule 8: Autonomous Testing
After changes, verify everything still works. No "it should be fine."
- Mentally trace every code path
- Check that error states are handled
- Verify the feature works on the specific sites users care about (Claude.ai, ChatGPT, Gmail)
- If a change could break something else, check that too

### Rule 9: Mandatory Documentation
Every change gets documented so the next session knows what happened.
- Commit messages explain WHAT and WHY
- STRATEGY.md stays updated with current state
- Known issues are documented, not hidden
- Architecture decisions are recorded with reasoning

### Rule 10: Mandatory Session Protocol
Every session must follow this protocol:
1. **SCAN** — Check for broken features, bugs, security issues
2. **DETECT** — Find engineering gaps vs competitors
3. **FIX** — Repair everything found before building new
4. **RESEARCH** — Check for better tech before implementing
5. **BUILD** — Only then, build new features
6. **TEST** — Verify everything works end-to-end
7. **DOCUMENT** — Record what changed and why

---

## Hard Rules — Additional

### No Half-Measures
- Every feature must work end-to-end with zero user friction
- "Copy to clipboard" is NOT a solution when auto-typing is possible
- If the web platform can't do something, say so HONESTLY
- Every user-facing flow must be tested: install → configure → use → edge cases

### Honest Communication
- If something is technically impossible in a browser, say so clearly
- If a feature requires a download, don't dress it up as "web-based"
- Separate WHAT WORKS from WHAT'S ASPIRATIONAL
- Flag risks and blockers at the START, not when they become problems

### Autonomous Operation
- Don't wait for the user to find problems — find them yourself
- Don't present options when one is clearly better — make the call and explain
- If a task requires 5 steps, do all 5 — don't stop at step 2
- If something breaks during implementation, fix it before reporting back

---

## Architecture Decisions (Locked In)

### Product = AI Grammar + Voice-to-Text Everywhere

### Product Delivery — Five Platforms:
1. **Desktop App** (PRIMARY) — Electron, system tray, global hotkey, types into any app
2. **Chrome Extension** (VIRAL ENGINE) — Grammar check on any website, free tier drives upgrades
3. **iPhone Keyboard** — Custom keyboard extension, corrects as you type, voice button
4. **Android Keyboard** — Same as iPhone, InputMethodService
5. **Website** (48co.nz) — Marketing, live demo, SEO, downloads

### Voice-to-Text Standard (Match WhisperTyping):
- Text appears in the chat box WORD BY WORD as user speaks — NOT after they stop
- Use Web Speech API with interimResults=true for real-time streaming
- ZERO popups, overlays, or visible UI elements — just text appearing
- Mouse wheel click as default trigger (customizable hotkey)
- Must work on: Claude.ai, ChatGPT, Gemini, DeepSeek, Gmail, Slack, any site

### Tech Stack:
- **Website**: Next.js 14, React 18, Tailwind CSS 3.4 (LIGHT THEME — white bg, indigo accent)
- **Desktop App**: Electron 28+, @nut-tree/nut-js, OpenAI Whisper API, Claude API (grammar + rewrite)
- **Browser Extension**: Chrome MV3 with AI grammar checker + voice-to-text
- **Mobile Keyboard**: React Native/Expo companion app + native keyboard extensions (Swift/Kotlin)
- **AI Grammar**: Claude Haiku API (fast grammar) + Claude Sonnet (rewrite/polish)
- **Speech-to-Text**: OpenAI Whisper API (primary), Web Speech API (free fallback)
- **Build/Package**: electron-builder for Win + Mac, EAS Build for iOS + Android

### Quality Checklist (Run Before Every Commit):
- [ ] Does every feature work end-to-end?
- [ ] Are all error states handled with user-friendly messages?
- [ ] Is there any copy-paste or manual friction that could be automated?
- [ ] Would a competitor's user be impressed or disappointed switching to us?
- [ ] Has every engineering gap been flagged and addressed?
- [ ] Does voice-to-text stream into the chat box in real-time (not after stopping)?
- [ ] Does text insertion work on Claude.ai, ChatGPT, and Gmail specifically?

## Known Limitations (Be Honest About These):
- **Web bookmarklet** cannot type into other tabs — only the current page
- **Web Speech API** is Chrome/Edge only and less accurate than Whisper
- **Desktop app requires a download** — there is no way around this for system-wide typing
- **Whisper API requires an API key** — costs ~$0.006/minute
- **Electron apps are large** (~150MB) — this is a known Electron tradeoff
- **macOS requires accessibility permissions** for keyboard simulation
- **Chrome extension cannot type into other apps** — only browser text fields

## Deployment Protocol (Blue-Green)

### Environments:
- **Staging** (staging-api.48co.nz) — auto-deploys on every push to main
- **Production** (api.48co.nz) — requires manual approval after staging passes

### Rule: NEVER push broken code to production.
- All changes go to staging first
- Test on staging before approving production deploy
- If staging breaks, fix it before doing anything else
- Customers NEVER see errors — they're paying for a flawless system

### Deployment Order:
1. Website → Vercel/Netlify (auto-deploy on push)
2. API Server → Docker container (staging → approval → production)
3. Desktop App → GitHub Releases (CI/CD builds .exe + .dmg)
4. Chrome Extension → Chrome Web Store (manual upload for now)

## Mandatory Crawl Protocol

### When to crawl:
- EVERY session start (automated via SessionStart hook)
- EVERY time Claude stops working (automated via Stop hook)
- Before ANY launch or deployment
- After ANY major refactor

### What the crawl checks:
- Broken imports (files that import from paths that don't exist)
- Missing files referenced in manifest.json
- Hardcoded URLs that might break
- Missing environment variables
- Files referenced but not committed

### The crawl hook is in .claude/settings.json — it runs automatically.
### If you're reading this and the hook isn't set up, create it immediately.

## File Structure Convention:
```
/app/              → Next.js website pages
/components/       → React components
/extension/        → Chrome extension (maintained)
/desktop/          → Electron desktop app
/desktop/main/     → Electron main process
/desktop/renderer/ → Electron renderer (UI)
/desktop/assets/   → Icons, images for desktop app
/mobile/           → Mobile keyboard app (React Native + native extensions)
/public/           → Static web assets
```
