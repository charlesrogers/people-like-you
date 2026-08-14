# PLY EXECUTION ROADMAP — Operator's Manual

**Audience: a Claude session with NO prior context.** Read this top to bottom before touching code. This doc encodes every decision already made — do not relitigate them. Strategy lives in `specs/roadmap-2026-07.md` (product) and `one-year-plan.md` (business); this doc is HOW to execute, task by task.

**Maintenance rule: this doc is the single source of truth for execution state.** When you complete a task, check its box, update the STATE section, and commit the doc change with the work.

---

## 0. PRIME DIRECTIVES (read every session, violating any of these is a failed session)

1. **NO VERCEL. NO HEROKU. NO NEON.** Deploy = git push → GH Actions → GHCR → Coolify on Hetzner. Never run `npx vercel` or `heroku`.
2. **"Pushed" is not "live."** After every push: (a) `gh run list --branch <branch> --limit 1` shows success, (b) curl the staging/production URL and confirm the NEW behavior serves. Never tell Charles something is live without doing both.
3. **Staging first.** Push to `staging` branch → deploys to https://staging-ply.imprevista.com. Merge staging → main only after Charles verifies (or explicitly says push to main). Production = https://people-like-you.com.
4. **The matching model is FROZEN.** No changes to embedding weights, scoring formulas, Elo K-factors, or location multipliers unless a walk-forward validated experiment says so AND Charles approves. Bug fixes with documented intent are OK (e.g., the multiplier-bypass fix, July 2026).
5. **North star = verified dates → relationships. NEVER engagement.** If a change increases revenue or usage but slows time-to-relationship, do not ship it (one-year-plan.md §2 guardrails).
6. **One variable per commit** for anything touching matching/scoring. Small, labeled commits everywhere else.
7. **No secrets in git, Dockerfile ARGs, or GH build-args.** Runtime env vars via Coolify only. `.env.production` (public keys only) is the single committed env file — that's intentional.
8. **Never make the repo public.** Never propose PreToolUse hooks.
9. **Costs**: anything that costs money (new server, paid API, plan upgrade) → STOP and tell Charles the exact cost first.
10. **Read `tasks/lessons.md` at session start** if it exists. After any correction from Charles, append a lesson there immediately.
11. **Files >500 lines** (`src/app/admin/page.tsx` = 1,600+, `src/app/onboarding/page.tsx` is large): surgical Edit-tool changes only. Never rewrite.
12. **Locked product decisions** (§9 Decision Log) are locked. Don't redesign them.

---

## 1. STATE (update this section every session)

**As of 2026-08-13/14 — PLATFORM OUTAGE (resolved) + T16c waitlist rework:**
- **5-DAY FULL OUTAGE, ROOT-CAUSED AND FIXED.** people-like-you.com served Traefik 503s from ~2026-08-08 to 2026-08-14 04:55 UTC. Chain: (1) the **sales-analyzer container was compromised** — cryptominer `/tmp/XXidmCpi` at 707% CPU, dropper `/tmp/npm_update` dated **2026-04-02**, i.e. the *same* infection as the documented "May 2026" incident, **never actually remediated**, mining for 4½ months on an unpatched **Next.js 15.1.6** image built 2026-03-28; (2) memory exhaustion (12/15GB, no swap) killed `supabase-db` on 2026-08-08 17:26; (3) **`docker container prune -f` in `/data/scripts/docker-cleanup.sh` (every 6h) then permanently DELETED the supabase-db container**; (4) PostgREST/storage failed → PLY `/api/health` 503 → container unhealthy (failing streak 5,067) → Traefik dropped it. **Nobody was alerted for 5 days.**
- **Fixes applied**: miner killed, sales-analyzer stopped with `--restart=no`; supabase-db recreated from the intact bind-mount PGDATA (**zero data loss** — 24 users, 33,144 zips, 29 migrations); network bridge re-run; kong restarted to clear stale DNS; `docker container prune -f` **removed** from docker-cleanup.sh (backup at `.bak.20260814`); memory limits set (PLY prod 3g, staging 2g); `oom_score_adj=-500` on supabase-db. Host verified clean (no rootkit, no attacker SSH key, no docker.sock in the compromised container → no host escape); all other containers scanned clean.
- **sales-analyzer DELETED (2026-08-14, Charles)**: container removed (destroying the malware writable layer), infected GHCR image deleted locally, Coolify app `i131csdd07q3cvvgyl675wlg` deleted via API, dangling `sales-https` router removed from `/data/coolify/proxy/dynamic/imprevista-https.yml` (backup `.bak.20260814`). sales.imprevista.com → 404. Other apps re-verified routing after the proxy edit.
- **STILL OPEN (needs Charles)**: (a) **credential rotation** — Charles chose "service-role key only", but that is **not achievable on self-hosted Supabase**: both ANON_KEY and SERVICE_ROLE_KEY are JWTs signed by a single `JWT_SECRET` with a 10-year expiry and no revocation list, so the old service-role key stays valid until `JWT_SECRET` changes — and changing it invalidates the anon key too, requiring a coordinated update of every app + Supabase service restart. **Decision still pending.** (b) **monitoring gap** — Uptime Kuma did not surface a 5-day outage; (c) memory limits are runtime-only and will be lost on next Coolify redeploy — set them in the Coolify UI; (d) no SMS provider (Resend only), so waitlist phone numbers cannot be contacted yet.
- **T16c (this session)**: waitlist reworked to **phone + ZIP only** per Charles. Migration 022 (email nullable, `phone_normalized` unique, `zip3`/`city`/`state`). `/api/waitlist` keys on phone. New `src/components/WaitlistCapture.tsx` = capture form + success **popup** naming their city ("We're launching in Provo, UT soon"), queue position, and a **copy-paste invite message** carrying their referral link. **Root `/` is now the waitlist**; old marketing homepage moved to **`/welcome`**; `/waitlist` still serves the same component (existing Meta ads point there). Referral reward per Charles = **early access + extra matches for a set number of weeks** (no discount code — PLY has no payments); copy is aligned to the approved T19 boost (+1 intro/day ×7d per invite).

**As of 2026-07-16:**
- **Everything through T14 is LIVE IN PRODUCTION.** staging == main (the T4 merge on 7/15 carried T8+T10 to main; migrations 014–017 all applied in prod, verified via `_migrations`). Charles is testing T8/T10 onboarding changes directly in prod (his call 7/16 — no real users yet).
- **CRON INCIDENT (resolved 7/16, follow-up open)**: two sessions converged on the same signal. Final diagnosis (other session, commit 3ad51ed): PLY crons were split-brain — the real ones run **server-side** (`/etc/cron.d/coolify-apps`) with the correct secret; the GH Actions `crons.yml` was a drifted duplicate (rotate-cron-secret.sh updates Coolify + server cron, never the GH secret) that 401'd on every run. Fix: `crons.yml` deleted; `second-date-check` (which existed ONLY in GH Actions and had never run) added server-side and verified 200. No GH CRON_SECRET rotation needed. **ROOT CAUSE FOUND & FIXED (7/19, commit 2b2acc6)**: cron auth was only layer 1 (fixed by 3ad51ed — prod now logs hourly authed hits). Layer 2, the real delivery killer: deliver-matches checked "already has a pending intro" BEFORE expiring stale pendings, and `expirePendingIntros` was unreachable while a pending existed → any unacted-on intro blocked that user FOREVER. 21 intros stuck `pending` since 2026-03-30 froze all delivery for 3.5 months. Fix: expire-first ordering + 20h age cutoff in the cron path (resume-from-pause keeps expire-all). Delivery self-heals at the next 11:00 UTC pass.
  **Still open**: (a) ~~catherine email~~ RESOLVED 7/19: Charles approved — she stays active, delivery resumes for her normally. (b) 12 of 23 users have no `user_cadence` row — check whether signup creates one; backfill before launch. (c) all `delivery_hour` values are 11 UTC = 4–5am MT (T22). (d) server-side crons still need a Discord failure-alert path.
- Pool: ~25 users (mostly seeds), 16M/6W (real 12M/2W), pre-launch. Attraction layer intentionally near-inert until ~150 raters/gender.
- **Launch track (specs/launch-plan-2026-07.md + specs/onboarding-launch-scope.md)**: ad credits usable 7/22; Meta dating-ads authorization application is BLOCKING (30-day SLA — Charles submits); target go-live ~Aug 19–20, Utah Valley.
- **Decisions from Charles 2026-07-16**: T19 referral boost approved (+1 intro/day ×7d per completed invite; hard cap 2/day; further invites EXTEND duration, never 3/day; women's boost identical). T20 approved (inline calibration deck as onboarding taste step, min 10 votes; cutting the narrative swipes explained, awaiting explicit OK). T16 REVISED: no email waitlist — everyone fully onboards; per-metro go-live gate on count+ratio with a public per-gender countdown ("30 men, 20 women to go") as the invite driver. T21 (voice-step drop-off recovery email) + T22 (delivery-hour default → evening MT) approved.
- **Next work**: unpause seeds + verify deliver-matches produces intros in prod (Charles testing); then T16 (revised) → T19 → T20 → T23 → T21 → T22; T9/T11/T12/T13 continue in parallel.
- **Advisable before matching drives real decisions at scale**: a correctness review of the T7 scoring changes + re-pitch direction fix (not yet done — low stakes at 25 users, but do it before a populated launch).

### Master checklist (chronological)
- [x] T1: Apply migration 014 *(2026-07-13, via main deploy)*
- [x] T2: Merge staging → main, verify production *(2026-07-13, ff cea3bd1→1411c37)*
- [x] T3: Backups + verify drill *(2026-07-14 — see note below)*
- [x] T4: Photos bucket → private *(2026-07-15, DONE + verified in prod)*
  - Signed-URL serving (`src/lib/photos.ts` signPhotoUrl, 1h TTL) wired into matches, feedback, calibrate/candidates, voice-prompt-loop, upload-photo. Merged to main.
  - Bucket flipped private: `UPDATE storage.buckets SET public=false WHERE id='photos'`. Verified: public path (no token) → 400 (was 200); fresh signed URL → 200.
  - **Bonus discovery**: stored `photos.public_url` values were DEAD Supabase-Cloud URLs (`lbzwcdcqjxnjvkmrvjyp.supabase.co`, 000) — legacy from the Cloud→self-hosted migration. Photos had been broken in prod; signed serving from self-hosted db.imprevista.com repaired them.
- [x] T5: Staging workflow runs migrations *(2026-07-14)*
- [x] T6: Phase 1a — persist calibration votes (migration 015 + server-side Elo) *(2026-07-14)*
- [x] T7: Phase 1b — attraction prior in candidate selection *(2026-07-14, soft shape)*
  - Multipliers approved: myYes ×1.15, myNo ×0.6, theirYes ×1.10, theirNo ×0.6. SOFT only.
  - Decision: calibration photo-no = soft (revivable while pool is small); a hard "never again" exclude only fires on a **post-narrative pass**. That pass-hard-exclude is a small follow-up tweak to re-pitch logic (`getRePitchCandidateIds`), NOT yet built — currently passes re-pitch after 60 days. Do next.
  - Calibration candidate cap raised 15 → 25 (every face counts at low pool).
  - Reality check (Charles + Keeper data): attraction/Elo is data-starved until ~150 raters/gender per metro. This layer barely moves at ~25 users by design — it's banking data now, not driving matching yet.
- [ ] T7: Phase 1b — attraction prior in candidate selection
- [ ] T8: Phase 1c — height collection + soft preference
- [ ] T9: Phase 1d — woman-sees-first intro sequencing
- [x] T10: faith intensity + marriage timeline scoring *(2026-07-14; reached main+prod 7/15 via T4 merge; Charles testing in prod)*
  - Faith intensity = PROXIMITY on existing observance_level (practicing/cultural/background → 8/5/2): gap≤2 ×1.08, ≤5 ×0.92, else ×0.75. No new question — reuses data already collected.
  - Marriage timeline (new col via migration 016 + onboarding select): proximity ×1.05 / ×0.92 / ×0.82. Null-safe.
  - Community-config fields (temple intent etc.) NOT built — deferred; one clean signal beats several noisy at this scale.
- [x] T8: height soft nudge ×0.9 *(2026-07-14; reached main+prod 7/15 via T4 merge; Charles testing in prod)*
  - migration 017 (hard_preferences.height_preference_min int); users.height now collected (basics-step select, was hardcoded null); optional min-height preference (preferences step); parseHeightToInches + ×0.9 soft nudge, null-safe. Never a hard filter.
- [ ] T11: Phase 1.5a — conversation cards in chat
- [ ] T12: Phase 1.5b — two-tap date proposals
- [ ] T13: Phase 1.5c — second-date broker (extends existing cron)
- [x] T7-followup: post-narrative-pass hard-exclude — re-pitch now targets EXPIRED intros only; explicit passes never re-pitched *(2026-07-14)*
- [x] T14: `not_attracted` pass-share metric on admin *(2026-07-14, tile on /admin/funnel)*
- [ ] T15: Q2 — Stripe subscription build (write spec first, get approval)
- [ ] **T-INCIDENT follow-up**: unpause seeds / reset `user_cadence` so deliver-matches produces intros again (none since 3/30); add Discord failure alerting to the server-side cron path
- [~] T16: pre-launch waitlist — `/waitlist` capture page (email/phone/zip→metro/gender) + `/api/waitlist` + migration 020 `waitlist` table. LIVE IN PROD 2026-07-23, verified (Provo zip→Provo-Orem metro, position + referral code). Charles driving Meta traffic here; app stays gated. Table empty/ready. **Not yet built:** referral link stores `referred_by` but does NOT reorder position yet; per-metro go-live gate + public per-gender countdown (the fuller density-gate model) still pending — this is the lightweight capture version.
- [x] T16c: waitlist → **phone + ZIP only** + success popup (city + position + copy-paste invite) + root `/` serves the waitlist, marketing page → `/welcome`. Migration 022. *(LIVE IN PROD 2026-08-14, verified: prod signup → Provo/Utah Valley, referral attribution, popup rendered on people-like-you.com)*
- [ ] **T-INFRA**: post-incident hardening — rotate Supabase/DB credentials (container compromised 4½ months), rebuild-or-delete sales-analyzer on patched Next.js, close the monitoring gap that missed a 5-day outage, persist memory limits in Coolify UI
- [ ] T19: referral intro-boost (+1/day ×7d, cap 2/day, duration-stacking) — APPROVED, spec in onboarding-launch-scope.md
- [ ] T20: calibration deck as onboarding taste step (min 10 votes) — APPROVED; narrative-swipe removal awaiting explicit OK
- [ ] T21: voice-step drop-off recovery email — APPROVED
- [ ] T22: delivery-hour default → evening Mountain Time — APPROVED
- [ ] T23: post-reveal invite moment (boost pitch + founding-member status)
- [~] T24: block, report & content moderation — BUILT to Apple 1.2 terminal state *(2026-07-20, on staging)*. All 4 UGC pillars: OpenAI moderation on PUBLIC-FACING content only (photos + onboarding profile voice memos; private chat is NOT pre-screened — reactive block+report+review per Charles 2026-07-20), /api/block (silent bidirectional), /api/report (Discord alert + auto-pause@2 + 24h-SLA cron), zero-tolerance EULA at signup, communityhealth@ contact on terms/privacy, /admin Reports tab. Pure logic tested (`scripts/test-safety.ts`, 17 assertions). **Deploy prereqs before it's fully live: (1) Coolify env `DISCORD_SAFETY_WEBHOOK` on prod+staging; (2) register `/api/cron/report-sla` in server cron hourly; (3) verify `communityhealth@people-like-you.com` as a Resend sender.** Migration 018 applies on deploy.
- [ ] Recurring R1: weekly metrics review (see §7)

---

## 2. SYSTEM MAP (what exists, where)

| System | Key files |
|---|---|
| Onboarding flow (signup→basics→voice→preferences→photos→taste→reveal) | `src/app/onboarding/page.tsx` (large; basics step collects firstName/gender/birthYear/zipcode only) |
| Voice → transcription → extraction | `src/app/api/transcribe/route.ts` (gpt-4o-mini-transcribe, whisper-1 fallback), `src/lib/extraction.ts` (v1 + orchestration), `src/lib/extraction-v2.ts` (ACTIVE: Haiku pass-1 stories, Sonnet pass-2 personality; produces `conversation_fuel[]`, `life_stage`, etc.) |
| Matching | `src/lib/matchmaker.ts` (`scoreCompatibility`, `selectNextCandidate` ~line 503), `src/lib/embedding.ts` (128-dim), `src/lib/db.ts` `getCompatibleUsers`/`applyHardFilters` (~line 64/116), `src/lib/geo.ts` (tier multipliers), `src/lib/elo.ts` |
| Intro generation | `src/lib/intro-engine-v2.ts`, `src/lib/narrative-strategy.ts`, `src/lib/narrative-critic.ts` |
| Delivery | `src/app/api/cron/deliver-matches/route.ts` (hourly; 1 intro/day/user; 24h expiry; 3 inactive days → auto-pause) |
| Post-match lifecycle | mutual_matches status machine: `active → chatting → deciding → planning → date_scheduled → date_completed → relationship / declined / expired`. Chat: `src/components/ChatWindow.tsx`, 10-msg cap. Blind meet-decision: `src/app/api/meet-decision/route.ts`. Dates: `/api/dates`, `/api/date-planning`. Feedback: `/api/dates/feedback` → `src/lib/trust.ts` |
| Crons — **server-side only**, `/etc/cron.d/coolify-apps` on the Hetzner box (NOT GitHub Actions) | deliver-matches (:00), chat-expiry (:15), disclosure-expiry (:30), post-date-checkin (:45), pre-date-nudge (*/6h :15), second-date-check (daily 06:50 UTC). Secret is a 64-hex `CRON_SECRET` matching the Coolify runtime env; `/data/scripts/rotate-cron-secret.sh` (manual) rotates the Coolify env + cron file together. **The old GitHub Actions `crons.yml` was DELETED 2026-07-16** — it duplicated these, and its GH secret drifted from the rotated Coolify secret → every run 401'd for a day+. Do NOT re-add GH Actions crons; add new jobs to `/etc/cron.d/coolify-apps` (same `Bearer <64hex>` format so the rotation sed keeps them in sync). |
| Admin | `src/app/admin/page.tsx` (tabs, x-admin-secret header auth vs `ADMIN_SECRET` env), `src/app/admin/funnel/page.tsx`, `/api/admin/stats`, `/api/admin/funnel` |
| Calibration (Elo) | `src/app/calibrate/page.tsx` + `/api/calibrate` (**client computes Elo — trust hole, fixed in T6**), `/api/calibrate/candidates` |
| Feedback board | `/feedback`, migration 013 |
| Email | `src/lib/email.ts` (Resend, hello@people-like-you.com) |

**Schema locations** (no single schema file — check all): `supabase-schema.sql` (users, hard/soft_preferences, photos, voice_memos, composite_profiles, matches, match_feedback), `supabase-phases-1-2-3-5-migration.sql` (mutual_matches, scheduled_dates, date_feedback w/ `UNIQUE(scheduled_date_id, user_id)`, trust_scores, exit_surveys, funnel_metrics v1), `supabase-cadence-migration.sql` (daily_intros, user_cadence, profile_status), `migrations/*.sql` (007 constrained chat + status enum, 011 location, 014 funnel v2).

**Known dead-ends (do not "discover" these again):** `taste_calibration` table has zero readers; `soft_preferences` is never written by onboarding; `disclosure_exchanges` is dormant (superseded by chat — revival candidate for T11-adjacent game, decision pending); `date_feedback` flows to trust scores only, NOT matching (intentional until Phase 4); embedding dims 112–127 are reserved zeros.

---

## 3. INFRASTRUCTURE CHEAT SHEET

- **Server**: `ssh root@95.216.205.160` (Hetzner, Helsinki). Coolify dashboard :8000.
- **DB**: self-hosted Supabase, shared by multiple apps. Direct access: `ssh root@95.216.205.160 "docker exec -i supabase-db psql -U postgres -d postgres"`. ALWAYS use hostname `supabase-db` in app config, never an IP.
- **Migration dry-run pattern (use before ANY migration apply):**
  ```bash
  (echo "BEGIN;"; cat migrations/NNN_name.sql; echo "ROLLBACK;") | \
    ssh root@95.216.205.160 "docker exec -i supabase-db psql -U postgres -d postgres"
  ```
- **Migration apply (main deploy does this automatically; manual only if Charles approves):** same command with COMMIT semantics (no BEGIN/ROLLBACK wrapper) + `INSERT INTO _migrations (name) VALUES ('NNN_name.sql') ON CONFLICT DO NOTHING;`
- **⚠ `_migrations` table is SHARED with other apps** — rows exist that aren't in this repo. Match by exact filename only. Never delete rows.
- **⚠ Shared `public` schema** — before creating any new view/function/table, check name collisions: `\dv name`, `\dm name`, `\df name`.
- **⚠ PostgREST schema cache**: new tables/views/RPCs are invisible to supabase-js until reload: `docker exec supabase-db psql -U postgres -d postgres -c "NOTIFY pgrst, 'reload schema'"` (harmless, run after any DDL).
- **Deploy workflows**: `deploy.yml` (main: builds image, RUNS MIGRATIONS, deploys, verifies health, auto-rollback), `deploy-staging.yml` (staging: builds + deploys + health check, **NO migrations**  — until T5), `crons.yml` (schedules, main only).
- **Cron auth**: `Authorization: Bearer $CRON_SECRET`. Admin auth: `x-admin-secret: $ADMIN_SECRET` header. Both are Coolify env vars + GH secrets.
- **Local build gotcha**: worktree `node_modules` is a symlink → Turbopack fails with "Symlink node_modules is invalid". Fix: `rm node_modules && cp -Rc /Users/charlesrogers/.claude/worktree-nm/people-like-you/node_modules ./node_modules`.
- **Always `npx next build` locally before pushing.**
- **⚠ Staging deploy "success" ≠ new code serving.** The deploy-staging health-check can pass on the OLD container during Coolify's rolling restart. Before verifying app behavior, wait for the NEW container to be healthy: `until ssh root@95.216.205.160 "docker ps --filter name=<APP_UUID> --format '{{.Status}}'" | grep -q healthy; do sleep 5; done` AND confirm its CreatedAt is after your push (`docker ps --filter name=<APP_UUID> --format '{{.CreatedAt}}'`). Curling too early hits stale code and gives false negatives/positives. (Migrations run via SSH, separate from the container, so those verify independently.)

---

## 4. PER-TASK SPECS

Every task follows this session protocol:
1. Read §0, §1, `tasks/lessons.md`. Pick the next unchecked task (or the one Charles names).
2. Read the actual files listed before editing (never assume).
3. Implement → `npx next build` → commit (message references task ID) → push staging → verify deploy (gh run + curl) → check the box in §1 → update STATE → commit doc.
4. If anything contradicts this doc (file moved, schema differs), STOP, investigate, update the doc, then proceed.

---

### T3 — Backups (DONE 2026-07-14, full saga)
The offsite backup to the Hetzner Storage Box had **never worked** since setup in March — `backup.sh` used a `SFTP_COMMAND` env var that restic ignores, so it silently failed nightly (box showed 0 B). Fixes applied, all server-side (scripts live in `/data/scripts/` on 95.216.205.160, NOT in this repo):
- Server SSH key authorized on the box. **Gotcha**: the newer Hetzner Storage Box doesn't support `install-ssh-key`; the key must be uploaded to `.ssh/authorized_keys` via SFTP. Repeated failed password attempts **rate-limit-ban your IP** — route through the server's clean IP if the Mac gets banned. Connection config is in `/root/.ssh/config` under `Host storagebox`.
- restic repo path fixed to `/home/backups` (the box jails you to your home; `/backups` at FS root fails).
- `backup.sh`: added Discord #red-alert on failure; repo reachability check. Restic repo initialized (id e809698ac7). First snapshot confirmed on box 2026-07-14.
- `verify-backup.sh` rewritten: the old one piped a dump into the PROD container (never verified, risked corruption). New one checks gzip integrity + freshness + **counts user rows inside the dump vs prod** + confirms offsite snapshot count. Passing (23=23). NOTE: it does NOT do a full container restore — that fights Supabase's locked-down `supabase_admin` role model; content-count verification was the reliable choice.
- Backup scope left FULL (~30GB, all apps' Supabase volumes) per Charles 2026-07-14 — he declined slimming. The 27GB is a stale rsync mirror (no `--delete`); harmless on a 1TB box.
- Cron already scheduled (server `/etc/cron.d/coolify-apps`): backup daily 04:00, verify Sun 05:00.

### T1 — Apply migration 014 ⏳ BLOCKING
**Goal**: `funnel_metrics` (v2), `user_journey`, `pool_gender_ratio`, `refresh_funnel_views()` exist in the DB.
**How**: Preferred path is T2 (merge to main — deploy.yml applies it). If Charles wants staging verified with data first, ask him to approve manual apply, then: dry-run pattern (§3), apply, insert `_migrations` row, `NOTIFY pgrst, 'reload schema'`.
**Verify**: `curl -s -H "x-admin-secret: $ADMIN_SECRET" https://staging-ply.imprevista.com/api/admin/funnel` returns `metrics` array with rows and `velocity.medianDays` object; `/admin/funnel` page renders tables (Charles checks visually).
**Pitfall**: collision check was done 2026-07-03 (names free). If re-checking: §3 collision commands.

### T2 — Merge staging → main, verify production
**Preconditions**: Charles has eyeballed staging and says go.
**How**: `git checkout main && git pull && git merge --ff-only origin/staging && git push origin main` (ff should work — staging is strictly ahead; if not, STOP and show Charles the divergence).
**Verify**: (1) `gh run list --branch main --limit 1` success (this run applies migration 014 if T1 didn't); (2) `curl -s -o /dev/null -w "%{http_code}" https://people-like-you.com/admin/funnel` → 200; (3) funnel API with secret returns data; (4) next morning: `gh run list --workflow crons.yml` shows second-date-check ran at 06:50 UTC.

### T3 — Automated offsite Postgres backups + restore drill
**Goal**: nightly `pg_dump` of the shared Supabase Postgres shipped OFF the server, 14-day retention, restore verified once.
**How**: script on server `/data/scripts/backup-postgres.sh`: `docker exec supabase-db pg_dump -U postgres -Fc postgres > /data/backups/pg-$(date +%F).dump`, prune >14 days, then rclone/scp to offsite target — **ASK CHARLES which offsite target** (Hetzner Storage Box ~€4/mo, or existing cloud storage — cost rule §0.9). Cron via `/etc/cron.d/`. Add an Uptime Kuma push monitor or a simple healthcheck ping so a silent failure alerts #red-alert.
**Verify**: dump file exists offsite with today's date; restore drill: load dump into a scratch container, `SELECT count(*) FROM users;` matches production.
**Pitfall**: this DB serves ALL apps — the backup protects everything; do not scope to PLY tables.

### T4 — Photos bucket → private + signed URLs
**Goal**: member photos are not world-readable (they are today).
**How**: Read `src/components/PhotoUploader.tsx` and every consumer of `photos.public_url` first (grep `public_url`). Switch bucket to private in Supabase; replace `public_url` reads with signed URLs (supabase `createSignedUrl`, TTL ~1h) generated server-side at the API layer that serves photos to a match. Migration to backfill/null the `public_url` column as appropriate.
**Verify**: direct fetch of an old public URL → 400/403; photos still render in onboarding preview, calibrate flow, and post-reveal match view (all three surfaces, on staging).
**Pitfall**: calibrate flow (`/api/calibrate/candidates`) also serves photos — don't break it. This is a user-facing visual change: have Charles click through staging before main.

### T5 — Staging workflow runs migrations
**Goal**: close the gap that blocked Phase 0 (staging deploys don't apply `migrations/*.sql`).
**How**: copy the migration step from `.github/workflows/deploy.yml` (lines ~37–59) into `deploy-staging.yml` before the deploy step. Same SSH secret is already available to the workflow.
**Caveat to note in commit**: staging and prod share ONE database — a staging migration IS a prod migration. That's accepted (schema is forward-compatible by convention; migrations must be additive/idempotent).
**Verify**: push a no-op migration (e.g., `015_noop.sql` with a comment-only change — actually skip the no-op; verify with the next real migration, T6).

### T6 — Phase 1a: persist calibration votes + server-side Elo
**Goal**: stop discarding per-pair attraction data (the 82% personal-taste signal — see roadmap §1 Leg 3); close the client-computed-Elo trust hole.
**Migration `migrations/015_calibration_votes.sql`**:
```sql
CREATE TABLE IF NOT EXISTS calibration_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vote boolean NOT NULL,            -- true = yes/attracted
  source text NOT NULL DEFAULT 'calibration' CHECK (source IN ('calibration')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(voter_id, target_id)       -- latest vote wins via upsert
);
CREATE INDEX IF NOT EXISTS idx_calibration_votes_voter ON calibration_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_calibration_votes_target ON calibration_votes(target_id);
```
**Code**: rewrite `/api/calibrate` (currently 27 lines, accepts client-computed `newElo` — remove that): request becomes `{ userId, targetId, vote }`; server loads both users' Elo, computes via `src/lib/elo.ts` (K=32 under 20 interactions else 16 — existing logic), updates voter Elo (`updateUserElo(userId, newElo, true)`), upserts into `calibration_votes`. Update `src/app/calibrate/page.tsx` to send the new payload and stop computing Elo client-side (read the page first — it currently holds the Elo math).
**Verify**: on staging, swipe 3 calibration cards with a test user → 3 rows in `calibration_votes` (query via §3 psql), voter's `elo_score` changed, response 200s.
**Pitfall**: don't change Elo K-factors or the band logic (frozen model, §0.4). This task only moves WHERE the math runs and persists votes.

### T7 — Phase 1b: attraction prior in candidate selection
**Goal**: use direct votes: if A already voted yes on B's photo, boost B as a candidate for A; if voted no, suppress.
**How**: in `selectNextCandidate` (`src/lib/matchmaker.ts` ~503), after `scoreCompatibility` × location multiplier, apply: both-directions vote lookup (new db helper `getVotesBetween(userId, candidateIds[])` — batch, not per-candidate queries). Multipliers: A voted yes on B → ×1.15; A voted no on B → ×0.6; B voted yes on A → ×1.10 (mutual pre-attraction is gold: yes+yes → effectively ×1.265). No vote → ×1.0.
**⚠ This is a scoring change — get Charles's explicit OK on the multiplier values before shipping (§0.4). The values above are the proposal; put them in a const block with a comment linking this task.**
**Verify**: unit-style check via a script (`scripts/test-attraction-prior.ts`) that builds two fake candidates, one with a yes-vote, asserts ordering flips as expected; run with `npx tsx`. Log the multiplier application in selectNextCandidate (console.log per §0 progress rule).

### T8 — Phase 1c: height collection + soft preference
**Goal**: populate the existing-but-empty `users.height` (text column) + one preference field.
**How**: read `src/app/onboarding/page.tsx` basics step (~line 178 collects firstName/gender/birthYear/zipcode) — add a height select (4'10"–7'0" in inches, store as text like existing seeds do — check `src/lib/seed-profiles.ts` format first and MATCH it). Add `height_preference_min` (nullable int, inches) to `hard_preferences` via migration 016 — asked during the preferences step, phrased optional/skippable ("Height preference? Most people are more flexible than they think").
**Scoring**: soft only — in `getPreferenceAlignmentMultiplier`, unmet stated minimum → ×0.9. NEVER a hard filter (roadmap §3 filter discipline). Same approval rule as T7 for the multiplier value.
**Verify**: new signup on staging stores height; profile shows it; admin matrix unaffected.

### T9 — Phase 1d: woman-sees-first intro sequencing
**Goal**: for each match, the woman receives the intro first; the man only receives his intro if she likes.
**Read first**: `src/app/api/cron/deliver-matches/route.ts` end-to-end, `src/app/api/feedback/route.ts` (the like/pass handler, bonus-match logic at ~line 79), `daily_intros` schema (§2).
**How**: in deliver-matches, when `selectNextCandidate` picks a pair for a male user, INVERT: create the `daily_intros` row for the WOMAN (her narrative, about him) instead. When she acts `interested` (feedback route), immediately generate + deliver his intro about her (reuse the bonus-intro delivery path). If she passes, he never knows. For female users' own daily delivery, unchanged (they see their picked candidate directly). Add `sequencing` column to `daily_intros` (migration 017: `'standard' | 'her_first_stage1' | 'her_first_stage2'`) so the funnel can A/B-compare.
**Feature flag**: env var `WOMAN_FIRST_SEQUENCING=true` checked in deliver-matches, default off until Charles flips it in Coolify (both staging + prod have separate env vars).
**Verify**: on staging with flag on, run the cron manually (`curl -H "Authorization: Bearer $CRON_SECRET" https://staging-ply.imprevista.com/api/cron/deliver-matches`), confirm: male test user got no intro, female got one; like it as her → male's intro appears.
**Pitfall**: the 1-intro-per-day guard (`getCurrentDailyIntro`) must count the man's stage-2 intro as his daily intro or he can get two. Decide: stage-2 delivery REPLACES his daily slot (simpler, do that).
**This is H5 — instrument it**: funnel dashboard already groups by week; add `sequencing` to the intro → mutual conversion query when data exists (can be a follow-up).

### T10 — Phase 2: intent + community-depth onboarding
**Goal**: three new signals: marriage timeline, faith intensity, community config.
**Migration 018**: `users.marriage_timeline text CHECK (IN ('within_1_year','1_2_years','2_5_years','no_timeline'))`, `users.faith_intensity int CHECK (BETWEEN 0 AND 10)`. Community-depth answers go into the EXISTING `hard_preferences.community_fields` jsonb (no schema change) as `{ observance_depth: 'weekly'|'monthly'|'occasionally'|'rarely', union_intent: true|false }`.
**Onboarding**: add to the preferences step (read the step's current religion/observance cascade first and place after it). Copy tone: opportunity-framed, never punitive (activation-tone rule). **The questions must stay GENERIC** — configured per community via a config object (`src/lib/community-config.ts`, new): community `general` gets generic phrasing ("How central is faith in your daily life?" 0–10; "Is a religiously officiated marriage important to you?"). NO LDS-specific words in UX (locked decision §9.4).
**Scoring**: soft multipliers only, same approval flow as T7. Faith-intensity proximity (within 2 points → ×1.05); timeline alignment (both within_1_year → ×1.05).
**Verify**: new staging signup persists all three; admin profile view shows them.

### T11 — Phase 1.5a: conversation cards
**Goal**: kill the blank page in chat. Each user privately sees 2–3 tailored prompt cards about the OTHER person.
**How**: generate cards ONCE at mutual-match creation (in `createMutualMatch` flow or the feedback route right after it) — NOT per message (cost + latency). New table via migration 019: `conversation_cards (id, mutual_match_id, for_user_id, card_text, source_fuel text, used boolean default false, created_at)`. Generation: Haiku call with both composites; input = other person's `conversation_fuel[]` (composite_profiles, populated by extraction-v2) + `notable_quotes`; output = 3 cards, each ≤120 chars, imperative ("Ask her about…"), NEVER quoting the other person verbatim (their voice memos are private), NEVER mentioning appearance. Model: `claude-haiku-4-5-20251001`. Render in `ChatWindow.tsx` above the input as dismissible chips; tapping inserts text into the input (editable — scaffold, never ghost-write, locked decision §9.6).
**Fallback**: if `conversation_fuel` is empty (older profiles), fall back to `interest_tags`; if that's empty, no cards (never generic filler).
**Verify**: create a mutual match between two staging test users → both get distinct card sets referencing the other's actual content; cards render; tapping inserts.
**Instrument (H9)**: log card-tap in a `card_used` update; funnel comparison chat→meet-decision for matches with/without card usage comes later.

### T12 — Phase 1.5b: two-tap date proposals
**Goal**: after both meet-decisions are yes (status `planning`), the system proposes 3–4 fully-specified plans; picking one = confirmed.
**Read first**: `/api/date-planning`, `/api/dates` (propose/confirm/cancel/complete actions), `date_planning_prefs`, `user_availability` (jsonb day/time grid), `DatePlanning.tsx`, `DateProposal.tsx`.
**How**: new endpoint `/api/date-planning/suggestions` (POST, mutual_match_id): intersect both users' `user_availability` grids → next 2 overlapping slots within 7 days; pick activities from both users' `date_planning_prefs` (activity types they both listed, else default set: dessert place, hot chocolate/café, mini golf, gallery walk — **non-alcohol defaults, always**); generate 3–4 `{activity_type, venue_name?, scheduled_at}` combos. Venue names: skip real venue lookup in v1 (no paid APIs without approval) — propose activity + time, venue freetext filled by users, or reuse whatever venue fields `DatePlanning.tsx` already handles. UI: proposals rendered as cards in `DatePlanning.tsx`; tap card → confirm screen → creates `scheduled_dates` row status `confirmed` with `confirmed_by` (two taps total).
**Verify**: staging pair in `planning` status sees ≥3 suggestions honoring both availability grids; two taps produce a confirmed `scheduled_dates` row; pre-date-nudge cron picks it up (check `pre_nudge_sent` after running cron manually).

### T13 — Phase 1.5c: second-date broker
**Goal**: the `second-date-check` cron currently only COUNTS mutual-yes-no-next-date pairs (`secondDatePending`). Make it act: auto-propose a second date via the T12 suggestion engine.
**How**: in `src/app/api/cron/second-date-check/route.ts`, replace the `secondDatePending++` branch: call the T12 suggestion generator, create a `scheduled_dates` row status `proposed` with `proposed_by` = system (use user_a as proposer, but message framing "PLY suggests"), notify both (email via `src/lib/email.ts` — add a template `secondDateSuggestion`; tone: "You both said yes — here are three times that work").
**Verify**: staging pair with 1 completed date + both `want_to_see_again='yes'` + no open date → cron run creates a proposed date + sends 2 emails (check Resend dashboard or logs).
**Depends on**: T12.

### T14 — `not_attracted` pass-share metric
**Goal**: the H2 tracker. One number: share of passes with reason `not_attracted`, weekly.
**How**: `match_feedback` already stores `reason` per pass; add to `/api/admin/funnel` response (`passReasons` weekly series or overall %) and a small tile on `/admin/funnel` page. If >~40% sustained, that's the signal to invest more in attraction matching (tell Charles, don't just build).
**Verify**: seed a few passes with reasons on staging; tile shows correct %.

### T15 — Q2: Stripe subscription (WRITE SPEC FIRST)
**Do not build this from this paragraph.** When Q1 gate is near (see one-year-plan.md §3), write `specs/monetization.md` covering: Stripe Checkout + customer portal, 14-day trial, $29/mo (+$19 founding grandfather), webhook handling (Coolify env for keys, Tier-1 alert on webhook failures), `users.subscription_status` gating intro delivery (deliver-matches checks it), dunning, **cancel-on-success win screen** (one-year-plan §2.5), and what free-tier users see (paywall placement decision — needs Charles). Get the spec approved, then build.

---

## 5. VERIFICATION PROTOCOL (every task)

```bash
npx next build                                   # must pass locally
git push origin HEAD:staging
gh run list --branch staging --limit 1           # wait for success (use until-loop in background)
curl -s -o /dev/null -w "%{http_code}" https://staging-ply.imprevista.com/api/health   # 200
# + task-specific verify steps from §4
```
For migrations: dry-run first (§3), then rely on deploy (post-T5) or the main deploy. After DDL: `NOTIFY pgrst, 'reload schema'`.
For visual/user-facing changes: Charles clicks staging before merging to main. Never claim visual correctness from code reading.

---

## 6. WHEN TO STOP AND ASK CHARLES (hard list)

- Any scoring/multiplier value before it ships (T7, T8, T10) — propose numbers, wait for OK.
- Anything costing money (offsite backup storage, venue APIs, paid tools, server upgrades).
- Merging staging → main (unless he already said go this session).
- Manual production-DB writes (migrations outside the deploy flow).
- Paywall placement + pricing final call (T15).
- Any repo visibility, secrets, or auth-model change.
- If two approaches both failed — don't try a third variation silently.
- If a quarterly gate (one-year-plan §3) is missed by >50% — surface it, don't quietly continue.

## 7. RECURRING: weekly metrics review (R1)
Once real users exist: each Monday session, read `/api/admin/funnel` (with secret), report to Charles: signups, gender ratio per metro (flag >1.5:1), north-star median, verified dates, `not_attracted` share, second-date rate, and WHICH of the five bottleneck stages is currently binding (top-of-funnel / filtering / attractiveness / connection / retention). One paragraph, numbers first. No product changes from this review without a task.

## 8. TONE & COPY RULES (for any user-facing text you write)
- Conversational, witty, brief. Never marketing-speak, never punitive. Scarcity = opportunity ("invite friends, jump the queue"), never anxiety.
- Never describe physical appearance in intros/narratives (hard rule in the prompt stack).
- Never expose one user's private voice-memo content to another.
- No LDS-specific words anywhere in product UX. Community targeting lives in marketing channels, not the product.

## 9. DECISION LOG (locked — do not relitigate)
1. **2026-07-02** Thesis: velocity + community-pool compatibility + explicit attraction modeling. Validated against Keeper data (`specs/roadmap-2026-07.md` §1).
2. **2026-07-02** North star: median days signup → first completed (V1-verified) date. Guardrail: second-date intent rate.
3. **2026-07-02** Attraction architecture: Elo band = consensus component (keep), per-pair votes = taste component (build). No vision-model photo analysis at this scale.
4. **(standing)** No community-specific branding in UX; generic platform + per-community config.
5. **2026-07-02** Phase 1.5 order: conversation cards + two-tap dates first; voice-notes-in-chat PARKED; assisted-mode rollout experiment-driven (no a-priori heuristic).
6. **2026-07-02** Assistance scaffolds, never ghost-writes (AI-courtship-display backlash, Keeper finding).
7. **2026-07-02** Date verification: V1 (both feedbacks) is the "verified date" definition; V2 = location check-in framed as safety feature (build after Phase 1.5); V3 continuous location REJECTED.
8. **2026-07-06** Revenue: subscription-only, ~$29/mo, with the five misalignment guardrails (one-year-plan §2). Success-fee and concierge models were considered and rejected by Charles.
9. **2026-07-06** Marketing: organic/community → influencer → paid, in that order, women-first always.
10. **2026-07-06** Ops: solo + AI at ~10 hrs/wk; anything needing >30 min/wk of manual human time gets automated or cut.
11. **(standing)** Matching model frozen until walk-forward outcome data exists.

---
*Created 2026-07-06 by the Fable planning session. Update STATE + checklist every session. If this doc and reality disagree, fix the doc in the same commit that fixes the code.*
