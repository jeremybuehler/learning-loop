type AlertPayload = {
  eventId: string
  metric: string
  value: number
  severity: 'WARN' | 'CRIT'
  ts: string
}

const lastSent = new Map<string, number>() // key: metric:severity

export async function maybeSendAlert(p: AlertPayload) {
  const url = process.env.ALERT_WEBHOOK_URL
  if (!url) return
  const cooldownSec = Number(process.env.ALERT_COOLDOWN_SEC || 300)
  const key = `${p.metric}:${p.severity}`
  const now = Date.now()
  const last = lastSent.get(key) || 0
  if (now - last < cooldownSec * 1000) return
  lastSent.set(key, now)
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(p),
      keepalive: true,
    })
  } catch {
    // best effort
  }
}

