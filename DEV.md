# LearningLoop — Local Dev

## Prereqs
- Node 18.17+ (Node 20 recommended)
- npm

## Setup
- `cp .env.example .env`
- Set `NEXT_PUBLIC_ENABLE_INTERNAL_DOCS=true` to show internal docs
- `npm install`

## Database (Postgres via Prisma)
- Set `DATABASE_URL` in `.env` (pooled connection string recommended)
- Initialize schema: `npm run db:migrate` (or `npm run db:push` for dev)
- Generate client: `npm run prisma:generate`
- Inspect data: `npm run db:studio`

## Run
- `npm run dev` → open the local URL
- Console pages: `/console`, `/console/telemetry`, `/console/feedback`

Notes
- API routes use Prisma if available; otherwise they fall back to in-memory storage.

## Environment Variables
- `NEXT_PUBLIC_ENABLE_INTERNAL_DOCS` (optional): show/hide Docs tab
- `LL_API_KEY` (recommended in prod): required header `x-ll-key` on POST endpoints
- `DATABASE_URL` (optional): enables Postgres persistence
- Rate limiting (defaults shown):
  - `LL_RL_WINDOW_MS=60000`
  - `LL_RL_TELEMETRY_LIMIT=60`
  - `LL_RL_FEEDBACK_LIMIT=30`
  - `LL_TELEMETRY_SAMPLE_RATE=1`

Copy `.env.example` to `.env` and set values per environment.

## API Endpoints
- `GET /api/status` → `{ status, mttd_hours, mttr_days }`
- `GET /api/telemetry` → `{ items, stats }` (returns last 100 records plus summary counts)
- `POST /api/telemetry` → `{ ok: true, sampled? }` (Zod validation, rate-limited, requires `x-ll-key` if `LL_API_KEY` set, honors `LL_TELEMETRY_SAMPLE_RATE`)
- `GET /api/feedback` → `{ items, stats }`
- `POST /api/feedback` → `{ ok: true }` (Zod validation, rate-limited, requires `x-ll-key` if `LL_API_KEY` set)
- Phase 2 (incoming): `/api/evaluate`, `/api/scores`, `/api/eval-config`

## Dashboards
- Telemetry: `/console/telemetry` — filters (source/type), summary tiles, auto-refresh
- Feedback: `/console/feedback` — filters (event/label), summary tiles, auto-refresh

## Security & CSP
- Production CSP is nonce-based via `middleware.ts` with `script-src 'self' 'nonce-...' 'strict-dynamic'`
- Dev CSP relaxed for HMR. No secrets in client code.

## Deployments (Vercel)
- Use Vercel Git Integration; repo root is the Next.js app
- Set environment variables in Project Settings
- Database: set `DATABASE_URL` (pooled) and run `npm run db:deploy` locally to prepare migrations

## Roadmap (Phases)
- Phase 0 (Complete): Demo site (SPA, diagram, live chart, Docs)
- Phase 1 (Complete): Observability MVP (hardened APIs, validation, rate limits, Postgres persistence, sampling, dashboards, KPIs)
- Phase 2 (Next): Evaluation engine (scores, thresholds, alerts, cron, console)
