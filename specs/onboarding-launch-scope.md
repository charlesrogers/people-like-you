# Onboarding & Referral-Boost Scope — pre-launch build list

**Written 2026-07-16. Companion to `specs/launch-plan-2026-07.md` (timeline: ads 7/22, launch ~8/19–20) and `EXECUTION.md`.**

**APPROVALS (Charles, 2026-07-16):** T19 approved — 2/day hard cap, additional invites extend duration (never 3/day), women's boost identical. T20 approved — inline calibration deck, min 10 votes (narrative-swipe removal: explained, awaiting explicit OK). T16 revised — no email waitlist; full onboarding for everyone + per-metro go-live gate with public per-gender countdown (see launch-plan §3). T21 + T22 approved. Build order stands: T16 → T19 → T20 → T23 → T21 → T22.

**Charles's directives this scope encodes:**
1. Referral reward = **product, not queue points**: invite one person (who completes onboarding) → the inviter gets **one extra presented person per day for 7 days** (~7 extra presentations).
2. Everyone can swipe approve/disapprove on people to **build their taste profile**, as part of onboarding.

**What already exists (don't rebuild):**
- Bonus-intro plumbing: `daily_intros.intro_type = 'daily' | 'bonus'`, `saveDailyIntro`, `getCurrentBonusIntro` (`src/lib/db.ts:533`). The cron's 1/day guard only checks `intro_type='daily'` (`deliver-matches/route.ts:50` → `getCurrentDailyIntro`, `db.ts:519`), so a second delivery path doesn't fight it.
- Referral attribution end-to-end: `users.invite_code` → `/join/[code]` (tracks `page_viewed` + UTM into `invite_events`) → `?ref=` read by onboarding (`onboarding/page.tsx:59`) → `signup_completed` event (`api/auth/signup/route.ts:89`) → `onboarding_completed` event awarding `queue_priority` points + `invite_count` (`api/invite/route.ts:65-83`).
- The taste/recommendation engine itself: `calibration_votes` + server-side Elo (T6) + attraction prior in `selectNextCandidate` (T7): myYes ×1.15, myNo ×0.6, theirYes ×1.10. **Frozen — this scope changes where votes come FROM, never the scoring.**
- Dead end: onboarding's `taste` step (`onboarding/page.tsx`, step 6) swipes seed *narratives* → `/api/taste-calibration` → `taste_calibration` table, which has **zero readers**.

---

## T19 — Referral boost: +1 presentation/day × 7 days per completed invite

**Trigger:** the `onboarding_completed` invite event (`api/invite/route.ts:71`) — NOT `signup_completed`. The reward fires only when the invited person is fully onboarded (composite profile exists), otherwise it's gameable with throwaway emails.

**Schema (migration 018):**
```sql
CREATE TABLE IF NOT EXISTS intro_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  source text NOT NULL DEFAULT 'referral' CHECK (source IN ('referral')),
  source_event_id uuid,           -- invite_events.id, for audit/dedup
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL, -- starts_at + 7 days
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_event_id)          -- one boost per completed invite, idempotent
);
CREATE INDEX IF NOT EXISTS idx_intro_boosts_user_active ON intro_boosts(user_id, expires_at);
```

**Stacking rule (proposal — needs Charles's OK):** rate is capped at **2 presentations/day total, always** (1 daily + 1 boost). A second completed invite while a boost is active **extends** `expires_at` by 7 days (max 30 days of runway banked) rather than going to 3/day. Rationale: 3+/day exhausts a small pool in days and dilutes "one real introduction a day" positioning; duration-stacking keeps every marginal invite rewarded.

**Delivery (in `deliver-matches` cron, after the existing daily-intro block):**
1. `hasActiveBoost(userId)` — any `intro_boosts` row with `now() BETWEEN starts_at AND expires_at`.
2. If yes and no pending boost intro today (reuse `getCurrentBonusIntro`-style check scoped to today + new type), run `selectNextCandidate` again and deliver a second intro with `intro_type='boost'` (extend the CHECK constraint; keeps `bonus` semantics distinct — `bonus` = earned by acting on feedback, `boost` = earned by referral).
3. **Pool guard is automatic:** if `selectNextCandidate` returns null (no eligible candidate above bar), no boost intro that day — the boost never lowers match quality, it only adds throughput when supply exists. Log the skip (progress-print rule).
4. Boost intros get the same 24h expiry; an expired boost intro does NOT count toward `consecutive_inactive_days` (only the daily one signals disengagement).

**Grant path:** in `api/invite/route.ts`, on `event_type === 'onboarding_completed'`, insert the `intro_boosts` row (idempotent on `source_event_id`) alongside the existing points/`invite_count` update. Notify the inviter (email + in-app): *"Your friend joined — you're getting a second introduction every day this week."*

**UX surfaces:** dashboard card showing active boost + days left; invite screen copy updated to advertise the reward ("Invite a friend → an extra introduction every day for a week"). Waitlist emails (T16) advertise the same mechanic.

**Instrumentation / experiment:** pre-register with the growth cockpit BEFORE flipping on (per global rule): metric = referral share of signups (`ply.crank.referral_share` or funnel-derived), direction up, window ~28 days. Admin funnel tile: active boosts, boost intros delivered, boost-intro interested-rate vs daily-intro rate (tells us if extra presentations hold quality).

**Verify:** staging — complete an invited onboarding → `intro_boosts` row exists; run cron manually twice → inviter has 1 `daily` + 1 `boost` intro, both rendering; third run same day delivers nothing extra; expiry honored at +7 days; second completed invite extends, not doubles.

**Open questions for Charles:** (a) 2/day hard cap + duration stacking OK? (b) Should women's boost behave identically? (Women are supply-constrained — extra presentations for women are cheap and good; extra *exposure of* women to more men daily slightly accelerates male-side depletion. Proposal: identical mechanic, monitor.) (c) Does the boost replace the `queue_priority` points system or run alongside it? (Proposal: keep points for waitlist ordering only, boost is the post-activation reward.)

---

## T20 — Taste calibration inside onboarding (wire the real engine)

**Goal:** every new user builds their taste profile during onboarding by voting on real photos, feeding `calibration_votes` → Elo → attraction prior. This is the "recommendation engine" ask: the engine exists (T6/T7); onboarding just never feeds it.

**Change:** repurpose the existing `taste` step (step 6 of 7):
- Replace (or precede) the seed-narrative attribute swipes with the `/calibrate` photo flow inlined: fetch via `/api/calibrate/candidates` (already returns up-to-25 opposite-gender profiles with signed photo URLs, T4-compatible), vote via `/api/calibrate` (server-side Elo, T6). Reuse the components from `src/app/calibrate/page.tsx` — extract a shared `<CalibrationDeck>` rather than duplicating.
- Minimum 10 votes to proceed (at pool ~25 this is most of the deck; lower the floor to `min(10, available)` so onboarding never blocks on pool size).
- Copy: opportunity-framed — *"Help us learn your taste. Quick yes/no — nobody sees your answers."* (Votes are private; this is already the /calibrate contract.)
- **Decision needed:** the seed-narrative swipes (`taste_calibration` dead table). Options: (a) delete the narrative swipe UI entirely — one less step-minute, and the data goes nowhere; (b) keep it and finally wire a reader. Recommendation: **(a) cut it** — one clean signal (photo votes into the live engine) beats a second noisy one, same principle as the T10 community-fields deferral. `/api/taste-calibration` route + table stay in place (harmless) until a cleanup migration.
- Keep `/calibrate` as a standalone page post-onboarding (users can keep banking votes; deck cap 25 already raised in T7).

**Not in scope:** any change to Elo K-factors, multipliers, or candidate scoring (frozen model). Cold-start note stands: attraction layer is data-starved until ~150 raters/gender — onboarding calibration is exactly how we get there faster.

**Verify:** staging signup → taste step shows real photos → N rows in `calibration_votes` with `source='calibration'`, voter Elo updated → completing onboarding still fires `onboarding_completed` event (T19 depends on it).

**Open question:** photos of real users shown pre-match during onboarding — already the case on `/calibrate`, but onboarding makes it universal. Comfortable? (Mitigation already in place: signed URLs, votes private, no names shown — confirm no-names in the deck UI.)

---

## Other onboarding-adjacent tasks that need scoping before launch (gap list)

Ordered by launch-criticality:

1. **T16 (REVISED) — full onboarding for everyone + per-metro go-live gate + public per-gender countdown** (spec in launch-plan §3). Referral linkage: the in-app `invite_code` pipeline is reused as-is; pre-launch referrals bank T19 boosts whose `starts_at` = metro go-live.
2. **T21 — Onboarding drop-off recovery.** The voice step is the highest-friction step and ad traffic is colder than vouched traffic. Scope: resume-where-you-left-off already exists (state restore, `onboarding/page.tsx:128`); add a day-1 "finish your profile" email (Resend template) for `signup_completed`-but-not-`onboarding_completed` users, cron-driven, opportunity-toned. Funnel dashboard already tracks the stage; add per-step drop-off if not present.
3. **T22 — Delivery-hour sanity for ad cohorts.** `getEligibleUsersForDelivery` matches `delivery_hour` in UTC with a TODO on timezones (`db.ts:638`). Everyone launching is Mountain Time: default new users' `delivery_hour` to ~[01:00 UTC = 6-7pm MT] instead of whatever the current default is. One-line-ish fix + backfill; full timezone support stays deferred.
4. **T23 — Post-onboarding "invite" moment.** After profile reveal, a single screen: your invite link + the boost pitch + founding-member status. This is where Monzo-style earned referral energy is highest (activation peak). Mostly copy + existing `/api/invite` link generation.
5. **Already done, needs Charles's review to reach main:** T8 (height collection) + T10 (faith-intensity, marriage-timeline) are on staging — they're onboarding changes; eyeball before the ad traffic arrives.
6. **Deferred, explicitly NOT for launch:** email verification hardening (Supabase magic-link flow is adequate), native push/PWA nudges, per-community config questions (locked deferral from T10), any paywall/Stripe surface (Q2).

**Suggested build order given the 7/22 ads date:** T16 → T19 → T20 → T23 → T21 → T22 (T16 unblocks ads; T19+T20 before launch day 8/19; T21–T23 can land during the waitlist window).

---

**Synopsis:** Referral reward becomes +1 intro/day×7d (reusing existing bonus-intro plumbing + invite events — small build), onboarding's dead taste step gets rewired into the live calibration engine (T6/T7), and four smaller onboarding gaps are scoped for the launch window. Needs your OK on: stacking rule (2/day cap, duration extends), cutting the narrative swipes, and the build order.
