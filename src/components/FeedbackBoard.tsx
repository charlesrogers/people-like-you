'use client'

import { useState, useEffect, useCallback } from 'react'

interface FeedbackRequest {
  id: string
  title: string
  description: string | null
  status: 'open' | 'in_progress' | 'done' | 'declined'
  vote_count: number
  voted: boolean
  created_at: string
  user_id: string
}

interface FeedbackBoardProps {
  userId: string
  fetchFn?: (url: string, init?: RequestInit) => Promise<Response>
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-stone-100 text-stone-600' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  done: { label: 'Done', color: 'bg-green-100 text-green-700' },
}

export default function FeedbackBoard({ userId, fetchFn }: FeedbackBoardProps) {
  const [requests, setRequests] = useState<FeedbackRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'votes' | 'newest'>('votes')
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const apiFetch = fetchFn || fetch

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/feedback-board?userId=${userId}&sort=${sort}`)
      const data = await res.json()
      setRequests(data.requests || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [userId, sort, apiFetch])

  useEffect(() => { load() }, [load])

  async function handleSubmit() {
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await apiFetch('/api/feedback-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'submit', title, description }),
      })
      setTitle('')
      setDescription('')
      setShowForm(false)
      load()
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVote(requestId: string, currentlyVoted: boolean) {
    // Optimistic update
    setRequests(prev => prev.map(r =>
      r.id === requestId
        ? { ...r, voted: !currentlyVoted, vote_count: r.vote_count + (currentlyVoted ? -1 : 1) }
        : r
    ))

    try {
      await apiFetch('/api/feedback-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: currentlyVoted ? 'unvote' : 'vote',
          requestId,
        }),
      })
    } catch {
      load() // revert on error
    }
  }

  function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Feature Requests</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Share ideas and vote on what gets built next
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 active:translate-y-px"
        >
          {showForm ? 'Cancel' : 'New idea'}
        </button>
      </div>

      {/* Submit form */}
      {showForm && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 mb-6">
          <input
            type="text"
            placeholder="What would make this better?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-400 focus:outline-none"
            maxLength={200}
          />
          <textarea
            placeholder="Add details (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="mt-3 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-400 focus:outline-none resize-none"
            maxLength={1000}
          />
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || submitting}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-40"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}

      {/* Sort tabs */}
      <div className="flex gap-1 mb-4">
        {(['votes', 'newest'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              sort === s
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            {s === 'votes' ? 'Top' : 'New'}
          </button>
        ))}
      </div>

      {/* Request list */}
      {loading ? (
        <p className="text-center text-stone-400 py-12 text-sm">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-500 text-sm">No ideas yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map(r => (
            <div
              key={r.id}
              className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 transition hover:shadow-sm"
            >
              {/* Vote button */}
              <button
                onClick={() => handleVote(r.id, r.voted)}
                className={`flex flex-col items-center rounded-lg px-2 py-1.5 text-xs font-medium transition shrink-0 ${
                  r.voted
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <svg className="w-3.5 h-3.5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                {r.vote_count}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-stone-900">{r.title}</h3>
                  {r.status !== 'open' && STATUS_LABELS[r.status] && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_LABELS[r.status].color}`}>
                      {STATUS_LABELS[r.status].label}
                    </span>
                  )}
                </div>
                {r.description && (
                  <p className="mt-1 text-xs text-stone-500 line-clamp-2">{r.description}</p>
                )}
                <p className="mt-1.5 text-[10px] text-stone-400">{timeAgo(r.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
