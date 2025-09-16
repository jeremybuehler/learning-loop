// Lightweight DB adapter with Prisma (if available) or in-memory fallback

type Telemetry = {
  timestamp: string
  source: string
  type: 'metric' | 'event' | 'trace'
  payload: Record<string, any>
}

type Feedback = {
  eventId: string
  label: string
  reviewer?: string
  notes?: string
}

type Severity = 'OK' | 'WARN' | 'CRIT'
type Score = {
  eventId: string
  metric: string
  value: number
  severity?: Severity
  ts?: string
}

type EvaluationConfig = {
  metric: string
  comparison: 'gt' | 'lt'
  warn: number
  crit: number
  windowSeconds: number
  enabled: boolean
  updatedAt?: string
}

const mem = {
  telemetry: [] as Telemetry[],
  feedback: [] as (Feedback & { ts: string })[],
  scores: [] as (Score & { ts: string; severity: Severity })[],
  configs: new Map<string, EvaluationConfig>(),
}

let prismaSingleton: any = null
async function getPrisma() {
  // Skip Prisma when no DATABASE_URL is set to avoid constructor errors
  if (!process.env.DATABASE_URL) return null
  if (prismaSingleton) return prismaSingleton
  try {
    const mod = await import('@prisma/client') as any
    prismaSingleton = new (mod as any).PrismaClient()
    return prismaSingleton
  } catch {
    return null
  }
}

export async function getDb() {
  const prisma = await getPrisma()
  if (prisma) {
    return {
      async listTelemetry() {
        const rows = await prisma.telemetry.findMany({ orderBy: { timestamp: 'desc' }, take: 100 })
        return rows.map((r: any) => ({ timestamp: r.timestamp.toISOString(), source: r.source, type: r.type, payload: r.payload }))
      },
      async addTelemetry(item: Telemetry) {
        await prisma.telemetry.create({ data: { timestamp: new Date(item.timestamp || Date.now()), source: item.source, type: item.type, payload: item.payload } })
      },
      async listFeedback() {
        const rows = await prisma.feedback.findMany({ orderBy: { ts: 'desc' }, take: 100 })
        return rows.map((r: any) => ({ eventId: r.eventId, label: r.label, reviewer: r.reviewer ?? undefined, notes: r.notes ?? undefined, ts: r.ts.toISOString() }))
      },
      async addFeedback(item: Feedback) {
        await prisma.feedback.create({ data: { eventId: item.eventId, label: item.label, reviewer: item.reviewer, notes: item.notes } })
      },
      async listScores(metric?: string, limit = 100) {
        const rows = await prisma.score.findMany({
          where: metric ? { metric } : undefined,
          orderBy: { ts: 'desc' },
          take: limit,
        })
        return rows.map((r: any) => ({ eventId: r.eventId, metric: r.metric, value: r.value, severity: r.severity as Severity, ts: r.ts.toISOString() }))
      },
      async addScore(s: Score) {
        await prisma.score.create({ data: { eventId: s.eventId, metric: s.metric, value: s.value, severity: (s.severity || 'OK') as any } })
      },
      async getEvalConfig(metric: string) {
        const c = await prisma.evaluationConfig.findUnique({ where: { metric } })
        if (!c) return null
        return { metric: c.metric, comparison: c.comparison as 'gt' | 'lt', warn: c.warn, crit: c.crit, windowSeconds: c.windowSeconds, enabled: c.enabled, updatedAt: c.updatedAt.toISOString() } as EvaluationConfig
      },
      async upsertEvalConfig(cfg: EvaluationConfig) {
        const c = await prisma.evaluationConfig.upsert({
          where: { metric: cfg.metric },
          create: { metric: cfg.metric, comparison: cfg.comparison as any, warn: cfg.warn, crit: cfg.crit, windowSeconds: cfg.windowSeconds, enabled: cfg.enabled },
          update: { comparison: cfg.comparison as any, warn: cfg.warn, crit: cfg.crit, windowSeconds: cfg.windowSeconds, enabled: cfg.enabled },
        })
        return { metric: c.metric, comparison: c.comparison as 'gt' | 'lt', warn: c.warn, crit: c.crit, windowSeconds: c.windowSeconds, enabled: c.enabled, updatedAt: c.updatedAt.toISOString() } as EvaluationConfig
      },
    }
  }
  // Fallback: in-memory store
  return {
      async listTelemetry() {
        return mem.telemetry.slice(-100).reverse()
      },
      async addTelemetry(item: Telemetry) {
        mem.telemetry.push({ ...item, timestamp: item.timestamp || new Date().toISOString() })
      },
      async listFeedback() {
        return mem.feedback.slice(-100).reverse()
      },
      async addFeedback(item: Feedback) {
        mem.feedback.push({ ...item, ts: new Date().toISOString() })
      },
      async listScores(metric?: string, limit = 100) {
        const all = mem.scores
        const filtered = metric ? all.filter(s => s.metric === metric) : all
        return filtered.slice(-limit).reverse()
      },
      async addScore(s: Score) {
        mem.scores.push({ eventId: s.eventId, metric: s.metric, value: s.value, severity: s.severity || 'OK', ts: new Date().toISOString() })
      },
      async getEvalConfig(metric: string) {
        return mem.configs.get(metric) || null
      },
      async upsertEvalConfig(cfg: EvaluationConfig) {
        const withTs = { ...cfg, updatedAt: new Date().toISOString() }
        mem.configs.set(cfg.metric, withTs)
        return withTs
      },
  }
}
