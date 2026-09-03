# Prompt Set v4 — plain voice, ~100 prompts, built for men and women

**Status: FROZEN COPY.** Every `short`, `text`, `helpText` prefix and `exampleAnswer` in `src/lib/prompts.ts` and every `short`/`text` in `src/lib/voice-prompt-map.ts` is asserted byte-for-byte against this file by `src/lib/__tests__/quiz-copy-freeze.test.ts`. Change the copy here and in code together.

**Commissioned by:** Charles, 2026-09-02, after reviewing v3 on prod:
> *"a lot of these seem written for women and are touchy feely... what about questions for men?"* · *"the plain are way better"* · *"we want like 100 questions in our bank so we can show different ones so people aren't all answering the same thing... and we can drop the ones that keep getting ignored."*

**Supersedes** the copy in `specs/prompt-set-v3.md` (bank) and `specs/matching-v2-voice-prompt-map.md` (fished). Both stay as the evidence trail; v3's structural floor (protagonist, no superlatives, retrievability) is kept in full.

**Count:** 60 bank (self_expansion 13, i_sharing 13, admiration 13, comfort 11, fun 10) + 38 fished + the nerd-out = 99.


## 1. Design rules (every prompt checked against all six)

1. **Plain voice.** The question a friend asks across a table, not a podcast host. Two clauses: the ask, then a plain follow-up that turns the answer into a story (what happened, how did it go, who was there, what broke). No host-isms: no "be honest about how petty it was", "bonus points if", "walk me through the math", "the honest version".
2. **Action over state.** Every prompt asks what the person DID, MADE, FIXED, SAID, DROVE, BUILT or KEEPS RUNNING. Never what they feel, sense, or "come back to". Women answer action prompts; most men will not answer interiority prompts, so interiority copy silently loses half the pool.
3. **The guy test.** Would a 30-year-old man read this out loud to a friend without cringing? If it reads like a journaling prompt, it fails. Comfort = reliability, routine, and people who count on you, not feelings.
4. **The v3 structural floor, unchanged.** Protagonist (the answerer owns the verbs). No superlatives. "The last" only when the thing is live, high-frequency for the tapped person, or landmark-marked. Not answerable in one sentence, answerable in 45 seconds.
5. **A wink only in `fun`.** Everywhere else, plain.
6. **Breadth with diversity.** ~100 prompts so different people answer different things and pitches don't share a spine. Construct families are capped: witness-reaction ("what did they say") ≤ 15; "what are you deep into" = the nerd-out plus one; spreadsheet/absurd-effort = 1; first-attempt/what-broke ≤ 3. Pruning happens by observed ignore-rate (migration 025), never by taste.

**Examples** read like a person talking: two or three sentences, no punchline button, and they alternate between men's and women's lives (trucks, brakes, mowing, the deck; the wedding, the quilt, the pretzel). Examples show for half of accounts only (example on/off split, `exampleArm`).

**What changed from v3, by construct:** the nerd-out gets its second clause; `obsession` retired (the nerd-out and `rabbit_hole` already own "deep into"); `hardest_thing` back to persistence ("stuck with") so it stops duplicating `superpower`; `figured_it_out` becomes "fixed instead of replaced" so it stops duplicating `taught_yourself`; `building_right_now` becomes past-tense ("built this year") so it stops duplicating fished Q9:2; comfort re-aimed from quirk to reliability (`love_language_real` → what you always end up doing at family stuff; `safe_place` → the spot you go back to; `recharge` → shake off a bad week). Six new bank prompts: `on_a_whim`, `no_plan_trip`, `small_thing_rules`, `no_instructions`, `counted_on`, `chore_you_like`. Fished set reconciled to the rc11 quiz: Q4:3 (saved on Instagram), Q9:3 (out late), Q11:2 (mentioned once) written fresh.

## 2. Bank


### Tier 1: Self-Expansion (13)

#### `rabbit_hole`
**Short:** The last thing you went too deep on  
**Text:** What's the last thing you went way too deep on? How far did it go?  
**Example:** The Titanic sub story. I ended up reading the actual court documents at two in the morning, and I can name everyone who was on board. My brother has banned it as a dinner topic.  
**Was (v3):** What's the last rabbit hole you went down? How far did it actually go?  

#### `taught_yourself`
**Short:** Something you taught yourself  
**Text:** What's something you taught yourself with nobody to ask? How did the first try go?  
**Example:** Changing my own brakes, off YouTube. First time I put the pads in backwards and drove four blocks making a noise I still think about. I've done every car in the family since.  
**Was (v3):** What's something you taught yourself with nobody to ask? What did you wreck along the way?  

#### `show_someone_your_city`
**Short:** Showing someone your town  
**Text:** Who's the last person you showed around your town? Where did you take them, and did it land?  
**Example:** My college roommate came out in April. I took him up the canyon to my spot at the reservoir, and he'd rather have gone to the aquarium. So we went to the aquarium. It was good.  
**Was (v3):** Who's the last person you showed your city? Where'd you take them, and did they get it?  

#### `changed_your_mind`
**Short:** Something you changed your mind on  
**Text:** What's something you used to be sure about and aren't anymore? What changed it?  
**Example:** That I'd never live anywhere with a real winter. Then I spent one January in Utah for work and liked it. I own a snow shovel now.  
**Was (v3):** What did you used to be completely sure about? Where were you when it fell apart?  

#### `side_quest`
**Short:** An errand that turned into a whole thing  
**Text:** When did a simple errand turn into a whole thing? Where did it go off course?  
**Example:** Went to pick up a dresser off Marketplace, and the guy ran a pigeon rescue out of his garage. I was there an hour. Met every pigeon. Did get the dresser.  
**Was (v3):** What's a side quest you ended up on? Start where you got pulled off course.  

#### `best_purchase`
**Short:** What people don't believe about you  
**Text:** What's something about you people don't believe at first? How does it usually come up?  
**Help prefix:** The thing you have to prove.  
**Example:** That I've never had coffee. People at work argue with me about it, so I hold a water bottle in meetings and nobody asks.  
**Was (v3):** What's something about you people don't believe at first? Tell me how it usually comes up.  

#### `unpopular_take`
**Short:** An opinion you've had to defend  
**Text:** What's an opinion you've had to defend out loud? When did it last come up?  
**Example:** That Die Hard is not a Christmas movie. It came up at Thanksgiving. I lost the room, but I was right.  
**Was (v3):** What's the take you've had to defend out loud? Who's still mad at you about it?  

#### `bucket_list_done`
**Short:** The thing you finally did  
**Text:** What's something you said for years you'd do, and then finally did? How did the actual day go?  
**Example:** Finally hiked Kings Peak after five years of saying I would. Day two my boot came apart, and I finished it with duct tape around my foot. Made the top. Don't recommend the tape.  
**Was (v3):** What's something you'd been saying you'd do for years and then finally did? How did the actual day go?  

#### `world_expert`
**Short:** What people come to you for  
**Text:** What do people come to you for? Tell me about the last time someone did.  
**Example:** Used cars. My coworker called me from the lot last month and I made him send a video of the guy walking around it. He did not buy the car.  
**Was (v3):** What do people come to you about? Tell me about the last time someone did.  

#### `weekend_project`
**Short:** Something you tried once  
**Text:** What's something you tried exactly once? How did it end?  
**Help prefix:** The one and only time.  
**Example:** Hot yoga. I thought it was regular yoga and wore a hoodie. Twenty minutes, then I sat in my truck with the AC on. The mat is still in my closet.  
**Was (v3):** What's something you tried exactly once? Tell me how it ended.  

#### `last_new_place`
**Short:** The last new place you went  
**Text:** Where's the last new place you went, even somewhere small? What was the verdict?  
**Example:** A diner two towns over that's supposed to have famous pie. Drove forty minutes. Pie was fine. The waitress told us about her divorce for twenty minutes, which was better than the pie.  
**Was (v3):** Where's the last new place you went, however small? What was the verdict?  

#### `on_a_whim`
**Short:** Something you signed up for on a whim  
**Text:** What's something you signed up for on a whim? How far in were you before you realized what you'd done?  
**Example:** A Spartan race, because a guy at work needed one more person. I found out at mile two that there was a wall. I got over the wall. Barely.  
**Was:** new in v4  

#### `no_plan_trip`
**Short:** A trip with no plan  
**Text:** Tell me about a trip you took with almost no plan. Where did you end up?  
**Example:** Drove to Moab on a Friday night with a tent and no campsite. Slept in the truck bed the first night, found a spot by the creek the second. Best two days of that year.  
**Was:** new in v4  


### Tier 2: I-Sharing (13)

#### `made_them_watch`
**Short:** What you make everyone try  
**Text:** What's something you love that you make everyone else try? Who was the last person you got?  
**Help prefix:** The song, the show, the place, the dish.  
**Example:** There's a burger place in Springville I take everyone to. My sister said she'd already been. I took her anyway. She ordered two.  
**Was (v3):** What's the thing you love that you make other people experience? Tell me about your most recent victim.  

#### `friends_still_bring_up`
**Short:** What your friends still bring up  
**Text:** What's something you did that your friends still bring up? Tell it the way they tell it.  
**Help prefix:** The more embarrassing the better.  
**Example:** I ordered in Spanish at a taqueria once and apparently asked for a jacket of pork. My friends order jackets of things every time we go out now.  
**Was (v3):** What's something you did that your friends still bring up? Tell it the way they tell it.  

#### `notice_first`
**Short:** What you notice that others don't  
**Text:** What do you notice everywhere that nobody else seems to? When did it last come up?  
**Example:** Crooked pictures, in any restaurant or office. My sister's family knows now, and I'm allowed to fix one per visit.  
**Was (v3):** What do you notice everywhere that nobody else does? When did it last ruin something?  

#### `guilty_pleasure`
**Short:** The thing you'd have to explain  
**Text:** What's something you enjoy that you'd have to explain? When did you last do it?  
**Example:** Mall pretzels. I'll drive to the mall just for the pretzel. Saturday I went in, got it, and left without going in a single store.  
**Was (v3):** What's the thing you enjoy that you'd have to explain? Tell me about the last time you did it.  

#### `weird_habit`
**Short:** A habit someone pointed out  
**Text:** What's a habit of yours that someone has actually pointed out? What did they say?  
**Example:** I talk through what I'm doing while I cook, like it's a show. My sister walked in on 'and now we fold' and has not let it go.  
**Was (v3):** What's a habit of yours someone has actually commented on? What did they say?  

#### `song_on_repeat`
**Short:** What you've had on repeat  
**Text:** What have you had on repeat lately? How many times are we talking?  
**Example:** Tusk by Fleetwood Mac, on every drive for two months. Spotify said four hundred plays. My carpool has limited me to one per trip.  
**Was (v3):** What's a song you can't hear without being somewhere else? Where does it put you?  

#### `movie_scene`
**Short:** What you like that others call ugly  
**Text:** What do you think is great that everyone else thinks is ugly? What have you done about it?  
**Help prefix:** The building, the truck, the view nobody else would photograph.  
**Example:** Old spiral parking garages. There's a concrete one downtown from the seventies, and I'll pay extra to park in it. I've taken pictures of it. More than once.  
**Was (v3):** What do you find beautiful that everyone else thinks is ugly? What have you done about it?  

#### `pet_peeve`
**Short:** What bugs you more than it should  
**Text:** What's a small thing that bugs you more than it should? When did it last get you?  
**Example:** Loud chewers. A guy at work eats almonds at two every day. I bought headphones for it. Yesterday I had them on before he opened the drawer.  
**Was (v3):** What's a small thing that bothers you more than it should? When did it last get you?  

#### `comfort_food`
**Short:** Your comfort food  
**Text:** What's your comfort food? Give me the specifics.  
**Example:** Boxed mac and cheese with an egg stirred in off the heat. A roommate showed me in 2014. I've never told anyone because it sounds bad. It isn't.  
**Was (v3):** What's your comfort food? Tell me the embarrassing specifics.  

#### `ick_or_green_flag`
**Short:** Deciding you liked someone fast  
**Text:** When's a time you decided you liked someone in about four seconds? What did they do, and what did you do about it?  
**Example:** A guy at trivia handed the other team the tiebreaker because they'd worked harder for it. I got him onto our team the same night.  
**Was (v3):** When's a time you decided you liked someone in about four seconds? What did they do — and what did you do about it?  

#### `dealbreaker_funny`
**Short:** Something petty you held onto  
**Text:** What's a small thing you held against someone for way too long?  
**Example:** A guy at work parked crooked once, in 2022. He's parked fine every day since. I still check.  
**Was (v3):** What's a small thing you've genuinely held against someone? Be honest about how petty it was.  

#### `slow_tuesday`
**Short:** A running joke you won't drop  
**Text:** What's a running joke you keep going that everyone around you has to put up with? When did it last go too far?  
**Help prefix:** The voice, the bit, the thing you say every single time.  
**Example:** I do my dog's inner voice. He's British and disappointed in all of us. I did it through a whole dinner at my brother's, and his father-in-law asked if I was okay.  
**Was (v3):** What's a bit you run that everyone around you has to tolerate? When did it last go too far?  

#### `small_thing_rules`
**Short:** Something small you have rules about  
**Text:** What's something small you have strong opinions about? Give me the rules.  
**Example:** Loading a dishwasher. Plates face the center, no nesting bowls, spatulas handle-down. I've reloaded other people's dishwashers at parties.  
**Was:** new in v4  


### Tier 3: Admiration (13)

#### `bet_on_yourself`
**Short:** A bet you made on yourself  
**Text:** Tell me about a bet you made on yourself. What's the part you didn't tell anyone?  
**Example:** Quit a sales job for nursing school. What nobody knew was that I sold my truck to cover the first semester and told everyone I was trying transit.  
**Was (v3):** Tell me about a bet you made on yourself. What's the part you didn't tell anyone about?  

#### `hardest_thing`
**Short:** What you stuck with  
**Text:** What's something you stuck with long after most people would have quit? Where's it at now?  
**Example:** Guitar, starting at thirty. Two years in I could play four songs badly. It's about ten now, and I play at my brother's every Sunday whether they want it or not.  
**Was (v3):** What have you put absurd effort into for no good reason? How far did it go?  

#### `helped_someone`
**Short:** Helping someone, more than planned  
**Text:** What's something you did to help someone that turned into a bigger job than you expected?  
**Example:** My neighbor's car died, so I drove her kids to school for two weeks. They rated my music every morning out of ten. Mostly sixes.  
**Was (v3):** What's something you've done to help someone that got weirdly elaborate?  

#### `figured_it_out`
**Short:** Something you fixed instead of replaced  
**Text:** What's something you fixed that everyone told you to just replace? How's it holding up?  
**Example:** A 2009 washing machine. Everyone said buy a new one. Forty-dollar part and a YouTube video. Still running. Louder than it should be.  
**Was (v3):** What do you do yourself that most people pay for? Tell me about the first attempt.  

#### `trusted_with`
**Short:** When someone put you in charge  
**Text:** When's a time someone put you in charge of something that mattered to them? How did you handle it?  
**Example:** My sister had me officiate her wedding. I interviewed them separately for material, like a reporter. Nine drafts. The dog joke landed.  
**Was (v3):** When's a time someone put you in charge of something that mattered? How far did you take it?  

#### `against_the_grain`
**Short:** Doing what nobody would've picked  
**Text:** When's a time you did the thing nobody around you would have picked? What did they say?  
**Example:** Whole family's in finance. I announced the teaching credential at Thanksgiving. Dad said, if this is about money, we can help. It was not about money.  
**Was (v3):** When's a time you did the thing nobody around you would have picked? What did they say?  

#### `building_right_now`
**Short:** Something you built this year  
**Text:** What did you build or fix this year that you're a little proud of? What went wrong along the way?  
**Example:** A deck off the back of my brother's house. Two weekends turned into five. One footing is six inches off, and we built around it. It's solid.  
**Was (v3):** What are you building right now? Walk me through where it's at — including the part that isn't working.  

#### `failure_lesson`
**Short:** Something you got wrong  
**Text:** Tell me about something you got badly wrong. How long did it take you to admit it?  
**Example:** Started a T-shirt company and lost fifteen grand. The boxes sat in my dining room for a year. I ate Thanksgiving next to them twice.  
**Was (v3):** Tell me about something you got badly wrong. How long did it take to admit it?  

#### `mentor_moment`
**Short:** Your unreasonably high standards  
**Text:** What do you have unreasonably high standards about? When did it last cost you?  
**Example:** Packing a truck. Everything has a place and a strap. Helped a buddy move and redid his whole load in the driveway while he watched. Took an extra hour. Nothing shifted.  
**Was (v3):** What do you have unreasonably high standards about? Tell me about the last time it cost you.  

#### `secret_talent`
**Short:** What you're unexpectedly good at  
**Text:** What are you unexpectedly good at? How did you find out?  
**Example:** Calligraphy. Big guy with a beard, careful hand lettering. Found out at a wedding when they ran out of place cards and handed me a pen.  
**Was (v3):** What are you unexpectedly good at? Tell me how you found out.  

#### `getting_better_at`
**Short:** What you're bad at but still doing  
**Text:** What are you bad at and still doing anyway? How's it going this week?  
**Example:** Pickup basketball on Tuesday nights. Three years in, still picked last, still there at six.  
**Was (v3):** What are you actively bad at and still doing? How's it going this week?  

#### `stood_up_for`
**Short:** Saying the awkward true thing  
**Text:** When did you say the true thing even though it was awkward? What happened after?  
**Example:** Told my mom the turkey was dry. Once, in 2019. She puts it on the table every Thanksgiving now and looks right at me.  
**Was (v3):** When's a time you said the inconvenient thing out loud? Bonus points if the stakes were tiny.  

#### `no_instructions`
**Short:** Figuring it out with no instructions  
**Text:** When's a time you had to figure something out with no instructions and no time? What did you do?  
**Example:** Water heater went at eleven at night, the day before my brother's family came to stay. Shut the main, watched two videos, two trips to the hardware store. Hot water by nine.  
**Was:** new in v4  


### Tier 4: Comfort & Attachment (11)

#### `recharge`
**Short:** How you shake off a bad week  
**Text:** What do you do to shake off a bad week? The actual thing, not just sleep.  
**Example:** Drive up the canyon Saturday morning with a thermos and no plan. Sometimes I fish, sometimes I sit on the tailgate. Back by noon.  
**Was (v3):** What's your weird recovery ritual after a brutal week? The specific one, not the sleep.  

#### `close_people`
**Short:** What your oldest friend teases you about  
**Text:** What does your oldest friend always give you a hard time about?  
**Example:** Danny won't let go of the fact that I planned our Moab trip with a spreadsheet. It had tabs. One of them was labeled 'snacks'.  
**Was (v3):** What's your oldest friend always giving you a hard time about?  

#### `love_language_real`
**Short:** What you always end up doing at family stuff  
**Text:** What do you always end up doing at family stuff or a friend's place without being asked?  
**Example:** Fixing whatever's broken. I show up to my mom's for dinner and end up under the sink. My brother-in-law has started leaving a list on the fridge.  
**Was (v3):** What's your specific way of showing you care that other people find a little odd?  

#### `disagree_well`
**Short:** A dumb argument you keep having  
**Text:** What's a dumb argument you keep having with someone in your family? How does it usually end?  
**Example:** Whether a hot dog is a sandwich. Four hours, in a car, with my dad. We agreed to stop. Neither of us has conceded.  
**Was (v3):** Tell me about a stupid argument you've had with someone you love. Who won?  

#### `safe_place`
**Short:** The spot you keep going back to  
**Text:** Where's a spot you go back to over and over? What do you do there?  
**Example:** A bench at the top of the trail behind my parents' place. I've been going up there since high school. Mostly I just sit. Once a guy was on it and I walked the loop twice waiting for him to leave.  
**Was (v3):** What's a place you have a completely unearned sense of ownership over? What's your spot?  

#### `standing_ritual`
**Short:** The plan that never moves  
**Text:** What's the standing plan in your week that never moves? What's the rule?  
**Help prefix:** Who's there, where it is, what got said last time.  
**Example:** Sunday pho with my brother, same booth since 2019. Rule is you can bring someone, but they order from the back of the menu. His girlfriend ordered tripe first try. She's in.  
**Was (v3):** What's the standing plan in your week that never moves? What's the rule you enforce?  

#### `morning_person`
**Short:** Your actual morning  
**Text:** Walk me through your morning. The real one, not the one you'd like to have.  
**Example:** Snooze twice. Instant oatmeal standing up. Ten minutes looking for my keys because I refuse to own a key hook. Four minutes late to everything. It's a system.  
**Was (v3):** Walk us through your morning routine — the real one, not the aspirational one.  

#### `small_repair`
**Short:** What you keep running  
**Text:** What do you keep running that most people would have let go? How's it doing?  
**Help prefix:** A truck, a watch, a mower, a group chat, a long-distance friendship.  
**Example:** My grandpa's '94 Ranger. Worth about two grand, costs me more than that a year. Starts every time. I'm not selling it.  
**Was (v3):** What do you keep alive that most people would have let die? How's it doing?  

#### `learned_from_someone`
**Short:** What you do the way you were taught  
**Text:** What do you still do exactly the way someone taught you? Who was it?  
**Example:** Clean as you go. My first boss at the shop. Halfway through cooking my kitchen looks like nobody's been in it, and people find that weird.  
**Was (v3):** What do you still do exactly the way someone taught you? Who was it?  

#### `counted_on`
**Short:** Who counts on you every week  
**Text:** Who counts on you for something every week? What is it?  
**Example:** My sister. I've got her kids Wednesday nights so she can work her shift. We do homework, then we do something I'd get in trouble for.  
**Was:** new in v4  

#### `chore_you_like`
**Short:** A chore you actually like  
**Text:** What's a chore you actually like doing? When did you last do it?  
**Example:** Mowing. Straight lines, headphones in, forty-five minutes where nobody needs anything. Did mine Saturday, then did the neighbor's because I wasn't done.  
**Was:** new in v4  


### Fun / Wildcard (10)

#### `conspiracy`
**Short:** A hot take you've tested  
**Text:** What's a hot take you've actually tested? What's the evidence?  
**Example:** Any restaurant with a neon sign that has a slogan on it has bad food. I keep a note in my phone. Eleven for eleven.  
**Was (v3):** What's a hot take you've actually tested? What's the evidence?  

#### `worst_date`
**Short:** A date that went sideways  
**Text:** Tell me about a date that went sideways. What was your move?  
**Example:** It turned out to be his coworker's engagement party. He'd double-booked. Someone handed me the card to sign, so I signed it 'so happy for you two, Jess, Dave's date' and left after the toast.  
**Was (v3):** Tell me about a date that went sideways. What was your move?  

#### `irrational_fear`
**Short:** An irrational fear  
**Text:** What's an irrational fear you have? When did it last get you?  
**Example:** The end of escalators. Last week at the airport I did the little hop, with a suitcase, and a kid laughed at me. Fair.  
**Was (v3):** What's an irrational fear you have? Tell me about the last time it got you.  

#### `superpower`
**Short:** Pointless effort you're proud of  
**Text:** What's something pointless you've put real effort into? Walk me through it.  
**Example:** A spreadsheet ranking every bagel place within twenty minutes. Columns for crust, chew, and whether they toast without asking, which is disqualifying. Thirty-one entries.  
**Was (v3):** What's something pointless you've put real effort into? Walk me through it.  

#### `apocalypse_skill`
**Short:** The useful thing nobody expects  
**Text:** What's a useful thing you can do that nobody expects? When did it last come in handy?  
**Example:** I can back up a trailer. Farm kid. Last month my neighbor was losing a fight with a U-Haul, so I did it in one try and walked back inside without a word.  
**Was (v3):** What's the useful thing you can do that nobody expects? When did it last come in handy?  

#### `most_me_photo`
**Short:** A photo that needs explaining  
**Text:** What's a photo of you that would take some explaining? Describe it.  
**Example:** Me holding a frozen turkey like a newborn, in July, in a Halloween costume. Lost a fantasy football bet. The forfeit was a full photoshoot. There are eleven.  
**Was (v3):** What's a photo of you that would take some explaining? Describe it.  

#### `dating_confession`
**Short:** The part of dates you're bad at  
**Text:** What part of a first date are you actually bad at? Tell me about one that went that way.  
**Example:** The goodbye. I've hugged, handshaked, and waved at the same person in one motion. Last one ended in a headbutt. She texted 'nice headbutt', so, fine.  
**Was (v3):** What's the part of a first date you're actually bad at? Tell me about one that went that way.  

#### `first_job`
**Short:** Your first job  
**Text:** What was your first job, and what were you bad at?  
**Example:** Dairy Queen at sixteen. Could not do the curl on the cone. Mine looked defeated. They moved me to drive-thru, where I flourished.  
**Was (v3):** What was your first job and what were you bad at?  

#### `overpacked`
**Short:** What you always bring  
**Text:** What's something you always bring that nobody else does? When did it last pay off?  
**Example:** Band-aids, in every bag. Wedding last month, a bridesmaid's heel strap drew blood, and I produced one mid-reception. I've been thanked in a toast. Not my toast.  
**Was (v3):** What's something you always bring that nobody else does? When did it last pay off?  

#### `bad_at_pretending`
**Short:** What you can't hide  
**Text:** What are you bad at hiding? When did it last give you away?  
**Example:** Being bored. My face just leaves. In a meeting my manager stopped and said 'Kayla has notes.' I did not have notes. I had a face.  
**Was (v3):** What are you visibly bad at hiding? When did it last give you away?  


## 3. Retired in v4

- `obsession`: What are you obsessed with that most people find boring? What do your friends say?

## 4. The nerd-out (always first, everyone)

**Text:** What do you nerd out on? How far has it gone?  
**Was:** What do you nerd out on?  


## 5. Fished (38), by quiz item and option


### Q1 · At seventeen you were, on the record…

#### `Q1:0` (`fished_Q1_0`)
**Short:** Your on-stage disaster  
**Text:** Every show has a disaster. What was yours?  
**Was (prod, pre-review):** Tell me about a night on stage that still lands when you think about it. What went right — or what went wrong?  

#### `Q1:1` (`fished_Q1_1`)
**Short:** Your real job on the team  
**Text:** What was your actual job on that team, the one nobody in the stands understood?  
**Was (prod, pre-review):** What were you actually good at back then? Tell me how you found out.  

#### `Q1:2` (`fished_Q1_2`)
**Short:** What you were grinding for  
**Text:** What were you grinding for? Where did all that energy go?  
**Was (prod, pre-review):** What were you grinding for at seventeen? Tell me whether it turned out to be worth it.  

#### `Q1:3` (`fished_Q1_3`)
**Short:** What you pulled off  
**Text:** What did you pull off? How many people, and what went wrong?  
**Was (prod, pre-review):** Tell me about something you organised at seventeen that actually happened. How many people, and what went wrong?  

#### `Q1:4` (`fished_Q1_4`)
**Short:** What you were doing instead  
**Text:** So what were you doing instead? Did anyone at school know?  
**Was (prod, pre-review):** What were you doing at seventeen while everyone else was doing the school thing?  

#### `Q1:5` (`fished_Q1_5`)
**Short:** What changed, and when you noticed  
**Text:** You said you're a completely different person now. What changed, and when did you notice?  
**Was (prod, pre-review):** You said you're a completely different person now. What changed — and when did you notice?  


### Q2 · Wedding reception, 10pm

#### `Q2:0` (`fished_Q2_0`)
**Short:** How you get out of a party  
**Text:** How do you get out of a party? Tell me about the last time you pulled it off.  
**Was (prod, pre-review):** Tell me about the last party you left early and were glad about. Where'd you go instead?  

#### `Q2:1` (`fished_Q2_1`)
**Short:** The conversation, and your side of it  
**Text:** What was the conversation, and what was your side of it? Did you follow up after?  
**Was (prod, pre-review):** Tell me about a conversation at a party you're still thinking about. What was it about?  

#### `Q2:2` (`fished_Q2_2`)
**Short:** What you ended up running  
**Text:** What did you end up running that you never signed up for?  
**Was (prod, pre-review):** Tell me about the last thing you ended up running that you never signed up to run.  

#### `Q2:3` (`fished_Q2_3`)
**Short:** A night you closed down  
**Text:** Tell me about a night you closed down. Who was still there at the end?  
**Was (prod, pre-review):** Tell me about the last night you closed down. Who else was still there at the end?  


### Q4 · One free day in a city you've never been to

#### `Q4:0` (`fished_Q4_0`)
**Short:** A must-see you got up early for  
**Text:** Tell me about a must-see you got up early for. What was the verdict?  
**Was (prod, pre-review):** What's one must-see that was genuinely worth it, and one that absolutely wasn't?  

#### `Q4:1` (`fished_Q4_1`)
**Short:** The place you kept going back to  
**Text:** What's a place near where you were staying that you kept going back to? Who was with you?  
**Was (prod, pre-review):** Tell me about a trip where the best part happened within three blocks of where you were staying.  

#### `Q4:2` (`fished_Q4_2`)
**Short:** A walk that turned into something  
**Text:** Tell me about a walk that turned into something. Where were you?  
**Was (prod, pre-review):** Tell me about a walk that turned into something. Where were you?  

#### `Q4:3` (`fished_Q4_3`)
**Short:** A saved place you finally went to  
**Text:** What's a place you'd had saved for months and finally went to? How did it compare to the picture?  
**Was (prod, pre-review):** What's a place you saved months ago and finally went to? Was it what you pictured?  


### Q7 · You're meeting someone at 7

#### `Q7:0` (`fished_Q7_0`)
**Short:** What you do with the ten minutes  
**Text:** Ten minutes early, every time. What do you do with them?  
**Was (prod, pre-review):** What do you do with the ten minutes when you get somewhere early?  

#### `Q7:1` (`fished_Q7_1`)
**Short:** How you land exactly on time  
**Text:** How do you land exactly on time? What's the system?  
**Was (prod, pre-review):** Who taught you to be on time?  

#### `Q7:2` (`fished_Q7_2`)
**Short:** What always makes you late  
**Text:** What's the thing that always makes you five minutes late?  
**Was (prod, pre-review):** What's the thing that always makes you five minutes late?  

#### `Q7:3` (`fished_Q7_3`)
**Short:** Okay, tell me the story  
**Text:** Okay. Tell me the story.  
**Was (prod, pre-review):** Okay. Tell me the story.  


### Q8 · Your closest friend is getting back together with the ex. Again.

#### `Q8:0` (`fished_Q8_0`)
**Short:** When honesty got you in trouble  
**Text:** When did saying exactly what you think get you in trouble? It doesn't have to be serious.  
**Was (prod, pre-review):** Tell me about a time you said the hard thing to someone you love. How did it land?  

#### `Q8:1` (`fished_Q8_1`)
**Short:** Said your piece, showed up anyway  
**Text:** Tell me about a time you said your piece once and then showed up anyway.  
**Was (prod, pre-review):** Tell me about a time you said your piece once and then showed up anyway.  

#### `Q8:2` (`fished_Q8_2`)
**Short:** When that actually worked  
**Text:** When did that actually work? How much of it was you?  
**Was (prod, pre-review):** Tell me about a time you got someone to figure something out for themselves.  

#### `Q8:3` (`fished_Q8_3`)
**Short:** What you went along with  
**Text:** What did you end up going along with? How long did you keep quiet?  
**Was (prod, pre-review):** Tell me about a time you stayed close to someone through something you didn't agree with.  


### Q9 · Your last three Saturdays, honestly

#### `Q9:0` (`fished_Q9_0`)
**Short:** Which morning, and how early  
**Text:** Which morning? What time was the alarm, and who else was up?  
**Was (prod, pre-review):** Tell me about a morning outside that went exactly right. Where were you, and what time did you start?  

#### `Q9:1` (`fished_Q9_1`)
**Short:** What you did instead of nothing  
**Text:** The last one. What did you end up doing instead of nothing?  
**Was (prod, pre-review):** Walk me through your best empty Saturday. What actually ended up happening?  

#### `Q9:2` (`fished_Q9_2`)
**Short:** What you're making or fixing  
**Text:** What are you making or fixing right now? What's the part that's fighting you?  
**Was (prod, pre-review):** What are you making or fixing right now? Walk me through where it's at.  

#### `Q9:3` (`fished_Q9_3`)
**Short:** A night out you almost skipped  
**Text:** Tell me about a night out you almost skipped and didn't. How did it go?  
**Was (prod, pre-review):** Tell me about the last night out you're still glad you said yes to.  

#### `Q9:4` (`fished_Q9_4`)
**Short:** The part of your job you'd do free  
**Text:** What's a small part of your job you'd honestly do for free? What did it look like last week?  
**Was (prod, pre-review):** What's the part of your work you'd still do on a Saturday?  


### Q10 · The thing in your place a guest always asks about

#### `Q10:0` (`fished_Q10_0`)
**Short:** Which piece, and how you got it  
**Text:** Which piece, and how did you end up with it?  
**Was (prod, pre-review):** Tell me about one thing on your walls. Where did it come from?  

#### `Q10:1` (`fished_Q10_1`)
**Short:** How much, and what you gave up  
**Text:** How much was it, and what did you give up to afford it?  
**Was (prod, pre-review):** Tell me about the thing you overpaid for and would do it again.  

#### `Q10:2` (`fished_Q10_2`)
**Short:** A ridiculous thing you did with the gear  
**Text:** The gear. What's a ridiculous thing you've done with it?  
**Was (prod, pre-review):** Tell me about the gear. What's the best day you've ever had on it?  

#### `Q10:3` (`fished_Q10_3`)
**Short:** What you play when nobody's around  
**Text:** What do you play when nobody's around?  
**Was (prod, pre-review):** What do you play when nobody's around?  

#### `Q10:4` (`fished_Q10_4`)
**Short:** How long it took, what went wrong  
**Text:** How long did it actually take, and what went wrong?  
**Was (prod, pre-review):** Tell me about the thing you made. How long did it take, and what went wrong?  

#### `Q10:5` (`fished_Q10_5`)
**Short:** Where you show up every week  
**Text:** Forget the place. Where do you show up every week, and who's expecting you?  
**Was (prod, pre-review):** Forget the place then — where do you actually spend your time?  


### Q11 · It's their birthday. Your gift

#### `Q11:0` (`fished_Q11_0`)
**Short:** A gift that got the laugh  
**Text:** Tell me about a gift you gave that actually got the laugh.  
**Was (prod, pre-review):** Tell me about the gift that got the biggest laugh. What was it?  

#### `Q11:1` (`fished_Q11_1`)
**Short:** How it turned out  
**Text:** How did it turn out? What's the flaw only you can see?  
**Was (prod, pre-review):** Tell me about something you made for someone. How did it turn out?  

#### `Q11:2` (`fished_Q11_2`)
**Short:** What they mentioned, how far you went  
**Text:** What had they mentioned, and how far did you go to get it?  
**Was (prod, pre-review):** Tell me about the best gift you ever gave. What did it take to pull off?  

#### `Q11:3` (`fished_Q11_3`)
**Short:** A day you planned for someone  
**Text:** Tell me about a day you planned for someone. What was the gamble?  
**Was (prod, pre-review):** Tell me about a day you planned for someone else.  

#### `Q11:4` (`fished_Q11_4`)
**Short:** A time you showed up  
**Text:** Tell me about a time you showed up for someone. What did it cost you?  
**Was (prod, pre-review):** Tell me about a time you showed up for someone when it was genuinely inconvenient.  

