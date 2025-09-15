"use client";
import React, { useEffect, useState } from 'react'

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

  async function load() {
    setLoading(true)
    const res = await fetch('/api/feedback', { cache: 'no-store' })
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feedback</h1>
        <button onClick={load} className="rounded-lg border px-3 py-1.5 text-sm">Refresh</button>
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
              {items.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 font-mono text-xs">{new Date(it.ts).toLocaleString()}</td>
                  <td className="p-2">{it.eventId}</td>
                  <td className="p-2">{it.label}</td>
                  <td className="p-2">{it.reviewer || '-'}</td>
                  <td className="p-2 max-w-[420px] truncate" title={it.notes}>{it.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

