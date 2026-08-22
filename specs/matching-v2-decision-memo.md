# Matching v2 — Decision Memo

**Status:** Options for Charles. Nothing here is built or approved. The frozen-model rule (EXECUTION.md §0.4) applies to everything in this doc — it ships only via your explicit sign-off, one variable per commit.
**Date:** 2026-08-22
**Inputs:** Charles Q&A (this session), code audit of the live pipeline, literature + competitor verification (links in §1).
**Next step:** You answer the D1–D10 decisions in §9; then this becomes `matching_algo-v2.md` + a logging-schema spec.

---

## 0. The spec, in your words

These are locked inputs from the Q&A. Everything below is built to serve them.

- **Click** = they find each other interesting as a potential match: suitable on the soft factors (socioeconomic, politics, hygiene, sociability), and they *play the same game* — theatre kids / intellectuals / jocks-and-normies show up differently to a date and need to share a milieu. Operationally: **a great first conversation.**
- **The edge is NOT the personality test.** Personality/compatibility measurement is a solved-enough problem — borrow from what Keeper/Match/eHarmony already do well. **Our edge is the presentation layer: every user gets introduced like the Lakers starting five** — hot and cool, *calibrated to what signals hot-and-cool to the specific reader*.
- Sort = predicted click primary, pitch-material richness as tiebreaker (A2c).
- Quiz budget ~5 min, hybrid fun/valid format; results private for now (B3b, B4c, B6).
- Revive the pitch-rating calibration step; after the test, show sample profiles and Likert them (B8).
- "Worked" = 🔥 fire (pre-photo reveal). Repeated photo-stage failure → drive better photos (C10).
- Randomize freely, well beyond 5 intros; design for a very small launch (C11).
- Same-candidate multi-style sequencing (the "Dane in style 1, 2, 6" idea) — with controls for people just accepting the 3rd pitch (C12).
- Attraction stays soft (Elo band + calibration-vote priors) — D14a. No real-candidate photos in onboarding swipes — D15.
- Tell me what different signup levels buy us, and specifically what we can do with 50 people (E16).

---

## 1. What the research and the industry actually say

Seven findings, each with the "so for PLY" attached. Links at the bottom of this section.

**F1. Pair-level chemistry is unpredictable before people meet.** Joel, Eastwick & Finkel (2017) ran ML over 100+ traits and preferences from speed daters. The models predicted *who tends to like* and *who tends to be liked* (actor/partner effects) — but the pair-specific residual, "will these two specifically want each other," was **unpredictable**. Eastwick: "It may be that we never figure it out."
→ **So for PLY:** don't over-invest in a clever predicted-click formula. The sort should be coarse and cheap (milieu + suitability + attraction band). The learning budget goes to the pitch layer, where prediction *is* tractable (F4).

**F2. Actual similarity drives attraction *before* people interact; perceived similarity carries everything after.** Montoya et al.'s meta-analysis (313 studies): actual similarity → attraction at r≈.47 in no-interaction settings — but its effect **vanishes in existing relationships**, where *perceived* similarity (r≈.39) is what predicts attraction.
→ **So for PLY:** this is the scientific frame for the whole product. The intro card *is* a no-interaction setting — actual milieu similarity (the sort) genuinely matters there. And **the pitch is a perceived-similarity machine**: its job is to make the reader *feel* "this person is my kind of person." Sort supplies the raw material; pitch manufactures the perception. Both halves are load-bearing, and they're different systems.

**F3. Homogamy is real and it's about cheap facts, not deep psychometrics.** The strongest assortative-mating dimensions across decades of demography: education (a college degree is "the strongest dividing line to intermarriage"), religion/religiosity, politics, socioeconomic status, age. Personality-trait assortment is comparatively weak.
→ **So for PLY:** the community pool already zeroes religion/values/intent (your Keeper-validated thesis). What's left of "same milieu" is capturable with a handful of direct questions — education, politics, ambition/pace, social register — not a 100-item instrument. Ask the cheap facts directly.

**F4. Personality-matched MESSAGING works, with large effect sizes.** Matz, Kosinski et al. (PNAS 2017): 3.5M people, real field experiments — ads framed to the recipient's extraversion or openness produced **up to 40% more clicks and 50% more purchases** than mismatched framing.
→ **So for PLY:** this is the direct scientific precedent for "which pitch works on which person." It says (a) the reader-side instrument should be a Big Five short form, because E and O are the proven targeting axes; (b) coarse trait measurement is sufficient (Matz used Facebook-like proxies, far noisier than a 10-item quiz); (c) expected effects are big enough to detect at our scale. The quiz's #1 job is pitch targeting, not compatibility prediction.

**F5. The trait that predicts relationship quality is mostly about the *person*, not the *pair*.** Low neuroticism and high conscientiousness predict relationship satisfaction robustly; partner-*similarity* effects on outcomes are small.
→ **So for PLY:** trait data is worth collecting but not worth gating on. It flows into pitch material and (later) into learning — not into hard filters.

**F6. What the incumbents do — and the open lane.**
- **Keeper**: two short questionnaires unlock deeper modules (personality, lifestyle, family, values); 100+ data points, 800+ compatibility factors; AI sorts, human reviews; **one elite match at a time; woman sees it first**. (Their woman-first flow is your already-approved T19.)
- **Hinge "Most Compatible"**: Gale-Shapley over predicted preference lists; inputs are settings → dealbreakers → **behavior, the heaviest input by far**; claimed 8× date rate vs other recommendations.
- **OkCupid** (the lineage): stated questions *weighted by the user's own stated importance*.
→ **So for PLY:** borrow three mechanics: progressive elicitation (short core unlocks deeper modules — matches your "fun onboarding"), user-stated importance on the questions that gate, and behavior-over-statements as the long-run ranking signal. **Nobody presents people narratively.** The pitch layer has no incumbent. That's the lane.

**F7. "A great first conversation" is partly manufacturable.** The closeness-generation literature (Aron's fast-friends procedure) shows escalating mutual self-disclosure + responsiveness reliably produces felt connection between strangers.
→ **So for PLY:** the pitch can *seed* the first conversation (it hands both people a specific, personal opener), and the post-date feedback loop can measure conversation quality directly. Longer-term this powers conversation cards (T21). For this memo it just means: "great first convo" is a legitimate, measurable target, not vibes.

**Sources:** [Joel/Eastwick/Finkel 2017, Psychological Science](https://journals.sagepub.com/doi/10.1177/0956797617714580) · [press summary](https://www.psychologicalscience.org/news/releases/romantic-matches-are-hard-to-predict.html) · [Matz et al. 2017, PNAS](https://www.pnas.org/doi/10.1073/pnas.1710966114) · [Montoya et al. 2008 meta-analysis](https://journals.sagepub.com/doi/10.1177/0265407508096700) · [educational assortative mating, Demography 2024](https://read.dukeupress.edu/demography/article/61/5/1293/390842/Eight-Decades-of-Educational-Assortative-Mating-A) · [Keeper: how it works](https://www.keeper.ai/posts/how-keeper-works-our-method-for-soulmate-matching) · [Keeper FAQs](https://www.keeper.ai/faqs) · [Hinge Most Compatible, TechCrunch](https://techcrunch.com/2018/07/11/hinge-employs-new-algorithm-to-find-your-most-compatible-match-for-you/) · [Hinge algorithm explainer](https://www.bustle.com/wellness/how-does-hinge-algorithm-work)

---

## 2. Architecture v2 — filter, sort, pitch

Your three-stage frame, made concrete. The headline: **stages 1–2 change very little; stage 3 is where the product lives.**

### Stage 1 — FILTER (keep, plus two cheap additions)
Unchanged: bidirectional hard prefs (age, kids, faith essential+must_match, smoking), blocks, active status, opposite gender. Elo stays a *soft retrieval band* (±150→±300→everyone), per Rule 5 and your D14a.
Additions (both are also §3 quiz items):
- **Politics**: 1 position item + 1 "does it matter" toggle. Only a hard gate when the user flips the toggle — default is a sort signal, not a filter. (F3: politics is a top-tier homogamy axis; even inside one community it's a real date-killer.)
- **Education/work**: captured (not gated). It's a homogamy signal for the sort and premium pitch material ("finishing her PhD" beats any adjective).
- Hygiene from your click list: not directly askable. It arrives later through vouches and post-date feedback — noted, deferred.

### Stage 2 — SORT (keep the spine, add one experimental term, stop pretending it's smart)
F1 says the ceiling on pre-meeting pair prediction is low. So the sort's honest job is: **surface people from the same milieu with no disqualifiers, and let the pitch layer do the persuading.**
- Keep: embedding/hand-tuned compatibility spine, location tier multipliers, T7 attraction priors, Elo band.
- **Add (as a pre-registered experiment, not silently): a milieu-similarity term** from the new quiz — similarity on the "same game" block + education + politics + ambition/pace. This is the code-level expression of your click definition. See D8 for sequencing.
- Tiebreak by **pitch-material richness** (your A2c): between two similar-scoring candidates, prefer the one with more voice-memo material, quotes, vouches — the one we can write the better pitch about.
- Retire: excitement-type steering of strategy selection (it's an unvalidated LLM guess). The types survive only as priors that the calibration step (§3) and live behavior overwrite.

### Stage 3 — PITCH (the product; the rest of this memo)
Given a chosen candidate: pick a style cell from the matrix (§4), generate under the existing craft rules, deliver via the sequential design (§5), log everything, learn (§6).

---

## 3. The reader instrument

Design principles: every item earns its place **twice** — once as data (targeting/sort), once as pitch material. Fun format, validated core. Private results (B6). ~5 min ceiling (B3).

### Option A — Lean (~12 items, ~2 min)
Big Five mini (6: E/O/N ×2), milieu block (4), politics + education (2). Gets targeting off the ground; thin on milieu.

### Option B — Standard (~23 items, ~4–5 min) ← RECOMMENDED
1. **Big Five mini — 10 items** (2/trait, TIPI-style but warmly phrased: "Parties recharge me / drain me"). This is the F4 targeting backbone. We need targeting-grade signal, not clinical measurement — 2 items/trait is enough (Matz's proxies were coarser).
2. **Milieu / "same game" — 8 forced-choice items**, your click-definition operationalized. Sketch (final copy is a taste pass):
   - At 17 you were mostly: theatre kid / jock / honor-roll grinder / the one organizing the group hang / happily unaffiliated
   - Your group chat role: sends the memes / makes the plans / asks the real questions / voice-note monologuer
   - At a wedding you're: dance floor from song one / deep talk at the side table / running the sparkler exit / first to leave, happy
   - Ideal Sunday: trailhead by 8am / slow brunch + long reading / project in the garage / friends' place, no agenda
   - Banter register: teasing is love / earnest is love
   - Travel: itinerary is the fun / booking the flight is the whole plan
   - You nerd out on: (short free text — pure pitch fuel)
   - Social battery: big group energy / one-on-one depth
   Every answer is a fact a pitch can use verbatim ("She's a 'sparkler exit' person").
3. **Homogamy facts — 3 items** (F3): education level; politics position + matters-toggle; ambition/pace ("building a big career / building a big family / genuinely both").
4. **Conversation style — 2 items**: opener preference (banter first vs depth first); storyteller vs question-asker. (F7; also feeds register personalization, §4.)

### Option C — Deep (~35 items, ~7 min)
Option B + attachment short-form (8) + regulatory focus (4). More science, real drop-off risk. My take: not at launch — attachment data isn't actionable at the intro stage (F5), and onboarding already has voice memos + photos + swipes in it.

### The pitch-taste calibration step (your B8 — revives the dead `taste_calibration`)
Immediately after the quiz: **8 sample pitches about composite/sample people, Likert 1–5 "would you want to hear more about this person?"** Order randomized; the 8 cells span the style matrix (§4) so every angle×lead combination appears.
Outputs, per reader, before their first real intro:
- **Style priors**: which angles they rate up (day-zero targeting, refined by live behavior).
- **Pickiness**: their mean rating. Your "maybe they're not picky and everything's a 5" case is a *feature* — an all-5s reader gets global priors and a high-pickiness-tolerance covariate, and we know their fires are less diagnostic.
- **Scale use**: their variance (some raters compress scales; this de-biases their later signals).
~2 min. Uses the already-built seed-narratives + vote UI skeleton; changes: Likert instead of binary, cells assigned from the matrix, and **the data actually gets read**.

---

## 4. The pitch style matrix (C13 — what we vary, personalize, hold)

Deliberately small. Every varied dimension multiplies the data a cohort must produce (§6), so at launch we randomize exactly **two axes** and personalize or freeze the rest.

**VARY (randomized — the experiment):**
- **Angle (4)** — the existing tiers, kept for data continuity but reframed as a clean 2×2 — *what the pitch promises* × *how the reader relates to the subject*:
  | | promises growth/novelty | promises warmth/safety |
  |---|---|---|
  | **kinship** ("your kind of person") | `i_sharing` — same jokes, same eye | `comfort` — easy, home-feeling |
  | **elevation** ("an impressive other") | `self_expansion` — their world expands yours | `admiration` — character proven in action |
- **Content lead (2)** — your stated hypothesis, now a measured contrast: **interest-led** (concrete activities/passions: "spent March learning upholstery") vs **character-led** (temperament/way-of-being: "the friend who remembers what you said in October").

**PERSONALIZE (set from the quiz, not randomized at launch):**
- **Register** — playful/teasing vs earnest, matched to the reader's banter item. (Mismatched register is the fastest way to feel "not my milieu"; we don't spend experiment budget proving it.)

**HOLD CONSTANT (craft, not variables):**
- Structure (hook → story → proof → close), the 9 tone rules from `matching_algo-v1.md`, 3–4 sentence length, no appearance, no reader-reference, never the same text twice (Rule 7).

**LOG-ONLY (recorded per pitch, analyzed later, not deliberately varied):**
- Hook type (quote/contradiction/scene), quote-used, critic scores, generation attempts. These become free retrospective analyses once volume exists.

8 cells (4 angles × 2 leads), analyzed as **main effects, not cells** — that's what makes it affordable (§6).

---

## 5. Delivery + experiment design — the Dane problem

### The design (your C12, formalized)
For each (reader, candidate) pair, at assignment time:
- Draw **K ∈ {1, 2, 3}** — how many different-style attempts this candidate gets — with probabilities ~(.2, .3, .5) *(starting values, tunable)*.
- Draw a random **style order** (angles without replacement; lead randomized per attempt).
- Serve **1 pitch/day** (D3). A pass at attempt < K → tomorrow, same candidate, new angle, framed honestly: **"Another side of Dane."** A pass at attempt K → why-chips (optional, skippable) → next candidate.
- **Hard pass** is always available ("not for me — next person"): early exit that skips remaining attempts. Logged separately — a hard pass is candidate-level information, a soft pass is style-level information. The choice itself is signal.
- 🔥 fire → photo reveal → interested / not (existing flow; photo-pass permanence per Rule 1, unchanged).
- Exhausted candidates → cooled re-pitch pool, eligible later *only with angles they haven't worn* (upgrades today's blunt 60-day re-pitch).

### Why sequential-same-candidate is the right call at low N (this is the memo's core argument)
1. **It kills the biggest noise source.** A fire is `style effect + candidate desirability + reader mood`. Candidate desirability almost certainly dwarfs the style effect. Comparing styles *on the same candidate for the same reader* removes it entirely — the comparison Charles actually wants ("did the angle fail, or did Dane?") is the only one this design can answer directly. *(Assumption, honestly labeled: candidate variance > style variance. If wrong, we lose nothing — the randomization still supports the standard analysis.)*
2. **It stretches a thin pool 3×.** At 50 users a reader has ~15 eligible candidates = 15 days of content at 1/day. With K≤3 it's up to 45 days. Supply and statistics want the same design — that's rare.
3. **It feeds per-reader learning fastest**, because each reader generates within-person contrasts instead of one-shot observations.

### The "everyone accepts the 3rd one" problem (your control question)
The threat: fires drift toward later positions regardless of style (exposure, warming-up, last-chance intuition), contaminating style estimates. Three stacked controls:
1. **Randomized style order** — across the dataset, every style appears at every position equally often. Position effects then *cannot* masquerade as style effects; they decorrelate by construction.
2. **Randomized K** — with K sometimes 1 or 2, "the 3rd pitch" isn't a learnable ritual, and the reader can't strategically wait (they never know if there IS a next attempt — which also keeps attempt 1 honest).
3. **Position as a model term** — the analysis is a logistic model: `fire ~ angle + lead + position + attempt-of-candidate + reader (random) + candidate (random) + pickiness`. If people really do accept 3rd pitches more, that loads on the position term and the style estimates stay clean. We *measure* the drift instead of hoping it away.

### Fire economy (C10 — you flagged the tension; here's the resolution)
A daily fire *quota* only makes sense when multiple simultaneous cards compete. At 1 pitch/day, scarcity already exists structurally. Recommendation: **no quota at launch.** The cost of a careless fire is real and built-in — Rule 1 permanence — so we make *that* the friction: the reveal confirm says "If you reveal and pass, Dane's gone for good." Deliberation preserved, no bookkeeping. Quotas (and the save-queue economy from v1) return if/when batch delivery returns at scale.

### Photo-stage failure loops (your C10 idea, made concrete)
- **Candidate side:** ≥3 fires ending in photo-pass with ≤1 photo-interest *(starting values, arbitrary — tune)* → "Your intros are landing. Your photos aren't keeping up" → photo coaching nudge (kind, private).
- **Style side (Goodhart guardrail):** a style with high fire-rate but low photo-interest-given-fire is writing checks the person can't cash — clickbait. **Photo-interest-given-fire per style is a pre-registered guardrail metric**, so fire-rate optimization can't quietly reward overpromising.
- **Reader side:** a reader who fires often but never converts at photo → their Elo band or expectations are miscalibrated; surface in admin before auto-acting.

### Interplay with woman-first sequencing (T19, already approved)
If `WOMAN_FIRST_SEQUENCING` is on, men receive intros only after a woman fires+likes — men's stream is smaller and conditioned on her interest, so **the style experiment learns primarily from women readers.** That's Keeper-consistent (the woman's decision is the scarce resource) and statistically fine — but it roughly halves total pitch volume vs. symmetric delivery. §6's timelines assume symmetric delivery; under woman-first, read the table at ~half the cohort's speed for cross-gender conclusions and full speed for women-reader conclusions. Your call on whether the flag is on for launch (folded into D1).

---

## 6. What each cohort size buys (E16)

**Assumptions, all labeled, all order-of-magnitude:** balanced genders in one metro; ~60% of the opposite-gender pool survives hard filters *(assumption)*; fire rate ~20% for power math *(unknown — bracketed 10–30%, timelines scale accordingly)*; 1 pitch/reader/day; K≤3. Power: two-sided α=.05, 80%. Detecting a **10-point** fire-rate gap (20%→30%) needs ~300 pitches per compared level; a **5-point** gap needs ~1,100. The factorial matrix is efficient: **the same 1,200 pitches** give 300/angle-level AND 600/lead-level — both launch questions ride the same data.

| Cohort (balanced) | Eligible pool/reader | Pitch-slots/reader (K=3) | Runway @1/day | Cohort pitches/day | What becomes answerable, when |
|---|---|---|---|---|---|
| **20** | ~6 | ~18 | ~2.5 wk | ~20 | Total capacity ~360 pitches — only huge effects. This is **concierge mode**: product QA, copy iteration, funnel mechanics. Not a lab. |
| **50** | ~15 | ~45 | ~6 wk | ~50 | **Global angle + lead ranking (big effects) in ~1 month** (1,200 pitches ≈ 24 days). Capacity ~2,250 pitches before pool exhaustion. Trait-segment reads only marginal by end of runway. |
| **100** | ~30 | ~90 | ~3 mo | ~100 | Global answers in ~2 wk; **trait×style interactions** ("do high-openness readers really prefer self-expansion?", ~5,000 pitches) in ~7 wk. The quiz starts paying rent. |
| **250** | ~75 | ~225 | ~7 mo | ~250 | Interactions in ~3 wk; **per-reader style priors** real by month 2 (hierarchical shrinkage); Thompson sampling defensibly on. |
| **500+** | ~150 | — | — | ~500 | Per-user weights live; collaborative filtering ("readers like you fired on…") — the Hinge-style behavioral layer becomes possible. |

**What 50 people gets you, concretely:** a functioning matchmaking service *and* a real experiment for ~6 weeks. By day ~30 you know, with honest error bars, which of the 4 angles and 2 leads win **globally** at the 10-point level. Every reader has personal style priors from calibration + ~30 live observations. Rough outcome math *(assumptions: 15–30% of fires eventually reciprocated; 40–60% of mutuals reach a date)*: ~10 fires/reader over the runway → ~25–75 mutuals cohort-wide → **~15–40 first dates in ~2 months** — enough to exercise the whole north-star funnel, not enough to *train* on date outcomes (fires stay the training signal, dates stay the guardrail — consistent with your C10).

**The waiting ROI, in one line each:**
- 20 → 50: category change — the lab turns on.
- 50 → 100: answers arrive ~2× faster AND trait-segment questions unlock (biggest marginal jump).
- 100 → 250: personalization (per-reader learning, adaptive assignment).
- 250 → 500: collaborative filtering.

**Gender imbalance warning:** the majority gender's runway is set by the *minority* count (runway_majority ≈ minority × 0.6 × 3 days). 60/40 in a cohort of 50 → men get ~5 weeks of content, women ~7.5. Balance matters more than totals; recruit accordingly.

**Minimum viable launch (my recommendation for D1): 40–60 signups, roughly balanced, one metro.** Below ~30, run concierge mode and keep banking waitlist. Above ~80, nothing is lost by starting — the table just reads faster.

---

## 7. Onboarding v2

**Flow:** signup → basics (+ education/work) → **quiz (§3, new)** → voice memos → preferences (+ politics toggle) → photos → calibration swipes (seed photos, unchanged per D15) → **pitch-taste calibration (§3, revived)** → reveal.
Added time: ~5–7 min on top of today's flow. The quiz goes *before* voice memos deliberately — forced-choice is a warm-up that makes talking to a microphone feel less cold, and its answers give the voice prompts something to chase ("You said you're a sparkler-exit person — tell me about the last wedding you closed down").

**The own-pitch reveal (your B8 half-idea: "show you your pitches, tell you what you look like").** Recommendation: **yes — show exactly one.** The reveal step already exists and shows a personality radar; replace/augment it with a sample pitch about *them*: "Here's how we'll introduce you." One control only: **"Anything wrong here?"** flag (factual-accuracy QA — genuinely valuable data) — *not* free editing (self-authored pitches collapse into bios; the Lakers-5 voice is ours).
- For it: it's the activation wow-moment; it makes the core promise tangible in minute 12; it kills the biggest onboarding anxiety ("how will I be portrayed?"); it QAs extraction errors before any match sees them.
- Against it: generation latency at reveal (~solvable: generate during photo upload); vanity-editing pressure (mitigated by flag-only); mild spoiler of the daily-card magic.
On balance strongly worth it — this screen is probably also the referral screenshot.

**Waitlist quiz (B9 — phase 2).** Send the §3 quiz to waitlisted phones pre-launch: banks reader traits and style priors before day one, creates a touchpoint. **Tension to resolve:** results are private (B6), so the quiz needs *some* payback or it's homework. Options: (a) completion-tease only ("We know exactly how to introduce you now — you'll see it at launch"), (b) relax B6 for waitlisters with a shareable type card (referral fuel, contradicts B6), (c) skip until launch. Parked as D10.

---

## 8. Guardrails, measurement honesty, and migration

- **Frozen model discipline:** every change here lands as its own approved, labeled commit. The sort's milieu term (D8) ships pre-registered with the growth cockpit or not at all.
- **Pre-registered launch experiment:** metric = fire rate by angle/lead; guardrail = photo-interest-given-fire by style; window = the §6 timeline for the chosen cohort. Registered before the cron flips on. (PLY metrics aren't cockpit-wired yet — register anyway; it returns a warning and the readout pends.)
- **North star unchanged:** signup → first date. Fire rate is the *training* signal because it's the only high-volume one at this scale (§6 shows dates arrive at ~1/50th the rate of pitches); dates and photo-crash are the guardrails that keep fire-optimization honest.
- **Every constant above marked "starting value" is arbitrary until tuned** — K probabilities, the 8-sample calibration, photo-coaching thresholds. None are derived; all are logged so they *can* be.
- **Schema additions (sketch — full DDL in the spec phase):**
  - `pitch_events` — reader_id, candidate_id, angle, content_lead, register, hook_type, position (attempt № for this candidate), k_assigned, style_order_seed, narrative_hash, critic_score, action (`fire` / `pass_soft` / `pass_hard` / `expire`), why_chips[], photo_outcome, timestamps. *(One row per pitch — the experiment's atom. Today's `daily_intros` can't hold this; likely a new table with `daily_intros` kept for delivery mechanics.)*
  - `reader_traits` — big5, milieu, homogamy, convo-style jsonb + instrument version.
  - `pitch_taste_votes` — user_id, sample_id, matrix cell, likert (replaces dead `taste_calibration`).
- **What dies:** excitement-type steering of strategy selection (becomes measured priors); the hidden 60-day re-pitch (superseded by §5's explicit sequencing); the v1 fire-quota/save-queue economy (parked until batch delivery returns).
- **What survives untouched:** hard filters, Elo soft band, Rule 1 permanence, location tiers, the 9 tone rules, T7 attraction priors, woman-first T19 compatibility.

---

## 9. Decisions — what I need from you

| # | Decision | Options | My rec |
|---|---|---|---|
| **D1** | Launch threshold + mode | (a) launch at 40–60 balanced, one metro; (b) launch smaller in concierge mode; (c) wait for 100 | **a** — and turn on woman-first (T19) only if women's-side learning speed is acceptable per §5 |
| **D2** | Sequencing | (a) sequential same-candidate, randomized K≤3 + style order (§5); (b) v1-style hidden re-pitch; (c) no re-pitch | **a** |
| **D3** | Cadence | (a) 1 pitch/day; (b) soft-pass offers a same-session second angle; (c) batch of 2–3 | **a** — daily ritual, supply-matched; b is a nice later test |
| **D4** | Fire economy | (a) no quota + Rule-1 permanence framing at reveal; (b) 1 fire/day quota | **a** at launch |
| **D5** | Reader instrument | Battery A / **B** / C (§3) | **B** (~23 items, ~5 min) |
| **D6** | Style matrix | (a) 4 angles × 2 leads, factorial main effects; (b) fewer cells; (c) add register as a third randomized axis | **a** — register personalized, not randomized |
| **D7** | Own-pitch reveal | (a) show one sample + accuracy flag; (b) don't show | **a** |
| **D8** | Milieu term in sort | (a) log-only for month 1, then add as a pre-registered small multiplier; (b) ship in the sort at launch; (c) never | **a** — collect before weighting |
| **D9** | Pitch-taste calibration | (a) 8 samples, Likert 1–5 (§3); (b) skip | **a** |
| **D10** | Waitlist quiz | (a) phase 2 with completion-tease; (b) phase 2 with shareable type (relaxes B6); (c) launch-only | **a** |

Answer like "D1a, D2a, …" — anything you override, I fold in. Then I write `matching_algo-v2.md` (full spec: flows, prompts, schema DDL, experiment pre-registration, admin instrumentation) against your picks.
