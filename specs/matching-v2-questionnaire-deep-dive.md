# Matching v2 Addendum — Questionnaire Deep-Dive Charter

**Status:** Commissioned by Charles 2026-08-22 ("we have to nail that"). This is the charter for a **dedicated session** whose only job is the questionnaire portion of v2. It is written to be executed with no access to the commissioning conversation.
**Parent docs:** `matching_algo-v2.md` (§4 Battery B draft, §5 taste step — those sections are a *first sketch*, this session's job is to replace them with the nailed version) · `specs/matching-v2-test-plan.md` (§2.4 quiz tests bind whatever ships) · `specs/matching-v2-decision-memo.md` §1 F3/F4 (why the quiz exists at all).
**Sequencing:** must complete BEFORE V2-T2, V2-T3, V2-T4 freeze copy. Implementation stays in those tasks — this session produces the spec they build.

---

## 1. Why this gets its own session

The questionnaire is the only part of v2 that every single user experiences in full, at the moment their trust is highest and their patience is shortest. It has to do four jobs at once, and the v2 brief only sketched them:

1. **Data**: targeting-grade Big Five (the Matz-backed pitch-targeting backbone), milieu ("same game"), homogamy facts — feeding the pre-registered hypotheses H1–H4 and the milieu sort term.
2. **Pitch fuel**: every answer must be usable *verbatim* in an intro ("She's a 'sparkler exit' person").
3. **Story fishing**: answers select the voice prompts — the questionnaire aims the mic (D5b).
4. **Fun**: it must feel like self-expression, not assessment. Onboarding completion is a launch-critical funnel number.

Failing any one job quietly poisons a different system (bad items → biased targeting; boring items → drop-off; un-pitchable items → wasted minutes; wrong prompts → thin composites). That coupling is why this is a deep dive and not a copy pass.

## 2. What "nailed" means — acceptance criteria for the whole effort

| # | criterion | how checked |
|---|---|---|
| N1 | ≥90% of users who reach the quiz step complete it **(SV)** | per-item advance events (PostHog) from day one — instrumenting this is part of the deliverable |
| N2 | median ≤5 min quiz, ≤2 min taste step **(SV)** | timestamps in the same events |
| N3 | every item has a written dual-use rationale (data + pitch material); an item that can't be quoted in a pitch must justify itself on data grounds alone or die | per-item rationale table (D-QD1) |
| N4 | no dead items: nothing with >80% same-answer concentration after month 1 **(SV)** | item-analytics plan (D-QD7) |
| N5 | Big Five mini structurally sane: reversed pairs correlate negatively; O and E (the H1/H2 hypothesis traits) get the battery's best items | pilot + month-1 check |
| N6 | taste step non-degenerate: ≥80% of users show scale_use > 0 **(SV)** | derived fields |
| N7 | Charles approved every word — he is the taste authority; expect multiple inline passes (the T16d waitlist-copy process is the model) | approval checklist (D-QD8) |
| N8 | community-safe: no item names or assumes a religion/community (generic platform — hard house rule); politics item neutral; nothing punitive in any microcopy | review against `feedback_no_lds_branding` + `feedback_activation_tone` memories |

## 3. Binding constraints (locked; the session optimizes inside them)

- Envelope: **~23 items / ~5 min** quiz + **8-vote** taste step. The session may recompose freely *inside* the envelope (swap items, change counts ±3) with rationale; envelope changes need Charles.
- Quiz sits **after basics, before voice memos**; results **private** (never shown as scores to the user or matches; answers may surface as pitch content).
- The trait outputs must still feed: register derivation (M5/CS1), milieu function inputs (M-block, education, politics, ambition — `src/lib/milieu.ts` §9 of the brief), politics hard-toggle, voice-prompt mapping, H1–H4.
- Instrument versioning: any wording change = minor bump, add/remove item = major bump (`reader_traits.instrument_version`); analysis conditions on version.
- Mobile-first, one thumb, no typing except the single free-text item.

## 4. Research directives — do this before writing a single item

**Literature (verify, don't trust memory):** short-form Big Five instruments (TIPI, BFI-2-XS/S) — what validity survives at 2 items/trait and which wording styles hold up; forced-choice & situational-judgment item validity; acquiescence and reversed-item behavior on mobile; questionnaire drop-off curves by item count and screen design; gamified assessment findings (what "fun" costs in validity, what it buys in completion).

**Competitors (read their actual flows, screenshot-level):** Hinge prompts + OkCupid question lineage (self-expression framing), Keeper's progressive modules (short core unlocks deeper — relevant to phase-2 expansion), Buzzfeed-style quizzes (what makes items *screenshot-able*).

**The trap list — each trap gets an explicit design answer in the deliverable:**
1. **Aspirational self-report** (dating context makes everyone adventurous and easy-going): prefer behavioral anchors — "your last three Saturdays" beats "I am spontaneous."
2. **Social desirability in a values-forward community**: force choices between *equally flattering* options; never one virtuous option vs one embarrassing one.
3. **Reversed items on mobile**: mis-taps and double-negatives inflate noise — decide keep/drop/reword with evidence, don't inherit the draft's reversals by default.
4. **Order effects**: identity-fun items open (hook), Likert block mid, facts near the end (commitment escalation); politics late; free-text placed where momentum survives it.
5. **The "at 17" item**: verify it lands for mid-30s+ reinventors (Rule 9's population) and people whose 17 was bad; provide an out or reframe.
6. **Gaming**: item copy must not teach users what feeds matching ("this one's for the algorithm") — no mechanics leakage.
7. **Skips**: decide per-item skippability (politics likely yes); the milieu function already renormalizes over missing blocks — skips must map to *missing*, never to a fake middle answer.
8. **Taste-step confound (subtle, important)**: the 16 sample pitches have synthetic *subjects* — if a subject has a legible milieu, a reader's Likert conflates "this angle works on me" with "this person is my type." Design subjects milieu-balanced/neutral, keep length matched, keep each sample *cell-pure* (an admiration×interest sample must not smuggle i_sharing), and log subject metadata per sample so residual confounding is modelable.
9. **Reading level & tone drift**: witty-brief-genuine (house voice); jokes never at the answerer's expense.

## 5. Deliverables

| id | deliverable | replaces / feeds |
|---|---|---|
| D-QD1 | **Final battery**: every item with options, scale, skippability, screen grouping, order — plus per-item rationale row: construct measured · pitch-use example sentence · hypothesis/function it feeds · trap-list answers | replaces brief §4.1–4.3 |
| D-QD2 | **Scoring spec**: trait computation, register derivation, milieu-block encoding, missing-data mapping — as pure-function pseudocode the build task implements against test-plan §2.4 fixtures (which this session updates to match) | feeds V2-T2 |
| D-QD3 | **16 sample pitches** (8 cells × 2 gender orientations) passing tone rules + cell-purity + the subject-neutrality design from trap 8, each with subject-metadata block | replaces brief §5's placeholder; feeds V2-T3 |
| D-QD4 | **Voice-prompt map, complete**: every answer option of every mapped item → prompt template + fallbacks; selection rule (how many fished vs generic) | replaces brief §4.4; feeds V2-T4 |
| D-QD5 | **UX flow spec**: screens, pacing, progress affordance, transitions, microcopy (intro line, skip affordance, taste-step framing "would you want to hear more about this person?") — spec, not implementation | feeds V2-T2/T3 |
| D-QD6 | **Pilot protocol**: 5–10 people (waitlist volunteers or friends — Charles picks), ≥2 observed live; measure time, drop-off, confusion points, answer distributions; one revision pass; then freeze as instrument v1.0 | pre-launch gate |
| D-QD7 | **Item-analytics plan**: per-item distribution / time / drop-off surfaced (admin tile or script), dead-item criterion (N4), version-bump procedure | post-launch learning |
| D-QD8 | **Charles approval checklist**: every copy surface enumerated, approved inline in chat (house rule: decisions and approvals happen in the conversation, never "see the file") | launch gate |
| D-QD9 | **Waitlist-quiz variant note** (phase 2, D10): what changes for the standalone SMS-linked version — tease payoff copy, phone-keyed storage, merge-at-signup — scoped only, not built | feeds V2-T11 |

## 6. How to run the session (process guidance)

1. Research pass first (§4) — bring back findings as a short brief with sources before drafting.
2. Draft **2–3 competing full batteries** in distinct voices (e.g., playful, warm-sincere, dry) — same constructs, different skins. The competition is the taste instrument.
3. Review with Charles **inline in chat, item by item or block by block** — never a file dump. Expect several passes (T16d precedent). He may answer fast with letters; make that easy.
4. Apply the group-chat test to every surviving item: *would someone screenshot this question to a friend?* If no item in a block passes, the block is homework — rewrite.
5. Pilot (D-QD6), one revision pass, freeze v1.0, update test-plan §2.4 fixtures, hand off to V2-T2/T3/T4.

## 7. Open questions the deep dive must resolve (not before)

- One-item-per-screen vs grouped blocks (evidence-based, N1/N2 tradeoff).
- Keep or kill the Likert Big Five block in favor of fully forced-choice trait items (validity vs fun; H1/H2 need O and E to survive whatever is chosen).
- Politics item: exact wording + scale in a pool that likely skews one direction; does the hard-toggle need a softer label ("I'd struggle with a big gap")?
- Free-text "nerd out" item: keep, move, or make voice-only?
- Attention/quality check item: worth one slot, or does the taste step's variance already screen it?
- Whether M-block options need regional tuning per metro at launch (without ever naming a community).

---
*This charter is complete when D-QD1–D-QD9 exist, N1–N8 have owners and instrumentation, and Charles has approved the frozen v1.0 battery inline.*
