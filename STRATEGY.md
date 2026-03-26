# 48co Strategy & Roadmap
> Last updated: 2026-03-26
> Status: EXECUTE MODE — Grammarly killer

## The Hook

**"Everything you write, perfected by AI. On every device."**

We're not a dictation tool. We're not a grammar checker. We're the **AI writing layer for everything.** Voice + grammar + tone + style — one tool, every device, works offline.

Grammarly is rules-based, English-only, $30/mo, cloud-only. We use Claude AI, support 30+ languages, cost $12/mo, and work offline. That's the 80% advantage.

---

## How We Beat Grammarly (The 80% Plan)

| Grammarly weakness | 48co advantage |
|-------------------|----------------|
| Old AI (rules + GPT-3 era) | Claude AI (frontier model) |
| English only | 30+ languages |
| $30/mo ($360/year) | $12/mo ($99/year) + $89 lifetime |
| No voice-to-text | Full voice built in |
| Cloud-only (privacy risk) | Offline mode (local Whisper + local LLM) |
| Makes writing generic | "Preserve My Voice" — learns YOUR style |
| Laggy desktop app | Lightweight, types into any app |
| No developer API | Public API for integrations |
| 55% grammar detection | Claude catches more with context understanding |
| No mobile keyboard | Custom iOS + Android keyboards |

### The 3 Killer Features Grammarly Can't Copy:
1. **Voice + Grammar in one tool** — Grammarly killed their voice feature
2. **"Preserve My Voice"** — AI learns your writing style from past docs
3. **Privacy-first offline** — entire enterprise market Grammarly can't touch

---

## Market Position

| | 48co | Wispr Flow | SuperWhisper | WhisperTyping |
|--|------|-----------|--------------|---------------|
| AI Rewrite | YES | Basic cleanup | Basic | No |
| Live Claude Sidebar | YES | No | No | No |
| Context-Aware | YES | No | No | No |
| Offline (whisper.cpp) | YES | No | Yes (Mac only) | No |
| Cross-platform | Mac + Win | Mac + Win + iOS | Mac + Win + iOS | Windows |
| Price/month | $12 | $15 | $7 | Subscription |
| Privacy (local-first) | YES | Cloud-only | YES | Cloud |
| Lifetime deal | $89 | Never | $249 | Never |

---

## Product Roadmap

### Phase 1: Foundation (Weeks 1-4) — 40% ahead
- [x] Desktop app (Electron, system tray, global hotkey)
- [x] Whisper API transcription
- [x] Keyboard simulation (types into any app)
- [x] Chrome extension (secondary)
- [ ] **AI Rewrite Mode** (Claude API) — THE differentiator
- [ ] **Context-Aware Detection** (knows Slack vs Email vs Code)
- [ ] Voice Macros/Templates

### Phase 2: Multiplication (Weeks 5-10) — 60-70% ahead
- [ ] Offline Whisper (whisper.cpp local model)
- [ ] Live Claude Sidebar (dictate question, get AI answer)
- [ ] Real-time Streaming (Deepgram, words appear as you speak)
- [ ] Real-time Translation (speak one language, types another)

### Phase 3: Market Domination (Weeks 11-16) — 80%+ ahead
- [ ] Meeting Transcription with Speaker ID
- [ ] Enterprise/Team features
- [ ] Accessibility features
- [ ] Mobile companion (React Native)

---

## Pricing (Final — No Lifetime Deals)

| Tier | Price | Users | What you get | Target |
|------|-------|-------|-------------|--------|
| **Free** | $0 | 1 | 10 grammar corrections/day, 60 min voice/mo, Chrome extension only | Get users hooked |
| **Pro** | $12/mo or $99/year | 1 | Unlimited grammar, voice, AI rewrite, context-aware, all platforms, offline, 50+ languages, Preserve My Voice | 70% of revenue |
| **Business** | $29/mo | Up to 10 users | Everything in Pro + team style guide enforcement, shared vocabulary, admin dashboard, usage analytics, priority support | Agencies, small teams |
| **Enterprise** | Custom pricing | Unlimited | Everything in Business + SSO/SAML, dedicated account manager, SLA, on-premise/private cloud option, custom integrations | Large orgs |

### Why this structure works
- **No lifetime deals** — recurring revenue only, no legal liability
- **Free → Pro** is the main conversion path (10 free checks/day is enough to see value)
- **Business at $29/mo for 10 users** = $2.90/user = incredibly cheap for teams (Grammarly Business is $15/user/mo = $150/mo for 10 users)
- **Enterprise** is custom because large orgs expect to negotiate
- $12/mo Pro is impulse-buy territory — cheaper than a Netflix subscription

### API cost model
- Grammar check (Claude Haiku): ~$0.001/check → ~$0.50/mo per active user
- Voice transcription (Whisper): ~$0.006/min → ~$1-2/mo per active user
- AI Rewrite (Claude Sonnet): ~$0.003/rewrite → ~$0.30/mo per active user
- **Total API cost per user: ~$2-3/mo** → healthy margin on $12/mo Pro
- **Business tier:** 10 users × $2-3/mo cost = $20-30/mo cost on $29/mo revenue (tight but works with scale)

### Revenue projections
| Month | Free | Pro | Business | MRR |
|-------|------|-----|----------|-----|
| 1 | 5,000 | 500 | 20 | $6,580 |
| 3 | 15,000 | 2,000 | 80 | $26,320 |
| 6 | 40,000 | 5,000 | 200 | $65,800 |
| 12 | 100,000 | 12,000 | 500 | $158,500 |

---

## Launch Strategy (30-Day Plan)

### Week 1: Foundation
- Landing page live at 48co.nz
- Blog: "Voice to Text vs Manual Typing: 23 Studies"
- Comparison guide: "Wispr Flow vs SuperWhisper vs 48co"
- YouTube how-to video (60 seconds)

### Week 2: Authority
- Deep guide: "Complete Guide to Voice Dictation 2026"
- Developer blog on Dev.to + Hacker News
- TikTok content (3 x 21-34 sec videos)

### Week 3: LAUNCH WEEK
- **Tuesday:** Product Hunt + Hacker News + Reddit blitz + Email blast
- **Wednesday-Thursday:** YouTube + TikTok + comment engagement
- **Friday:** Second wave, influencer DMs
- Target: Top 5 on Product Hunt, 150+ HN points

### Week 4: Community
- User story videos, AMA on Reddit
- App Store submissions (Mac App Store + Microsoft Store)
- Performance review, iterate

---

## SEO Keywords (Top 20 Priority)

### Quick Wins (Low competition, high intent)
1. best voice to text app mac
2. best dictation software windows
3. offline voice to text dictation
4. private voice to text no cloud
5. voice typing into any app
6. wispr flow alternative
7. superwhisper alternative
8. voice to text for writers
9. voice typing for developers
10. code dictation voice to text developer

### Head Terms (Build authority over time)
11. voice to text software
12. dictation software
13. speech to text
14. ai dictation
15. voice typing app

### Problem-Focused
16. windows 11 voice typing not working
17. mac dictation accuracy problems
18. improve voice to text accuracy
19. voice dictation filler words removal
20. voice to text punctuation formatting

---

## International Expansion Priority

1. **Month 1-2:** US, UK, Canada, Australia (English)
2. **Month 2-3:** Germany, Netherlands, Nordics (Europe)
3. **Month 3-4:** India, Southeast Asia (Growth markets, lower pricing)
4. **Month 4+:** Spanish, French, Portuguese, Japanese, Chinese

---

## Revenue Targets

| Month | Customers | MRR | Notes |
|-------|-----------|-----|-------|
| 1 | 600-900 paid + 300-500 lifetime | $7-11K MRR + $27-45K one-time | Launch momentum |
| 2 | 1,500-2,000 | $25-30K MRR | Optimize + expand |
| 3 | 2,500-3,500 | $40-50K MRR | $150K+ ARR |

---

## Technical Architecture

### Desktop App (PRIMARY)
- Electron 28+ with system tray
- @nut-tree-fork/nut-js for keyboard simulation
- OpenAI Whisper API (primary) + whisper.cpp (offline)
- Claude API for AI rewrite mode
- electron-active-window for context detection
- electron-store for settings
- electron-updater for auto-updates

### Chrome Extension (SECONDARY)
- Manifest V3
- Content script + offscreen document
- Web Speech API (free) + Whisper API
- Works on Claude, ChatGPT, Gemini, DeepSeek, any site

### Website (48co.nz)
- Next.js 14, React 18, Tailwind CSS
- Live demo, download page, SEO content
- Comparison pages for each competitor

---

## The 90-Day Window

Wispr Flow has $81M in funding. They will notice us eventually. We have 90 days to:
1. Nail the product (AI rewrite + context-aware)
2. Build distribution (Product Hunt, HN, Reddit, SEO)
3. Get to $20K+ MRR
4. Own "privacy-first voice dictation" positioning

After that, we're too established to kill.
