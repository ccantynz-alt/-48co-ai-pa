# CLAUDE.md — AlecRae Voice Engineering Standards & Rules
# Built by Claude. Designed for humans.
# Last deep scan: March 28, 2026
# Status: WAR MODE — No more three-legged dog. Ship or die.

## Project Identity
- **Product**: AlecRae Voice — AI Grammar + Voice-to-Text + Custom Keyboard
- **Brand**: AlecRae (parent brand) — this repo builds the Voice product only
- **Domain**: alecrae.ai (primary), alecrae.com (redirect)
- **Other AlecRae products** (separate repos, not built here): AlecRae Law, AlecRae Accounting, AlecRae Oracle
- **Built by**: Claude (Anthropic AI) — fully autonomous engineering
- **Architecture**: Tauri 2.0 (Rust + React) — bleeding edge 2026
- **Platforms**: Windows, Mac, iOS, Android, Chrome Extension, Web App
- **Goal**: 80-90% ahead of every competitor. Not "as good as" — BETTER THAN. Grammarly, Wispr Flow, SuperWhisper, WhisperTyping — all of them.
- **Target users**: Lawyers, accountants, doctors, executives, anyone who writes for a living. This is a professional tool, not a toy.
- **Naming rule**: All user-facing text says "AlecRae Voice" (or just "AlecRae" in context). The old name "48co" is retired.

## Project Owner Context
- The owner is NOT a developer. Never assume coding knowledge.
- The owner runs a 24/7 airport shuttle business. They cannot sit in front of a screen waiting for Claude to ask questions.
- Explain decisions in plain English. No jargon without explanation.
- If something can't be done, say WHY and offer the next-best alternative immediately.
- Never present a half-solution without flagging what's missing.
- **FULLY AUTONOMOUS**: Claude has permission to build, fix, audit, deploy without asking. Just do it.
- **NO MORE PAIN**: If something is broken, half-built, or a dead end — rip it out and rebuild it properly. No limping forward with bad code.
- **START IT, FINISH IT**: When a feature or task is started, it gets completed. No stopping to ask "what do we do next?" or "should we continue?" If it was started, it gets finished. Period.
- **NO WAITING FOR THE OWNER**: Do not pause work waiting for input. Make the best decision, document why, and keep building. The owner will review when they have time.

---

## DEEP SCAN RESULTS — March 27, 2026

### What Actually Works (The Good)
- Tauri desktop app: 924 lines of solid Rust, production-quality error handling
- Audio recording, cloud transcription (Whisper API), local transcription (whisper.cpp) — all working
- Grammar correction: 91 local rules + Claude API fallback — working
- Keyboard simulation (enigo) — types into any app — working
- Chrome extension: Manifest V3, works on Claude.ai, ChatGPT, Gmail, Slack
- Website: auth, grammar API, rewrite API, live demo — working
- "Preserve My Voice" feature — unique, no competitor has this

### Deep Audit Results — March 28, 2026
**Bugs found and fixed this session:**
- CRITICAL: grammar.js crashed — referenced variables that were never declared (`correctionsToday`, `maxFreeCorrections`). Fixed.
- CRITICAL: API URL hardcoded to dead domain `https://48co.nz/api`. Fixed to `https://alecrae.ai/api`.
- HIGH: Grammar correction used deprecated `execCommand()` for text replacement. Fixed to Selection/Range API.
- HIGH: Missing `.code-btn` CSS class in popup — add vocabulary buttons were unstyled. Fixed.
- HIGH: Voice commands and coding mode code existed in `lib/` and `adapters/` but were never wired into content.js. Documented for next session.
- MEDIUM: "48co" branding in 20+ locations across extension, desktop app, and website. Extension fixed. Desktop and website still need updating.

**Stripe integration added:** checkout, webhooks, billing portal all wired up. Needs Stripe API keys in env vars.

### What's Broken or Missing (The Three-Legged Dog)
1. **No payment system** — Stripe now WIRED but needs API keys in Vercel env vars to go live.
2. **Mobile apps are empty scaffolding** — folders exist, nothing works on phones
3. **No custom keyboard for iOS/Android** — the killer feature doesn't exist yet
4. **Two competing backends** — Express API AND Next.js API doing the same job. Pick one.
5. **Desktop app not shipping to users** — builds configured but no release pipeline
6. **No real-time streaming transcription** — only Web Speech API interim results
7. **No meeting transcription** — competitors have it, we don't
8. **No team/admin dashboard** — Business tier is a ghost
9. **No monitoring** — if production breaks, nobody knows
10. **Legacy Electron app still exists** — dead weight alongside Tauri
11. **No logout endpoint** — sessions never invalidated
12. **Google OAuth unsafe fallback** — if GOOGLE_CLIENT_ID env var missing, any Google account gets in
13. **API keys stored unencrypted** — should use system keychain
14. **No email verification on signup** — spam risk
15. **execCommand() deprecated** — still used in extension, needs migration

---

## THE 10 MANDATORY RULES — Non-Negotiable

These rules override everything. Every session. Every task. No exceptions.

### Rule 1: Scan Before You Build
Every session starts by checking for security issues, broken code, and problems BEFORE doing anything new.
- Run through the user flow: install -> configure -> use -> edge cases
- Check if existing features actually work (don't assume they do)
- If something is broken, fix it FIRST before building new things
- Test on the actual platforms users will use (Claude.ai, ChatGPT, Gmail, etc.)

### Rule 2: Auto-Repair
If a bug is found while working on ANYTHING, fix it immediately.
- No "that's out of scope" excuses
- No "I'll fix that later" — fix it NOW
- No asking permission to fix obvious bugs — just fix them
- If a bug was reported before and not fixed, that's a failure — escalate priority

### Rule 3: Proactive Research — Best In Class Or Don't Ship
Before building anything, research what the BEST technology is in March 2026. Not 2024. Not 2025. RIGHT NOW.
- Search for the absolute best current technology/library for the job
- Compare at least 2-3 approaches and pick the one that puts us 80-90% ahead
- Research what competitors ship TODAY (Grammarly, Wispr Flow, SuperWhisper, WhisperTyping, Otter.ai)
- If a better approach exists than what we're using, MIGRATE IMMEDIATELY
- Document WHY a technology was chosen and what it beats
- **NEW**: Always check for the latest model versions (Claude, Whisper, etc.) — never use outdated models
- **NEW**: If a Rust crate or npm package has a newer major version, upgrade unless there's a breaking reason not to

### Rule 4: Engineering Gap Detection — Zero Tolerance
Systematically check for features that promise something the code can't deliver.
- Flag EVERY gap between our product and competitors BEFORE building
- If a browser limitation blocks a feature, say so IMMEDIATELY
- Check every feature actually works on the target platform
- If an approach requires copy-paste or manual steps — REJECT IT
- Missing error handling = gap. Silent failures = gap. Find them all.
- **NEW**: If the pricing page promises a feature that doesn't exist in code — that's a critical gap. Fix the code or fix the marketing. No lies.
- **NEW**: If a competitor has a feature we don't, document it in the gap list below and build a plan to beat it.

### Rule 5: Technology Currency — Bleeding Edge Only
We don't use "good enough" technology. We use the BEST available.
- Review all dependencies every session for security vulnerabilities and newer versions
- Check if browser APIs have changed (SpeechRecognition, Clipboard, etc.)
- If a library we're using has a better alternative, migrate immediately
- Stay on latest stable versions of ALL frameworks
- **NEW**: Mandatory technology choices for 2026 (see Technology Mandate below)
- **NEW**: If you find deprecated APIs in our code, replace them in the same session

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
- **NEW**: Kill dead code. If Electron is replaced by Tauri, delete the Electron folder. No sentimentality.

### Rule 8: Autonomous Testing
After changes, verify everything still works. No "it should be fine."
- Mentally trace every code path
- Check that error states are handled
- Verify the feature works on the specific sites users care about
- If a change could break something else, check that too
- **NEW**: If no automated tests exist for a module, write them. Zero-test modules are unacceptable.

### Rule 9: Mandatory Documentation
Every change gets documented so the next session knows what happened.
- Commit messages explain WHAT and WHY
- STRATEGY.md stays updated with current state
- Known issues are documented, not hidden
- Architecture decisions are recorded with reasoning
- **NEW**: This CLAUDE.md file is the single source of truth. Keep it updated every session.

### Rule 10: Daily Technology Scanning — Non-Negotiable
Every session must verify AlecRae Voice uses the most advanced technology available:
- **Check AI model versions**: Are we on the latest Claude, Whisper, Deepgram models?
- **Check competitor releases**: Has Grammarly, Wispr Flow, SuperWhisper, or any competitor shipped something new?
- **Check dependency versions**: Are all npm packages and Rust crates on latest stable?
- **Check browser API changes**: Has Chrome, Safari, or Firefox changed any API we use?
- **Check for deprecated code**: Is anything we use marked for removal?
- **If something better exists — switch immediately.** No "we'll do it later." The standard is 80-90% ahead.
- **Document every finding** in this file under the audit results section above.

### Rule 11: Test Before Reporting — Zero Ping-Pong
Never tell the user something works without verifying it first:
- Read the actual code and trace the execution path
- Check for undefined variables, missing imports, broken references
- Verify message chains work from sender to receiver
- Check that every file referenced in manifests/configs actually exists
- If automated tests exist, run them
- **If you find a bug while testing — fix it immediately, then report**
- The user should never discover a bug that Claude should have caught

### Rule 12: Mandatory Session Protocol
Every session must follow this protocol:
1. **SCAN** — Check for broken features, bugs, security issues
2. **DETECT** — Find engineering gaps vs competitors
3. **FIX** — Repair everything found before building new
4. **RESEARCH** — Check for better tech before implementing
5. **BUILD** — Only then, build new features
6. **TEST** — Verify everything works end-to-end
7. **DOCUMENT** — Record what changed and why
8. **UPDATE CLAUDE.md** — Record scan results, gaps found, decisions made

---

## TECHNOLOGY MANDATE — What We Use and Why (2026)

These are locked-in decisions. Do not deviate without documenting why.

### Desktop App: Tauri 2.0 (Rust + React + Vite)
- **Why**: 5MB app vs 150MB Electron. Pure Rust backend. One codebase for Windows + Mac.
- **Status**: Production-ready. 924 lines of solid Rust.
- **Kill**: Delete the legacy Electron desktop/ folder. It's dead weight.
- **Audio**: cpal 0.15 (Cross-Platform Audio Library)
- **Keyboard Simulation**: enigo 0.2 (cross-platform, no nut-tree issues)
- **Local Speech-to-Text**: whisper-rs 0.12 (whisper.cpp bindings) — supports 6 model sizes
- **Local Grammar**: 91 regex rules + Claude API fallback
- **Hotkeys**: rdev 0.5 for global input (keyboard + mouse buttons)

### Mobile App: Native Swift (iOS) + Native Kotlin (Android)
- **Why**: Custom keyboards REQUIRE native code. Expo/React Native cannot build a system-level keyboard that appears in every app.
- **iOS**: Swift + UIKit InputViewController — this is how Grammarly and SwiftKey do it
- **Android**: Kotlin + InputMethodService — this is how Gboard and Grammarly do it
- **Kill**: The Expo scaffolding in mobile/ is the wrong approach for a custom keyboard. Replace with native.
- **Shared logic**: Core AI/grammar logic via Rust shared library (uniffi for Swift/Kotlin bindings)
- **Voice in keyboard**: On-device whisper.cpp for real-time voice-to-text inside the keyboard

### Chrome Extension: Manifest V3
- **Status**: Working. Grammar + voice on Claude.ai, ChatGPT, Gmail, Slack.
- **Fix needed**: Replace deprecated execCommand() with Selection/Range API
- **Fix needed**: Restrict CORS to our specific extension ID, not all extensions

### Website: Next.js 14 + Vercel
- **Status**: Working. Auth, grammar API, rewrite API, live demo all functional.
- **Kill**: The legacy Express API server in api/ duplicates Next.js routes. Consolidate to ONE backend.
- **Add**: Stripe integration for payments (critical — can't make money without it)
- **Add**: Email verification on signup
- **Add**: Logout endpoint
- **Fix**: Google OAuth must fail-safe when GOOGLE_CLIENT_ID is missing

### AI Models — Always Latest
- **Grammar checking**: Claude Haiku (latest version) — fast, cheap, accurate
- **AI rewrite**: Claude Sonnet (latest version) — best writing quality
- **Speech-to-text cloud**: OpenAI Whisper API (latest) — fallback when local model not downloaded
- **Speech-to-text local**: whisper.cpp via whisper-rs — privacy mode, offline capable
- **Future local grammar**: Evaluate latest small language models (Phi-4, Gemma 3, Llama 4 Mini) — pick whichever benchmarks best for grammar correction in 2026

### Real-Time Streaming (NEW — Required to Beat Competitors)
- **Cloud**: Deepgram Nova-3 or AssemblyAI Universal-2 for real-time streaming transcription
- **Local**: whisper.cpp with voice activity detection (VAD) for chunked real-time processing
- **Why**: SuperWhisper and Wispr Flow both stream words as you speak. We must match or beat this.

---

## COMPETITIVE GAP ANALYSIS — What We Must Build

### vs Grammarly (Market Leader)
| Feature | Grammarly | AlecRae Voice | Gap |
|---------|-----------|------|-----|
| Grammar checking | Yes (rule + AI) | Yes (Claude AI) | We're BETTER — AI-native |
| Voice-to-text | No | Yes | We WIN |
| Custom keyboard iOS | Yes | No | CRITICAL GAP — must build |
| Custom keyboard Android | Yes | No | CRITICAL GAP — must build |
| Meeting transcription | Yes | No | GAP — build with Deepgram |
| Team admin dashboard | Yes | No | GAP — needed for Business tier |
| Browser extension | Yes | Yes | MATCH |
| Desktop app | Yes | Yes | MATCH |
| Tone detection | Yes | Yes (context-aware) | We're BETTER |
| "Preserve My Voice" | No | Yes | We WIN — unique feature |
| Payment/subscriptions | Yes (Stripe) | No | CRITICAL GAP |

### vs Wispr Flow
| Feature | Wispr Flow | AlecRae Voice | Gap |
|---------|-----------|------|-----|
| Voice-to-text | Yes (cloud) | Yes (cloud + local) | We're BETTER — offline mode |
| Real-time streaming | Yes | No | GAP — must add Deepgram/AssemblyAI |
| AI rewrite | Yes | Yes | MATCH |
| Custom keyboard | No | No (planned) | Both missing — first to ship wins |
| Price | $15/mo | $12/mo | We WIN |

### vs SuperWhisper
| Feature | SuperWhisper | AlecRae Voice | Gap |
|---------|-------------|------|-----|
| Mac-native polish | Excellent | Good | GAP — improve Tauri UI/UX |
| Real-time streaming | Yes | No | GAP — critical |
| Local processing | Yes | Yes | MATCH |
| Windows support | No | Yes | We WIN |
| Grammar correction | No | Yes | We WIN |

### Priority Build Order (What Closes The Most Gaps)
1. **Stripe payment integration** — DONE (checkout, webhooks, billing portal wired)
2. **Real-time streaming transcription** — table stakes, every competitor has it
3. **iOS custom keyboard (Swift)** — massive market, professionals need this
4. **Android custom keyboard (Kotlin)** — same as above
5. **Meeting transcription** — Grammarly and Otter.ai own this space
6. **Team admin dashboard** — unlocks Business tier revenue
7. **Desktop release pipeline** — users need to actually download and install the app

---

## ADVANCED FEATURES — What Makes AlecRae Voice 80-90% Ahead

These are the features that no competitor combines in one product. Each one is a reason a professional says "I can't work without this."

### Tier 1 — Build Now (Differentiators)

**Real-Time Streaming Transcription**
- Words appear as you speak, not after you stop. Sub-500ms latency.
- Cloud: Deepgram Nova-3 or AssemblyAI Universal-2 (WebSocket streaming)
- Local: whisper.cpp with voice activity detection, 1-second chunked inference
- Why: SuperWhisper and Wispr Flow both have this. We must match or beat it.

**Custom Vocabulary Injection**
- Users add industry terms the AI never gets wrong: legal terms, medical terms, company names, product names
- Stored per user, synced across devices
- Injected into both speech recognition and grammar correction
- Why: Every dictation tool butchers specialist terms. A lawyer getting "per say" instead of "per se" loses trust immediately.

**Perfect Number Dictation**
- "twelve million four hundred fifty-three thousand and twenty-two dollars and sixteen cents" → $12,453,022.16
- Currency-aware: NZD, USD, GBP, EUR with correct symbols
- Percentage handling: "twelve point five percent" → 12.5%
- Why: Accountants and executives dictate numbers constantly. Getting this wrong is a dealbreaker.

**Full Offline / Confidentiality Mode**
- Toggle that guarantees zero data leaves the device
- All transcription via local whisper.cpp, all grammar via local rules
- Audit log: every session logged with timestamp and processing mode (local vs cloud)
- Why: Lawyers have attorney-client privilege obligations. A tool that can prove zero cloud leakage becomes the ONLY tool privacy-conscious firms approve.

**Preserve My Voice (Already Built — Expand It)**
- Already stores writing samples and feeds them to Claude for style matching
- Expand: learn from corrections the user makes (if they keep changing "utilize" back to "use", stop suggesting "utilize")
- Expand: per-context voice profiles (formal for emails, casual for Slack)
- Why: Unique feature. No competitor has this. It's our moat.

### Tier 2 — Build Next (Competitive Advantages)

**Meeting Transcription + Action Items**
- Join Zoom, Teams, Google Meet — or capture system audio silently
- Multi-speaker diarization: identifies who said what
- Auto-extract action items: "John will send the proposal by Friday" → Action: John — Send proposal — Due: Friday
- Decision logging: highlights decisions made during the meeting
- 3-paragraph summary generated within 30 seconds of meeting end
- Follow-up email draft: one click to send decisions and action items to attendees
- Why: Otter.ai charges $20/mo just for this. We bundle it into the $12/mo Pro plan.

**Correction By Voice**
- "Fix that" / "Change lawyer to attorney" / "Delete the last sentence" — conversational editing
- No keyboard needed to make corrections to dictated text
- Why: Wispr Flow has this. It makes hands-free dictation actually usable.

**Context-Aware Auto-Formatting**
- Detects whether you're in an email, Slack, legal document, spreadsheet, or code editor
- Automatically adjusts formatting: bullet points in Slack, formal paragraphs in email, code fences in IDE
- Why: Wispr Flow pioneered this. We already detect apps — now we format for them.

### Tier 3 — Build Later (Future Dominance)

**Real-Time Translation**
- Speak in English, text appears in another language (or vice versa)
- 200+ languages via SeamlessM4T or similar
- Use case: NZ professional dictating in English, output in Te Reo Maori
- Why: No voice-to-text competitor does live translation. First to ship wins.

**Multi-Modal Context (Voice + Screen)**
- AI sees what's on your screen AND hears what you say
- "Summarize what's on screen" / "What does this spreadsheet show?"
- Screen context processed in memory, never stored permanently
- Privacy: user chooses which apps can be captured (never banking, passwords)
- Why: Granola.ai is pioneering this for meetings. We extend it to all work.

**Voice Cloning / Text-to-Speech**
- Read back any document in YOUR voice, not a robot
- 30-second voice enrollment to create a clone
- Use case: lawyer records a voice memo from written text — sounds like the lawyer
- Local processing option: voice model never leaves the device
- Why: ElevenLabs charges $22/mo for this alone. We bundle it.

**RAG on Your Documents**
- Connect AlecRae Voice to your document repository (local folders, Google Drive, SharePoint)
- "Use the language from last year's report" — finds and inserts it
- "What's our standard clause for indemnification?" — searches your docs and answers
- Vector database (local ChromaDB or cloud Pinecone) for semantic search
- Why: This turns a dictation tool into a knowledge assistant. Massive upgrade.

**Agent Workflows — AI That Takes Actions**
- Move beyond transcription: the AI executes multi-step tasks from voice
- "Draft an email to [client] summarizing today's meeting and send it"
- "Log 2 hours to the ABC Corp project"
- "Schedule a follow-up meeting with everyone from today's call"
- Integration with calendar, email, project management tools
- Why: This is where AI is heading. Voice commands that DO things, not just type things.

### What This Means vs Competitors

| Feature | Grammarly | Wispr Flow | SuperWhisper | Otter.ai | AlecRae Voice |
|---------|-----------|------------|--------------|----------|---------------|
| Grammar + AI rewrite | Yes | Basic | No | No | Yes (Claude) |
| Voice-to-text | No | Yes | Yes | Yes | Yes |
| Real-time streaming | N/A | Yes | Yes | Yes | Planned |
| Custom vocabulary | No | No | Yes | No | Planned |
| Number dictation | N/A | Basic | Basic | Basic | Planned (perfect) |
| Meeting transcription | No | No | No | Yes | Planned |
| Preserve My Voice | No | No | No | No | YES (unique) |
| Offline / privacy mode | No | No | Yes | No | Yes |
| Voice correction | No | Yes | No | No | Planned |
| Real-time translation | No | No | No | No | Planned |
| Screen context | No | No | No | No | Planned |
| Agent workflows | No | No | No | No | Planned |
| Custom keyboard iOS | Yes | No | No | No | Planned |
| Custom keyboard Android | Yes | No | No | No | Planned |
| Price | $30/mo | $15/mo | $10/mo | $20/mo | $12/mo |

**Nobody combines all of this in one product. That's the 80-90% advantage.**

---

## Architecture — File Structure

```
tauri-app/                 -> Main desktop application (Tauri 2.0)
  src-tauri/src/
    lib.rs                 -> App setup, system tray, global shortcut
    audio.rs               -> Mic capture (cpal), WAV encoding
    transcribe.rs          -> Whisper API integration
    local_whisper.rs       -> On-device Whisper (whisper.cpp)
    keyboard.rs            -> System-wide typing (enigo)
    grammar.rs             -> Claude AI rewrite + post-processing
    local_grammar.rs       -> 91 offline grammar rules
    hotkeys.rs             -> Global mouse/keyboard listener
    main.rs                -> Entry point
  src/
    App.jsx                -> Settings UI (React)
    main.jsx               -> Entry point
    styles.css             -> Tailwind

app/                       -> Next.js website (alecrae.ai) — SINGLE BACKEND
  api/                     -> Vercel serverless API routes (auth, grammar, rewrite, usage)
  page.jsx                 -> Homepage
  pricing/page.jsx         -> Pricing
  compare/page.jsx         -> Competitor comparison
  download/page.jsx        -> Download page
  live/page.jsx            -> Live demo
  install/page.jsx         -> Extension install guide

extension/                 -> Chrome extension (grammar + voice, Manifest V3)

ios-keyboard/              -> iOS custom keyboard (Swift, UIKit InputViewController)
android-keyboard/          -> Android custom keyboard (Kotlin, InputMethodService)
shared-rust/               -> Shared Rust core (grammar, whisper bindings) via uniffi
```

### What Gets Deleted (Dead Weight)
- `desktop/` — Legacy Electron app. Tauri replaced it. Kill it.
- `api/` — Legacy Express server. Next.js API routes replaced it. Kill it.
- `mobile/` — Expo scaffolding. Wrong approach for custom keyboards. Kill it.

---

## Build Phases (Updated March 2026)

### Phase 1 — CURRENT: Desktop + Extension + Website
- Windows + Mac desktop app with Whisper API + local Whisper + Claude grammar
- Chrome extension with grammar + voice on all major sites
- Website with auth, live demo, pricing
- **BLOCKER**: No payment system. Must add Stripe.

### Phase 2 — NEXT: Payments + Streaming + Polish
- Stripe integration (subscriptions, usage-based billing)
- Real-time streaming transcription (Deepgram or AssemblyAI)
- Desktop auto-update pipeline (Tauri updater with signed releases)
- Kill legacy code (Electron, Express, Expo)
- Email verification, logout, OAuth hardening

### Phase 3 — Mobile Keyboards
- iOS custom keyboard in Swift (system-level, works in every app)
- Android custom keyboard in Kotlin (system-level, works in every app)
- Shared Rust core via uniffi for grammar + whisper bindings
- On-device voice-to-text inside keyboard (no cloud needed)

### Phase 4 — Enterprise + Meetings
- Meeting transcription (record system audio, multi-speaker diarization)
- Team admin dashboard for Business tier
- SSO/SAML for enterprise
- Usage analytics and reporting
- SOC 2 / GDPR compliance documentation

### Phase 5 — Full Local AI
- On-device grammar model (best small LLM available at that time)
- Zero-cloud mode: everything runs on user's device
- Edge deployment for mobile (CoreML on iOS, NNAPI on Android)

---

## Deployment Protocol
- **Staging** auto-deploys on every push to main
- **Production** requires manual approval
- Customers NEVER see errors — they're paying for a flawless system
- The crawl hook runs automatically on every session stop
- Desktop releases: signed, notarized, auto-update via Tauri updater

### Mandatory Crawl Protocol
- EVERY session start: automated reminder via SessionStart hook
- EVERY session stop: automated error crawl via Stop hook
- Before ANY launch or deployment: manual full crawl
- After ANY major refactor: manual full crawl

---

## Quality Standards — Non-Negotiable

### Before Every Commit
- [ ] Does every feature work end-to-end?
- [ ] Are all error states handled with user-friendly messages?
- [ ] Is there any copy-paste or manual friction that could be automated?
- [ ] Would a competitor's user be impressed switching to us?
- [ ] Has every engineering gap been flagged and addressed?
- [ ] Does Rust code compile without warnings?
- [ ] Does the React frontend build without errors?
- [ ] Are all dependencies on their latest stable versions?
- [ ] Is there any deprecated API usage? If so, replace it.
- [ ] Does the pricing page only promise features that exist in code?

### Security Requirements
- API keys stored in system keychain (not plain text files)
- All auth endpoints rate-limited
- Google OAuth must fail-safe (reject if GOOGLE_CLIENT_ID missing)
- CORS restricted to specific origins (not wildcards for extensions)
- Session tokens: cryptographically random, 30-day expiry, revocable
- Password hashing: bcrypt with proper salt rounds
- No secrets in git history (use git-secrets hook)
- Database files (.db) in .gitignore

### Performance Requirements
- Desktop app: under 10MB installer
- App launch: under 2 seconds
- Voice-to-text latency: under 500ms for first word (streaming mode)
- Grammar check: under 1 second response
- Extension: no visible page slowdown

---

## The Standard We Hold Ourselves To

This app is for lawyers drafting contracts. Accountants writing reports. Doctors dictating notes. Executives composing emails. These people don't have time for broken software. They don't care about our tech stack. They care that when they speak, the right words appear. When they write, their grammar is perfect. When they switch devices, it just works.

Every decision we make must pass one test: **Would a lawyer pay $12/month for AlecRae Voice?**

If the answer is no, we haven't built it right yet. Keep going.
