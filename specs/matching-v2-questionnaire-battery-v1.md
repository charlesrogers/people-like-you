# D-QD1 — Reader Instrument, Battery v1.0-rc2

**Supersedes** `matching_algo-v2.md` §4.1–§4.3 (items and copy). Structure, storage and envelope from the brief still bind.
**Voice:** dry stems + warm-sincere framing copy (Charles, 2026-08-22 — Q1 answer **b**).
**Research basis:** `specs/matching-v2-questionnaire-research.md`. **Three-voice draft it was chosen from:** `specs/matching-v2-questionnaire-batteries.md`.
**Status:** release candidate 2. Not frozen — freezes as **v1.0** after Charles's inline approval and the D-QD6 pilot revision pass.

---

## 0. Locked structural decisions (Charles, 2026-08-22)

| ref | decision |
|---|---|
| Q1 = b | Voice: dry stems, warm-sincere framing/microcopy |
| Q2 = a | **Agree–disagree Big Five block killed.** Replaced by item-specific 4-option situational items. Invalidates test-plan **U17**; acceptance criterion **N5 → N5′** (research brief §4) |
| Q3 = a | Second N item added → **23 items** |
| Q4 = a | "At seventeen" kept, with "a completely different person" as a first-class option, item skippable |
| — | Q19 free text is **text OR ≤30 s audio** (Charles) — transcript templates the voice prompt; audio goes through the T24 moderation path |
| — | Politics importance is **3-way**, hard filter on the top tier only; middle tier logged, unused at launch (Charles: "save this for the people who really care/testing") |

## 1. Envelope

| | |
|---|---|
| items | **23** |
| screens | 23 item screens + 5 zero-tap block cards + intro + close |
| format | one item per screen, single tap auto-advances, persistent Back |
| est. time | ~3.5 min (23 × ~9 s) + up to 30 s if Q19 is recorded |
| skippable | Q1, Q19, Q22 (3). Skip writes **null**, never a midpoint |
| typing | Q19 only, and it is optional even there |
| reversed wording | none. Straightline protection = randomised **option-order polarity** on the 9 trait items, stored per response so scoring un-flips it |

**Block order** (trap 4): identity → wired → actual life → how you talk → free text → facts, politics last.

| block | card copy | items |
|---|---|---|
| 1 · Identity | "Let's start with who you've been." | Q1–Q3 |
| 2 · Wired | "Now, how you're built." | Q4–Q12 |
| 3 · Actual life | "What your weeks actually look like." | Q13–Q15 |
| 4 · How you talk | "How you come across." | Q16–Q18 |
| 5 · One thing | *(no card — flows from block 4)* | Q19 |
| 6 · Facts | "A few plain ones, then you're done." | Q20–Q23 |

**Construct budget**

| trait | dedicated | double-scored | indicators |
|---|---|---|---|
| O | Q4, Q5, Q6 | — | 3 |
| E | Q7, Q8 | Q2, Q3 | 4 |
| C | Q9 | Q13, Q14 | 3 |
| A | Q10 | Q15 | 2 |
| N | Q11, Q12 | — | 2 |

---


---

## 1b. Governing principle (Charles, 2026-08-23 — supersedes charter §1 job 2 and criterion N3)

> **Closed-set answers are hidden data, not pitch copy.** "Nothing about these answers is actually unique to people, thus not interesting. We can amplify these attributes via their stories, but the stories are the good parts. These are hidden data for the narrative we weave."

Consequences, binding on every item below:

1. **No item is written to be quotable.** An item's job is (a) to discriminate, (b) to be fun to answer, (c) to fish for a story. Verbatim pitch material comes only from open responses — voice memos, Q19, vouches.
2. Items are allowed to be **oblique**. Freed from flattering the answerer, an item can measure openness through a restaurant menu and conscientiousness through what time you arrive.
3. **N3 is revised.** The per-item rationale column changes from "pitch-use example sentence" to **"what it steers"** — angle prior, register, milieu term, or story prompt. An item that steers nothing dies.
4. **D-QD4 (voice-prompt map) is promoted** to the highest-value deliverable of this session. The quiz aims the mic; the mic gets the good material.

## 2. The battery

23 items. Options listed **low→high on the scored trait** where the item is ordinal; presentation order is polarity-randomised on trait items, **except Q9**, whose options are a clock and must stay in time order.

### Block 1 — Identity · *"Let's start with who you've been."*

**Q1 · `M1` · milieu · `[skip]`**
> **At seventeen you were, on the record…**
> theatre kid · jock · honor-roll grinder · the one organizing the hang · happily unaffiliated · a completely different person

**Q2 · `M2` · milieu + E**
> **Group chat, your role**
> mostly reads, occasionally devastates · asks the real question · voice-note monologuist · sends the memes · makes the plans

**Q3 · `M3` · milieu + E**
> **Wedding, 10pm**
> home already, no regrets · the good conversation at the side table · running the sparkler exit · dance floor since song one

### Block 2 — Wired · *"Now, how you're built."*

**Q4 · `T-O1` · O** — *replaces the "plan changes an hour out" item*
> **A restaurant you've been to before. The menu arrives.**
> the usual, obviously · the usual, after reading the whole menu · never the same thing twice · whatever I've never heard of

**Q5 · `T-O2` · O** *(frequency anchor)*
> **Last time you were out of your depth on purpose:**
> this month · this year · a few years back · honestly, I like knowing what I'm doing

**Q6 · `T-O3` · O + milieu** — *replaces both the unclear "handed something" item and the travel item*
> **A free Saturday in a city you don't know:**
> the three things everyone says to do · whatever's within a few blocks · I walk until something happens · I ask someone who lives there and go do that

**Q7 · `T-E1` · E** — *replaces "three days of people"*
> **The party's good. You've been there three hours.**
> I left an hour ago · I'm in the long goodbye · second wind · I'm deciding where everyone goes next

**Q8 · `T-E2` · E** — *replaces "party, you know one person"*
> **Your phone rings. No text first.**
> I do not answer phone calls · I answer for maybe four people · I answer, but I'm bracing · I'm glad someone called

**Q9 · `T-C1` · C** — *replaces "the calendar"* · **no polarity randomisation**
> **You're meeting someone at 7.**
> I'm there at 6:50 · I'm there at 7 · 7:05, and I texted · 7:15, and I did not text

**Q10 · `T-A1` · A** — *"fix it" removed*
> **Someone you love is having a bad day. You:**
> get practical — what do you need · tell them about the time it happened to you · make them laugh · say nothing useful and stay anyway

**Q11 · `T-N1` · N** — *replaces "conversation that mattered"*
> **You sent a text an hour ago. Nothing back.**
> nothing, they're busy · I've reread what I sent · I've reread it and drafted the follow-up · I've decided what it means

**Q12 · `T-N2` · N** — *replaces "something goes sideways"*
> **The thing you said years ago that you still think about:**
> doesn't exist · exists, surfaces rarely · surfaces more than I'd like · I could tell you the exact room

### Block 3 — Actual life · *"What your weeks actually look like."*

**Q13 · `M4` · milieu + C**
> **Your last three Saturdays, honestly:**
> outside before most people were up · nothing on the calendar, and that was the point · elbow-deep in something I was making or fixing · at someone's kitchen table too long · working, and not entirely mad about it

**Q14 · `M7` · milieu · story fisher** — *new*
> **The thing in your place a guest always asks about:**
> a plant situation that got out of hand · an instrument · the books · something I made · honestly nothing — it's very clean

**Q15 · `M8` · milieu + A**
> **A gift from you looks like:**
> something that makes them laugh in the room · something I made · the thing they mentioned once, months ago · a day out, not an object

### Block 4 — How you talk · *"How you come across."*

**Q16 · `M5` · register**
> **How someone can tell you like them:**
> I start making fun of them → *playful* · I get deadpan and hope they catch it → *playful* · I just tell them → *earnest* · I show up for things → *earnest*

**Q17 · `CS1` · register tiebreak (used only when Q16 is missing)**
> **First conversation you'd want:**
> banter that finds depth → *playful* · depth that finds jokes → *earnest*

**Q18 · `CS2` · logged**
> **In conversation, more:**
> the storyteller · the question-asker · genuinely depends who I'm with

### Block 5 — One thing

**Q19 · `M9` · free response · `[skip]` · text ≤120 chars OR audio ≤30 s**
> **What do you nerd out on?**
> text placeholder: *specific beats impressive* · audio affordance: *or say it — 30 seconds*

Audio: upload → existing `/api/transcribe` (gpt-4o-mini-transcribe, whisper-1 fallback) → store `m9_text` (transcript) **and** `m9_audio_url`. Transcription runs in the background while the user completes Q20–Q23 (~30 s of one-tap items — this is why Q19 is not last). No transcript by the voice step → generic prompt fallback. **Audio is public-facing UGC → takes the T24 OpenAI-moderation path.** The clip also flows into extraction as ordinary story material.

### Block 6 — Facts · *"A few plain ones, then you're done."*

**Q20 · `H1` · milieu (eduAdjacency)**
> **Education:**
> high school · some college · bachelor's · grad school or beyond

**Q21 · `H3` · milieu (H3 term)** — *reframed: "building a family" is incoherent for a single person; the construct is forward orientation, not present-tense construction*
> **The next five years, honestly:**
> my work gets serious · my life gets full — people, a house, all of it · both, and I know how that sounds · I've stopped making five-year plans

**Q22 · `H2` · milieu (politics gap) · `[skip]`**
> **Politically, roughly:**
> progressive · lean progressive · somewhere in the middle · lean conservative · conservative · *rather not say*

**Q23 · `H2b` · importance · hard filter on top tier only**
> **How much does this matter in someone you'd date?**
> not really something I think about · I'd rather be close on it · honestly, I'd struggle with someone far from me
> <sub>Only the last one narrows who you'll see.</sub>

> Tier 3 → bidirectional hard filter at >2 steps. Tier 2 → **logged only at launch**. Tier 1 → no effect beyond the existing soft milieu term. The sub-line is the battery's only deliberate mechanics disclosure and stays: the top tier materially shrinks the user's pool.

---

## 3. Per-item rationale — **what it steers** (revised N3)

| id | construct | what it steers | story it fishes |
|---|---|---|---|
| Q1 | milieu tribe | milieu match term | the tribe story — and "a completely different person" fishes the reinvention story, the strongest prompt in the set |
| Q2 | milieu + E | milieu · E prior | — |
| Q3 | milieu + E | milieu · E prior | the wedding/party story |
| Q4 | O | H1 angle prior (`self_expansion`) | — |
| Q5 | O | H1 angle prior | the out-of-my-depth story |
| Q6 | O + milieu | H1 angle prior · milieu | the trip that went sideways or perfectly |
| Q7 | E | H2 angle prior (`i_sharing` vs `comfort`) | — |
| Q8 | E | H2 angle prior | — |
| Q9 | C | milieu pace | — |
| Q10 | A | `comfort` angle prior | how they show up for people |
| Q11 | N | exploratory `comfort` prior | — |
| Q12 | N | exploratory | — |
| Q13 | milieu + C | milieu | the Saturday story — highest-yield prompt seed after Q19 |
| Q14 | milieu | milieu | **the object story** — the reason this item exists |
| Q15 | milieu + A | milieu | the best gift they ever gave |
| Q16 | register | §6.4 register (playful/earnest) | — |
| Q17 | register tiebreak | §6.4 | — |
| Q18 | conversation role | logged; later pairing analysis | — |
| Q19 | free response | — | **everything.** Templated verbatim into the prompt |
| Q20 | education | milieu eduAdjacency | — |
| Q21 | forward orientation | milieu H3 term | — |
| Q22 | politics | milieu politics gap · filter input | — |
| Q23 | politics importance | hard filter (tier 3 only) | — |

**Audit:** 7 of 23 items directly seed a voice prompt; the rest steer an angle prior, the register, or the milieu term. Nothing in the battery exists to be quoted. Q18 steers nothing at launch and is the standing cut candidate (Charles: keep for now).

---

## 4. Framing copy (warm-sincere)

| surface | copy |
|---|---|
| intro | "A few questions so we know how to introduce you. Nothing here is graded, and none of it is shown to anyone as a score." |
| honesty line | "Answer as the person who'll actually be sitting across the table." |
| block cards | "Let's start with who you've been." / "Now, how you're built." / "What your weeks actually look like." / "How you come across." / "A few plain ones, then you're done." |
| skip affordance | "skip this one" |
| close | "That's it. Next we'll ask you about a couple of things you just told us, and you get to answer out loud." |

The close is load-bearing: D7 forbids showing the reader their own pitch, which removes the ordinary quiz payoff. The payoff moves to the voice step visibly quoting them (research R10).

---

## 5. Downstream consequences to carry into other docs

1. `matching_algo-v2.md` §4.1–§4.3 replaced by this file; §4.4 voice-prompt map superseded by D-QD4.
2. Test plan **U17** (Big Five reversal fixtures) void — rewrite against item-specific scoring and option-polarity un-flipping. Q9 is exempt from polarity randomisation and its test must assert that.
3. Acceptance criterion **N5 → N5′** (research brief §4). **N3 revised** per §1b: rationale is "what it steers", not "pitch-use sentence".
4. Milieu function §9 input keys change from `M1–M8` to the ids here. The travel item is gone; Q6 replaces it and carries both O and milieu.
5. **V2-T2 scope grows**: Q19 audio capture, upload, transcription hand-off, moderation, audio storage column.
6. Politics importance is 3-way (`H2b ∈ {none, prefer, strong}`), not boolean — schema and `applyHardFilters` change; **U16** must test all three tiers and that tier 2 never filters.
