# LearningLoop Next.js — Local Dev

## Prereqs
- Node 18+, pnpm installed.

## Setup
- `cd learning-loop-next`
- `cp .env.example .env` (toggle `NEXT_PUBLIC_ENABLE_INTERNAL_DOCS=true` if needed)
- `pnpm install`

## Database (SQLite via Prisma)
- Initialize schema: `pnpm db:push` (or `pnpm db:migrate` to create a named migration)
- Generate client: `pnpm prisma:generate`
- Inspect data: `pnpm db:studio`

## Run
- `pnpm dev` → open the local URL
- Console pages: `/console`, `/console/telemetry`, `/console/feedback`

Notes
- API routes use Prisma if available; otherwise they fall back to in-memory storage.
- The Vite sandbox remains available at `sandbox/learning-loop-vite/` for quick UI tinkering.
