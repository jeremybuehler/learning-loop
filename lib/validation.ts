import { z } from 'zod'

export const TelemetrySchema = z.object({
  timestamp: z.string().datetime().optional().or(z.string().length(0)).optional(),
  source: z.string().min(1).max(64),
  type: z.enum(['metric', 'event', 'trace']).default('event'),
  payload: z.record(z.any()).default({}),
})

export type TelemetryInput = z.infer<typeof TelemetrySchema>

export const FeedbackSchema = z.object({
  eventId: z.string().min(1).max(128),
  label: z.string().min(1).max(128),
  reviewer: z.string().min(1).max(128).optional(),
  notes: z.string().max(2000).optional(),
})

export type FeedbackInput = z.infer<typeof FeedbackSchema>

export function requireApiKey(req: Request): Response | null {
  const expected = process.env.LL_API_KEY
  if (!expected) return null // not enforced when unset
  const got = req.headers.get('x-ll-key') || ''
  if (got !== expected) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }
  return null
}

