# 🔫 FARM-OUT — Build & ship the v2 quiz + fished voice prompts (V2-T1, V2-T2, V2-T4)

**For:** a dedicated Opus 5 session. **Commissioned by Charles 2026-08-23.**
**Goal in his words:** *"I want it to be fun, fast, and feel like they really are being seen / describing themselves well."* Those three words are the acceptance criteria, not decoration — §4 turns each into something measurable.
**Branch:** all of the deep-dive output lives on **`session/s-0822-1436`** (pushed to origin). Branch from it — `git fetch origin && git checkout -b <your-session-branch> origin/session/s-0822-1436`. None of these specs are on `main` yet.
**Ship target:** staging (`https://staging-ply.imprevista.com`), clickable end to end, so Charles can run the flow himself. **Not** production.

---

## 0. Read before touching anything

| order | file | why |
|---|---|---|
| 1 | `EXECUTION.md` §0, §3, §5 | house protocol, infra, verification. §0.4's frozen-model rule is **satisfied** for everything in this spec (Charles approved D1–D10 on 2026-08-22 and the battery on 2026-08-23); anything not in this spec is still frozen |
| 2 | `tasks/lessons.md` | the last five entries are all from this workstream |
| 3 | `specs/matching-v2-questionnaire-battery-v1.md` | **the copy is frozen. Do not improve it.** Six review passes with Charles produced it |
| 4 | `specs/matching-v2-voice-prompt-map.md` | the 47 prompts + selection rule |
| 5 | `matching_algo-v2.md` §4.5, §10 | storage shape, migration |
| 6 | `specs/matching-v2-test-plan.md` §2.3, §2.4, §3 | the tests that bind you |
| 7 | `specs/matching-v2-questionnaire-research.md` | why the design is what it is — read if you are tempted to change something |

**Copy freeze is absolute.** Every stem, option, block card and microcopy string in the battery spec ships byte-for-byte. If something reads wrong to you, ship it as written and raise it with Charles — do not fix it in the PR.

---

## 1. Scope

**In:**
- **V2-T1** — migration + db helpers
- **V2-T2** — quiz step UI, scoring, `reader_traits` persistence, politics 3-way hard-filter wiring, Q19 text-or-audio capture
- **V2-T4** — `src/lib/voice-prompt-map.ts` + dynamic prompt selection in the voice step
- Instrumentation (§5) — required, not optional; N1/N2 cannot be measured retroactively

**Out — do not build, do not stub speculatively:**
- V2-T3 pitch-taste step (the 16 sample pitches don't exist yet — D-QD3 is unwritten)
- V2-T5 milieu module · V2-T6 sequencing · V2-T7 generator changes · V2-T8 card UX
- Anything in `src/lib/matchmaker.ts` beyond the politics filter
- The waitlist quiz variant (V2-T11, phase 2)

---

## 2. Migration — `migrations/0NN_matching_v2_quiz.sql`

Next free number; check `migrations/` first. `_migrations` is **shared with other apps** — match by exact filename, never delete rows. Run `NOTIFY pgrst, 'reload schema'` after DDL. Dry-run with the BEGIN/ROLLBACK pattern in `EXECUTION.md` §3 before applying.

```sql
create table reader_traits (
  user_id uuid primary key references users(id) on delete cascade,
  big5 jsonb, milieu jsonb, homogamy jsonb, convo jsonb,
  taste_priors jsonb, pickiness numeric, scale_use numeric,   -- null until V2-T3
  register text check (register in ('playful','earnest')),
  instrument_version text not null,
  completed_at timestamptz default now()
);

-- NOT in matching_algo-v2 §10. Required for D-QD7 item analytics and the N4
-- dead-item criterion: you cannot compute per-item distributions, per-item
-- response times or per-item drop-off from the derived jsonb alone.
create table quiz_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  item_id text not null,                 -- 'Q1'..'Q23'
  option_index smallint,                 -- null = skipped
  polarity_flipped boolean not null default false,
  response_ms integer,
  instrument_version text not null,
  created_at timestamptz default now(),
  unique (user_id, item_id, instrument_version)
);
create index idx_quiz_responses_item on quiz_responses(item_id, option_index);

alter table voice_memos add column if not exists prompt_source text
  check (prompt_source in ('bank','fished'));
alter table voice_memos add column if not exists prompt_seed jsonb;
```

Q19's audio reuses the existing `voice_memos` + photos-bucket storage path rather than a new column — store it as a memo with `prompt_id = 'Q19_nerd_out'`, and put the transcript on `reader_traits.milieu->>'m9_text'`. **Read `src/app/api/transcribe/route.ts` and the voice-memo upload path before deciding this is true** — if the memo row requires a prompt that exists in `QUESTION_BANK`, add `Q19_nerd_out` to the bank rather than special-casing storage.

---

## 3. What to build

### 3.1 Quiz step — `src/app/onboarding/page.tsx` (LARGE FILE: surgical Edit only, never rewrite)

Placement: after basics, **before** voice memos. The quiz answers select the voice prompts, so this order is load-bearing.

- One item per screen. **Single tap advances immediately — no Next button.** Back always available (auto-advance makes a mis-tap unrecoverable).
- 5 zero-tap block cards between blocks, per the battery spec's block table. Tap or 1.2 s auto-advance, whichever first.
- Progress affordance across all 23, not per block.
- **Option-order polarity randomised** on the 9 trait items (Q4–Q12), seeded per user so a back-navigation doesn't reshuffle. **Q9 is exempt** — its options are a clock and must stay in time order. Store `polarity_flipped` per response; scoring un-flips.
- Skippable: Q1, Q19, Q22 only. Skip writes **null**, never a midpoint.
- Q19: text input (120 char cap, live counter) **or** hold-to-record (30 s cap). Recording posts to the existing transcribe path; **do not block advance on transcription** — the user proceeds to Q20–Q23 while it runs.
- Politics: Q22 skip → Q23 still asked (importance is meaningful without a position; it just can't filter).

### 3.2 Scoring — new `src/lib/quiz-scoring.ts`, pure functions only

```ts
scoreQuiz(responses: QuizResponse[]): ReaderTraits
```
- Trait scores: mean of that trait's items on a 1–4 scale, after un-flipping polarity, to 2dp. Item→trait map and the double-scored milieu items are in the battery spec's construct-budget table.
- **Register from two items** (Q16 + Q17), majority wins, tie → `earnest` **(SV)**, both missing → `earnest`. This replaces `matching_algo-v2.md` §6.4's "M5 with CS1 tiebreak" — **update §6.4 in the same PR**.
- Missing data propagates as null through to the jsonb. Never impute, never default to a midpoint.
- `instrument_version = "B-1.0"`.

### 3.3 Politics hard filter — `src/lib/db.ts` `applyHardFilters`

3-way, not boolean: `homogamy.politics_importance ∈ {none, prefer, strong}`.
- `strong` → bidirectional hard filter at >2 steps of gap, same pattern as the existing smoking dealbreaker. Read that code first and match it.
- `prefer` → **logged, no effect at launch.** Do not wire it into scoring. Charles: *"we're just going to save this for the people who really care / testing."*
- `none` → no effect.
- Either side missing a position → never filters.

### 3.4 Voice prompts — new `src/lib/voice-prompt-map.ts` + voice step

Build exactly `specs/matching-v2-voice-prompt-map.md` §2–§4. Reuse `PromptDef` so the renderer is untouched. Selection replaces the `getOnboardingPrompts(6)` call at `src/app/onboarding/page.tsx:82`; keep the old function and its behaviour as the no-quiz fallback path.

Fished prompts carry **no `exampleAnswer`** — the renderer must degrade to a neutral line ("30 seconds is plenty") rather than rendering an empty block.

---

## 4. Acceptance — Charles's three words, made checkable

| his word | criterion | how you prove it |
|---|---|---|
| **fast** | median quiz completion **≤3.5 min**; **zero network round-trips between items**; screen transition ≤150 ms with no layout shift | buffer answers in client state, POST once per block card (5 writes, resume-safe) and once at the end. Walk the flow on a throttled mobile profile and report the measured median |
| **fun** | every block card lands, progress feels like progress, back works from every screen, mis-tap always recoverable | click every one of the 23 screens on a real phone viewport, both themes. Screenshot the 5 block cards |
| **seen** | any user who finishes the quiz reaches the voice step with **≥1 fished prompt**, and the payoff paths work end to end | walk two personas (§6). The **Q9 → "Okay. Tell me the story."** path and the **Q19 verbatim** path must both be demonstrated with real screenshots |

Plus: **N1/N2 instrumentation is live from the first staging deploy** (§5), the copy is byte-identical to the battery spec, and the no-quiz path is unchanged.

---

## 5. Instrumentation (required — N1/N2 are not measurable retroactively)

PostHog, already installed. Per-item, fire-and-forget, never blocking:
- `quiz_item_viewed` / `quiz_item_answered` — `{item_id, option_index, polarity_flipped, response_ms, instrument_version}`
- `quiz_block_completed` — `{block, elapsed_ms}`
- `quiz_completed` / `quiz_abandoned` — `{last_item_id, elapsed_ms}`
- `voice_prompt_shown` — `{prompt_id, source, seed_item, seed_option}`

These feed N1 (≥90% completion), N2 (median ≤5 min), N4 (dead items, >80% same-answer concentration) and D-QD7.

---

## 6. Verification — staging, and do it properly

Per `EXECUTION.md` §5, plus the deploy-race trap from `tasks/lessons.md` (2026-08-22): **a green deploy does not mean new code is serving.** Confirm the new container's `CreatedAt` is after your push before you test anything, and verify against a build-specific marker, not `/api/health`.

1. `npx next build` locally. Worktree gotcha: `node_modules` is a symlink and Turbopack fails on it — see `EXECUTION.md` §3.
2. Migration dry-run (BEGIN/ROLLBACK), then let the staging deploy apply it. `NOTIFY pgrst, 'reload schema'`.
3. Push to `staging`, wait for the new container, then walk **two personas end to end as a real signup**:
   - **Persona A — the storyteller:** Q1 "a completely different person", Q9 "7:15, but I have a story", Q13 "elbow-deep", Q19 typed. Assert the voice step shows "What changed — and when did you notice?", "Okay. Tell me the story.", and the Q19 verbatim prompt.
   - **Persona B — the quiet one:** Q1 skipped, Q7 "actually, I left an hour ago", Q14 "nothing, and I've never once thought about it", Q15 "I'm not a gift person", Q19 recorded as audio, Q22 skipped, Q23 "strong". Assert: Q14 routes to the **non-object** prompt ("Forget the place then — where do you actually spend your time?"), the audio transcribed and templated into the Q19 prompt, `reader_traits.homogamy` shows importance `strong` with a null position, and **no hard filter fires** (position is null).
4. psql assertions: `reader_traits` scored correctly for both, 23 `quiz_responses` rows for A / 20 for B, `voice_memos.prompt_source` populated.
5. Report the measured median quiz time and per-item times from PostHog.

**Tests to add:** test-plan §2.4 U17 is void — rewrite against item-specific scoring. U19 must test two-item register derivation. U16 must cover all three politics tiers and assert `prefer` never filters. Add U23–U28 from the voice-prompt-map spec.

---

## 7. Stop and ask Charles

- Any copy that you believe is wrong (**ship it as written, raise it separately**)
- Anything that would change the item count, the item order, or the envelope
- Merging staging → main
- Total onboarding time if quiz + existing 6 voice memos + photos runs long — **measure it and report the number**, don't unilaterally trim a step
- Before this goes to **production**, pre-register with the growth cockpit per the global rule: metric `ply.ga4.onboarding_completion`, direction `down` (this is a guardrail — a 3.5-minute step is a real cost paid for downstream pitch quality), window 4 weeks. Registration is not needed for staging.

## 8. Done means

`✅ DONE` with: staging URL, `gh run` link, the two persona walkthroughs with screenshots, the measured median quiz time, psql output for both personas, green tests, and the experiment id if it went to prod. Anything short of that is `⏸ HANDOFF`.
