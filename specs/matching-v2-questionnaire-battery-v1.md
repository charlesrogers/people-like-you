# D-QD1 — Reader Instrument, Battery v1.0-rc6

**Supersedes** `matching_algo-v2.md` §4.1–§4.3 (items and copy). Structure, storage and envelope from the brief still bind.
**Voice:** dry stems + warm-sincere framing copy (Charles, 2026-08-22 — Q1 answer **b**).
**Research basis:** `specs/matching-v2-questionnaire-research.md`. **Three-voice draft it was chosen from:** `specs/matching-v2-questionnaire-batteries.md`.
**Status:** release candidate 6. Not frozen — freezes as **v1.0** after Charles's inline approval and the D-QD6 pilot revision pass.

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
> **The group is picking a restaurant. Fourteen messages in.**
> I've already picked it · I've sent three links and a walking distance · I said "I'm easy" and meant it · I sent a meme about how long this is taking · I muted it and I'll go wherever

**Q3 · `M3` · milieu + E**
> **Wedding reception, 10pm.**
> already home, shoes off · at a side table, deep in the actual conversation · outside, handing out sparklers · on the dance floor since the first song

### Block 2 — Wired · *"Now, how you're built."*

**Q4 · `T-O1` · O** — *third attempt. A behavioural report on last night, not a disposition toward a class of situation.*
> **It's 1am. You're still up because:**
> the show kept autoplaying · I lost track of time · I went looking for one fact two hours ago · I've got an idea and I'm not putting it down

**Q5 · `T-O2` · O** *(frequency anchor)* · **seeds a prompt**
> **Last thing you said yes to with no idea what you were doing:**
> that was this month · sometime this year · a few years back · I like knowing what I'm doing

**Q6 · `T-O3` · O + milieu** · **seeds a prompt**
> **One free day in a city you've never been to.**
> I'm not missing the must-see things · whatever's near where I'm staying · I walk until something happens · I ask someone who lives there and go do that

**Q7 · `T-E1` · E**
> **The party's good. You've been there three hours.**
> actually, I left an hour ago · I'm in the long goodbye · second wind · I'm deciding where everyone goes next

**Q8 · `T-E2` · E**
> **Your phone rings. No text first.**
> I don't answer the phone. Ever. · I let it go and text back "everything ok?" · I answer, bracing · I'm delighted — it's been ages

**Q9 · `T-C1` · C** · **no polarity randomisation** · **seeds a prompt**
> **You're meeting someone at 7.**
> I'm there at 6:50 · I'm there at 7 · 7:05, and I texted · 7:15, but I have a story

**Q10 · `T-A1` · A** · **seeds a prompt** — *rewritten: the old version sorted people by support style, which costs nobody anything and therefore measures nothing (see `tasks/lessons.md` 2026-08-23). Agreeableness shows up where candour and loyalty are in tension.*
> **Your closest friend is getting back together with the ex. Again.**
> I say exactly what I think · I say it once, then I'm supportive · I ask questions until they hear themselves · I keep my mouth shut and stay close

**Q11 · `T-N1` · N**
> **You sent a text an hour ago. Nothing back.**
> nothing, they're busy · I've reread what I sent · I've reread it and drafted the follow-up · I know exactly what it means

**Q12 · `T-N2` · N** — *swapped: the old version was a second rumination item four screens from Q11. This covers anticipatory anxiety instead, which broadens N rather than repeating it.*
> **Someone says "can I give you some feedback?"**
> my stomach drops · I brace, then I'm fine · sure, go ahead · I asked for it, that's why I'm here

### Block 3 — Actual life · *"What your weeks actually look like."*

**Q13 · `M4` · milieu + C** · **seeds a prompt**
> **Your last three Saturdays, honestly:**
> outside before most people were up · nothing on the calendar, and that was the point · elbow-deep in something I was making or fixing · at someone's kitchen table too long · working, and not entirely mad about it

**Q14 · `M7` · milieu · **the story-fishing item*** · **seeds a prompt**
> **The thing in your place a guest always asks about:**
> the art · a chair I overpaid for · the gear — bike, skis, clubs · an instrument · something I made · nothing, and I've never once thought about it

> Option 6 exists so that indifference to a living space reads as a preference, not a deficiency (Charles, 2026-08-23: "it's just not a priority for many guys... so we don't highlight it"). It routes to a **non-object prompt** in D-QD4 — never "tell us about your place."

**Q15 · `M8` · milieu + A** · **seeds a prompt**
> **It's their birthday. Your move:**
> something that makes them laugh out loud · something I made · the thing they mentioned once, months ago · a day out, not an object · I'm not a gift person — I'll be there, though

### Block 4 — How you talk · *"How you come across."*

**Q16 · `M5` · register (1st indicator)**
> **The tell that you like someone:**
> the teasing starts → *playful* · the jokes get weirdly specific → *playful* · I say it out loud, probably too early → *earnest* · I start showing up for things → *earnest*

**Q17 · `CS1` · second register indicator** — *replaced. The old item was a tiebreak with no trigger (Q16 is required and all four of its options map cleanly), and it assumed everyone wants a depth-seeking conversation. Register sets the voice of every pitch a reader ever receives, so it gets two independent reads in different contexts.*
> **Your friend just did something genuinely impressive. What you actually say:**
> something that sounds like an insult → *playful* · "okay, that's actually incredible" → *playful* · I tell them properly, out loud → *earnest* · I tell everyone except them → *earnest*

**Q18 · `CS2` · logged**
> **Dinner with someone you just met goes well. Afterwards:**
> they know more about me · I know more about them · we found one thing we both care about and never left it · we argued about something for an hour · about even, honestly

### Block 5 — One thing

**Q19 · `M9` · free response · `[skip]` · text ≤120 chars OR audio ≤30 s** · **seeds the prompt verbatim**
> **What do you nerd out on?**
> text placeholder: *specific beats impressive* · audio affordance: *or say it — 30 seconds*

Audio: upload → existing `/api/transcribe` (gpt-4o-mini-transcribe, whisper-1 fallback) → store `m9_text` (transcript) **and** `m9_audio_url`. Transcription runs in the background while the user completes Q20–Q23 (~30 s of one-tap items — this is why Q19 is not last). No transcript by the voice step → generic prompt fallback. **Audio is public-facing UGC → takes the T24 OpenAI-moderation path.** The clip also flows into extraction as ordinary story material.

### Block 6 — Facts · *"A few plain ones, then you're done."*

**Q20 · `H1` · milieu (eduAdjacency)**
> **Education:**
> high school · some college · bachelor's · grad school or beyond

**Q21 · `H3` · milieu (H3 term)** · **seeds a prompt**
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

| id | construct | what it steers | seeds a voice prompt? |
|---|---|---|---|
| Q1 | milieu tribe | milieu match term | **yes** — and "a completely different person" fishes the reinvention story, the strongest prompt in the set |
| Q2 | milieu + E | milieu · E prior | no |
| Q3 | milieu + E | milieu · E prior | **yes** |
| Q4 | O | H1 angle prior (`self_expansion`) | no — deliberately |
| Q5 | O | H1 angle prior | **yes** |
| Q6 | O + milieu | H1 angle prior · milieu | **yes** |
| Q7 | E | H2 angle prior (`i_sharing` vs `comfort`) | no — deliberately |
| Q8 | E | H2 angle prior | no — deliberately |
| Q9 | C | milieu pace | **yes** — "but I have a story" is an explicit invitation |
| Q10 | A | `comfort` angle prior | **yes** — fishes the time they had to say a hard thing to someone they love |
| Q11 | N | exploratory `comfort` prior | no — deliberately |
| Q12 | N | exploratory (anticipatory anxiety) | no — deliberately |
| Q13 | milieu + C | milieu | **yes** |
| Q14 | milieu | milieu | **yes** — this is the item's entire justification |
| Q15 | milieu + A | milieu | **yes** |
| Q16 | register | §6.4 register (playful/earnest) | no |
| Q17 | register (2nd indicator) | §6.4 | no |
| Q18 | conversation role | logged; later pairing analysis | no |
| Q19 | free response | — | **yes — verbatim** |
| Q20 | education | milieu eduAdjacency | no |
| Q21 | forward orientation | milieu H3 term | **yes** |
| Q22 | politics | milieu politics gap · filter input | no |
| Q23 | politics importance | hard filter (tier 3 only) | no |

**11 of 23 seed a voice prompt.** The nine trait items that don't (Q4, Q7, Q8, Q11, Q12, Q16–Q18) are silent on purpose: fishing a story off "your phone rings" would tell the user that item was load-bearing, which is the mechanics-leak trap (trap 6). Latent measures work best when the person doesn't know they were measured. Q12 was rewritten in rc5 to cover anticipatory anxiety rather than rumination; the old version repeated Q11's facet four screens later.

Q18 steers nothing at launch and remains the standing cut candidate (Charles: keep for now).

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
7. **Register is derived from two items now (Q16 + Q17), not one plus a dead tiebreak.** Brief §6.4 says "set once per reader from M5, tiebreak CS1" — update it: both items score playful/earnest, majority wins, tie → `earnest` **(SV)**, both missing → `earnest`. Test-plan **U19** must be rewritten against this.
8. **Item design rules now binding on any future revision** (from `tasks/lessons.md`, 2026-08-23): every stem carries at least two concrete particulars — time, place, object, number, or a specific second person; if "in general" can be prefixed to it, it is not an item. Options are behaviours, not attitudes. Every option set has a named cost — four flavours of the same virtue is not an item.
9. **D-QD4 must handle Q14 option 6** ("never once thought about it") with a non-object prompt — never "tell us about your place."
