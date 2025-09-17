export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'
import { EvalConfigSchema, requireApiKey } from '@/lib/validation'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rateLimit'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const metric = url.searchParams.get('metric') || undefined
  const db = await getDb()
  if (metric) {
    const cfg = await db.getEvalConfig(metric)
    return Response.json({ config: cfg })
  }
  const configs = await db.listEvalConfigs()
  return Response.json({ configs })
}

export async function POST(req: Request) {
  const keyErr = requireApiKey(req)
  if (keyErr) return keyErr
  const rl = checkRateLimit(req, 'eval-config', { limit: Number(process.env.LL_RL_CONFIG_LIMIT || 30), windowMs: Number(process.env.LL_RL_WINDOW_MS || 60_000) })
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Too Many Requests' }), { status: 429, headers: { 'content-type': 'application/json', 'Retry-After': String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))), ...rateLimitHeaders(rl) } })
  }
  let json: any
  try { json = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: rateLimitHeaders(rl) }) }
  const parsed = EvalConfigSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400, headers: rateLimitHeaders(rl) })
  const db = await getDb()
  const saved = await db.upsertEvalConfig(parsed.data)
  return Response.json({ ok: true, config: saved }, { headers: rateLimitHeaders(rl) })
}

