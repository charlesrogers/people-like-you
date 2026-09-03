# Questionnaire Deep Dive — Three Competing Batteries (V2-T0, step 2)

**Charter:** `specs/matching-v2-questionnaire-deep-dive.md` §6.2 — "draft 2–3 competing full batteries in distinct voices; the competition is the taste instrument."
**Research basis:** `specs/matching-v2-questionnaire-research.md` (read that first — it is why the structure changed from the sketch).
**Status:** DRAFT. Nothing here is frozen. Charles picks the voice inline, then we go item by item.

Same 22 items, same constructs, same option semantics in all three. **Only the skin differs.** Option *meaning* is index-stable across voices, so switching voice is a copy change, never a scoring change.

- **Voice A — Playful.** Group-chat energy. Fragments, lowercase-ish rhythm, the joke is in the specificity. Most screenshot-able, most risk of reading young.
- **Voice B — Warm-sincere.** Second person, unhurried, generous. Reads like a friend who is actually curious. Lowest risk, least distinctive.
- **Voice C — Dry.** Deadpan, concrete, understated. Closest to the existing PLY intro voice ("boredom is a skill issue") and the landing page. Highest ceiling, hardest to keep warm.

---

## 0. Envelope and structure

| | |
|---|---|
| items | **22**, or 23 with the optional second N item (envelope ~23 ±3 → in range either way) |
| screens | 22 item screens + 6 zero-tap block cards + 1 intro + 1 close |
| format | one item per screen, single tap auto-advances, persistent back affordance |
| estimated time | ~3.5 min (22 × ~9 s, research R6) |
| required / skippable | 19 required · 3 skippable (Q1 tribe, Q18 free text, Q20 politics) |
| typing | exactly one item (Q18, ≤120 chars) |
| reversed wording | none. Straightline protection = randomised option-order polarity on the 12 trait items |

**Block order** (research trap 4): identity → wired → actual life → how you talk → free text → facts, politics last.

| block | screen card | items |
|---|---|---|
| 1 · Identity | "Start with who you've been." | Q1–Q3 |
| 2 · Wired | "Now how you're built." | Q4–Q11 |
| 3 · Actual life | "What your weeks actually look like." | Q12–Q14 |
| 4 · How you talk | "How you come across." | Q15–Q17 |
| 5 · One thing | — | Q18 |
| 6 · Facts | "Two minutes of boring, then you're done." | Q19–Q22 |

**Construct budget** (research R1 — O is the weakest trait in every short form and H1 needs it, so O gets the most clean items):

| trait | dedicated items | double-scored milieu items | total indicators |
|---|---|---|---|
| O | Q4, Q5, Q6 | — | 3 |
| E | Q7, Q8 | Q2, Q3 | 4 |
| C | Q9 | Q12, Q13 | 3 |
| A | Q10 | Q14 | 2 |
| N | Q11 | — | **1 — see decision N below** |

No trait is carried by a double-scored item alone. Remaining items: 8 milieu (Q1–Q3, Q12–Q14 double-duty, plus Q19–Q20 facts), 3 conversation/register (Q15–Q17), 1 free text (Q18), politics + toggle (Q21–Q22).

**Open decision N:** the battery as written has **one** N item, which cannot be checked for reliability at all. The envelope allows 23. Adding `T-N2` below takes N to 2 indicators at a cost of ~9 seconds.

> **Q11b · `T-N2` — something goes sideways · N**
> A: **Something goes sideways:** · B: **When something goes wrong, you…** · C: **Something goes sideways.**
> 1. very little gets me / you stay pretty level / very little rattles me
> 2. I go quiet and handle it / go quiet and take care of it / go quiet, handle it
> 3. I feel it, then I move / feel it, then move / feel it, then move
> 4. I feel every inch of it / feel it all the way through / I feel all of it

---

## 1. The battery

Legend — `id` · construct(s) · `[skip]` = skippable · `↦` = feeds. Options are listed **low→high on the scored trait**; presentation order is polarity-randomised for trait items.

---

### Q1 · `M1` — teenage tribe · milieu `[skip]`
↦ milieu exact-match term · voice prompt · pitch material

| | |
|---|---|
| **A** | **Sixteen-year-old you was, let's be honest…** |
| **B** | **At seventeen, most people would have called you…** |
| **C** | **At seventeen you were, on the record…** |

| # | A (playful) | B (warm-sincere) | C (dry) |
|---|---|---|---|
| 1 | the drama kid | the one on stage | theatre kid |
| 2 | the athlete | the one at practice | jock |
| 3 | the one with the grades | the one with the grades | honor-roll grinder |
| 4 | the one who made the plans | the one everyone's plans went through | the one organizing the hang |
| 5 | happily doing my own thing | off to the side, and happy there | happily unaffiliated |
| 6 | unrecognizable from who I am now | someone you barely recognize now | a completely different person |

> **Trap 5 answer.** Option 6 is a first-class answer, not an escape hatch — it is milieu signal (reinventors recognise each other) and it produces the best voice prompt in the set ("What changed?"). Item is skippable for anyone whose seventeen was bad.

---

### Q2 · `M2` — group-chat role · milieu + E (double-scored)
↦ milieu · E · humour material for `i_sharing`

| | |
|---|---|
| **A** | **Your role in the group chat** |
| **B** | **In your closest group chat, you're the one who…** |
| **C** | **Group chat, your role** |

| # | A | B | C |
|---|---|---|---|
| 1 | lurks, then lands one line | reads everything, says the right thing once | mostly reads, occasionally devastates |
| 2 | asks the question that derails everything | asks how someone's actually doing | asks the real question |
| 3 | voice notes. long ones. | sends the long voice note | voice-note monologuist |
| 4 | certified meme delivery | sends the thing that makes everyone laugh | sends the memes |
| 5 | makes the plans, chases the RSVPs | makes the plan happen | makes the plans |

---

### Q3 · `M3` — wedding, 10pm · milieu + E (double-scored)
↦ milieu · E · voice prompt · pitch material

| | |
|---|---|
| **A** | **It's 10pm at a wedding. Where are you?** |
| **B** | **Ten o'clock at a wedding — where would we find you?** |
| **C** | **Wedding, 10pm** |

| # | A | B | C |
|---|---|---|---|
| 1 | in the car. great night. bye. | already home, and glad you went | home already, no regrets |
| 2 | side table, deep in it with someone | at a side table in a real conversation | the good conversation at the side table |
| 3 | outside, organizing the sparklers | outside getting the sparkler exit organized | running the sparkler exit |
| 4 | dance floor. have been since song one. | on the dance floor since the first song | dance floor since song one |

---

### Q4 · `T-O1` — plan changes · **O**
↦ H1 targeting · pitch material

| | |
|---|---|
| **A** | **The plan changes an hour before. You:** |
| **B** | **A plan you were looking forward to changes an hour before.** |
| **C** | **Plan changes an hour out.** |

| # | A | B | C |
|---|---|---|---|
| 1 | are quietly devastated | it takes you a while to recover | that's my whole evening, then |
| 2 | go, but I'm mourning the old plan | you go, but you liked the first one better | fine. I liked the old one. |
| 3 | shrug. adapt. | you adjust and don't think about it | adapt, move on |
| 4 | honestly? thrilled. | you like the new one more | secretly delighted |

---

### Q5 · `T-O2` — last new thing · **O** (frequency-anchored)
↦ H1 targeting · `self_expansion` signal

| | |
|---|---|
| **A** | **Last time you tried something you'd never done before:** |
| **B** | **When did you last do something you'd never done before?** |
| **C** | **Last brand-new thing you tried:** |

| # | all three voices |
|---|---|
| 1 | I'd have to think about it |
| 2 | sometime this year |
| 3 | this month |
| 4 | this week |

---

### Q6 · `T-O3` — how you take in something new · **O**
↦ H1 targeting · pitch material

| | |
|---|---|
| **A** | **Someone hands you a book/album/idea you'd never have picked. You:** |
| **B** | **A friend gives you something you'd never have chosen yourself — a book, an album, an idea.** |
| **C** | **Handed something you'd never have picked yourself:** |

| # | A | B | C |
|---|---|---|---|
| 1 | say thank you. do not engage. | you say thank you and leave it there | thank you, and that's where it ends |
| 2 | get to it eventually | you get to it eventually | I'll get to it |
| 3 | try it that week | you try it that week | I'll try it this week |
| 4 | am already three hours in | you're three hours in before you look up | three hours in before I look up |

---

### Q7 · `T-E1` — recharge · **E**
↦ H2 targeting · `comfort` vs `i_sharing` signal

| | |
|---|---|
| **A** | **Three straight days of people. Day four looks like:** |
| **B** | **After three days of being around people, you need…** |
| **C** | **Three days of people. Day four:** |

| # | A | B | C |
|---|---|---|---|
| 1 | a locked door and no plans | a full day to yourself | door closed, phone off |
| 2 | one quiet evening and I'm back | one quiet evening | one quiet evening resets me |
| 3 | normal. I'm fine. | nothing in particular | I'm fine |
| 4 | who's free? | more people, honestly | I want more |

---

### Q8 · `T-E2` — party where you know one person · **E**
↦ H2 targeting · pitch material

| | |
|---|---|
| **A** | **A party where you know exactly one person:** |
| **B** | **You're at a party and you know exactly one person there.** |
| **C** | **Party. You know one person.** |

| # | A | B | C |
|---|---|---|---|
| 1 | find them. stay there. thriving. | you find them and stay put, happily | find them, stay put |
| 2 | orbit them, meet a couple people | you orbit them and meet a couple of people | orbit, meet two or three |
| 3 | make one actual new friend | you make one real new friend | make one real new friend |
| 4 | leave having talked to everyone | you leave having talked to nearly everyone | end up talking to the whole room |

---

### Q9 · `T-C1` — the calendar · **C**
↦ milieu pace · pitch material

| | |
|---|---|
| **A** | **Your calendar:** |
| **B** | **How does your calendar actually work?** |
| **C** | **The calendar:** |

| # | A | B | C |
|---|---|---|---|
| 1 | it's all in my head and that's working | you keep it all in your head | lives in my head |
| 2 | it exists, technically | it exists in theory | exists in theory |
| 3 | it's real, we negotiate | it's real, and you negotiate with it | real, and we negotiate |
| 4 | it is real and I obey it | it's real and you follow it | real, and I obey it |

---

### Q10 · `T-A1` — someone you love is having a bad day · **A**
↦ `comfort` angle signal · premium pitch material

| | |
|---|---|
| **A** | **Someone you love is having a bad one. Instinct:** |
| **B** | **Someone you love is having a hard day. Your first instinct is to…** |
| **C** | **Someone you love is having a bad day. First instinct:** |

| # | A | B | C |
|---|---|---|---|
| 1 | fix it | help them solve it | fix it |
| 2 | give them room, check back tonight | give them space and come back later | give them room, come back later |
| 3 | make them laugh | get them laughing | make them laugh |
| 4 | sit in it with them | sit with them in it | sit in it with them |

> Ordinal only by convention (1→4 = fixing → attunement). All four options are equally likeable by design (trap 2). This is the single best pitch item in the battery.

---

### Q11 · `T-N1` — replay · **N**
↦ exploratory: `comfort`-angle hypothesis · pitch material

| | |
|---|---|
| **A** | **A conversation that mattered. You replay it:** |
| **B** | **After a conversation that really mattered, how long do you think about it?** |
| **C** | **Conversation that mattered. You replay it:** |

| # | A | B | C |
|---|---|---|---|
| 1 | not really — it's done | you don't, much | it's done when it's done |
| 2 | once, maybe | once | once |
| 3 | that night | that night | that night |
| 4 | for days | for days | for days |

---

### Q12 · `M4` — last three Saturdays · milieu + C (double-scored)
↦ milieu · voice prompt · pitch material

| | |
|---|---|
| **A** | **Your last three Saturdays, honestly:** |
| **B** | **Think about your last three Saturdays. Mostly they looked like…** |
| **C** | **Last three Saturdays, mostly:** |

| # | A | B | C |
|---|---|---|---|
| 1 | trailhead by 8am | outside early | trailhead by 8am |
| 2 | slow brunch, long book | a slow morning and a long read | slow brunch, long read |
| 3 | a project with my hands | something you were building or fixing | a project with my hands |
| 4 | someone's kitchen, no agenda | at someone's place with no agenda | someone's kitchen, no agenda |

---

### Q13 · `M6` — travel · milieu + C (double-scored)
↦ milieu · voice prompt · pitch material

| | |
|---|---|
| **A** | **Travel, your version:** |
| **B** | **How do you travel?** |
| **C** | **Travel:** |

| # | A | B | C |
|---|---|---|---|
| 1 | the spreadsheet is half the fun | planning it is half the joy | the itinerary is the fun |
| 2 | book the flight, figure it out there | book the flight and work it out there | booking the flight is the whole plan |
| 3 | I go where someone else planned it | happily along for someone else's plan | I go where I'm invited |
| 4 | I mostly don't, and I'm good | not much, and that's fine | I don't, much |

---

### Q14 · `M8` — the gift you'd give · milieu + A (double-scored)
↦ milieu · voice prompt · premium pitch material

| | |
|---|---|
| **A** | **The gift you'd actually give:** |
| **B** | **The best gift you'd give someone is…** |
| **C** | **A gift from you looks like:** |

| # | A | B | C |
|---|---|---|---|
| 1 | something that makes them laugh | something that makes them laugh | something hilarious |
| 2 | something you made | something you made yourself | something handmade |
| 3 | the thing they mentioned once, six months ago | the thing they mentioned once, months ago | the thing they mentioned once |
| 4 | an experience, not a thing | a day out, not an object | an experience, not a thing |

---

### Q15 · `M5` — how affection comes out · **register** (playful/earnest)
↦ register derivation (§6.4) · pitch material

| | |
|---|---|
| **A** | **How you show someone you like them:** |
| **B** | **When you like someone, how does it come out?** |
| **C** | **How affection comes out of you:** |

| # | A | B | C | → register |
|---|---|---|---|---|
| 1 | relentless teasing | you tease them | teasing | playful |
| 2 | dry, deadpan — they either catch it or they don't | dry humour they have to catch | deadpan; they catch it or they don't | playful |
| 3 | I just say it | you say it plainly | I say it straight | earnest |
| 4 | depends how well I know them | it depends how well you know them | depends on the person | → CS1 tiebreak |

---

### Q16 · `CS1` — the first good conversation · register tiebreak

| | |
|---|---|
| **A** | **The first good conversation you'd want:** |
| **B** | **What would a great first conversation feel like?** |
| **C** | **First conversation you'd want:** |

| # | A | B | C | → |
|---|---|---|---|---|
| 1 | banter that sneaks up on something real | jokes that turn into something real | banter that finds depth | playful |
| 2 | something real that turns funny | something real that gets funny | depth that finds jokes | earnest |

---

### Q17 · `CS2` — storyteller or asker · logged

| | |
|---|---|
| **A** | **In conversation you're more:** |
| **B** | **In a conversation, are you more…** |
| **C** | **In conversation, more:** |

| # | all three |
|---|---|
| 1 | the storyteller |
| 2 | the question-asker |
| 3 | genuinely depends who I'm with |

---

### Q18 · `M9` — free text `[skip]` · ≤120 chars
↦ voice prompt seed (templated verbatim) · premium pitch material

| | stem | placeholder |
|---|---|---|
| **A** | **What do you nerd out about?** | be specific. "music" is not an answer. |
| **B** | **What's the thing you could talk about for an hour without noticing?** | the more specific, the better |
| **C** | **What do you nerd out on?** | specific beats impressive |

---

### Q19 · `H1` — education · milieu (eduAdjacency)

| | |
|---|---|
| **A** | **School situation:** |
| **B** | **How far did you take school?** |
| **C** | **Education:** |

| # | all three |
|---|---|
| 1 | high school |
| 2 | some college |
| 3 | bachelor's |
| 4 | grad school or beyond |

---

### Q20 · `H3` — what you're building · milieu (H3 term)

| | |
|---|---|
| **A** | **Right now you're building:** |
| **B** | **What are you building right now?** |
| **C** | **Right now you're building:** |

| # | A | B | C |
|---|---|---|---|
| 1 | a career I actually care about | a career you care about | a career I care about |
| 2 | a family | a family | a family |
| 3 | genuinely both | genuinely both | genuinely both |
| 4 | something I couldn't name yet | something you couldn't name yet | something I couldn't name yet |

---

### Q21 · `H2` — politics position `[skip]` · milieu + optional hard filter

| | |
|---|---|
| **A** | **Politically, roughly:** |
| **B** | **Roughly where do you land politically?** |
| **C** | **Politically, roughly:** |

| # | all three |
|---|---|
| 1 | progressive |
| 2 | lean progressive |
| 3 | somewhere in the middle |
| 4 | lean conservative |
| 5 | conservative |
| — | *rather not say* (skip) |

---

### Q22 · `H2b` — does the gap matter · **hard-filter toggle**

| | |
|---|---|
| **A** | **Does a big gap here matter to you?** |
| **B** | **Would a big gap here be hard for you?** |
| **C** | **Does a big gap here matter?** |

| # | all three |
|---|---|
| 1 | not something I'd rule someone out for |
| 2 | honestly, I'd struggle with someone far from me on this |

> **Documented mechanics-leakage exception (trap 6).** Sub-copy, all voices: *"Picking the second one means we won't introduce you to someone more than two steps away."* You cannot consent to a hard filter without being told what it does. The word "dealbreaker" never appears.

---

## 2. Framing copy

| surface | A (playful) | B (warm-sincere) | C (dry) |
|---|---|---|---|
| intro | "Twenty-two questions. No right answers, and nobody sees your score — because there isn't one." | "A few questions so we know how to introduce you. Nothing here is graded, and none of it is shown to anyone as a score." | "Twenty-two questions. No score, no percentage, nothing to optimise." |
| honesty line (research R9) | "Answer like the person who's going to show up to the date." | "Answer as the person who'll actually be sitting across the table." | "Answer as the person who shows up." |
| block card 1 | "Start with who you've been." | "Let's start with who you've been." | "Who you've been." |
| block card 2 | "Now how you're built." | "Now, how you're built." | "How you're built." |
| block card 3 | "What your weeks actually look like." | "What your weeks actually look like." | "What the weeks look like." |
| block card 4 | "How you come across." | "How you come across." | "How you come across." |
| block card 6 | "Two minutes of boring, then you're done." | "A few plain ones, then you're done." | "The boring part. Then you're done." |
| skip affordance | "skip this one" | "skip this one" | "skip" |
| close (payoff — compensates for D7) | "Done. Next part's better — you get to talk." | "That's it. Next we'll ask you about a couple of things you just told us, and you get to answer out loud." | "Done. Next: three questions, out loud, about things you just told us." |

---

## 3. What is NOT in here yet

D-QD2 scoring spec · D-QD3 16 sample pitches · D-QD4 full voice-prompt map · D-QD5 UX flow spec · D-QD6 pilot protocol · D-QD7 item analytics · D-QD8 approval checklist · D-QD9 waitlist variant. All authored after the voice and the four structural calls are settled.
