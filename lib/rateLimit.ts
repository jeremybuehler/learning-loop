type RateLimitOptions = {
  limit: number
  windowMs: number
}

type Counter = {
  count: number
  resetAt: number
}

// In-memory fixed-window counters keyed by identifier
const store = new Map<string, Counter>()

function now(): number {
  return Date.now()
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
  limit: number
}

function parseIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || ''
  const ip = xff.split(',')[0].trim()
  return ip || '127.0.0.1'
}

export function checkRateLimit(req: Request, key: string, opts: RateLimitOptions): RateLimitResult {
  const ip = parseIp(req)
  const windowStart = Math.floor(now() / opts.windowMs) * opts.windowMs
  const mapKey = `${ip}:${key}:${windowStart}`
  const entry = store.get(mapKey)
  if (!entry) {
    // Prune occasionally to avoid unbounded growth
    if (store.size > 5000) {
      const t = now()
      for (const [k, v] of store.entries()) {
        if (v.resetAt <= t) store.delete(k)
      }
    }
    const resetAt = windowStart + opts.windowMs
    store.set(mapKey, { count: 1, resetAt })
    return { allowed: true, remaining: opts.limit - 1, resetAt, limit: opts.limit }
  }
  entry.count += 1
  const remaining = Math.max(0, opts.limit - entry.count)
  const allowed = entry.count <= opts.limit
  return { allowed, remaining, resetAt: entry.resetAt, limit: opts.limit }
}

export function rateLimitHeaders(res: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(res.limit),
    'X-RateLimit-Remaining': String(res.remaining),
    'X-RateLimit-Reset': String(Math.floor(res.resetAt / 1000)),
  }
}

