# D-QD1 — Reader Instrument, Battery v1.0-rc11

**Supersedes** `matching_algo-v2.md` §4.1–§4.3 (items and copy). Structure, storage and envelope from the brief still bind.
**Voice:** dry stems + warm-sincere framing copy (Charles, 2026-08-22 — Q1 answer **b**).
**Research basis:** `specs/matching-v2-questionnaire-research.md`. **Three-voice draft it was chosen from:** `specs/matching-v2-questionnaire-batteries.md`.
**Status:** release candidate 11. Not frozen — freezes as **v1.0** after Charles's inline approval and the D-QD6 pilot revision pass.

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

## 0b. rc9 changes (Charles, 2026-08-24)

1. **Q22 stem now names politics.** "How much does this matter…" had no antecedent once the
   block-card interstitials were removed and Q21/Q22 became separate screens — "this" pointed at
   nothing. Now: *"How much does politics matter in someone you'd date?"*
2. **Emoji reset.** rc8 shipped 89 emoji but only 83 distinct: 🤷 appeared on four separate
   screens, 💬 on three, 😂 on two. Charles: *"the emojis are not evocative and all look the
   same."* Every emoji is now unique across the battery, and each depicts the specific behaviour
   rather than its category (🐇 for the Wikipedia rabbit hole, ⭐ for "I answer for maybe four
   people", 🎇 for the sparklers, 🛌 for the empty calendar).
3. **The close screen is gone.** It flashed for 1.2s and vanished, which Charles rejected outright.
   Its line is now a header on the voice step, with the prompts below it.

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

**Construct budget** — *rc7: double-scoring of milieu items onto traits is REMOVED. See the note below; this was a spec error.*

| trait | items | indicators | status |
|---|---|---|---|
| O | Q4, Q5, Q6 | 3 | measured |
| E | Q7, Q8 | 2 | measured |
| C | Q9 | 1 | **exploratory — must not be used for anything** |
| A | Q10 | 1 | **exploratory — must not be used for anything** |
| N | Q11, Q12 | 2 | exploratory (no launch consumer) |

> **Why double-scoring was removed (2026-08-23).** The rc1–rc6 budget claimed Q2/Q3/Q13/Q14/Q15 double-scored onto E/C/A. That is incoherent with the way those items are written. Their options are **nominal, not ordinal** — "the art / a chair I overpaid for / an instrument" has no conscientiousness ordering, and any per-option trait value is invented rather than derived.
>
> Worse, it contradicts the battery's own trap-2 rule. Those items were deliberately built so that **no option lands worse than its siblings** ("I'm not a gift person — I'll be there, though" is designed to read as warm, not deficient). You cannot simultaneously design an option set to be equally flattering and score it ordinally on a desirable trait: if no answer is worse, no answer scores lower. The two requirements are mutually exclusive, and the equal-desirability requirement is the one that matters — it is what makes the quiz feel like self-expression instead of assessment.
>
> Milieu is unaffected: `milieuSimilarity` uses **exact option match**, which is nominal and needs no trait values. Dropping trait double-scoring costs the milieu term nothing.
>
> **Consequence, stated honestly:** C and A ship with one indicator each. Neither has a launch consumer (H1/H2 need only O and E; the milieu function uses M-block matches, education, politics and H3; register comes from Q16/Q17). One-item scales cannot be checked for reliability, so **C and A are logged and never reported as measurements** until a future version gives them a second ordinal item. O (3) and E (2) — the two traits the pre-registered hypotheses depend on, and the two best-measured traits in every short form — are unaffected.

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

**17 items** (rc10 — five cut). **No block cards.** Every option leads with one emoji; Q16/Q17 (politics) stay plain.

Options listed **low->high on the scored trait** where ordinal; presentation order polarity-randomised on the trait items **except Q7**, whose options are a clock.

> **rc10 cuts (Charles, 2026-08-25).** Dropped rc9's Q2 (group chat), Q5 (come to this thing), Q11 (unanswered text), Q12 (feedback) and Q18 (dinner afterwards). None was a story-fisher, so story yield is unchanged. Q11/Q12 were the only N items and N has no launch consumer; Q18 steered nothing; Q2 and Q5 were rejected on quality. O drops to 2 indicators, matching E.

### Block 1 - Identity

**Q1 · `M1` · milieu · `[skip]`**
> **At seventeen, you were:**
> 🎭 theatre kid · 🏀 jock · 📚 honor-roll grinder · 🗓️ the one organizing the hang · 🎧 happily unaffiliated · 🦋 a completely different person

**Q2 · `M3` · milieu**
> **The wedding reception is winding down. Where are you?**
> 🏠 already home, shoes off · 🍰 at a side table, deep in the actual conversation · 🎇 outside, handing out sparklers · 🕺 on the dance floor since the first song

### Block 2 - Wired

**Q3 · `T-O1` · O**
> **It's 1am. You're still up because:**
> 📺 the show kept autoplaying · 🔍 I fell into someone's photos from 2019 · 🐇 I'm down a Wikipedia rabbit hole · 🔨 I'm working on a project I can't put down

**Q4 · `T-O3` · O + milieu**
> **One free day in a city you've never been to.**
> 📸 I'm not missing the must-see things · 🛏️ whatever's near where I'm staying · 🚶 I walk until something happens · 🔖 I've had places saved on Instagram for months

**Q5 · `T-E1` · E** — *rc11: the Friday version was a second free-time question sitting next to Q9's Saturdays.*
> **You're seated next to a stranger at a work dinner.**
> 🍽️ I get through it · 🙂 polite, mostly quiet · 💬 I find the one thing we both know about · 🎤 I'm holding court by dessert

**Q6 · `T-E2` · E**
> **Your phone rings. No text first.**
> 📵 I don't answer the phone. Ever. · ⭐ I answer for maybe four people · 😬 I answer, but I'm already worried · 📞 I pick up before it rings twice

**Q7 · `T-C1` · C** · **no polarity randomisation**
> **You're meeting someone at 7.**
> ⏰ I'm there at 6:50 · 🎯 I'm there at 7 · 📲 7:05, and I texted · 🎪 7:15, but I have a good excuse

**Q8 · `T-A1` · A**
> **Your closest friend is getting back together with the ex. Again.**
> 🗣️ I say exactly what I think · 🤐 I say it once, then I'm supportive · 🎣 I ask questions until they hear themselves · 🤝 I keep my mouth shut and stay close

### Block 3 - Actual life

**Q9 · `M4` · milieu**
> **Your last three Saturdays, honestly:**
> 🌄 outside before most people were up · 🛌 deliberately doing nothing, and it was glorious · 🔧 elbow-deep in something I was making or fixing · 🎉 out with people until late · 💻 working, and not entirely mad about it

**Q10 · `M7` · milieu · story fisher**
> **The thing in your place a guest always asks about:**
> 🖼️ the art · 🪑 a chair I overpaid for but I love · 🚲 the gear — bike, skis, clubs · 🎸 an instrument · 🛠️ something I made · 😶 nothing — I just haven't got round to it

**Q11 · `M8` · milieu**
> **It's their birthday. Your gift:**
> 😂 something that makes them laugh out loud · 🎨 something I made · 🎁 the thing they mentioned once, months ago · 🎟️ a day out, not an object · 🫂 I'm not a gift person — I'll be there, though

### Block 4 - How you talk

**Q12 · `M5` · register (1st indicator)**
> **The tell that you like someone:**
> 😏 the teasing starts · 🃏 the jokes get weirdly specific · 📱 memes. lots of memes. · 💌 I say it out loud, probably too early · 🚗 I start showing up for things

**Q13 · `CS1` · register (2nd indicator)**
> **Your friend just did something genuinely impressive. What you actually say:**
> 🥊 something that sounds like an insult · 🤯 "okay, that's actually incredible" · 🫶 I tell them properly, out loud · 📣 I tell everyone except them

### Block 5 - Facts

**Q14 · `H1` · milieu (eduAdjacency)**
> **Education:**
> 🏫 high school · 📗 some college · 🎓 bachelor's · 🔬 grad school or beyond

**Q15 · `H3` · milieu (H3 term)**
> **The next five years, honestly:**
> 📈 my work gets serious · 🏡 my life gets full — people, a house, all of it · 🎢 both, and I know how that sounds · 🌊 I've stopped making five-year plans

**Q16 · `H2` · milieu (politics gap) · `[skip]` · no emoji**
> **Politically, roughly:**
> progressive · lean progressive · somewhere in the middle · lean conservative · conservative · rather not say

**Q17 · `H2b` · importance · hard filter on top tier only · no emoji**
> **How much does politics matter in someone you'd date?**
> not really something I think about · I'd rather be close on it · honestly, I'd struggle with someone far from me
> <sub>Only the last one narrows who you'll see.</sub>

## 2b. Moved out of the quiz: the nerd-out

**Was Q19. It is now the first prompt of the voice step**, recorded, with a text fallback for anyone who won't talk yet.

> **What do you nerd out on?**
> help: *The small stuff is the good stuff — the more specific, the better.*

Consequences: the quiz drops to 22 items and ends on four one-tap facts; D-QD4's `q19Prompt()` verbatim template **disappears entirely** (the answer is now itself a story, not a string to quote back), and the lead-in-stripping fix becomes unnecessary. The "seen" payoff now rests on the other fished prompts — the reinvention prompt and "Okay. Tell me the story." — which is where it was always strongest.

## 2c. Framing copy (block cards removed)

| surface | copy |
|---|---|
| intro | "For us to set you up with people, we want to see what really makes you tick." |
| reassurance | "Nothing here is graded, and none of it is shown to anyone as a score." |
| skip affordance | "skip this one" |
| close | "Next we'll ask you about a couple of things you just told us, and you get to answer out loud." |

---

## 3. Per-item rationale — **what it steers** (revised N3)

| id | construct | what it steers | seeds a voice prompt? |
|---|---|---|---|
| Q1 | milieu tribe | milieu match term | **yes** — "a completely different person" fishes the reinvention story |
| Q2 | milieu | milieu | no |
| Q3 | milieu | milieu | **yes** |
| Q4 | O | H1 angle prior | no — deliberately |
| Q5 | O | H1 angle prior | no — deliberately |
| Q6 | O + milieu | H1 angle prior · milieu | **yes** |
| Q7 | E | H2 angle prior | no — deliberately |
| Q8 | E | H2 angle prior | no — deliberately |
| Q9 | C *(sole indicator)* | logged only | **yes** — "but I have a story" is an explicit invitation |
| Q10 | A *(sole indicator)* | logged only | **yes** |
| Q11 | N | exploratory | no |
| Q12 | N | exploratory | no |
| Q13 | milieu | milieu | **yes** |
| Q14 | milieu | milieu | **yes** — the item's entire justification |
| Q15 | milieu | milieu | **yes** |
| Q16 | register | §6.4 register | no |
| Q17 | register | §6.4 register | no |
| Q18 | conversation role | logged | no |
| Q19 | education | milieu eduAdjacency | no |
| Q20 | forward orientation | milieu H3 term | no |
| Q21 | politics | milieu politics gap · filter input | no |
| Q22 | politics importance | hard filter (tier 3 only) | no |

**7 of 22 seed a voice prompt**, plus the nerd-out, which is now a voice prompt in its own right. The trait items stay silent on purpose: fishing a story off "your phone rings" tells the user that item was load-bearing, which is the mechanics-leak trap.

---

## 4. Downstream consequences

1. `matching_algo-v2.md` §4.1–§4.3 replaced by this file; §4.4 superseded by D-QD4.
2. Test plan **U17** void — rewrite against item-specific scoring and polarity un-flipping. Q9 exempt from polarity randomisation; assert it.
3. **N5 → N5′** (research brief §4). **N3 revised** per §1b.
4. Register derives from **two** items (Q16 + Q17), majority, tie → `earnest` **(SV)**. `matching_algo-v2.md` §6.4 and test-plan **U19** both need rewriting.
5. **No trait double-scoring.** Traits come only from Q4–Q12. C (Q9) and A (Q10) are single-indicator, logged, and never reported as measurements. `milieuSimilarity` is unaffected — it matches options exactly.
6. Politics importance is 3-way (`H2b ∈ {none, prefer, strong}`); **U16** covers all three and asserts `prefer` never filters.
7. **Item-design rules, binding on any revision** (`tasks/lessons.md`, 2026-08-23): every stem carries at least two concrete particulars and every noun needed to picture the scene; the options must grammatically answer the question the stem asks; options are behaviours, not attitudes; every option set has a named cost; option sets about connection, gifts or affection must span topic-based as well as disclosure-based styles.
8. **Visual and interaction design is specified separately in D-QD5 and is not optional.** A build that ships the copy without it fails the "fun" criterion — that already happened once.
