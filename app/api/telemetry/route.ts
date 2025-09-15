export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'
import { TelemetrySchema, requireApiKey } from '@/lib/validation'

export async function GET() {
  const db = await getDb()
  const items = await db.listTelemetry()
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

  const parsed = TelemetrySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
  }

  const body = parsed.data
  const db = await getDb()
  await db.addTelemetry({
    timestamp: body.timestamp || new Date().toISOString(),
    source: body.source,
    type: body.type,
    payload: body.payload,
  })
  return Response.json({ ok: true })
}
