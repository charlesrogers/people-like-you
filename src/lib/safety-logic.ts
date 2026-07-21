/**
 * Pure, dependency-free safety decision logic (no DB, no network) so it can be
 * unit-tested directly. The DB/route layers wrap these.
 */

// Auto-moderation categories we refuse to host. `flagged` on any of these rejects content.
export const REJECT_CATEGORIES = new Set([
  'sexual',
  'sexual/minors',
  'harassment',
  'harassment/threatening',
  'hate',
  'hate/threatening',
  'violence',
  'violence/graphic',
  'self-harm',
  'self-harm/intent',
  'self-harm/instructions',
])

export function isRejectable(flaggedCategories: string[]): boolean {
  return flaggedCategories.some(c => REJECT_CATEGORIES.has(c))
}

/** Bidirectional block set: everyone in a block relationship with userId, either direction. */
export function blockedIdsFromRows(
  userId: string,
  rows: { blocker_id: string; blocked_id: string }[],
): Set<string> {
  const ids = new Set<string>()
  for (const row of rows) {
    if (row.blocker_id === userId) ids.add(row.blocked_id)
    else if (row.blocked_id === userId) ids.add(row.blocker_id)
  }
  return ids
}

/** Whether a fresh report should auto-pull the reported user from the pool. */
export function shouldAutoPause(
  distinctReporters: number,
  currentStatus: string,
  threshold = 2,
): boolean {
  return distinctReporters >= threshold && currentStatus === 'active'
}
