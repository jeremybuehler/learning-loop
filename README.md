# LearningLoop

A Next.js (App Router, TypeScript, Tailwind) site that showcases the LearningLoop vision and provides minimal APIs and dashboards for observability and evaluation.

- App: Next.js at repo root
- Docs: see `DEV.md` for setup, env vars, API endpoints, and deployment

## Quick Start
- `cp .env.example .env`
- `npm install`
- `npm run dev` → open http://localhost:3000

## Deployments
- Vercel Git Integration (recommended)
- Set env vars in Project Settings (e.g., `LL_API_KEY`, optional `DATABASE_URL`)

## Features
- Marketing/demo SPA with dark mode, static SVG diagram, live chart
- APIs for telemetry and feedback (Zod validation, API key, rate limits, adaptive sampling)
- Console dashboards with filters, summaries, and auto-refresh
- Nonce-based CSP in production, relaxed dev CSP for HMR

## Roadmap (Phases)
- Phase 0 (Complete): Demo site
- Phase 1 (Complete): Observability MVP (hardened APIs, Postgres persistence, telemetry sampling, dashboards)
- Phase 2 (Next): Evaluation Engine (scores, thresholds, alerts, cron)
