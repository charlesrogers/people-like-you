'use client'

import { useState } from 'react'
import type { ReportReason } from '@/lib/types'

interface Props {
  userId: string
  targetUserId: string
  targetName: string
  mutualMatchId?: string
  onBlocked?: () => void
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'inappropriate_messages', label: 'Inappropriate messages' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate_photos', label: 'Inappropriate photos' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'married_or_taken', label: 'Married or in a relationship' },
  { value: 'spam_or_scam', label: 'Spam or scam' },
  { value: 'underage', label: 'Appears underage' },
  { value: 'safety_concern', label: 'Safety concern' },
  { value: 'other', label: 'Something else' },
]

export default function SafetyMenu({ userId, targetUserId, targetName, mutualMatchId, onBlocked }: Props) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'menu' | 'block' | 'report' | 'done'>('menu')
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)

  function reset() {
    setOpen(false); setMode('menu'); setReason(''); setDetails(''); setBusy(false)
  }

  async function doBlock() {
    setBusy(true)
    await fetch('/api/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetUserId }),
    })
    setMode('done')
    setBusy(false)
    onBlocked?.()
  }

  async function doReport() {
    if (!reason) return
    setBusy(true)
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetUserId, reason, details: details || null, mutualMatchId }),
    })
    setMode('done')
    setBusy(false)
    onBlocked?.()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Safety options"
        className="text-stone-400 hover:text-stone-700 px-2 py-1 text-lg leading-none"
      >
        ⋯
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={reset}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            {mode === 'menu' && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-stone-900">Safety</p>
                <button onClick={() => setMode('block')} className="w-full rounded-lg border border-stone-200 px-4 py-3 text-left text-sm font-medium text-stone-800 hover:bg-stone-50">
                  Block {targetName}
                </button>
                <button onClick={() => setMode('report')} className="w-full rounded-lg border border-stone-200 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                  Report {targetName}
                </button>
                <button onClick={reset} className="w-full px-4 py-2 text-sm text-stone-400">Cancel</button>
              </div>
            )}

            {mode === 'block' && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-stone-900">Block {targetName}?</p>
                <p className="text-sm text-stone-500">They won&rsquo;t be told, and you&rsquo;ll never be shown to each other again.</p>
                <div className="flex gap-2">
                  <button onClick={reset} className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm">Cancel</button>
                  <button onClick={doBlock} disabled={busy} className="flex-1 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                    {busy ? 'Blocking…' : 'Block'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'report' && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-stone-900">Report {targetName}</p>
                <p className="text-xs text-stone-500">This also blocks them. Our team reviews every report.</p>
                <select value={reason} onChange={e => setReason(e.target.value as ReportReason)} className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm">
                  <option value="">Choose a reason…</option>
                  {REPORT_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <textarea
                  value={details} onChange={e => setDetails(e.target.value)}
                  placeholder="Anything else we should know? (optional)"
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm" rows={3}
                />
                <div className="flex gap-2">
                  <button onClick={reset} className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm">Cancel</button>
                  <button onClick={doReport} disabled={busy || !reason} className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                    {busy ? 'Submitting…' : 'Submit report'}
                  </button>
                </div>
              </div>
            )}

            {mode === 'done' && (
              <div className="space-y-3 text-center">
                <p className="text-sm font-semibold text-stone-900">Thank you</p>
                <p className="text-sm text-stone-500">You won&rsquo;t see them again. If you reported them, we&rsquo;re on it.</p>
                <button onClick={reset} className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
