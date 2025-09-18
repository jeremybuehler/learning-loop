export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'
import { FeedbackSchema, requireApiKey } from '@/lib/validation'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rateLimit'

type FeedbackStats = {
  total: number
  byLabel: Array<{ label: string; count: number }>
  reviewers: Array<{ reviewer: string; count: number }>
}

function buildFeedbackStats(items: Array<{ label: string; reviewer?: string }>): FeedbackStats {
  const labelCounts = new Map<string, number>()
  const reviewerCounts = new Map<string, number>()

  for (const item of items) {
    labelCounts.set(item.label, (labelCounts.get(item.label) ?? 0) + 1)
    if (item.reviewer) {
      reviewerCounts.set(item.reviewer, (reviewerCounts.get(item.reviewer) ?? 0) + 1)
    }
  }

  const byLabel = Array.from(labelCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }))

  const reviewers = Array.from(reviewerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reviewer, count]) => ({ reviewer, count }))

  return {
    total: items.length,
    byLabel,
    reviewers,
  }
}

export async function GET() {
  const db = await getDb()
  const items = await db.listFeedback()
  return Response.json({ items, stats: buildFeedbackStats(items) })
}

export async function POST(req: Request) {
  const keyErr = requireApiKey(req)
  if (keyErr) return keyErr

  // Basic rate limiting per IP for this route
  const rl = checkRateLimit(req, 'feedback', { limit: Number(process.env.LL_RL_FEEDBACK_LIMIT || 30), windowMs: Number(process.env.LL_RL_WINDOW_MS || 60_000) })
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

  const parsed = FeedbackSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400, headers: rateLimitHeaders(rl) })
  }

  const body = parsed.data
  const db = await getDb()
  await db.addFeedback({
    eventId: body.eventId,
    label: body.label,
    reviewer: body.reviewer,
    notes: body.notes,
  })
  return Response.json({ ok: true }, { headers: rateLimitHeaders(rl) })
}
