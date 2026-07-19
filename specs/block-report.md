# Block & Report Spec (T24)

**Written 2026-07-19. Status: spec, not built. Launch-relevant: real strangers arrive with the 7/22 ads; block/report is table-stakes for a dating product, core to the women-first safety positioning (one-year-plan §4), and Meta's dating-authorization reviewers inspect the product via test login — safety surfaces should exist before they look.**

**Design principles:**
1. **Blocking is silent and absolute.** The blocked person is never told, and nothing in their UX changes except the other person no longer appears. Never leak that a block happened.
2. **Report implies block** (checked by default, uncheckable). Nobody should have to keep seeing someone they reported.
3. **At solo scale, every report pings Charles immediately** (Discord #red-alert). No queue that nobody reads — the silent-cron lesson applies to safety queues too.
4. **Enforcement uses existing machinery**: `users.profile_status`, trust tiers, the mutual-match status machine. No parallel systems.

---

## Schema (migration 018)

```sql
CREATE TABLE IF NOT EXISTS blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  blocked_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','report')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);
CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reported_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  mutual_match_id uuid REFERENCES mutual_matches(id),
  reason text NOT NULL CHECK (reason IN (
    'inappropriate_messages','harassment','fake_profile','inappropriate_photos',
    'safety_concern','underage','married_or_taken','other')),
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  action_taken text CHECK (action_taken IN ('none','warned','paused','banned')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_id);

-- Extend profile_status with 'banned' (keep data for legal/audit; never delete on ban)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_profile_status_check;
ALTER TABLE users ADD CONSTRAINT users_profile_status_check
  CHECK (profile_status IN ('active','paused','hidden','deactivated','banned'));
```

## Block behavior

**Effects (all server-side, atomic in `/api/block` POST `{targetUserId}`):**
1. Insert `blocks` row (idempotent upsert).
2. **Matching exclusion, both directions, everywhere candidates surface**: `applyHardFilters` (`src/lib/db.ts:~116`) gains a batched `getBlocksInvolving(userId, candidateIds)` check — excludes candidates the user blocked AND candidates who blocked the user. This single choke point covers daily delivery, bonus intros, T19 boosts, re-pitch, and the second-date broker (all flow through `selectNextCandidate`). **Plus** `getCalibrationCandidates` (`db.ts:653`) — blocked faces must not appear in the calibration deck (onboarding taste step included, T20).
3. If an active `mutual_match` exists between the pair: set status `declined` (reuse existing terminal status — a distinct `blocked` status would leak the block to anyone who ever sees state; `declined` renders as the neutral "this match has ended" the other person can already receive). Chat closes via the existing declined handling in `ChatWindow.tsx`.
4. If a `scheduled_dates` row is open between them: cancel it; the other party gets the existing neutral cancellation notice (never "you were blocked").
5. Pending `daily_intros` featuring the blocked person: expire.
6. No notification of any kind to the blocked user.

**UI:** overflow menu ("⋯") in the chat header + match/intro views → "Block {name}" → one confirm sheet ("They won't be told, and you'll never be shown each other again") → done toast. Unblock: not in v1 (rare, low stakes at this scale; admin can delete the row).

## Report behavior

**`/api/report` POST `{targetUserId, mutualMatchId?, reason, details?}`:**
1. Insert `reports` row.
2. Auto-block (source `report`) with all block effects above.
3. **Discord #red-alert webhook immediately**: reporter, reported, reason, link to admin queue. (Webhook URL from env — never hardcoded.)
4. **Auto-guard while solo**: if the reported user now has ≥2 open reports from distinct reporters, set their `profile_status='paused'` automatically (out of the pool pending review — reversible, not punitive-visible; they see the normal paused state).
5. Confirmation copy, house tone: "Thank you — we take this seriously. You won't see them again, and we're on it."

**Evidence:** no snapshot table needed — chat messages are already stored server-side; the admin view reads the transcript via `mutual_match_id`. Note in the privacy policy: chat content may be reviewed when a report is filed (add to `/privacy` in the same PR).

**UI:** same overflow menu → "Report" → reason picker (8 reasons above) → optional details → submit. Also reachable from the post-date feedback flow (safety question already implied by date feedback — link "something felt wrong? report it").

## Admin queue

`/admin` gains a **Reports tab** (surgical addition — the file is 1,600+ lines, extend the existing tab pattern): open reports list (newest first, red badge with open count), each row expands to reported profile, reporter context, chat transcript (if `mutual_match_id`), prior reports against the same user. Actions (each writes `action_taken`, `resolved_at`, `admin_notes`):
- **Dismiss** — no action, log why.
- **Warn** — templated email (new `src/lib/email.ts` template, firm + specific, house tone).
- **Pause** — `profile_status='paused'` (out of pool, can appeal by email).
- **Ban** — `profile_status='banned'`: excluded from everything (add `banned` to the existing `profile_status` exclusions in eligibility/delivery queries — verify `getEligibleUsersForDelivery` and `getCompatibleUsers` both honor `profile_status`), sessions invalidated on next auth check, data retained. Ban email states the decision without inviting debate.

**Trust integration:** resolved-valid reports (`action_taken != 'none'`) subtract from the reported user's `trust_scores` via the existing `processDateFeedback`-style path (flat −20, tier recomputes; value approval-gated like all scoring numbers).

## Explicitly out of scope (v1)
- Unblock UI, appeals workflow (email suffices at this scale)
- ML/keyword message scanning, photo moderation
- Device/IP ban evasion (revisit at real scale)
- In-chat message-level reporting (report is person-level; transcript gives context)

## Verify (staging)
1. A blocks B → B vanishes from A's candidates AND A from B's (run `selectNextCandidate` both ways); calibration deck for both excludes the other; existing mutual match → `declined`, chat closed for both; B receives nothing.
2. A reports B → block effects + Discord ping + admin row; second distinct reporter → B auto-paused.
3. Admin ban → B excluded from delivery + candidates; ban survives B logging in.
4. Delivery cron runs clean with blocks present (no errors, blocked pairs never intro'd).

**Effort:** 1 migration + 2 API routes + 1 db-helper + filter wiring + chat-menu UI + admin tab ≈ 1–2 sessions. Slot after T20 in the build order (must be live before metro go-live; ideally before ad traffic lands).
