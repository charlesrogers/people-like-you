/**
 * Safety-critical logic tests (CLAUDE.md: safety-critical decisions MUST have tests).
 * Run: npx tsx scripts/test-safety.ts
 * Pure logic only — no DB/network. A wrong operator here lets a blocked or abusive
 * user reappear, so every branch is asserted.
 */
import { blockedIdsFromRows, isRejectable, shouldAutoPause } from '../src/lib/safety-logic'

let failures = 0
function check(name: string, cond: boolean) {
  if (!cond) { failures++; console.error(`  ✗ ${name}`) }
  else console.log(`  ✓ ${name}`)
}

console.log('blockedIdsFromRows — bidirectional exclusion')
{
  const A = 'a', B = 'b', C = 'c'
  const rows = [
    { blocker_id: A, blocked_id: B }, // A blocked B
    { blocker_id: C, blocked_id: A }, // C blocked A
  ]
  const forA = blockedIdsFromRows(A, rows)
  check('A excludes B (A blocked B)', forA.has(B))
  check('A excludes C (C blocked A) — reverse direction counts', forA.has(C))
  check('A set size is exactly 2', forA.size === 2)

  const forB = blockedIdsFromRows(B, rows)
  check('B excludes A', forB.has(A))
  check('B does not exclude C (unrelated)', !forB.has(C))

  check('no rows → empty set', blockedIdsFromRows(A, []).size === 0)
}

console.log('isRejectable — moderation category mapping')
{
  check('sexual/minors is rejected', isRejectable(['sexual/minors']))
  check('harassment is rejected', isRejectable(['harassment']))
  check('violence is rejected', isRejectable(['violence']))
  check('empty categories → not rejected', !isRejectable([]))
  check('non-reject category alone → not rejected', !isRejectable(['self-harm/other-unknown']))
  check('mixed: one reject category rejects the whole set', isRejectable(['some-benign', 'hate']))
}

console.log('shouldAutoPause — report threshold')
{
  check('1 reporter, active → no auto-pause', !shouldAutoPause(1, 'active'))
  check('2 reporters, active → auto-pause', shouldAutoPause(2, 'active'))
  check('3 reporters, active → auto-pause', shouldAutoPause(3, 'active'))
  check('2 reporters, already banned → no-op', !shouldAutoPause(2, 'banned'))
  check('2 reporters, already paused → no-op', !shouldAutoPause(2, 'paused'))
}

if (failures > 0) { console.error(`\n${failures} test(s) FAILED`); process.exit(1) }
console.log('\nAll safety-logic tests passed.')
