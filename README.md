# 48Co

Highly intelligent, multi-agent AI website builder. Built for operators running
multiple products. Your own Anthropic API key. Flat platform fee. No credit
roulette. Cross-project memory that competitors can't copy.

> **Status: Session 1 (foundation) in progress.** Multi-agent loop, generator, and
> publish pipeline land in Sessions 2–4.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, RSC, React 19) |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Database | Postgres (Neon) via Prisma, pgvector for semantic recall |
| Auth | Clerk |
| AI | Claude Opus 4.7 · Sonnet 4.6 · Haiku 4.5 via Anthropic SDK, with prompt caching. Pluggable OpenRouter adapter for DeepSeek / GPT-5 / Gemini. |
| Storage | Cloudflare R2 |
| Deploy | Cloudflare Pages (`app.48co.ai` + wildcard `*.48co.ai` for user sites) |
| CI | GitHub Actions |

## Intelligence architecture

Every task is routed to one of eight specialised agent roles. Each role has its
own default model and can be swapped independently.

| Role | Default | Purpose |
|---|---|---|
| Planner | Opus 4.7 | Decompose goal, draft plan |
| Architect | Opus 4.7 | Structural decisions (data, routes, libs) |
| Reviewer | Sonnet 4.6 | Adversarial critique of plans and diffs |
| Builder | Sonnet 4.6 | Write and edit code |
| Designer | Sonnet 4.6 | Visual/UX decisions |
| Browser | Sonnet 4.6 | Headless Chrome verification + self-healing |
| Memory Curator | Haiku 4.5 | Distil + prune memory |
| Cost Sentinel | Haiku 4.5 | Watch token spend, kill runaway loops |

Guardrails wired into the core loop:

- Plan-critique-build (no write-and-pray)
- Loop detector bails after 2 near-identical edits
- Cost sentinel kills tasks that exceed budget
- Live token/USD HUD in the admin header
- Prompt caching on system prompt + project memory (90%+ input cost cut)

## Multi-project, multi-agent, multi-model

- Data model assumes *many* projects per user from day one
- Memory is scoped PROJECT *and* PORTFOLIO — cross-project recall is the moat
- Every agent role points to a model config stored in settings; swap without code

## Local dev

```bash
cp .env.example .env.local  # fill in ANTHROPIC_API_KEY, DATABASE_URL, CLERK keys
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Then open http://localhost:3000. Public homepage is just the 48Co wordmark and a
log-in button. Everything interesting is behind auth at `/app`.

## Ecosystem integrations (your products)

Slots reserved in `.env.example` for:

- `CRONTECH_*` — onboarding flow
- `GLUECRON_*` — code hosting / git
- `GATE_TEST_*` — continuous testing / self-monitoring

These integrations are wired in Session 1/2 once one-liner specs land.

## Roadmap

- **Session 1** (current) — Foundation: scaffold, auth, DB, multi-project dashboard, admin shell, pluggable model layer
- **Session 2** — Multi-agent orchestrator, memory tool, cost HUD live, chat UI
- **Session 3** — Generator tools, WebContainers preview, Monaco code view, GitHub/gluecron import
- **Session 4** — One-click deploy, custom domains, snapshots, first dogfood site live

## License

Private. All rights reserved to 48Co.
