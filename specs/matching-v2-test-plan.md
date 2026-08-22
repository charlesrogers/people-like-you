# Matching v2 — Canonical Test Plan

**Binding companion to `matching_algo-v2.md`.** A v2 task is not done until its tests here are green; launch is gated on §7. Constants marked **(SV)** are starting values.
**Test stack:** unit/integration in the repo's test runner (add `vitest` if none exists — check `package.json` first; scheduled jobs must not install dev deps, so tests run in CI's build gate only, never in cron containers). Statistical validation is python (`scripts/`).

---

## 1. Philosophy

Three failure classes, three defenses:
1. **Mechanical bugs** (wrong K, repeated angle, quota ghosts) → unit tests, §2.
2. **Integration breaks** (cron delivers wrong thing, data not logged) → staging end-to-end scripts, §3.
3. **Design failures** (the experiment can't answer its own question — the expensive, invisible class) → synthetic-data recovery, §4. This is the canonical part: we prove the analysis works **before** a single real user generates data.

---

## 2. Unit tests

### 2.1 Assignment randomness (`pair_assignments`)
- U1: over 10,000 draws, K distribution within ±2pp of {.2,.3,.5} (chi-square p > .01).
- U2: `angle_order` always k **distinct** angles from the 4; over 10,000 draws each angle appears in each position at uniform frequency ±2pp.
- U3: lead coin over 10,000 draws: 50% ±2pp.
- U4: assignment is created exactly once per (reader, candidate); re-selection of an open pair is impossible.

### 2.2 Sequencing semantics (§7.2 of the brief)
- U5: soft pass at position < k → next delivery for that reader is the SAME candidate, NEXT angle in order.
- U6: soft pass at position == k → sequence `exhausted`; next delivery is a NEW candidate.
- U7: hard pass at any position → sequence closed immediately; remaining angles never delivered.
- U8: fire at any position → sequence `fired`; no further pitches for the pair.
- U9: expiry → same angle redelivered next cycle with **regenerated** text (Rule 7: narrative differs); `position` does not increment; no attempt consumed.
- U10: cooled-pool re-entry only when fresh pool is empty AND ≥21d **(SV)** since close AND with unused angles only; `fired` + photo-passed pairs NEVER re-enter (Rule 1 permanence, both directions).
- U11: no quota logic anywhere — a reader can fire on consecutive days.

### 2.3 Milieu function (`src/lib/milieu.ts`)
- U12: fixture pairs — identical traits → 1.0; fully disjoint → ≤0.1; hand-computed mixed fixture → exact expected value.
- U13: missing-data paths — one block missing → renormalized over present blocks; ALL blocks missing on either side → exactly 0.5 (neutral).
- U14: `MILIEU_WEIGHT=0` → `score_with_milieu === score_base` for every candidate (bit-identical ranking to pre-v2).
- U15: multiplier bounds — for any sim ∈ [0,1] and weight 0.1: multiplier ∈ [0.9, 1.1].
- U16: politics hard-toggle — toggle on + gap > 2 steps → filtered bidirectionally; toggle off → never filters, only feeds sim.

### 2.4 Quiz scoring
- U17: Big Five reversal — all-5s answers → E=O=C=A=N computed with reversed items as 6−x (hand-computed fixtures).
- U18: pickiness/scale_use — all-5s taste votes → pickiness 1.0, scale_use 0; alternating 1/5 → hand-computed values.
- U19: register derivation — M5 teasing → `playful`; earnest → `earnest`; M5 missing → CS1 tiebreak; both missing → `earnest` (default **(SV)**).

### 2.5 Generator contract (mocked LLM)
- U20: prompt contains the assigned angle's feeling contract, the lead's operational test, and the register instruction (string assertions on the built prompt).
- U21: thin-data swap — empty vouches+quotes+values_in_action with `admiration` assigned → next angle in order used, `angle_swapped_from='admiration'` logged. Never an unlogged substitution.
- U22: every generated pitch_event row has non-null angle, content_lead, register, position, k_assigned, narrative.

## 3. Integration tests (staging, scripted curl + psql assertions; run per deploy of V2-T6..T8)

- I1 **Full sequence walk**: two fresh test users (opposite genders, passing filters) → run cron 3× with soft-passes injected between runs → assert 3 pitch_events for the pair with positions 1,2,3, three distinct angles, three distinct narratives, statuses correct; 4th run delivers a different candidate (or empty-pool state if pool exhausted).
- I2 **Fire walk**: fire on position 1 → reveal → `not_interested` → assert pair closed, Rule 1 block present both directions, candidate absent from all future selection.
- I3 **Quiz → traits → voice**: complete quiz via API → `reader_traits` row correct (spot-check scored values) → voice step returns fished prompts matching the mapping table for the given answers.
- I4 **Taste step**: submit 8 votes → 8 `pitch_taste_votes` rows with correct cells → `taste_priors`/`pickiness`/`scale_use` populated.
- I5 **Dual-score logging**: every selection writes `score_base`, `score_with_milieu`, `milieu_sim`; flip `MILIEU_WEIGHT` 0↔0.1 on staging → ranking changes only via the milieu term and base scores are unchanged.
- I6 **Woman-first compatibility**: with `WOMAN_FIRST_SEQUENCING=true`, the sequencing engine runs on the woman's stream and the man receives nothing until her fire+interest (existing T-flow), pitch_events logged for her stream.
- I7 **Cron safety regression**: expire-before-check ordering still holds (the July incident class) — a stale pending intro never blocks delivery; run cron with a 21h-old pending → expired + new delivery same pass.

## 4. Statistical validation — T-SIM (the canonical test; pre-launch gate)

`scripts/matching_v2_sim.py` (numpy/pandas/statsmodels; no app dependencies).

**Generative model (SV parameters, mirror launch assumptions):**
- 50 readers × up to 45 pitches each, assignment exactly per §7.1 (K dist, uniform angle order, lead coin).
- `logit(fire) = β₀ + β_angle[a] + β_lead[l] + β_pos[p] + u_reader + v_candidate`, with β₀ → baseline ≈ 20%; injected truth: one angle +10pp, one −5pp, lead +5pp, **position-3 drift +5pp** (the "everyone accepts the 3rd one" effect, deliberately injected), u_reader ~ N(0, 0.5²), v_candidate ~ N(0, 1.0²) (candidate variance deliberately dominant).

**Acceptance criteria:**
- S1 **Recovery**: over 200 simulated cohorts, the analysis model's 95% CIs cover each true β ≥ 90% of the time, and the +10pp angle is detected (CI excludes 0) in ≥ 80% of runs.
- S2 **Confound separation**: with position drift injected, angle estimates stay unbiased (mean absolute bias < 1pp) — proves randomized order + position term actually decorrelate the confound. **This is the direct answer to Charles's C12 concern; if S2 fails, the design is wrong — stop and redesign, do not launch.**
- S3 **Null safety**: with all true effects 0, false-positive rate on angle contrasts ≤ 5–7%.
- S4 **Power honesty**: report the minimal detectable effect at 1,200 / 2,250 / 4,500 events; write the realized numbers into the pre-registration (no invented thresholds).

## 5. Experiment pre-registration (before launch, growth-cockpit API per global rules)

Two separate registrations:
- **E-STYLE**: metric = fire rate by angle/lead (source unwired — registers with warning, readout pends); hypotheses, directional **(all SV, from decision-memo F4)**: H1 high-O readers → `self_expansion`/`i_sharing` lift; H2 high-E → `i_sharing` lift, low-E → `comfort` lift; H3 interest-led beats character-led overall; H4 position-3 drift exists (+2–8pp). Window: 6 weeks (D1 cohort). Guardrail: photo-interest-given-fire by angle (clickbait detector).
- **E-MILIEU**: treatment = MILIEU_WEIGHT 0.1 vs the logged counterfactual ranking; metric = fire rate on milieu-boosted picks vs counterfactual picks; honest framing: observational at this N, logged for later validation; kill switch = flag to 0.

## 6. Guardrails & monitoring (live)

- G1: admin fire-rate table (angle × lead × position, counts + Wilson CIs) — reviewed weekly.
- G2: photo-interest-given-fire by angle — the Goodhart guardrail.
- G3: angle swap-rate (thin-data monitor) — if any angle swaps > 20% **(SV)**, profile richness is the bottleneck, not style.
- G4: photo-coaching candidates list (≥3 fire→photo-pass, ≤1 interest **(SV)**) — surfaced to Charles, no auto-send in month 1.
- G5: cron failure alerting per house rule (Discord on failure; the delivery cron already runs server-side — any new scheduled analysis job gets `if: failure()`-equivalent alerting or doesn't ship).

## 7. Launch gate checklist

- [ ] All §2 unit + §3 integration tests green in CI (build gate before Docker, per house deploy standard)
- [x] **T-SIM S1–S4 PASS (2026-08-22)** — `scripts/matching_v2_sim.py`, results in `specs/matching-v2-tsim-results.md`, run log `specs/matching-v2-tsim-run.txt`. S2 (the C12 gate) passes decisively: injected position-3 drift moves angle estimates by ≤0.044pp. Realized angle-contrast MDEs **+10.62 / +7.46 / +5.11 pp** at 1,200 / 2,250 / 4,500 events — still to be written into the E-STYLE registration. **Two corrections fall out of the sim: the §11 fitter recipe (results §3) and H1/H2/H4 power (results §5).**
- [ ] Migration applied on staging + prod, `_migrations` row by exact filename, PostgREST schema reloaded
- [ ] `MILIEU_WEIGHT` set in Coolify (staging + prod), kill-switch flip verified on staging (I5)
- [ ] E-STYLE + E-MILIEU registered; experiment IDs recorded in the DONE block and EXECUTION.md
- [ ] Charles has approved: final quiz copy, 16 sample pitches, why-chip copy, photo-coaching copy (tone: never punitive — scarcity/feedback framed as opportunity)
- [ ] Cohort gate: ≥40 onboarded, roughly balanced, one metro (D1) — per-gender countdown already governs go-live (T16 revised)
