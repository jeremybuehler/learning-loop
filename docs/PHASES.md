# LearningLoop — Phased Delivery Plan

## Phase 0 — Demo Website (Complete)
- Next.js SPA, dark mode, static SVG diagram, live chart
- Contact form with basic validation, Docs tab (flagged)
- CSP implemented with per-request nonces in production

## Phase 1 — Observability MVP (Complete)
- Hardened APIs: `GET/POST /api/telemetry`, `GET/POST /api/feedback`, `GET /api/status`
- Protections: Zod validation, optional `LL_API_KEY`, per-IP rate limits, adaptive sampling env control
- Dashboards: `/console/telemetry`, `/console/feedback` with filters, summary tiles, auto-refresh
- Persistence: Prisma Postgres with in-memory fallback for local/dev usage
- Next enhancements: server-side KPIs (MTTD/MTTR/Capture%) and console visualisation

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
