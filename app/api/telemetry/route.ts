export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'
import { TelemetrySchema, requireApiKey } from '@/lib/validation'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rateLimit'

type TelemetryStats = {
  total: number
  byType: Record<string, number>
  topSources: Array<{ source: string; count: number }>
  sampleRate: number
}

function parseSampleRate(): number {
  const raw = Number(process.env.LL_TELEMETRY_SAMPLE_RATE ?? '1')
  if (!Number.isFinite(raw)) return 1
  return Math.min(Math.max(raw, 0), 1)
}

function buildTelemetryStats(items: Array<{ source: string; type: string }>): TelemetryStats {
  const byType = items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sourceCounts = new Map<string, number>()
  for (const item of items) {
    sourceCounts.set(item.source, (sourceCounts.get(item.source) ?? 0) + 1)
  }

  const topSources = Array.from(sourceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }))

  return {
    total: items.length,
    byType,
    topSources,
    sampleRate: parseSampleRate(),
  }
}

export async function GET() {
  const db = await getDb()
  const items = await db.listTelemetry()
  return Response.json({ items, stats: buildTelemetryStats(items) })
}

export async function POST(req: Request) {
  const keyErr = requireApiKey(req)
  if (keyErr) return keyErr

  // Basic rate limiting per IP for this route
  const rl = checkRateLimit(req, 'telemetry', { limit: Number(process.env.LL_RL_TELEMETRY_LIMIT || 60), windowMs: Number(process.env.LL_RL_WINDOW_MS || 60_000) })
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
      status: 429,
      headers: { 'content-type': 'application/json', 'Retry-After': String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))), ...rateLimitHeaders(rl) },
    })
  }

  let json: any
  try {
    json = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: rateLimitHeaders(rl) })
  }

  const parsed = TelemetrySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400, headers: rateLimitHeaders(rl) })
  }

  const body = parsed.data
  const sampleRate = parseSampleRate()
  if (sampleRate > 0 && sampleRate < 1) {
    if (Math.random() > sampleRate) {
      return Response.json({ ok: true, sampled: true }, { headers: rateLimitHeaders(rl) })
    }
  }
  if (sampleRate === 0) {
    return Response.json({ ok: true, sampled: true }, { headers: rateLimitHeaders(rl) })
  }
  const db = await getDb()
  await db.addTelemetry({
    timestamp: body.timestamp || new Date().toISOString(),
    source: body.source,
    type: body.type,
    payload: body.payload,
  })
  return Response.json({ ok: true }, { headers: rateLimitHeaders(rl) })
}
