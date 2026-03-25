# 48co Strategy & Roadmap
> Last updated: 2026-03-25
> Status: EXECUTE MODE

## The Hook

**"You're not selling dictation. You're selling a thinking amplifier."**

Every competitor just transcribes. 48co REWRITES. You ramble, it writes professionally. You describe code intent, it writes actual code. You say "email Sarah about being late", it drafts the entire email.

Once users try AI rewrite, raw dictation feels broken. That's the addiction.

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

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Basic dictation, 60 min/month, Web Speech API |
| Pro | $12/mo or $99/year | Unlimited, AI rewrite, offline, context-aware |
| Teams | $24.99/user/mo | Meeting transcription, speaker ID, shared macros |
| Lifetime | $89 (launch only, 1000 units) | Pro features forever |

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
