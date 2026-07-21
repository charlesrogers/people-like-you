'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ChatMessage } from '@/lib/types'

interface EnrichedReport {
  id: string
  reporter_id: string
  reported_id: string
  reporter_name: string | null
  reported_name: string | null
  reported_status: string | null
  reason: string
  details: string | null
  source: string
  status: string
  created_at: string
  transcript: ChatMessage[]
}

export default function AdminReports({ secret }: { secret: string }) {
  const [reports, setReports] = useState<EnrichedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/reports', { headers: { 'x-admin-secret': secret } })
    if (res.ok) setReports((await res.json()).reports)
    setLoading(false)
  }, [secret])

  useEffect(() => { load() }, [load])

  async function act(reportId: string, action: string) {
    const notes = action === 'dismiss' ? undefined : window.prompt(`Notes for "${action}" (optional):`) || undefined
    if (action === 'ban' && !window.confirm('Permanently remove this member?')) return
    setBusy(reportId)
    await fetch('/api/admin/reports', {
      method: 'POST',
      headers: { 'x-admin-secret': secret, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, action, notes }),
    })
    setBusy(null)
    load()
  }

  if (loading) return <p className="text-sm text-stone-500">Loading reports…</p>
  if (reports.length === 0) return <p className="text-sm text-stone-500">No open reports. 🎉</p>

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-semibold text-stone-900">Open reports ({reports.length})</h2>
      {reports.map(r => (
        <div key={r.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-stone-900">
                {r.reason.replace(/_/g, ' ')}
                {r.source === 'auto_moderation' && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">auto</span>}
              </p>
              <p className="mt-0.5 text-xs text-stone-500">
                {r.reporter_name ?? '?'} reported {r.reported_name ?? '?'}
                {r.reported_status && r.reported_status !== 'active' && (
                  <span className="ml-1 text-red-600">({r.reported_status})</span>
                )}
                {' · '}{new Date(r.created_at).toLocaleString()}
              </p>
              {r.details && <p className="mt-2 text-sm text-stone-700">{r.details}</p>}
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button disabled={busy === r.id} onClick={() => act(r.id, 'dismiss')} className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs hover:bg-stone-50">Dismiss</button>
              <button disabled={busy === r.id} onClick={() => act(r.id, 'warn')} className="rounded-lg border border-amber-200 px-2.5 py-1 text-xs text-amber-700 hover:bg-amber-50">Warn</button>
              <button disabled={busy === r.id} onClick={() => act(r.id, 'pause')} className="rounded-lg border border-orange-200 px-2.5 py-1 text-xs text-orange-700 hover:bg-orange-50">Pause</button>
              <button disabled={busy === r.id} onClick={() => act(r.id, 'ban')} className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700">Ban</button>
            </div>
          </div>

          {r.transcript.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-stone-500">Transcript ({r.transcript.length})</summary>
              <div className="mt-2 space-y-1 rounded-lg bg-stone-50 p-3">
                {r.transcript.map(m => (
                  <p key={m.id} className="text-xs text-stone-700">
                    <span className={m.sender_id === r.reported_id ? 'font-semibold text-red-600' : 'text-stone-500'}>
                      {m.sender_id === r.reported_id ? (r.reported_name ?? 'reported') : (r.reporter_name ?? 'reporter')}:
                    </span>{' '}
                    {m.content}
                  </p>
                ))}
              </div>
            </details>
          )}
        </div>
      ))}
    </div>
  )
}
