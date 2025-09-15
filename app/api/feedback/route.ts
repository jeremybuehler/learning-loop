export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = await getDb()
  const items = await db.listFeedback()
  return Response.json({ items })
}

export async function POST(req: Request) {
  const body = (await req.json()) as any
  const db = await getDb()
  await db.addFeedback({
    eventId: body.eventId || 'unknown',
    label: body.label || 'unlabeled',
    reviewer: body.reviewer,
    notes: body.notes,
  })
  return Response.json({ ok: true })
}
