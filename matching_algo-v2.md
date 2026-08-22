# Matching Algorithm v2 — Execution Brief

**Status:** APPROVED by Charles 2026-08-22 (decisions D1–D10 below). This doc is written to be executed by a fresh session with no access to the approving conversation.
**Companion docs:** `specs/matching-v2-test-plan.md` (canonical test plan — binding), `specs/matching-v2-decision-memo.md` (the reasoning + literature; read for *why*, not *what*).
**Supersedes:** `matching_algo-v1.md` — except the Intro Tone Rules, copied verbatim into §6.5 so this file is canonical going forward.

**Read first if you're the executing session:** `EXECUTION.md` (house protocol — frozen-model rule §0.4 is *satisfied* for the items in this brief: Charles approved them 2026-08-22; anything NOT in this brief is still frozen). Then this file end-to-end. Then the test plan.

**Notation:** every constant marked **(SV)** is a starting value — arbitrary, tunable, logged; never present one as derived.

---

## 1. Locked decisions (Charles, 2026-08-22)

| # | Decision |
|---|---|
| D1 | Launch at **40–60 signups, roughly gender-balanced, one metro**. Below that = keep banking waitlist. |
| D2 | **Sequential same-candidate re-pitching**: a candidate gets K ∈ {1,2,3} pitches in different angles, K and angle order randomized. |
| D3 | **1 pitch/day** per reader. Re-pitches occupy subsequent days (Dane day 1–3, then next person). |
| D4 | **No fire quota.** The friction is Rule-1 permanence, surfaced at reveal: "If you reveal and pass, they're gone for good." |
| D5 | Quiz = **Battery B** (~23 items, §4) — AND stories stay voice-native: quiz answers drive targeted voice prompts (§4.4). Never all-multiple-choice. |
| D6 | Style matrix = **4 angles × 2 content leads**, randomized; register (playful/earnest) personalized from the quiz, not randomized. §6 is the deepened spec. |
| D7 | **Do NOT show users their own pitch** at onboarding. The reveal step keeps its current personality-radar content. |
| D8 | **Milieu term in the sort from day one — built highly testable**: pure function, env-flag kill switch, dual-score logging, unit-tested, pre-registered (§9). |
| D9 | **Pitch-taste calibration step**: after the quiz, rate 8 sample pitches 1–5 (§5). |
| D10 | **Waitlist quiz, phase 2**: launch with completion-tease payoff; shareable type card is an approved fast-follow (needs type names + card design first). |

---

## 2. Disposition of v1 and the live code

**KEPT (do not touch):**
- Hard filters, bidirectional (`src/lib/db.ts` `applyHardFilters`) — age, kids, faith essential+must_match, smoking, blocks.
- Elo soft retrieval band ±150→±300→everyone (Rule 5), `src/lib/elo.ts` untouched.
- Location tier multipliers (`src/lib/geo.ts`).
- T7 attraction priors (calibration-vote multipliers in `selectNextCandidate`).
- Rule 1: photo-stage rejection is permanent and mutual. Rule 7: never the same intro text twice.
- Onboarding calibration photo swipes (seed photos only — no real local candidates).
- Post-fire funnel: interested/not → mutual → chat → meet-decision → dates. v2 does not touch anything after the photo decision.
- Woman-first sequencing (`WOMAN_FIRST_SEQUENCING` env flag, default off, Charles flips it) — compatible with v2; note men's pitch volume halves when on, so the experiment learns mostly from women readers. That is acceptable (Keeper-consistent).
- The 9 Intro Tone Rules (§6.5).

**KILLED (from v1 doc / live code — remove or ignore):**
- The fire-quota + save-queue economy (v1 §"The 🔥 System"). No quotas, no saved queue, no bonus fires.
- The Daily Three batch (3 simultaneous cards). Delivery is 1/day sequential. `DailyThree.tsx` gets reused as the single-card renderer (it already handles 1..3 cards).
- Hidden re-pitching (current `getRePitchCandidateIds(userId, 60)` blunt 60-day path) — replaced by §7's explicit sequencing.
- Excitement-type steering of strategy selection (`applyExcitementModifiers` in `src/lib/narrative-strategy.ts`) — angle assignment is randomized in Phase R; excitement types survive only as logged metadata.
- v1's tier_weights learning-rate update rules and Thompson sampling *at launch* (returns in Phase T, §11).
- The 12-strategy selector as the angle chooser. Strategies collapse into the 4 angles; the generator prompt takes the angle directly (§6.6).

---

## 3. Pipeline overview

```
eligible pool (hard filters + Elo band + active)          [unchanged]
  → click-sort: compatibility score × location × T7 priors
       × MILIEU multiplier (§9, NEW, flagged)
       → tiebreak: pitch-material richness                 [A2c]
  → pair assignment: draw K + angle order (§7.1, NEW)
  → daily delivery: 1 pitch/day, sequential per candidate (§7.2)
       pitch = generate(angle, lead, register) under tone rules (§6)
  → reader action: 🔥 fire / pass (soft) / not-for-me (hard)
  → fire → reveal → interested/not → existing funnel       [unchanged]
  → everything logged to pitch_events (§10)
  → Phase R: pure randomization → Phase T: Thompson (§11)
```

---

## 4. Reader instrument — Battery B (~23 items, ~4–5 min)

Placement: new onboarding step **after basics, before voice memos** (quiz answers feed the voice prompts, §4.4). Results are **private** — never shown to the user or to matches as scores; individual answers may surface *as pitch content* (that's their second job).

### 4.1 Big Five mini — 10 items, 5-pt agree scale (Strongly disagree … Strongly agree)
Targeting-grade, not clinical. Adapted short-form pairs (one per trait + one reversed), warm phrasing:

| id | item | trait |
|---|---|---|
| B1 | I'm usually the one who gets the group talking | E |
| B2 | After a social weekend I need a quiet day to recover | E (r) |
| B3 | I'll try almost anything once | O |
| B4 | Honestly, I like my routines more than surprises | O (r) |
| B5 | My calendar is real and I obey it | C |
| B6 | Deadlines are more of a vibe than a rule for me | C (r) |
| B7 | People come to me to vent | A |
| B8 | I enjoy winning an argument more than I should | A (r) |
| B9 | I replay conversations in my head afterward | N |
| B10 | Very little rattles me | N (r) |

Scoring: trait = mean(item, 6−reversed) → 1–5, stored to 2dp.

### 4.2 Milieu / "same game" — 8 forced-choice + 1 free-text
Charles's click definition operationalized. Every answer is pitch-usable verbatim.

| id | item | options |
|---|---|---|
| M1 | At 17 you were mostly… | theatre kid / jock / honor-roll grinder / the one organizing the hang / happily unaffiliated |
| M2 | Your group chat role | sends the memes / makes the plans / asks the real questions / voice-note monologuer |
| M3 | At a wedding you're… | dance floor from song one / deep talk at the side table / running the sparkler exit / first to leave, happy |
| M4 | Ideal Sunday | trailhead by 8am / slow brunch + long reading / a project with my hands / friends' place, no agenda |
| M5 | Banter register | teasing is how I show love / earnest is how I show love |
| M6 | Travel | the itinerary is the fun / booking the flight is the whole plan |
| M7 | Social battery | big-group energy / one-on-one depth |
| M8 | A perfect gift you'd give is… | something hilarious / something handmade / something they mentioned once / an experience, not a thing |
| M9 | What do you nerd out on? | **free text, ≤120 chars** (pure pitch fuel + voice-prompt seed) |

### 4.3 Homogamy + conversation — 5 items
| id | item | options | use |
|---|---|---|---|
| H1 | Education | high school / some college / bachelor's / graduate+ | milieu fn (§9) + pitch material |
| H2 | Politics | 5-pt conservative↔progressive + toggle "this matters in a partner" | milieu fn; toggle=on makes >2-step gaps a **hard filter** (bidirectional, same pattern as smoking dealbreaker) |
| H3 | Right now I'm building… | a big career / a big family / genuinely both | milieu fn + pitch material |
| CS1 | First-conversation opener | banter that finds depth / depth that finds jokes | register personalization (§6.4, with M5) |
| CS2 | In conversation I'm more… | the storyteller / the question-asker | logged; later pairing analysis |

### 4.4 Quiz → voice-prompt mapping (the D5b story engine)
The voice step keeps its existing pipeline (record → Whisper → extraction-v2 → composite). What changes: prompt selection becomes dynamic. Each milieu answer maps to a story-fishing prompt; pick 2 fished prompts + 1 existing generic prompt per user (SV):

| answer | voice prompt |
|---|---|
| M1 theatre kid | "Tell me about a performance or project from back then you're still a little proud of." |
| M1 jock | "Tell me about a team you were on and what you were like on it." |
| M3 sparkler exit | "Tell me about the last wedding or party you closed down." |
| M3 deep talk | "Tell me about a conversation at a party you still think about." |
| M4 trailhead | "Tell me about a morning outside that went exactly right." |
| M4 hands project | "What have you made or fixed lately? Walk me through it." |
| M6 itinerary | "Tell me about a trip you planned that went perfectly — or hilariously didn't." |
| M8 mentioned-once gift | "Tell me about the best gift you ever gave. What did it take to pull off?" |
| M9 (any) | "You said you nerd out on {M9}. What pulled you in, and how deep does it go?" |

Fallback: any unmapped/skipped answer → current generic prompt set. Full mapping table lives in code as data (`src/lib/voice-prompt-map.ts`) so copy iterates without logic changes.

### 4.5 Storage
`reader_traits` row per user (§10): `big5 jsonb, milieu jsonb, homogamy jsonb, convo jsonb, pickiness numeric, scale_use numeric, instrument_version text` (start `"B-1.0"`), `completed_at`.

---

## 5. Pitch-taste calibration (D9)

New onboarding step **after photos/calibration swipes, immediately before reveal** (revives the dormant `taste` step slot in `src/app/onboarding/page.tsx` — note the current flow *skips* it: photos advances straight to reveal; rewire).

- **8 sample pitches**, one per matrix cell (4 angles × 2 leads), about **synthetic composite people** (not real users — say "sample" in the UI copy). 8 written per reader-gender orientation = 16 total, authored as part of V2-T3 and each must pass the tone rules + critic ≥ threshold.
- UI: one card at a time, Likert 1–5: **"Would you want to hear more about this person?"** Order randomized per user. ~2 min.
- Persist per vote: `pitch_taste_votes (user_id, sample_id, angle, content_lead, likert, position, created_at)`.
- Derived onto `reader_traits`: `pickiness` = 6 − mean(likert) (higher = pickier); `scale_use` = stddev(likert). An all-5s rater (Charles's "maybe they're not picky" case) → global priors + low scale_use, and their later fires are weighted as less diagnostic in analysis. Per-angle prior = mean likert per angle (stored in `milieu`? no — store as `taste_priors jsonb` on reader_traits).

---

## 6. The style matrix (D6 — deepened)

### 6.1 The four angles — feeling contracts
An angle is defined by **the feeling the reader should have after the last sentence**. This is the executable definition: the generator prompt asserts it, the critic checks it, the analyst labels by it.

| angle | feeling contract | 2×2 position | fed by (composite fields) |
|---|---|---|---|
| `self_expansion` | "My life would get **bigger** with this person in it." | elevation × growth | interest_tags, passion_indicators, goals |
| `i_sharing` | "This person **gets it** — we're seeing the same world." | kinship × growth | humor_signature, aesthetic_resonance, notable_quotes |
| `admiration` | "This is a **quality person** — character proven, not claimed." | elevation × warmth | values_in_action, friend_vouch_quotes, demonstrated mastery |
| `comfort` | "I could **exhale** around this person." | kinship × warmth | communication_warmth, kindness_markers, rhythm-of-life details |

### 6.2 The two content leads — operational test
- **`interest`-led**: the pitch's spine is concrete activities/artifacts. Test: you can list ≥3 concrete nouns from it (truck, trailhead, classroom).
- **`character`-led**: the spine is one behavioral vignette proving a disposition. Test: strip the nouns and the pitch still stands on *how the person is*.

Both leads are writable in all four angles (verified — §6.3). Lead is randomized per attempt, independent of angle.

### 6.3 The 8-cell reference grid — one synthetic subject, all cells
Canonical examples; the generator's output should sit stylistically inside this grid. Subject: *Dane — 3rd-grade teacher, weekend climber, restoring a '74 Ford, dry humor, quote: "Boredom is a skill issue," friends say he remembers everything you tell him.*

| cell | example |
|---|---|
| self_expansion × interest | "Dane runs a third-grade classroom on weekdays and spends Saturdays forty feet up a canyon wall — and somewhere in between he's bringing a '74 Ford back from the dead. Ask him which of the three is hardest; the answer changes monthly." |
| self_expansion × character | "Dane decides a thing is learnable — a crack climb, a carburetor, twenty-six eight-year-olds — and then just learns it. People around him keep accidentally picking up new hobbies." |
| i_sharing × interest | "Dane's the guy mid-belay who says 'boredom is a skill issue' with a straight face and lets you catch it two beats later. His truck, his classroom, his climbing — same joke, told three ways: pay attention and nothing is dull." |
| i_sharing × character | "Dane notices things — the kid who's quiet for the wrong reason, the one bolt that doesn't match. His friends say talking to him feels like getting caught noticing the same thing at the same time." |
| admiration × interest | "Dane teaches third grade by choice, climbs lead on weekends, and is two winters into rescuing a '74 Ford nobody else wanted. He mentions none of it first; you find out sideways." |
| admiration × character | "Twenty-six eight-year-olds a day would sand most people down. Dane's six years in and still keeps a drawer of their bravest-worst drawings — his word for them. Character is what someone keeps." |
| comfort × interest | "Dane's Sundays are practically liturgical: same trailhead, same diner counter, truck parts laid out on a towel like surgery. He's built a life that doesn't need an audience." |
| comfort × character | "Dane is unhurried in a way that's getting rare — he listens without loading his next sentence, and friends swear problems shrink a size just from saying them to him." |

### 6.4 Register — personalized, never randomized
`playful` vs `earnest`, set once per reader from M5 (banter item), tiebreak CS1. Register is the pitch's **voice to the reader**, not a claim about the subject — a playful pitch about an earnest person is legitimate. Stored on reader_traits, stamped on every pitch_event.

### 6.5 Intro Tone Rules — carried verbatim from v1, still binding
1. Never braggy — show actions, don't celebrate them. 2. Never personify the app — no narrator voice. 3. Contradiction > single note. 4. Close with vivid image or joke, never sentiment; no rhetorical questions. 5. Don't explain the meaning — show behavior, stop. 6. Accomplishments as creation, not ego. 7. No superlatives. 8. Specifics > patterns. 9. The intro is about the SUBJECT, not the reader — never "you'd love."

### 6.6 Generator changes (`src/lib/intro-engine-v2.ts`)
- `generateTrailer` gains required params `angle`, `contentLead`, `register`; the prompt injects the feeling contract (§6.1), the lead's operational test (§6.2), register instruction, and the relevant composite fields for that angle. Hook type is no longer assigned by the pipeline's rotation logic — the model chooses freely; whatever it used is classified and **logged** (log-only dimension).
- Keep: 3-draft generation, critic scoring, one regeneration below threshold, 3–4 sentence cap, Rule 7 regeneration on every attempt.
- **Thin-data swap**: if the assigned angle's feeding fields are empty (e.g. no vouches/quotes for `admiration`), swap to the next angle in the pair's drawn order and set `angle_swapped_from` on the pitch_event. Never silently substitute — the swap is a logged event because angle availability correlates with profile richness and the analysis must be able to condition on it.

---

## 7. Sequencing engine (D2 + D3)

### 7.1 Pair assignment (at candidate-selection time)
When the sort picks a new candidate for a reader, create `pair_assignments` row:
- `k_assigned` ~ {1: 0.2, 2: 0.3, 3: 0.5} **(SV)**
- `angle_order` = k distinct angles, uniform random without replacement from the 4
- `lead` drawn per-attempt (fair coin) at generation time, not pre-assigned
- Pure uniform randomization in Phase R — no balancing, no cleverness. Log everything.

### 7.2 Daily delivery algorithm (replaces the delivery portion of `deliver-matches`)
Per eligible reader per day (existing cadence/expiry/auto-pause machinery around it unchanged):
1. **Open sequence exists** (last action = `pass_soft`, attempts remaining)? → deliver `angle_order[next_idx]`, regenerated text, framed in UI as **"Another side of {name}"**.
2. Else → sort picks next candidate → §7.1 assignment → deliver attempt 1 (framed as a normal intro).
3. Reader actions:
   - **🔥 fire** → close sequence → reveal flow (§8). Photo-pass → Rule 1 permanence (both directions, unchanged).
   - **pass (soft)** → `next_idx++`. If exhausted (== k): show optional why-chips — `nothing grabbed me / not my type of person / felt generic / too similar to recent` **(SV chip set)** + skippable — close sequence, candidate → cooled pool.
   - **not for me (hard)** → close sequence immediately, chips optional, candidate → cooled pool. Logged distinctly: hard pass = candidate-level signal; soft pass = angle-level signal.
   - **expire (no action by next delivery)** → redeliver the **same** angle next day, regenerated text; expiries do not consume attempts. Existing 3-inactive-days auto-pause still governs disengagement.
4. **Cooled pool**: re-entry only when no fresh candidate exists (same trigger as today), after ≥21 days **(SV)**, and only with angles the pair hasn't used. Replaces `getRePitchCandidateIds(userId, 60)`.

### 7.3 Why the randomized K + order matters (context for the executor)
The design's threat is position drift ("people just accept the 3rd one"). Randomized order decorrelates angle from position; randomized K makes "the last attempt" unknowable to the reader (and keeps attempt 1 honest); the analysis model (§11) carries an explicit position term so drift is *measured*, not assumed away. Do not "improve" this with deterministic ordering — uniform randomness is the load-bearing wall. See test plan T-SIM.

---

## 8. Fire / reveal UX (D4)

- Buttons on every pitch card: **🔥 Show me them** / **Pass** (label on attempts < k: "show me another side") / **Not for me**.
- No quota, no counter, no save queue. Structural scarcity = 1/day.
- Fire → confirm sheet: **"If you reveal and pass, {name} is gone for good."** → photo + profile reveal → Interested / Not interested (existing flow).
- Photo-coaching loop **(SV thresholds)**: candidate with ≥3 fires ending photo-pass and ≤1 photo-interest → private, kind nudge toward better photos ("Your intros are landing; your photos aren't keeping up" — final copy needs Charles). Surface in admin first month; auto-send later.

---

## 9. Milieu term in the sort (D8b — live day one, highly testable)

- **Pure function**, own module `src/lib/milieu.ts`:
  `milieuSimilarity(a: ReaderTraits, b: ReaderTraits): number` → [0,1]
  = 0.5·(share of M1–M8 exact matches) + 0.2·eduAdjacency + 0.2·(1 − |politics gap|/4) + 0.1·(H3 match: same 1.0 / either "both" 0.7 / mismatch 0.0) **(all weights SV)**
  eduAdjacency: same 1.0 / adjacent 0.7 / else 0.4 **(SV)**. Any missing block → renormalize over present blocks; both sides missing everything → return 0.5 (neutral).
- **Application**: in `selectNextCandidate`, after existing multipliers:
  `score *= 1 + MILIEU_WEIGHT × (2·sim − 1)` — sim 0.5 is neutral; `MILIEU_WEIGHT=0.1` **(SV)** gives ×0.9–×1.1 (same magnitude class as location tiers).
- **Testability requirements (all mandatory):**
  1. Env flag `MILIEU_WEIGHT` (Coolify, staging + prod); `0` = exact pre-v2 behavior = kill switch.
  2. **Dual logging** on every selection: `score_base`, `score_with_milieu`, `milieu_sim`, and the candidate's rank under each, stored on the match/pitch record — the counterfactual ("who would have been picked without the term") is queryable from day one.
  3. Unit tests on fixture pairs incl. all missing-data paths (test plan §2.3).
  4. **Pre-registered** with the growth cockpit before launch (test plan §5) as its own experiment, separate from the style experiment.
  5. Ships as its own commit (one variable per commit).

---

## 10. Schema (migration `0XX_matching_v2.sql` — next free number; `_migrations` table is shared across apps, match by exact filename, never delete rows; after DDL run `NOTIFY pgrst, 'reload schema'`)

```sql
create table pair_assignments (
  reader_id uuid not null references users(id) on delete cascade,
  candidate_id uuid not null references users(id) on delete cascade,
  k_assigned smallint not null check (k_assigned between 1 and 3),
  angle_order text[] not null,
  next_idx smallint not null default 0,
  status text not null default 'open' check (status in ('open','fired','exhausted','hard_passed')),
  created_at timestamptz default now(), closed_at timestamptz,
  primary key (reader_id, candidate_id)
);

create table pitch_events (
  id uuid primary key default gen_random_uuid(),
  reader_id uuid not null references users(id) on delete cascade,
  candidate_id uuid not null references users(id) on delete cascade,
  daily_intro_id uuid references daily_intros(id),
  angle text not null check (angle in ('self_expansion','i_sharing','admiration','comfort')),
  content_lead text not null check (content_lead in ('interest','character')),
  register text not null check (register in ('playful','earnest')),
  hook_type text,
  position smallint not null,            -- attempt # within this pair: 1..3
  k_assigned smallint not null,
  angle_swapped_from text,
  narrative text not null,
  critic_score numeric, critic_subscores jsonb,
  score_base numeric, score_with_milieu numeric, milieu_sim numeric,
  action text check (action in ('fire','pass_soft','pass_hard','expired')),
  acted_at timestamptz, why_chips text[],
  photo_outcome text check (photo_outcome in ('interested','not_interested')),
  delivered_at timestamptz, created_at timestamptz default now()
);
create index idx_pitch_events_reader on pitch_events(reader_id, created_at desc);
create index idx_pitch_events_analysis on pitch_events(angle, content_lead, position);

create table reader_traits (
  user_id uuid primary key references users(id) on delete cascade,
  big5 jsonb, milieu jsonb, homogamy jsonb, convo jsonb,
  taste_priors jsonb, pickiness numeric, scale_use numeric,
  register text check (register in ('playful','earnest')),
  instrument_version text not null, completed_at timestamptz default now()
);

create table pitch_taste_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  sample_id text not null,
  angle text not null, content_lead text not null,
  likert smallint not null check (likert between 1 and 5),
  position smallint not null,
  created_at timestamptz default now()
);
```
`daily_intros` stays as the delivery/expiry record; `pitch_events` is the experiment's atom, linked via `daily_intro_id`. The dead `taste_calibration` table is left in place (shared-DB caution) but unused; `pitch_taste_votes` replaces it.

---

## 11. Learning phases + analysis

- **Phase R (launch)**: pure randomization. No adaptive assignment of any kind. Exit gate: ≥1,200 pitch_events with actions OR 4 weeks **(SV)**, whichever later.
- **Phase T**: Thompson sampling over angles per reader-segment, exploration floor ε = 0.15 **(SV)**. Not built at launch — do not build it speculatively.
- **Analysis model** (offline, `scripts/matching_v2_analysis.py`, python + statsmodels — runs anywhere with a DB dump, not in the app):
  `fire ~ angle + content_lead + position + pickiness + (1|reader) + (1|candidate)` — mixed-effects logistic. Report ORs with CIs by angle/lead; position coefficient = the measured "3rd-pitch drift".
- **Admin surface** (extend `/admin`): raw fire-rate table by angle × lead × position with counts + Wilson CIs; guardrail table photo-interest-given-fire by angle; swap-rate by angle (thin-data monitor). Raw rates only in-app — the model runs offline.
- **Guardrail (pre-registered):** an angle with top-quartile fire rate and bottom-quartile photo-interest-given-fire is flagged clickbait — surfaced, not auto-acted.

---

## 12. Build order (each = own commit(s); staging first; verify per test plan)

| task | what | key files |
|---|---|---|
| V2-T1 | Migration §10 + PostgREST reload + db helpers | `migrations/`, `src/lib/db.ts` |
| V2-T2 | Quiz step UI + scoring + `reader_traits` persist + politics hard-filter toggle wiring | `src/app/onboarding/page.tsx`, `src/lib/db.ts`, `applyHardFilters` |
| V2-T3 | 16 sample pitches (authored, critic-passing) + pitch-taste step UI + derived pickiness/scale_use/taste_priors | onboarding `taste` step (currently skipped — rewire), `src/lib/sample-pitches.ts` |
| V2-T4 | Voice-prompt mapping (`src/lib/voice-prompt-map.ts`) + dynamic prompt selection in the voice step | voice step component |
| V2-T5 | Milieu module + flag + dual logging (§9) | `src/lib/milieu.ts`, `src/lib/matchmaker.ts` |
| V2-T6 | Sequencing engine (§7): pair_assignments, K/order draw, delivery algorithm, pass semantics, cooled pool | `deliver-matches/route.ts`, `src/lib/db.ts` |
| V2-T7 | Generator changes (§6.6): angle/lead/register params, feeling contracts in prompt, thin-data swap, hook classification+logging | `src/lib/intro-engine-v2.ts` |
| V2-T8 | Card UX: three buttons, "Another side of {name}" framing, permanence confirm, why-chips | `DailyThree.tsx`, dashboard, feedback route |
| V2-T9 | Admin analysis surface + `scripts/matching_v2_analysis.py` + T-SIM script | `src/app/admin/`, `scripts/` |
| V2-T10 | Pre-registration of both experiments (style matrix; milieu term) with the growth cockpit | — |
| V2-T11 (phase 2, post-launch) | Waitlist quiz: SMS link → standalone quiz page keyed by phone → merge into `reader_traits` at signup; tease payoff copy; shareable type card = separate approved fast-follow | new route |

Launch gates: test plan §7 checklist, all green. Deploy via normal main push; staging verification first per EXECUTION §house rules.
