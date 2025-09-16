export type Severity = 'OK' | 'WARN' | 'CRIT'
export type Comparison = 'gt' | 'lt'

export type EvaluationConfig = {
  metric: string
  comparison: Comparison
  warn: number
  crit: number
  windowSeconds: number
  enabled: boolean
}

export type ScoreInput = {
  eventId: string
  metric: string
  value: number
}

export type Scored = ScoreInput & { severity: Severity }

export function computeSeverity(value: number, cfg: EvaluationConfig | null): Severity {
  if (!cfg || !cfg.enabled) return 'OK'
  if (cfg.comparison === 'gt') {
    if (value >= cfg.crit) return 'CRIT'
    if (value >= cfg.warn) return 'WARN'
    return 'OK'
  } else {
    if (value <= cfg.crit) return 'CRIT'
    if (value <= cfg.warn) return 'WARN'
    return 'OK'
  }
}

export function evaluate(input: ScoreInput, cfg: EvaluationConfig | null): Scored {
  const severity = computeSeverity(input.value, cfg)
  return { ...input, severity }
}

