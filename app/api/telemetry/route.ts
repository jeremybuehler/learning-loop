export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'
import { TelemetrySchema, requireApiKey } from '@/lib/validation'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rateLimit'

export async function GET() {
  const db = await getDb()
  const items = await db.listTelemetry()
  return Response.json({ items })
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
  const db = await getDb()
  await db.addTelemetry({
    timestamp: body.timestamp || new Date().toISOString(),
    source: body.source,
    type: body.type,
    payload: body.payload,
  })
  return Response.json({ ok: true }, { headers: rateLimitHeaders(rl) })
}
