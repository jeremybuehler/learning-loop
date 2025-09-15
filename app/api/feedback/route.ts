export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'
import { FeedbackSchema, requireApiKey } from '@/lib/validation'

export async function GET() {
  const db = await getDb()
  const items = await db.listFeedback()
  return Response.json({ items })
}

export async function POST(req: Request) {
  const keyErr = requireApiKey(req)
  if (keyErr) return keyErr

  let json: any
  try {
    json = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = FeedbackSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const body = parsed.data
  const db = await getDb()
  await db.addFeedback({
    eventId: body.eventId,
    label: body.label,
    reviewer: body.reviewer,
    notes: body.notes,
  })
  return Response.json({ ok: true })
}
