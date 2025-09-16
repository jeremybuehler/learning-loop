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

// Evaluation inputs/config
export const ScoreInputSchema = z.object({
  eventId: z.string().min(1).max(128),
  metric: z.string().min(1).max(128),
  value: z.number().finite(),
})

export type ScoreInput = z.infer<typeof ScoreInputSchema>

export const EvalConfigSchema = z.object({
  metric: z.string().min(1).max(128),
  comparison: z.enum(['gt', 'lt']).default('gt'),
  warn: z.number().finite(),
  crit: z.number().finite(),
  windowSeconds: z.number().int().min(1).max(86400).default(300),
  enabled: z.boolean().default(true),
}).superRefine((val, ctx) => {
  if (val.comparison === 'gt' && !(val.warn <= val.crit)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['warn'], message: 'For gt, warn should be <= crit' })
  }
  if (val.comparison === 'lt' && !(val.warn >= val.crit)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['warn'], message: 'For lt, warn should be >= crit' })
  }
})

export type EvalConfigInput = z.infer<typeof EvalConfigSchema>
