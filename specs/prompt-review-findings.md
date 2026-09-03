# Prompt Review Findings — adversarial review of all 102 voice prompts

## 76 of 102 survive as written. 20 need a reword. 6 die.

**Commissioned by:** `specs/research-brief-prompt-review.md` (Charles, 2026-08-24)
**Date:** 2026-08-24
**Method:** every one of the 102 prompts got **three simulated modal answers** — 30–45 seconds of real speech, three different plausible pool members, written as people actually talk rather than as they ideally would — then a retrievability grade, a protagonist test per answer, and an attempt to write **one pitch sentence** about the answerer under the nine tone rules (`matching_algo-v2.md` §6.5). A prompt that could not yield a pitch sentence failed regardless of how good the story was. 306 simulated answers in total; all of them are in Appendix A so every verdict is auditable rather than asserted.

**And a second headline the brief asked for separately: 34 of the 47 live `exampleAnswer` strings fail — 72%.** The examples are in worse shape than the prompts they sit under, and they fail *by teaching the failure*. That is the single cheapest fix in this document.

---

## 1. What the two new criteria actually caught

The review was commissioned because the previous session's six rules all optimised narrative *quality* and none checked narrative **ownership** or **retrievability**. Both new criteria earned their place, and each turned out to have a clean structural signature rather than being a case-by-case judgment.

### 1.1 The protagonist test has three failure families, and one repair

A prompt fails the protagonist test when the grammatical object of its ask is *someone else's action* or *a state received by the answerer*. Every failure in this review is one of three shapes:

| family | what it asks for | who owns the verbs | examples that died |
|---|---|---|---|
| **Reception** | an internal state that happened *to* the answerer | whoever caused it | `gives_you_chills`, `laugh_hardest`, `movie_scene`, `hard_day` |
| **Admiration-of-others** | a third party's achievement or wisdom | the third party | `proud_of_someone`, `mentor_moment`, `q9.2` (who taught you) |
| **Verdict** | a rating, with no act attached | the thing being rated | `ick_or_green_flag`, `q6.1` (must-see worth it) |

**The repair is the same move every time: add the answerer's action clause.** "What did you do about it." "What do you actually do because of it." "Tell me about your most recent victim." "Who did you make watch it." Six of the 20 fixes in this document are literally this one edit, and it converts a verdict or a reception into an act without touching the construct. Where the construct is *nothing but* reception — chills, laughter, being taken care of — no clause saves it and the prompt dies.

The diagnostic to apply to any future prompt: **strip the third party out of the modal answer. If nothing is left, the prompt is broken.** `laugh_hardest` leaves nothing (the roommate, the fence, the pool). `weird_habit` leaves everything (the answerer narrating their own cooking; the sister is a witness *of* them). That inversion — a third party witnessing the answerer, rather than the answerer witnessing a third party — is what separates the two, and it is why `close_people` ("what's your oldest friend always giving you a hard time about") is the best-constructed comfort prompt in the bank: it forces third-party material *about the answerer's own trait*.

### 1.2 Retrievability splits cleanly: superlatives always fail, "the last" sometimes doesn't

**Superlatives are never legal.** "Best ever", "biggest laugh", "the most" demand a ranking search over a category nobody maintains a ranking for, and the simulations show exactly what happens: the answerer stalls audibly ("Best ever… I mean, I can't rank them"), then satisfices on whatever is available — which is usually the *weakest* qualifying episode, because the good ones didn't surface under time pressure. Eight prompts failed on this alone (`best_purchase`, `q6.4`, `q13.2`, `q14.3`, `q15.1`, `q15.3`, and partly `q3.1`, `q6.2`).

**"The last time" is legal in three specific conditions** — this is narrower than "prefer 'a time'" but more useful, because it explains why `rabbit_hole` is fine and `laugh_hardest` is not:

1. **Live/current** — the thing is an ongoing state the person is already indexing. A rabbit hole, an album on repeat, a current obsession, a project on the bench.
2. **High-frequency for the tapped person** — a pet peeve getting you, a guilty pleasure indulged, closing down a party *for someone who tapped "on the dance floor since the first song"*. Conditioning on the tap is what makes this legal for fished prompts and illegal for the same words in the bank.
3. **Landmark-marked** — first job, a thing you ended up running that you never signed up for. Marked event classes are indexed on their own.

It is illegal for a **rare internal state** (chills, laughing until you can't breathe) and for an **unmarked blurred category** (parties left early, by someone who leaves every party early; empty Saturdays, which blur by design — "they're all the best one, that's why I protect them").

### 1.3 The finding nobody predicted: the damage is concentrated in the two *kinship* angles

The brief predicted `i_sharing` would take the worst of it. Directionally right — but the sharper pattern is that **five of the six kills are kinship-angle prompts** (`i_sharing` ×2, `comfort` ×3), and only one is an elevation angle.

| angle | prompts | pass | fix | kill | pass rate |
|---|---|---|---|---|---|
| `self_expansion` (elevation × growth) | 22 | 16 | 6 | 0 | **73%** |
| `i_sharing` (kinship × growth) | 19 | 13 | 4 | 2 | **68%** |
| `admiration` (elevation × warmth) | 29 | 23 | 5 | 1 | **79%** |
| `comfort` (kinship × warmth) | 19 | 13 | 3 | 3 | **68%** |
| `fun` | 13 | 11 | 2 | 0 | **85%** |

This is not a coincidence and it is worth stating as a design rule. The elevation angles (`self_expansion`, `admiration`) are about **what the person did**, so the answerer holds the verbs by construction. The kinship angles are about **closeness**, and a prompt about closeness naturally puts a second person in the frame — at which point the second person can walk off with the story. `hard_day` ("a bad day someone got right") and `q9.2` ("who taught you to be on time") are the pure cases: warm, well-intentioned, and structurally about somebody else.

> **Rule for kinship-angle prompts: ask what the answerer *does* in the relationship, never what the relationship *gives* them.** `q10.2` ("said your piece once and then showed up anyway") is the model — it pitches cleanly because the disagreement *and* the couch up three flights both belong to the answerer.

---

## 2. i_sharing: it did not collapse, and the reason is the useful part

The brief flagged this as the finding that mattered most — *"if that tier collapses, we have an angle with no material, which is a bigger problem than a few bad prompts."*

**It held.** Both bank kills were `i_sharing`, and it has the joint-lowest pass rate — so the prediction was correct about where the blade landed. But **13 of 19 `i_sharing` prompts survive untouched, all four fixes are one-clause rewords, and both kills have same-tier replacements that pass.** The tier ends this review at full strength: 12 bank + 7 fished, exactly as it started.

The reason it survived is a correction to the theory rather than a rescue of the prompts:

> **`i_sharing` is fed by taste *enacted*, not taste *received*.**

Sort the tier by verdict and the line is unmistakable. Everything that died asks what the person's taste **does to them** — chills, helpless laughter, a scene that lives rent-free. Everything that lived asks what the person **does with their taste**: drives to the mall for the pretzel and leaves without entering a store (`guilty_pleasure`), narrates their own cooking like a show until a sister catches them (`weird_habit`), warms up to Creed as a bit that became sincere (`song_on_repeat`), owns headphones chosen specifically against a coworker's 2pm almonds (`pet_peeve`), holds a parking job against a man for a year (`dealbreaker_funny`).

Both replacements were written to that rule and both pass: `made_them_watch` ("the thing you love that you make other people experience — tell me about your most recent victim") and `friends_still_bring_up` ("something you did that your friends still bring up — tell it the way they tell it"). The first converts reception into evangelism; the second converts an unretrievable internal peak into a rehearsed group legend that the answerer stars in.

So the angle has material. What it does not have is room for *any more* reception prompts — and `movie_scene`, the one remaining reception construct in the tier, is a FIX for exactly that reason.

---

## 3. Verdict table — all 102

Criteria numbering per brief §3: **1** protagonist · **2** retrievability · **3** pitchable *(disqualifying)* · **4** one occasion · **5** entry point · **6** thing not feeling · **7** breach available · **8** impressive/vulnerable gate · **9** 45s-sized.

### 3.1 Bank (55) — 43 pass · 8 fix · 4 kill

| id | tier | verdict | failed | angles fed |
|---|---|---|---|---|
| `rabbit_hole` | self_expansion | PASS | — | SE, IS |
| `taught_yourself` | self_expansion | PASS | — | ADM, SE |
| `show_someone_your_city` | self_expansion | PASS | (4, 7 tolerated) | SE, IS |
| `changed_your_mind` | self_expansion | PASS | — | SE, ADM |
| `obsession` | self_expansion | PASS | (4 tolerated) | SE, IS |
| `side_quest` | self_expansion | PASS | (2 mild) | SE, IS |
| `best_purchase` | self_expansion | **FIX** | 2, 8, 9 | SE, IS |
| `unpopular_take` | self_expansion | **FIX** | 2 | IS, SE |
| `bucket_list_done` | self_expansion | PASS | — | SE, ADM |
| `world_expert` | self_expansion | PASS | — | ADM, SE |
| `weekend_project` | self_expansion | PASS | (mild gate) | ADM, SE |
| `last_new_place` | self_expansion | PASS | — | SE, IS |
| `gives_you_chills` | i_sharing | **KILL** | **1, 2, 3** | none |
| `laugh_hardest` | i_sharing | **KILL** | **1, 2, 3** | none |
| `notice_first` | i_sharing | **FIX** | 3, 9 | IS |
| `guilty_pleasure` | i_sharing | PASS | — | IS, COM |
| `weird_habit` | i_sharing | PASS | — | IS, COM |
| `song_on_repeat` | i_sharing | PASS | (9 thin tail) | IS, COM |
| `movie_scene` | i_sharing | **FIX** | 1, 3 | IS |
| `pet_peeve` | i_sharing | PASS | — | IS |
| `comfort_food` | i_sharing | PASS | (4, 9 minor) | COM, ADM |
| `ick_or_green_flag` | i_sharing | **FIX** | 1 (tilt) | IS |
| `dealbreaker_funny` | i_sharing | PASS | — | IS |
| `slow_tuesday` | i_sharing | PASS | (4 light) | COM, IS |
| `bet_on_yourself` | admiration | PASS | (5 minor) | ADM, SE |
| `hardest_thing` | admiration | PASS | (8 noted) | ADM, COM |
| `helped_someone` | admiration | PASS | (5, 6 minor) | ADM, COM |
| `figured_it_out` | admiration | PASS | (4, 5 minor) | ADM, SE |
| `proud_of_someone` | admiration | **KILL** | **1, 3** | none |
| `against_the_grain` | admiration | PASS | — | ADM, SE |
| `building_right_now` | admiration | **FIX** | 4, 5 | ADM |
| `failure_lesson` | admiration | PASS | (8 mild) | ADM, IS |
| `mentor_moment` | admiration | **FIX** | 1, 3 (marginal) | ADM |
| `secret_talent` | admiration | PASS | (8 mild) | ADM, IS |
| `getting_better_at` | admiration | PASS | — | ADM, IS |
| `stood_up_for` | admiration | PASS | (2, 8 marginal) | ADM, IS |
| `recharge` | comfort | PASS | (2 mild) | COM, IS |
| `close_people` | comfort | PASS | (4 mild) | COM, IS, ADM |
| `love_language_real` | comfort | PASS | (4) | COM, ADM |
| `disagree_well` | comfort | PASS | (2 mild) | COM, ADM |
| `safe_place` | comfort | PASS | (4, 7) | COM, IS |
| `hard_day` | comfort | **KILL** | **1, 3** | none |
| `morning_person` | comfort | PASS | (4 technically) | COM, IS |
| `small_repair` | comfort | PASS | (5) | COM, ADM |
| `learned_from_someone` | comfort | PASS | (1 risk, not failed) | COM, IS |
| `conspiracy` | fun | PASS | (4, 7 — fun latitude) | IS |
| `worst_date` | fun | PASS | (8 mild; **1 risk flagged**) | IS, fun |
| `irrational_fear` | fun | PASS | — | IS, COM |
| `superpower` | fun | **FIX** | 9, (4/7 latent) | IS |
| `apocalypse_skill` | fun | PASS | — | ADM, IS, fun |
| `most_me_photo` | fun | PASS | (2 marginal) | IS, fun, COM |
| `dating_confession` | fun | PASS | (8 cleared) | IS, COM |
| `first_job` | fun | PASS | — | IS, ADM, fun |
| `overpacked` | fun | PASS | — | COM, IS |
| `bad_at_pretending` | fun | PASS | — | IS, COM |

### 3.2 Fished (47) — 33 pass · 12 fix · 2 kill

| id | option | tier | verdict | failed | angles fed |
|---|---|---|---|---|---|
| `q1.1` | theatre kid | i_sharing | PASS | — | IS, ADM |
| `q1.2` | jock | admiration | PASS | (4) | ADM, IS |
| `q1.3` | honor-roll grinder | admiration | PASS | (6 mild) | ADM, SE |
| `q1.4` | organizing the hang | admiration | PASS | — | ADM, IS |
| `q1.5` | happily unaffiliated | i_sharing | PASS | (4, 5) | IS, SE |
| `q1.6` | completely different person | admiration | PASS | (6 mild) | ADM, SE |
| `q3.1` | already home, shoes off | comfort | **FIX** | 2, 8 | COM |
| `q3.2` | side table, deep in it | i_sharing | **FIX** | 1, 5 | IS |
| `q3.3` | handing out sparklers | admiration | PASS | (2 wording) | ADM, COM |
| `q3.4` | dance floor, first song | i_sharing | PASS | (2 wording) | IS, COM |
| `q5.1` | that was this month | self_expansion | PASS | — | SE, IS |
| `q5.2` | sometime this year | self_expansion | PASS | — | SE, ADM |
| `q5.3` | a few years back | self_expansion | PASS | — | SE, IS |
| `q5.4` | I like knowing what I'm doing | admiration | PASS | (4) | ADM, IS |
| `q6.1` | not missing the must-sees | self_expansion | **FIX** | 4, 1 (partial) | SE |
| `q6.2` | whatever's near where I'm staying | comfort | PASS | (8 mild) | COM, IS |
| `q6.3` | I walk until something happens | self_expansion | PASS | — | SE, IS |
| `q6.4` | I ask someone who lives there | self_expansion | **FIX** | 2, 8 | SE |
| `q9.1` | I'm there at 6:50 | comfort | **FIX** | 4, 9 | COM, IS |
| `q9.2` | I'm there at 7 | comfort | **KILL** | **1, 3**, 6 | none |
| `q9.3` | 7:05, and I texted | fun | PASS | (4 minor) | IS, COM |
| `q9.4` | 7:15, but I have a story | fun | PASS | — | IS, SE |
| `q10.1` | I say exactly what I think | admiration | PASS | (5, 8 minor) | ADM, COM |
| `q10.2` | I say it once, then supportive | admiration | PASS | — | ADM, COM |
| `q10.3` | I ask questions until they hear | admiration | **FIX** | 2, 5 | ADM, COM |
| `q10.4` | mouth shut and stay close | comfort | PASS | (5 minor) | COM, ADM |
| `q13.1` | outside before most were up | self_expansion | **FIX** | 7, 8 (+ redundancy) | SE, IS |
| `q13.2` | nothing on the calendar | comfort | **FIX** | 2, 8 | COM, IS |
| `q13.3` | elbow-deep making or fixing | admiration | PASS | — | ADM, SE |
| `q13.4` | someone's kitchen table | comfort | PASS | (4 minor) | COM, IS |
| `q13.5` | working, not entirely mad | admiration | PASS | (4 minor) | ADM, SE |
| `q14.1` | the art | i_sharing | PASS | — | IS, COM |
| `q14.2` | a chair I overpaid for | i_sharing | PASS | — | IS, fun |
| `q14.3` | the gear | self_expansion | **FIX** | 2 | SE, ADM |
| `q14.4` | an instrument | i_sharing | PASS | (4) | IS, COM |
| `q14.5` | something I made | admiration | PASS | — | ADM, IS |
| `q14.6` | nothing, never thought about it | comfort | PASS | (4, 7) | COM, IS |
| `q15.1` | makes them laugh out loud | fun | **FIX** | 2 | fun, IS |
| `q15.2` | something I made | admiration | PASS | — | ADM, COM, fun |
| `q15.3` | the thing they mentioned once | admiration | **FIX** | 2 | ADM |
| `q15.4` | a day out, not an object | admiration | PASS | (5, 7 minor) | ADM, COM, fun |
| `q15.5` | not a gift person, I'll be there | comfort | PASS | (8 mild) | COM, ADM |
| `q19` | nerd-out template | self_expansion | PASS | — | SE, IS |
| `q21.1` | my work gets serious | admiration | PASS | — | ADM, SE |
| `q21.2` | my life gets full | comfort | **KILL** | **3**, 4, 7 | none |
| `q21.3` | both, and I know how that sounds | admiration | **FIX** | 4, 7 | ADM |
| `q21.4` | stopped making five-year plans | self_expansion | PASS | — | SE, COM |

---

## 4. The 6 kills and their replacements

Tier is held constant in every case, so `ONBOARDING_WEIGHTS` in `/Users/charlesrogers/.claude/worktrees/people-like-you/s-0824-0941/src/lib/prompts.ts` does not change, and every fished option keeps exactly one prompt.

### 4.1 `gives_you_chills` → `made_them_watch` (i_sharing)
**Died because:** chills are by construction something done *to* you. All three simulations produced a crowd, an eclipse, or a newborn niece — the material belongs to the artist, the phenomenon, or the baby. One simulated answer is literally *"I'm getting chills just saying it. I don't know what else to tell you."*
**Replacement:** **"What's the thing you love that you make other people experience? Tell me about your most recent victim."**
`helpText`: "The song, the show, the dish, the view — the one you push on people. The small stuff is the good stuff."
`exampleAnswer`: "The Twilight Zone episode where the guy breaks his glasses. I've made three people watch it just to see their face at the end. My roommate calls it an ambush."

### 4.2 `laugh_hardest` → `friends_still_bring_up` (i_sharing)
**Died because:** the calibration case. Laughter is an audience act, "the last time" of an internal peak is unindexed, and the modal close is *"you kind of had to be there."* All three simulations produced third-party material (a roommate, a dog video, a group's inside joke) — the bank's own example models it.
**Replacement:** **"What's something you did that your friends still bring up? Tell it the way they tell it."**
`helpText`: "The more embarrassing the better — this is a judgment-free zone. The small stuff is the good stuff."
`exampleAnswer`: "I once confidently ordered 'a jacket of pork' in Spanish at a taqueria. My friends have ordered jackets of things at every dinner since. It will never die."
**Why it works where the original failed:** the answerer's own mishap is the legend, friend-teasing is material *about the answerer*, and retrieval is free because the group rehearses the story for them.

### 4.3 `proud_of_someone` → `trusted_with` (admiration)
**Died because:** "what did *they* pull off" hands over every noun by construction. Two million streams belong to the brother; the marathon after two knee surgeries belongs to the friend; the degree at 55 belongs to the mother. Admiring your people demonstrates only that you have people — and §6.1 says `admiration` runs on vouches *about* the subject, not vouches *by* them.
**Replacement:** **"When's a time someone put you in charge of something that mattered to them? What did you do with it?"**
`helpText`: "The small stuff is the good stuff — the more specific, the better."
`exampleAnswer`: "My sister had me officiate her wedding. I interviewed them separately for material, like a journalist. Nine drafts. The dog joke killed."
**Why:** keeps the relational warmth the original was reaching for, with the answerer as agent; the trust received functions as an implicit vouch.

### 4.4 `hard_day` → `standing_ritual` (comfort)
**Died because:** "a bad day someone got right" makes the answerer the patient in 3 of 3 simulations — the roommate with the burrito, the dad who mowed the lawn, the girlfriend who confiscated the phone. The best sentence achievable was *"Sam comes from people who mow your lawn instead of making speeches"* — an inference about his family, not a trait of his. The material is real compatibility *data* but the pitch layer cannot cast the answerer as anything but the cared-for.
**Replacement:** **"What's the plan in your week that never moves? Tell me about the most recent one."**
`helpText`: "A standing thing — who's there, where it happens, what got said last time."
`exampleAnswer`: "Sunday pho with my brother, same booth since 2019. Last week he brought his new girlfriend. She ordered the tripe, so she can stay."
**Why:** recurring events are instantly retrievable, the answerer is a participant-agent, and it feeds `comfort`'s rhythm-of-life field directly. Distinct from `morning_person` (solo routine) — this is the *social* standing plan.

### 4.5 `q9.2` "Who taught you to be on time?" → replacement (comfort, same option)
**Died because:** the teacher owns every vivid answer — the Navy dad's single warning honk at 7:38, Mr. Kowalski locking the band-room door. The third simulation, taught by nobody, drifted straight into feeling-talk (*"being late makes me feel insane"*) with no scene and no nouns.
**Replacement:** **"How do you actually pull off exactly-on-time? Walk me through the math."**
**Re-tested:** *"Door-to-door is nineteen minutes if I make the light, twenty-two if I don't, so I leave at 6:37, and I keep one buffer minute for the elevator, because our elevator has moods."* → "Sam walks in at 7:00 on the nose because he's done the math — nineteen minutes if he makes the light, plus one buffer minute for an elevator with moods."

### 4.6 `q21.2` "What does 'full' actually look like on a Tuesday five years from now?" → replacement (comfort, same option)
**Died because:** the hypothetical trap with better set dressing. Bank v2 deleted eight prompts of exactly this construct for retrieving fantasy rather than memory, and the "Tuesday" concretizer only decorates the fantasy. One simulated answerer diagnosed it herself mid-answer: *"God, this feels like a vision board out loud."* Nothing happened, so nothing can have gone wrong, and the modal answer is indistinguishable from every other person in the pool.
**Replacement:** **"Tell me about a night your place was actually full. Who was there?"**
**Re-tested:** *"In March I hosted a make-your-own-pizza night that got out of hand — fourteen people in a one-bedroom, my coworker brought her mom? Someone's dough ended up on the ceiling and we left it there for a week as a monument."* → "In March, Nora's make-your-own-pizza night packed fourteen people and one coworker's mom into her one-bedroom — the ceiling dough stayed up for a week as a monument."
**Why:** redirects the aspiration to its best past instance — the evidence that makes them want it. The want then arrives as a by-product of the detail, which is where the tone rules can use it.

---

## 5. The 20 rewrites

Every one re-tested by the same simulate-then-pitch method; the re-test answer and its pitch sentence are in Appendix A.

### Bank (8)

| id | new text |
|---|---|
| `best_purchase` | "What's something under $50 you own that you'd replace the same day it broke? What does it actually do for you?" |
| `unpopular_take` | "What's the take you've had to defend out loud? Tell me about **a** time it came up." |
| `notice_first` | "What do you always notice that other people don't? When did it last make you say something out loud?" |
| `movie_scene` | "What's a movie or show you've made someone else watch? Walk me through the night you showed them." |
| `ick_or_green_flag` | "When's a time you decided you liked someone in about four seconds? What did they do — **and what did you do about it?**" |
| `building_right_now` | "What are you building or working toward right now? **Walk me through where it's at this week.**" |
| `mentor_moment` | "Who told you something that stuck — **and what do you actually do because of it?**" |
| `superpower` | "If you could have one mundane superpower, what would it be — **and what happened recently that made you need it?**" |

### Fished (12)

| id | new text |
|---|---|
| `q3.1` | "Tell me about **a** party you were glad you left. Where'd you go instead?" |
| `q3.2` | "What's a party conversation you couldn't drop? **What was your side of it?**" |
| `q6.1` | "What's the farthest you've gone for a must-see? How did the day go?" |
| `q6.4` | "**Where did a local once send you?** Did you actually find it?" |
| `q9.1` | "Ten minutes early, every time. What's the ritual?" |
| `q10.3` | "When did that actually work? Walk me through the conversation." |
| `q13.1` | "Which morning? Where were you, and what time did you start?" |
| `q13.2` | "Walk me through **the last one**. What actually ended up happening?" |
| `q14.3` | "The gear — tell me about **a day on it you still bring up**." |
| `q15.1` | "Tell me about **a** gift you gave that actually got the laugh." |
| `q15.3` | "Tell me about **one you actually pulled off**. What had they mentioned?" |
| `q21.3` | "Tell me about **a week you actually pulled both off**." |

Four of these (`q9.1`, `q10.3`, `q13.1`, `q13.2`) also execute guideline 9 — they cut the sentence that rebuilt context the tapped option already carries, taking `q13.1` from 17 words to 11. `q13.1` is the story-elicitation doc's own worked example of that redundancy, still unfixed until now.

---

## 6. Angle coverage after all changes — every angle still feeds

| angle | bank prompts | fished prompts | total | verdict |
|---|---|---|---|---|
| `self_expansion` | 12 | 10 | 22 | healthy |
| `i_sharing` | 12 | 7 | 19 | **held — see §2** |
| `admiration` | 12 | 17 | 29 | healthy |
| `comfort` | 9 | 10 | 19 | healthy, but see below |
| `fun` | 10 | 3 | 13 | healthy |

**Constraints verified:**
- **Bank stays 55** (4 killed, 4 replaced in-tier), so `ONBOARDING_WEIGHTS` needs no change and `PromptDef` is untouched. This remains a content change, not a schema change.
- **Fished mapping stays complete** — 47 prompts for 47 options across the 11 seeding items; both fished kills were replaced against the same option in the same tier.
- **Every angle is reachable for every user.** The extremes still hold: an all-first-option user and an all-last-option user each reach three of the four non-fun angles from fished prompts alone, with the bank backfilling the fourth.

**One correction to an existing doc:** `specs/matching-v2-voice-prompt-map.md` §5 reports fished tier coverage as self_expansion 12 / comfort 9. Counting the actual §4 tables gives **self_expansion 10 / comfort 10** (total 47, which the doc's own numbers overshoot by one). Worth fixing when that file is next touched; it does not change any conclusion here.

**The real coverage watch-item is `comfort`, not `i_sharing`.** Comfort ties for the lowest pass rate and took the most kills (3 of 6), for the structural reason in §1.3 — it is the angle most likely to ask about being cared *for*. After the replacements it is back to 19 prompts, but it now leans heavily on **enacted-care** constructs (`love_language_real`, `overpacked`, `q10.4`, `q15.5`, `standing_ritual`) rather than received-care ones. That is the correct composition; it should be defended in future additions.

---

## 7. The example answers — 34 of 47 fail

This is the worst result in the review and the cheapest to fix. Bank prompts carry an `exampleAnswer`; fished prompts carry none by design. Of the 47 live strings, **13 pass and 34 fail** — and they fail in the four patterns the tone rules exist to prevent:

| failure pattern | count | canonical instance |
|---|---|---|
| **Sentiment close** — the banned last line | 11 | `recharge`: "That's how I come back to life." · `hardest_thing`: "Changed everything." |
| **Summary, no occasion** — models the categorical answer | 12 | `getting_better_at`: "Listening. I used to just wait for my turn to talk." |
| **Third-party protagonist** | 4 | `laugh_hardest`'s roommate; `changed_your_mind`'s dad; `proud_of_someone`'s sister |
| **Answers the v1 text, not the rewritten prompt** | 7 | `dealbreaker_funny`, `dating_confession`, `apocalypse_skill` — all rewritten in bank v2, examples never updated |

The last row is a process failure worth naming: bank v2 rewrote 30 prompts and left 30 examples pointing at the old wording, so a third of the bank currently shows the reader a worked example that answers a question the screen is no longer asking.

**Two examples deserve specific mention as the exact failures they sit under:**
- `recharge` — *"No alarm, coffee on the porch, zero plans. That's how I come back to life."* Summary plus sentiment close, teaching the wrong behaviour twice over. (Flagged in the brief; confirmed.)
- `laugh_hardest` — the roommate backflip. Dies with its prompt, but it is the reason this review exists.

All 34 rewrites are in Appendix A under their prompts, plus **8 fresh examples** for the replacement prompts that never had one (`last_new_place`, `slow_tuesday`, `stood_up_for`, `small_repair`, `learned_from_someone`, `first_job`, `overpacked`, `bad_at_pretending`) and 6 for the kill replacements. Every surviving bank prompt ends this review with a passing example.

**Help-text defects found alongside:** `safe_place`'s help text ("could be an actual place **or a feeling**") actively invites the abstraction the tone rules cannot use — cut the last three words. `small_repair` needs its help text to carry concrete grounding ("A pan, a plant, a watch, a long-distance friendship") because "quietly maintaining" is a writerly category that made every simulated answerer pause.

---

## 8. Judgment calls, flagged rather than buried

The previous review's failure was confident self-assessment. These are the places this review is genuinely uncertain, so they are visible rather than smoothed over:

1. **`show_someone_your_city` is the weakest PASS in the bank.** It is a hypothetical itinerary that fails "one occasion" and "breach available", and survives purely because the modal answer is so noun-dense the pitch writes itself from taste alone. Defensible either way; if consistency matters more than yield, it becomes a FIX ("…where are you taking them? Name the order.").
2. **`worst_date` passed with a loud protagonist warning.** A real minority of answers are "he was on his phone the whole time" — vivid material about the other person. Two of three simulations centred the answerer's own move; the third survived on comic voice alone. Extraction should preserve the teller's phrasing, not the date's antics.
3. **`mentor_moment` was one judgment from a KILL.** It was kept because the application clause rescues the construct — but it is the same family as `proud_of_someone`, which died. If the pilot shows mentor-owned answers, kill it.
4. **`q10.1` ("I say exactly what I think") passes the method but carries product risk.** The modal material is interventions, addiction, and breakups — heavy for a dating profile — and roughly 1 in 3 simulated answers went noun-free out of privacy instinct. Worth watching in the pilot rather than pre-emptively rewording.
5. **`q3.3` and `q3.4` keep "the last"** where `q3.1` failed on it. The distinction is real (marked/frequent event classes for those specific taps vs an unmarked one) but a uniformity purist would apply the same one-word swap to all three. Recommended, not required.
6. **`figured_it_out` and `taught_yourself` are near-duplicate constructs** in different tiers (admiration and self_expansion). Both pass on evidence; the bank probably only needs one. Flagged for a content decision, not resolved here — resolving it would change tier counts, which this review is not authorised to do.
7. **`most_me_photo`'s retrievability is marginal** — all three simulations hedged before answering. It survives because people pre-curate identity photos. Lower-friction alternative if yield disappoints: "What's the photo of you your friends would pick as most you? Describe it."

---

## 9. What should happen next

1. **Apply the 6 replacements and 20 rewrites to `src/lib/prompts.ts` and the map** — content only; `PromptDef`, tier taxonomy, the four angles and the tone rules are untouched, per the brief.
2. **Rewrite all 34 failing example answers and add the 14 missing ones.** Highest value per minute of work in this document, and 7 of the failures are simply stale against bank v2's own rewrites.
3. **Add the two new criteria to the elicitation rules** as rules 0 and 0b — they are disqualifying where the existing six are corrective, and `specs/matching-v2-story-elicitation.md` §3 currently ships nine rules that would all pass `laugh_hardest`.
4. **Adopt the three diagnostics** from §1 as the standing test for any future prompt: strip the third party and see what's left; superlatives are never legal; "the last" needs live, high-frequency, or landmark status.
5. **`prompt_version` on `voice_memos`** still matters and is unaffected by this review — rewritten ids keep their ids, so v1-worded and v2-worded answers are otherwise indistinguishable in analysis.

---

## Appendix A — full per-prompt evidence

Everything below is the raw output of six independent review passes: three simulated modal answers per failing prompt with a named persona, the pitch attempt against each, the rewrite or replacement, and its re-test. Passing prompts carry one representative simulated answer and the pitch sentence it yields. This is the audit trail — the verdicts above are summaries of it, not assertions on top of it.

### A1 · Bank — self_expansion + i_sharing (17)

### `rabbit_hole` · bank · self_expansion · **PASS**
**Text:** "What's the last rabbit hole you went down? Start at whatever made you look it up."
**Evidence:** "I saw this video about how they moved the Abu Simbel temples in the sixties — they cut them into blocks — and I ended up like three hours deep in dam engineering. I was texting my group chat screenshots and nobody responded." → *Milo watched one video about the temples they moved for the Aswan dam and lost three hours to 1960s engineering — his group chat got the screenshots whether they wanted them or not.*
**Angles:** self_expansion, i_sharing
**Defects noted (4–9):** none. "Last" is legal here — a rabbit hole is current/recent by nature; people index their live obsession.
**Example answer:** FAIL — "I have a sourdough starter named Gerald. He's 3 months old and I talk to him." is a quirky fact, not a rabbit hole, and models ignoring the entry point ("start at whatever made you look it up"). → Rewrite: "I watched one video about how they moved a whole Egyptian temple in the sixties and lost my entire Sunday to dam engineering. My group chat got screenshots. Nobody asked."

### `taught_yourself` · bank · self_expansion · **PASS**
**Text:** "What's something you taught yourself with no one to ask? Tell me about the part where you had no idea what you were doing."
**Evidence:** "Excel, honestly? Real Excel. My first month at the job I was googling under the desk. There was a week where I broke the whole tracking sheet and had to rebuild it from an email attachment." → *Dana learned Excel by googling under her desk and once rebuilt the entire tracking sheet from an old email attachment — nobody at the office ever knew.*
**Angles:** admiration, self_expansion
**Defects noted (4–9):** none — breach is explicitly invited and the skill list is cached self-knowledge.
**Example answer:** PASS — "I changed my own brakes from a YouTube video. My hands were shaking the whole time." First-person occasion, nouns, breach.

### `show_someone_your_city` · bank · self_expansion · **PASS**
**Text:** "If someone visited your city for one day and you were in charge, where are you taking them?"
**Evidence:** "Breakfast at the taco place on 12th, the one with no sign. Then honestly just the river trail... and if it's Saturday, the flea market under the bridge. We're ending at the dive with the jukebox that still takes quarters." → *Jess's one-day tour of her city skips every landmark: no-sign breakfast tacos on 12th, the flea market under the bridge, and a dive-bar jukebox that still takes quarters.*
**Angles:** self_expansion, i_sharing
**Defects noted (4–9):** fails 4 (itinerary, not an occasion) and 7 (nothing can go wrong in a plan) — tolerated because the modal answer is so noun-dense that the pitch writes itself from taste alone; this is the rare prompt that survives without narrative. Flagged for the parent as a judgment call.
**Example answer:** PASS — "Breakfast tacos at this 6-table spot nobody knows about, then the rooftop with the sunset." Nouns and taste; keep.

### `changed_your_mind` · bank · self_expansion · **PASS**
**Text:** "What's something you used to believe and don't anymore? I want the moment it started to go."
**Evidence:** "I used to believe you had to stay at a job two years minimum or it looked bad. The moment was my boss presenting my deck as his in a meeting while I sat right there. I quit at seven months. Nobody's ever asked." → *Priya believed the two-year rule about jobs until a boss presented her deck as his own while she sat in the room — she quit at seven months and nobody has ever asked why.*
**Angles:** self_expansion, admiration
**Defects noted (4–9):** retrieval takes ~10s, not 5, but no superlative/recency search — recall returns the most available changed belief, which is what we want.
**Example answer:** FAIL — "I thought you had to have it all figured out by 25. My dad switched careers at 50 and proved me wrong." The proof is Dad's action (third-party protagonist) and there's no moment of their own. → Rewrite: "I believed the two-year rule about jobs until my boss presented my deck as his in a meeting. I quit at seven months. Nobody has ever once asked why."

### `obsession` · bank · self_expansion · **PASS**
**Text:** "What's something you're a little obsessed with that most people find boring?"
**Evidence:** "Weather models. I check three different forecast models, I have opinions about the European one versus the American one. My friends text me before trips like I'm a service." → *Nate reads three competing weather models for fun and has loyalties among them — his friends check with him before booking flights.*
**Angles:** self_expansion, i_sharing
**Defects noted (4–9):** fails 4 (categorical) — tolerated: the obsession is cached identity and modal answers volunteer behavior + nouns anyway.
**Example answer:** PASS — "Fonts. I have opinions about kerning. Bad typography on menus genuinely ruins my meal."

### `side_quest` · bank · self_expansion · **PASS**
**Text:** "What's a side quest you ended up on recently? Start where you got pulled off course."
**Evidence:** "I went to buy a dresser off Facebook Marketplace and the guy turned out to run a pigeon rescue? I stayed like an hour meeting pigeons. I did also get the dresser." → *Dev went to buy a used dresser and came home an hour late because the seller ran a pigeon rescue — he met every pigeon, and yes, he got the dresser.*
**Angles:** self_expansion, i_sharing
**Defects noted (4–9):** mild 2 — "recently" narrows retrieval for low-novelty weeks; one of three simulated answerers stalled ("my life is pretty scheduled") before finding a small one. Suggest dropping "recently" ("What's a side quest you ended up on?"); not verdict-changing.
**Example answer:** PASS — "Saw a sign for a free pottery class, walked in, made the ugliest bowl you've ever seen. Going back next week." Occasion, breach, forward close.

### `best_purchase` · bank · self_expansion · **FIX**
**Text:** "What's the best thing you've bought for under $50?"
**Criteria failed:** 2 (retrievability — superlative ranking over all purchases), 8 ("best" is a named gate), 9 (modal answer fits in one sentence)
**Simulated answers:**
A (quiet, practical, F): "My rice cooker? It was like forty bucks. I use it four times a week. That's... not exciting, sorry. It just works."
B (talkative, online, M): "Blackout curtain clips. This sounds fake but they — okay they're just clips. I sleep now. I bought them for six dollars and I've told maybe ten people. That's the whole story, I guess."
C (dry, mechanical, M): "A used bike pump off Craigslist, fifteen dollars. Now I'm the guy the whole building borrows from. There's a note system on my door. I didn't ask for this."
**Pitch attempts:** A — *Jess will defend her forty-dollar rice cooker like it's family — four dinners a week come out of it* (thin; describes an appliance more than a person). B — unwritable beyond "he bought clips": no occasion, no behavior, product review material. C — *Sam's fifteen-dollar Craigslist bike pump made him the whole building's air supply — there's a note system on his door* (works, but C is the lucky tail, not the mode).
**Rewrite:** "What's something under $50 you own that you'd replace the same day it broke? What does it actually do for you?" → **Re-test:** "My rice cooker. Same day, maybe same hour. It's made dinner every week for three years — I once fed six people out of it in my studio apartment, cooking in shifts." → *Jess has hosted six for dinner out of a forty-dollar rice cooker in a studio apartment, cooking in shifts — it hasn't missed a week in three years.*
**Example answer:** FAIL — "A $12 headlamp. Most useful thing I own. I look ridiculous wearing it." models the one-sentence answer and a superlative. → Rewrite: "My $12 headlamp. When the power went out in February I cooked dinner wearing it like a total dork. It lives in the kitchen drawer now, like a first-aid kit."

### `unpopular_take` · bank · self_expansion · **FIX**
**Text:** "What's the take you've had to defend out loud? Tell me about the last time it came up."
**Criteria failed:** 2 (mild — "the last time it came up" demands recency-verify on a recurring argument; the take itself is cached, so people satisfice, but the lessons.md rule is explicit: prefer "a time")
**Simulated answers:**
A (funny, social, F): "That the beach is bad. Sand, the logistics, all of it. Last time — I mean, every summer. This June I said it at Kayla's birthday dinner and her boyfriend acted like I insulted his mom. I held the line."
B (mild, budget-minded, M): "I think most brunch is a scam? Twenty-two dollars for eggs. It comes up basically every weekend, my friends just order around me now."
C (hesitant, TV-watcher, F): "Um... that The Office isn't that good? I don't — I said it at trivia once and the whole table went silent. I stand by it. Mostly."
**Pitch attempts:** A — *Maya maintains, out loud and at birthday dinners, that the beach is bad — she has defended this position every summer and lost every time.* B — *Ben's position that brunch is a scam is now priced in: his friends just order around him.* C — *Rosa said "The Office isn't that good" once at trivia, silenced the table, and stands by it — mostly.* All three writable; the construct is strong i_sharing/humor material.
**Rewrite:** "What's the take you've had to defend out loud? Tell me about a time it came up." → **Re-test:** answer A works verbatim; pitch unchanged.
**Example answer:** FAIL — "Pancakes at 8pm hit different. Breakfast for dinner supremacy." is a crowd-pleaser posing as an unpopular take, with no occasion and no defense. → Rewrite: "I think the beach is overrated and I say so every summer. This June at a birthday dinner I made my full case — sand, logistics, sunburn — and lost six to one. Again."

### `bucket_list_done` · bank · self_expansion · **PASS**
**Text:** "What's something you'd been saying you'd do for years and then finally did? How did the actual day go?"
**Evidence:** "Getting my motorcycle license — I'd talked about it since college. The actual day, I dropped the bike during the test. Fully dropped it. The instructor let me go again and I passed by two points." → *Alex talked about a motorcycle license for six years, dropped the bike in the middle of the test, got back on, and passed by two points.*
**Angles:** self_expansion, admiration
**Defects noted (4–9):** none — long-deferred completions are self-defining memories (cached), and "how did the actual day go" invites the breach without gating on success.
**Example answer:** FAIL — "Went skydiving. Cried on the plane. Jumped anyway. Best 60 seconds of my life." closes on a superlative-sentiment summary, modeling the exact close the tone rules ban. → Rewrite: "Went skydiving after five years of saying I would. Cried on the plane, jumped anyway. The photo they sell you at the end — my face — is the funniest thing I own."

### `world_expert` · bank · self_expansion · **PASS**
**Text:** "What do people come to you about? Tell me about the last time someone did."
**Evidence:** "Plants. My coworker Slacked me a photo of her fiddle-leaf fig on Tuesday like it was an ER intake. It was overwatered. It's always overwatered." → *Coworkers send Priya photos of their dying houseplants like ER intakes — Tuesday's fiddle-leaf fig was, as usual, overwatered.*
**Angles:** admiration, self_expansion
**Defects noted (4–9):** none — "the last time someone did" is recent by nature given the premise (people who get come-to get come-to often), and the warranting structure (others' behavior proves the mastery) is exactly what admiration needs.
**Example answer:** FAIL — "The history of pizza in America. I know way too much. Don't get me started." No one comes to anyone; "don't get me started" deflects the story the prompt asks for. → Rewrite: "Houseplants. My coworker Slacked me a photo of her fiddle-leaf fig on Tuesday like it was an ER intake. It was overwatered. It's always overwatered."

### `weekend_project` · bank · self_expansion · **PASS**
**Text:** "What's a project you've been working on in your spare time?"
**Evidence:** "I'm building a raised bed for the side yard. It was supposed to take a weekend — it's been three. The wood was warped, I had to re-cut everything." → *Jordan's one-weekend raised-bed project is on weekend three: the wood was warped, everything got re-cut, and the bed is happening anyway.*
**Angles:** admiration, self_expansion
**Defects noted (4–9):** presumes a current project exists — one of three simulated answerers hedged ("I don't really... I mean, I'm redoing my balcony?") before recovering. Skip-and-replace covers the true no-project case; not verdict-changing.
**Example answer:** PASS — "Refinishing a dresser I found on the side of the road. Solid oak under three layers of paint." Occasion, nouns, discovery image.

### `last_new_place` · bank · self_expansion · **PASS**
**Text:** "Where's the last new place you went, however small? How did you end up there?"
**Evidence:** "I drove out to that lavender farm from TikTok with my sister and honestly it was kind of a scam — like eight lavender plants. But we found a peach stand on the way back and that was the actual good part." → *Nina drove an hour to a TikTok-famous lavender farm, found eight lavender plants and a scam, and came home instead with a trunk of roadside peaches.*
**Angles:** self_expansion, i_sharing
**Defects noted (4–9):** none — "however small" rescues retrievability (novelty is well-indexed and new-places are frequent by nature for this pool), and "how did you end up there" hands the entry point.
**Example answer:** none exists (new prompt — bank prompts carry one). Provide: "A Yemeni coffee shop opened next to my gym and I kept smelling it mid-workout. Finally went in. They do a honey-cream thing. I've been back four times in two weeks."

### `gives_you_chills` · bank · i_sharing · **KILL**
**Text:** "When's the last time something gave you actual chills? Where were you?"
**Criteria failed:** 1 (protagonist — chills are by construction something done TO you; the answerer is audience), 2 (retrievability — "the last time" of a rare internal state is not indexed; recall fails or reaches back years), 3 (pitchable — the material belongs to the artist, the crowd, the phenomenon)
**Simulated answers:**
A (concert-goer, M): "Chills chills? I don't know about the *last* time... concerts do it, like when the whole crowd sings and the artist just stops? There was a Bon Iver show a few years ago where that happened and yeah. That, I guess."
B (office worker, F): "Honestly I can't think of — okay, the eclipse? Was that last year? Everyone on our street came outside, someone was crying, it got cold all at once and the birds went quiet. That was insane."
C (new aunt, F): "Um... my niece was born in March, and the first time I heard her little — okay I'm getting chills just saying it. I don't know what else to tell you, it was just... yeah."
**Pitch attempts:** A — unwritable: the protagonist is a crowd and a singer; "Ben still thinks about the night a Bon Iver crowd carried the chorus" tells a stranger only that Ben attends concerts. B — unwritable: everyone in the metro experienced the same eclipse; zero differentiation, no action. C — unwritable under the tone rules: the material is pure sentiment about a third party; any sentence must explain a feeling (rule 5) and close on it (rule 4).
**Replacement:** id `made_them_watch` · i_sharing — "What's the thing you love that you make other people experience? Tell me about your most recent victim." helpText: "The song, the show, the dish, the view — the one you push on people. The small stuff is the good stuff." → **Re-test:** "The Twilight Zone episode where the guy breaks his glasses. I've made three separate people watch it just so I can watch their face at the end. My roommate called it an ambush and she's right." → *Theo has personally sat three people down for one specific Twilight Zone episode and watches their faces at the ending — his roommate calls it an ambush.* (Answerer is the agent; taste is enacted, not felt.)
**Example answer:** (live, "When the crowd sings and the artist stops and just lets them carry it. Every time.") — models the audience failure exactly; dies with the prompt. Replacement's example: "The Twilight Zone episode where the guy breaks his glasses. I've made three people watch it just to see their face at the end. My roommate calls it an ambush."

### `laugh_hardest` · bank · i_sharing · **KILL**
**Text:** "Tell us about the last time you laughed so hard you couldn't breathe."
**Criteria failed:** 1 (protagonist — laughter is an audience act; the funny thing belongs to someone else), 2 (retrievability — "the last time" of an internal-state peak is unindexed; Charles's original objection), 3 (pitchable)
**Simulated answers:**
A (social, M): "Oh man, last time? I really can't... okay, the one I always think of is when my roommate tried to jump the fence into the pool and the fence just — went. That was years ago though."
B (texter, F): "Probably something my sister sent me? We send each other videos all day. There was one of a dog trying to catch a ball and missing that I watched maybe forty times. I'm laughing now thinking about it."
C (game-night, M): "We were playing that drawing game at Danny's and someone drew — okay, you kind of had to be there. Honestly you had to be there. It was the worst drawing I've ever seen."
**Pitch attempts:** A — unwritable: a story about a roommate (the bank's own example models this). B — unwritable: the answerer is the audience of a dog video. C — unwritable: "you had to be there" is the modal close; the material is an inside joke owned by a group. Best achievable in all three is a sentence about what the person consumes, not who they are.
**Replacement:** id `friends_still_bring_up` · i_sharing — "What's something you did that your friends still bring up? Tell it the way they tell it." helpText: "The more embarrassing the better — this is a judgment-free zone. The small stuff is the good stuff." → **Re-test:** "Three years ago I confidently ordered in Spanish at this taqueria and apparently asked for 'a jacket of pork.' My friends now order jackets of things constantly. Every group dinner. It will never die." → *Three years ago Rachel confidently ordered "a jacket of pork" at a taqueria, and her friends have been ordering jackets of things at every dinner since.* (The answerer's mishap is the legend; friend-teasing is about the answerer; retrievable because the group rehearses it for you.)
**Example answer:** (live roommate-backflip string) — the canonical protagonist failure; dies with the prompt. Replacement's example: "I once confidently ordered 'a jacket of pork' in Spanish at a taqueria. My friends have ordered jackets of things at every dinner since. It will never die."

### `notice_first` · bank · i_sharing · **FIX**
**Text:** "Think about the last new place you walked into. What did you clock first?"
**Criteria failed:** 3 (pitchable on the modal answer), 9 (modal answer is one sentence) — anchoring to one incidental place yields a single adjective; memory-of-attention is also largely confabulated, so answers go thin or generic
**Simulated answers:**
A (bar-goer, M): "Uh, new place... I went to that new bar on Fifth on Friday? What did I notice first... it was loud? I guess I noticed it was loud. And dark. That's kind of it."
B (dentist visit, F): "Hmm — the dentist's new office, ha. It had one of those water walls. That's all I got, honestly."
C (coffee, F): "The coffee shop by my new office — first thing I clocked was zero outlets. Like, zero. Which tells you everything about who they want in there. I respect it and I hate it."
**Pitch attempts:** A — unwritable: "Ben noticed the bar was loud" characterizes the bar. B — unwritable: a water wall at the dentist is about the dentist. C — *Dana walked into the new coffee shop, counted zero outlets, and immediately understood the owner's whole philosophy — she respects it and she hates it* (works, but C is the perceptive tail; the mode is A/B).
**Rewrite:** "What do you always notice that other people don't? When did it last make you say something out loud?" → **Re-test:** "Restaurant lighting. Honestly, lighting anywhere. I once asked the hostess if we could sit anywhere that wasn't under the one ceiling spotlight, and my date still brings it up." → *Maya notices restaurant lighting the way sommeliers notice wine — she once asked the hostess for any table not under the spotlight, and her date never let it go.* (The perceptual signature is cached self-knowledge; the occasion attaches an act to it.)
**Example answer:** FAIL — "The lighting. Warm lighting = I'm staying. Fluorescent = I'm leaving." is a one-line self-theory with no occasion. → Rewrite: "Restaurant lighting. I once asked the hostess to move us because our table was under the one spotlight. My date brings it up to this day."

### `guilty_pleasure` · bank · i_sharing · **PASS**
**Text:** "What's the thing you enjoy that you'd have to explain? Tell me about the last time you did it."
**Evidence:** "Mall pretzels. I will go to the mall FOR the pretzel. I went Saturday and didn't enter a single store." → *Priya drives to the mall for the pretzel and only the pretzel — Saturday she got in and out without entering a single store.*
**Angles:** i_sharing, comfort
**Defects noted (4–9):** none — the thing is cached identity and "the last time you did it" is recent by nature (guilty pleasures are habits).
**Example answer:** FAIL (marginal) — "Every season of The Bachelor. I have a group chat about it. I will not apologize." ignores the prompt's second half (no occasion) and closes on attitude. → Rewrite: "The Bachelor. Monday night I muted a work call to watch a rose ceremony live with my group chat. Zero regrets."

### `weird_habit` · bank · i_sharing · **PASS**
**Text:** "What's a habit of yours someone has actually commented on? What did they say?"
**Evidence:** "I narrate what I'm doing when I cook. Alone. Like a cooking show. My sister walked in on me saying 'and now we fold' and lost it." → *Jess cooks alone like she's hosting a show — her sister once walked in on "and now we fold" and has never let it go.*
**Angles:** i_sharing, comfort
**Defects noted (4–9):** none — the commenter is a witness OF the answerer (the correct inversion of laugh_hardest), and habits others tease you about are rehearsed, instantly retrievable material.
**Example answer:** PASS — "I eat cereal with a fork. The milk-to-cereal ratio with a spoon is wrong. People are horrified." Habit + others' reaction; keep.

### A2 · Bank — i_sharing + admiration (19)

# F2 — bank i_sharing (7) + admiration (12)

### `song_on_repeat` · bank · i_sharing · **PASS**
**Text:** "What have you had on repeat lately? Where do you usually end up listening to it?"
**Evidence:** "Okay this is embarrassing but it's the Creed song. Higher. It started as a joke with my gym buddies — we play it as a bit, and then the bit became real? I'm now genuinely warmed up by Creed. Mostly the gym, sometimes making dinner. My neighbor's definitely heard it through the wall." → *His gym anthem is Creed — it started as a bit with his buddies, and the bit has since become fully sincere.*
**Angles:** i_sharing (humor/taste), comfort (the where-clause yields rhythm-of-life scene: car, commute, kitchen).
**Defects noted (4–9):** (9) music-indifferent answerers give one thin sentence ("some lo-fi playlist, I don't know the names") — unwritable, but skip-and-replace covers it; the where-clause is what saves the prompt from being a title-only answer.
**Example answer:** FAIL — "'Vienna' by Billy Joel. 'Slow down, you crazy child' — I needed to hear that." "I needed to hear that" is a sentiment/meaning close and there's no scene; models exactly what tone rule 5 bans. → Rewrite: **"'Vienna,' Billy Joel. In the car, mostly — the bridge hits around the same exit every day and I turn it up every time."**

### `movie_scene` · bank · i_sharing · **FIX**
**Text (u):** "What's a movie or TV scene that lives rent-free in your head?"
**Criteria failed:** 1 protagonist, 3 pitchable (on modal answer). Same failure class as `laugh_hardest`: the vivid material belongs to a third party — here a screenwriter — and the answerer appears only as audience. The bank's own example ("'It's not your fault.' Fell apart watching it alone in college") casts the answerer as a weeping viewer.
**Simulated answers:**
- A (quiet analyst, 28): "The ending of Interstellar? Where he's watching all the video messages from his kids and he's just sobbing. I think about that like… more than I should. I don't even have kids. I don't know why it gets me. The music too, the organ thing. Yeah. That one."
- B (chatty producer, 31): "Okay, the hairdresser scene in Fleabag — 'hair is everything.' I quote it constantly. Anytime someone's stressed about a haircut I do the whole speech. Also the Bear chicken-shop thing but everyone says that one, so. Fleabag."
- C (earnest teacher, 33): "There's a scene in Friday Night Lights, the 'clear eyes full hearts' locker room one — I know, I know. I watched that show at a weird time and it just… I still hear Coach Taylor's voice sometimes. That's embarrassing but true."
**Pitch attempts:** A — unwritable: "the Interstellar scene gets her and she doesn't know why" says nothing that makes a stranger want to meet *her*; the scene's author did the work. B — marginal: "Ask her about haircuts and you get the full 'hair is everything' speech, performed" — leans entirely on borrowed material; her only contribution is recitation. C — unwritable: hearing Coach Taylor's voice is reception, not action.
**Rewrite:** **"What's a movie or show you've made someone else watch? Walk me through the night you showed them."** — relocates the same taste signal into an action the answerer took (evangelism), with an occasion and a breach available (they didn't get it). → **Re-test:** "I made my roommate watch Arrival. I'd hyped it for weeks, made popcorn, kept watching her face instead of the screen for the moment it clicks. She fell asleep. I was genuinely a little wounded. I've since shown it to two more people with a stricter no-phones policy." → *She doesn't recommend Arrival so much as administer it — popcorn made, phones confiscated, her eyes on your face for the exact minute it clicks.*
**Example answer:** FAIL (audience-protagonist + sentiment close). → Rewrite: **"I've made three separate people watch Arrival. Popcorn, phones away, the whole ritual. The last one fell asleep twenty minutes in. We're still friends, barely."**

### `pet_peeve` · bank · i_sharing · **PASS**
**Text:** "What's a small thing that bothers you more than it should? When did it last get you?"
**Evidence:** "Loud chewers. My coworker eats almonds at 2pm every single day and I now own headphones I chose specifically for almond frequencies. Yesterday I had them on before he even opened the drawer. I heard the drawer." → *He owns noise-cancelling headphones selected, after testing, specifically against one coworker's 2pm almonds.*
**Angles:** i_sharing (humor_signature — the answerer's disproportionate reaction IS the material; the offender is incidental).
**Defects noted (4–9):** "when did it last get you" is legitimate "last" — peeves are frequent by nature, so recency is indexed. None significant.
**Example answer:** FAIL (marginal) — "People who don't push in their chairs. I know it's unhinged. I can't help it." Voice is right but it doesn't model the occasion the rewritten text now asks for. → Rewrite: **"People who don't push in their chairs. Yesterday I pushed in three at a coffee shop that weren't mine. I know. I know."**

### `comfort_food` · bank · i_sharing · **PASS**
**Text (u):** "What's your comfort food and what memory is attached to it?"
**Evidence:** "My grandma's chicken adobo. She never wrote it down, so my version is reverse-engineered from memory and it's still not right — I call my aunt sometimes to check one thing. It's close. The smell is right, which is most of it." → *He's three years into reverse-engineering his grandmother's unwritten adobo, with an aunt on retainer for spot-checks.*
**Angles:** comfort (rhythm-of-life, kinship), occasionally admiration (the reconstruction-project answers).
**Defects noted (4–9):** (4) "what memory is attached" admits a categorical answer ("Friday nights we got pizza"); (9) thin answerers close in one sentence. The strong modal answers survive because the answerer's own present-day ritual (making it, modifying it) shows up unprompted. A future reword could ask for the ritual directly ("when did you last make it?").
**Example answer:** FAIL — "Grandma's chicken soup. One bite and I'm 8 years old at her kitchen table." First-person and vivid, but it models a one-sentence summary with a sentimental-transport close and no action. → Rewrite: **"My grandma's chicken soup. Mine's still not right — I've started adding lemon, which she'd consider a scandal. I make it every January anyway."**

### `ick_or_green_flag` · bank · i_sharing · **FIX**
**Text:** "When's a time you decided you liked someone in about four seconds? What did they do?"
**Criteria failed:** 1 protagonist (tilt, not total) — "what did THEY do" hands the vivid action to the third party; the answerer contributes only the verdict.
**Simulated answers:**
- A (soft-spoken nurse, 27): "My friend Priya — first day of a job I hated, she came over to my desk and said 'I'm going to lunch and I don't want to talk about work.' That was it, honestly. Six years now."
- B (loud consultant, 30): "A guy at a house party was losing at Catan, like getting destroyed, and he was SO happy about it. Just delighted to be ruined. I remember thinking, I need that energy near me."
- C (dry engineer, 34): "Hmm. My barber? He asked what I wanted and then said 'no.' Confident wrong-footing. I've been going four years."
**Pitch attempts:** A — writable but the sentence is mostly Priya: "The fastest she ever decided on a friend was over the sentence 'I don't want to talk about work.'" B — writable via her selection: "Her friendship-selection algorithm is one data point: the guy delighted to be losing at Catan." C — writable: "His barber said 'no' to his first request and earned four years of loyalty on the spot." All three lean on the third party's charisma; the answerer's taste is shown but the answerer never *does* anything.
**Rewrite:** **"When's a time you decided you liked someone in about four seconds? What did they do — and what did you do about it?"** → **Re-test:** "The Catan guy — I walked over after the game and told him 'you lost incredibly,' and we got tacos that week. That's still how we describe meeting." → *She watched a stranger be delighted to lose at Catan, walked over, and informed him he'd 'lost incredibly' — the tacos that followed turned into a friendship.* The added clause converts verdict into action; answerer becomes agent.
**Example answer:** FAIL — "When someone is nice to the waiter without making a show of it. Tells me everything." Categorical, no occasion, and "tells me everything" is meaning-explaining. → Rewrite: **"A guy at trivia handed the other team the tiebreaker because they'd 'worked harder for it.' I made him join our team the same night. Four years ago."**

### `dealbreaker_funny` · bank · i_sharing · **PASS**
**Text:** "What's a small thing you've genuinely held against someone? Be honest about how petty it was."
**Evidence:** "My ex used to say 'expresso.' I know. I KNOW. That's not why we broke up, but it's also not *not* why." → *It wasn't the 'expresso' that ended the relationship, she'll tell you — but it also wasn't not the 'expresso.'*
**Angles:** i_sharing (humor_signature — the confessed pettiness is the answerer's own, self-aware; the offender is a prop).
**Defects noted (4–9):** none significant. The "be honest about how petty" clause reliably turns the joke on the answerer, which is what keeps the protagonist right.
**Example answer:** FAIL — "If you don't like dogs, I can't do it. I don't even have one yet but I need to know you're capable." Forward-looking dealbreaker; doesn't match the rewritten text (no someone, no held grudge, no occasion). → Rewrite: **"I held a parking job against a coworker for a full year. He parked fine every day after. I was still watching."**

### `slow_tuesday` · bank · i_sharing · **PASS**
**Text:** "Describe a completely ordinary evening at your place that went exactly right. Start with what you ate."
**Evidence:** "Okay — a couple weeks ago the power went out for an hour, and I just sat on the balcony with a beer and the weird quiet, and it was honestly the best hour of my month. Before that I'd made a quesadilla, so, gourmet night all around." → *Her best hour of the month was a power outage: balcony, one beer, a quesadilla eaten in the dark, extremely pleased about all of it.*
**Angles:** comfort (rhythm-of-life nouns are exactly its feed), i_sharing.
**Defects noted (4–9):** (4-light) "completely ordinary evening" cuts against episodic memory — repeated evenings blur into scripts, so some answers arrive categorical ("every good evening at mine is the same evening: gyoza Thursday…"). The food anchor is a strong retrieval cue and script answers are still usable for comfort (habits are legitimate rhythm-of-life material), so this doesn't disqualify — but expect script-mode answers, not occasions, from maybe a third of people.
**Example answer:** none exists (new prompt). → Propose: **"Tortellini from the bag, the good parmesan. My roommate and I watched a documentary about bridges and rated the bridges. In bed by ten, extremely pleased with myself."**

### `bet_on_yourself` · bank · admiration · **PASS**
**Text:** "Tell me about a time you bet on yourself. It doesn't have to have worked."
**Evidence:** "I quit my agency job to freelance with four months of savings. Month two I had one client and she paid late. I picked up a Saturday bar shift I told nobody about. It's fine now — year three — but that bar shift is the part I'm weirdly proudest of." → *Two months into freelancing she had one client, one late invoice, and a secret Saturday bar shift; she's in year three now.*
**Angles:** admiration (demonstrated grit), self_expansion.
**Defects noted (4–9):** (5) no entry point ("start at…" missing) — minor; the construct is so well-indexed people find their own way in. "Doesn't have to have worked" successfully removes the impressive gate.
**Example answer:** PASS — "Quit marketing for nursing school. Everyone called it a quarter-life crisis. I call it the ER." First-person, breach, joke close, no sentiment.

### `hardest_thing` · bank · admiration · **PASS**
**Text:** "What's something you got through that you weren't sure you would? Start at the worst part."
**Evidence:** "The bar exam, second attempt. The worst part was telling people I was taking it again — I studied in my car at lunch so my coworkers wouldn't know. Passed. Told them after." → *He studied for the bar retake in his parked car at lunch so nobody would know; he told them after he passed.*
**Angles:** admiration (grit), comfort (the recovery-texture answers).
**Defects noted (4–9):** (8) still a vulnerability gate — softened, but it requires having-suffered to answer, and one simulated answerer deflected ("I don't want to get into the worst part on a dating app recording… I learned to cook for one. That was a whole thing" — which, note, still yielded a line). Keep, but don't slot it first in a session.
**Example answer:** FAIL — "Moved across the country at 23 knowing nobody. First three months were brutal. Changed everything." "Changed everything" is a sentiment/meaning close and there's no scene. → Rewrite: **"Moved across the country at 23 knowing nobody. Worst part was month two: birthday dinner alone at a Chili's bar. The bartender comped my dessert. I still go back there."**

### `helped_someone` · bank · admiration · **PASS**
**Text (u):** "Tell us about a time you helped someone and it stuck with you."
**Evidence:** "I taught my grandma to video call. We made a laminated instruction sheet — step one is 'do not touch anything yet.' She calls me every Sunday now, usually by accident first, then on purpose." → *His grandmother's Sunday calls arrive twice — one accidental, one on purpose — a system built on a laminated sheet titled 'do not touch anything yet.'*
**Angles:** admiration (values_in_action), comfort (kindness_markers).
**Defects noted (4–9):** (5) no entry point; (6) "stuck with you" is feeling-adjacent framing — both minor because the answerer is the agent by construction and modal answers arrive with nouns. The virtue-performance risk that killed `values_test` doesn't bite here: the prompt asks for the act, not the value, and simulated answers self-deprecate rather than perform.
**Example answer:** FAIL (marginal) — "Neighbor's car broke down with her kids inside. I drove them to school. Still have the thank you card." The thank-you-card close is a virtue trophy — the one move a helping story can't afford. → Rewrite: **"Neighbor's car died, so I drove her kids to school for two weeks. They rated my music every morning. Sixes, mostly."**

### `figured_it_out` · bank · admiration · **PASS**
**Text (u):** "What's something you figured out that nobody showed you how to do?"
**Evidence:** "All my own bike repairs now. It started because a shop quoted me $80 for what turned out to be one bolt. I watched maybe forty videos. My first wheel truing took an entire Sunday and it still wobbled. It wobbles less now." → *An $80 quote for a one-bolt fix radicalized her into doing her own bike repairs; the first wheel took a whole Sunday and still wobbled.*
**Angles:** admiration (demonstrated mastery as creation), self_expansion.
**Defects noted (4–9):** (5) no entry point, (4) mildly admits a plural answer — both minor; modal answers pick one thing and narrate the origin unprompted. Note: overlaps `taught_yourself` (other batch) — the bank probably only needs one of the two.
**Example answer:** PASS — "Built my own budget app because every other one was garbage. Took 3 months. It's ugly but it works." Nouns, breach, deprecating close.

### `proud_of_someone` · bank · admiration · **KILL**
**Text:** "Who's someone in your life you'd brag about? What did they pull off?"
**Criteria failed:** 1 protagonist (by construction — "what did THEY pull off"), 3 pitchable.
**Simulated answers:**
- A (warm marketer, 29): "My little brother. He got rejected from every music school he applied to, so he just started producing in his bedroom, and now one of his tracks has like two million streams. He never told us — my mom found it by accident. I play it for people at parties."
- B (runner, 32, chatty): "My best friend ran her first marathon after two knee surgeries. Two! I made a sign, I tracked her dot the whole morning, I cried at mile 25. She didn't cry, which is very her."
- C (reserved accountant, 35): "My mom, honestly. She went back and finished her degree at 55 — night classes, full-time job, the whole thing. She graduated the same year my cousin did. She let him have the party."
**Pitch attempts:** A — unwritable: the two million streams are the brother's; "she plays her brother's track at parties" characterizes her only as proud, which every human is. B — closest attempt: "She's the friend at mile 25 with a sign and a tracked dot" — one inferred trait from props, while all the vivid mass (surgeries, marathon) belongs to the friend. C — unwritable: every noun is the mother's. This is `laugh_hardest`'s failure with the witness role made explicit and mandatory: admiration-tier material must demonstrate the *answerer's* character, and admiring your people demonstrates only that you have people. The theory's own feed list says admiration runs on vouches *about* the subject, not vouches *by* them.
**Replacement (admiration):** id `trusted_with` — **"When's a time someone put you in charge of something that mattered to them? What did you do with it?"** helpText: "The small stuff is the good stuff — the more specific, the better." → **Re-test:** "My sister asked me to officiate her wedding. I interviewed them separately for material, like a journalist, and rewrote the speech nine times. There was one joke only their dog would have gotten. It killed anyway." → *Asked to officiate his sister's wedding, he interviewed the couple separately like a journalist, cut nine drafts, and kept one joke written specifically for the dog.* — keeps the relational warmth `proud_of_someone` was reaching for, with the answerer as agent; the trust received functions as an implicit vouch.
**Example answer:** (live: sister/dyslexia/summa cum laude — pure third-party, FAIL, dies with the prompt.) For replacement: **"My sister had me officiate her wedding. I interviewed them separately for material, like a journalist. Nine drafts. The dog joke killed."**

### `against_the_grain` · bank · admiration · **PASS**
**Text:** "When's a time you did the thing nobody around you would have picked? What did they say?"
**Evidence:** "I bought a house with my sister. Everyone said don't mix family and money. We have a chore wheel and a shared spreadsheet named The Constitution." → *She bought a house with her sister against unanimous advice; disputes are settled by a chore wheel and a spreadsheet named The Constitution.*
**Angles:** admiration, self_expansion.
**Defects noted (4–9):** none disqualifying. "What did they say" imports others' voices as reaction to the *answerer's* act — the right way to use third parties. One simulated answer went heavy (leaving a childhood church; "my grandpa didn't talk to me for a while — we talk about fishing now") and was still pitchable, so the range is safe.
**Example answer:** FAIL (marginal) — "Whole family is in finance. I became a teacher. Never once dreaded a Monday." The close is a summary claim, and it doesn't model the "what did they say" the new text asks for. → Rewrite: **"Whole family's in finance. I announced the teaching credential at Thanksgiving. Dad said 'if this is about money, we can help.' It was not about money."**

### `building_right_now` · bank · admiration · **FIX**
**Text (u):** "What are you actively building or working toward right now?"
**Criteria failed:** 5 entry point, 4 (drift to abstract goal-talk). Disqualifiers pass, but the modal answer splits: project-people give scenes, goal-people give aspirations with no nouns.
**Simulated answers:**
- A (runner-adjacent PM, 28): "Training for my first half marathon. Week six. Long run's Saturday, and I've started negotiating with myself about it on Thursdays already."
- B (finance guy, 30, brief): "Honestly, just getting my finances actually together? I have a spreadsheet now. It has tabs."
- C (aspiring PM, 27): "Career-wise I want to move into product management, so I'm doing a certification… I don't know, it's not that interesting. And building better routines, I guess. Gym stuff."
**Pitch attempts:** A — *Week six of half-marathon training; the Thursday-night negotiations with herself have already begun.* B — *His finances now live in a spreadsheet with tabs, plural, which he regards as major infrastructure.* C — unwritable beyond a CV line: "he's doing a PM certification" pitches a LinkedIn update, not a person.
**Rewrite:** **"What are you building or working toward right now? Walk me through where it's at this week."** — the this-week clause forces present-tense scene over aspiration. → **Re-test (C-type answerer):** "The PM certification — this week's module is user interviews, so I practiced on my roommate, who described my imaginary product as 'a solution looking for a problem.' Rude. Accurate." → *He's mid-career-pivot and practicing user interviews on his roommate, whose verdict — 'a solution looking for a problem' — he has chosen to accept.*
**Example answer:** PASS — "Training for a triathlon. Still the slowest person in the pool. Show up at 5:30am anyway." Breach + behavior, no sentiment. (Happens to already model the where-it's-at register the fix asks for.)

### `failure_lesson` · bank · admiration · **PASS**
**Text:** "Tell me about something you got badly wrong. How long did it take to admit it?"
**Evidence:** "I planned our whole group's Portugal trip around a festival that had been canceled for months. When people found out I doubled down for a full day — 'the real festival is the towns along the way.' Nobody has let me plan anything since." → *He planned an entire group trip to Portugal around a festival that had been canceled for months, then argued for one full day that 'the real festival is the towns along the way.'*
**Angles:** admiration (self-awareness), i_sharing (humor).
**Defects noted (4–9):** (8-mild) confession gate remains, but "how long did it take to admit it" reliably steers modal answers comic rather than confessional — all three sims produced self-deprecating stories, none trauma. The rewrite works.
**Example answer:** FAIL — "Started a business, lost $15k. Learned I'm more resilient than I thought." The close is the exact banned move: self-assessment + lesson-summary. → Rewrite: **"Started a T-shirt company, lost $15k. The unsold boxes lived in my dining room for a year — I ate Thanksgiving next to them twice."**

### `mentor_moment` · bank · admiration · **FIX**
**Text:** "Who told you something that stuck? Where were you when they said it?"
**Criteria failed:** 1 protagonist (tilt — the teller owns the line and the scene), 3 pitchable (marginal on modal).
**Simulated answers:**
- A (restaurant-vet turned recruiter, 31): "My first boss, Rita. I was spiraling about a mistake and she said 'you're not that important' — in the good way. We were in the walk-in cooler, which made it funnier. I think about it constantly."
- B (woodworker's grandson, 29): "My grandpa, at his workbench: 'measure twice, cut once, and don't tell your grandmother.' I use both halves, honestly."
- C (hesitant grad student, 26): "Um… a therapist? Is that cheesy. She said something like, feelings aren't facts… where was I — her office, I guess. [laughs] Sorry, that's a bad answer."
**Pitch attempts:** A — marginal: "Her operating philosophy was installed by a restaurant boss in a walk-in cooler: 'you're not that important,' the good way" — works only because she volunteered her ongoing use of it. B — marginal-good, same reason: "he uses both halves" is his. C — unwritable: platitude, no scene, received passively. The strong answers were saved by an application clause the prompt never asked for.
**Rewrite:** **"Who told you something that stuck — and what do you actually do because of it?"** — asks for the answerer's practice directly, which is where the pitch lives. → **Re-test:** "My grandpa: 'measure twice, cut once, and don't tell your grandmother.' I still double-measure everything, and I still don't tell my grandmother — she's 90 and finds out anyway." → *He still measures twice on every project, per his grandfather's doctrine, and still doesn't tell his grandmother, who is ninety and finds out anyway.*
**Example answer:** FAIL — "Professor who said 'your questions matter more than your answers.' Think about it every week." Third-party line, passive reception, no behavior. → Rewrite: **"My first boss told me 'you're not that important' — the good way, in a walk-in cooler. I now say it to myself weekly, and occasionally to one coworker who needs it."**

### `secret_talent` · bank · admiration · **PASS**
**Text:** "What are you unexpectedly good at? Tell me how you found out."
**Evidence:** "I'm weirdly good at guessing what's wrong with a dish — like, 'needs acid.' Found out at a friend's dinner party when I fixed her soup, and now I get consulted. I have been FaceTimed into a kitchen." → *Friends FaceTime him into their kitchens mid-recipe, a consulting practice that began the night he diagnosed a soup with 'needs acid' and was right.*
**Angles:** admiration (mastery discovered, not claimed), i_sharing.
**Defects noted (4–9):** (8) "good at" is technically a competence gate, but "unexpectedly" + the discovery clause keep stakes low — sims produced parallel parking, trunk Tetris, soup triage; nobody performed.
**Example answer:** PASS — "I do calligraphy. Big bearded guy, delicate hand lettering. Done 10 friends' wedding invites." Contradiction, nouns, no sentiment. (Doesn't model "how you found out," but strong enough to keep.)

### `getting_better_at` · bank · admiration · **PASS**
**Text:** "What are you actively bad at and still doing? How's it going this week?"
**Evidence:** "Ceramics. Month four, and everything I make is a 'vessel' because we're not allowed to say what it was supposed to be. This week I made a mug whose handle is decorative." → *Four months into ceramics, everything she makes is officially a 'vessel,' and this week's mug has a strictly decorative handle.*
**Angles:** admiration (persistence shown, never claimed — the inversion does rule 1's work automatically), i_sharing (self-deprecation).
**Defects noted (4–9):** none. Best-constructed admiration prompt in this batch; the bad-at gate is an anti-gate.
**Example answer:** FAIL — "Listening. I used to just wait for my turn to talk. Harder than it sounds." Abstract self-assessment with zero occasion — models therapy-speak against a prompt built for concrete works-in-progress. → Rewrite: **"Pottery. Month four. Everything I make is a 'bowl' in the sense that it's round and holds nothing. I've kept them all."**

### `stood_up_for` · bank · admiration · **PASS**
**Text:** "When's a time you said something inconvenient because it was true? How did the room take it?"
**Evidence:** "I told my mom the turkey was dry once and it's still brought up every Thanksgiving. Every year. That's the one I'll give you." → *He told his mother the turkey was dry in 2019, and the trial has reconvened every Thanksgiving since.*
**Angles:** admiration (candor), i_sharing (the comic-trivial answers).
**Defects noted (4–9):** (2-marginal) non-confrontational people need a real search — one sim nearly bottomed out before landing on "I told my book club I hadn't read the book… for six months of books" (still pitchable); (8-mild) "because it was true" pre-moralizes toward a courage performance, but sims routed around it comically. "The room" presupposes a public setting — consider "how did it land" if this ever rewords. Keep as-is.
**Example answer:** none exists (new prompt). → Propose: **"Told the big meeting our numbers didn't support the launch. Very quiet room. We shipped it smaller, it worked, and everyone now remembers it as their idea."**

### A3 · Bank — comfort + fun (19)

<!-- Fork 3 · bank comfort (9) + fun (10) · simulate-then-pitch review -->

### `recharge` · bank · comfort · **PASS**
**Text:** "Think of the last week that wrecked you. What did the next day actually look like?"
**Evidence:** "Last week of the school year, honestly. The Saturday after, I drove to my sister's, didn't even plan it, just showed up. Her kids climbed on me, she made lasagna, I fell asleep on her couch at 8:30 and nobody woke me up." → *"After the last week of school, Priya drove to her sister's unannounced, got climbed on by nieces, and slept through dinner on the couch."*
**Angles:** comfort, i_sharing
**Defects noted (4–9):** #2 mild — "the last week that wrecked you" should be "a week that wrecked you"; wrecking weeks are salient so retrieval survives, but "last" buys nothing. Two-step retrieval (find week, then next day) worked in all three sims.
**Example answer:** FAIL — live example ("No alarm, coffee on the porch, zero plans. That's how I come back to life.") is the canonical failure: summary + sentiment close, and it answers the old text. → **Rewrite:** "After inventory week I slept till noon, ate cold pizza on the floor, and rewatched the same three episodes I always do. Didn't touch my phone till 4."

### `close_people` · bank · comfort · **PASS**
**Text:** "What's your oldest friend always giving you a hard time about?"
**Evidence:** "My college roommate Dani will not let go of the fact that I planned her bachelorette with a spreadsheet. Tabs. She screenshotted it and it still comes up in the group chat four years later. In my defense it had a pool-time block." → *"Maya planned a bachelorette with a spreadsheet — tabs, pool time blocked out — and her friends have kept the screenshot in the group chat for four years."*
**Angles:** comfort, i_sharing, admiration (friend-vouch mechanism — the tease is a warrant)
**Defects noted (4–9):** #4 mild — "always" is categorical, but all three sims anchored the standing tease to a signature instance unprompted. Best-constructed comfort prompt in the batch: it forces third-party material *about the answerer's trait*.
**Example answer:** FAIL — live example ("She'd say I'm the friend who actually shows up. Not texts — drives over with food.") is a self-claimed virtue answering the old text; it isn't even a hard time. → **Rewrite:** "Dani won't let go of the bachelorette spreadsheet. It had tabs. One of them was labeled 'pool time.'"

### `love_language_real` · bank · comfort · **PASS**
**Text:** "What's the way you show someone you care about them? Give us a specific example."
**Evidence:** "When my coworker's mom was in the hospital I didn't know what to say so I just left a lasagna on her porch. Texted her a photo of it like, 'it's out here, no need to talk.'" → *"When words fail, Dana leaves a lasagna on the porch and texts a photo: 'it's out here, no need to talk.'"*
**Angles:** comfort, admiration
**Defects noted (4–9):** #4 — categorical lead-in ("the way you show") invites love-languages quiz-speak first (one sim opened "I'm an acts of service person"); the explicit "give us a specific example" recovered the instance in all three sims. Optional polish: invert to "Tell me about a time you showed someone you cared without saying it. What did you actually do?"
**Example answer:** FAIL — "You mention a job interview Thursday? I'm texting you Thursday morning. Every time." — second-person address, question framing, categorical habit, zero nouns. → **Rewrite:** "Steph mentioned her garbage disposal was broken, just in passing. I showed up Saturday with a wrench. She made margaritas, I fixed the sink."

### `disagree_well` · bank · comfort · **PASS**
**Text:** "Tell me about the last real disagreement you had with someone you love. How did it end?"
**Evidence:** "My boyfriend 'soaks' dishes for three days. I finally said it feels like the sink is pretending to be a crockpot. He laughed, which broke it, and now nothing soaks overnight. We shook on it like idiots." → *"'The sink is not a crockpot' ended a three-day dish standoff — she and the offender shook on a no-soaking treaty."*
**Angles:** comfort (repair style), admiration (steadfastness sims)
**Defects noted (4–9):** #2 mild — "the last real disagreement" forces ordering + a "real" threshold judgment; swap to "a real disagreement." Weakest comfort pass: 1 of 3 sims (a Thanksgiving-logistics fight) yielded only a flat pitch. The other two produced genuinely good repair-style material, which is exactly the comfort contract.
**Example answer:** FAIL — live example ("I need 20 minutes to cool down. Try me before that and I'll say something dumb.") is a pattern self-description, no occasion, answers the old text. → **Rewrite:** "My boyfriend 'soaks' dishes for days. I told him the sink isn't a crockpot. He laughed, and now nothing soaks overnight — we shook on it."

### `safe_place` · bank · comfort · **PASS**
**Text:** "Describe a place that feels like home to you."
**Evidence:** "My grandma's kitchen in Ohio. It always smells like coffee even at night. Rooster wallpaper since the 80s. I sit on the counter, she yells at me to get off, I don't, and that's kind of the whole ritual." → *"Home is her grandma's rooster-wallpapered kitchen in Ohio, where Jules sits on the counter and gets yelled at for it — the ritual since the 80s."*
**Angles:** comfort, i_sharing
**Defects noted (4–9):** #4 (descriptive, no occasion) and #7 (no breach) — but place descriptions arrive noun-loaded by construction, and all three sims embedded a micro-ritual that carried the pitch. **helpText must be fixed:** "could be an actual place or a feeling" actively invites the abstraction the tone rules can't use — cut "or a feeling."
**Example answer:** FAIL (mild) — "Could sit there forever" is a sentiment close on otherwise good material. → **Rewrite:** "My parents' back porch in October. Dad's on his third retelling of the raccoon story and nobody stops him."

### `hard_day` · bank · comfort · **KILL**
**Text:** "Think of a bad day someone got right. What did they actually do?"
**Criteria failed:** #1 protagonist (answerer is the recipient; the *someone* is the agent in 3/3 sims) · #3 pitchable (every attempt lands on the caregiver or collapses into a care-preference summary)
**Simulated answers:**
- **A (laid-off designer, warm):** "Okay so when I got laid off in January, my roommate didn't say anything about it, she just... appeared with a burrito and put on the specific season of Survivor we'd already seen. She didn't ask any questions. That was exactly right. Like she knew talking about it was the worst possible thing. I don't know how she knew. I still think about it."
- **B (terse engineer, dog guy):** "My dad, when my dog died — I was a wreck, and he drove two hours and just did yard work at my place all day. Didn't hug me, didn't do a speech, just mowed my lawn and fixed the gate. That's his whole language. And it weirdly worked. By the time he left the yard looked great and I could breathe."
- **C (lawyer, second-try bar):** "When I bombed the bar exam the first time, my girlfriend at the time took my phone, put it in a drawer, and drove us to the coast. We ate fried clams and didn't mention the bar once. I passed in February, but that day is the thing I remember."
**Pitch attempts:**
- A — unwritable about the answerer: "the right move was a burrito and no questions" pitches the roommate; centering Maya yields only "Maya's idea of being rescued is a burrito and zero questions" — a handling manual, not a reason to meet her.
- B — best achievable: "Sam comes from people who mow your lawn instead of making speeches" — an inference about his family, not a demonstrated trait of his. Fails tone rule 5 (explains meaning) the moment it tries to transfer the dad's behavior to Sam.
- C — unwritable: the girlfriend owns every verb.
The material is real compatibility *data* (what care lands for this person) but the pitch layer cannot cast the answerer as anyone but the patient. Witness/recipient by construction — no reword keeps "someone got it right" and fixes agency.
**Replacement:** id `standing_ritual` · comfort · **"What's the plan in your week that never moves? Tell me about the most recent one."** · helpText: "A standing thing — who's there, where it happens, what got said last time." → **Re-test:** "Sunday nights my brother and I get pho. Same place since 2019, same booth. Last Sunday he brought his new girlfriend, which technically violates the rules, but she ordered the tripe so she's allowed back." → *"Sunday pho with his brother hasn't moved since 2019 — the new girlfriend got in on a technicality: she ordered the tripe."* Retrieval instant (recurring event), answerer protagonist, feeds comfort (rhythm-of-life) directly. Distinct from `morning_person` (solo routine) — this is the social standing plan.
**Example answer:** old one ("Just sit with me. Don't try to fix it. Maybe bring takeout.") dies with the prompt — it's a second-person instruction manual. Replacement's exampleAnswer: "Sunday pho with my brother, same booth since 2019. Last week he brought his new girlfriend. She ordered the tripe, so she can stay."

### `morning_person` · bank · comfort · **PASS**
**Text:** "Walk us through your morning routine — the real one, not the aspirational one."
**Evidence:** "Real one: I snooze, I make instant oatmeal I eat standing up, I lose ten minutes looking for my keys because I refuse to have a key hook, and I'm somehow exactly four minutes late to everything. It's a system." → *"Nia refuses on principle to own a key hook, loses ten minutes to it daily, and lands exactly four minutes late to everything — 'it's a system.'"*
**Angles:** comfort, i_sharing
**Defects noted (4–9):** #4 technically (a routine, not one occasion) — but rhythm-of-life detail is literally the comfort angle's feed, and "the real one" reliably pulled self-deprecating breach in 3/3 sims. Verified, not waved through: the flagged reputation holds.
**Example answer:** PASS — "Snooze twice. Scroll phone guiltily. Stare at wall with coffee. Get ready in 15 minutes. Every day." Concrete, first-person, right register, no sentiment close.

### `small_repair` · bank · comfort · **PASS**
**Text:** "What's something in your life you keep quietly maintaining? Walk me through the last time you did it."
**Evidence:** "My grandpa's watch? It's not even expensive but I take it to this one guy downtown once a year. Went in March. The guy remembers the watch, not me, which I respect. He always says 'they don't make this movement anymore' and charges me forty bucks." → *"Once a year Theo takes his grandpa's forty-dollar watch to a guy downtown who remembers the watch, not him — 'they don't make this movement anymore.'"*
**Angles:** comfort, admiration (constancy)
**Defects noted (4–9):** #5 — "quietly maintaining" is a writerly category; all three sims parsed it but with a visible beat ("um... okay, my cast iron?"). helpText must carry the grounding: "A pan, a plant, a watch, a long-distance friendship — whatever you keep alive."
**Example answer:** none exists (new prompt). → **Proposed:** "My cast iron. Sunday nights, oil, oven. Last week one came out of the dishwasher rusty — not my doing — so it got the full resurrection: scrub, salt, re-season twice."

### `learned_from_someone` · bank · comfort · **PASS**
**Text:** "Who taught you something you still do their way? What is it?"
**Evidence:** "My first boss at the coffee shop, Marisol, taught me you clean as you go. I do it everywhere now — cooking, my desk, my car. My kitchen looks like nobody lives there mid-recipe. People think it's unhinged." → *"Marisol at the coffee shop taught her clean-as-you-go, and now Ana's kitchen looks uninhabited mid-recipe — colleagues find it unhinged; she finds it correct."*
**Angles:** comfort, i_sharing
**Defects noted (4–9):** protagonist RISK flagged, not failed: the prompt opens with "Who," and a sentimental answerer could spend 40s on grandma. In all three sims the living habit — which belongs to the answerer — carried the answer, because "What is it?" is the operative question. This is the correct lineage construct (the habit lives in the answerer's present), unlike `mentor_moment`-type prompts where the mentor keeps the verbs.
**Example answer:** none exists (new prompt). → **Proposed:** "My dad folds towels in thirds — he worked at a Marriott in college. I can't do it any other way now, and I've converted two roommates."

### `conspiracy` · bank · fun · **PASS**
**Text:** "What's a conspiracy theory or hot take you're willing to die on?"
**Evidence:** "Every 'family style' restaurant is a scam to make you order more food. You get less food and you have to negotiate for it. I've done the math at three different places. I bring this up on dates, which might be why I'm here." → *"Marcus has done the math at three restaurants and can prove 'family style' is a scam — he brings this up on dates, which he concedes may be relevant."*
**Angles:** i_sharing (humor_signature, notable_quotes)
**Defects noted (4–9):** #4/#7 (no occasion, no breach) — accepted on fun-tier latitude; the take is the answerer's own voice, which is the tier's job. #9 risk: one low-talkative sim nearly one-lined it ("battery percentage is vibes") — still quotable, so it survives as garnish.
**Example answer:** PASS — "Mattress Firm is a money laundering front. I will not be taking questions." Models the deadpan register exactly; the take belongs to the answerer.

### `worst_date` · bank · fun · **PASS**
**Text:** "What's your best worst-date story?"
**Evidence:** "It was his coworker's engagement party — he'd double-booked us. I found out when someone handed me a congratulations card to sign. I signed it 'so happy for you two — Jess, Dave's date' and left after the toast." → *"Handed a card at what turned out to be her date's coworker's engagement party, Jess signed it 'so happy for you two — Jess, Dave's date' and left after the toast."*
**Angles:** i_sharing, fun
**Defects noted (4–9):** #8 mild — "best" superlative, but the jokey frame ("best worst") lowers stakes rather than gating, and this genre is *rehearsed social currency*: people keep an indexed version with their own punchline, which is why retrieval survives where `laugh_hardest` died. **Protagonist RISK flagged loudly:** a real minority of modal answers will be "he was on his phone the whole time" — vivid material about the other person. 2/3 sims put the answerer's own move at the center; the third survived on the teller's comic voice alone. Extraction should keep the teller's phrasing, not the date's antics.
**Example answer:** FAIL (borderline, rewritten to be safe) — "His ex was our waitress. She cried. He cried. I ate my pasta in silence. Three stars." The "Three stars." close is the answerer's voice, but the model it teaches is answerer-as-audience — one step from the roommate-backflip failure. → **Rewrite:** "It turned out to be his coworker's engagement party — he'd double-booked. Someone handed me the card to sign. I signed it 'So happy for you two — Jess, Dave's date' and left after the toast."

### `irrational_fear` · bank · fun · **PASS**
**Text:** "What's an irrational fear you have? Tell me about the last time it got you."
**Evidence:** "Voicemail. An unlistened voicemail can sit there for a week and radiate. My dentist left one in March and I just called them back without listening to it. 'Hi, I got a call?' Like a coward. It worked though." → *"A voicemail can radiate at Ana for a week — she called the dentist back unlistened: 'Hi, I got a call?' It worked."*
**Angles:** i_sharing, comfort (light)
**Defects noted (4–9):** none of substance — fears are rehearsed self-knowledge, and for a recurring fear "the last time it got you" is recent by nature, so the "last" is legitimate here. The rewrite's occasion tail is what makes it work: all three sims produced a scene, not a description.
**Example answer:** FAIL — "Escalators. What if my shoelace gets caught? I know it's irrational. I think about it every time." — no occasion, pattern close; doesn't model the new text's second half. → **Rewrite:** "Escalators — the flattening part at the end. Last week at the airport I did the little hop, with a suitcase, and a kid laughed at me. Fair."

### `superpower` · bank · fun · **FIX**
**Text:** "If you could have one mundane superpower, what would it be?"
**Criteria failed:** #9 (answerable in one sentence — the modal low-talkative answer is a bare wish with no material) · #4/#7 latent (hypothetical, no occasion, no breach — tolerated on fun latitude only when elaboration happens, and nothing in the text induces it)
**Simulated answers:**
- **A (confident, car guy):** "Parallel parking, first try, any spot. I would use it daily and tell no one. People would just think I'm incredible."
- **B (low-talkative, hedger):** "Um... I'd want to know which line at the grocery store is actually fastest. Not big lottery stuff. Just, I pick the line, it's the right line, forever." *(trails off — done in 12 seconds)*
- **C (insomniac, self-aware):** "Falling asleep instantly, anywhere. I have never once been asleep before 1am. My brain does a director's commentary of my whole life every night. Shut it off, that's the power."
**Pitch attempts:**
- A — "Given any superpower, Dev would take first-try parallel parking and tell no one — 'people would just think I'm incredible.'" Quotable, works.
- B — barely writable: "…would spend a superpower on always picking the fastest grocery line." No noun from his life, no image; garnish at best.
- C — "Ana's dream power is instant sleep — anything to cancel the nightly director's commentary of her whole life." Works because C volunteered a real-life anchor the prompt never asked for.
The construct (a wish that reveals the daily pain point) is sound; the text lets a third of answers die at one sentence.
**Rewrite:** **"If you could have one mundane superpower, what would it be — and what happened recently that made you need it?"** → **Re-test:** "Instant dry laundry. Because Sunday I sat on my bed for two hours waiting for sheets, missed the farmers market, and remade the bed at midnight anyway." → *"Ray would spend an entire superpower on instant-dry laundry — Sunday's sheet cycle cost him the farmers market and ended in a midnight bed-making."* The occasion tail converts the wish into a scene, same fix pattern the bank already applied to `apocalypse_skill`.
**Example answer:** PASS — "Falling asleep instantly. The hours I've lost replaying dumb things I said in 2019." Self-directed, funny, models elaboration; still fits the rewritten text.

### `apocalypse_skill` · bank · fun · **PASS**
**Text:** "What's the useful thing you can do that nobody expects? When did it last come in handy?"
**Evidence:** "I can back up a trailer. Grew up on a farm. Last month my neighbor was doing the 19-point-turn thing with a U-Haul and I just... appeared. Did it in one. Didn't say anything. Walked back inside. Best moment of my year." → *"When a U-Haul defeated the neighbor, Cole appeared, backed the trailer in one, said nothing, and went back inside."*
**Angles:** admiration, i_sharing, fun
**Defects noted (4–9):** none — strongest rewrite in the batch; demonstrated skill + fresh occasion is exactly what tone rules 6/8 need.
**Example answer:** FAIL — live example ("I can cook anything out of nothing... Morale officer.") is a categorical claim answering the old zombie text, with no occasion. → **Rewrite:** "I can back up a trailer — farm kid. Last month my neighbor was losing to a U-Haul, so I did it in one try and walked back inside without a word."

### `most_me_photo` · bank · fun · **PASS**
**Text:** "If you had to pick one photo on your phone that captures who you really are, what would it be?"
**Evidence:** "Not the finish-line one — the one at mile 22 where I look like I'm dying but I'm giving a thumbs up. A stranger took it. I paid $40 for the official one but the stranger's is better." → *"Rosa paid $40 for the official marathon photo but keeps the stranger's shot from mile 22 — dying, thumbs up."*
**Angles:** i_sharing, fun, comfort (light)
**Defects noted (4–9):** #2 marginal — this is a search + identity judgment, and all three sims showed hedging ("um... let me think..."). It survives because people pre-curate identity photos (contact photos, framed ones) so an available candidate exists; and the answer arrives as a described image, which is tone-rule-4 fuel by construction. Lower-friction alternative if yield disappoints: "What's the photo of you your friends would pick as most you? Describe it."
**Example answer:** FAIL (mild) — "Completely happy." is a sentiment close. → **Rewrite:** "Campsite, covered in dirt, holding a fish I'd just caught, huge grin, hair a disaster. My mom asked me to please never make it my profile picture."

### `dating_confession` · bank · fun · **PASS**
**Text:** "What's the part of a first date you're actually bad at? Tell me about one that went that way."
**Evidence:** "The ending. The goodbye. I have hugged, handshaked, and waved at the same person in one motion. Last month I went for the hug as she went for the cheek thing and I basically headbutted her. She texted 'nice headbutt' after." → *"Maya has hugged, handshaked, and waved at the same person in one motion — the most recent goodbye ended in a light headbutt and a 'nice headbutt' text."*
**Angles:** i_sharing, comfort
**Defects noted (4–9):** #8 considered and cleared — it asks for a confession, but a low-stakes behavioral one ("bad at", not "nervous about"), which is the anti-gate direction; the rewrite correctly moved off the old feeling-framing. Self-deprecating demonstrated humor is the confirmed-positive craft device.
**Example answer:** FAIL — "I either go too deep too fast or freeze and talk about the weather. No middle ground." — pattern summary, no occasion, answers the old text. → **Rewrite:** "The goodbye. I've hugged, handshaked, and waved at the same person in one motion. Last one ended in an accidental headbutt. She texted 'nice headbutt,' so — fine."

### `first_job` · bank · fun · **PASS**
**Text:** "What was your first job and what were you bad at?"
**Evidence:** "Umpire for little league, thirteen years old. Bad at everything. I called a kid out at the plate once and his grandma booed me. His grandma. I did it for three summers though — forty bucks a game." → *"At thirteen, Marco umpired little league for $40 a game and got booed by a grandmother — he re-upped for three summers."*
**Angles:** i_sharing, admiration (light), fun
**Defects noted (4–9):** none — first job is a permanent autobiographical landmark (instant retrieval), and "what were you bad at" is the impressive-gate inverted. Best new prompt in the batch.
**Example answer:** none exists (new prompt). → **Proposed:** "Dairy Queen at sixteen. Could not do the curl on the cone — mine looked defeated. They moved me to drive-thru, where I flourished."

### `overpacked` · bank · fun · **PASS**
**Text:** "What's something you always bring that nobody else does? When did it last pay off?"
**Evidence:** "Band-aids. In every bag I own. Last month at a wedding a bridesmaid's heel strap destroyed her ankle and I produced a band-aid mid-reception like a magician. I've been thanked in a toast. Not my toast." → *"Mid-reception, a bridesmaid's ankle met its match in Dana's ever-present band-aids — she's since been thanked in a toast that wasn't hers."*
**Angles:** comfort (preparedness-as-care), i_sharing
**Defects noted (4–9):** none of substance — signature habit is self-indexed; "last paid off" is recent by nature for a habit in active use.
**Example answer:** none exists (new prompt). → **Proposed:** "Band-aids, in every bag. At a wedding last month a bridesmaid's heel strap drew blood, and I produced one mid-reception. I've since been thanked in a toast."

### `bad_at_pretending` · bank · fun · **PASS**
**Text:** "What are you visibly bad at hiding? When did it last give you away?"
**Evidence:** "Being bored. My face just... leaves. In a work meeting two weeks ago my manager stopped and said 'Kayla has notes' and I did not have notes, I had a face." → *"Kayla's boredom face is public record — her manager once announced 'Kayla has notes' when Kayla had only a face."*
**Angles:** i_sharing, comfort
**Defects noted (4–9):** none — the tell is self-indexed (people are told about it repeatedly), the giveaway incident is recent by nature, and the answerer owns the failure. Sister construct to `close_people`'s tease mechanism.
**Example answer:** none exists (new prompt). → **Proposed:** "My boredom face. In a meeting my manager stopped and said, 'Kayla has notes.' I did not have notes. I had a face."

### A4 · Fished — Q1, Q3, Q5, Q6 (18)

<!-- F4: fished Q1, Q3, Q5, Q6 — 18 prompts -->

### `q1.1` (theatre kid) · fished · i_sharing · **PASS**
**Text:** "Tell me about a night on stage that still lands when you think about it. What went right — or what went wrong?"
**Evidence:** "Opening night, there's this song where I slam my mug on the table — the mug just exploded. And I had a two-second decision, and I just kept singing and picked up the biggest shard and toasted with it. The audience thought it was on purpose." → *Senior year, opening night, mid-song, his prop mug exploded — he toasted the room with the biggest shard and never broke character.*
**Angles:** i_sharing, admiration
**Defects noted (4–9):** none serious. Watch-item: quieter ensemble members can return a collective "we all sang louder" night (protagonist drifts to the cast), but the tap ("at seventeen you were, on the record, a theatre kid") plus "on stage" keeps the modal answerer inside the frame; 2 of 3 sims were self-owned mishaps, which theatre kids keep rehearsed.

### `q1.2` (jock) · fished · admiration · **PASS**
**Text:** "Tell me about a team you were on and the thing you were actually good at."
**Evidence:** "I was a libero, which is the one in the different color jersey who's not allowed to do anything cool. But I was really good at reading hitters — I could tell from the shoulder where it was going. We won regionals and I had like 30 digs and nobody remembers digs." → *In high school she was the libero — the one in the wrong-color jersey who reads a hitter's shoulder and gets there before the ball does.*
**Angles:** admiration, i_sharing
**Defects noted (4–9):** 4 (one occasion) — "the thing you were actually good at" is a trait-level ask and modal answers are pattern-level ("I was good at hills"). Survives because the niche-skill framing ("actually good at") reliably surfaces concrete, unbraggable specifics with nouns; all three sims pitched cleanly.

### `q1.3` (honor-roll grinder) · fished · admiration · **PASS**
**Text:** "What were you grinding for at seventeen? Tell me whether it turned out to be worth it."
**Evidence:** "Pre-med, since I was like nine — I was that kid with flashcards at lunch. And I'm not a doctor now, I'm in supply chain, which is a whole story. The habits stayed though. I made flashcards to learn wine." → *The flashcards-at-lunch kid didn't become a doctor — but she did make flashcards to learn wine.*
**Angles:** admiration, self_expansion
**Defects noted (4–9):** 6 (thing-not-feeling, mild) — "whether it turned out to be worth it" is an evaluation ask, but in all three sims it produced the contradiction arc (got in/transferred out; lost valedictorian by .01; not-a-doctor flashcards) rather than sentiment, because the concrete first clause anchors the answer before the evaluation arrives.

### `q1.4` (the one organizing the hang) · fished · admiration · **PASS**
**Text:** "Tell me about something you organised at seventeen that actually happened. How many people, and what went wrong?"
**Evidence:** "I organized our senior skip day, which sounds like nothing but I had a spreadsheet. Forty-two people, three beaches ranked by cop likelihood. I told everyone the wrong exit and half the class ended up at the wrong beach — and both halves thought they were the real party." → *At seventeen he ran senior skip day off a spreadsheet — forty-two people, beaches ranked by cop likelihood, and half the class partying at the wrong one to this day.*
**Angles:** admiration, i_sharing
**Defects noted (4–9):** none — occasion named, counts and breach handed, protagonist structurally the organizer. One of the strongest prompts in this batch.

### `q1.5` (happily unaffiliated) · fished · i_sharing · **PASS**
**Text:** "What were you doing at seventeen while everyone else was doing the school thing?"
**Evidence:** "Video games and forums, dude. Like embarrassingly deep in a Halo forum. But that's actually where I learned to write — I was writing essay-length posts. I moderated a forum with 4,000 people in it at seventeen and no one at my school knew." → *At seventeen he was secretly moderating a 4,000-person Halo forum — his school had no idea.*
**Angles:** i_sharing, self_expansion
**Defects noted (4–9):** 4 (categorical — asks for a phase, not an occasion) and 5 (no entry point). Survives anyway: the counterfactual frame ("while everyone else…") reliably surfaces identity-rich concrete territory (closing shift at the pizza place, every back road in the county, the abandoned drive-in), and all three sims pitched. A rewrite adding an occasion would gate what is deliberately the low-pressure "out" option.

### `q1.6` (a completely different person) · fished · admiration · **PASS**
**Text:** "You said you're a completely different person now. What changed — and when did you notice?"
**Evidence:** "At seventeen I was aggressively shy — wouldn't order my own food. I took a job doing phone sales *because* it terrified me. When did I notice — there was a night two years in when a heckler yelled something and I was just… happy? Like oh, this is fun for me now." → *The kid who couldn't order his own food took a phone-sales job on purpose and now does stand-up — he knew it had worked the night a heckler made him happy.*
**Angles:** admiration, self_expansion
**Defects noted (4–9):** 6 (mild) — "what changed" alone would pull trait-talk ("I got confident"); "when did you notice" is the rescue, converting the transformation into a locatable noticing-moment in all three sims. The map's claim that this is its strongest prompt held up under simulation.

### `q3.1` (already home, shoes off) · fished · comfort · **FIX**
**Text:** "Tell me about the last party you left early and were glad about. Where'd you go instead?"
**Criteria failed:** 2 (retrievability — "the last party you left early" is an unmarked event for a chronic early-leaver: they leave *every* party early, so "the last" indexes nothing and recency is not the construct); 8 (mild — "glad about" is redundant with the tap and adds a self-audit).
**Simulated answers:**
- A (quiet cat owner): "I mean… most parties? There was a birthday thing like two weekends ago, a rooftop thing, and it hit 10:30 and I did the Irish exit. Went home, put on sweats, watched half a movie with my cat. It wasn't like I went somewhere cool. Home is the somewhere. I don't know what else to say about it."
- B (bookish ramen regular): "Ha, um, the last one… my coworker's engagement party actually, at a brewery, super loud, and I stayed the polite ninety minutes and then got ramen alone at the place next door and read at the counter. Best part of my night honestly. I do that a lot. The counter seat is key."
- C (smug NYE sleeper): "I don't— I leave everything early, that's like my thing. Glad about — always? I guess New Year's? We left before midnight and were asleep at 11:58 and I woke up feeling amazing while everyone was hungover. My sister still gives me grief about it."
**Pitch attempts:** A → *She Irish-exits rooftops at 10:30 for sweats, half a movie, and the cat* (thin but writable). B → *He gives a party the polite ninety minutes, then eats ramen alone at the counter next door with a book* (good). C → *Asleep at 11:58 on New Year's Eve, by choice, and smug about it in the morning* (good). The material lands when it lands — but A and C both stalled on "the last" ("most parties?", "always?") before substituting a salient one; the word buys nothing and costs the first five seconds.
**Rewrite:** "Tell me about a party you were glad you left. Where'd you go instead?" → **Re-test:** "My friend's gallery-opening thing last month — I gave it an hour, then walked to the taco truck on 7th and ate on the curb still in my nice jacket. Genuinely a top-five evening." → *An hour at the gallery opening, then tacos on the curb in his nice jacket — he calls it a top-five evening.*

### `q3.2` (side table, deep in the actual conversation) · fished · i_sharing · **FIX**
**Text:** "Tell me about a conversation at a party you're still thinking about. What was it about?"
**Criteria failed:** 1 (protagonist, partial — the modal memorable party-conversation is memorable because of the *other* person, and "what was it about" asks for topic, not the answerer's side); 5 (entry point — "what was it about" points at content, the least self-revealing part).
**Simulated answers:**
- A (curious housewarming guest): "Okay so at my friend's housewarming I got stuck talking to her uncle, and it turned out he'd spent nine years on container ships? And he told me about the time they lost power near Madagascar and just drifted for a day. I think about that guy monthly. I just asked questions for an hour, honestly."
- B (wedding-table debater): "There was this conversation at a wedding — me and two people I'd just met got into whether you'd want to know how you die, for like two hours, and I kept switching sides, and one of them emails me now. We have an email thread. About death. It's very normal."
- C (clocked ex-cellist): "At a work thing this woman told me I 'have the energy of someone who used to play in an orchestra' and I DID, I played cello for ten years, and I've thought about it every week since. Like what was she seeing? What does orchestra energy mean??"
**Pitch attempts:** A → unwritable: the story is the uncle's; "she asked questions for an hour" pitches curiosity only by inference the transcript doesn't warrant. B → *A two-hour wedding-table argument about mortality got him a pen pal — they still email, mostly about death* (good). C → *A stranger at a party told her she had "ex-orchestra energy" — she played cello for ten years and hasn't recovered from being clocked* (good). One clean witness-failure in three, and A is the classic modal shape for this ask.
**Rewrite:** "What's a party conversation you couldn't drop? What was your side of it?" → **Re-test:** "New Year's, someone said nobody actually likes their job and I would not let it go — I ended up listing, like, the lady at the fabric store, my brother the arborist… I made a whole case. We were still going at 2am and I emailed him a podcast about it the next day." → *He spent a New Year's party building the case that people secretly love their jobs — closing argument delivered at 2 a.m., supporting podcast emailed the next day.*

### `q3.3` (outside, handing out sparklers) · fished · admiration · **PASS**
**Text:** "Tell me about the last thing you ended up running that you never signed up to run."
**Evidence:** "My friend's bachelorette — I was not the maid of honor, but the maid of honor got food poisoning day one in Nashville, and suddenly I'm holding the itinerary, the Venmo spreadsheet, nine women, one of whom lost her phone in a river. I ran that weekend like a military operation." → *When the maid of honor went down in Nashville, she absorbed the itinerary, the Venmo spreadsheet, and nine women — one of whom lost a phone to a river.*
**Angles:** admiration, comfort
**Defects noted (4–9):** wording preference — "the last thing" should be "a thing" (recency is not the construct; lessons.md 2026-08-24). It does **not** fail retrievability here the way q3.1 does: "ended up running something I never signed up for" is a marked, story-shaped event class and — for the sparkler-handing default-operator this tap selects — a frequent one; all three sims retrieved instantly (bachelorette takeover, happy-hour committee, building group chat) with zero stall. One-word tweak recommended, not required.

### `q3.4` (on the dance floor since the first song) · fished · i_sharing · **PASS**
**Text:** "Tell me about the last night you closed down. Who else was still there at the end?"
**Evidence:** "My cousin's wedding — by the end it was me, the groom's grandma, who is a legend, and four groomsmen, and the DJ was packing up so somebody's phone went in a cup as a speaker, and me and the grandma did a full song to phone-speaker Motown while they folded tables around us." → *At the last wedding she outlasted the DJ — final song was phone-in-a-cup Motown with the groom's grandmother while the staff folded tables around them.*
**Angles:** i_sharing, comfort
**Defects noted (4–9):** same "the last" preference as q3.3 ("a night you closed down") — for this tap, closing down is frequent by nature, so retrieval held in all three sims, with one benign category-slide ("honestly it's most weddings, but the one I think of—") that self-corrected into an occasion. "Who else was still there" pulls a cast but the answerer stays in frame as the one still standing.

### `q5.1` (that was this month) · fished · self_expansion · **PASS**
**Text:** "What did you say yes to this month? Start at the moment you said yes."
**Evidence:** "My coworker runs a jiu-jitsu gym on the side and he's been on me for a year, and two weeks ago I was mad about something else entirely and just said fine, Saturday. The moment of yes was honestly spite. I've gone four times now. I got folded like laundry by a 19-year-old." → *Said yes to jiu-jitsu out of spite three weeks ago — four sessions in, folded like laundry by a teenager, fully hooked.*
**Angles:** self_expansion, i_sharing
**Defects noted (4–9):** none. The option itself asserted recency, so "this month" is a collection, not a search; entry point handed at the exact narrative hinge.

### `q5.2` (sometime this year) · fished · self_expansion · **PASS**
**Text:** "What did you say yes to this year with no idea what you were doing? Start at the yes."
**Evidence:** "In February my sister asked me to do her wedding flowers because quote, I'm 'crafty,' and I said yes at brunch before I understood the question. Forty YouTube videos, a fridge full of hydrangeas for a week, my hands were destroyed. People asked for the florist's name. That was me. I was the florist." → *Said yes to her sister's wedding flowers at brunch, learned floristry from forty videos, and got asked for the florist's card at the reception.*
**Angles:** self_expansion, admiration
**Defects noted (4–9):** none. Same structure as q5.1; the tap did the retrieval.

### `q5.3` (a few years back) · fished · self_expansion · **PASS**
**Text:** "Tell me about the thing you said yes to unqualified. How badly did it go?"
**Evidence:** "I said yes to being my buddy's best man, except the wedding was in Mexico and he asked me to 'handle logistics' and I don't speak Spanish and I'd never planned anything. I booked a party bus that turned out to be a school bus. Painted. Everyone still calls it el autobús." → *As best man he "handled logistics" for a Mexico wedding with no Spanish and no plan — the party bus arrived as a painted school bus, now legend.*
**Angles:** self_expansion, i_sharing
**Defects noted (4–9):** none. "The thing" is definite reference to the event the user already retrieved to answer the quiz item — the map's tap-conditioning working exactly as designed; "how badly did it go" is the breach handed at low stakes.

### `q5.4` (I like knowing what I'm doing) · fished · admiration · **PASS**
**Text:** "What's the thing you know cold — where you're the one people come and ask?"
**Evidence:** "Skincare, weirdly? Like ingredient-level. My group chat sends me photos of products in the store and waits. I've read the actual studies. Don't get me started on— okay. But yes, that's my thing." → *Her group chat photographs skincare aisles and waits for her ingredient-level ruling before buying.*
**Angles:** admiration, i_sharing
**Defects noted (4–9):** 4 (categorical — a domain, not an occasion), but the "people come and ask" clause warrants the mastery through others' behavior, which surfaced a concrete instance in all three sims (summoned for broken spreadsheets; nine test drives for other people; caught a flood car by the smell of the carpet). The "no" option getting the better prompt, as specced — no impressive-gate because the expertise arrives pre-witnessed.

### `q6.1` (I'm not missing the must-see things) · fished · self_expansion · **FIX**
**Text:** "What's one must-see that was genuinely worth it, and one that absolutely wasn't?"
**Criteria failed:** 4 (one occasion — asks for two categorical verdicts, i.e. a review, not a story); 1 (partial — the protagonist of a review is the attraction; the answerer appears only as a rating).
**Simulated answers:**
- A (opinionated Vatican defender): "Worth it, the Vatican, actually, even with the crowds — I'm not religious and I still stood in the Sistine Chapel for forty minutes. Not worth it — the Mona Lisa. It's the size of a cereal box and you're looking at it through forty phones. I got more out of the gift shop."
- B (agreeable gasper): "Okay, worth it: the Cliffs of Moher. Genuinely gasped. Not worth it: Times Square, which I know isn't controversial… um. Yeah, I don't know, mostly things are kind of worth it? I like seeing the thing."
- C (rueful Pisa driver): "The Alhambra, worth every bit — I did the 6am slot, alone in the courtyards before the buses. Not worth it, the Leaning Tower of Pisa. It's a parking lot with a tower. I drove four hours for it. My own fault."
**Pitch attempts:** A → *She'll defend the Vatican to anyone and describes the Mona Lisa as "a cereal box behind forty phones"* (voice-only, works). B → unwritable: two generic ratings, no act, no distinctive phrasing — "she gasped at the Cliffs of Moher" is not a pitch. C → *He books the 6 a.m. Alhambra slot to beat the buses, and will admit the four-hour drive to Pisa was his own fault* (works — the behavior saves it). The modal answer is B: paired verdicts with no self in them.
**Rewrite:** "What's the farthest you've gone for a must-see? How did the day go?" → **Re-test:** "Rome — I did the Colosseum at opening, I'd bought tickets three months out, set two alarms, dragged my sister. And it was worth it, I stood where the floor used to be for like ten minutes before the tour groups arrived. Then it poured and we didn't care." → *She buys Colosseum tickets three months out and sets two alarms so she can stand where the floor used to be before the tour groups arrive.*

### `q6.2` (whatever's near where I'm staying) · fished · comfort · **PASS**
**Text:** "Tell me about a trip where the best part happened within three blocks of where you were staying."
**Evidence:** "Lisbon. There was a bakery literally under our Airbnb and by day two the guy just started handing me my order. We never made it to half the stuff on the list because mornings at that counter were the whole trip, honestly. I still think about the custard tarts. And the guy. Miguel." → *In Lisbon she never got past the bakery under the Airbnb — by day two Miguel had her order started before she reached the counter.*
**Angles:** comfort, i_sharing
**Defects noted (4–9):** 8 (mild — "the best part" is a superlative, though availability does the work); the three-block filter looks like a search-and-verify but isn't *for this tap* — these travelers' trips are already shaped this way, and 2 of 3 sims retrieved instantly (the third fumbled the filter for one beat, then landed). Would fail retrievability on the general population; passes conditioned on the option.

### `q6.3` (I walk until something happens) · fished · self_expansion · **PASS**
**Text:** "Tell me about a walk that turned into something. Where were you?"
**Evidence:** "This is small but — my own neighborhood? During the pandemic I started walking a different street each night and I found a little free library that only had thrillers, and I got into a note exchange with whoever stocks it. Never met them. Three years of notes." → *She's kept up a three-year anonymous correspondence with whoever stocks the thriller-only little free library she found on a walk.*
**Angles:** self_expansion, i_sharing
**Defects noted (4–9):** none. "A walk" (not "the best walk"), availability-cued, entry point handed ("where were you"), breach built into "turned into." All three sims protagonist-clean — the walking, finding, and joining are the answerer's acts even when a vivid third party appears (the salsa class, the tugboat captain).

### `q6.4` (I ask someone who lives there and go do that) · fished · self_expansion · **FIX**
**Text:** "Tell me about the best thing a local ever sent you to. Did you actually find it?"
**Criteria failed:** 2 (retrievability — "best…ever" demands a ranking across every trip they've taken); 8 (superlative gate).
**Simulated answers:**
- A (Oaxaca corner-describer): "In Oaxaca, our taxi driver — we asked where HE eats and he drove us to his cousin's. No sign, plastic chairs, a woman making tlayudas over coals. Finding it again the next day took two hours because there's no address. We just described the corner to people until someone pointed."
- B (napkin-map swimmer): "A bartender in Edinburgh drew me a map on a napkin to a swimming spot. I got very lost, it started raining, obviously, Scotland, and when I found it there were three old men swimming who acted like I was expected. I got in. It was freezing. Ten out of ten."
- C (ranking staller): "Best ever… I mean, there was a lady in Rome who sent us to her neighborhood gelato place and it was fine? Honestly I can't rank them. There was also a guy in Austin… I'll say the Rome one, I guess."
**Pitch attempts:** A → *In Oaxaca they asked the driver where he eats — no sign, plastic chairs, and two hours of describing a corner to strangers to find it again* (strong). B → *A napkin map from an Edinburgh bartender got him lost, rained on, and finally into freezing water with three unbothered old men* (strong). C → unwritable: the ranking stall ate the answer; "it was fine" contains nothing. The construct is the answerer's own best behavior — asking, hunting, finding — and the superlative is the only thing breaking it.
**Rewrite:** "Where did a local once send you? Did you actually find it?" → **Re-test:** "In Lisbon our host circled a fish place on a paper map. We walked forty minutes, it was closed — obviously — and the owner of the place next door saw us standing there and just… fed us. Whole fish, no menu, his choice." → *Followed a host's paper-map circle forty minutes to a closed restaurant — and ate whole fish, no menu, at the place next door whose owner took pity.*

### A5 · Fished — Q9, Q10, Q13 (13)

<!-- F5: fished Q9 (4) · Q10 (4) · Q13 (5) — 13 prompts. Verdicts: 8 PASS · 4 FIX · 1 KILL -->

### `q9.1` (I'm there at 6:50) · fished · comfort · **FIX**
**Text:** "What do you do with the ten minutes when you get somewhere early?"
**Criteria failed:** 4 (one occasion — habitual/categorical by construction), 9 (answerable in one sentence: "I scroll my phone" is a complete, modal answer the prompt does nothing to steer off)
**Simulated answers:**
- A (quiet planner, F, 29): "Um. Okay so I get the table. That's the main thing — I want the corner table, I don't want my back to the door, I sound like a mobster, I don't care. Then I read the menu like twice, so by the time they get there I can just talk, I'm not that person going 'mmm what am I getting.' And then honestly the last few minutes I'm just on my phone like everybody."
- B (self-aware, M, 31): "Honestly? I scroll my phone. Like I wish I had a better answer. Sometimes I answer my mom's texts, that's kind of the mom window? But yeah. Phone."
- C (chatty, F, 26): "I do this thing where I try to guess what everyone at the bar is drinking before I hear them order. I'm weirdly good at it now. Gin guys have a look. Also I always order a water for the other person so it's there when they sit down. Is that controlling? I think it's nice."
**Pitch attempts:**
- A → "Nora arrives ten minutes early to claim the corner table and pre-read the menu twice — by the time you sit down she's all conversation."
- B → unwritable: "scrolls his phone" characterizes no one.
- C → "Show up to meet Cass and there's already a water waiting at your seat — she spent her early ten minutes guessing strangers' drink orders, and she's right about the gin guys."
**Rewrite:** "Ten minutes early, every time. What's the ritual?" (8 words — names the pattern as a *ritual*, which licenses the micro-detail and forecloses "just my phone" as a complete answer.)
**Re-test:** "Ha, okay, the ritual. Corner seat, back to the wall. I text 'here, no rush' at exactly five till — not before, that's pushy. Then I pick what I'm ordering and a backup, because if they order my thing I'm not doing the same-order thing. It's a whole system. I've never told anyone this." → "Marcus has a whole early-arrival system — corner seat, a 'no rush' text at five-till sharp, and a backup order in case you take his first pick."
**Angles:** comfort, i_sharing

### `q9.2` (I'm there at 7) · fished · comfort · **KILL**
**Text:** "Who taught you to be on time?"
**Criteria failed:** 1 (protagonist — the teacher owns every vivid answer), 3 (pitchable — marginal at best), 6 (when nobody taught them, answers drift to feeling-talk)
**Simulated answers:**
- A (military kid, M, 33): "My dad, a hundred percent. Twenty years in the Navy. We were fifteen minutes early to everything my whole childhood — church, dentist, movies, we saw so many previews. He'd be in the driveway doing this one short honk at like 7:38 for an eight o'clock thing. I didn't know families arrived places on time-time until college. I thought everyone did the honk."
- B (band kid, F, 28): "Mr. Kowalski. Marching band. He locked the band room door when rehearsal started — locked it, you banged on the door and everyone watched you not get in. Once was enough. I've been early to everything since 2013 basically."
- C (self-taught, F, 26): "Nobody, honestly? I just — being late makes me feel insane. Like physically. I'd rather be twenty minutes early sitting in my car than three minutes late. I don't know where it came from. My whole family's late, actually, so maybe it's a rebellion thing…"
**Pitch attempts:**
- A → best available: "Ben grew up Navy-early — his dad's single warning honk at 7:38 sharp." Every noun belongs to dad; anything about Ben has to be inferred from the tap, not the story.
- B → unwritable: the locked door and the watching kids are Mr. Kowalski's material.
- C → unwritable: feeling-talk ("makes me feel insane"), no scene, no nouns.
**Replacement (same option, comfort):** "How do you actually pull off exactly-on-time? Walk me through the math."
**Re-test:** "So it's not luck, right — I know door-to-door is nineteen minutes if I make the light and twenty-two if I don't, so I leave at 6:37, and I keep one buffer minute for the elevator, because our elevator has moods. If I'm early I do a lap around the block. People think exactly-on-time is casual. It is the least casual thing I do." → "Sam walks in at 7:00 on the nose because he's done the math — nineteen minutes if he makes the light, plus one buffer minute for an elevator with moods."
**Angles (replacement):** comfort (reliability as rhythm), i_sharing (the system as humor register)

### `q9.3` (7:05, and I texted) · fished · fun · **PASS**
**Text:** "What's the thing that always makes you five minutes late?"
**Evidence:** "I'm fully dressed, keys in my hand, and then I look at the dishwasher and I'm like — you know what, now. Now is when I empty this. Every time. My roommate calls it my farewell chore." → "Jules is a reliable five minutes late because, keys in hand, she'll suddenly decide the dishwasher can't wait — her roommate calls it the farewell chore."
**Angles:** i_sharing (humor register), comfort (unguarded self-knowledge)
**Defects noted (4–9):** 4 — habitual "always," but the construct is a signature habit and every sim returned a concrete culprit with nouns (dishwasher, hair straightener, imaginary parking)

### `q9.4` (7:15, but I have a story) · fished · fun · **PASS**
**Text:** "Okay. Tell me the story."
**Evidence:** "I got on the express by accident — didn't notice till we blew past my stop, ended up two neighborhoods over, and there was a flower place right there by the station, so I just… committed. Bought the flowers. Walked in at 7:15 like this was the plan." → "Jess arrived at 7:15 with flowers from the neighborhood the express train accidentally took her to — sold as if it had been the plan all along."
**Angles:** i_sharing, self_expansion (improvisation under chaos)
**Defects noted (4–9):** none. Witness-risk was sim-checked (parades, loose dogs): tellers who tap this option put themselves in the action — cornering the dog, committing to the wrong neighborhood. Retrievability rides entirely on the tap, and the tap is an explicit story-commitment — the strongest T2 case in the map.

### `q10.1` (I say exactly what I think) · fished · admiration · **PASS**
**Text:** "Tell me about a time you said the hard thing to someone you love. How did it land?"
**Evidence:** "Round three with the same guy, and I finally said — I love you, and I can't do the pep talks this time. She didn't talk to me for like two months. And then she called me from outside his building with her stuff in bags, and I just went and got her." → "Sofia announced her retirement from the pep talks — and two months of silence later, she's the one who drove over when the call finally came, no told-you-so."
**Angles:** admiration (character proven), comfort (loyalty)
**Defects noted (4–9):** 5 (no entry point — answers start mid-saga); 8 mild (requires a confrontation on file, but the tap screens for exactly that person). Real risk worth pilot-watching: privacy instinct pushes ~1 in 3 answers to noun-free vagueness ("my brother, his drinking, it's better now") — unwritable; the other two carry the act and its consequence.

### `q10.2` (I say it once, then I'm supportive) · fished · admiration · **PASS**
**Text:** "Tell me about a time you said your piece once and then showed up anyway."
**Evidence:** "I told my sister once — one time, at the coffee place — I said I think this is a mistake and I'll never bring it up again. And then when they got the apartment I showed up with the truck. Carried that stupid green couch up three floors. He's… actually grown on me, which nobody tell her." → "Dan told his sister the ex was a mistake exactly once — then showed up with the truck and carried their green couch up three flights."
**Angles:** admiration, comfort
**Defects noted (4–9):** none significant. The contradiction (disagree + show up) is built into the construct, which is why it pitches so cleanly. Best prompt of the Q10 set.

### `q10.3` (I ask questions until they hear themselves) · fished · admiration · **FIX**
**Text:** "Tell me about a time you got someone to figure something out for themselves."
**Criteria failed:** 2 (retrievability — nobody indexes memories by their own conversational technique; the 5-second search fails), 5 (entry point), plus a tone hazard: the raw material arrives self-congratulatory ("I got them to see it"), which rule 1 can't use.
**Simulated answers:**
- A (younger brother, F, 30): "Um… I guess my little brother? With the dropping-out thing? I don't remember exactly how it went, I just kept asking him stuff instead of telling him stuff, and eventually he figured out he didn't hate school, he hated his major. I mean, he did that, not me. I just… asked?"
- B (vague, M, 27): "I do this all the time, it's kind of my thing. Like at work, or with my roommate — people mostly know their answer already, you know? So I just ask questions. I honestly can't think of one specific… it's more of a constant thing."
- C (rehearsed, F, 34): "My friend kept saying she was fine in her job and I kept going, okay, what does fine mean, what would Monday look like if you quit — and one day she goes, I'm applying to the nursing thing. She's a nurse now. I take zero credit. Ten percent credit."
**Pitch attempts:**
- A → borderline: "Rosa's brother is still in school because she asked questions instead of giving speeches" — no scene, no nouns beyond "brother."
- B → unwritable: categorical self-description, zero occasions.
- C → "Nia kept asking her friend what Monday would look like — enough Mondays that there's a nurse in the world now, for which Nia accepts ten percent credit."
**Rewrite:** "When did that actually work? Walk me through the conversation." (10 words — a direct continuation of the tapped option, which already carries the technique; anchors one occasion and one scene.)
**Re-test:** "Okay, the time it definitely worked — my brother, spring of his sophomore year, wanted to drop out. I never said don't. I just kept asking what Monday morning looks like if you do. Third time I asked the Monday question he goes, fine, I'll switch to nursing. He graduates in May. He still says I tricked him. I asked a question!" → "Nia never told her brother not to drop out — she just asked what Monday would look like until, three Mondays in, he switched majors; he still claims entrapment."
**Angles:** admiration, comfort

### `q10.4` (I keep my mouth shut and stay close) · fished · comfort · **PASS**
**Text:** "Tell me about a time you stayed close to someone through something you didn't agree with."
**Evidence:** "My best friend got really deep into an essential-oils thing — a sell-it-to-your-friends thing — and I thought it was a scam from day one. I decided I wasn't going to be the lecture. I went to one party. I bought the peppermint one. When she finally got out I never said a word. The peppermint one's still in my bathroom, actually." → "Kate thought the essential-oils thing was a pyramid from day one — she bought the peppermint one anyway, and it's still in her bathroom, told-you-so unsaid."
**Angles:** comfort (steadfastness), admiration (restraint as character)
**Defects noted (4–9):** 5 (entry point). Privacy-vagueness risk on heavier versions (a sibling's faith, a friend's divorce): one of three sims went noun-free; the modal answer keeps a concrete act of staying (the party attended, the airport drive).

### `q13.1` (outside before most people were up) · fished · self_expansion · **FIX**
**Text:** "Tell me about a morning outside that went exactly right. Where were you, and what time did you start?"
**Criteria failed:** 7 (breach foreclosed — "went exactly right" rules the wrongness out of bounds), 8 (gate — "exactly right" invites the highlight-reel version and demands a ranking search); plus guideline 9: the first sentence rebuilds a scene the tapped option already carries — story-elicitation §5's own worked example of the redundancy.
**Simulated answers:**
- A (kayaker, F, 31): "Two Saturdays ago. Cathedral Park put-in, I was on the water by like 5:40, and it was that glass-flat thing where the bridge is just… doubled. A harbor seal followed me for ten minutes. I kept pretending not to look at it. Playing it cool for a seal."
- B (runner, M, 28): "Saturday before last I did the butte at six. Fog the whole way up, kind of miserable honestly, and then I popped out the top right as it burned off and the whole valley was just — yeah. I stood there and let my coffee go cold in the thermos."
- C (generic, M, 34): "Honestly they're all kind of the same, and that's why I love it? Up at five-thirty, coffee, stoop, the neighborhood's empty. Every one of them goes exactly right — that's the whole point of it…"
**Pitch attempts:**
- A → "By 5:40 on a Saturday, Jo's kayak is under the bridge on glass-flat water, playing it cool for the harbor seal that's decided to follow her."
- B → "Nate climbs into the fog at six so he can be standing on top when it burns off — he'll let the coffee go cold for it."
- C → unwritable beyond "he likes quiet mornings": the perfection frame licensed a categorical answer — no occasion, no nouns.
**Rewrite:** "Which morning? Where were you, and what time did you start?" (11 words — the cut the theory doc itself prescribes; "which" points back into the last three Saturdays, so recency is legitimate and the ranking gate is gone.)
**Re-test:** "The Sauvie Island one. Rain all Friday night, so I wanted the six a.m. light for mushrooms — I was kneeling in wet leaves photographing this one chanterelle and a deer nearly stepped on me. We were both extremely embarrassed." → "Six a.m. after a night of rain, Mara was kneeling in wet leaves photographing a chanterelle when a deer nearly stepped on her — both parties embarrassed."
**Angles:** self_expansion, i_sharing

### `q13.2` (nothing on the calendar, and that was the point) · fished · comfort · **FIX**
**Text:** "Walk me through your best empty Saturday. What actually ended up happening?"
**Criteria failed:** 2 (retrievability — "your best" is a superlative ranking over a category nobody indexes; empty Saturdays blur by design), 8 (gate — "best")
**Simulated answers:**
- A (recent, F, 27): "Best… I don't rank them, that's the whole — okay, recently? Two weekends ago, I guess. Farmers market first thing, got the peaches, and then it kind of unraveled perfectly — I reorganized my bookshelf by color, which I SWORE I'd never do, and then Thai food and half a season of a show I won't name."
- B (stumped, M, 32): "The best one? Man. I don't know, they blur — that's kind of the point of them… Um. There was one where I made bread? Or was that a Sunday. I want to say I made bread and watched the whole extended Fellowship. That's a good day. I think that happened."
- C (defensive, F, 30): "They're all the best one, that's why I protect them. Like, people put stuff on my calendar and I'm like — no. No no no. Saturday is for nothing. I aggressively do nothing."
**Pitch attempts:**
- A → "Maya's empty Saturdays unravel on schedule: market peaches at eight, then the bookshelf she swore she'd never color-code, then Thai food and a show she won't name."
- B → borderline: "he thinks he once made bread during the extended Fellowship" is charming, but "I think that happened" is the retrievability failure speaking out loud.
- C → unwritable: a stance about calendars — zero occasions, zero nouns.
**Rewrite:** "Walk me through the last one. What actually ended up happening?" (11 words — "the last one" is licensed here because the item frame is literally the last three Saturdays.)
**Re-test:** "Last Saturday, okay. Slept till nine, which for me is insane. Made the fancy eggs. Then I was going to read outside, but my neighbor was repotting her monstera on the landing and somehow I repotted plants for two hours? I have dirt in my keyboard now. Worth it." → "Handed an empty Saturday, Priya made the fancy eggs, went out to read, and instead spent two happy hours elbow-deep in a neighbor's monstera."
**Angles:** comfort (rhythm-of-life), i_sharing

### `q13.3` (elbow-deep in something I was making or fixing) · fished · admiration · **PASS**
**Text:** "What are you making or fixing right now? Walk me through where it's at."
**Evidence:** "It's a 1978 Marantz receiver off Craigslist, twenty bucks because it 'hums.' It does hum. I've recapped the left channel, the right one's still on the bench — my kitchen table is the bench — and the hum is now more of a whisper, which I'm counting." → "Sam's kitchen table currently hosts a half-recapped '78 Marantz that hummed for its last owner and only whispers for him — dinner happens around it."
**Angles:** admiration (creation, mastery-in-progress), self_expansion
**Defects noted (4–9):** none — present tense makes it instantly retrievable, the answerer is the maker by construction, and "where it's at" opens the breach (the stuck part). The theory doc's own model prompt; the sims bear it out.

### `q13.4` (at someone's kitchen table too long) · fished · comfort · **PASS**
**Text:** "Whose kitchen table, and what keeps you there?"
**Evidence:** "My sister's. Every Saturday basically slides into it — I go over to 'drop something off' at four and I'm still there at nine. Her kids use me as furniture, her husband's always mid-experiment on some smoker thing we all have to have opinions on, and then everyone leaves and me and her do the actual talk while she pretends to clean." → "Saturdays, Rosa 'drops something off' at her sister's at four and is still there at nine — climbed on by nieces, consulted on smoker experiments, staying for the talk that only happens once the kitchen empties."
**Angles:** comfort (kinship, rhythm-of-life), i_sharing
**Defects noted (4–9):** 4 (habitual rather than one occasion — acceptable: the ritual *is* the construct, and answers arrive dense with nouns). Protagonist checked: the table's owner never displaces the answerer, whose staying is the story.

### `q13.5` (working, and not entirely mad about it) · fished · admiration · **PASS**
**Text:** "What's the part of your work you'd still do on a Saturday?"
**Evidence:** "The lamination. I run a bakery, so Saturday IS work — but if I won the lottery Monday I'd still come in Saturdays just to do the croissant fold. There's a moment where the butter's the exact right cold and the whole slab goes glassy. I'd do that for free forever. The spreadsheets can burn." → "Ana would keep her Saturday bakery shifts even after a lottery win — not for the spreadsheets, for the moment the butter goes glassy mid-fold."
**Angles:** admiration (work as creation — tone rule 6's home turf), self_expansion
**Defects noted (4–9):** 4 (asks for a category — "the part" — not an occasion; sims show the part arrives welded to concrete texture, and the tap guarantees recent instances). Pilot-watch: desk workers can go abstract ("the problem-solving part") — one of three sims skirted this and recovered via a specific Saturday.

### A6 · Fished — Q14, Q15, Q19, Q21 (16)

<!-- Fork F6 — fished prompts Q14 (6), Q15 (5), Q19 (1), Q21 (4). Method: 3 simulated modal answers per prompt → retrievability → protagonist → pitch attempt under the nine tone rules. -->

### `q14.1` (the art) · fished · i_sharing · **PASS**
**Text:** "Tell me about one thing on your walls. Where did it come from?"
**Evidence:** *"…the actual thing people ask about is the bull skull. My ex and I found it on a ranch road in Wyoming, and I made him put it in the trunk and it smelled — bad. I bleached it in the tub, which I do not recommend. He kept the couch, I kept the skull."* → "There's a bull skull over Maya's couch that she found on a Wyoming ranch road, hauled home in a trunk, and bleached in her own bathtub — the couch went to the ex; the skull stayed."
Also tested: a low-talker's answer (grandmother's not-very-good lake painting, driven cross-state seat-belted into the passenger seat, "the only thing I'd grab in a fire") pitches cleanly for comfort. Provenance stories of chosen objects are the answerer's taste plus the answerer's actions.
**Angles:** i_sharing, comfort
**Defects noted (4–9):** none — walls are mentally scannable (retrievable in ~5s), "where did it come from" singularizes and hands the entry.

### `q14.2` (a chair I overpaid for) · fished · i_sharing · **PASS**
**Text:** "Tell me about the thing you overpaid for and would do it again."
**Evidence:** *"It's real, that's the problem. Estate sale, the guy knew what he had. Six hundred dollars. I ate rice and beans for like a month. My friends clown me about it constantly and then they all fight over who gets to sit in it."* → "Jess paid an estate-sale dealer six hundred dollars for a real Eames chair and ate rice and beans for a month to cover it — her friends mock the purchase and then fight over the seat."
The tap IS the retrieval (they named the object in the option), "overpaid" builds the breach in, and defending the purchase produces contradiction for free. All three simulations (chair, mattress, Beyoncé resale) pitched.
**Angles:** i_sharing, fun
**Defects noted (4–9):** none

### `q14.3` (the gear — bike, skis, clubs) · fished · self_expansion · **FIX**
**Text:** "Tell me about the gear. What's the best day you've ever had on it?"
**Criteria failed:** 2 (retrievability — "best day you've EVER had" is a superlative ranking over years of days; the tap retrieved the *object*, not an episode)
**Simulated answers:**
- **A (talkative skier, 32):** "So the skis, they're these fat powder skis, orange, kind of ridiculous for Colorado ice most days. Best day... man. I mean there was a day at Steamboat two years ago, or — no, okay, the day I'll say is when it dumped two feet and work closed and my buddy and I skinned up before the lifts opened and had first tracks on the whole face. Legs were dead by ten. We ate gas station burritos in the car after."
- **B (quiet gravel cyclist, 27):** "The bike's a gravel bike, I built it up myself mostly. Best day, um... I don't know about best. I did a hundred miles once, that was probably it? It rained the last twenty and I was just laughing by the end because everything hurt. I don't know if it was fun but it was the best one."
- **C (golfer, heirloom clubs, 30):** "The clubs were my dad's, he regripped them when I got serious. Best day on them... probably the round with my dad and my uncle at the muni last Thanksgiving. I shot terribly, for the record. But my dad birdied the last hole and did this little putter twirl. Nobody talks about my score."
**Pitch attempts:** A → "When two feet closed his office, Nate skinned up Steamboat before the lifts opened, took first tracks on the whole face, and was cooked by 10 a.m. — gas-station burritos in the car as the victory meal." (strong) · B → "Kim built her gravel bike herself and once rode it a hundred miles, the last twenty in rain, laughing because everything hurt." (works) · C → weak — the vivid material (the birdie, the putter twirl, the regripping) all belongs to Dad; the answerer watched and shot terribly. Heirloom gear pulls third-party stories.
**Rewrite:** "The gear — tell me about a day on it you still bring up." (drops the superlative search and the ranking gate; keeps the episode ask; heads off the "best ever" stall visible in A and B) → **Re-test** (snowboarder, 29): *"There was this day at A-Basin in May, closing weekend, everyone's in costumes, and I hit the pond skim and actually made it across, which no one, including me, expected. There's a video. My friends still send it to me every May."* → "Every May, Dana's friends re-send the video of her clearing the A-Basin pond skim in costume — a crossing nobody, least of all her, expected to make."

### `q14.4` (an instrument) · fished · i_sharing · **PASS**
**Text:** "What do you play when nobody's around?"
**Evidence:** *"I'll play the same four songs. There's this fingerpicking thing, Blackbird, I've been trying to get right for literally six years and I only play it alone because I still mess up the middle. And sometimes I just make stuff up, little sad cowboy songs about my day. 'The dishwasher's broken again' but in a minor key."* → "Alone in his apartment, Jake has spent six years on the middle section of Blackbird and improvises minor-key cowboy ballads about his broken dishwasher."
Second simulation also landed: thirty-second piano drive-bys of childhood recital pieces, roommate's verdict "like living with a haunted house but in a nice way" — a ready-made quote asset.
**Angles:** i_sharing, comfort
**Defects noted (4–9):** 4 (habitual, not one occasion) — tolerated on the evidence: the "nobody's around" frame licenses the unpolished truth, and private-practice habits arrived carrying nouns, breach, and contradiction in all three simulations.

### `q14.5` (something I made) · fished · admiration · **PASS**
**Text:** "Tell me about the thing you made. How long did it take, and what went wrong?"
**Evidence:** *"It's a dining table. White oak. I told my girlfriend six weekends and it took seven months. I glued the top up in January and it was too cold so a seam popped and I had to rip the whole top apart with a heat gun. But we eat on it every night now and there's one wobbly leg I refuse to acknowledge."* → "Marcus told his girlfriend the white-oak table would take six weekends; seven months and one heat-gunned glue seam later, they eat on it nightly — one wobbly leg officially unacknowledged."
Even the terse simulation ("It's a shelf. It took a Saturday and it's crooked. I used a level. My theory is the wall is crooked.") pitches. Best-constructed fished prompt in this batch: tap pre-retrieves the object, duration + breach explicitly asked.
**Angles:** admiration, i_sharing
**Defects noted (4–9):** none

### `q14.6` (nothing, and I've never once thought about it) · fished · comfort · **PASS**
**Text:** "Forget the place then — where do you actually spend your time?"
**Evidence:** *"My apartment is where I sleep. I'm at the climbing gym probably four nights a week — same people every time, we don't even climb that hard anymore, we just talk with occasional climbing. And Sundays I'm at my brother's for dinner, his kids expect me."* → "Ray's apartment is mostly for sleeping — his actual addresses are a climbing gym four nights a week, where the climbing is now occasional, and his brother's Sunday dinner table, where the kids consider him a standing reservation."
**Angles:** comfort, i_sharing
**Defects noted (4–9):** 4 (categorical) and 7 (no breach) — tolerated: rhythm-of-life detail is precisely what the comfort angle feeds on, and all three simulations produced named places with texture (the coffee shop that knows the order, the buddy's garage, the aimless Evergreen drives). The non-object routing for this option is correct and works.

### `q15.1` (something that makes them laugh out loud) · fished · fun · **FIX**
**Text:** "Tell me about the gift that got the biggest laugh. What was it?"
**Criteria failed:** 2 (retrievability — "the BIGGEST laugh" is a superlative over every gift ever given; the tap committed a gifting *style*, not an episode)
**Simulated answers:**
- **A (fluent storyteller, 29):** "So my best friend is terrified of the Grinch. Genuinely. So for her birthday I commissioned — there's people on Etsy who'll paint anything — a Renaissance oil portrait of the Grinch holding her cat. She screamed. Then she laughed so hard she had to sit on the floor. It's in her bathroom now so guests get jump-scared."
- **B (average gifter, 27):** "Uh... biggest laugh. Hm. I got my roommate a — what did I... oh, I got him a body pillow with his own face on it. Classic. It's not that original, you see it online, but he lost it. He still has it. That's kind of it, it's a pillow with his face."
- **C (quiet, 33):** "I don't... hm. Biggest laugh. I guess the year I gave my dad a framed photo of the fish he SAID he caught, which was the stock photo from the news article, 'cause the real one got away. You kind of had to be there. He hung it up though."
**Pitch attempts:** A → "For a best friend with a genuine Grinch phobia, Sofia commissioned a Renaissance oil portrait of the Grinch holding the friend's cat — it now jump-scares guests from the bathroom wall." (excellent — the wit is authored by the answerer) · B → "Tom's proudest purchase is the body pillow printed with his roommate's own face — three years on, it remains in service." (writable but thin; borrowed internet gag) · C → "When her dad's trophy fish got away, June framed the news-article stock photo of it for his birthday — he hung it up." (works)
All three eventually pitch, but B and C stall visibly on the superlative and B's retrieval lands on the weakest available episode. Protagonist survives — the gag is authored by the giver even though the laugh belongs to the recipient.
**Rewrite:** "Tell me about a gift you gave that actually got the laugh." → **Re-test** (30, m): *"My sister's a lawyer and she's always saying 'per my last email,' so I had a doormat made that says PER MY LAST EMAIL. She sent me a photo of it outside her office door at the firm. Her boss asked where to get one."* → "Ben had a doormat printed with his lawyer sister's catchphrase — 'per my last email' — and it now guards her actual office door at the firm."

### `q15.2` (something I made) · fished · admiration · **PASS**
**Text:** "Tell me about something you made for someone. How did it turn out?"
**Evidence:** *"I made my grandma a quilt from my grandpa's flannel shirts after he passed. It took four months and I'd never quilted, so the corners don't meet anywhere. She didn't say much when she opened it, which scared me, but now she won't wash it because she says it still smells like him."* → "Emma taught herself quilting over four months to turn her late grandpa's flannels into a blanket for her grandma — no two corners meet, and her grandma refuses to wash it."
"Something" (not "the best thing") keeps retrieval cheap; "how did it turn out" invites the breach. The recipient's reaction appears but the making labor stays the spine — protagonist holds in all three simulations (quilt; wood-burned bar sign where 'Anchor' goes skinny at the end; the leaning tiered cake that "appears in group photos like a family member").
**Angles:** admiration, comfort, fun
**Defects noted (4–9):** none

### `q15.3` (the thing they mentioned once, months ago) · fished · admiration · **FIX**
**Text:** "Tell me about the best gift you ever gave. What did it take to pull off?"
**Criteria failed:** 2 (retrievability — "best gift you EVER gave" forces a superlative ranking; the tap committed an M.O., not one episode)
**Simulated answers:**
- **A (fluent, 32):** "Best ever... probably — okay, in March my boyfriend mentioned this specific hot sauce from a taco truck in Austin that closed. Mentioned it once. So for his birthday in October I tracked down the owner on Instagram — he'd moved to San Antonio — and paid him to make a batch and ship it. Five weeks of DMs. When he opened it he was so confused, like 'this doesn't exist.'"
- **B (29, m):** "Uh, best gift... I flew my mom's sister in from Ohio for her fiftieth. My aunt does not fly, so there was a whole train leg, and I had to lie to my mom for six weeks, which I'm terrible at. She opened the door and just started crying."
- **C (quiet, 27):** "Hmm. Best... I don't know about best. I made my friend a — no wait, that's not... Okay, one time my friend's cat passed away, and she'd mentioned way before that the only kitten photo of him was blurry. I found an artist who does pet portraits from bad photos. My friend keeps it on her nightstand."
**Pitch attempts:** A → "In March her boyfriend mentioned a hot sauce from a closed Austin taco truck; by October, Rachel had tracked the owner to San Antonio through Instagram DMs and commissioned a private batch." (killer — the listening M.O. demonstrated, not claimed) · B → "For his mom's fiftieth, Alex smuggled her non-flying sister in from Ohio — train leg included — while maintaining a six-week lie he calls the hardest part." (strong) · C → "When a friend once mentioned that the only kitten photo of her late cat was blurry, Mia found an artist who paints from bad photos." (works, after visible superlative stalling and one false start)
The construct is the best in Q15 — "what did it take to pull off" aims squarely at the answerer's work. Only the superlative is broken.
**Rewrite:** "Tell me about one you actually pulled off. What had they mentioned?" (the option text already carries the M.O., so the prompt can lean on it) → **Re-test** (31, m): *"My girlfriend mentioned in July that her favorite childhood book had this specific out-of-print cover. Found it on eBay from a seller in the UK, took two months to arrive, and it showed up smelling like someone's basement. She cried anyway. I did Febreze it first."* → "Nick spent months hunting the exact out-of-print cover of his girlfriend's childhood favorite — it arrived from the UK smelling of basement, and he Febrezed it before wrapping."

### `q15.4` (a day out, not an object) · fished · admiration · **PASS**
**Text:** "Tell me about a day you planned for someone else."
**Evidence:** *"For my girlfriend's birthday I did the thing where the whole day is planned but she doesn't know any of it — which stressed her out at first, she's a planner. Breakfast at the place with the good chilaquiles, the flower market she always says she wants to go to and never goes, then a pottery class, which was a gamble... she still has the bowl. It's terrible. We love it."* → "For her birthday, Chris ran a full itinerary his planner girlfriend wasn't allowed to see — chilaquiles, the flower market she always skips, and a gamble of a pottery class that produced a terrible, beloved bowl."
"A day," not "the best day" — retrieval was immediate in all three simulations; planners index their productions. The spreadsheet-bachelor-party simulation ("they made fun of the spreadsheet and then used the spreadsheet all day") pitches for fun.
**Angles:** admiration, comfort, fun
**Defects noted (4–9):** 5 (no explicit entry point) and 7 (breach not invited) — minor; every simulation supplied its own breach (the stressed planner, the non-golfing golfers).

### `q15.5` (I'm not a gift person — I'll be there, though) · fished · comfort · **PASS**
**Text:** "Tell me about a time you showed up for someone when it was genuinely inconvenient."
**Evidence:** *"My friend's boiler died in January, she has a baby, and I drove up to Fort Collins at nine p.m. with two space heaters and my air mattress and stayed the night 'cause her husband was traveling. It wasn't a big deal. I had work at seven the next day, that part sucked."* → "When a friend's boiler died in January, Sam appeared in Fort Collins at 9 p.m. with two space heaters and an air mattress, and made her own 7 a.m. shift anyway."
Show-up episodes are landmark-indexed (retrieved in ~5s across all three simulations), the cost-to-self is the breach, and the answerer is the agent by construction. The modest simulation still landed: loading a sister's third-floor walkup on the year's hottest day, then standing through a wedding that night "with visibly negotiable knees."
**Angles:** comfort, admiration
**Defects noted (4–9):** 8 (mild — requires a sacrifice episode) — tolerated: the tap ("I'll be there, though") is the answerer's own claim, and this prompt is the collection of it; the "no" option gets the better prompt, as the map intends.

### `q19` (verbatim template) · fished · self_expansion · **PASS**
**Text:** "You said you nerd out on {m9}. What pulled you in — and how deep does it go?"
**Evidence:** tested with three {m9} values — typed noun phrase ("sourdough"), stripped spoken answer ("Formula 1, like embarrassingly" — the trailing clause survives stripping and reads charmingly), and niche multi-word ("restoring old film cameras"). Sourdough: *"What pulled me DEEP was my fortieth loaf, it came out perfect and I could not reproduce it for eight months. I have a spreadsheet of hydration percentages. My starter has a name and a backup starter in the freezer. A backup. Like a will."* → "Somewhere around loaf forty, Hana baked a perfect sourdough she then chased for eight months — there's now a hydration spreadsheet, a named starter, and a frozen backup starter, 'like a will.'"
"What pulled you in" retrieves the origin occasion; "how deep does it go" licenses an escalating inventory of concrete evidence that is self-deprecating by construction — anti-braggy depth. The subject is current and pre-retrieved (they just told us about it). Strongest prompt in this batch.
**Angles:** self_expansion, i_sharing
**Defects noted (4–9):** none. (The fallback/stripping rules in the map §4 are load-bearing — keep them.)

### `q21.1` (my work gets serious) · fished · admiration · **PASS**
**Text:** "What are you building at work that you'd be annoyed to leave unfinished?"
**Evidence:** *"I run the newspaper at my school — I restarted it, it died in COVID. We're on issue six. The eighth graders do everything now, I just yell about deadlines. If I left before my eighth graders graduate the whole thing would fold, and honestly issue four had a real scoop about the cafeteria."* → "Beth resurrected her middle school's dead newspaper and has coached it to issue six — including issue four's genuine cafeteria scoop — while claiming her only role now is yelling about deadlines."
"Annoyed to leave unfinished" is a possession frame — it elicits ownership and stakes without "proudest." Even the vague-job simulation (sales ops) produced "the dashboard the whole team runs on is secretly powered by him hand-exporting a CSV every Monday — a Frankenstein he refuses to leave un-automated."
**Angles:** admiration, self_expansion
**Defects noted (4–9):** none serious; present-continuous project is a legitimate occasion form (same construct as `building_right_now` and `q13.3`).

### `q21.2` (my life gets full — people, a house, all of it) · fished · comfort · **KILL**
**Text:** "What does 'full' actually look like on a Tuesday five years from now?"
**Criteria failed:** 3 (pitchable — marginal at best on modal answers), 4 (no occasion — nothing happened; it's an imagined future), 7 (no breach possible — futures haven't gone wrong yet). This is the hypothetical trap with better set dressing: bank v2 deleted every prompt of this construct ("retrieves fantasy — no occasion, no nouns from the person's actual life"), and the "Tuesday" concretizer only decorates the fantasy.
**Simulated answers:**
- **A (warm, 30):** "Oh that's — okay. Tuesday. Um, there's a dog for sure. I get home and there's people over even though it's Tuesday? Like my sister just drops by. Kids maybe? I want a kitchen where people sit on the counter. Honestly it looks like my parents' house in the nineties, everybody's just around. Casserole energy. I don't know if that makes sense."
- **B (32, m):** "Five years... house, hopefully, I mean, interest rates, but. Full looks like — Tuesday, I coach something. Little league or whatever my kid's into if kids have happened. Grill's going even if it's a weekday. My buddies from now are still around — I don't want new friends, I want my idiots."
- **C (quiet, 27):** "Um. I guess... married? Or close to it. A house with a yard, we host Friendsgiving. Um. A big table. I want a big table. That's kind of it. God, this feels like a vision board out loud."
**Pitch attempts:** A → "Nora's five-year plan is a kitchen with people sitting on the counters — casserole energy." (a values statement with props, not a pitch; describes a wish, not behavior — tone rule 5 has nothing to show) · B → "Greg's five-year Tuesday has a weekday grill going and the same idiots he has now — he's not interested in upgrading friends." (the one salvageable line, and it comes from the answerer's voice, not the prompt's construct) · C → unwritable: a yard, a big table, Friendsgiving — a vision board, as she says herself; indistinguishable from the entire pool.
**Replacement (same option, tier stays comfort):** "Tell me about a night your place was actually full. Who was there?" (redirects the aspiration to its best past instance — the evidence that makes them want it; the want then arrives as a by-product of the detail) → **Re-test** (30, f): *"In March I hosted a make-your-own-pizza night that got out of hand — fourteen people in a one-bedroom, my coworker brought her mom? Someone's dough ended up on the ceiling and we left it there for a week as a monument. That's the thing I want more of."* → "In March, Nora's make-your-own-pizza night packed fourteen people and one coworker's mom into her one-bedroom — the ceiling dough stayed up for a week as a monument."

### `q21.3` (both, and I know how that sounds) · fished · admiration · **FIX**
**Text:** "How are you actually planning to do both? Asking sincerely."
**Criteria failed:** 4 (no occasion — asks for a plan, i.e. practices or futures), 7 (no breach). Not disqualified: the word "actually" pulled present-tense evidence in all three simulations, so pitches were writable — but the material is practice-flavored and story-free, and one simulation drifted protagonist (the vivid detail was Mom making partner with three kids and falling asleep at dinner; the answerer's own contribution was an abstract employment strategy).
**Simulated answers:**
- **A (31, m):** "Ha. Okay, sincerely: I don't fully know. My plan is I'm front-loading now — I work a lot NOW so when the family stuff starts I have the seniority to say no to things. Also I already have a rule, no-laptop Sundays. I stole it from my old boss who seemed happy."
- **B (29, f):** "My mom did both, that's the thing — she made partner with three kids, so I've seen it done. I also saw the cost, she'd fall asleep at dinner. My version is I'm picking a company now that I could stay at for ten years instead of job-hopping. That's the whole plan. Boring answer, sorry."
- **C (quiet, 34):** "Honestly? Calendar discipline. I schedule the personal stuff first now. Gym, my grandma's Sunday calls, dates — in the calendar like meetings. Work fills in around it. It sounds robotic. It works."
**Pitch attempts:** A → "Will's two-track plan is front-loading the career now and defending no-laptop Sundays he stole from the one boss who seemed happy." (decent) · B → borderline — leans on Mom's story for all its color · C → "Matt's answer to having-it-all is putting grandma's Sunday call on the calendar before any meeting can take the slot — robotic, he admits, and working." (decent)
**Rewrite:** "Tell me about a week you actually pulled both off." (forces an occasion; the tap — "both, and I know how that sounds" — is the answerer's own claim, so collecting a receipt is not an impressive-gate) → **Re-test** (30, f): *"Two weeks ago, actually — I closed the quarter, and it was also my niece's recital, and I did the thing where I left the office at four with everyone staring, watched her butcher Vivaldi beautifully, and finished the deck at eleven p.m. That's the deal I've made and I'll keep making it."* → "Erin closed the quarter and made the recital in the same week — out at four under stares, back on the deck at eleven — a trade she says she'll keep making."

### `q21.4` (I've stopped making five-year plans) · fished · self_expansion · **PASS**
**Text:** "What made you stop making plans — and what are you doing instead?"
**Evidence:** *"I just noticed none of my plans had ever happened. Like zero. The five-year plan from when I was 24 — I found it in my notes app — nothing on it happened, and the stuff that DID happen was better. So now I have a notes list called 'next' with three things on it. Currently: learn to make ramen from scratch, visit my brother in Portland, and get a dog."* → "Cole found his old five-year plan in his notes app, confirmed nothing on it had happened, and replaced it with a three-item list called 'next' — currently ramen from scratch, Portland, and a dog."
"What made you stop" points at a plan-breaking event, which is landmark-indexed (layoff + called-off wedding; a father's health scare deleting "someday" — both other simulations retrieved instantly and pitched). "What are you doing instead" grounds the answer in current concrete behavior. The strongest Q21 prompt.
**Angles:** self_expansion, comfort
**Defects noted (4–9):** none — handles even the heavy version gracefully (the health-scare answer closed on "it rained the whole time; great trip," an image, not sentiment).
