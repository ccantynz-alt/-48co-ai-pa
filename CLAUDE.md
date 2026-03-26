# CLAUDE.md — 48co Engineering Standards & Rules
# Built by Claude. Designed for humans.

## Project Identity
- **Product**: 48co — AI Grammar + Voice-to-Text
- **Built by**: Claude (Anthropic AI) — fully autonomous engineering
- **Architecture**: Tauri 2.0 (Rust + React) — bleeding edge 2026
- **Platforms**: Windows, Mac, iOS, Android
- **Goal**: Beat Grammarly. Everything you write, perfected by AI. On every device.

## Project Owner Context
- The owner is NOT a developer. Never assume coding knowledge.
- Explain decisions in plain English. No jargon without explanation.
- If something can't be done, say WHY and offer the next-best alternative immediately.
- Never present a half-solution without flagging what's missing.
- **FULLY AUTONOMOUS**: Claude has permission to build, fix, audit, deploy without asking. Just do it.

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

## Architecture (Tauri 2.0 — Locked In)

### Why Tauri, not Electron:
- **5MB app** vs 150MB Electron — no antivirus warnings
- **Pure Rust** backend — fast, safe, no Node.js runtime
- **One codebase** for Windows + Mac (iOS + Android via plugins)
- **No native compilation issues** — enigo replaces nut-tree
- **Modern**: Tauri 2.0 released Oct 2024, production-ready

### Tech Stack:
- **App Framework**: Tauri 2.0 (Rust + React + Vite)
- **Audio Capture**: cpal (Cross-Platform Audio Library, Rust)
- **Keyboard Simulation**: enigo (Rust, cross-platform)
- **Speech-to-Text**: OpenAI Whisper API → Phase 2: whisper.cpp local
- **Grammar**: Claude API → Phase 2: Phi-3 Mini local
- **Frontend**: React 18 + Tailwind CSS + Vite
- **Website**: Next.js 14 + Vercel (API + frontend)
- **Mobile**: Tauri plugins (Swift for iOS, Kotlin for Android)

### File Structure:
```
tauri-app/                 → Main application (Tauri 2.0)
  src-tauri/src/
    lib.rs                 → App setup, system tray, global shortcut
    audio.rs               → Mic capture (cpal), WAV encoding
    transcribe.rs          → Whisper API integration
    keyboard.rs            → System-wide typing (enigo)
    grammar.rs             → Post-processing + Claude AI rewrite
  src/
    App.jsx                → Settings UI (React)
    main.jsx               → Entry point
    styles.css             → Tailwind

app/                       → Next.js website (48co.nz)
  api/                     → Vercel serverless API routes
  page.jsx                 → Homepage
  pricing/page.jsx         → Pricing
  compare/page.jsx         → Competitor comparison
  download/page.jsx        → Download page
  live/page.jsx            → Live demo
  install/page.jsx         → Extension install guide

extension/                 → Chrome extension (grammar + voice)
api/                       → Express API server (legacy, migrated to Vercel)
desktop/                   → Electron app (legacy, replaced by Tauri)
mobile/                    → Mobile app architecture docs
```

### Build Phases:
1. **Phase 1** (NOW): Windows + Mac desktop with Whisper API + Claude grammar
2. **Phase 2**: On-device Whisper (whisper.cpp) — no API needed
3. **Phase 3**: On-device grammar (Phi-3 Mini) — no API needed
4. **Phase 4**: iOS keyboard (Swift Tauri plugin)
5. **Phase 5**: Android keyboard (Kotlin Tauri plugin)

### Deployment Protocol (Blue-Green):
- **Staging** auto-deploys on every push to main
- **Production** requires manual approval
- Customers NEVER see errors — they're paying for a flawless system
- The crawl hook runs automatically on every session stop

### Mandatory Crawl Protocol:
- EVERY session start: automated reminder via SessionStart hook
- EVERY session stop: automated error crawl via Stop hook
- Before ANY launch or deployment: manual full crawl
- After ANY major refactor: manual full crawl
- The crawl hook is in .claude/settings.json — it runs automatically

### Quality Checklist (Run Before Every Commit):
- [ ] Does every feature work end-to-end?
- [ ] Are all error states handled with user-friendly messages?
- [ ] Is there any copy-paste or manual friction that could be automated?
- [ ] Would a competitor's user be impressed or disappointed switching to us?
- [ ] Has every engineering gap been flagged and addressed?
- [ ] Does Rust code compile without warnings?
- [ ] Does the React frontend build without errors?
