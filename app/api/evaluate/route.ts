export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'
import { ScoreInputSchema, requireApiKey } from '@/lib/validation'
import { evaluate } from '@/lib/evaluator'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rateLimit'
import { maybeSendAlert } from '@/lib/alerts'

export async function POST(req: Request) {
  const keyErr = requireApiKey(req)
  if (keyErr) return keyErr

  const rl = checkRateLimit(req, 'evaluate', { limit: Number(process.env.LL_RL_EVAL_LIMIT || 60), windowMs: Number(process.env.LL_RL_WINDOW_MS || 60_000) })
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Too Many Requests' }), { status: 429, headers: { 'content-type': 'application/json', 'Retry-After': String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))), ...rateLimitHeaders(rl) } })
  }

  let json: any
  try { json = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: rateLimitHeaders(rl) }) }
  const parsed = ScoreInputSchema.safeParse(json)
  if (!parsed.success) return Response.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400, headers: rateLimitHeaders(rl) })

  const input = parsed.data
  const db = await getDb()
  const cfg = await db.getEvalConfig(input.metric)
  const scored = evaluate(input, cfg)
  await db.addScore({ ...input, severity: scored.severity })

  if (scored.severity === 'CRIT' || scored.severity === 'WARN') {
    await maybeSendAlert({ eventId: input.eventId, metric: input.metric, value: input.value, severity: scored.severity, ts: new Date().toISOString() })
  }

  return Response.json({ ok: true, severity: scored.severity }, { headers: rateLimitHeaders(rl) })
}

