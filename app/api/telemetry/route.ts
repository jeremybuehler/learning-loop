export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = await getDb()
  const items = await db.listTelemetry()
  return Response.json({ items })
}

export async function POST(req: Request) {
  const body = (await req.json()) as any
  const db = await getDb()
  await db.addTelemetry({
    timestamp: body.timestamp || new Date().toISOString(),
    source: body.source || 'unknown',
    type: body.type || 'event',
    payload: body.payload || {},
  })
  return Response.json({ ok: true })
}
