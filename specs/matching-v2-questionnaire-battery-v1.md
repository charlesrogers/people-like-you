# D-QD1 — Reader Instrument, Battery v1.0-rc1

**Supersedes** `matching_algo-v2.md` §4.1–§4.3 (items and copy). Structure, storage and envelope from the brief still bind.
**Voice:** dry stems + warm-sincere framing copy (Charles, 2026-08-22 — Q1 answer **b**).
**Research basis:** `specs/matching-v2-questionnaire-research.md`. **Three-voice draft it was chosen from:** `specs/matching-v2-questionnaire-batteries.md`.
**Status:** release candidate. Not frozen — freezes as **v1.0** after Charles's inline approval and the D-QD6 pilot revision pass.

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

## 2. The battery

Options listed **low→high on the scored trait**. Presentation order polarity-randomised on trait items.

### Block 1 — Identity

**Q1 · `M1` · milieu · `[skip]`**
> **At seventeen you were, on the record…**
> theatre kid · jock · honor-roll grinder · the one organizing the hang · happily unaffiliated · a completely different person

**Q2 · `M2` · milieu + E**
> **Group chat, your role**
> mostly reads, occasionally devastates · asks the real question · voice-note monologuist · sends the memes · makes the plans

**Q3 · `M3` · milieu + E**
> **Wedding, 10pm**
> home already, no regrets · the good conversation at the side table · running the sparkler exit · dance floor since song one

### Block 2 — Wired

**Q4 · `T-O1` · O**
> **Plan changes an hour out.**
> that's my whole evening, then · fine. I liked the old one. · adapt, move on · secretly delighted

**Q5 · `T-O2` · O** *(frequency-anchored)*
> **Last brand-new thing you tried:**
> I'd have to think about it · sometime this year · this month · this week

**Q6 · `T-O3` · O**
> **Handed something you'd never have picked yourself:**
> thank you, and that's where it ends · I'll get to it · I'll try it this week · three hours in before I look up

**Q7 · `T-E1` · E**
> **Three days of people. Day four:**
> door closed, phone off · one quiet evening resets me · I'm fine · I want more

**Q8 · `T-E2` · E**
> **Party. You know one person.**
> find them, stay put · orbit, meet two or three · make one real new friend · end up talking to the whole room

**Q9 · `T-C1` · C**
> **The calendar:**
> lives in my head · exists in theory · real, and we negotiate · real, and I obey it

**Q10 · `T-A1` · A**
> **Someone you love is having a bad day. First instinct:**
> fix it · give them room, come back later · make them laugh · sit in it with them

**Q11 · `T-N1` · N**
> **Conversation that mattered. You replay it:**
> it's done when it's done · once · that night · for days

**Q12 · `T-N2` · N**
> **Something goes sideways.**
> very little rattles me · go quiet, handle it · feel it, then move · I feel all of it

### Block 3 — Actual life

**Q13 · `M4` · milieu + C**
> **Last three Saturdays, mostly:**
> trailhead by 8am · slow brunch, long read · a project with my hands · someone's kitchen, no agenda

**Q14 · `M6` · milieu + C**
> **Travel:**
> the itinerary is the fun · booking the flight is the whole plan · I go where I'm invited · I don't, much

**Q15 · `M8` · milieu + A**
> **A gift from you looks like:**
> something hilarious · something handmade · the thing they mentioned once · an experience, not a thing

### Block 4 — How you talk

**Q16 · `M5` · register**
> **How affection comes out of you:**
> teasing → *playful* · deadpan; they catch it or they don't → *playful* · I say it straight → *earnest* · depends on the person → *CS1 tiebreak*

**Q17 · `CS1` · register tiebreak**
> **First conversation you'd want:**
> banter that finds depth → *playful* · depth that finds jokes → *earnest*

**Q18 · `CS2` · logged**
> **In conversation, more:**
> the storyteller · the question-asker · genuinely depends who I'm with

### Block 5 — One thing

**Q19 · `M9` · free response · `[skip]` · text ≤120 chars OR audio ≤30 s**
> **What do you nerd out on?**
> text placeholder: *specific beats impressive* · audio affordance: *or say it — 30 seconds*

Audio handling: upload → existing `/api/transcribe` (gpt-4o-mini-transcribe, whisper-1 fallback) → store `m9_text` (transcript) **and** `m9_audio_url`. Transcription runs in the background while the user completes Q20–Q23 (~30 s of one-tap items — this is why Q19 is not last). If no transcript by the voice step, fall back to a generic prompt. **Audio is public-facing UGC → must pass the T24 OpenAI-moderation path like other onboarding voice memos.** The clip also flows into extraction as ordinary pitch material.

### Block 6 — Facts

**Q20 · `H1` · milieu (eduAdjacency)**
> **Education:**
> high school · some college · bachelor's · grad school or beyond

**Q21 · `H3` · milieu (H3 term)**
> **Right now you're building:**
> a career I care about · a family · genuinely both · something I couldn't name yet

**Q22 · `H2` · milieu (politics gap) · `[skip]`**
> **Politically, roughly:**
> progressive · lean progressive · somewhere in the middle · lean conservative · conservative · *rather not say*

**Q23 · `H2b` · importance · hard filter on top tier only**
> **How much does this matter in someone you'd date?**
> not really something I think about · I'd rather be close on it · honestly, I'd struggle with someone far from me
> <sub>Only the last one narrows who you'll see.</sub>

> Tier 3 → bidirectional hard filter at >2 steps (same pattern as the smoking dealbreaker). Tier 2 → **logged only at launch**; politics already feeds `milieuSimilarity` softly for everyone, and personalising that weight per reader breaks the function's symmetry — that is a scoring change and gets its own commit and its own approval. Tier 1 → no effect beyond the existing soft term.
> The sub-line is the battery's **only** deliberate mechanics disclosure (trap 6). It stays because the top tier materially shrinks the user's pool and they cannot consent to that uninformed.

---

## 3. Per-item rationale (charter N3 — every item earns its place twice)

| id | construct | feeds | pitch-use example sentence | trap notes |
|---|---|---|---|---|
| Q1 | milieu tribe | milieu match · voice prompt | "She was a theatre kid and has never entirely stopped." | 5: "completely different person" is a real answer + skippable |
| Q2 | milieu + E | milieu · E · humour material | "In the group chat he mostly reads, then lands one line." | 2: every role is likeable |
| Q3 | milieu + E | milieu · E · voice prompt | "She runs the sparkler exit. Every time." | 1: situational, not "I'm outgoing" |
| Q4 | O | H1 targeting | "A plan falling through makes his evening more interesting, not less." | 1, 3 |
| Q5 | O | H1 targeting | "She tried something she'd never done this week. Ask which." | 1: frequency anchor |
| Q6 | O | H1 targeting | "Hand him a record he'd never pick and he's three hours in." | 1 |
| Q7 | E | H2 targeting | "Three days of people and she wants a fourth." | 1, 2: introvert options equally warm |
| Q8 | E | H2 targeting | "He walks into a room knowing one person and leaves with one new friend." | 1 |
| Q9 | C | milieu pace | "The calendar is real and she obeys it." | 2, 9: joke is on the calendar |
| Q10 | A | `comfort` angle · premium material | "When someone he loves is having a bad day he sits in it with them." | 2: strongest example of matched desirability |
| Q11 | N | exploratory `comfort` hypothesis | "She replays the good conversations for days." | 2: rumination framed as attentiveness |
| Q12 | N | exploratory | "Very little rattles him." | 2 |
| Q13 | milieu + C | milieu · voice prompt | "Her last three Saturdays: trailhead by 8." | 1: explicit behavioural anchor |
| Q14 | milieu + C | milieu · voice prompt | "For him the itinerary is the fun part." | 1 |
| Q15 | milieu + A | milieu · voice prompt · premium material | "The best gift she gives is the thing you mentioned once." | 2 |
| Q16 | register | §6.4 register derivation | "Teasing is how she shows she likes you." | 6: never says it sets the pitch's voice |
| Q17 | register tiebreak | §6.4 | *(rarely surfaced)* | — |
| Q18 | conversation role | logged, later pairing analysis | "He's the question-asker." | 3: no data use at launch — justified on data grounds under N3 |
| Q19 | free response | voice prompt seed · premium material | "She nerds out on {…}." | 6: placeholder never says why |
| Q20 | education | milieu eduAdjacency | "She's finishing her PhD." | — |
| Q21 | ambition/pace | milieu H3 term | "Right now he's building both, and means it." | 2: "something I couldn't name yet" is humane, not a failure option |
| Q22 | politics | milieu politics gap · filter input | *not used in pitches* | 8, 9: neutral self-labels, explicit skip |
| Q23 | politics importance | hard filter (tier 3) | *not used in pitches* | 6: documented disclosure exception |

**N3 audit:** 20 of 23 items are directly quotable in a pitch. The three that are not — Q17, Q22, Q23 — justify themselves on data grounds (register tiebreak; the milieu politics term; informed hard-filter consent). Q18 is quotable but has no launch consumer; it is the first item to cut if the pilot says the battery runs long.

---

## 4. Framing copy (warm-sincere)

| surface | copy |
|---|---|
| intro | "A few questions so we know how to introduce you. Nothing here is graded, and none of it is shown to anyone as a score." |
| honesty line | "Answer as the person who'll actually be sitting across the table." |
| block cards | "Let's start with who you've been." / "Now, how you're built." / "What your weeks actually look like." / "How you come across." / "A few plain ones, then you're done." |
| skip affordance | "skip this one" |
| close | "That's it. Next we'll ask you about a couple of things you just told us, and you get to answer out loud." |

The close is load-bearing: D7 forbids showing the reader their own pitch, which removes the ordinary quiz payoff. The payoff is moved to the voice step visibly quoting them (research R10).

---

## 5. Downstream consequences to carry into other docs

1. `matching_algo-v2.md` §4.1–§4.3 replaced by this file; §4.4 voice-prompt map is superseded by D-QD4.
2. Test plan **U17** (Big Five reversal fixtures) is void — rewrite against item-specific scoring and option-polarity un-flipping.
3. Acceptance criterion **N5 → N5′** (research brief §4).
4. Milieu function §9 input keys change from `M1–M8` to the ids in this file; the `H3` and education terms are unchanged in meaning.
5. **V2-T2 scope grows**: Q19 audio capture, upload, transcription hand-off, moderation, and an audio storage column.
6. Politics importance is 3-way (`H2b ∈ {none, prefer, strong}`), not boolean — schema and `applyHardFilters` both change; **U16** must test all three tiers, and that tier 2 never filters.
