'use client'

import { useCallback, useEffect, useState } from 'react'

interface MetroRow {
  key: string; name: string
  total: number; women: number; men: number; unknown: number
  ratio: number | null
  minWomen: number; minTotal: number; maxRatio: number
  womenGap: number; totalGap: number; ready: boolean; pctWomen: number
}
interface Bucket { total: number; women: number; men: number; unknown: number }
interface Data { metros: MetroRow[]; unassigned: Bucket; totals: Bucket }

export default function WaitlistDashboard() {
  const [secret, setSecret] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('ply_admin_secret')
    if (stored) setSecret(stored)
  }, [])

  const load = useCallback(async (s: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/waitlist', { headers: { 'x-admin-secret': s } })
      if (res.status === 401) {
        sessionStorage.removeItem('ply_admin_secret'); setSecret(null); setAuthError(true); return
      }
      setData(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (secret) load(secret) }, [secret, load])

  if (!secret) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="w-full max-w-sm space-y-4 rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">Admin Access</h1>
          <input
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { sessionStorage.setItem('ply_admin_secret', password); setSecret(password); setAuthError(false) } }}
            className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm focus:border-stone-400 focus:outline-none"
          />
          {authError && <p className="text-sm text-red-500">Invalid password</p>}
          <button
            onClick={() => { sessionStorage.setItem('ply_admin_secret', password); setSecret(password); setAuthError(false) }}
            className="w-full rounded-lg bg-stone-900 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
          >Enter</button>
        </div>
      </div>
    )
  }

  const active = (data?.metros ?? []).filter(m => m.total > 0)
  const empty = (data?.metros ?? []).filter(m => m.total === 0)

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Waitlist — launch readiness</h1>
            <p className="text-[12px] text-stone-500">Which city crosses its gate first. Women are the binding side.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin" className="text-sm text-stone-500 hover:text-stone-800">← Admin</a>
            <button onClick={() => load(secret)} disabled={loading} className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-50 disabled:opacity-50">
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {data && (
          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-lg bg-white border border-stone-200 px-3 py-2"><b>{data.totals.total}</b> total signups</span>
            <span className="rounded-lg bg-white border border-stone-200 px-3 py-2"><b>{data.totals.women}</b> women · <b>{data.totals.men}</b> men</span>
            <span className="rounded-lg bg-white border border-stone-200 px-3 py-2"><b>{data.unassigned.total}</b> unassigned ZIP</span>
          </div>
        )}

        {active.length === 0 && <p className="text-sm text-stone-500">No signups in a named metro yet.</p>}

        <div className="space-y-2">
          {active.map(m => (
            <div key={m.key} className={`rounded-xl border bg-white p-4 ${m.ready ? 'border-emerald-300' : 'border-stone-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900">{m.name}</span>
                  {m.ready && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">READY</span>}
                </div>
                <div className="text-[12px] text-stone-500">
                  <b className="text-stone-800">{m.total}</b> signups · <b className="text-stone-800">{m.women}</b>W / <b className="text-stone-800">{m.men}</b>M
                  {m.ratio !== null && <> · ratio <b className={m.ratio <= m.maxRatio ? 'text-emerald-600' : 'text-red-600'}>{m.ratio.toFixed(2)}:1</b></>}
                </div>
              </div>
              {/* Women-to-gate progress */}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                <div className={`h-full ${m.ready ? 'bg-emerald-500' : 'bg-stone-800'}`} style={{ width: `${m.pctWomen}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                {m.women}/{m.minWomen} women{m.womenGap > 0 ? ` · ${m.womenGap} to go` : ' ✓'}
                {m.totalGap > 0 && ` · needs ${m.totalGap} more total`}
                {' · '}gate: {m.minWomen}W, {m.minTotal} total, ≤{m.maxRatio}:1
              </p>
            </div>
          ))}
        </div>

        {empty.length > 0 && (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-stone-500">Metros with no signups yet ({empty.length})</summary>
            <p className="mt-2 text-[12px] text-stone-400">{empty.map(m => m.name).join(' · ')}</p>
          </details>
        )}
      </div>
    </div>
  )
}
