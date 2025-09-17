export const dynamic = 'force-dynamic'
import { getDb } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const metric = url.searchParams.get('metric') || undefined
  const limit = Number(url.searchParams.get('limit') || 100)
  const db = await getDb()
  const items = await db.listScores(metric, Math.min(Math.max(1, limit), 500))
  return Response.json({ items })
}

