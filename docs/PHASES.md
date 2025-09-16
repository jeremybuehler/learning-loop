# LearningLoop — Phased Delivery Plan

## Phase 0 — Demo Website (Complete)
- Next.js SPA, dark mode, static SVG diagram, live chart
- Contact form with basic validation, Docs tab (flagged)
- CSP implemented with per-request nonces in production

## Phase 1 — Observability MVP (In Progress)
- APIs: `GET/POST /api/telemetry`, `GET/POST /api/feedback`, `GET /api/status`
- Validation: Zod; Auth: `LL_API_KEY` on POST; Rate limits: per IP
- Dashboards: `/console/telemetry`, `/console/feedback` with filters and auto-refresh
- Persistence: Prisma Postgres with in-memory fallback
- KPIs (up next): server-side MTTD/MTTR/Capture% and console display

## Phase 2 — Evaluation Engine (Next)
- Schema: `Score.severity`, `EvaluationConfig` (gt/lt thresholds)
- Library: evaluator (OK/WARN/CRIT), cooldown for alerts
- Endpoints: `/api/evaluate`, `/api/scores`, `/api/eval-config`
- Alerts: webhook (Slack/HTTP) with de-dupe
- Canary eval: Vercel Cron
- Console: scores, config editor, alerts feed

## Phase 3 — Learning Pipeline Integration
- Feedback router to labeling store; retraining triggers; RAG refresh hooks

## Phase 4 — Adaptation Layer (MCP)
- Safe reconfiguration of agents, rollout gates, promotion/rollback

## Phase 5 — HITL & Compliance
- Reviewer UI, audit logs, RBAC/SSO, PII controls

## Phase 6 — Production Hardening
- SLOs/SLA, runbooks, metrics/traces/logs, backups, drills

