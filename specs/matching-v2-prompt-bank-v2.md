# Voice Prompt Bank v2 — audit and rewrite of `QUESTION_BANK`

**Why:** `specs/matching-v2-story-elicitation.md` established what makes a prompt produce a usable story. The 47 *fished* prompts (D-QD4) were written against those rules. **The 55-prompt bank in `src/lib/prompts.ts` was not** — it predates all of it, and a reader gets 6 prompts of which at most 3 are fished, so **the bank is the majority of every profile.**

**Audit result:** 17 pass · 30 need rewriting · **8 should be deleted.** Only about a third of the bank currently asks for material the pitch layer can use.

---

## 1. The rules being applied (story-elicitation §3, bank-applicable subset)

1. **Name one occasion.** If the prompt admits a plural or categorical answer, it gets one — and categorical answers contain no nouns.
2. **Hand them the entry point.** Say where to start.
3. **Ask for the thing, not the feeling.** Our tone rules forbid sentiment in the output, so feeling-talk generates material we cannot use.
4. **Ask for the breach.** "What went wrong / what surprised you" beats "what was it like."
5. **Never gate on being impressive or vulnerable.** "Proudest", "hardest", "best" are gates.
6. **Unanswerable in one sentence, answerable in 45 seconds.**

Two systemic failures run through the old bank:

- **The hypothetical trap.** "If you woke up in a different career…", "one person living or dead", "three things on a desert island" retrieve *fantasy*, not memory. Fantasy has no orientation, no complicating action, and no nouns from the person's actual life. Every one of these is a deletion.
- **The feeling gate.** "…that you're *proud of*", "what you *need* when", "something you're *grateful for*" make the person audit their emotions before they can answer, which is both slower and produces exactly the sentiment our tone rules ban.

---

## 2. Delete (8)

| id | why |
|---|---|
| `different_life` | pure hypothetical — retrieves a fantasy career, no occasion, no nouns |
| `perfect_evening` | "perfect" invites the aspirational version; hypothetical, so nothing happened |
| `values_test` | moralised frame; invites a virtue performance, which is the exact opposite of tone rule 1 |
| `grateful_for` | pure feeling, and scoped so small ("today") that no narrative fits |
| `relationship_lesson` | the most abstract item in the bank — retrieves a maxim, not a memory |
| `time_machine` | hypothetical; reliably retrieves a platitude ("stop caring what people think") |
| `celebrity_dinner` | retrieves a name and a justification. No story about the answerer at all |
| `three_things` | hypothetical list. Lists are not narratives |

---

## 3. Pass unchanged (17)

`show_someone_your_city` · `obsession` · `best_purchase` · `weekend_project` · `laugh_hardest` · `movie_scene` · `comfort_food` · `helped_someone` · `figured_it_out` · `building_right_now` · `love_language_real` · `safe_place` · `morning_person` · `conspiracy` · `worst_date` · `superpower` · `most_me_photo`

`laugh_hardest` ("Tell us about the last time you laughed so hard you couldn't breathe — who was there, what happened") and `morning_person` ("the real one, not the aspirational one") are the two best-constructed prompts in the existing bank and should be the model for the rewrites.

`conspiracy` and `superpower` are hypotheticals that survive on **fun-tier latitude** — they reveal humour register, which is `i_sharing` material, and the fun tier's job is different.

---

## 4. Rewrites (30)

Format: **id** — ~~old~~ → new. IDs held stable where the construct survives, so tier assignment and any existing memo rows stay meaningful.

### self_expansion
- **rabbit_hole** — *"What's a rabbit hole you've gone down recently that you can't stop thinking about?"* → **"What's the last rabbit hole you went down? Start at whatever made you look it up."**
- **taught_yourself** — *"…that you're proud of?"* → **"What's something you taught yourself with no one to ask? Tell me about the part where you had no idea what you were doing."**
- **changed_your_mind** — *"What's something you used to believe that you've completely changed your mind about?"* → **"What's something you used to believe and don't anymore? I want the moment it started to go."**
- **side_quest** — → **"What's a side quest you ended up on recently? Start where you got pulled off course."**
- **unpopular_take** — *"Give us your most unpopular opinion."* → **"What's the take you've had to defend out loud? Tell me about the last time it came up."**
- **bucket_list_done** — *"What's something you've actually checked off your bucket list?"* → **"What's something you'd been saying you'd do for years and then finally did? How did the actual day go?"**
- **world_expert** — *"What topic could you give a 20-minute talk on with zero preparation?"* → **"What do people come to you about? Tell me about the last time someone did."**

### i_sharing
- **gives_you_chills** — *"What's something that gives you actual chills?"* → **"When's the last time something gave you actual chills? Where were you?"**
- **notice_first** — *"When you walk into a room, what do you notice first?"* → **"Think about the last new place you walked into. What did you clock first?"**
- **guilty_pleasure** — → **"What's the thing you enjoy that you'd have to explain? Tell me about the last time you did it."**
- **weird_habit** — *"…that you've never been able to explain?"* → **"What's a habit of yours someone has actually commented on? What did they say?"**
- **song_on_repeat** — *"What song have you had on repeat lately and why?"* → **"What have you had on repeat lately? Where do you usually end up listening to it?"**
- **pet_peeve** — *"…that tells people a lot about you?"* → **"What's a small thing that bothers you more than it should? When did it last get you?"**
- **ick_or_green_flag** — *"What's a surprisingly specific green flag in a person?"* → **"When's a time you decided you liked someone in about four seconds? What did they do?"**
- **dealbreaker_funny** — → **"What's a small thing you've genuinely held against someone? Be honest about how petty it was."**

### admiration
- **bet_on_yourself** — *"…and it worked out."* → **"Tell me about a time you bet on yourself. It doesn't have to have worked."**
- **hardest_thing** — *"What's the hardest thing you've done that you're glad you did?"* → **"What's something you got through that you weren't sure you would? Start at the worst part."**
- **proud_of_someone** — *"Who are you most proud of and why?"* → **"Who's someone in your life you'd brag about? What did they pull off?"**
- **against_the_grain** — *"When's a time you went against what everyone expected of you?"* → **"When's a time you did the thing nobody around you would have picked? What did they say?"**
- **failure_lesson** — *"…that taught you something you couldn't have learned any other way?"* → **"Tell me about something you got badly wrong. How long did it take to admit it?"**
- **mentor_moment** — *"Who's someone who changed the way you see the world?"* → **"Who told you something that stuck? Where were you when they said it?"**
- **secret_talent** — *"What's a talent you have that would surprise people who just met you?"* → **"What are you unexpectedly good at? Tell me how you found out."**
- **getting_better_at** — → **"What are you actively bad at and still doing? How's it going this week?"**

### comfort
- **recharge** — *"How do you recharge after a really long week?"* → **"Think of the last week that wrecked you. What did the next day actually look like?"**
- **close_people** — *"How would your closest friend describe you when you're at your best?"* → **"What's your oldest friend always giving you a hard time about?"**
- **disagree_well** — *"How do you handle it when you disagree with someone you care about?"* → **"Tell me about the last real disagreement you had with someone you love. How did it end?"**
- **hard_day** — *"What do you need from someone when you're having a hard day?"* → **"Think of a bad day someone got right. What did they actually do?"**

### fun
- **irrational_fear** — → **"What's an irrational fear you have? Tell me about the last time it got you."**
- **apocalypse_skill** — *"In a zombie apocalypse, what's the one skill you bring?"* → **"What's the useful thing you can do that nobody expects? When did it last come in handy?"**
- **dating_confession** — *"What's something you're a little nervous about when it comes to dating?"* → **"What's the part of a first date you're actually bad at? Tell me about one that went that way."**

---

## 5. Replacements for the 8 deletions

Same tiers, so the tier weights in `getOnboardingPrompts` don't change.

| new id | tier | text |
|---|---|---|
| `last_new_place` | self_expansion | **"Where's the last new place you went, however small? How did you end up there?"** |
| `slow_tuesday` | i_sharing | **"Describe a completely ordinary evening at your place that went exactly right. Start with what you ate."** |
| `stood_up_for` | admiration | **"When's a time you said something inconvenient because it was true? How did the room take it?"** |
| `small_repair` | comfort | **"What's something in your life you keep quietly maintaining? Walk me through the last time you did it."** |
| `learned_from_someone` | comfort | **"Who taught you something you still do their way? What is it?"** |
| `first_job` | fun | **"What was your first job and what were you bad at?"** |
| `overpacked` | fun | **"What's something you always bring that nobody else does? When did it last pay off?"** |
| `bad_at_pretending` | fun | **"What are you visibly bad at hiding? When did it last give you away?"** |

---

## 6. Help text and example answers

**Help text rule changes** (story-elicitation M3): the current help text reassures about *scope*. It should give permission for **triviality**, which is what actually recovers concrete detail. New default across the bank:

> **"The small stuff is the good stuff — the more specific, the better."**

**Example answers stay on bank prompts** (fished prompts carry none — an example under a prompt written about someone's own answer steers them off their story). But every example must now itself pass the six rules — several currently model exactly the behaviour we're trying to prevent. `recharge`'s example is *"No alarm, coffee on the porch, zero plans. That's how I come back to life."* — a summary with a sentiment close, modelling the wrong thing twice over. Rewrite every example alongside its prompt.

---

## 7. Consequences

1. **Bank goes 55 → 55** (8 deleted, 8 added), so `ONBOARDING_WEIGHTS` and tier balance are unchanged.
2. **`PromptDef` is unchanged.** This is a content change, not a schema change.
3. Any memo already recorded against a deleted id keeps its transcript; the id simply stops being offered. Rewritten ids keep their id, so **`prompt_version` should be added to `voice_memos`** to distinguish v1-worded from v2-worded answers in analysis.
4. **This is the highest-leverage change to story quality available**, and it costs nothing at runtime — the bank supplies at least half of every profile, and a third of it was asking for material the pitch layer cannot use.
5. Sample pitches (D-QD3) are **parked** until subjects are built from real story material rather than an invented bullet list — Charles, 2026-08-24: *"we need to inject the story content, right?"*
