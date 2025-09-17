"use client";
import React, { useEffect, useState } from 'react'

type Config = {
  metric: string
  comparison: 'gt' | 'lt'
  warn: number
  crit: number
  windowSeconds: number
  enabled: boolean
  updatedAt?: string
}

export default function ConfigPage() {
  const [items, setItems] = useState<Config[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Config>({ metric: '', comparison: 'gt', warn: 0.5, crit: 0.8, windowSeconds: 300, enabled: true })
  const [apiKey, setApiKey] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/eval-config', { cache: 'no-store' })
    const data = await res.json()
    setItems(data.configs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    setMessage('')
    const res = await fetch('/api/eval-config', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(apiKey ? { 'x-ll-key': apiKey } : {}) },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setMessage(`Save failed: ${res.status} ${err.error || ''}`)
      return
    }
    setMessage('Saved ✔')
    await load()
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Evaluation Config</h1>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-600">Metric</label>
            <input className="rounded-md border px-2 py-1 text-sm" value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })} placeholder="accuracy" />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Comparison</label>
            <select className="rounded-md border px-2 py-1 text-sm" value={form.comparison} onChange={(e) => setForm({ ...form, comparison: e.target.value as any })}>
              <option value="gt">gt</option>
              <option value="lt">lt</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600">Warn</label>
            <input type="number" step="any" className="rounded-md border px-2 py-1 text-sm w-28" value={form.warn} onChange={(e) => setForm({ ...form, warn: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Crit</label>
            <input type="number" step="any" className="rounded-md border px-2 py-1 text-sm w-28" value={form.crit} onChange={(e) => setForm({ ...form, crit: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Window (s)</label>
            <input type="number" className="rounded-md border px-2 py-1 text-sm w-28" value={form.windowSeconds} onChange={(e) => setForm({ ...form, windowSeconds: Number(e.target.value) })} />
          </div>
          <div className="flex items-center gap-2">
            <input id="enabled" type="checkbox" className="h-4 w-4" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
            <label htmlFor="enabled" className="text-sm">Enabled</label>
          </div>
          <div>
            <label className="block text-xs text-gray-600">API Key (for save)</label>
            <input className="rounded-md border px-2 py-1 text-sm" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="LL_API_KEY" />
          </div>
          <button onClick={save} className="rounded-lg border px-3 py-1.5 text-sm">Save / Upsert</button>
        </div>
        {message && <div className="text-sm text-gray-700">{message}</div>}
      </div>

      {loading ? (
        <div className="text-sm text-gray-600">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Metric</th>
                <th className="text-left p-2">Cmp</th>
                <th className="text-left p-2">Warn</th>
                <th className="text-left p-2">Crit</th>
                <th className="text-left p-2">Window</th>
                <th className="text-left p-2">Enabled</th>
                <th className="text-left p-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.metric} className="border-t cursor-pointer hover:bg-gray-50" onClick={() => setForm(c)}>
                  <td className="p-2">{c.metric}</td>
                  <td className="p-2">{c.comparison}</td>
                  <td className="p-2">{c.warn}</td>
                  <td className="p-2">{c.crit}</td>
                  <td className="p-2">{c.windowSeconds}s</td>
                  <td className="p-2">{c.enabled ? 'Yes' : 'No'}</td>
                  <td className="p-2">{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-gray-500" colSpan={7}>No configs. Create one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

