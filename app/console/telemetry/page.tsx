"use client";
import React, { useEffect, useState } from 'react'

type Telemetry = {
  timestamp: string
  source: string
  type: string
  payload: any
}

export default function TelemetryPage() {
  const [items, setItems] = useState<Telemetry[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/telemetry', { cache: 'no-store' })
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Telemetry</h1>
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
                <th className="text-left p-2">Source</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Payload</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2 font-mono text-xs">{new Date(it.timestamp).toLocaleString()}</td>
                  <td className="p-2">{it.source}</td>
                  <td className="p-2">{it.type}</td>
                  <td className="p-2 font-mono text-xs whitespace-pre-wrap">{JSON.stringify(it.payload)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

