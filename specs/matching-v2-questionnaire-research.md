# Questionnaire Deep Dive — Research Brief (V2-T0, step 1)

**Charter:** `specs/matching-v2-questionnaire-deep-dive.md` §4. This file is the "research pass first" deliverable: what the literature and the competitors actually say, and the **explicit design answer to each of the 9 traps**. Everything downstream (D-QD1 battery, D-QD2 scoring, D-QD5 UX) is justified from here.
**Date:** 2026-08-22. All sources verified this session — nothing here is from memory.

---

## 1. Findings that CHANGE the design

### R1. Two items per trait is enough for targeting — but not equally across traits.
TIPI's convergent correlations with the full BFI are E r=.87, ES r=.81, C r=.75, A r=.70, **O r=.65** — and its internal consistencies are E α=.68, ES α=.73, C α=.50, **O α=.45**, A α=.40. Gosling et al. explicitly traded internal consistency for validity and warned brief measures are "more likely to result in erroneous findings." The BFI-2-XS (15 items) retains domain-level reliability/validity but its authors state it **must not be used at facet level**.
→ **So for PLY:** 2 items/trait is defensible *for targeting* (F4 in the decision memo: Matz's Facebook-like proxies were far noisier and still produced 40–50% effects). But **O is the weakest trait in every short form, and O is exactly what H1 needs.** O gets 3 dedicated, cleanly-written items; E gets 2 dedicated plus 2 double-scored milieu items (4 indicators — E is also the easiest trait to measure, TIPI r=.87); C gets 3 and A gets 2 via double-scoring; N is the residual. Never report anything at facet level.

### R2. Reverse-worded items are the wrong tool here.
Reverse-worded items reliably form a separate, substantively meaningless method factor; if ~10% of respondents answer them carelessly the one-factor model is rejected. Mixed positive/negative wording produces **the most** measurement error of any wording strategy; all-positive produces the least.
→ **So for PLY:** the sketch's 5 reversed items (B2/B4/B6/B8/B10) are a liability on a one-thumb mobile flow. **Drop reverse-worded items.** Replace the acquiescence protection they were buying with R3.

### R3. Item-specific response options beat agree–disagree — this is the structural finding.
Agree–disagree scales carry acquiescence bias, response-order effects and extra cognitive burden; construct-specific ("item-specific") response options yield superior data quality and are at least as reliable/valid, **including among the respondents most likely to acquiesce**. Acquiescence is worse under time pressure — i.e. exactly a 5-minute onboarding quiz.
→ **So for PLY:** replace the 10-item agree–disagree Big Five block with **item-specific items: one stem, 4 ordered options written as concrete alternatives.** This kills acquiescence *and* reversals in one move, makes every option quotable in a pitch (charter N3), and reads as self-expression rather than assessment.

### R4. Contextualised / behaviourally-anchored items measure better, not just nicer.
The frame-of-reference effect: tagged and fully-contextualised items improve predictive validity over generic ones, and reduce "hidden framing" — the arbitrary, varying frame each respondent silently supplies. SJT-style items are also less fakeable than classic self-report.
→ **So for PLY:** the charter's instinct ("your last three Saturdays" beats "I am spontaneous") is literature-backed, not just taste. Every trait item gets a **situation**, and where possible a **frequency anchor** ("when did you last…") instead of a self-description.

### R5. Forced choice reduces faking — only when the options are desirability-matched.
Multidimensional forced choice does not eliminate faking but reduces it substantially; the reduction is **larger when options within a block are matched on social desirability**, and mixed-desirability blocks leak faking badly.
→ **So for PLY:** a forced choice between one flattering and one embarrassing option is worse than useless in a dating context. **Every option set must be independently likeable.** Caveat: classic paired multidimensional forced-choice produces *ipsative* scores, which are not comparable between people — and H1/H2 need between-person comparison ("high-O readers"). So we use **unidimensional item-specific items (all 4 options score the same single trait), not cross-trait forced choice.** Normative, comparable, un-fakeable-ish, and fun.

### R6. Length: we are at the edge of the abandonment cliff, and the taste step is inside the budget.
Abandonment climbs sharply past the **7–8 minute** mark and hardest in the 18–34 group; item-by-item questions run **8–10 s/item** vs 0.5 s/item in a grid.
→ **So for PLY:** 22 items × ~9 s ≈ **3.5 min** quiz, + 8 sample pitches at ~12–15 s each (read + rate) ≈ **2 min** taste step ≈ **5.5 min total** — inside N2 but with no slack. Consequences: (a) no slot is free for a dedicated attention-check item; (b) any item added must displace one; (c) the pitch-taste samples must be length-capped or the 2-minute target fails on reading time alone.

### R7. Grids are the single most abandoned mobile question type — but "one per screen" is not the same as "no grouping".
Grids/matrices raise breakoff, missing data and straightlining vs single-item-per-page; each large matrix adds ~2–5pp dropout. One-tap inputs (scales, yes/no, emoji) perform best on mobile. The grid's only advantage is speed, and "the dropout cost exceeds the time savings."
→ **So for PLY:** **one item per screen, single tap auto-advances** (no Next button). This is also what makes the 8–10 s/item figure survivable. Requires a visible back affordance, because auto-advance makes a mis-tap unrecoverable.

### R8. Gamification buys completion and goodwill; it costs construct validity in exactly one predictable place.
Gamified assessments show markedly higher completion and better applicant perceptions, but validity evidence is mixed — one study found gamified **Conscientiousness scores substantially inflated**, and some gamified traits correlated with *unintended* traits.
→ **So for PLY:** skin it fun, keep the psychometrics ordinary. Do **not** build a game. And treat C as the least trustworthy of our five traits — never let C alone drive anything.

### R9. Dating self-presentation is inflated, but the inflation is small, deliberate, and constrained by the expectation of meeting.
Toma/Hancock/Ellison: deceptions in dating profiles are ubiquitous but small in magnitude, correlated with self-rated accuracy (i.e. intentional, not self-deceptive), and strategically balanced against "the anticipation of future interaction."
→ **So for PLY:** the anti-faking mechanism is already in the product — answers become material in a pitch that the person then has to be true to on a real date. Say so, plainly, in the intro microcopy. Honest framing beats a lie-detector item.

### R10. What the competitors do with self-expression.
- **Hinge:** 105+ prompts across 10 categories, user picks 3, **150-char cap**; the working prompts are the ones that leave the reader something to respond to. Voice prompts (30 s) and video prompts materially outperform text — voice-note conversations are reported **41% more likely to lead to a date**.
- **Keeper:** progressive elicitation — two short questionnaires unlock deeper modules; one match at a time, woman first (decision memo F6).
- **BuzzFeed-style quizzes:** shareability comes from the *result as identity badge* and self-referential reward, not from the questions. The engineered part is the payoff, not the item.
→ **So for PLY:** (a) short free text is proven tolerable — 120 chars is conservative vs Hinge's 150; (b) voice is the right home for stories (D5 already says this, and the 41% figure supports it); (c) **D7 forbids showing the reader their own pitch, which removes the classic quiz payoff — so the payoff has to be moved.** Our payoff is that the *next step gets personal*: the voice prompts visibly quote what they just told us. That is the design compensation for D7, and it must be explicit in the UX flow.

---

## 2. The 9 traps — explicit design answers

| # | trap | design answer |
|---|---|---|
| 1 | **Aspirational self-report** | No self-descriptions anywhere. Every trait item is situational (R4) and several are frequency-anchored ("last time you tried something you'd never done"). "I am spontaneous" never appears in any form. |
| 2 | **Social desirability** | Every option set is independently likeable (R5); the item is only allowed to ship if you'd be happy to have *any* of its options quoted about you in an intro. Explicit ship test: read each option aloud as "She's the one who ___" — if one lands worse than the others, rewrite the option, not the item. |
| 3 | **Reversed items on mobile** | Reverse-*wording* dropped entirely (R2). Straightlining protection instead comes from **reversed option ORDER** on a randomised ~half of the trait items (stem stays positive and legible; the high-trait option is sometimes first, sometimes last), plus response-time logging. Polarity is stored per item so scoring un-flips it. |
| 4 | **Order effects** | Fixed order in 6 blocks: identity/tribe (hook) → wired (trait items) → actual life → how you talk → free text → facts, politics last. Item order *within* a block is fixed too (comparability across users matters more than counterbalancing at N≈50); option order is what varies. |
| 5 | **The "at 17" item** | Keep the construct (it is the sharpest expression of Charles's "same game"), add an explicit out as a **first-class, pitch-usable option** — "a completely different person than I am now" — and make the item skippable. That option becomes one of the best voice prompts we have ("What changed?"). |
| 6 | **Gaming / mechanics leakage** | No item or microcopy says what an answer feeds. Banned phrases: "for the algorithm", "this helps us match you", "makes for a better intro". **One deliberate exception: the politics toggle**, where the user is consenting to a hard filter and cannot consent without being told what it does. That exception is documented, not accidental. |
| 7 | **Skips** | Skippable: the tribe item, free text, politics position. Everything else required (one tap each). A skip writes **null** — never a midpoint, never a default. The milieu function already renormalises over present blocks; scoring spec (D-QD2) asserts null-propagation with a unit test per block. |
| 8 | **Taste-step confound** | Handled in D-QD3: subjects are milieu-balanced by construction, length-matched within ±10%, each sample cell-pure (one angle's feeling contract only — an `admiration × interest` sample may not smuggle `i_sharing` kinship), and every sample ships with a subject-metadata block (age band, work register, activity domain, humour register) logged alongside the vote so residual confounding is modelable rather than invisible. |
| 9 | **Reading level & tone** | Short stems, concrete nouns, no clauses stacked. Jokes are about situations, never about the answerer. Every option passes the group-chat test (charter §6.4). Reading level target: 6th–8th grade on the stems. |

---

## 3. Answers to the charter's §7 open questions

1. **One item per screen vs grouped blocks** → one per screen, tap-to-advance (R7), with 6 zero-tap block cards for pacing. Grids are the highest-abandonment mobile pattern and the time saving does not pay for it.
2. **Keep or kill the Likert Big Five block** → **kill it.** Replace with item-specific 4-option situational items (R2+R3+R4). O and E get 3 items each, A/C/N get 2 (R1). *Needs Charles: this changes brief §4.1 and test-plan U17/N5.*
3. **Politics wording/scale** → 5-point with plain self-labels, an explicit "rather not say" skip, and a **softened** toggle label ("Honestly, I'd struggle with someone far from me on this" / "Not something I'd rule someone out for"). The word "dealbreaker" never appears in the affirmative option (activation-tone rule).
4. **Free text** → keep as text, 120 chars, skippable, placed 18th of 22 (after investment, before the one-tap facts so the tail of the survey is effortless). Text not voice, because the scoring spec templates the literal string into the voice prompt ("You said you nerd out on {…}") — voice-only loses the string.
5. **Attention/quality check item** → **no.** R6 leaves no slack, and we get better signal free: per-item response time (already required for N2), taste-step `scale_use` (N6), and straightline detection across the polarity-flipped trait items. Define `quality_flag` as a derived field, not an item.
6. **Regional tuning of M-block options** → **not at v1.0.** Launch is one metro (D1), so there is nothing to tune against, and per-metro option variants would fork `instrument_version` by geography and make the milieu function's exact-match term incomparable across metros. Revisit when metro 2 is real; if it happens it is a major version bump.

---

## 4. Consequence for the acceptance criteria (charter §2)

**N5 as written is no longer checkable.** It says "reversed pairs correlate negatively" — there will be no reversed pairs (R2). Proposed substitute, same intent:

> **N5′** — Big Five mini structurally sane: within each trait, items intercorrelate positively (Spearman ρ > .20 **(SV)**) after option-polarity un-flipping; option-polarity-flipped and unflipped items for the same trait show no mean difference beyond noise (a straightlining check); and O and E carry 3 items each.

Everything else in N1–N8 stands unchanged.

---

## Sources
- [Soto & John 2017 — BFI-2-S / BFI-2-XS (Colby PDF)](https://www.colby.edu/wp-content/uploads/2013/08/Soto_John_2017b.pdf) · [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0092656616301325)
- [TIPI scoping review, Frontiers in Psychology 2023](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1202953/full) · [Gosling TIPI page](https://gosling.psy.utexas.edu/scales-weve-developed/ten-item-personality-measure-tipi/)
- [Woods & Hampson / careless responding to reverse-worded items](https://link.springer.com/article/10.1007/s10862-005-9004-7) · [Reverse-worded items and factor structure, PLOS One](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0157795) · [Careless responding effects on reliability & validity, Frontiers 2026](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1815225/full)
- [Lelkes & Weiss 2015 — "Much ado about acquiescence": construct-specific vs agree–disagree](https://journals.sagepub.com/doi/10.1177/2053168015604173) · [Agree/disagree vs construct-specific response options (UPF)](https://repositori.upf.edu/handle/10230/43541)
- [Does multidimensional forced-choice prevent faking? (PubMed)](https://pubmed.ncbi.nlm.nih.gov/33151727/) · [Response-process model of faking on MFC, Wiley 2023](https://onlinelibrary.wiley.com/doi/abs/10.1111/ijsa.12409)
- [Fully contextualized, frequency-based personality measurement (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0092656616302008) · [SJTs as a method for measuring personality, PLOS One](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0211884)
- [Vehovar, Couper & Čehovin 2023 — grid layouts in PC and mobile web surveys](https://doi.org/10.1177/08944393221132644) · [The Design of Grids in Web Surveys (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4172361/)
- [Survicate — 21k surveys, completion by question count](https://survicate.com/blog/how-many-questions-should-surveys-have/) · [Lensym — completion rates, drop-off benchmarks](https://lensym.com/blog/survey-completion-rates-drop-off/)
- [Construct validity and applicant reactions of a gamified personality assessment (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0747563224003352) · [Serious games vs traditional personality questionnaires, PLOS One](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0302429)
- [Toma, Hancock & Ellison 2008 — deceptive self-presentation in online dating profiles](https://journals.sagepub.com/doi/abs/10.1177/0146167208318067)
- [Hinge complete prompt list (SwipeStats)](https://www.swipestats.io/blog/hinge-prompt-list) · [Hinge voice prompts (NBC News)](https://www.nbcnews.com/pop-culture/viral/hinges-new-voice-prompts-are-tiktok-hit-rcna5663)
- [Online quizzes as viral, consumption-based identities (IJoC)](https://ijoc.org/index.php/ijoc/article/view/5265)
