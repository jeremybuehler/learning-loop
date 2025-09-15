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

const mem = {
  telemetry: [] as Telemetry[],
  feedback: [] as (Feedback & { ts: string })[],
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
  }
}
