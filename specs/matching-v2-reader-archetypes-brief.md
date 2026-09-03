# Brief — Reader Archetypes & Content Calibration

**Commissioned by Charles 2026-08-23.** Kicks off the work of deciding what a "reader archetype" is in PLY, whether content calibration beats style calibration, and what we bank at launch to find out.
**Origin:** the Anne/Jessica problem — *"how do we pitch Dane to Anne (FIT, fashion, urbane) so she's salivating AND pitch the same Dane to Jessica (gourmand, doesn't care about fashion)?"*
**Companions:** `specs/matching-v2-story-elicitation.md` (the eight story assets) · `matching_algo-v2.md` §5–§6 (taste step + style matrix) · `specs/matching-v2-decision-memo.md` §1 F1–F4.

---

## 1. The candidates Charles named, assessed honestly

### Marketing / Jungian archetypes (Hero, Sage, Jester, Caregiver, Explorer, …)
No psychometric validity as a measure of persons — they were never built to be one. **But that isn't disqualifying, because their real job is different.** A brand archetype is a *writer's* instrument: it keeps a voice consistent across many pieces of copy. That is exactly what our generator needs and roughly what §6.1's four angles already are.
**Verdict: useful as a writing aid, useless as a reader classifier.** Do not classify readers with them. If anything, they are a candidate vocabulary for the *pitch* side, and the four angles already occupy that slot.

### Enneagram — including deriving a type from our values items
Hook et al.'s systematic review (2021, *J. Clin. Psychol.*, 104 independent samples) found **mixed** evidence of reliability and validity. There is no standardised peer-reviewed instrument, published reliability coefficients for the major assessments are absent, and there is **no peer-reviewed evidence of predictive validity for relationship quality**. Deriving a type from our own values items would mean inventing a type assignment from a construct that has no validated instrument to derive it against — invention compounded on invention, and a direct violation of the house rule against presenting arbitrary constants as derived.
**Verdict: no.**

### Five love languages
Impett, Park & Muise (2024, *Current Directions in Psychological Science*) tested Chapman's three central assumptions and **none survived**: people endorse all five as meaningful rather than having one primary; the factor structure does not replicate as five; and matching on languages does not predict satisfaction — *all* expressions of love relate to higher satisfaction regardless of stated primary language.
**Verdict: no as a typology.** One salvage worth keeping: the five categories are a serviceable *vocabulary of caring behaviours*, and three of them already appear in our battery (Q15 gifts, Q16 "I start showing up for things", Q10). Use the vocabulary, never the types.

---

## 2. Why all three fail the same way — and what we actually need

Every candidate is a **taxonomy of people**. We don't need one, and F1 says we can't have a useful one anyway: Joel, Eastwick & Finkel ran ML over 100+ traits and could not predict pair-specific attraction at all. Eastwick & Finkel (2008) go further — stated preferences don't even correlate with the preferences people exhibit face to face.

What we need is a **taxonomy of what a reader responds to in a pitch.** That is a different object, and it has three properties none of the borrowed frameworks have:

1. It is about our artefact, not about the person's soul, so it can't be wrong about them.
2. It is **measurable inside the product**, from revealed response rather than self-report — which is the only kind of preference data F1/F4 say is worth having.
3. We are already building the instrument that measures it.

---

## 3. The proposal: archetype = an asset-preference vector, measured by the taste step

The eight story assets (`story-elicitation.md`) are the unit of pitch content: **the line · the image · the long thing · the tell · the wrong turn · the witness · the noticing · the care.**

Anne and Jessica are not different *people-types*. They are different **asset preferences** over the same subject. Anne responds to *the noticing* + *the tell*. Jessica responds to *the long thing* + *the image*. Dane's carburettor appears in Jessica's pitch and never appears in Anne's, and neither pitch is a lie.

**So redesign the pitch-taste step (D9) to measure asset preference instead of style preference.**

| | current spec (`matching_algo-v2.md` §5) | proposed |
|---|---|---|
| what varies across the 8 samples | 4 angles × 2 content leads | **8 asset classes, one each** |
| what's held constant | length, subject | length, subject, **and angle/lead** |
| derived output | `taste_priors` per angle | **`asset_priors` — 8 numbers per reader** |
| angle/lead | the design factor | logged covariate |

Cost is identical: 8 cards, ~2 minutes, same Likert, same UI. The subject-neutrality and cell-purity requirements from trap 8 carry over unchanged — cell-pure now means *one asset class only*, which is if anything easier to author than one feeling contract only.

**What we give up:** per-angle taste priors. They were never used at launch — Phase R randomises angle by design, and the priors were a Phase T input. Asset priors are a Phase T input too, and a more valuable one if content beats style.

**Do not name the archetypes yet.** At launch we carry the raw 8-vector. Names come from clustering real vectors at ~200 readers, and they are a *marketing* artefact — the shareable type card is already scoped as D10 phase 2. Naming types before the data exists is how we would end up with our own Enneagram.

---

## 4. Content calibration as a launch experiment (Charles: approved to explore)

Keep Phase R's style randomisation exactly as designed. Add **one binary randomised factor**:

```
content_targeting ∈ { aimed, random }        50/50, randomised per pitch
  aimed  → the pitch leads with the reader's top-scoring asset class
           (from asset_priors), second asset drawn from their top 3
  random → leading asset drawn uniformly from the assets available
           for that subject
```

Logged on `pitch_events`: `lead_asset`, `content_targeting`, `reader_asset_rank_of_lead`, `assets_available[]`.

**Why this is the right shape.** It answers the actual question — *does knowing what content lands on this reader beat knowing what tone lands on them* — as a clean two-level contrast, without abandoning the style design. Both factors stay randomised so neither confounds the other. And the pre-registered analysis is a one-line extension of the existing model: `fire ~ angle + content_lead + position + content_targeting + …`.

**The honest cost:** power. We are adding a factor to a design the T-SIM already has to prove is recoverable at ~1,200 events. **T-SIM must be re-run with this factor injected before launch** — if S1/S2 fail with it in, we ship it logged-but-unrandomised (aimed for everyone, or random for everyone) and learn observationally instead. That decision is made by the simulation, not by preference.

**Prior worth stating:** I expect content to beat style, because Montoya's meta-analysis (r≈.47 in no-interaction settings, and an intro card is precisely a no-interaction setting) says *actual similarity* drives pre-meeting attraction — and similarity lives in what is shared, not in how it's said. That is a hypothesis for the experiment to kill, not a reason to skip randomising.

---

## 5. Verbatim treatment — Charles's idea, and it solves the humour problem

> *"when someone says something genuinely funny, we present it in quotes or some visual treatment that denotes verbatims from the pitchee."*

This is the direct answer to Bressler & Balshine. Women prefer men who **produce** humour; men and women use "good sense of humour" to mean different things; and a pitch that *claims* funny does nothing once every pitch claims it. A marked verbatim is not a claim — it's the demonstration. It is *the line* asset, surfaced as itself.

Design rules:
- **Only genuinely verbatim.** Never a paraphrase inside quote marks, never a cleaned-up version, never a composite. One fabricated quote poisons the entire mechanic and there is no way to earn it back.
- Visually distinct — pull-quote treatment inside the card, attributed to the subject, unmistakably *their words* and not the narrator's.
- Short. A quote long enough to need reading is not a quote, it's a paragraph.
- The critic must gain a check: quote present in the card ⇒ exact string match against a stored `notable_quote`, else regenerate.

**Two things to resolve before building it.** (a) `EXECUTION.md` §8 says *never expose one user's private voice-memo content to another* — the generator already uses `notable_quotes` from memos, so quoting is happening today; making it visibly a quote changes what it *reads* as, and Charles should rule on that explicitly rather than have it drift. (b) If we do it, the voice step needs one line of consent microcopy so nobody is surprised to see their sentence in someone else's card.

---

## 6. The witness asset does not exist — Charles confirms there are no friend vouch quotes

`matching_algo-v2.md` §6.1 lists `friend_vouch_quotes` as a feed for the `admiration` angle. There is no vouch flow, so that field is permanently empty and the angle is running on one leg.

This matters more than a missing field, because **the witness is the only asset a person cannot self-claim.** Everything else in the taxonomy is self-reported and therefore discountable; a third party saying "he remembers everything you tell him" is the one piece of evidence in the whole system that carries outside credibility.

It is also, not coincidentally, a growth loop: asking a friend to vouch is an invitation with a reason attached.

**Recommendation: not now, but spec it as its own thing.** At launch, `admiration` leans on *the long thing* and *the wrong turn*, and the G3 swap-rate monitor will tell us how often that isn't enough.

---

## 7. Socioeconomic class and rural/urban

F3 lists education, religion/religiosity, politics, SES and age as the strongest assortative dimensions. We now capture education, politics, age, and religion via the community pool. **SES is the gap.**

- **Do not ask about income.** Self-reported income is unreliable, socially loaded, and for a 24–35 population it is badly confounded by students and early-career earners.
- **Derive SES from education × occupation.** Education is Q19. Occupation should come free from voice-memo extraction and currently isn't extracted as a first-class field — that is a small, cheap addition to `extraction-v2.ts` pass 2 and it is worth more than any income question would be.
- **Derive rural/urban/suburban from ZIP.** We already have `zip_locations` with 33K US zips; density or RUCA codes are public data and cost the user nothing. My read is that the rural/urban axis is a *better* milieu variable than income for our purpose — it maps to how a date actually goes, and it isn't socially loaded to compute.
- **Bank both, use neither at launch.** At one metro (D1) there is almost no variance for either to discriminate on. They earn their place at metro 2–3, and they are much better to have banked from day one than to backfill.

---

## 8. Does the quiz actually make the prompts better? Test it, don't assert it

Charles: *"perhaps the quiz could feed the prompts, but let's define that architecture if it materially makes prompts richer/better."*

Right challenge. The honest answer is that D-QD4's 47 fished prompts are built on three plausible mechanisms — rehearsal/commitment, context pre-loading, coverage — and **zero evidence**. The existing 56-prompt bank is good; random draws from it might produce equally good stories at a fraction of the maintenance.

It is cheap to find out, because the metric already exists: the Labov usability score from `story-elicitation.md` §4.2 (`usable = orientation && complicating_action && (breach || image) && concrete_noun_count >= 3`).

```
FISHED_PROMPTS_ENABLED  → randomised 50/50 per user at onboarding, logged
  on → up to 3 fished prompts + 3 bank (D-QD4 selection)
  off → 6 bank prompts (today's getOnboardingPrompts behaviour)
compare: share of memos with usable === true · mean concrete_noun_count ·
         voice-step completion · mean memo duration
```

If fished prompts don't beat the bank on story quality, we delete the map and keep the bank — and that is a good outcome, because 47 versioned prompts tied to an instrument version is real maintenance cost.

---

## 9. What this brief asks Charles to decide

1. Redesign the taste step to vary by **asset class** instead of style cell? *(rec: yes — same cost, and it's the only thing that makes content calibration possible)*
2. Ship **content_targeting** as a randomised launch factor, conditional on T-SIM showing it's recoverable? *(rec: yes, with the simulation holding the veto)*
3. Verbatim quote treatment — approve in principle, and rule on the §8 private-content question? *(rec: yes, with the exact-match critic check and consent microcopy)*
4. Vouch flow — park it as its own spec, or pull it forward? *(rec: park, but it's the highest-value missing asset and it doubles as an invite loop)*
5. Occupation extraction + ZIP-derived rural/urban, banked and unused at launch? *(rec: yes, both cheap)*
6. A/B the fished prompts against the bank? *(rec: yes — it's the only way to know whether D-QD4 earns its maintenance)*
