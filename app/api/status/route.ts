export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({ status: 'ok', mttd_hours: 12, mttr_days: 3 })
}

