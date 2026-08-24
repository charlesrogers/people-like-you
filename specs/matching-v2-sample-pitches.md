# D-QD3 — Sample Pitches for the Taste Step

**Status:** DRAFT, orientation A only (subject is a man; shown to women readers). Orientation B authored after Charles kills or approves this.
**Design settled 2026-08-24:** milieu **stripped** from the samples — selection is the sort's job, presentation is the taste step's job. The pool varies on **angle × lead × register only**. Quotes are **in** and held **constant** (every sample carries exactly one marked verbatim), per Charles.

| | |
|---|---|
| pool per orientation | **16** = 8 cells (4 angles × 2 leads) × 2 registers |
| reader sees | **8** — one per cell, register randomised within cell |
| total | 32 across both orientations |
| length | 40–55 words, matched within ±10% |
| quote | exactly one per sample, marked, verbatim from the subject sheet |

**Two reads, two purposes** (`specs/matching-v2-content-targeting.md` §1):
- **down the reader (n=8)** → `pickiness`, `scale_use`. Robust. **`taste_priors` per angle is NOT computed** — n=2 per angle gives a ±1.5 Likert interval, wider than the usable scale. Raw votes are kept; the derived field is dropped.
- **across readers (n = 25+ per sample, growing)** → which pitches work, and whether quiz-derived register predicts rated register. That second one is a **free validity check on a live mechanism we currently run blind** (§6.4 sets every reader's register from Q16/Q17 with zero validation).

---

## 1. Subject sheet — M1 "Miles"

Synthetic. Not Dane (§6.3) — Dane is the *generator's* writing reference; reusing him would confuse calibration with generation.

**Miles, 29, physical therapist**, outpatient clinic, mostly post-surgical knees and shoulders.

| asset | material |
|---|---|
| the long thing | the Tuesday pickup basketball game he's run for four years — books the gym, chases the RSVPs |
| the making | teaching himself one Sichuan cookbook, one dish at a time, six weeks on dish one |
| the odd interest | bridges; will detour for one |
| the tell | a note on his phone of his patients' kids' names |
| the wrong turn | quit half-marathon training at week nine, doesn't defend it |
| the witness | *(unavailable — no vouch flow exists; see archetypes brief §6)* |
| quotes | "Pain is information. Most people argue with it." · "I'm not a good cook. I'm a persistent one." · "It's a truss bridge. I'm not going to apologize." · "Nine weeks was enough information." |

**Subject metadata block** — logged with every vote so residual confounding is modelable:
```json
{ "subject_id": "M1", "age_band": "25-34", "work_register": "healthcare/vocational-professional",
  "activity_domains": ["team_sport","domestic_craft","niche_intellectual"],
  "humour_register": "dry", "milieu_spread": "deliberately_spanning" }
```
`milieu_spread: deliberately_spanning` is the neutrality mechanism: rather than a milieu-neutral person (who doesn't exist), Miles is built to span organiser + maker + nerd rather than cluster in one tribe.

---

## 2. The 16

### Cell 1 — self_expansion × interest
**1p · playful**
> Miles is working through a Sichuan cookbook one dish at a time and won't move to the second until the first is right. He'll also detour twenty minutes for a bridge. **"It's a truss bridge. I'm not going to apologize."** Nobody in his life has escaped a lecture on load-bearing.

**1e · earnest**
> Miles is working through a Sichuan cookbook one dish at a time and won't move to the second until the first is right. He'll detour twenty minutes for a bridge he's read about. **"It's a truss bridge. I'm not going to apologize."** He collects things worth being slow about.

### Cell 2 — self_expansion × character
**2p · playful**
> Miles decides a thing is learnable and then learns it in the least glamorous order available — one dish, six weeks, no second dish. **"I'm not a good cook. I'm a persistent one."** Watching him do it makes other people's projects look hurried.

**2e · earnest**
> Miles decides a thing is learnable and then learns it in the least glamorous order available — one dish, six weeks, no second dish. **"I'm not a good cook. I'm a persistent one."** He isn't fast at anything he actually cares about.

### Cell 3 — i_sharing × interest
**3p · playful**
> Miles is a physical therapist who talks about knees the way other people talk about weather, and about bridges the way other people talk about knees. **"Pain is information. Most people argue with it."** He says it flat and waits to see who catches it.

**3e · earnest**
> Miles is a physical therapist who talks about knees the way other people talk about weather, and about bridges the way other people talk about knees. **"Pain is information. Most people argue with it."** He means that about considerably more than knees.

### Cell 4 — i_sharing × character
**4p · playful**
> Miles notices what people would rather he didn't — the shoulder someone's favouring, the two days a friend went quiet in the group chat. **"Pain is information."** He won't make a thing of it. He also won't let it go.

**4e · earnest**
> Miles notices what people would rather he didn't — the shoulder someone's favouring, the two days a friend went quiet in the group chat. **"Pain is information."** He won't make a thing of it. He'll just be around more that week.

### Cell 5 — admiration × interest
**5p · playful**
> Miles has run the same Tuesday pickup game for four years: books the gym, chases the RSVPs, plays whatever position is short. He also quit half-marathon training at week nine and has never once been embarrassed about it. **"Nine weeks was enough information."** The Tuesday game he has never missed.

**5e · earnest**
> Miles has run the same Tuesday pickup game for four years — he books the gym, chases the RSVPs, and plays whatever position is short that night. He quit half-marathon training at week nine and doesn't defend it. **"Nine weeks was enough information."** The Tuesday game he has never missed.

### Cell 6 — admiration × character
**6p · playful**
> Miles keeps a note on his phone with his patients' kids' names in it. Nobody asked him to. **"Pain is information. Most people argue with it."** Six years of post-surgical knees and the man still remembers whose daughter plays goalie.

**6e · earnest**
> Miles keeps a note on his phone of his patients' kids' names. Not a system anyone asked for — he started doing it and then couldn't stop. **"Pain is information. Most people argue with it."** Six years of post-surgical knees and he hasn't gotten bored of anyone.

### Cell 7 — comfort × interest
**7p · playful**
> Miles's Tuesdays are non-negotiable: same gym, same hour, same eleven people, four years. Wednesdays he cooks the one dish he's working on and gets it slightly less wrong. **"I'm not a good cook. I'm a persistent one."** The calendar has not moved in four years.

**7e · earnest**
> Miles's Tuesdays are fixed: same gym, same hour, same eleven people, four years running. Wednesdays he cooks the one dish he's working on and gets it slightly less wrong. **"I'm not a good cook. I'm a persistent one."** Nothing about his week is performed.

### Cell 8 — comfort × character
**8p · playful**
> Miles is unhurried in a way that reads as confidence and is closer to patience. He listens without assembling his reply, which is disarming and mildly unfair. **"Pain is information. Most people argue with it."** People tell him more than they planned to.

**8e · earnest**
> Miles is unhurried in a way that reads as confidence and is closer to patience. He listens without assembling his reply. **"Pain is information. Most people argue with it."** People end up telling him more than they planned to.

---

## 3. Craft-uniformity requirement (new — comes out of the pitch-demand research)

If craft is ~19% of fire-rate variance and the reader×content interaction is ~1%, then **craft variation across the 8 cards a reader sees is the largest confound in the `pickiness` measurement.** A low rating must mean picky, not unlucky draw.

So, before the pool ships:
1. All 16 run through `src/lib/narrative-critic.ts`.
2. They must land in a **narrow band**, not merely above threshold. Proposed: max − min critic score ≤ **0.5** on the existing scale **(SV)**, and no sample below the live generation threshold.
3. Any sample outside the band is rewritten, not dropped — cells must stay balanced.
4. Word counts recorded; 40–55 words, spread within ±10% of the pool mean.

---

## 4. Tone-rule and research compliance

Checked against all nine tone rules (§6.5) plus the three devices the pitch-demand research confirmed CTR-negative:

| rule | how the set complies |
|---|---|
| never braggy | achievements arrive sideways — the RSVPs, the note on his phone. Nothing is celebrated |
| never personify the app | no narrator voice anywhere |
| contradiction > single note | cells 5 and 7 are built on it (quit the half marathon / never missed a Tuesday) |
| close with image or joke, never sentiment | every close is a behaviour or a joke; no sample closes on a feeling |
| don't explain the meaning | nothing says what any of it *means about him* |
| accomplishments as creation, not ego | the cooking is 6 weeks on one dish; the running is a quit |
| no superlatives | verified — "most stable calendar in the state" was cut in draft for exactly this |
| specifics > patterns | every sample carries ≥3 concrete nouns |
| about the subject, never the reader | **no sample contains "you" in any form.** Two drafts did and were rewritten |
| *research:* no reader address | ✓ as above |
| *research:* no rhetorical questions | ✓ zero question marks in the set |
| *research:* no sentiment piling | ✓ no sample stacks more than one evaluative clause |

**Deliberate craft-uniformity note:** the register pairs are *minimal pairs* — same content and structure, differing only in the final clause and its framing. That isolates register as the variable and keeps craft constant within a cell. It also means the register effect, if any, is estimated cleanly rather than confounded with content.

---

## 5. Open / needs Charles

1. **The witness asset is absent from all 16** because there is no vouch flow. That means `admiration` samples (cells 5, 6) are running on the same leg the live generator will be. Honest, but it under-represents the angle.
2. **`taste_priors` should be dropped from the `reader_traits` schema** (§10) — it cannot be computed from 8 ratings. Raw `pitch_taste_votes` rows are kept and carry `sample_id`, `register`, `angle`, `content_lead`, `position`.
3. **Orientation B** (female subject, shown to men) is not written. Same structure, new subject sheet, 16 more.
4. UI copy must say **"sample"** — these are not real members (`matching_algo-v2.md` §5).
