"use client";
import React, { useEffect, useMemo, useState } from 'react'

type Feedback = {
  eventId: string
  label: string
  reviewer?: string
  notes?: string
  ts: string
}

export default function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [qEvent, setQEvent] = useState('')
  const [qLabel, setQLabel] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [intervalMs, setIntervalMs] = useState(10000)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/feedback', { cache: 'no-store' })
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
      const byEvent = qEvent ? it.eventId.toLowerCase().includes(qEvent.toLowerCase()) : true
      const byLabel = qLabel ? it.label.toLowerCase().includes(qLabel.toLowerCase()) : true
      return byEvent && byLabel
    })
  }, [items, qEvent, qLabel])

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Feedback</h1>
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
          <label className="block text-xs text-gray-600">Event ID</label>
          <input
            value={qEvent}
            onChange={(e) => setQEvent(e.target.value)}
            placeholder="evt_..."
            className="rounded-md border px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Label</label>
          <input
            value={qLabel}
            onChange={(e) => setQLabel(e.target.value)}
            placeholder="needs-review"
            className="rounded-md border px-2 py-1 text-sm"
          />
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
                <th className="text-left p-2">Event</th>
                <th className="text-left p-2">Label</th>
                <th className="text-left p-2">Reviewer</th>
                <th className="text-left p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 font-mono text-xs">{new Date(it.ts).toLocaleString()}</td>
                  <td className="p-2">{it.eventId}</td>
                  <td className="p-2">{it.label}</td>
                  <td className="p-2">{it.reviewer || '-'}</td>
                  <td className="p-2 max-w-[420px] truncate" title={it.notes}>{it.notes || '-'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-gray-500" colSpan={5}>No feedback matches your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
