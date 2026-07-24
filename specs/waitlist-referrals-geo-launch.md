# Waitlist Referral Jumps + Geographic Launch (T16b)

**Written 2026-07-24. Spec, not built. Extends the live `/waitlist` (T16, prod 2026-07-23) and the locked per-metro go-live gate in `specs/launch-plan-2026-07.md` §3.**

## The one insight

The two questions — "make referral jumps real" and "launch by geography" — are the **same lever**. If we launch city-by-city (we should — see Part B), then the meaningful thing to move up isn't a national queue, it's **your city's launch order and your spot within it**. So referrals should do two things at once: move you up *within your metro*, and push *your metro* toward opening first. "Invite friends to jump the queue" becomes "**invite friends in your city so it opens first — and you're near the front when it does.**" That's more motivating (local, concrete) and strategically correct (it recruits the density we actually need).

---

## Part B first (it frames Part A): should we launch by geography? **Yes.**

This isn't a close call — it's forced by the cold-start/liquidity problem and it's already the locked strategy:

- **A dating app with a thin, nationally-spread pool is dead on arrival.** 500 signups spread across the US = nobody has a viable set of nearby matches = everyone churns. 500 signups in Utah Valley = a real market. Match quality (and therefore retention, and therefore everything) is a function of *local* density, not total signups.
- **Every successful dating launch did this**: Tinder (one campus at a time, seed the sorority first), The League (per-city admission gated on density), Cerca (a campus "goes live at 40 verified students"), Thursday (one city, one day). NFX: 82% of network-effect winners started by dominating one small market. (Sources in `launch-plan-2026-07.md` §1.)
- **It's already our plan**: one-year-plan §3 (Q1 = Utah Valley only), launch-plan §3 (per-metro go-live gate `{min_men, min_women, max_ratio}`), and the women-first constraint (§4) all assume geographic launch. This spec just operationalizes it on top of the waitlist we now have.

**So the waitlist's job is not just "collect emails" — it's "tell us which city crosses the density+balance threshold first, and stock that city's launch cohort."** The ZIP we capture is the whole point.

### How geographic launch works on top of the waitlist

1. **Rank metros by readiness**, not raw signups. A metro is "ready" when it clears a **female floor** and a **ratio ceiling**, not just a headcount — women-first is the binding constraint (§4). Proposed default gate (Charles's numbers to confirm):
   - `min_women ≥ 75` **and** `ratio (men:women) ≤ 1.5:1` **and** `min_total ≥ 150`.
   - Utah Valley (Provo-Orem) is the designated first metro regardless of ranking.
2. **Public per-metro countdown** (the Cerca rallying mechanic): the `/waitlist` success screen and nurture emails show *"Provo-Orem: 68 of 75 women to go — invite friends to open your city."* Framed as opportunity, never scarcity-anxiety (tone rule).
3. **When a metro crosses the gate**, invite that metro's waitlist into onboarding **women-first, then men in referral+signup-priority order**, throttled to hold the ratio (launch-plan §3 already specs this admission flow). Matching activates once the onboarded pool holds the ratio.
4. **Admin metro dashboard** (build this first — it's how Charles *sees* the geography data): per-metro table of signups / women / men / ratio / % to gate, sorted by readiness. Turns the waitlist into a launch-decision instrument.

### ⚠ Data gap that blocks metro ranking (fix required)

`zip_locations` resolves only **6,260 of 33,144 ZIPs** to a `metro_code` (~19%). Provo-Orem works (that's why the prod test resolved), but most signups nationwide won't map to a metro. Before metro ranking is trustworthy:
- **Short term:** for unresolved ZIPs, fall back to **state + ZIP3 prefix** clustering (ZIP3 ≈ a region; good enough to spot a cluster forming). Store `zip3` = first 3 digits on every waitlist row.
- **Right fix:** backfill `metro_code`/`metro_area` for the full US ZIP set (CBSA crosswalk is public data — one-time load, no cost). Recommended before spending meaningfully on ads outside Utah Valley.
- Utah Valley launch is **not** blocked by this — its ZIPs resolve today.

---

## Part A: make referral jumps real

### Model (per-metro effective position)

Position is computed **within your metro** (falls back to global if metro unresolved), on read:

```
signup_index(u)   = u's rank by created_at within their metro (1 = earliest)
referrals(u)      = count of DISTINCT waitlist rows where referred_by = u.referral_code
                    (capped at REFERRAL_CAP = 20 to bound gaming)
effective_rank(u) = max(1, signup_index(u) - JUMP_SPOTS * min(referrals(u), REFERRAL_CAP))
position(u)       = 1 + count of peers v in same metro with effective_rank(v) < effective_rank(u)
```

- `JUMP_SPOTS = 25` per referral (Charles to confirm). Rationale: the first referral must produce a *visible* jump (Harry's/Robinhood: first tier trivially attainable), and 25 is meaningful without making 2-3 referrals leapfrog the whole list.
- Computed on read — O(n) per metro, trivial at waitlist scale. If a metro ever exceeds ~50k, precompute into a `priority_score` column.
- **No schema change strictly required** (referral_count derivable from `referred_by`), but add `zip3 text` (for the coverage fallback) and optionally a denormalized `referral_count int` if read cost matters later.

### What counts as a referral (and anti-gaming)

- Trigger: a **new distinct-email** waitlist row with `referred_by = your code`. Unique-email constraint already blocks the same address twice.
- **Self-referral** impossible (code is generated at insert, after `referred_by` is read).
- **Cap** counted referrals at 20 (→ max 500-spot jump) so a script can't run the table.
- **Phase-2 hardening (recommended before referrals gate anything real):** double opt-in — a referral only counts once the referred email clicks a confirmation link. This kills fake-email gaming *and* upgrades list quality (confirmed emails convert far better). Not needed for v1 display honesty, needed before referrals influence launch admission order.

### API + UI changes

- **`/api/waitlist` POST**: apply the referral bonus in the returned `position`. On a new referred signup, look up the referrer and (optional) send a **"you moved up N spots" email** — the Robinhood re-engagement trick; highest-value nurture touch.
- **New `GET /api/waitlist/status?code=<referral_code>`**: returns current position + referral count, so a returning visitor (and the "you moved up" email link) shows the live number.
- **Success screen** (`/waitlist`): show position, **referral count**, "Each friend who joins moves you up 25 spots — and helps open {metro} sooner," the share link, and (phase 2) the metro countdown bar. Currently the live page shows a *global* position; switching to per-metro is part of this build.
- **Instrumentation** (growth-cockpit rule): pre-register the experiment before shipping — metric = referral share of waitlist signups, direction up, ~28-day window. Drop the `🔬 EXPERIMENT: <id>` line in the DONE block.

---

## Recommended phasing

- **Phase 1 (small, do now):** (a) referrals reorder position for real (global for now — simplest honest version), (b) **admin metro dashboard** so Charles can watch which city is forming, (c) add `zip3` capture + ZIP3 fallback so unresolved ZIPs still cluster. This makes the promise real and makes geography *visible* without the full go-live machinery.
- **Phase 2 (when a metro nears the gate):** per-metro position + public countdown + metro go-live admission flow (ties into launch-plan §3) + double opt-in confirmation + backfill full US metro crosswalk.

## Decisions needed from Charles

1. **Gate numbers** per metro: `min_women`, `max_ratio`, `min_total` (proposed 75 / 1.5:1 / 150).
2. **`JUMP_SPOTS`** per referral (proposed 25) and **cap** (proposed 20).
3. **Per-metro vs global position display** in Phase 1 — I lean global-now / per-metro-Phase-2 to ship fast, but if you want the "open your city" framing live immediately, we do per-metro in Phase 1 (slightly more build).
4. Backfill the full US metro crosswalk now, or defer until ads go beyond Utah Valley?

**Synopsis:** Yes to geographic launch — it's forced by dating liquidity and already our locked plan; the waitlist's ZIP is what decides launch order. Make referrals real as a per-metro jump so inviting friends both moves you up *and* opens your city sooner (one lever, not two). Phase 1 = referrals reorder + admin metro view + ZIP3 fallback (small); Phase 2 = public countdown + go-live admission. One real blocker to fix before national ads: 81% of ZIPs don't resolve to a metro.
