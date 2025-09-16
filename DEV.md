# LearningLoop Next.js — Local Dev

## Prereqs
- Node 18+, pnpm installed.

## Setup
- `cp .env.example .env` (toggle `NEXT_PUBLIC_ENABLE_INTERNAL_DOCS=true` if needed)
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
