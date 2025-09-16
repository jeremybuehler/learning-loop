"use client";
import React, { useEffect, useMemo, useState } from 'react'

type Telemetry = {
  timestamp: string
  source: string
  type: 'metric' | 'event' | 'trace' | string
  payload: any
}

export default function TelemetryPage() {
  const [items, setItems] = useState<Telemetry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSource, setFilterSource] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'metric' | 'event' | 'trace'>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [intervalMs, setIntervalMs] = useState(10000)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/telemetry', { cache: 'no-store' })
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(load, Math.max(2000, intervalMs))
    return () => clearInterval(id)
  }, [autoRefresh, intervalMs])

  const filtered = useMemo(() => {
    return items.filter(it => {
      const bySource = filterSource ? it.source.toLowerCase().includes(filterSource.toLowerCase()) : true
      const byType = filterType === 'all' ? true : it.type === filterType
      return bySource && byType
    })
  }, [items, filterSource, filterType])

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Telemetry</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Auto-refresh</label>
          <input type="checkbox" className="h-4 w-4" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            aria-label="Auto refresh interval"
          >
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
          <label className="block text-xs text-gray-600">Source</label>
          <input
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            placeholder="e.g. web, api, worker"
            className="rounded-md border px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Type</label>
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="metric">metric</option>
            <option value="event">event</option>
            <option value="trace">trace</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Time</th>
                <th className="text-left p-2">Source</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Payload</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 font-mono text-xs">{new Date(it.timestamp).toLocaleString()}</td>
                  <td className="p-2">{it.source}</td>
                  <td className="p-2">{it.type}</td>
                  <td className="p-2 font-mono text-xs whitespace-pre-wrap">{JSON.stringify(it.payload)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-gray-500" colSpan={4}>No telemetry matches your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
