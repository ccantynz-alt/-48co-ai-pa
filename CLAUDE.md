# CLAUDE.md — THE BIBLE
# Built by Claude. Designed for humans. Commanded by Craig.
# Last updated: April 7, 2026
# Status: MAXIMUM AGGRESSION — Dominate or die.

# =============================================================================
# PART 1 — SALEONLINE.CO.NZ: THE DOMINATION MANDATE
# =============================================================================
# This section is the IRON BIBLE for saleonline.co.nz.
# READ THIS BEFORE EVERY BUILD. READ THIS BEFORE EVERY CHANGE.
# If you haven't read it this session, stop and read it now.

## THE MISSION
SaleOnline.co.nz is the most aggressive automated website factory in Australasia.
We generate, sell, and host AI-built websites for NZ and AU businesses at a scale
and quality no human-built competitor can match. We rank #1 on Google for every
target keyword. We beat every competitor on speed, quality, price, and features.
**Second place is failure. First place is everything.**

## THE BOSS — CRAIG AUTHORISES ALL MAJOR CHANGES
Craig is the owner. Craig runs the 24/7 airport shuttle business. Craig is not a
developer. Craig's time is precious. But Craig is the boss, and these rules apply:

### What Requires Craig's Explicit Authorisation (NO EXCEPTIONS)
- Changing the core product direction or business model
- Adding or removing revenue streams or pricing
- Changing the marketplace domain (saleonline.co.nz)
- Deleting or rewriting major features that already work
- Deploying to production (staging is free to ship)
- Adding new third-party paid services or subscriptions
- Changing Stripe pricing, plans, or products
- Publishing anything to social media or email lists
- Registering or purchasing domains on Craig's behalf
- Taking any action that costs money
- Rebranding, renaming, or changing visual identity
- Legal or compliance changes (terms, privacy, GDPR, etc.)

### What Claude Can Do Autonomously (No Approval Needed)
- Fix bugs
- Refactor code for quality and speed
- Upgrade dependencies to latest versions
- Add new industry templates
- Improve SEO, performance, accessibility
- Write tests
- Generate websites and list them on the marketplace
- Scan for new available domains
- Update documentation
- Kill dead code
- Deploy to staging
- Write new content and improve existing pages

**When in doubt: build it on staging, commit it, and tell Craig what you did in
plain English. If it's risky, ask first. If it's reversible, ship it.**

## THE 15 COMMANDMENTS OF SALEONLINE

### Commandment 1: Read The Bible First — No Exceptions
Every session, every task, every build: read this file FIRST. If you skip it,
you will make the same mistakes as the previous website. This is not optional.
This is the reason SaleOnline exists and the reason it will dominate.

### Commandment 2: First Place Is Everything
We rank #1 on Google for every target keyword or we fix it until we do.
- Every page ships with perfect SEO (meta, schema, OG tags, sitemap, robots)
- Every page scores 100/100 on Lighthouse (performance, accessibility, best practices, SEO)
- Every page passes Core Web Vitals: LCP < 1.2s, INP < 100ms, CLS < 0.05
- Every industry page targets specific long-tail keywords with search intent
- Every generated website includes local SEO, schema.org markup, and Google Business integration
- We monitor our rankings daily. If we drop, we fix it the same session.

### Commandment 3: Speed Is A Weapon
Slow software loses. We are the fastest or we are dead.
- Homepage First Contentful Paint under 800ms on 4G
- Marketplace browse page loads under 1s globally via Vercel Edge
- AI content generation returns under 3 seconds per page
- Full website generation (domain → deployed site) under 60 seconds
- Database queries under 50ms (indexed, prepared, cached)
- Static assets served from CDN with 1-year immutable cache
- Images served as AVIF with WebP fallback
- Zero render-blocking JavaScript on marketing pages

### Commandment 4: Aggressive Technology — Bleeding Edge Only
No old technology. Rip it out, put in the new. See Rule 13 below for the strict version.
Mandatory stack for SaleOnline (as of April 2026):
- Next.js 16.x (latest) with Turbopack
- React 19.1+ with Server Components
- Tailwind CSS 4.1+ with CSS-first architecture
- TypeScript or modern JSX — no old patterns
- Vercel Postgres for transactional data
- Claude Sonnet 4.6 (claude-sonnet-4-6) for content generation
- Claude Haiku 4.5 (claude-haiku-4-5-20251001) for fast utility tasks
- Anthropic API version 2025-09-01 or later
- Stripe latest API version
- WHOIS protocol (free) for domain checks — NO paid domain APIs unless Craig approves
- Vercel Edge Functions for low-latency API routes
- Node.js 22 LTS or later

### Commandment 5: Parallel Agents — Maximum Velocity
When building new features, launch multiple agents in parallel to maximize output:
- One agent researching the latest competitor offerings
- One agent auditing existing code for issues
- One agent building the new feature
- One agent writing tests
- One agent optimising performance
Do not work serially when parallel is possible. Time is the only finite resource.

### Commandment 6: Zero Bugs In Production — Test Before Ship
We do not ship broken code. Period.
- Every commit must pass `next build` before pushing
- Every new page must be manually traced for broken imports, typos, missing components
- Every API route must handle errors gracefully with user-friendly messages
- Every form must validate input server-side AND client-side
- Every payment flow must be tested end-to-end with Stripe test mode
- Every database migration must be reversible
- If a bug is found in production, it becomes priority #1 and is fixed the same session

### Commandment 7: Annihilate Competitors — Know Them Cold
Every session, audit the competition:
- Wix, Squarespace, Webflow (global)
- Shopify (for e-commerce site sales)
- Flippa (for domain/site flipping marketplaces)
- Empire Flippers (for established site sales)
- Carrd, Framer (for simple landing pages)
- Any new AI site builders released this month
Document what they do well. Document what they charge. Document what they lack.
Then build the feature that makes us 80-90% better.

### Commandment 8: Aggressive Marketing Infrastructure
Every page on saleonline.co.nz is built to convert AND rank:
- Dedicated landing pages for every industry + city combination
- Dedicated landing pages for every competitor comparison (vs Wix, vs Squarespace, vs Flippa)
- Auto-generated blog posts on "Best {industry} websites in {city}"
- Schema.org LocalBusiness, Product, Offer, and FAQPage markup on every listing
- OpenGraph + Twitter cards for every listing (auto-generated preview images)
- XML sitemap auto-updated on every new listing
- robots.txt optimized for search crawlers
- Internal linking strategy: every industry page links to relevant city pages and vice versa
- Programmatic SEO: generate thousands of keyword-targeted landing pages

### Commandment 9: Security Is Non-Negotiable
We handle payments, personal data, and business assets. Security is existential.
- All auth endpoints rate-limited
- Passwords bcrypt hashed (10+ rounds)
- Session tokens cryptographically random, 30-day expiry, revocable
- All API routes validate input and sanitize output
- CSP headers on every response, strict origins
- No secrets in git history (check every commit)
- Database files in .gitignore
- Stripe webhooks verify signatures
- Admin routes require ADMIN_SECRET
- CORS locked down to known origins
- SQL injection prevented via parameterized queries
- XSS prevented via React auto-escaping + CSP
- HTTPS only, HSTS enabled
- Regular security audits (every session)

### Commandment 10: Explain Everything In Plain English
Craig is not a developer. Every change must be explained like this:
- "Before, users saw X. Now they see Y. This matters because Z."
- Never say "refactored the state machine" — say "fixed the marketplace loading getting stuck"
- Every commit message explains WHAT and WHY in plain English
- Every PR description leads with the business impact, not the code

### Commandment 11: One Source Of Truth — This File
Everything important lives in CLAUDE.md:
- Current architecture
- Known issues
- Decisions and reasoning
- Competitor analysis
- Session audit results
- Tech mandate
If it's not in this file, it doesn't exist. Update this file every session.

### Commandment 12: Kill Dead Code Without Mercy
If code is unused, delete it. If a feature is abandoned, remove it. If a dependency
is unused, uninstall it. Dead code is technical debt that slows us down and
confuses future sessions.

### Commandment 13: Measure Everything
We do not ship features without measurement:
- Every page has analytics (privacy-respecting)
- Every conversion funnel is tracked (view → detail → checkout → purchase)
- Every AI generation is logged (cost, duration, tokens, success)
- Every error is logged and alerted
- Every deploy has rollback capability
- Dashboards visible to Craig at a glance

### Commandment 14: Autonomous But Accountable
Claude has permission to build, fix, audit, and deploy without asking Craig for
every small thing. But Claude is accountable:
- Every session ends with a summary of what was done
- Every major decision is documented in this file with reasoning
- Every risky action requires Craig's approval BEFORE being taken
- Every failure is reported honestly, not hidden

### Commandment 15: Mandatory Session Protocol For SaleOnline
Every session that touches SaleOnline must follow this protocol:
1. **READ** — Read this CLAUDE.md file (this section specifically)
2. **SCAN** — Check saleonline.co.nz for broken pages, bugs, security issues, SEO regressions
3. **AUDIT** — Check dependencies for newer versions, check AI models for upgrades, check competitors for new features
4. **FIX** — Repair everything found before building new
5. **BUILD** — Launch parallel agents for the new work
6. **TEST** — Run `next build` and manually trace every change
7. **DEPLOY** — Push to staging, test, then (with Craig's approval for prod) deploy
8. **DOCUMENT** — Update this CLAUDE.md with everything that changed
9. **REPORT** — Tell Craig in plain English what happened

## PERFORMANCE TARGETS — NON-NEGOTIABLE

| Metric | Target | Why |
|--------|--------|-----|
| Lighthouse Performance | 100 | Google rankings |
| Lighthouse SEO | 100 | Google rankings |
| Lighthouse Accessibility | 100 | Legal compliance + rankings |
| Lighthouse Best Practices | 100 | Quality signal |
| LCP (Largest Contentful Paint) | < 1.2s | Core Web Vitals |
| INP (Interaction to Next Paint) | < 100ms | Core Web Vitals |
| CLS (Cumulative Layout Shift) | < 0.05 | Core Web Vitals |
| Time to First Byte | < 200ms | Perceived speed |
| First Contentful Paint | < 800ms | Perceived speed |
| JavaScript bundle size | < 100KB gzipped | Load speed |
| Domain scan time | < 30s for 20 domains | User experience |
| AI site generation | < 60s end-to-end | User experience |
| Database queries | < 50ms p95 | Backend speed |
| Uptime | 99.9% | Trust |

## THE KILL LIST — WHAT WE DESTROY

These competitors and we take their market share:
1. **Flippa** — overpriced site marketplace, we're faster and AI-powered
2. **Empire Flippers** — slow human brokerage, we automate it
3. **Wix / Squarespace** — we sell ready-made sites, not DIY builders
4. **Local web design agencies** — charging $5k+ for what we do in 60 seconds
5. **Any "AI website builder"** — they let users build, we pre-build for them

## SUCCESS METRICS — HOW WE KNOW WE'RE WINNING

- **Month 1**: 100 sites generated, 10 sales, $10k revenue
- **Month 3**: 500 sites generated, 50 sales/mo, $50k MRR (sales + subscriptions)
- **Month 6**: 2000 sites generated, 150 sales/mo, $150k MRR
- **Month 12**: 10,000 sites in inventory, 500+ sales/mo, $500k MRR
- **Rankings**: Top 3 for "buy ready-made website NZ", "buy website Australia", "ready-made business website"
- **Brand**: SaleOnline is the first name anyone in NZ/AU thinks of for ready-made websites

---

# =============================================================================
# PART 2 — 48CO VOICE: ORIGINAL ENGINEERING STANDARDS
# =============================================================================
# The rules below apply to 48co Voice (grammar + voice product).
# SaleOnline inherits these where relevant, but Part 1 takes precedence for
# any SaleOnline-specific work.

# CLAUDE.md — 48co Voice Engineering Standards & Rules
# Built by Claude. Designed for humans.
# Last deep scan: March 29, 2026
# Status: WAR MODE — No more three-legged dog. Ship or die.

## Project Identity
- **Product**: 48co Voice — AI Grammar + Voice-to-Text + Custom Keyboard
- **Brand**: 48co (parent brand) — this repo builds the Voice product only
- **Domain**: 48co.nz (primary)
- **Other 48co products** (separate repos, not built here): 48co Law, 48co Accounting, 48co Oracle
- **Built by**: Claude (Anthropic AI) — fully autonomous engineering
- **Architecture**: Tauri 2.0 (Rust + React) — bleeding edge 2026
- **Platforms**: Windows, Mac, iOS, Android, Chrome Extension, Web App
- **Goal**: 80-90% ahead of every competitor. Not "as good as" — BETTER THAN. Grammarly, Wispr Flow, SuperWhisper, WhisperTyping — all of them.
- **Target users**: Lawyers, accountants, doctors, executives, anyone who writes for a living. This is a professional tool, not a toy.
- **Naming rule**: All user-facing text says "48co Voice" (or just "48co" in context).

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

### Deep Audit Results — March 29, 2026 (Component Upgrade Audit)
**Outdated components found and upgraded this session:**
- CRITICAL: Claude Sonnet model was `claude-sonnet-4-20250514` (10 months old). Upgraded to `claude-sonnet-4-6` across all 4 integration points.
- CRITICAL: Anthropic API version was `2023-06-01` (3 YEARS old). Upgraded to `2025-09-01` across all 6 files.
- HIGH: Next.js was 14.2 (2 major versions behind). Upgraded to 15.3.
- HIGH: React was 18.3 (1 major version behind). Upgraded to 19.1.
- HIGH: Tailwind CSS was 3.4 (1 major version behind). Upgraded to 4.1 with new CSS-first architecture.
- HIGH: Vite was 5.4 (1 major version behind). Upgraded to 6.2.
- MEDIUM: ESLint was 8.x. Upgraded to 9.x.
- MEDIUM: Node.js in CI was 20. Upgraded to 22 LTS.
- MEDIUM: Rust crates outdated — enigo 0.2→0.3, whisper-rs 0.12→0.13, dirs 5→6, candle 0.8→0.9, uniffi 0.28→0.29.
- **Rule 13 added**: Strictest rule — no old technology allowed. Rip it out, put in the new.

### Deep Audit Results — March 28, 2026
**Bugs found and fixed this session:**
- CRITICAL: grammar.js crashed — referenced variables that were never declared (`correctionsToday`, `maxFreeCorrections`). Fixed.
- CRITICAL: API URL hardcoded to dead domain `https://48co.nz/api`. Fixed to `https://48co.nz/api`.
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

### Rule 5: Technology Currency — Bleeding Edge Only (STRICT — NO EXCEPTIONS)
We don't use "good enough" technology. We use the BEST available.
- Review all dependencies every session for security vulnerabilities and newer versions
- Check if browser APIs have changed (SpeechRecognition, Clipboard, etc.)
- If a library we're using has a better alternative, migrate immediately
- Stay on latest stable versions of ALL frameworks
- **STRICT**: Mandatory technology choices for 2026 (see Technology Mandate below)
- **STRICT**: If you find deprecated APIs in our code, replace them in the same session
- **STRICT**: No raw HTML pages. Use React/JSX components for all UI. The ONLY exceptions are files that the platform forces to be HTML (Chrome extension manifest requires popup.html, offscreen.html; Vite requires index.html as SPA entry). These platform-mandated HTML files must be minimal shells that load JS components — no inline styles, no inline scripts, no UI logic in HTML.
- **STRICT**: No old-generation frameworks, libraries, or patterns. If it was current in 2024 but superseded in 2026, rip it out. We only ship with the most advanced, fastest components available RIGHT NOW.
- **STRICT**: Every session must audit AI model versions, framework versions, dependency versions, and API versions. If anything is not the latest — upgrade it immediately. No excuses, no delays.

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
Every session must verify 48co Voice uses the most advanced technology available:
- **Check AI model versions**: Are we on the latest Claude, Whisper, Deepgram models?
- **Check competitor releases**: Has Grammarly, Wispr Flow, SuperWhisper, or any competitor shipped something new?
- **Check dependency versions**: Are all npm packages and Rust crates on latest stable?
- **Check browser API changes**: Has Chrome, Safari, or Firefox changed any API we use?
- **Check for deprecated code**: Is anything we use marked for removal?
- **If something better exists — switch immediately.** No "we'll do it later." The standard is 80-90% ahead.
- **Document every finding** in this file under the audit results section above.

### Rule 11: Test Before Reporting — Zero Ping-Pong (CRITICAL — READ THIS EVERY TIME)
Never tell the user something works without verifying it first. Finding ONE bug does not mean the job is done. There could be 10 problems. FIX THEM ALL before reporting.
- **DEEP SCAN PROTOCOL (Mandatory before every "it's done" statement):**
  1. Read EVERY file that was changed or could be affected by the change
  2. Check for syntax errors, unclosed tags, missing imports, typos
  3. Check for CSS conflicts — are any CSS variables, classes, or styles fighting each other?
  4. Check for theme consistency — is the entire page using the same design system? No white sections on dark pages. No light text on light backgrounds.
  5. Trace every component's imports — does every file it references exist?
  6. Check the build config (next.config.js, tailwind.config.js, package.json) — are there version conflicts or missing dependencies?
  7. Look at the FULL page from top to bottom — Nav, Hero, every section, Footer. Does it ALL look right together?
  8. Check for stale cached CSS classes from previous sessions that conflict with new code
  9. Check every other page that uses shared components (Nav, Footer) — did the change break them too?
  10. Only after ALL of this passes: report to the user
- **THE ONE-FIX TRAP**: When you find a bug and fix it, DO NOT immediately say "fixed!" There are almost always MORE problems. The fix you just applied might have been one of five issues. Scan everything else before reporting.
- **If you find a bug while testing — fix it immediately, then KEEP SCANNING for more**
- The user should never discover a bug that Claude should have caught
- **NEVER say "it's done" or "it should work" — verify the build passes first. If you can't run the build, manually trace every JSX tag to ensure it closes properly, every CSS variable resolves, and every import exists.**
- **The owner works 24/7 running an airport shuttle business. Every broken deploy wastes hours of their limited time. Treat every push like it's going to production in front of a room full of lawyers.**

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

### Rule 13: No Old Technology — Rip It Out, Put In The New (STRICTEST RULE)
This is the strictest rule in the entire project. No exceptions. No debate.
- **NO raw HTML for UI**. All user interfaces must use modern component frameworks (React/JSX). The only HTML files allowed are platform-mandated shells (Chrome extension popup.html/offscreen.html, Vite index.html) — and those must be minimal loaders with ZERO UI logic.
- **NO old frameworks**. If a framework has a newer major version, upgrade immediately. Next.js, React, Tailwind, Vite, ESLint — always latest stable.
- **NO old AI models**. Always use the latest Claude, Whisper, Deepgram models. Check every session.
- **NO old API versions**. Anthropic API, OpenAI API, Stripe API — always the latest version header.
- **NO old dependencies**. Rust crates, npm packages — audit every session. If a newer version exists, upgrade.
- **NO old Node.js**. CI/CD pipelines must run on the current LTS version.
- **NO old patterns**. innerHTML is banned in new code — use DOM APIs or component rendering. execCommand() is banned — use modern Selection/Range APIs. var is banned — use const/let. CommonJS require() is banned in frontend — use ES modules.
- **The standard**: If a component, library, framework, model, or API version was released more than 6 months ago AND a newer version exists — it is OLD and must be replaced.
- **How to enforce**: Every session starts with a version audit. Every commit must use current technology. If old tech is found during any task, stop and upgrade it BEFORE continuing.
- **Why**: We are building a professional tool for lawyers, doctors, and executives. They pay for the best. We deliver the best. Old technology is slow technology. Slow technology loses customers. We don't lose customers.

---

## TECHNOLOGY MANDATE — What We Use and Why (2026)

These are locked-in decisions. Do not deviate without documenting why.

### Desktop App: Tauri 2.0 (Rust + React 19 + Vite 6)
- **Why**: 5MB app vs 150MB Electron. Pure Rust backend. One codebase for Windows + Mac.
- **Status**: Production-ready. 924 lines of solid Rust.
- **Kill**: Delete the legacy Electron desktop/ folder. It's dead weight.
- **Audio**: cpal 0.15 (Cross-Platform Audio Library)
- **Keyboard Simulation**: enigo 0.3 (cross-platform, latest)
- **Local Speech-to-Text**: whisper-rs 0.13 (whisper.cpp bindings, latest) — supports 6 model sizes
- **Local Grammar**: 91 regex rules + Claude API fallback
- **Hotkeys**: rdev 0.5 for global input (keyboard + mouse buttons)
- **Frontend**: React 19.1 + Vite 6.2 + Tailwind CSS 4.1 (all latest)

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

### Website: Next.js 15.3 + React 19.1 + Tailwind CSS 4.1 + Vercel
- **Status**: Working. Auth, grammar API, rewrite API, live demo all functional. All frameworks upgraded to latest March 2026.
- **Kill**: The legacy Express API server in api/ duplicates Next.js routes. Consolidate to ONE backend.
- **Add**: Stripe integration for payments (critical — can't make money without it)
- **Add**: Email verification on signup
- **Add**: Logout endpoint
- **Fix**: Google OAuth must fail-safe when GOOGLE_CLIENT_ID is missing

### AI Models — Always Latest (STRICT — Audit Every Session)
- **Grammar checking**: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) — fast, cheap, accurate. Current latest as of March 2026.
- **AI rewrite**: Claude Sonnet 4.6 (`claude-sonnet-4-6`) — best writing quality. Upgraded March 29, 2026.
- **Translation**: Claude Sonnet 4.6 (`claude-sonnet-4-6`) — 200+ languages, domain-aware. Upgraded March 29, 2026.
- **Anthropic API version**: `2025-09-01` — upgraded from ancient `2023-06-01` on March 29, 2026.
- **Speech-to-text cloud**: OpenAI Whisper API (`whisper-1`) — fallback when local model not downloaded
- **Speech-to-text local**: whisper.cpp via whisper-rs 0.13 — privacy mode, offline capable
- **Real-time streaming**: Deepgram Nova-3 — word-by-word live transcription
- **Future local grammar**: Evaluate latest small language models (Phi-4, Gemma 3, Llama 4 Mini) — pick whichever benchmarks best for grammar correction in 2026
- **RULE**: If a newer Claude model is released (e.g., Haiku 4.6, Opus), upgrade in the SAME SESSION. No waiting.

### Real-Time Streaming (NEW — Required to Beat Competitors)
- **Cloud**: Deepgram Nova-3 or AssemblyAI Universal-2 for real-time streaming transcription
- **Local**: whisper.cpp with voice activity detection (VAD) for chunked real-time processing
- **Why**: SuperWhisper and Wispr Flow both stream words as you speak. We must match or beat this.

---

## COMPETITIVE GAP ANALYSIS — What We Must Build

### vs Grammarly (Market Leader)
| Feature | Grammarly | 48co Voice | Gap |
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
| Feature | Wispr Flow | 48co Voice | Gap |
|---------|-----------|------|-----|
| Voice-to-text | Yes (cloud) | Yes (cloud + local) | We're BETTER — offline mode |
| Real-time streaming | Yes | No | GAP — must add Deepgram/AssemblyAI |
| AI rewrite | Yes | Yes | MATCH |
| Custom keyboard | No | No (planned) | Both missing — first to ship wins |
| Price | $15/mo | $12/mo | We WIN |

### vs SuperWhisper
| Feature | SuperWhisper | 48co Voice | Gap |
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

## ADVANCED FEATURES — What Makes 48co Voice 80-90% Ahead

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
- Connect 48co Voice to your document repository (local folders, Google Drive, SharePoint)
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

| Feature | Grammarly | Wispr Flow | SuperWhisper | Otter.ai | 48co Voice |
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

app/                       -> Next.js website (48co.nz) — SINGLE BACKEND
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

Every decision we make must pass one test: **Would a lawyer pay $12/month for 48co Voice?**

If the answer is no, we haven't built it right yet. Keep going.
