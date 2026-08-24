# Prompt Set v3 — the remarkability pass

## 35 kept · 59 lifted · 8 recast. 67 of 102 prompts changed.

**Commissioned by:** Charles, 2026-08-24, correcting the first review —
> *"these stories are all about finding something **remarkable** to write about our people. can the output of these stories help you pitch someone in a **highly attractive** way? that is the gordian knot. also these need to be **fun**."*
> *"but also, keep your extractable heuristic."*

**Supersedes** the verdicts in `specs/prompt-review-findings.md` (which stands as the structural audit and the evidence trail). **Status: awaiting Charles's POV. Not yet applied to `src/lib/prompts.ts`.**

---

## 1. What changed about the test

The first review graded **extractability** — can the pitch layer get a usable sentence out of the modal answer. That screened out prompts producing *unusable* material and said nothing about whether the usable material was *worth reading*. "Nora arrives ten minutes early to claim the corner table" is protagonist-clean, retrievable, tone-rule-legal, and about nobody.

So the test is now **two-storey, and both storeys are load-bearing**:

**Floor — the nine structural criteria.** Unchanged, still disqualifying: protagonist (the answerer owns the verbs), retrievability (no superlatives; "the last" only when live / high-frequency / landmark-marked), pitchable.

**Bar — remarkability and fun.** Applied to the modal answer's pitch sentence:
1. **Surprise** — something a stranger wouldn't predict, or exactly what you'd assume from the category?
2. **Only-this-person** — could this sentence be written about a thousand others in the pool? If it survives swapping in a different human, it's *generic-passable* and it fails.
3. **Would you stop** — cold on a card, does it earn a second sentence?
4. **Fun to answer** — would they smile, or brace themselves? A chore produces dutiful material.
5. **Fun to read** — wit, or merely worthy?

**Why both.** Chasing fun alone reintroduces exactly the failure that started this review: *"what's the funniest thing that's ever happened to you"* sounds like the assignment and fails twice — superlative (unretrievable) and protagonist (the funny thing usually belongs to someone else). That is `laugh_hardest` rebuilt. Charles's mid-run clarification was sent to all five passes, and **it caught fourteen structural regressions** where a text had got funnier while quietly breaking the floor. Every one is documented in the appendix; the notable ones:

| prompt | what slipped while chasing fun | correction |
|---|---|---|
| `most_me_photo` | dropped to "a photo on your phone" — admits a mate asleep in a Waffle House | restored **"of you"** |
| `standing_ritual` | "the unwritten rules" produced a pitch about *Dave*, whose 2022 offence named the trivia team | "**the rule you enforce**" — answerer is the agent, not the chronicler |
| `q14.3` | reached for "the **most** ridiculous thing" — the exact superlative that broke the original | "**a** ridiculous thing" |
| `q10.4` | "when did that get **hardest**" — a ranking search across instances of restraint | "what did you end up going along with" |
| `q6.1` (mine) | my own earlier fix smuggled in "the **farthest** you've gone" | "a must-see you dragged yourself out of bed for" |
| `q3.2` | traded away the protagonist fix for a charmier opener | restored "**what was your side of it**" |
| `q1.1` | "what went wrong" left the subject unspecified — admits the *show's* disaster | "there's always a disaster. **What was yours?**" |

---

## 2. The eight recasts — the ones that need your POV most

These are new constructs, not rewordings. Same id, same tier, same option; different question.

| id | tier | was | now | why |
|---|---|---|---|---|
| `hardest_thing` | admiration | "What's something you got through that you weren't sure you would? Start at the worst part." | **"What have you put absurd effort into for no good reason? How far did it go?"** | aimed at the wound — collected bar-exam retakes, grief, divorce. Respect from a polite distance, never desire. Disproportionate effort proves the same care and is a pleasure to answer. |
| `q10.1` | admiration | "Tell me about a time you said the hard thing to someone you love. How did it land?" | **"When did your honesty get you in trouble? It doesn't have to have been serious."** | modal answer was an intervention, an addiction or a breakup; ~1 in 3 went noun-free from privacy instinct. Bluntness is funniest at low stakes. |
| `mentor_moment` | admiration | "Who told you something that stuck — and what do you actually do because of it?" | **"What do you have unreasonably high standards about? Tell me about the last time it cost you."** | third party owned the line and the scene; also duplicated `learned_from_someone`. A standard you've paid for proves character in your own voice. |
| `best_purchase` | self_expansion | "What's something under $50 you own that you'd replace the same day it broke?" | **"What's something about you people don't believe at first? Tell me how it usually comes up."** | sub-$50 objects are a low-ceiling category — the modal pitch is a product review. The new construct is remarkable *by definition*: the selection criterion is that it surprises people. |
| `weekend_project` | self_expansion | "What's a project you've been working on in your spare time?" | **"What's something you tried exactly once? Tell me how it ended."** | flat, and duplicated `building_right_now` *and* fished `q13.3` — three slots asking the same question. |
| `movie_scene` | i_sharing | "What's a movie or show you've made someone else watch?" | **"What do you find beautiful that everyone else thinks is ugly? What have you done about it?"** | my own first-round fix had converged on `made_them_watch`. This fills the real gap: `aesthetic_resonance` is one of i_sharing's three feeding fields and nothing in the bank reached it. |
| `slow_tuesday` | i_sharing | "Describe a completely ordinary evening at your place that went exactly right." | **"What's a bit you run that everyone around you has to tolerate? When did it last go too far?"** | asked for the *least* remarkable evening the person owns. Nothing in the bank asked anyone to produce humour about themselves, though demonstrated wit is the confirmed-positive craft device. |
| `superpower` | fun | "If you could have one mundane superpower...?" | **"What's something pointless you've put real effort into? Walk me through it."** | a wish is not a fact about a person — the pitch stays "X wishes they could Y." Effort-spent-on-trivia is the same charm with an actual event under it. |

---

## 3. Can admiration carry its contract without hardship?

Yes, and better. The contract is *"this is a quality person — character proven, not claimed,"* and small disproportionate acts prove it more attractively than suffering does:

> nine drafts of a wedding toast with one joke written specifically for the dog · a laminated video-call sheet whose step one reads DO NOT TOUCH ANYTHING YET · eleven vacuum models in a weighted-criteria spreadsheet · a cat-sitting weekend that produced a daily photo essay captioned in the cat's voice · the turkey assessed as dry in 2019, relitigated every Thanksgiving since

Hardship yields material a stranger respects from across the room. Absurd care yields material they want to sit across from. Only `hardest_thing` needed recasting outright — the rest of the tier already proved character through work, error and persistence rather than wounds.

---

## 4. Constraints held

- **Bank stays 55** — 12 self_expansion · 12 i_sharing · 12 admiration · 9 comfort · 10 fun. `ONBOARDING_WEIGHTS` and `PromptDef` untouched. Every id preserved, including through recasts.
- **Fished stays 47** — option→prompt mapping remains complete and 1:1 across all 11 seeding items; no tier moved.
- **Fished prompts still carry no `exampleAnswer`**, by design. Every bank prompt carries one rewritten in the remarkable register.
- **Guideline 9 enforced** — fished prompts that rebuilt scene the tapped option already carries were cut: `q1.4` 18→12 words, `q6.2` 17→11, `q1.1` 23→9, `q15.5` −5, `q13.2`, `q14.1`, `q14.5`, `q15.2`, `q15.3` all trimmed to lean on the tap.

---

## 5. Open judgment calls — flagged, not buried

1. **`learned_from_someone`** is the same family that killed `q9.2` and `mentor_moment`; word order is its entire defence ("What do you still do exactly the way someone taught you? Who was it?"). A sentimental answerer can still spend forty seconds on grandma. Mitigation, not a guarantee.
2. **`q10.3`** sits closest to the witness line in the fished set — it's the only prompt where the *other person* changes. It survives the strip-test ("asks people what they'd do instead until they answer it out loud, then claims four percent of the credit" is a person), and the credit clause defuses the smugness hazard. If the pilot shows answers narrating the friend's transformation, recast rather than lift again.
3. **`show_someone_your_city`** is the only prompt whose yield depends on a life circumstance — someone who has never hosted a visitor stalls. Skip-and-replace covers it.
4. **`overpacked`** is the softest keep in the fun tier: "nobody else does" screens for an unusual object, but chargers and snacks are live modal answers and the payoff clause carries the whole prompt.
5. **`superpower` vs `obsession`** adjacency — one asks what you're into (a subject), the other what you did (a labour). Different verbs, different material, worth a pilot watch.
6. **`q13.5`** ("a tiny part of your job you'd honestly do for free") is categorical rather than an occasion; a genuinely bored desk worker may have no sliver at all, where the old Saturday framing at least handed them one.
7. **`q21` earns its place as a sorting device whose prompts deliberately ignore it** — none of the four ask about the next five years; each converts the future into present machinery or a past landmark. Coherent, but worth knowing.

---

## 6. A better retrievability rule than the one I shipped

The passes converged on a sharper formulation than "prefer 'a time' over 'the last time'":

> **Cached-trait-first, instance-second.** "The last time" is legal when the *trait* is the payload — answered from cached self-knowledge — and the instance is illustration, where satisficing is harmless. It fails when the *event* is the payload and must be selected from blurred, indistinguishable candidates.

`irrational_fear`, `overpacked`, `apocalypse_skill`, `pet_peeve` and the new `q3.1` all have the legal shape. The original `q3.1` ("the last party you left early") had the illegal one — every party blurs into the next for someone who leaves them all early. This predicts the whole set better than the recency heuristic does.

---

## Appendix — all 102, with the modal answer and the pitch it yields

Each entry carries a **Floor** or **Structure** line auditing the three disqualifiers, and a **Proof** line: an excerpt of the simulated modal answer followed by the pitch sentence it produces. That pitch sentence is the artefact to judge — it is what a stranger would actually read.

### Bank — self_expansion + i_sharing (24)

<!-- R1 · bank self_expansion (12) + i_sharing (12) · remarkability + fun pass, ON TOP OF the nine-criteria floor -->

**Dual standard applied.** Every text below must clear the structural floor — protagonist (the answerer owns the verbs), retrievability (no superlatives; "the last" only when live / high-frequency / landmark-marked), pitchable — *and* the remarkability + fun bar. After Charles's mid-run clarification I re-audited all fifteen texts I had changed and corrected five that had drifted:

| prompt | what slipped | correction |
|---|---|---|
| `movie_scene` | "when did you last go look at it" presumed a deliberate pilgrimage the modal admirer never makes — a retrievability stall | ask what they've *done* about it, which is open to photographing, detouring, petitioning |
| `slow_tuesday` | "what's a bit you run" is answerable in one sentence (criterion 9) | added an occasion + breach: "when did it last go too far?" |
| `last_new_place` | "was it worth the trip?" is a yes/no (criterion 9) | "what was the verdict?" — invites judgment with reasons |
| `song_on_repeat` | "who's sick of it?" presupposes a witness; solo listeners stall (retrievability) | "how many times are we talking?" — always answerable, still self-deprecating |
| `comfort_food` | "how you actually make it" excludes the takeout answerer | "tell me the embarrassing specifics" — covers cooking and ordering |

Verdicts: **9 KEEP · 11 LIFT · 4 RECAST.**

---

### `rabbit_hole` · self_expansion · **LIFT**
**Text:** "What's the last rabbit hole you went down? How far did it actually go?"
**Was:** "What's the last rabbit hole you went down? Start at whatever made you look it up."
**Why:** the old entry point aimed at the origin — the least interesting end of the story — where the remarkable material is always the absurd depth, the same escalation that made `q19` the best prompt in the fished map. Floor: "the last" is legal here (a rabbit hole is live by nature), answerer owns the descent.
**Proof:** "The Titanic sub thing. I watched every documentary and then I was reading the actual court filings? At like 2am. I can tell you the names of everyone on board. My girlfriend has banned it as a dinner topic." → *Nadia can name everyone aboard the Titan and has read the court filings at 2 a.m. — the subject is now banned at her dinner table.*
**Example:** "The Titanic sub thing. I ended up reading the actual court filings at 2am. I can name everyone on board. My girlfriend has banned it at dinner."

### `taught_yourself` · self_expansion · **LIFT**
**Text:** "What's something you taught yourself with nobody to ask? What did you wreck along the way?"
**Was:** "What's something you taught yourself with no one to ask? Tell me about the part where you had no idea what you were doing."
**Why:** "the part where you had no idea what you were doing" is an abstract invitation and got abstract answers; "what did you wreck" demands a casualty, which is funnier and arrives as a physical noun. Checked the stall risk for non-physical skills — a self-taught Spanish speaker answers "nothing, I just said stupid things," which recovers into exactly the right register.
**Proof:** "Cutting my own hair, during lockdown, and then I just kept doing it. The first one I did with kitchen scissors and I had to wear a hat to a Zoom wedding. I have proper shears now, I do the back with two mirrors." → *Vic has cut her own hair since 2020 — the first attempt required a hat at a Zoom wedding, and there are now two mirrors and proper shears involved.*
**Example:** "Cutting my own hair. The first attempt required wearing a hat to a Zoom wedding. I have proper shears now and I do the back with two mirrors."

### `show_someone_your_city` · self_expansion · **LIFT**
**Text:** "Who's the last person you showed your city? Where'd you take them, and did they get it?"
**Was:** "If someone visited your city for one day and you were in charge, where are you taking them?"
**Why:** generic-passable — the hypothetical produced an itinerary, and an itinerary characterises a city, not a human; every answer had the identical shape. Naming a real visitor supplies an occasion, and "did they get it" licenses the reversal where the curated tour loses to the tourist thing. Floor: hosting a visitor is landmark-marked, so "the last" is legal. **Yield risk, flagged honestly:** someone who has never hosted anyone stalls — skip-and-replace covers it, but this is the one text here that depends on a life circumstance.
**Proof:** "My college roommate came in April and I did the whole thing — took her to my swimming hole, which is a forty minute drive and then a hike, and she was so unimpressed. She wanted to go to the aquarium. We went to the aquarium. It was actually great." → *Maya drove her visiting roommate forty minutes and hiked her to a swimming hole; the roommate wanted the aquarium. They went to the aquarium, and Maya concedes it was great.*
**Example:** "My roommate visited and I made her hike forty minutes to my swimming hole. She wanted the aquarium. We went to the aquarium. It was great."

### `changed_your_mind` · self_expansion · **LIFT**
**Text:** "What did you used to be completely sure about? Where were you when it fell apart?"
**Was:** "What's something you used to believe and don't anymore? I want the moment it started to go."
**Why:** "used to believe" pulled earnest and occasionally heavy material (faith, family, career doctrine); "completely sure" invites confident wrongness, which is self-deprecating by construction and much funnier while still admitting the serious answer. Floor: no superlative, answerer owns the belief and the collapse, entry point handed by "where were you."
**Proof:** "I was completely sure I hated cilantro — like, personality-level sure, I'd send things back. And then my friend made this Thai thing and I ate the whole bowl and she goes, that's cilantro. I'd been performing it since I was fifteen." → *Ben sent food back over cilantro for fifteen years as a matter of identity, then ate a whole bowl of it without noticing — his friend broke the news afterwards.*
**Example:** "I was sure I hated cilantro — I sent things back over it. Then I ate a whole bowl of my friend's curry and she told me after. Fifteen years, performed."

### `obsession` · self_expansion · **LIFT**
**Text:** "What are you obsessed with that most people find boring? What do your friends say?"
**Was:** "What's something you're a little obsessed with that most people find boring?"
**Why:** the old version could be satisfied by naming a category ("fonts"); the added clause imports a witness reacting to the answerer — the same correct inversion as `weird_habit` — which is where the joke and the warrant both live.
**Proof:** "Grocery store layouts. I'm not joking, I have opinions about traffic flow — the good ones make you walk past produce first. My boyfriend says I do a 'lap of judgment' in any new store. He times it now." → *Casey judges grocery stores on traffic flow and produce placement; her boyfriend has started timing what he calls her lap of judgment.*
**Example:** "Grocery store layouts. The good ones walk you past produce first. My boyfriend calls it my lap of judgment and he's started timing it."

### `side_quest` · self_expansion · **LIFT**
**Text:** "What's a side quest you ended up on? Start where you got pulled off course."
**Was:** "What's a side quest you ended up on recently? Start where you got pulled off course."
**Why:** clears the bar already — a detour is a surprise by definition — so this is a one-word retrieval fix only: "recently" stalled the third of answerers who'd had a scheduled month.
**Proof:** "I went to buy a dresser off Facebook Marketplace and the guy turned out to run a pigeon rescue? I stayed like an hour meeting pigeons. I did also get the dresser." → *Dev went to buy a used dresser and came home an hour late because the seller ran a pigeon rescue — he met every pigeon, and yes, he got the dresser.*
**Example:** "Went to buy a dresser off Marketplace and the guy ran a pigeon rescue. Stayed an hour. Met every pigeon. Did get the dresser."

### `best_purchase` · self_expansion · **RECAST**
**Text:** "What's something about you people don't believe at first? Tell me how it usually comes up."
**Was:** "What's something under $50 you own that you'd replace the same day it broke? What does it actually do for you?"
**Why:** objects under fifty dollars are a low-ceiling category — the modal answer is a rice cooker and the modal pitch is a product review — whereas this construct is remarkable *by definition*, since the selection criterion for the answer is that it surprises people. Floor: no superlative; the disbelieved fact is heavily rehearsed (they explain it constantly), so retrieval is instant; "how it usually comes up" forces the recurring scene where the answerer acts, so it can't be satisfied in one sentence. helpText: "The thing you have to prove. The small stuff is the good stuff."
**Proof:** "That I don't drink. People genuinely argue with me about it — at weddings someone will keep bringing me things. I've started just holding a lime soda all night as a decoy. It's easier than the conversation." → *Sam carries a lime soda as a decoy at weddings because people won't accept that he doesn't drink — it's easier than having the conversation nine times.*
**Example:** "That I don't drink. People argue with me about it at weddings, so I hold a lime soda all night as a decoy. Easier than the conversation."

### `unpopular_take` · self_expansion · **LIFT**
**Text:** "What's the take you've had to defend out loud? Who's still mad at you about it?"
**Was:** "What's the take you've had to defend out loud? Tell me about a time it came up."
**Why:** "a time it came up" got a shrug of an occasion; naming the person still holding the grudge produces an ongoing feud, which is funnier, more specific, and gives the pitch a second character reacting to the answerer.
**Proof:** "That Die Hard isn't a Christmas movie. My brother-in-law and I have a running thing — he texts me the poster every December first. I've made a slide deck. I presented it at Thanksgiving. He's still mad." → *Rob built a slide deck arguing Die Hard is not a Christmas movie and presented it at Thanksgiving; his brother-in-law texts him the poster every December first.*
**Example:** "Die Hard is not a Christmas movie. I made a slide deck. I presented it at Thanksgiving. My brother-in-law texts me the poster every December first."

### `bucket_list_done` · self_expansion · **KEEP**
**Text:** "What's something you'd been saying you'd do for years and then finally did? How did the actual day go?"
**Why:** "how did the actual day go" is already doing the remarkability work — it aims squarely at the gap between the fantasy and the reality, which is where both the surprise and the comedy live. Floor: long-deferred completions are self-defining memories, no superlative, no success gate.
**Proof:** "I finally did the Camino. I'd talked about it for years. Day two I got a blister the size of a grape and cried in a pharmacy and had to buy these ugly orthopedic sandals that I wore for the entire rest of it." → *Nine years of talking about the Camino ended with Priya crying in a Spanish pharmacy on day two and walking the remaining four hundred miles in orthopedic sandals.*
**Example:** "Finally walked the Camino after nine years of saying I would. Cried in a pharmacy on day two and did the last 400 miles in orthopedic sandals."

### `world_expert` · self_expansion · **KEEP**
**Text:** "What do people come to you about? Tell me about the last time someone did."
**Why:** the mastery arrives pre-warranted by other people's behaviour, so the pitch never has to claim anything — and the summoning incident is reliably absurd. Floor: "the last time" is legal because people who get come-to get come-to often.
**Proof:** "People ask me about buying used cars. I've bought like six and I'm annoying about it. My coworker called me from a lot last month and I made him send me a video of the guy walking around the car. He did not buy the car." → *Marcus takes live calls from used-car lots; last month he had a coworker film the salesman walking around the car, and the coworker did not buy the car.*
**Example:** "Used cars. My coworker called me from the lot last month and I made him film the guy walking around it. He did not buy the car."

### `weekend_project` · self_expansion · **RECAST**
**Text:** "What's something you tried exactly once? Tell me how it ended."
**Was:** "What's a project you've been working on in your spare time?"
**Why:** the old text asked only *what*, so the surprise had to arrive by luck, and it duplicated two better prompts that already own the construct (`building_right_now` and fished `q13.3`). Floor: "exactly once" is a category filter rather than a superlative, single-occurrence events are vividly encoded, it guarantees one occasion by construction, and "how it ended" opens the breach. Still reads as someone who says yes to things — with humility attached. helpText: "The one and only time. The small stuff is the good stuff."
**Proof:** "Hot yoga. One time. I did not know it was hot yoga, I thought it was regular yoga, and I was in like a hoodie? I left after twenty minutes and sat in my car with the AC on full. I did buy the mat though, which is in my closet, judging me." → *Nora accidentally attended hot yoga in a hoodie, lasted twenty minutes, and retreated to her car's air conditioning — the mat she bought lives in the closet, judging her.*
**Example:** "Hot yoga. I didn't know it was hot yoga. Wore a hoodie, lasted twenty minutes, sat in my car with the AC on. The mat's in my closet, judging me."

### `last_new_place` · self_expansion · **LIFT**
**Text:** "Where's the last new place you went, however small? What was the verdict?"
**Was:** "Where's the last new place you went, however small? How did you end up there?"
**Why:** "how did you end up there" gets logistics; a verdict can be scathing, and the disappointment is where the story turns. **Corrected after the clarification** — my first attempt ("was it worth the trip?") was a yes/no and failed criterion 9; "what was the verdict" demands the judgment *and* its reasons.
**Proof:** "There's a diner two towns over that's supposedly famous for pie and my roommate and I drove forty minutes for it. Verdict: the pie was fine. FINE. But the waitress told us about her divorce for twenty minutes and honestly that was worth the drive." → *Kim drove forty minutes for a famous pie, rated it "fine," and came home with twenty minutes of the waitress's divorce, which she considers the actual value.*
**Example:** "Drove forty minutes for a famous pie. Verdict: pie was fine. The waitress told us about her divorce for twenty minutes, which was worth the drive."

### `made_them_watch` · i_sharing · **KEEP**
**Text:** "What's the thing you love that you make other people experience? Tell me about your most recent victim."
**Why:** "victim" does the whole job — it converts taste from something received into something inflicted, giving the answerer a verb, a scene and a self-aware joke in one word. Floor: "most recent" is legal (an evangelist evangelises often), protagonist is the pusher not the pushed.
**Proof:** "The Twilight Zone episode where the guy breaks his glasses. I've made three separate people watch it just so I can watch their face at the end. My roommate called it an ambush and she's right." → *Theo has personally sat three people down for one specific Twilight Zone episode and watches their faces at the ending — his roommate calls it an ambush.*
**Example:** "The Twilight Zone episode where the guy breaks his glasses. I've made three people watch it just to see their face at the end. My roommate calls it an ambush."

### `friends_still_bring_up` · i_sharing · **KEEP**
**Text:** "What's something you did that your friends still bring up? Tell it the way they tell it."
**Why:** the answerer's own mishap is the legend and the group has already rehearsed the telling, so retrieval is free and the material arrives pre-polished as comedy about the right person.
**Proof:** "Three years ago I confidently ordered in Spanish at this taqueria and apparently asked for 'a jacket of pork.' My friends now order jackets of things constantly. Every group dinner. It will never die." → *Three years ago Rachel confidently ordered "a jacket of pork" at a taqueria, and her friends have been ordering jackets of things at every dinner since.*
**Example:** "I once confidently ordered 'a jacket of pork' in Spanish at a taqueria. My friends have ordered jackets of things at every dinner since."

### `notice_first` · i_sharing · **LIFT**
**Text:** "What do you notice everywhere that nobody else does? When did it last ruin something?"
**Was:** "What do you always notice that other people don't? When did it last make you say something out loud?"
**Why:** the old second clause let perceptiveness read as a virtue claim; "ruin something" inverts it into a self-deprecating affliction, which is funnier and the direction the tone rules want. Floor: a chronic perceptual habit is high-frequency, so "last" is legal.
**Proof:** "Continuity errors in movies. I can't turn it off. We were watching a thriller and I said 'her coffee refilled itself' out loud and my girlfriend paused it and said 'we are not doing this again.' We were doing it again." → *Dev cannot stop catching continuity errors out loud; the last one — a self-refilling coffee cup — got the movie paused and a formal warning.*
**Example:** "Continuity errors. I said 'her coffee refilled itself' out loud during a thriller and my girlfriend paused it and issued a formal warning."

### `guilty_pleasure` · i_sharing · **KEEP**
**Text:** "What's the thing you enjoy that you'd have to explain? Tell me about the last time you did it."
**Why:** the enjoyment is enacted rather than received — the answerer goes and does something slightly ridiculous on purpose — and the occasion clause makes them prove it happened recently. Floor: guilty pleasures are habits, so "the last time" is legal.
**Proof:** "Mall pretzels. I will go to the mall FOR the pretzel. I went Saturday and didn't enter a single store." → *Priya drives to the mall for the pretzel and only the pretzel — Saturday she got in and out without entering a single store.*
**Example:** "Mall pretzels. I drive to the mall for the pretzel. Saturday I went in, got it, and left without entering a single store."

### `weird_habit` · i_sharing · **KEEP**
**Text:** "What's a habit of yours someone has actually commented on? What did they say?"
**Why:** the structural inversion of the prompt that started this review — a third party witnessing the answerer, rather than the answerer witnessing a third party — and being caught is intrinsically funny.
**Proof:** "I narrate what I'm doing when I cook. Alone. Like a cooking show. My sister walked in on me saying 'and now we fold' and lost it." → *Jess cooks alone like she's hosting a show — her sister once walked in on "and now we fold" and has never let it go.*
**Example:** "I narrate my own cooking like a show. My sister walked in on 'and now we fold' and has never let it go."

### `song_on_repeat` · i_sharing · **LIFT**
**Text:** "What have you had on repeat lately? How many times are we talking, honestly?"
**Was:** "What have you had on repeat lately? Where do you usually end up listening to it?"
**Why:** a song title plus a location is a Spotify Wrapped, not a person. **Corrected after the clarification** — my first attempt ("who's sick of it?") presupposed a witness and stalled every solo listener, a retrievability failure; asking for the count is always answerable, and the absurd number is self-deprecating on its own.
**Proof:** "Tusk. Fleetwood Mac. Honestly? Every drive for two months. Spotify told me it was like four hundred plays and I felt genuinely exposed by my own app. My carpool has instituted a one-Tusk-per-trip rule." → *Nadia has played Tusk four hundred times in two months — a number her own app disclosed to her — and her carpool now enforces a one-Tusk-per-trip limit.*
**Example:** "Tusk, by Fleetwood Mac, on every single drive for two months. Spotify says four hundred plays. My carpool has limited me to one per trip."

### `movie_scene` · i_sharing · **RECAST**
**Text:** "What do you find beautiful that everyone else thinks is ugly? What have you done about it?"
**Was:** "What's a movie or show you've made someone else watch? Walk me through the night you showed them."
**Why:** my own review rewrote this into an evangelism prompt and thereby duplicated `made_them_watch` in the same tier — this recast fills the gap that actually exists, since `aesthetic_resonance` is one of i_sharing's three feeding fields and nothing in the bank reached it. **Corrected after the clarification** — my first attempt ("when did you last go look at it?") presumed a deliberate pilgrimage the modal admirer never makes; "what have you done about it" is open to photographing, detouring, petitioning, or hanging it on a wall, so the answerer still owns a verb. Floor check against `gives_you_chills`: this survives where chills died because the object is mundane and unauthored — a parking garage has no artist to steal the story — and the contrarian judgment is the answerer's own. helpText: "The building, the object, the view nobody else would photograph. The small stuff is the good stuff."
**Proof:** "Brutalist buildings. There's the old library downtown that everyone wants torn down and I actually signed the petition to save it. And I have a photo of it as my laptop background, which my coworker described as a cry for help." → *Amir signed the petition to save the brutalist library everyone else wants demolished, and keeps a photograph of it as his laptop background — a coworker has called this a cry for help.*
**Example:** "Spiral parking garages. There's a concrete one downtown from the seventies and I'll pay extra to park in it. I have photographed it. Twice."

### `pet_peeve` · i_sharing · **KEEP**
**Text:** "What's a small thing that bothers you more than it should? When did it last get you?"
**Why:** the disproportionate reaction *is* the material and the offender is incidental, so the joke lands on the answerer — and "more than it should" pre-authorises the confession. Floor: peeves are frequent by nature, so "last" is legal.
**Proof:** "Loud chewers. My coworker eats almonds at 2pm every single day and I now own headphones I chose specifically for almond frequencies. Yesterday I had them on before he even opened the drawer. I heard the drawer." → *He owns noise-cancelling headphones selected, after testing, specifically against one coworker's 2 p.m. almonds.*
**Example:** "Loud chewers. My coworker eats almonds at 2pm and I bought headphones specifically for almond frequencies. Yesterday I had them on before he opened the drawer."

### `comfort_food` · i_sharing · **LIFT**
**Text:** "What's your comfort food? Tell me the embarrassing specifics."
**Was:** "What's your comfort food and what memory is attached to it?"
**Why:** generic-passable and sentiment-inviting — "what memory is attached" is the most predictable answer shape in the genre (a grandmother, a kitchen table, a transported eight-year-old), and nostalgia is exactly the sentiment the tone rules ban. **Corrected after the clarification** — my first attempt ("the embarrassing way you actually make it") excluded everyone whose comfort food is takeout; "the embarrassing specifics" covers cooking and ordering both, and puts the answerer's hands or habits in the story either way.
**Proof (cook):** "Boxed mac and cheese but I put an egg in it. Off heat, stirred in fast, it makes it custardy. I learned that from a roommate in 2014 and I've never told anyone because it sounds disgusting. It is not disgusting." → *Jules has been stirring a raw egg into boxed mac and cheese since 2014 — off the heat, fast — and kept the technique secret on the grounds that it sounds worse than it is.*
**Proof (takeout):** "Taco Bell. Specifically a bean burrito, no onions, and I add my own hot sauce from a bottle I keep in my car. Yes, in my car." → *Priya's comfort food is a Taco Bell bean burrito, customised with hot sauce from a bottle she keeps in the car.*
**Example:** "Boxed mac and cheese with an egg stirred in off the heat. Learned it from a roommate in 2014 and never told anyone because it sounds disgusting."

### `ick_or_green_flag` · i_sharing · **KEEP**
**Text:** "When's a time you decided you liked someone in about four seconds? What did they do — and what did you do about it?"
**Why:** the action clause added in the review is what earns the keep — the answerer's taste is on display *and* they cross the room, so the sentence is about a decision they made rather than a stranger's charm.
**Proof:** "A guy at a house party was losing at Catan, like getting destroyed, and he was SO happy about it. I walked over after and told him 'you lost incredibly,' and we got tacos that week." → *She watched a stranger be delighted to lose at Catan, walked over to inform him he'd "lost incredibly," and the tacos that followed turned into a friendship.*
**Example:** "A guy at trivia handed the other team the tiebreaker because they'd 'worked harder for it.' I made him join our team the same night."

### `dealbreaker_funny` · i_sharing · **KEEP**
**Text:** "What's a small thing you've genuinely held against someone? Be honest about how petty it was."
**Why:** the "be honest about how petty" clause reliably turns the joke onto the answerer, which is the whole trick — confessed pettiness is charming where alleged pettiness is not.
**Proof:** "My ex used to say 'expresso.' I know. I KNOW. That's not why we broke up, but it's also not *not* why." → *It wasn't the "expresso" that ended the relationship, she'll tell you — but it also wasn't not the "expresso."*
**Example:** "I held a parking job against a coworker for a full year. He parked fine every day after. I was still watching."

### `slow_tuesday` · i_sharing · **RECAST**
**Text:** "What's a bit you run that everyone around you has to tolerate? When did it last go too far?"
**Was:** "Describe a completely ordinary evening at your place that went exactly right. Start with what you ate."
**Why:** generic-passable — it asked for the *least* remarkable evening the person owns, "exactly right" forecloses the breach (the same defect I fixed in fished `q13.1` and left standing here), and its material was rhythm-of-life, i.e. filed in the wrong tier. Nothing in the bank asked anyone to *produce* humour about themselves, though demonstrated wit is the confirmed-positive craft device; a running bit is enacted, witnessed and quotable — three i_sharing feeding fields at once. **Corrected after the clarification** — "what's a bit you run" alone is answerable in one sentence, so the occasion-and-breach clause is load-bearing, not decoration. helpText: "The voice, the running joke, the thing you say every single time. The small stuff is the good stuff."
**Proof:** "I narrate the dog's inner monologue in a very specific voice — he's British and deeply disappointed in us. It went too far at my in-laws', I did it through an entire dinner, and my father-in-law asked me, genuinely, if I was doing okay." → *Marco voices his dog's inner monologue — British, perpetually disappointed — and ran it through an entire dinner at his in-laws', at the end of which his father-in-law sincerely asked whether he was okay.*
**Example:** "I voice my dog's inner monologue. He's British and deeply disappointed in us. I did it through a whole dinner at my in-laws' and my father-in-law asked if I was okay."

### Bank — admiration + comfort (21)

<!-- R2 · bank admiration (12) + comfort (9) · remarkability + fun pass, ON TOP OF the nine structural criteria -->
<!-- Every fragment carries a Structure line auditing the three disqualifiers: P=protagonist, R=retrievability, Pitch=pitchable. -->

### `bet_on_yourself` · admiration · **LIFT**
**Text:** "Tell me about a bet you made on yourself. What's the part you didn't tell anyone about?"
**Was:** "Tell me about a time you bet on yourself. It doesn't have to have worked."
**Why:** "bet on yourself" is a stock phrase that retrieves stock career answers — the move-to-Denver, the reach application — and what made the one good simulation good was the concealed cost, not the bet.
**Structure:** P ✓ answerer bets and answerer conceals — every verb is theirs. R ✓ "a bet," no superlative; life bets are landmark-marked. Pitch ✓ proven below.
**Proof:** "I quit to freelance and everyone thought I was crushing it. The part I didn't tell anyone — I picked up Saturday shifts at a bar for eight months. My mom found out from Instagram." → *For the eight months she was visibly crushing it as a freelancer, Dana was also pulling Saturday bar shifts — a fact her mother eventually learned from Instagram.*
**Example:** "Quit marketing for nursing school. What nobody knew: I sold my car to cover first semester and told everyone I was 'trying transit.'"

### `hardest_thing` · admiration · **RECAST**
**Text:** "What have you put absurd effort into for no good reason? How far did it go?"
**Was:** "What's something you got through that you weren't sure you would? Start at the worst part."
**Why:** "start at the worst part" aims directly at the wound — it collects bar-exam retakes, grief and divorces, material a stranger respects from a polite distance rather than wants to meet, and it makes onboarding a chore that produces guarded answers. Disproportionate effort proves the same care, standards and follow-through while being a pleasure to answer and to read.
**Structure:** P ✓ the effort is the answerer's throughout; no third party required. R ✓ no superlative — one's own ridiculous projects are cached self-knowledge, usually live. Pitch ✓. Mild criterion-4 (an arc, not one occasion), same tolerated class as `obsession`; the nouns arrive regardless.
**Proof:** "I made a spreadsheet to pick a vacuum. Eleven models. I gave weights to things — weights! My girlfriend found the file and asked if I was okay." → *Choosing a vacuum required eleven models and a weighted-criteria spreadsheet; Marcus's girlfriend found the file and asked if he was okay.*
**Example:** "Three years reverse-engineering a chili from a place in Cincinnati. Forty batches. Batch thirty-one I wrote CLOSE in caps. Then I lost the notebook."

### `helped_someone` · admiration · **LIFT**
**Text:** "What's something you've done to help someone that got weirdly elaborate?"
**Was:** "Tell us about a time you helped someone and it stuck with you."
**Why:** "helped someone" collects the virtue trophy and then the most generic sentence in the language — the elaborateness is the only part that could belong to one specific person, and "stuck with you" was feeling-framing besides.
**Structure:** P ✓ the elaboration belongs to the answerer; the recipient is a beneficiary, never an agent. R ✓ deliberately "something," not "the most elaborate" — the superlative was available here and refused. Pitch ✓.
**Proof:** "My grandma wanted to video call so I laminated an instruction sheet. Step one is DO NOT TOUCH ANYTHING YET, in caps. Then her friend wanted one. I'm tech support for a retirement community now." → *Ray's laminated video-calling instructions open with 'DO NOT TOUCH ANYTHING YET' in capitals; he is now, by accident, tech support for an entire retirement community.*
**Example:** "Neighbor's car died so I drove her kids to school for two weeks. They rated my music every morning out of ten. Sixes, mostly."

### `figured_it_out` · admiration · **LIFT**
**Text:** "What do you do yourself that most people pay for? Tell me about the first attempt."
**Was:** "What's something you figured out that nobody showed you how to do?"
**Why:** a near-duplicate of `taught_yourself` (self_expansion) until now — this version aims at demonstrated mastery rather than the learning, and "the first attempt" guarantees the disaster that makes it funny.
**Structure:** P ✓ answerer does the thing. R ✓ standing practice is live; first attempts are landmark-marked. "Most people pay for" describes a population, it is not a ranking the answerer must search. Pitch ✓.
**Proof:** "I cut my own hair. Started in 2020, obviously. First time I did the back with two mirrors and it came out like a crop circle. Nobody's noticed in two years." → *Nia has cut her own hair since 2020; the debut attempt, conducted with two mirrors, produced a crop circle, and no one has noticed since.*
**Example:** "I do my own brakes. First time I put the pads in backwards and drove four blocks making a noise I still think about."

### `trusted_with` · admiration · **LIFT**
**Text:** "When's a time someone put you in charge of something that mattered? How far did you take it?"
**Was:** "When's a time someone put you in charge of something that mattered to them? What did you do with it?"
**Why:** "what did you do with it" gets "I watched her dog"; "how far did you take it" invites the escalation, which is the entire difference between a chore and a story.
**Structure:** P ✓ checked closely — the third party grants the trust in the opening clause and then exits; every subsequent verb is the answerer's. Same shape as `weird_habit`, where someone else observes and the answerer acts. R ✓ being trusted is landmark-marked; no superlative. Pitch ✓.
**Proof:** "My friend asked me to watch her cat for a weekend and I sent her a daily photo essay. With captions. Written in the cat's voice." → *Asked to cat-sit for one weekend, Jess filed a daily photo essay, captioned throughout in the cat's own voice.*
**Example:** "My sister had me officiate her wedding. I interviewed them separately for material, like a journalist. Nine drafts. The dog joke killed."

### `against_the_grain` · admiration · **KEEP**
**Text:** "When's a time you did the thing nobody around you would have picked? What did they say?"
**Why:** "what did they say" imports other people's voices as reaction to the answerer's own act — third-party material *about* the subject, which is the warranting structure admiration runs on, and it reliably returns a quotable line.
**Structure:** P ✓ the act is the answerer's; others only react. R ✓ "a time," no superlative. Pitch ✓.
**Proof:** "I bought a house with my sister. Everyone said don't mix family and money. We have a chore wheel and a shared spreadsheet called The Constitution." → *She bought a house with her sister against unanimous advice; disputes are now settled by a chore wheel and a spreadsheet named The Constitution.*
**Example:** "Whole family's in finance. I announced the teaching credential at Thanksgiving. Dad said 'if this is about money, we can help.' It was not about money."

### `building_right_now` · admiration · **LIFT**
**Text:** "What are you building right now? Walk me through where it's at — including the part that isn't working."
**Was:** "What are you building or working toward right now? Walk me through where it's at this week."
**Why:** "working toward" licensed abstract goal-talk (certifications, "better routines") — cutting it and demanding the broken part forces a present-tense scene with objects in it.
**Structure:** P ✓ answerer builds. R ✓ present tense, live by definition. Pitch ✓.
**Proof:** "A raised garden bed. Week three of a one-weekend project. Wood was warped so I re-cut everything and now it's a quarter inch out of square, which I've decided is a feature." → *Jordan's one-weekend garden bed is in week three and a quarter-inch out of true — an error he has formally reclassified as a feature.*
**Example:** "Training for a triathlon. Still the slowest person in the pool. The part that isn't working is the swim. And my alarm."

### `failure_lesson` · admiration · **KEEP**
**Text:** "Tell me about something you got badly wrong. How long did it take to admit it?"
**Why:** "how long did it take to admit it" steers every answer comic rather than confessional, and the doubling-down it surfaces is the funniest material in the tier.
**Structure:** P ✓ the answerer is the one who was wrong and the one who dug in. R ✓ own errors are well-indexed; no superlative. Pitch ✓.
**Proof:** "I planned our whole group trip to Portugal around a festival that had been cancelled for months. When people found out I argued for a full day that the real festival is the towns along the way." → *He planned a group trip to Portugal around a festival cancelled months earlier, then spent a full day maintaining that the real festival was the towns along the way.*
**Example:** "Started a T-shirt company, lost $15k. The unsold boxes lived in my dining room for a year — I ate Thanksgiving next to them twice."

### `mentor_moment` · admiration · **RECAST**
**Text:** "What do you have unreasonably high standards about? Tell me about the last time it cost you."
**Was:** "Who told you something that stuck — and what do you actually do because of it?"
**Why:** the old construct handed the line and the scene to a third party and duplicated `learned_from_someone` in comfort; a standard the answerer has actually paid for proves character in their own voice, with the cost supplying the self-deprecation.
**Structure:** P ✓ the fix that matters — the answerer holds the standard and pays the price, where the old text had a mentor owning both the line and the setting. Others may react (the playlist vote), which is the `against_the_grain` warranting shape, not witness drift. R ✓ "the last time it cost you" is legal under the high-frequency clause — a standing standard is exercised constantly, exactly as in `pet_peeve`'s "when did it last get you." Pitch ✓.
**Proof:** "Coffee. I will not use a drip machine. I brought my own grinder to an Airbnb in Mexico and there are photos of me grinding beans on a balcony." → *Dana travels with her own coffee grinder; photographic evidence exists of her grinding beans on a balcony in Mexico.*
**Example:** "Road-trip playlists. I build them with an actual arc. On the last four-hour drive my friends held a vote and overrode me inside twenty minutes."

### `secret_talent` · admiration · **KEEP**
**Text:** "What are you unexpectedly good at? Tell me how you found out."
**Why:** "unexpectedly" builds the surprise into the ask and the discovery clause keeps it modest — every simulation returned something idiosyncratic (soup diagnosis, trunk Tetris, parallel parking) and nobody performed.
**Structure:** P ✓ the talent and the discovery are the answerer's. R ✓ cached self-knowledge; no superlative. Pitch ✓.
**Proof:** "I'm weirdly good at telling what a dish needs. 'Needs acid.' I fixed a friend's soup at a dinner party and now I get consulted. I have been FaceTimed into a kitchen." → *Friends now FaceTime him into their kitchens mid-recipe, a consulting practice founded the night he diagnosed a soup as 'needs acid' and was right.*
**Example:** "I do calligraphy. Big bearded guy, delicate hand lettering. Found out at a wedding when they ran out of place cards and handed me a pen."

### `getting_better_at` · admiration · **KEEP**
**Text:** "What are you actively bad at and still doing? How's it going this week?"
**Why:** the bad-at gate is an anti-gate — it makes persistence show itself instead of being claimed, and it is the most reliably funny prompt in the bank.
**Structure:** P ✓ answerer is the one being bad at it. R ✓ live and present-tense. Pitch ✓.
**Proof:** "Ceramics. Month four. Everything I make is a 'vessel' because we're not allowed to say what it was supposed to be. This week I made a mug whose handle is decorative." → *Four months into ceramics, everything she produces is officially a 'vessel,' and this week's mug has a strictly decorative handle.*
**Example:** "Pottery, month four. Everything I make is a 'bowl' in the sense that it's round and holds nothing. I've kept every one."

### `stood_up_for` · admiration · **LIFT**
**Text:** "When's a time you said the inconvenient thing out loud? Bonus points if the stakes were tiny."
**Was:** "When's a time you said something inconvenient because it was true? How did the room take it?"
**Why:** "because it was true" pre-moralised the ask into a courage performance, and nobody wants to date the self-described truth-teller; licensing tiny stakes gets the dry-turkey answer, which is funnier and proves the identical candor.
**Structure:** P ✓ answerer speaks. R ✓ improved, not merely preserved — the tiny-stakes licence makes retrieval *easier*, since the turkey is far more reachable than a moral crisis. Pitch ✓.
**Proof:** "I told my mom the turkey was dry. Once. In 2019. She now puts it on the table every Thanksgiving and just looks at me." → *Marco assessed the turkey as dry in 2019; his mother now sets it on the table each Thanksgiving and looks directly at him.*
**Example:** "Told my book club I hadn't read the book. Then that I hadn't read the last six. We're a wine club with a reading problem now."

### `recharge` · comfort · **LIFT**
**Text:** "What's your weird recovery ritual after a brutal week? The specific one, not the sleep."
**Was:** "Think of the last week that wrecked you. What did the next day actually look like?"
**Why:** everybody recovers by sleeping late and eating badly, so the old text collected the one answer that could be written about anyone in the pool; "not the sleep" is the same move `morning_person` makes with "not the aspirational one," and it works.
**Structure:** P ✓ answerer performs the ritual. R ✓ own rituals are cached and recurring; the old "last week that wrecked you" two-step search is gone. Pitch ✓. Criterion 4 (a ritual, not one occasion) — the tolerated `morning_person` class; rhythm-of-life is comfort's literal feed.
**Proof:** "I do a full grocery shop at 10pm on a Friday when the store's empty. I don't need groceries. I push the cart around with a podcast on and I come out a new man." → *Ana's reset is a 10 p.m. Friday supermarket she needs nothing from — empty aisles, one podcast, a single lap with the cart.*
**Example:** "I reorganise the fridge. Everything comes out, gets wiped, goes back by height. My roommate has learned not to speak to me during it."

### `close_people` · comfort · **KEEP**
**Text:** "What's your oldest friend always giving you a hard time about?"
**Why:** the only prompt in the bank that forces third-party material *about the answerer's own trait* — the tease is a vouch, it arrives pre-rehearsed, and it is funny by construction.
**Structure:** P ✓ the validated inversion — a witness *of* the answerer, rather than the answerer witnessing someone else. R ✓ standing teases are rehearsed for you by the group. Pitch ✓.
**Proof:** "My college roommate will not let go of the fact that I planned her bachelorette with a spreadsheet. Tabs. She screenshotted it and it still comes up four years later." → *Maya planned a bachelorette off a spreadsheet with tabs — one of them labelled 'pool time' — and the screenshot has lived in the group chat for four years.*
**Example:** "Dani won't let go of the bachelorette spreadsheet. It had tabs. One of them was labeled 'pool time.'"

### `love_language_real` · comfort · **LIFT**
**Text:** "What's your specific way of showing you care that other people find a little odd?"
**Was:** "What's the way you show someone you care about them? Give us a specific example."
**Why:** the old wording opened the floor to love-languages quiz-speak and self-characterisation ("I'm an acts of service person") before any behaviour arrived; "a little odd" skips straight to the particular thing nobody else does.
**Structure:** P ✓ the answerer performs the act; others merely find it odd — witnesses of the answerer again. R ✓ cached, and reinforced by having been commented on. Pitch ✓. Criterion 4 mild (categorical "your way"), but the oddness filter forces one concrete behaviour every time.
**Proof:** "I send people articles. Constantly. My friend told me getting a link from me is like being handed a dead bird by a cat — it's love, but it's a lot." → *Ben conveys affection primarily by link; a friend has described receiving one as being handed a dead bird by a cat.*
**Example:** "I make people playlists and never tell them. I just add songs to a shared file for months and hope they notice."

### `disagree_well` · comfort · **LIFT**
**Text:** "Tell me about a stupid argument you've had with someone you love. Who won?"
**Was:** "Tell me about the last real disagreement you had with someone you love. How did it end?"
**Why:** "real disagreement" pulled money, in-laws and relationship-processing talk, and one simulation returned a flat logistics fight; the domestic-trivial version demonstrates the same repair style and is the only one anyone wants to read. "Who won" invites the joke.
**Structure:** P ✓ you cannot witness your own argument — the answerer is a participant by construction, and in the modal answer they deliver the line that ends it. R ✓ "a stupid argument" removes both the ordering search and the "real" threshold judgment the old text demanded; these get retold, so they are rehearsed. Pitch ✓.
**Proof:** "He soaks dishes for three days. I told him the sink was pretending to be a crockpot. He laughed, which means I won, and now nothing soaks overnight. We shook on it like idiots." → *She ended a three-day dish standoff by ruling that the sink was pretending to be a crockpot; the resulting treaty was sealed with a handshake.*
**Example:** "Whether a hot dog is a sandwich. Four hours. In a car. We formally agreed to stop and neither of us has conceded."

### `safe_place` · comfort · **LIFT**
**Text:** "What's a place you have a completely unearned sense of ownership over? What's your spot?"
**Was:** "Describe a place that feels like home to you."
**Why:** "describe a place" is a description task, not a story task — it returns warm wallpaper and a sentiment close ("I could sit there forever"); the unearned claim is the funny, specific, human part, and it still delivers the rhythm-of-life detail comfort feeds on. **Also cut "or a feeling" from the help text** — it invites exactly the abstraction the tone rules can't use.
**Structure:** P ✓ this LIFT *repairs* a latent protagonist weakness rather than risking one: "describe a place" had no verbs at all and let the place be the subject (the `q6.1` failure mode), whereas the claim makes the answerer act — she laps the park, she refuses to get off the counter. R ✓ your own spot is live and cached. Pitch ✓.
**Proof:** "There's a bench at the dog park that is mine. It is not mine. A man sat on it in April and I lapped the park twice waiting for him to leave. I've never spoken to him." → *There is a bench at the dog park that Kayla regards as hers; when a man occupied it in April she lapped the park twice, in silence, until he left.*
**Example:** "My grandma's kitchen counter. I sit on it, she tells me to get off, I don't. Thirty years of the same argument, same rooster wallpaper."

### `standing_ritual` · comfort · **LIFT**
**Text:** "What's the standing plan in your week that never moves? What's the rule you enforce?"
**Was:** "What's the plan in your week that never moves? Tell me about the most recent one."
**Why:** "the most recent one" gets "I called my mom, we talked." Long-running rituals accumulate absurd governing rules, and those rules are the part that could only belong to this particular set of people.
**Structure:** **P — corrected.** My first draft asked for "the unwritten rules," and the answer it produced pitched *Dave*, whose 2022 offence named the trivia team: the funny thing belonged to a third party and the answerer was reduced to chronicler. That is `laugh_hardest` re-entering through the back door while I chased the joke. "**The rule you enforce**" makes the answerer the agent of the rule rather than its narrator, and the material survives the fix intact. R ✓ recurring by definition, instantly retrievable. Pitch ✓.
**Proof:** "Sunday pho with my brother, same booth since 2019. My rule is you can bring someone, but they have to order from the offal section. His girlfriend ordered tripe first try, so she's in." → *Sunday pho with his brother hasn't moved since 2019, and Ray admits newcomers only on an offal order — the brother's girlfriend cleared it first try with tripe.*
**Example:** "Sunday pho with my brother, same booth since 2019. My rule: you can bring someone, but they order from the offal section. His girlfriend picked tripe."

### `morning_person` · comfort · **KEEP**
**Text:** "Walk us through your morning routine — the real one, not the aspirational one."
**Why:** "the real one, not the aspirational one" is the bank's proven anti-performance device; it pulled a self-deprecating breach in every simulation and the routine arrives noun-loaded.
**Structure:** P ✓ solo by construction. R ✓ daily, live. Pitch ✓. Criterion 4 technically (a routine) — the canonical tolerated case.
**Proof:** "I snooze, I eat instant oatmeal standing up, I lose ten minutes looking for my keys because I refuse to own a key hook, and I'm exactly four minutes late to everything. It's a system." → *Nia declines on principle to own a key hook, forfeits ten minutes daily to the consequences, and arrives exactly four minutes late to everything — 'it's a system.'*
**Example:** "Snooze twice. Scroll phone guiltily. Stare at wall with coffee. Get ready in 15 minutes. Every day."

### `small_repair` · comfort · **LIFT**
**Text:** "What do you keep alive that most people would have let die? How's it doing?"
**Was:** "What's something in your life you keep quietly maintaining? Walk me through the last time you did it."
**Why:** "quietly maintaining" is a writerly category that made every simulated answerer stall audibly ("um… okay, my cast iron?"), and its register is faintly elegiac; "would have let die" is concrete and funny, covers plants, cars, starters, cast iron and long-distance friendships alike, and "how's it doing" invites the personification that makes these answers land.
**Structure:** P ✓ answerer maintains. R ✓ ongoing and live; the old "last time you did it" search is gone. Pitch ✓.
**Proof:** "My sourdough starter. Six years. He has a name, he's moved apartments three times, and I've left him with a sitter. He's doing great, thanks for asking." → *Six years, three apartments and one starter-sitter later, Milo's sourdough culture is thriving and answers to a name.*
**Example:** "My grandpa's watch. Worth about forty bucks, goes to a guy downtown once a year. He remembers the watch, not me, which I respect."

### `learned_from_someone` · comfort · **LIFT**
**Text:** "What do you still do exactly the way someone taught you? Who was it?"
**Was:** "Who taught you something you still do their way? What is it?"
**Why:** opening with "Who" spent the first twenty seconds of the answer on a third party and left the protagonist tilt flagged-but-live; leading with the habit keeps the answerer in frame throughout and lets the person arrive as a trailing attribution.
**Structure:** P ✓ *strengthened by the reorder* — this is the same family that killed `q9.2` ("who taught you to be on time") and `mentor_moment`, and word order is the whole defence: the habit lives in the answerer's present and holds every verb, while the teacher supplies four words of provenance. **Residual risk, stated honestly:** a sentimental answerer can still spend forty seconds on grandma. The reorder is a mitigation, not a guarantee — worth watching in the pilot, and this is the prompt in my batch most likely to need a second look. R ✓ cached daily habit. Pitch ✓.
**Proof:** "I fold towels in thirds. My dad worked at a Marriott in college and that's just how it's done. I've converted two roommates and lost one friend over it." → *Marco folds towels in thirds, per Marriott doctrine inherited from his father — a conversion campaign that has claimed two roommates and one friendship.*
**Example:** "Clean as you go. Marisol, my first boss at the coffee shop. My kitchen looks uninhabited mid-recipe and people find it unsettling."

### Bank — fun (10) + fished Q1, Q3 (10)

<!-- R3 · remarkability+fun pass, ON TOP OF the nine structural criteria · bank fun (10) + fished Q1 (6) + Q3 (4) -->
<!-- Every entry carries a Structure line confirming the three disqualifiers (protagonist / retrievability / pitchable) still hold. Four texts were corrected after the mid-run clarification; each is marked. -->

### `conspiracy` · fun · **LIFT**
**Text:** "What's a hot take you've actually tested? What's the evidence?"
**Was:** "What's a conspiracy theory or hot take you're willing to die on?"
**Why:** "conspiracy theory" pulls borrowed internet material — two of three sims returned memes (birds aren't real; the Mattress Firm bit that the live example itself models), which is somebody else's joke and fails only-this-person. Demanding that they've *tested* it makes the take personally empirical, and the deadpan rigour becomes the joke.
**Structure:** protagonist — the law is theirs and the testing is their act (stronger than the original, which could return a borrowed artifact). retrievability — no superlative, no "last"; a tested take is cached and rehearsed, since these people bring it up constantly. *(Corrected post-clarification: first draft said "collected evidence for," which gated on having literal records and made two sims stall — "tested" invites informal proof.)* pitchable — the evidence supplies the nouns.
**Proof:** "The 'good vibes only' thing — if a restaurant has a neon sign with a slogan on it, the food is bad. I have a note in my phone. I'm eleven for eleven. My friends send me photos of signs now to test me." → "Ray keeps a running note proving any restaurant with a neon slogan sign has bad food — eleven for eleven, and his friends now send him photos to test him."
**Example:** "Family-style restaurants are a scam — you get less food and you have to negotiate for it. I've done the math at three separate places. I bring this up on dates, which may be why I'm still on here."

### `worst_date` · fun · **LIFT**
**Text:** "Tell me about a date that went sideways. What was your move?"
**Was:** "What's your best worst-date story?"
**Why:** the modal bad-date story is vivid material about the *other* person ("he talked about his ex for two hours") and casts the answerer as a survivor, which is true of everyone in the pool.
**Structure:** protagonist — "what was your move" is the direct mitigation of the risk flagged on this prompt; it forces an action by the answerer rather than a catalogue of the date's antics, and extraction should follow the move, not the antics. retrievability — the original's "best worst-date" was a superlative; dropping it fixes a structural defect the previous pass tolerated, and the genre is rehearsed social currency, so instances are indexed. pitchable — yes.
**Proof:** "It turned out to be his coworker's engagement party — he'd double-booked us. Someone handed me the card to sign. I signed it 'so happy for you two — Jess, Dave's date' and left after the toast." → "Handed a congratulations card at what turned out to be her date's coworker's engagement party, Jess signed it 'so happy for you two — Jess, Dave's date,' and left after the toast."
**Example:** "It turned out to be his coworker's engagement party — he'd double-booked. Someone handed me the card to sign. I signed it 'So happy for you two — Jess, Dave's date' and left after the toast."

### `irrational_fear` · fun · **KEEP**
**Text:** "What's an irrational fear you have? Tell me about the last time it got you."
**Why:** the occasion tail rescues even a common fear — a generic phobia still produces an individual incident, and the register is low-stakes self-deprecation, the confirmed-positive craft device.
**Structure:** protagonist — the fear is theirs and the scene is their own behaviour (trapping the spider, doing the hop), not something a third party performs. retrievability — "the last time it got you" is licensed by the high-frequency clause: a recurring fear gets you often, so recency is genuinely indexed. pitchable — yes.
**Proof:** "Spiders, obviously. Last week there was one in the shower and I put a cup over it and then just — left the cup there. For two days. Because I couldn't do part two." → "Nia trapped a shower spider under a cup and then left the cup in place for two days, unable to face part two."
**Example:** "Escalators — the flattening part at the end. Last week at the airport I did the little hop, with a suitcase, and a kid laughed at me. Fair."

### `superpower` · fun · **RECAST**
**Text:** "What's something pointless you've put real effort into? Walk me through it."
**Was:** "If you could have one mundane superpower, what would it be — and what happened recently that made you need it?"
**Why:** a wish is not a fact about a person — even with my occasion tail bolted on, the pitch stays "X wishes they could Y," which is Charles's own named failure ("always pick the fastest grocery line"). Effort-spent-on-trivia is the same charm with an actual event under it, and unreasonable rigour about something that doesn't matter is among the most likeable things a person can disclose. *(Adjacency noted: `obsession` asks what you're into — a subject; this asks what you did — a labour. Different verbs, different material, but worth watching in the pilot.)*
**Structure:** protagonist — the labour is entirely theirs, which is a strict upgrade on a hypothetical that had no agent at all. retrievability — deliberately avoids "the most effort ever" (a superlative search); "something pointless you've put real effort into" is self-defining and people are quietly proud of it. pitchable — the proof pitch is among the strongest in the batch.
**Proof:** "I made a spreadsheet of every bagel place within a twenty-minute walk, with columns for crust, chew, and whether they toast it without asking. Toasting without asking is disqualifying. Thirty-one entries. I've shown it to people who did not ask to see it." → "Marco maintains a thirty-one-entry bagel spreadsheet with a column for whether they toast without asking — a disqualifying offence — and shows it to people who did not ask."
**Example:** "I built a spreadsheet ranking every bagel place within a twenty-minute walk. Columns for crust, chew, and whether they toast without asking, which is disqualifying. Thirty-one entries. I show it to people who didn't ask."

### `apocalypse_skill` · fun · **KEEP**
**Text:** "What's the useful thing you can do that nobody expects? When did it last come in handy?"
**Why:** surprise is built into the ask, the occasion tail supplies the event, and the modal answer is competence demonstrated rather than claimed — tone rules 6 and 8 satisfied without effort.
**Structure:** protagonist — their skill, their act. retrievability — "when did it last come in handy" is licensed by high frequency for a skill in active use. pitchable — yes.
**Proof:** "I can back up a trailer — grew up on a farm. Last month my neighbour was doing the nineteen-point-turn thing with a U-Haul and I just appeared, did it in one, and walked back inside." → "When a U-Haul defeated the neighbour, Cole appeared, backed the trailer in one, said nothing, and went back inside."
**Example:** "I can back up a trailer — farm kid. Last month my neighbour was losing to a U-Haul, so I did it in one try and walked back inside without a word."

### `most_me_photo` · fun · **LIFT**
**Text:** "What's a photo of you that would take some explaining? Describe it."
**Was:** "If you had to pick one photo on your phone that captures who you really are, what would it be?"
**Why:** "captures who you really are" is an identity judgment — slow, self-conscious, and it returns the curated self, the opposite of the unguarded specificity that makes a card land. Swapping the selection criterion from *representative* to *needs explaining* keeps the described-image payload and puts a story under it.
**Structure:** **corrected post-clarification.** My first draft read "a photo on your phone that would take some explaining," which silently dropped the protagonist guarantee — a photo needing explanation is very often of a friend, a sign, or a screenshot, and two test sims returned exactly that (a mate asleep in a Waffle House), which is the `laugh_hardest` failure re-imported. Restoring **"of you"** re-secures ownership at a cost of two words. retrievability — an improvement on the original, whose identity judgment made all three sims hedge; incongruous photos are indexed as stories. pitchable — yes.
**Proof:** "There's one of me holding a frozen turkey like a newborn, in July, in a Halloween costume. I lost a fantasy football bet and the forfeit was a full newborn photoshoot with a turkey. There are eleven of them." → "One photo on Dev's phone requires an explanation involving a lost fantasy-football bet, a frozen turkey, and a full newborn-style photoshoot in July — there are eleven of them."
**Example:** "Me holding a frozen turkey like a newborn, in July, in a Halloween costume. I lost a fantasy football bet and the forfeit was the full photoshoot. There are eleven of them."

### `dating_confession` · fun · **KEEP**
**Text:** "What's the part of a first date you're actually bad at? Tell me about one that went that way."
**Why:** low-stakes behavioural confession in the one context where it is maximally disarming — the reader is contemplating a first date with this person and is handed the failure mode as comedy.
**Structure:** protagonist — their own incompetence, their own incident. retrievability — no superlative; the failure mode recurs, so instances are available. pitchable — yes.
**Proof:** "The ending. The goodbye. I have hugged, handshaked, and waved at the same person in one motion. Last month I went for the hug as she went for the cheek thing and I basically headbutted her." → "Maya has hugged, handshaked, and waved at the same person in a single motion — the most recent goodbye ended in a light headbutt and a 'nice headbutt' text."
**Example:** "The goodbye. I've hugged, handshaked, and waved at the same person in one motion. Last one ended in an accidental headbutt. She texted 'nice headbutt,' so — fine."

### `first_job` · fun · **KEEP**
**Text:** "What was your first job and what were you bad at?"
**Why:** permanent autobiographical landmark, so retrieval is instant, and "what were you bad at" is the impressive-gate inverted — nobody performs, everybody has a specific humiliation ready.
**Structure:** protagonist — theirs. retrievability — landmark-marked, the cleanest case in the bank. pitchable — yes.
**Proof:** "Umpire for little league, thirteen years old. Bad at everything. I called a kid out at the plate and his grandmother booed me. His grandmother. I did it three summers anyway — forty bucks a game." → "At thirteen Marco umpired little league for $40 a game and was booed by a grandmother — he re-upped for three summers."
**Example:** "Dairy Queen at sixteen. Could not do the curl on the cone — mine looked defeated. They moved me to drive-thru, where I flourished."

### `overpacked` · fun · **KEEP**
**Text:** "What's something you always bring that nobody else does? When did it last pay off?"
**Why:** "nobody else does" screens for the unusual object and the payoff clause forces a scene; softest keep in the batch — chargers and snacks are live modal answers — but the vindication moment individuates even a mundane item.
**Structure:** protagonist — their habit, their vindication. retrievability — "when did it last pay off" licensed by high frequency for a habit in active use. pitchable — yes.
**Proof:** "Band-aids. In every bag I own. Last month at a wedding a bridesmaid's heel strap destroyed her ankle and I produced one mid-reception like a magician. I've been thanked in a toast. Not my toast." → "Mid-reception, a bridesmaid's ankle met its match in Dana's ever-present band-aids — she has since been thanked in a toast that wasn't hers."
**Example:** "Band-aids, in every bag. At a wedding last month a bridesmaid's heel strap drew blood and I produced one mid-reception. I've since been thanked in a toast. Not my toast."

### `bad_at_pretending` · fun · **KEEP**
**Text:** "What are you visibly bad at hiding? When did it last give you away?"
**Why:** the tell is self-indexed because people are told about it repeatedly, the answerer owns the failure, and the giveaway incident is recent by nature.
**Structure:** protagonist — the correct inversion of the witness problem: others witness *them*. retrievability — high-frequency tell, recent by nature. pitchable — yes.
**Proof:** "Being bored. My face just leaves. In a meeting two weeks ago my manager stopped and said 'Kayla has notes' and I did not have notes. I had a face." → "Kayla's boredom face is public record — her manager once announced 'Kayla has notes' when Kayla had only a face."
**Example:** "My boredom face. In a meeting my manager stopped and said, 'Kayla has notes.' I did not have notes. I had a face."

### `q1.1` (theatre kid) · i_sharing · **LIFT**
**Text:** "On stage, there's always a disaster. What was yours?"
**Was:** "Tell me about a night on stage that still lands when you think about it. What went right — or what went wrong?"
**Why:** 23 words rebuilding a scene the tap already carries, and "still lands when you think about it" is vague where the gold is the disaster — every theatre kid has one rehearsed, and the wink licenses it instantly.
**Structure:** **corrected post-clarification.** My first draft read "What went wrong on stage? There's always something" — but the subject of "went wrong" was unspecified, so it admitted the *show's* disaster or another actor's, which is the protagonist leak f4 already flagged on this option (ensemble members returning a collective "we"). **"What was yours"** is a possessive that secures ownership while keeping the wink, at nine words. retrievability — theatre disasters are rehearsed social currency; no superlative. pitchable — yes.
**Proof:** "Opening night, there's this song where I slam my mug on the table — and the mug just exploded. I had a two-second decision and I kept singing, picked up the biggest shard, and toasted with it. The audience thought it was on purpose." → "Mid-song on opening night the prop mug exploded in Theo's hand; he picked up the largest shard, toasted the room with it, and never stopped singing."
**Example:** n/a (fished)

### `q1.2` (jock) · admiration · **LIFT**
**Text:** "What was your actual job on that team? The one nobody understood."
**Was:** "Tell me about a team you were on and the thing you were actually good at."
**Why:** "the thing you were good at" returns a trait ("I was good at hills"), and traits become adjectives, which is the failure mode — asking for the *job nobody understood* pulls the niche-role detail that is both individuating and funny.
**Structure:** protagonist — "your actual job," theirs. retrievability — a position is cached identity, asserted by the tap. pitchable — yes. Residual risk: a pure role description with no action ("I was the long snapper"); the "nobody understood" framing reliably pulls the grievance that carries voice.
**Proof:** "I was a libero, which is the one in the different coloured jersey who's not allowed to attack. My whole job was reading the hitter's shoulder. Nobody remembers digs. There's no highlight reel for digs." → "In high school Priya was the libero — different jersey, forbidden to attack, whole job reading a hitter's shoulder — and remains bitter that digs have no highlight reel."
**Example:** n/a (fished)

### `q1.3` (honor-roll grinder) · admiration · **LIFT**
**Text:** "What were you grinding for — and where did that energy go?"
**Was:** "What were you grinding for at seventeen? Tell me whether it turned out to be worth it."
**Why:** "was it worth it" is an evaluation ask that returns reflection — worthy and unfunny. The remarkable material in every sim was the *residue*: the machinery still running on something absurd. So ask for it directly.
**Structure:** protagonist — their grind, their energy. retrievability — the tap asserts the grind, so it is pre-retrieved; "at seventeen" is carried by the item stem. pitchable — yes.
**Proof:** "Pre-med since I was nine, flashcards at lunch, the whole thing. I'm in supply chain now, which is a whole story. But I still make flashcards. I made flashcards to learn wine. My girlfriend thinks it's a medical condition." → "The kid who made flashcards at lunch for pre-med now works in supply chain and still makes flashcards — most recently to learn wine, which his girlfriend regards as a medical condition."
**Example:** n/a (fished)

### `q1.4` (the one organizing the hang) · admiration · **LIFT**
**Text:** "What did you pull off? How many people, and what went wrong?"
**Was:** "Tell me about something you organised at seventeen that actually happened. How many people, and what went wrong?"
**Why:** construct untouched and already excellent — a length cut only, since the item stem carries "at seventeen" and the option carries "organising," taking it from 18 words to 12.
**Structure:** protagonist — "what did *you* pull off." retrievability — no superlative; the tap asserts they organised things. pitchable — yes.
**Proof:** "Senior skip day. I had a spreadsheet. Forty-two people, three beaches ranked by cop likelihood. I told everyone the wrong exit and half the class ended up at the wrong beach — and both halves thought they were the real party." → "At seventeen he ran senior skip day off a spreadsheet — forty-two people, beaches ranked by cop likelihood, half the class still convinced they were at the real one."
**Example:** n/a (fished)

### `q1.5` (happily unaffiliated) · i_sharing · **LIFT**
**Text:** "So what were you doing instead? Did anyone at school know?"
**Was:** "What were you doing at seventeen while everyone else was doing the school thing?"
**Why:** the option already carries the counterfactual, so restating it wastes the prompt's only two clauses — "did anyone know" is the upgrade, pulling the secret-life detail that makes this material sing rather than a list of after-school activities.
**Structure:** protagonist — theirs. retrievability — a phase of life, cached and asserted by the tap. pitchable — yes. Criterion 4 (categorical) remains, as in the previous pass: it is a fixable defect, not a disqualifier, and tightening it would gate what is deliberately the low-pressure "out" option.
**Proof:** "Video games and forums, dude — embarrassingly deep in a Halo forum. I was writing essay-length posts, that's actually where I learned to write. I moderated a forum with four thousand people on it and nobody at my school knew." → "At seventeen he was quietly moderating a four-thousand-member Halo forum in essay-length posts, a fact his school never learned."
**Example:** n/a (fished)

### `q1.6` (a completely different person) · admiration · **KEEP**
**Text:** "You said you're a completely different person now. What changed — and when did you notice?"
**Why:** "when did you notice" converts transformation-talk into a locatable moment, which is the whole trick; it is the map's payoff prompt and the one sanctioned "you said" callback, and churning it would cost more than it gains.
**Structure:** protagonist — their change, their noticing. retrievability — the noticing-moment is landmark-marked; the tap asserts the transformation. pitchable — yes.
**Proof:** "At seventeen I was aggressively shy — wouldn't order my own food. I took a phone sales job *because* it terrified me. There was a night two years in when a heckler yelled something and I was just… happy? Like, oh, this is fun for me now." → "The kid who wouldn't order his own food took a phone-sales job precisely because it terrified him — he knew it had worked the night a heckler made him happy."
**Example:** n/a (fished)

### `q3.1` (already home, shoes off) · comfort · **LIFT**
**Text:** "What's your exit strategy? Tell me about the last time you used it."
**Was:** "Tell me about a party you were glad you left. Where'd you go instead?"
**Why:** my previous fix still permitted "I went home and watched TV," which is thin and true of thousands. "Exit strategy" is funnier and more individuating because it presumes craft, and the delight in this tap has always been the *method* — the Irish exit, the pre-positioned coat — plus the smugness of being right.
**Structure:** protagonist — their strategy, their exit. retrievability — note this is the **cached-trait-first, instance-second** shape, which is why "the last time" is legal here where it failed in the original. The original made the *party* the payload ("the last party you left early") among indistinguishable blurred events; here the *strategy* is the payload, answered from cached self-knowledge, and the instance is illustration where satisficing is harmless. Same structure as `irrational_fear` and `overpacked`. pitchable — yes.
**Proof:** "I have a rule — I say hi to the host twice, once arriving and once about ninety minutes in, and the second one is actually goodbye but they don't know it yet. Did it at a gallery opening last month, then ate tacos on the curb in my nice jacket." → "Sam's exit strategy is two greetings to the host, the second of which is secretly goodbye — last month it delivered him from a gallery opening to tacos on a curb, nice jacket still on."
**Example:** n/a (fished)

### `q3.2` (at a side table, deep in the actual conversation) · i_sharing · **LIFT**
**Text:** "What was your side of it? Did you text them afterwards?"
**Was:** "What's a party conversation you couldn't drop? What was your side of it?"
**Why:** the follow-through is the individuating act — a conversation becomes a story about the answerer at the moment they chase it afterwards (the 2 a.m. podcast email).
**Structure:** **corrected post-clarification.** My first draft read "What did you get into? Did you text them afterwards?" — which traded away the protagonist fix the previous pass had installed, since "what did you get into" points at the conversation and the known failure here is the fascinating stranger owning it (the container-ship uncle). Restoring **"what was your side of it"** keeps the answerer's position as the primary ask and adds the follow-up as the escalation. Reads as a direct continuation of the tapped option, q9.4-style. retrievability — a conversation you couldn't drop is memorable by construction. pitchable — yes.
**Proof:** "New Year's, someone said nobody actually likes their job and I would not let it go — I started listing people, the lady at the fabric store, my brother the arborist. We were still going at 2am and I emailed him a podcast about it the next day." → "At a New Year's party Ben built the case that people secretly love their jobs — closing argument at 2 a.m., supporting podcast emailed the following morning."
**Example:** n/a (fished)

### `q3.3` (outside, handing out sparklers) · admiration · **LIFT**
**Text:** "What did you end up running that you never signed up for?"
**Was:** "Tell me about the last thing you ended up running that you never signed up to run."
**Why:** the reluctant-commander construct needs no help — the chaos arrives on its own; this drops "the last" per our own retrievability rule and trims 16 words to 12.
**Structure:** protagonist — theirs by construction. retrievability — marked, story-shaped event class; "the last" removed. pitchable — yes.
**Proof:** "My friend's bachelorette. I was not the maid of honour, but the maid of honour got food poisoning day one in Nashville, and suddenly I'm holding the itinerary, the Venmo spreadsheet, nine women, one of whom lost her phone in a river." → "When the maid of honour went down on day one in Nashville, Cass inherited the itinerary, the Venmo spreadsheet, and nine women — one of whom lost a phone to a river."
**Example:** n/a (fished)

### `q3.4` (on the dance floor since the first song) · i_sharing · **LIFT**
**Text:** "Tell me about a night you closed down. Who was still standing?"
**Was:** "Tell me about the last night you closed down. Who else was still there at the end?"
**Why:** "who was still standing" beats "who else was still there" — same cast-of-survivors payload, funnier framing, and the survivors clause is what makes this produce scenes instead of a statement about liking to dance.
**Structure:** protagonist — the answerer is the one who outlasted the room, and the spine of every sim pitch is their act; the co-stars are colour. retrievability — "the last" dropped; closing down is high-frequency for this tap. pitchable — yes.
**Proof:** "My cousin's wedding — by the end it was me, the groom's grandma, who is a legend, and four groomsmen. The DJ was packing up so somebody put a phone in a cup as a speaker, and me and the grandma did a full song to phone-speaker Motown while they folded tables around us." → "Rosa outlasted the DJ at her cousin's wedding — the closing number was phone-in-a-cup Motown with the groom's grandmother, performed while staff folded tables around them."
**Example:** n/a (fished)

### Fished — Q5, Q6, Q9, Q10 (16)

<!-- R4 · remarkability + fun pass · fished Q5 (4) · Q6 (4) · Q9 (4) · Q10 (4) — 16 prompts. KEEP 7 · LIFT 8 · RECAST 1. All tiers preserved; option→prompt mapping stays 1:1. -->

## Floor audit — all 16 re-checked against the three disqualifiers after the remarkability pass

Both tests apply: the nine criteria are the floor, remarkability + fun is the bar. Every text below satisfies both. One genuine slip was found and corrected in this audit:

- **q10.4 corrected.** My lift read "When did that get **hardest**?" — a superlative, demanding a ranking search across instances of restraint, exactly the error I flagged in my own earlier fix to q6.1 ("farthest"). Replaced with "What did you end up going along with? How long did you keep quiet?" — no ranking, both clauses answerer-owned.

Specific checks against the two traps named for this batch:

- **Q10 did not trade heaviness for a witness construct.** `q10.1`'s recast is *more* protagonist-clean than the text it replaces: previously the friend's crisis supplied all the drama (the ex, the addiction, the intervention), and the answerer merely spoke into it. Now the answerer's own utterance **is** the drama and the consequence lands on them — "told her the hashtag sounded like a mattress sale, got expelled from the group chat, and won." Strip the third party and a full characterisation remains. `q10.2` and `q10.4` keep the answerer's act as the spine (the green couch up three flights; the dress code worn). `q10.3` is the closest to the line in the whole batch — the other person changes — but stripping them still leaves "asks people what they'd do instead until they answer it out loud, then claims four percent of the credit," which is a person. Flagged rather than waved through.
- **Q9 manufactured no drama.** Punctuality is habit-shaped, so all four prompts mine the specificity of the *system* rather than inventing an occasion nobody can retrieve. No superlatives, no unindexed internal states. `q9.1` remains habitual by design (criterion 4 unmet, deliberately) on the same tolerance `morning_person` was passed under — rhythm-of-life material is legitimately habitual for the comfort angle; what "the honest version" fixes is criterion 9, which was the actual defect. `q9.2` contains no third party at all, so the witness failure that killed the original cannot recur.

Two residual risks, noted not hidden: `q6.2`'s "who else was in on it" could in principle hand the story to a travelling companion (the anchoring first clause is "which place did **you** keep going back to", and it held in simulation); and `q6.1`'s "Worth it, or a con?" is answerable in one word if the first clause is ignored, though the effort clause elicited elaboration in every simulation.


### `q5.1` (that was this month) · self_expansion · **LIFT**
**Text:** "What did you say yes to this month? Tell me the part where you realised what you'd agreed to."
**Was:** "What did you say yes to this month? Start at the moment you said yes."
**Why:** "Start at the yes" aims at the dullest beat — the comedy of this item is the dawning horror afterwards, and the flat modal answer ("a work committee, I couldn't say no in a meeting") only becomes remarkable once you ask for the oh-no moment.
**Proof:** *"The planning committee — and then I found out it's not one hour, it's the whole holiday party, and I'm apparently in charge of the raffle. I have a spreadsheet of prizes now. I've become a raffle person."* → "Sara said yes to a work committee in a meeting she couldn't escape and is now, somehow, in charge of the holiday raffle — she has a spreadsheet of prizes and has accepted her new identity."

### `q5.2` (sometime this year) · self_expansion · **LIFT**
**Text:** "What did you say yes to this year with no idea what you were doing? How far in did you get before it hit you?"
**Was:** "What did you say yes to this year with no idea what you were doing? Start at the yes."
**Why:** same fix as q5.1 — the in-over-your-head middle is where the nouns and the comedy live, and "how far in before it hit you" retrieves a scene rather than a decision.
**Proof:** *"My sister asked me to do her wedding flowers 'cause I'm crafty and I said yes at brunch before I understood the question. It hit me at the wholesale market at 4am holding a bucket of hydrangeas, realising I had to keep 200 stems alive in my fridge for two days."* → "Kate said yes to her sister's wedding flowers before she understood the question, and grasped the scale at 4 a.m. in a wholesale market with 200 hydrangea stems to keep alive in her own fridge."

### `q5.3` (a few years back) · self_expansion · **KEEP**
**Text:** "Tell me about the thing you said yes to unqualified. How badly did it go?"
**Why:** "How badly did it go" is the best-aimed clause in the whole map — it presumes the disaster, licenses self-deprecation, and produced a remarkable answer in 3 of 3 simulations. This is the model the rest of the item should copy.
**Proof:** *"Coaching my nephew's soccer team. I have never played soccer. The kids figured it out about week two. One of them started correcting me — he was seven. I let him run drills."* → "Dana volunteered to coach her nephew's soccer team having never played; by week two a seven-year-old had staged a coup and was running the drills."

### `q5.4` (I like knowing what I'm doing) · admiration · **LIFT**
**Text:** "What do people come to you about? Where were you the last time someone asked?"
**Was:** "What's the thing you know cold — where you're the one people come and ask?"
**Why:** the old text asks for a *domain* and gets one ("cars", "Excel") — a thousand people. The remarkable material is the absurdity of the consultation itself, and asking where they were when it happened retrieves it for free.
**Proof:** *"My buddy FaceTimed me from a dealership last month. I'm at dinner. He just pointed the camera at an engine bay and said 'well?' I told him to walk away and he walked away."* → "Ben has been FaceTimed from a dealership forecourt mid-dinner and shown an engine bay with a single 'well?' — the buyer walked away on his verdict."

### `q6.1` (I'm not missing the must-see things) · self_expansion · **LIFT**
**Text:** "Tell me about a must-see you dragged yourself out of bed for. Worth it, or a con?"
**Was:** "What's the farthest you've gone for a must-see? How did the day go?" *(my own previous fix — it smuggled in a superlative, "farthest", and created a measurement problem: "is four hours far? I don't know how to measure this.")*
**Why:** "Dragged yourself out of bed for" names a marked, instantly retrievable occasion and shows the fanaticism; "worth it, or a con?" restores the verdict comedy the original had while attaching it to something the answerer actually *did*.
**Proof:** *"The Mona Lisa, which is a con, and I say that as someone who queued ninety minutes. It's the size of a cereal box and you're looking at it through forty phones. But I did the Sistine Chapel the same trip and stood there forty minutes and I'm not even religious."* → "Ella queued ninety minutes for the Mona Lisa and calls it a con — 'a cereal box behind forty phones' — then stood forty unreligious minutes under the Sistine Chapel the same week."

### `q6.2` (whatever's near where I'm staying) · comfort · **LIFT**
**Text:** "Which place did you keep going back to? Who else was in on it?"
**Was:** "Tell me about a trip where the best part happened within three blocks of where you were staying."
**Why:** 17 words rebuilding a scene the option already carries, wrapped around a superlative ("the best part") and an odd measurement filter ("three blocks"). Cut to 11; "who else was in on it" recruits the travelling companion, whose disagreement is where the comedy turned out to be.
**Proof:** *"The pool, genuinely. We were in Costa Rica and I found a chair and that was my week — four books. My girlfriend had a whole itinerary and she was NOT in on it. She went to a volcano. I heard it was great."* → "Handed a Costa Rican itinerary, Marcus found a pool chair and four books; his girlfriend went to the volcano alone and reports it was great."

### `q6.3` (I walk until something happens) · self_expansion · **KEEP**
**Text:** "Tell me about a walk that turned into something. Where were you?"
**Why:** "Turned into something" invites escalation and got it in 3 of 3 — a three-year anonymous note exchange, an accidental six-month salsa career, a 2 a.m. accordion bar. Nothing to improve.
**Proof:** *"I walked into a salsa class basically by accident — there was music and a door open and someone waved me in and I did not leave. I was terrible. I went back for like six months."* → "An open door and a wave got Dana into a salsa class she had no business being in; she stayed six months and was terrible throughout."

### `q6.4` (I ask someone who lives there and go do that) · self_expansion · **KEEP**
**Text:** "Where did a local once send you? Did you actually find it?"
**Why:** "Did you actually find it?" is the engine — it converts a recommendation into a quest with a failure mode, and produced the hunt in 2 of 3 (two hours describing a corner in Oaxaca; lost and rained on in Edinburgh). "Once" earns its place by signalling one occasion rather than a habit.
**Proof:** *"Our taxi driver — we asked where HE eats and he drove us to his cousin's. No sign, plastic chairs, a woman making tlayudas over coals. Finding it again the next day took two hours because there's no address."* → "In Oaxaca they asked the driver where he eats — no sign, plastic chairs — and spent two hours the next day describing a corner to strangers to find it again."

### `q9.1` (I'm there at 6:50) · comfort · **LIFT**
**Text:** "Ten minutes early, every time. What do you actually do with them? The honest version."
**Was:** "Ten minutes early, every time. What's the ritual?"
**Why:** "What's the ritual?" permits "I look at my phone" as a complete answer and one simulation gave exactly that. "The honest version" is `morning_person`'s proven device — it forecloses the neutral description and buys the confession, which is where the charm is.
**Proof:** *"Honest version? I sit in my car. I don't even go in. I'll be in the parking lot at 6:48 like a private investigator and go in at 6:58, because walking in first is worse than waiting."* → "Nate is always ten minutes early and spends every one of them in the parking lot like a private investigator, because walking in first is, in his view, worse."

### `q9.2` (I'm there at 7) · comfort · **KEEP**
**Text:** "How do you actually pull off exactly-on-time? Walk me through the math."
**Why:** the tap selects for people running a system — landing on 7:00 rather than 6:50 or 7:05 is not luck — and "walk me through the math" presupposes it, producing delightfully particular numbers in 2 of 3. Holds as the `q9.2` replacement.
**Proof:** *"I pad everything by seven minutes. Not five, not ten — seven. Five isn't enough and ten means I'm early and then I'm the weirdo waiting. So seven. I've tested this."* → "Priya pads every journey by exactly seven minutes — five isn't enough, ten makes her the weirdo waiting — a figure she says she's tested."

### `q9.3` (7:05, and I texted) · fun · **KEEP**
**Text:** "What's the thing that always makes you five minutes late?"
**Why:** the fun tier working exactly as designed — a signature flaw, self-indexed, and every simulation volunteered a concrete culprit plus its own punchline. Nothing to add.
**Proof:** *"Parking. I leave enough time to drive but never enough to park, which after fifteen years in this city is arguably a choice."* → "After fifteen years in the city, Dev still budgets for the drive and not the parking — which he concedes is, at this point, a choice."

### `q9.4` (7:15, but I have a story) · fun · **KEEP**
**Text:** "Okay. Tell me the story."
**Why:** verified rather than assumed — simulated three ways (accidental express train, cornering a loose dog with a granola bar, refusing to interrupt an Uber driver mid-divorce) and all three produced a self-owned, funny, concrete scene. Four words work because the tap did every bit of the retrieval.
**Proof:** *"I got on the express by accident — didn't notice till we blew past my stop, ended up two neighborhoods over, and there was a flower place right by the station, so I just… committed. Walked in at 7:15 like this was the plan."* → "Jess arrived at 7:15 with flowers from the neighbourhood the express train accidentally took her to — sold as if it had been the plan all along."

### `q10.1` (I say exactly what I think) · admiration · **RECAST**
**Text:** "When did your honesty get you in trouble? It doesn't have to have been serious."
**Was:** "Tell me about a time you said the hard thing to someone you love. How did it land?"
**Why:** the modal answer was an intervention, an addiction or a breakup — admirable, sombre, and roughly 1 in 3 went noun-free out of privacy instinct. It earned respect from a polite distance, never a desire to meet. Bluntness is the trait, and bluntness is *funniest* at low stakes; "it doesn't have to have been serious" is `bet_on_yourself`'s de-gating move, which licenses the wedding-hashtag version while still permitting the real one. Same trait, same tier, material a stranger actually enjoys.
**Proof:** *"I told my best friend her wedding hashtag was bad. It was #MrAndMrsAlways and I said it sounded like a mattress sale. She uninvited me from the group chat for a day. She changed it though."* → "Nina told her best friend the wedding hashtag sounded like a mattress sale, got expelled from the group chat for a day, and won: the hashtag changed."

### `q10.2` (I say it once, then I'm supportive) · admiration · **KEEP**
**Text:** "Tell me about a time you said your piece once and then showed up anyway."
**Why:** the contradiction is welded into the construct, so it pitches every time without the prompt working for it — the objection registered once, then the couch up three flights, the starter kit in the closet, the lab cleared at ten at night. Best prompt in Q10 and one of the best in the map.
**Proof:** *"I told my sister once — one time, at the coffee place — I think this is a mistake and I'll never bring it up again. And then when they got the apartment I showed up with the truck. Carried that stupid green couch up three floors. He's actually grown on me, which nobody tell her."* → "Dan told his sister the ex was a mistake exactly once — then showed up with the truck and carried their green couch up three flights."

### `q10.3` (I ask questions until they hear themselves) · admiration · **LIFT**
**Text:** "When did that actually work? And how much credit do you actually deserve?"
**Was:** "When did that actually work? Walk me through the conversation."
**Why:** this construct's hazard is that the raw material arrives self-congratulatory ("I got them to see it"), which tone rule 1 can't use. Both strong simulations defused it by *volunteering* a modesty disclaimer — "he still says I tricked him", "ten percent credit". Building the credit question into the prompt makes that joke structural instead of lucky, and it rescues the categorical answerer too.
**Proof:** *"My roommate wanted to quit her job and I just kept asking what she'd do instead until she answered it out loud and then applied. Credit? Honestly like four percent. She did it. I just asked annoying questions at the right time."* → "Priya's roommate talked herself into quitting under a barrage of what-would-you-do-instead; Priya assesses her own contribution at four percent."

### `q10.4` (I keep my mouth shut and stay close) · comfort · **LIFT**
**Text:** "What did you end up going along with? How long did you keep quiet?"
**Was:** "Tell me about a time you stayed close to someone through something you didn't agree with."
**Why:** 16 abstract words where the option already carries the whole scene. The remarkable thing in the strong answers was never the restraint in the abstract — it was the *artefact of complicity*: the peppermint oil still in the bathroom, the starter kit, the dress code worn. "What did you end up going along with" asks for that object directly; "how long did you keep quiet" supplies the duration that makes it impressive without ever claiming it. Both clauses are the answerer's own acts.
**Proof:** *"Her baptism thing — she asked me to come and I went and sat through three hours, and there's a dress code. I wore the dress code. Two years I've kept quiet. I have opinions and I wore the dress code."* → "He has opinions about his sister's church, has kept them to himself for two years, and wore the dress code through a three-hour baptism anyway."

### Fished — Q13, Q14, Q15, Q19, Q21 (21)

<!-- R5 · remarkability+fun pass · fished Q13 (5), Q14 (6), Q15 (5), Q19 (1), Q21 (4) = 21 -->
<!-- Every entry carries a Floor line: the three disqualifiers (protagonist / retrievability / pitchable) are a hard floor; remarkability+fun is the bar stacked on top. Both must hold. -->
<!-- Self-audit after the mid-run clarification caught 4 regressions in my own lifts: q14.3 reached for a superlative, q13.1 and q15.2 tilted the protagonist to a third party, q21.3 dropped the occasion. All corrected below; the corrections are noted in each Why. -->

### `q13.1` (outside before most people were up) · self_expansion · **LIFT**
**Text:** "Which morning? What time was the alarm — and who else was up?"
**Was:** "Which morning? Where were you, and what time did you start?"
**Why:** "where were you" collects a trailhead name, the least interesting fact available. The alarm time is the same question aimed at the absurd commitment, and the cast of fellow early-risers is the comedy. **Corrected mid-run:** my first attempt was "who else is out there at that hour," which ended the prompt on other people and risked forty seconds about a stranger who fishes — the same tilt that killed `q9.2`. Keeping the answerer's own alarm as the first clause plants the verbs before the cast arrives.
**Floor:** protagonist — the alarm and the going are hers, the regulars are scenery oriented around her presence · retrievability — "which morning" points into the tapped last-three-Saturdays, no ranking · pitchable — yes.
**Proof:** *"Saturday. Alarm was 5:10, which is objectively unwell. And it's the same guy fishing off that one rock every single time — we nod, we've never spoken once."* → "Mara's Saturday alarm goes off at 5:10, an hour she concedes is unwell, and delivers her to a standing nodding acquaintance with a man who has never spoken to her."

### `q13.2` (nothing on the calendar, and that was the point) · comfort · **LIFT**
**Text:** "The last one — what did you end up doing instead of nothing?"
**Was:** "Walk me through the last one. What actually ended up happening?"
**Why:** an empty Saturday is low-event by definition, so "what happened" gets the honest answer "not much." The story is always the small absurd hijacking, and "instead of nothing" is itself the joke that licenses it.
**Floor:** protagonist — her own derailment, no third party · retrievability — "the last one" is licensed because the item frame is literally the last three Saturdays; no superlative · pitchable — yes.
**Proof:** *"I was fully going to do nothing. And then at two in the afternoon I decided to descale the coffee maker, and that turned into cleaning the whole kitchen, and I found a receipt from 2019 and read the entire thing like it was a letter from someone."* → "Handed a completely empty Saturday, Priya descaled the coffee maker at 2 p.m., cleaned the kitchen on the momentum, and read a 2019 receipt like correspondence."

### `q13.3` (elbow-deep in something I was making or fixing) · admiration · **LIFT**
**Text:** "What are you making or fixing right now? What's the part that's fighting you?"
**Was:** "What are you making or fixing right now? Walk me through where it's at."
**Why:** "where it's at" invites a status report and only sometimes surfaces the trouble; naming the fight guarantees the breach, which is where every maker's specificity and self-deprecation live.
**Floor:** protagonist — maker by construction · retrievability — present tense, on the bench right now · pitchable — yes.
**Proof:** *"A 1978 Marantz receiver, twenty bucks on Craigslist because it hums. The part fighting me is the right channel — I recapped the left and it's beautiful, and the right one has this ghost hum I cannot find. My kitchen table's been a workbench since March."* → "Sam's kitchen table has been a workbench since March, host to a twenty-dollar Marantz whose left channel he has perfected and whose right still carries a ghost hum he can't locate."

### `q13.4` (at someone's kitchen table too long) · comfort · **LIFT**
**Text:** "Whose kitchen table, and what time do you actually leave?"
**Was:** "Whose kitchen table, and what keeps you there?"
**Why:** "what keeps you there" risks the abstract answer ("we just talk"). The time question is funnier and unpacks the whole evening — the gap between the stated errand and the actual departure contains the reason anyway.
**Floor:** protagonist — the "whose" opening tilts, but the operative clause is the answerer's own overstaying, the same recovery structure the review endorsed on `learned_from_someone` · retrievability — habitual and current · pitchable — yes. Tolerated defect 4 (ritual, not one occasion) — the ritual *is* the construct and answers arrive noun-dense.
**Proof:** *"My sister's. I say I'm swinging by for a second at four and I have never once left before nine. Her kids climb on me like furniture, her husband makes me taste things off the smoker, and then everyone goes to bed and me and her do the actual talk while she pretend-cleans."* → "Rosa swings by her sister's for a second at four and leaves at nine — climbed on by nieces, conscripted as smoker-taster, staying for the real conversation that starts once the kitchen empties."

### `q13.5` (working, and not entirely mad about it) · admiration · **LIFT**
**Text:** "What's a tiny part of your job you'd honestly do for free?"
**Was:** "What's the part of your work you'd still do on a Saturday?"
**Why:** the old phrasing let desk workers answer at LinkedIn altitude ("the problem-solving part"); "tiny" plus "for free" forces the unglamorous sliver, where the surprising devotion lives. **Corrected mid-run:** "the tiny part" → "a tiny part," because the definite article smuggles in a ranking the answerer would have to perform.
**Floor:** protagonist — their own work and their own devotion · retrievability — cached self-knowledge, no superlative and no ranking · pitchable — yes. Tolerated defect 4 (a part of the job, not an occasion) — same latitude as `morning_person`; the sliver arrives welded to concrete texture.
**Proof:** *"Honestly? Naming things. I name all our internal projects and I take it deeply seriously — we've got a whole Norse mythology thing going and I will fight people about it. Nobody asked me to do this. It's not in my job description."* → "Nobody assigned Dev the naming of internal projects; he took it anyway, ran the entire roadmap through Norse mythology, and will fight you about it."

### `q14.1` (the art) · i_sharing · **LIFT**
**Text:** "Which piece, and how did you end up with it?"
**Was:** "Tell me about one thing on your walls. Where did it come from?"
**Why:** the tap already said "the art," so "one thing on your walls" rebuilds scene the option carries; "how did you end up with it" is more active than "where did it come from" and aims at provenance, where the story is. Near-lateral — the smallest change in this batch.
**Floor:** protagonist — acquiring and keeping it are her acts; taste enacted, which is the i_sharing rule · retrievability — walls are mentally scannable, she picks · pitchable — yes.
**Proof:** *"The bull skull. Found it on a ranch road in Wyoming with my ex, made him put it in the trunk and it smelled — bad. I bleached it in the bathtub, which I do not recommend to anyone. He kept the couch. I kept the skull."* → "There's a bull skull over Maya's couch that she found on a Wyoming ranch road and bleached in her own bathtub — the ex kept the couch."

### `q14.2` (a chair I overpaid for) · i_sharing · **LIFT**
**Text:** "How much was it, and what did you give up to afford it?"
**Was:** "Tell me about the thing you overpaid for and would do it again."
**Why:** "would do it again" invites a defence in the abstract; the number and the sacrifice produce that defence concretely, and the sacrifice is the funny, revealing half.
**Floor:** protagonist — her purchase, her month of rice and beans · retrievability — the tap named the object; no superlative · pitchable — yes.
**Proof:** *"Six hundred dollars. Estate sale, and the guy knew exactly what he had, that's the problem. I ate rice and beans for like a month. My friends clown me about it constantly and then they all fight over who gets to sit in it."* → "Jess ate rice and beans for a month to cover a six-hundred-dollar estate-sale chair her friends mock relentlessly and then compete to sit in."

### `q14.3` (the gear — bike, skis, clubs) · self_expansion · **LIFT**
**Text:** "The gear — what's a ridiculous thing you've done with it?"
**Was:** "The gear — tell me about a day on it you still bring up."
**Why:** "a day you still bring up" reliably returns the genre-standard epic (powder day, century ride) that reads identically for every owner of that gear; asking for the ridiculous selects the story only this person has, and gear obsession is inherently absurd — owners know it and enjoy admitting it. **Corrected mid-run — the important one:** I first wrote "the *most* ridiculous thing," which is precisely the superlative that got the original version of this prompt marked FIX. Raising the stakes rhetorically while breaking the retrievability floor is a straight downgrade. "A ridiculous thing" keeps all the fun and demands no ranking.
**Floor:** protagonist — his drive, his two runs on ice · retrievability — indefinite article, no ranking, and gear absurdity is well-rehearsed · pitchable — yes.
**Proof:** *"I drove eleven hours to Montana for a storm that did not happen. Skied two runs on ice. Drove eleven hours back. My buddy and I don't talk about it but we both know."* → "Nate once drove eleven hours each way to Montana for a storm that never arrived, skied two runs on ice, and has agreed with his friend never to speak of it."

### `q14.4` (an instrument) · i_sharing · **KEEP**
**Text:** "What do you play when nobody's around?"
**Why:** seven words, and "when nobody's around" licenses the unpolished truth instead of the party piece — the best-aimed prompt in the map after `q19`. Nothing to add without making it worse.
**Floor:** protagonist — he plays · retrievability — current private habit · pitchable — yes. Tolerated defect 4 (habitual).
**Proof:** *"Same four songs. There's this fingerpicking thing in Blackbird I've been trying to get right for six years and I only play it alone because I still blow the middle. And sometimes I make up little sad cowboy songs about my day. 'The dishwasher's broken again,' but in a minor key."* → "Alone in his apartment Jake has spent six years on the middle of Blackbird and improvises minor-key cowboy ballads about his broken dishwasher."

### `q14.5` (something I made) · admiration · **LIFT**
**Text:** "How long did it actually take, and what went wrong?"
**Was:** "Tell me about the thing you made. How long did it take, and what went wrong?"
**Why:** the tap already named the object, so the first sentence is redundant; "actually" presupposes the estimate was wrong — which it always is — turning a duration question into a confession.
**Floor:** protagonist — maker · retrievability — tap pre-retrieved the object · pitchable — yes.
**Proof:** *"It's a dining table, white oak. I told my girlfriend six weekends. It took seven months. A glue seam popped in January because the garage was too cold and I had to take the whole top apart with a heat gun. We eat on it every night. There's one leg I don't acknowledge."* → "Marcus promised his girlfriend six weekends for the white-oak table; seven months and one heat-gunned seam later they eat on it nightly, one leg officially unacknowledged."

### `q14.6` (nothing, and I've never once thought about it) · comfort · **LIFT**
**Text:** "Forget the place — where do you turn up every week? Who's expecting you?"
**Was:** "Forget the place then — where do you actually spend your time?"
**Why:** "where do you spend your time" collects a list of locations; "who's expecting you" collects belonging, which is the comfort contract, and produces a standing cast rather than an address. This option carries no scene at all — it's a negation — so the extra words are earned.
**Floor:** protagonist — he turns up; the expectation is *about him*, which is the correct third-party inversion (`close_people`, `weird_habit`) rather than a handover · retrievability — weekly and current · pitchable — yes. Tolerated defects 4 and 7.
**Proof:** *"Climbing gym, four nights a week, same three people. We've honestly stopped climbing that hard, we mostly just talk on the mats with occasional climbing. And Sunday dinner at my brother's — his kids fully expect me, I'm on the schedule."* → "Ray's apartment is for sleeping; he's expected four nights a week at a climbing gym where the climbing has become largely theoretical, and Sundays at his brother's, where the kids have him on the schedule."

### `q15.1` (something that makes them laugh out loud) · fun · **KEEP**
**Text:** "Tell me about a gift you gave that actually got the laugh."
**Why:** "a gift" (not "the biggest laugh") already cleared the superlative that broke the original, and the gag stays authored by the giver even though the laugh belongs to the recipient — authorship is the remarkable part and this collects it.
**Floor:** protagonist — she commissioned and chose it; the recipient supplies only the verdict · retrievability — indefinite, and successful jokes are rehearsed · pitchable — yes.
**Proof:** *"My sister's a lawyer and she says 'per my last email' constantly, so I had a doormat made that says PER MY LAST EMAIL. She put it outside her actual office at the firm. Her boss asked where to get one."* → "Ben had a doormat printed with his lawyer sister's most-used phrase — PER MY LAST EMAIL — and it now guards her office door at the firm."

### `q15.2` (something I made) · admiration · **LIFT**
**Text:** "How did it turn out? Be honest about the flaw."
**Was:** "Tell me about something you made for someone. How did it turn out?"
**Why:** the tap names the object, so the opening sentence is redundant; presupposing a flaw licenses the confession that makes handmade-gift answers funny and human. **Corrected mid-run:** my first attempt ended on "what did they say?", handing the payoff to the recipient's reaction — the exact protagonist tilt this item is prone to. Keeping the ask on the maker's own judgment of their own work holds the verbs, and the recipient's response still arrives unprompted (it did in every simulation).
**Floor:** protagonist — her four months, her corners · retrievability — tap pre-retrieved · pitchable — yes. Differentiated from `q14.5`, which now owns duration-and-disaster.
**Proof:** *"It's a quilt for my grandma out of my grandpa's flannel shirts. The corners don't meet anywhere, I'd never quilted before. She didn't say much when she opened it, which honestly scared me — and now she won't let anyone wash it."* → "Emma turned her late grandpa's flannel shirts into a quilt whose corners meet nowhere; her grandma has since refused to let anyone wash it."

### `q15.3` (the thing they mentioned once, months ago) · admiration · **LIFT**
**Text:** "What had they mentioned — and how far did you go?"
**Was:** "Tell me about one you actually pulled off. What had they mentioned?"
**Why:** "one you actually pulled off" has a vague referent and asks for effort in the abstract; "how far did you go" invites the absurd lengths, which are simultaneously the funniest and most attractive thing about this M.O.
**Floor:** protagonist — the setup clause is the third party's passing remark, but the operative clause is her hunt; this is the review's canonical repair (third-party setup, answerer's action clause) rather than a handover · retrievability — the superlative "best gift you ever gave" is gone, and the tap pre-retrieved the episode · pitchable — yes.
**Proof:** *"My boyfriend mentioned this hot sauce from a taco truck in Austin that closed down. Once, in March. So for his birthday I found the owner on Instagram — he'd moved to San Antonio — and paid him to make a batch and ship it. Five weeks of DMs. He opened it and said 'this doesn't exist.'"* → "Her boyfriend mentioned a hot sauce from a shuttered Austin taco truck exactly once, in March; by October Rachel had tracked the owner to San Antonio and commissioned a private batch."

### `q15.4` (a day out, not an object) · admiration · **LIFT**
**Text:** "Tell me about a day you planned for someone. What was the gamble?"
**Was:** "Tell me about a day you planned for someone else."
**Why:** the old text invited no breach, so the modal answer was a competent itinerary; "the gamble" presupposes a risk in the plan and reliably produces the part that could have gone wrong.
**Floor:** protagonist — planner by construction · retrievability — "a day," no ranking; planners index their productions · pitchable — yes.
**Proof:** *"For my girlfriend's birthday I planned the whole day without telling her any of it, which — she's a planner, so that was the gamble by itself. Chilaquiles place, then the flower market she always says she wants to go to and never goes. The real gamble was the pottery class. She still has the bowl. It's terrible."* → "Chris ran his planner girlfriend through an entire birthday she wasn't allowed to see coming — chilaquiles, the flower market she always skips, and a pottery class that produced one terrible, permanent bowl."

### `q15.5` (I'm not a gift person — I'll be there, though) · comfort · **LIFT**
**Text:** "Tell me about a time you showed up. What did it cost you?"
**Was:** "Tell me about a time you showed up for someone when it was genuinely inconvenient."
**Why:** "genuinely inconvenient" front-loads the judgment and produces worthiness; asking the cost gets the same proof as a concrete and frequently comic invoice — and drops five words.
**Floor:** protagonist — her drive, her 7 a.m. shift, her air mattress · retrievability — "a time," and show-up episodes are landmark-indexed · pitchable — yes.
**Proof:** *"My friend's boiler died in January and she's got a baby, so I drove to Fort Collins at nine at night with two space heaters and my air mattress. Cost me — I had work at seven the next morning, that part was rough. Also I no longer own an air mattress. She still has it."* → "When a friend's boiler quit in January, Sam drove to Fort Collins at 9 p.m. with two space heaters and an air mattress, made her own 7 a.m. shift, and has not seen the air mattress since."

### `q19` (verbatim template) · self_expansion · **KEEP**
**Text:** "You said you nerd out on {m9}. What pulled you in — and how deep does it go?"
**Why:** "how deep does it go" is the remarkability engine of the whole map — it licenses an escalating inventory of evidence that is self-deprecating by construction, so depth arrives without a word of bragging. Keep the lead-in stripping and the `rabbit_hole` fallback exactly as specced.
**Floor:** protagonist — her obsession, her spreadsheet · retrievability — she named the subject seconds ago · pitchable — yes.
**Proof:** *"What pulled me deep was loaf forty, it came out perfect and then I could not reproduce it for eight months. I have a spreadsheet of hydration percentages. My starter has a name and there's a backup starter in the freezer. A backup. Like a will."* → "Somewhere around loaf forty Hana baked a perfect sourdough she then chased for eight months — there is now a hydration spreadsheet, a named starter, and a frozen backup, 'like a will.'"

### `q21.1` (my work gets serious) · admiration · **KEEP**
**Text:** "What are you building at work that you'd be annoyed to leave unfinished?"
**Why:** it survives the futures item by refusing to ask about the future — "annoyed to leave unfinished" is a possession frame collecting present-tense reality, and "annoyed" is a deflating word that produces self-deprecation instead of a mission statement.
**Floor:** protagonist — she restarted it and runs it · retrievability — present tense · pitchable — yes.
**Proof:** *"I run the newspaper at my school — I restarted it, it died in COVID. We're on issue six. The eighth graders do everything now, I mostly yell about deadlines. If I left before they graduate the whole thing folds. Issue four had a real scoop about the cafeteria."* → "Beth resurrected her middle school's dead newspaper and has coached it to issue six — including a genuine cafeteria scoop — while maintaining that her only remaining job is yelling about deadlines."

### `q21.2` (my life gets full — people, a house, all of it) · comfort · **KEEP**
**Text:** "Tell me about a night your place was actually full. Who was there?"
**Why:** the replacement holds — it redirects the vision board to its best past instance, and "who was there" collects the cast, where the comedy reliably sits.
**Floor:** protagonist — she hosted · retrievability — "a night," no ranking · pitchable — yes.
**Proof:** *"In March I did a make-your-own-pizza night that got completely out of hand — fourteen people in a one-bedroom, my coworker brought her mom? Someone's dough ended up on the ceiling and we left it there for a week as a monument."* → "In March, Nora's make-your-own-pizza night packed fourteen people and one coworker's mother into her one-bedroom — the ceiling dough stayed up a week as a monument."

### `q21.3` (both, and I know how that sounds) · admiration · **LIFT**
**Text:** "What's the dumb little system, and when did it last save you?"
**Was:** "Tell me about a week you actually pulled both off."
**Why:** the biggest generic-passable failure in the batch — "a week you pulled both off" returns a competent productivity anecdote (left at four, finished the deck at eleven) writable about a thousand people. The having-it-all person is only interesting in the faintly ridiculous machinery holding it together, and "dumb little" forces the concrete while licensing self-mockery. **Corrected mid-run:** the first version asked only for the system, which is categorical; adding "when did it last save you" restores an occasion and a scene.
**Floor:** protagonist — his system, his save · retrievability — the system is live and high-frequency, so its last save is recent by nature, the same licence `pet_peeve` passed on · pitchable — yes.
**Proof:** *"Honestly? Me and my girlfriend have a Sunday night meeting. A MEETING. With an agenda, on a shared calendar, color-coded. My friends think we're deranged. Last Sunday it caught that I'd double-booked my mom's birthday against a work dinner, so the work dinner lost."* → "Dev and his girlfriend convene a Sunday-night meeting with an actual agenda; friends consider this deranged, and it is the reason his mother's birthday beat a work dinner."

### `q21.4` (I've stopped making five-year plans) · self_expansion · **KEEP**
**Text:** "What made you stop making plans — and what are you doing instead?"
**Why:** "what made you stop" points at a landmark event rather than a future, and "instead" lands the answer in concrete present behaviour; even the heavy versions close on an image rather than sentiment.
**Floor:** protagonist — his plan, his list · retrievability — plan-breaking events are landmark-indexed · pitchable — yes.
**Proof:** *"I noticed none of my plans had ever happened. Like zero. I found the five-year plan I wrote at 24 in my notes app — nothing on it happened and the stuff that did happen was better. So now I have a list called 'next' with three things on it. Right now: learn to make ramen from scratch, visit my brother in Portland, get a dog."* → "Cole found his old five-year plan in his notes app, confirmed nothing on it had happened, and replaced it with a three-item list called 'next' — currently ramen from scratch, Portland, and a dog."
