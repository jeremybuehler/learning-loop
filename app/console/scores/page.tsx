"use client";
import React, { useEffect, useMemo, useState } from 'react'

type Score = {
  eventId: string
  metric: string
  value: number
  severity: 'OK' | 'WARN' | 'CRIT'
  ts: string
}

export default function ScoresPage() {
  const [items, setItems] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState('')
  const [severity, setSeverity] = useState<'all' | 'OK' | 'WARN' | 'CRIT'>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [intervalMs, setIntervalMs] = useState(10000)

  async function load() {
    setLoading(true)
    const q = new URLSearchParams()
    if (metric) q.set('metric', metric)
    const res = await fetch(`/api/scores?${q.toString()}`, { cache: 'no-store' })
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { if (!autoRefresh) return; const id = setInterval(load, Math.max(2000, intervalMs)); return () => clearInterval(id) }, [autoRefresh, intervalMs, metric])

  const filtered = useMemo(() => items.filter(i => severity === 'all' ? true : i.severity === severity), [items, severity])

  const counts = useMemo(() => {
    return filtered.reduce((acc, i) => { acc[i.severity] = (acc[i.severity] || 0) + 1; return acc }, {} as Record<string, number>)
  }, [filtered])

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Scores</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Auto-refresh</label>
          <input type="checkbox" className="h-4 w-4" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          <select className="rounded-md border px-2 py-1 text-sm" value={intervalMs} onChange={(e) => setIntervalMs(Number(e.target.value))}>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>60s</option>
          </select>
          <button onClick={load} className="rounded-lg border px-3 py-1.5 text-sm">Refresh</button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-600">Metric</label>
          <input value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="accuracy, latency" className="rounded-md border px-2 py-1 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Severity</label>
          <select className="rounded-md border px-2 py-1 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value as any)}>
            <option value="all">All</option>
            <option value="OK">OK</option>
            <option value="WARN">WARN</option>
            <option value="CRIT">CRIT</option>
          </select>
        </div>
      </div>

      {!loading && (
        <div className="flex gap-3 text-sm">
          <span className="rounded-md border px-2 py-1">OK: {counts['OK'] || 0}</span>
          <span className="rounded-md border px-2 py-1">WARN: {counts['WARN'] || 0}</span>
          <span className="rounded-md border px-2 py-1">CRIT: {counts['CRIT'] || 0}</span>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Metric</th>
                <th className="text-left p-2">Value</th>
                <th className="text-left p-2">Severity</th>
                <th className="text-left p-2">Event</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 font-mono text-xs">{new Date(it.ts).toLocaleString()}</td>
                  <td className="p-2">{it.metric}</td>
                  <td className="p-2">{it.value}</td>
                  <td className="p-2">{it.severity}</td>
                  <td className="p-2">{it.eventId}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-gray-500" colSpan={5}>No scores.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

