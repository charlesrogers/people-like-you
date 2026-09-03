export interface PromptDef {
  id: string
  /** Scannable label for the prompt picker (~4-8 words). The full `text` is what gets asked at record time. */
  short: string
  text: string
  helpText: string
  /** Absent on prompts fished from quiz answers — a worked example there steers
   *  the person away from their own story (voice-prompt-map spec §1). */
  exampleAnswer?: string
  tier: 'self_expansion' | 'i_sharing' | 'admiration' | 'comfort' | 'fun'
  category: string
}

const TRIVIA = "The small stuff is the good stuff — the more specific, the better."

export const QUESTION_BANK: PromptDef[] = [
  // ─── Tier 1: Self-Expansion (13) ───
  { id: 'rabbit_hole', short: "The last thing you went too deep on", text: "What's the last thing you went way too deep on? How far did it go?", helpText: TRIVIA, exampleAnswer: "The Titanic sub story. I ended up reading the actual court documents at two in the morning, and I can name everyone who was on board. My brother has banned it as a dinner topic.", tier: 'self_expansion', category: 'depth' },
  { id: 'taught_yourself', short: "Something you taught yourself", text: "What's something you taught yourself with nobody to ask? How did the first try go?", helpText: TRIVIA, exampleAnswer: "Changing my own brakes, off YouTube. First time I put the pads in backwards and drove four blocks making a noise I still think about. I've done every car in the family since.", tier: 'self_expansion', category: 'ambition' },
  { id: 'show_someone_your_city', short: "Showing someone your town", text: "Who's the last person you showed around your town? Where did you take them, and did it land?", helpText: TRIVIA, exampleAnswer: "My college roommate came out in April. I took him up the canyon to my spot at the reservoir, and he'd rather have gone to the aquarium. So we went to the aquarium. It was good.", tier: 'self_expansion', category: 'warmth' },
  { id: 'changed_your_mind', short: "Something you changed your mind on", text: "What's something you used to be sure about and aren't anymore? What changed it?", helpText: TRIVIA, exampleAnswer: "That I'd never live anywhere with a real winter. Then I spent one January in Utah for work and liked it. I own a snow shovel now.", tier: 'self_expansion', category: 'depth' },
  { id: 'side_quest', short: "An errand that turned into a whole thing", text: "When did a simple errand turn into a whole thing? Where did it go off course?", helpText: TRIVIA, exampleAnswer: "Went to pick up a dresser off Marketplace, and the guy ran a pigeon rescue out of his garage. I was there an hour. Met every pigeon. Did get the dresser.", tier: 'self_expansion', category: 'warmth' },
  { id: 'best_purchase', short: "What people don't believe about you", text: "What's something about you people don't believe at first? How does it usually come up?", helpText: "The thing you have to prove. " + TRIVIA, exampleAnswer: "That I've never had coffee. People at work argue with me about it, so I hold a water bottle in meetings and nobody asks.", tier: 'self_expansion', category: 'humor' },
  { id: 'unpopular_take', short: "An opinion you've had to defend", text: "What's an opinion you've had to defend out loud? When did it last come up?", helpText: TRIVIA, exampleAnswer: "That Die Hard is not a Christmas movie. It came up at Thanksgiving. I lost the room, but I was right.", tier: 'self_expansion', category: 'humor' },
  { id: 'bucket_list_done', short: "The thing you finally did", text: "What's something you said for years you'd do, and then finally did? How did the actual day go?", helpText: TRIVIA, exampleAnswer: "Finally hiked Kings Peak after five years of saying I would. Day two my boot came apart, and I finished it with duct tape around my foot. Made the top. Don't recommend the tape.", tier: 'self_expansion', category: 'ambition' },
  { id: 'world_expert', short: "What people come to you for", text: "What do people come to you for? Tell me about the last time someone did.", helpText: TRIVIA, exampleAnswer: "Used cars. My coworker called me from the lot last month and I made him send a video of the guy walking around it. He did not buy the car.", tier: 'self_expansion', category: 'depth' },
  { id: 'weekend_project', short: "Something you tried once", text: "What's something you tried exactly once? How did it end?", helpText: "The one and only time. " + TRIVIA, exampleAnswer: "Hot yoga. I thought it was regular yoga and wore a hoodie. Twenty minutes, then I sat in my truck with the AC on. The mat is still in my closet.", tier: 'self_expansion', category: 'humor' },
  { id: 'last_new_place', short: "The last new place you went", text: "Where's the last new place you went, even somewhere small? What was the verdict?", helpText: TRIVIA, exampleAnswer: "A diner two towns over that's supposed to have famous pie. Drove forty minutes. Pie was fine. The waitress told us about her divorce for twenty minutes, which was better than the pie.", tier: 'self_expansion', category: 'warmth' },
  { id: 'on_a_whim', short: "Something you signed up for on a whim", text: "What's something you signed up for on a whim? How far in were you before you realized what you'd done?", helpText: TRIVIA, exampleAnswer: "A Spartan race, because a guy at work needed one more person. I found out at mile two that there was a wall. I got over the wall. Barely.", tier: 'self_expansion', category: 'ambition' },
  { id: 'no_plan_trip', short: "A trip with no plan", text: "Tell me about a trip you took with almost no plan. Where did you end up?", helpText: TRIVIA, exampleAnswer: "Drove to Moab on a Friday night with a tent and no campsite. Slept in the truck bed the first night, found a spot by the creek the second. Best two days of that year.", tier: 'self_expansion', category: 'warmth' },

  // ─── Tier 2: I-Sharing (13) ───
  { id: 'made_them_watch', short: "What you make everyone try", text: "What's something you love that you make everyone else try? Who was the last person you got?", helpText: "The song, the show, the place, the dish. " + TRIVIA, exampleAnswer: "There's a burger place in Springville I take everyone to. My sister said she'd already been. I took her anyway. She ordered two.", tier: 'i_sharing', category: 'depth' },
  { id: 'friends_still_bring_up', short: "What your friends still bring up", text: "What's something you did that your friends still bring up? Tell it the way they tell it.", helpText: "The more embarrassing the better. " + TRIVIA, exampleAnswer: "I ordered in Spanish at a taqueria once and apparently asked for a jacket of pork. My friends order jackets of things every time we go out now.", tier: 'i_sharing', category: 'humor' },
  { id: 'notice_first', short: "What you notice that others don't", text: "What do you notice everywhere that nobody else seems to? When did it last come up?", helpText: TRIVIA, exampleAnswer: "Crooked pictures, in any restaurant or office. My sister's family knows now, and I'm allowed to fix one per visit.", tier: 'i_sharing', category: 'depth' },
  { id: 'guilty_pleasure', short: "The thing you'd have to explain", text: "What's something you enjoy that you'd have to explain? When did you last do it?", helpText: TRIVIA, exampleAnswer: "Mall pretzels. I'll drive to the mall just for the pretzel. Saturday I went in, got it, and left without going in a single store.", tier: 'i_sharing', category: 'humor' },
  { id: 'weird_habit', short: "A habit someone pointed out", text: "What's a habit of yours that someone has actually pointed out? What did they say?", helpText: TRIVIA, exampleAnswer: "I talk through what I'm doing while I cook, like it's a show. My sister walked in on 'and now we fold' and has not let it go.", tier: 'i_sharing', category: 'humor' },
  { id: 'song_on_repeat', short: "What you've had on repeat", text: "What have you had on repeat lately? How many times are we talking?", helpText: TRIVIA, exampleAnswer: "Tusk by Fleetwood Mac, on every drive for two months. Spotify said four hundred plays. My carpool has limited me to one per trip.", tier: 'i_sharing', category: 'humor' },
  { id: 'movie_scene', short: "What you like that others call ugly", text: "What do you think is great that everyone else thinks is ugly? What have you done about it?", helpText: "The building, the truck, the view nobody else would photograph. " + TRIVIA, exampleAnswer: "Old spiral parking garages. There's a concrete one downtown from the seventies, and I'll pay extra to park in it. I've taken pictures of it. More than once.", tier: 'i_sharing', category: 'depth' },
  { id: 'pet_peeve', short: "What bugs you more than it should", text: "What's a small thing that bugs you more than it should? When did it last get you?", helpText: TRIVIA, exampleAnswer: "Loud chewers. A guy at work eats almonds at two every day. I bought headphones for it. Yesterday I had them on before he opened the drawer.", tier: 'i_sharing', category: 'humor' },
  { id: 'comfort_food', short: "Your comfort food", text: "What's your comfort food? Give me the specifics.", helpText: TRIVIA, exampleAnswer: "Boxed mac and cheese with an egg stirred in off the heat. A roommate showed me in 2014. I've never told anyone because it sounds bad. It isn't.", tier: 'i_sharing', category: 'warmth' },
  { id: 'ick_or_green_flag', short: "Deciding you liked someone fast", text: "When's a time you decided you liked someone in about four seconds? What did they do, and what did you do about it?", helpText: TRIVIA, exampleAnswer: "A guy at trivia handed the other team the tiebreaker because they'd worked harder for it. I got him onto our team the same night.", tier: 'i_sharing', category: 'depth' },
  { id: 'dealbreaker_funny', short: "Something petty you held onto", text: "What's a small thing you held against someone for way too long?", helpText: TRIVIA, exampleAnswer: "A guy at work parked crooked once, in 2022. He's parked fine every day since. I still check.", tier: 'i_sharing', category: 'humor' },
  { id: 'slow_tuesday', short: "A running joke you won't drop", text: "What's a running joke you keep going that everyone around you has to put up with? When did it last go too far?", helpText: "The voice, the bit, the thing you say every single time. " + TRIVIA, exampleAnswer: "I do my dog's inner voice. He's British and disappointed in all of us. I did it through a whole dinner at my brother's, and his father-in-law asked if I was okay.", tier: 'i_sharing', category: 'humor' },
  { id: 'small_thing_rules', short: "Something small you have rules about", text: "What's something small you have strong opinions about? Give me the rules.", helpText: TRIVIA, exampleAnswer: "Loading a dishwasher. Plates face the center, no nesting bowls, spatulas handle-down. I've reloaded other people's dishwashers at parties.", tier: 'i_sharing', category: 'depth' },

  // ─── Tier 3: Admiration (13) ───
  { id: 'bet_on_yourself', short: "A bet you made on yourself", text: "Tell me about a bet you made on yourself. What's the part you didn't tell anyone?", helpText: TRIVIA, exampleAnswer: "Quit a sales job for nursing school. What nobody knew was that I sold my truck to cover the first semester and told everyone I was trying transit.", tier: 'admiration', category: 'ambition' },
  { id: 'hardest_thing', short: "What you stuck with", text: "What's something you stuck with long after most people would have quit? Where's it at now?", helpText: TRIVIA, exampleAnswer: "Guitar, starting at thirty. Two years in I could play four songs badly. It's about ten now, and I play at my brother's every Sunday whether they want it or not.", tier: 'admiration', category: 'ambition' },
  { id: 'helped_someone', short: "Helping someone, more than planned", text: "What's something you did to help someone that turned into a bigger job than you expected?", helpText: TRIVIA, exampleAnswer: "My neighbor's car died, so I drove her kids to school for two weeks. They rated my music every morning out of ten. Mostly sixes.", tier: 'admiration', category: 'warmth' },
  { id: 'figured_it_out', short: "Something you fixed instead of replaced", text: "What's something you fixed that everyone told you to just replace? How's it holding up?", helpText: TRIVIA, exampleAnswer: "A 2009 washing machine. Everyone said buy a new one. Forty-dollar part and a YouTube video. Still running. Louder than it should be.", tier: 'admiration', category: 'ambition' },
  { id: 'trusted_with', short: "When someone put you in charge", text: "When's a time someone put you in charge of something that mattered to them? How did you handle it?", helpText: TRIVIA, exampleAnswer: "My sister had me officiate her wedding. I interviewed them separately for material, like a reporter. Nine drafts. The dog joke landed.", tier: 'admiration', category: 'warmth' },
  { id: 'against_the_grain', short: "Doing what nobody would've picked", text: "When's a time you did the thing nobody around you would have picked? What did they say?", helpText: TRIVIA, exampleAnswer: "Whole family's in finance. I announced the teaching credential at Thanksgiving. Dad said, if this is about money, we can help. It was not about money.", tier: 'admiration', category: 'ambition' },
  { id: 'building_right_now', short: "Something you built this year", text: "What did you build or fix this year that you're a little proud of? What went wrong along the way?", helpText: TRIVIA, exampleAnswer: "A deck off the back of my brother's house. Two weekends turned into five. One footing is six inches off, and we built around it. It's solid.", tier: 'admiration', category: 'ambition' },
  { id: 'failure_lesson', short: "Something you got wrong", text: "Tell me about something you got badly wrong. How long did it take you to admit it?", helpText: TRIVIA, exampleAnswer: "Started a T-shirt company and lost fifteen grand. The boxes sat in my dining room for a year. I ate Thanksgiving next to them twice.", tier: 'admiration', category: 'vulnerability' },
  { id: 'mentor_moment', short: "Your unreasonably high standards", text: "What do you have unreasonably high standards about? When did it last cost you?", helpText: TRIVIA, exampleAnswer: "Packing a truck. Everything has a place and a strap. Helped a buddy move and redid his whole load in the driveway while he watched. Took an extra hour. Nothing shifted.", tier: 'admiration', category: 'depth' },
  { id: 'secret_talent', short: "What you're unexpectedly good at", text: "What are you unexpectedly good at? How did you find out?", helpText: TRIVIA, exampleAnswer: "Calligraphy. Big guy with a beard, careful hand lettering. Found out at a wedding when they ran out of place cards and handed me a pen.", tier: 'admiration', category: 'humor' },
  { id: 'getting_better_at', short: "What you're bad at but still doing", text: "What are you bad at and still doing anyway? How's it going this week?", helpText: TRIVIA, exampleAnswer: "Pickup basketball on Tuesday nights. Three years in, still picked last, still there at six.", tier: 'admiration', category: 'vulnerability' },
  { id: 'stood_up_for', short: "Saying the awkward true thing", text: "When did you say the true thing even though it was awkward? What happened after?", helpText: TRIVIA, exampleAnswer: "Told my mom the turkey was dry. Once, in 2019. She puts it on the table every Thanksgiving now and looks right at me.", tier: 'admiration', category: 'warmth' },
  { id: 'no_instructions', short: "Figuring it out with no instructions", text: "When's a time you had to figure something out with no instructions and no time? What did you do?", helpText: TRIVIA, exampleAnswer: "Water heater went at eleven at night, the day before my brother's family came to stay. Shut the main, watched two videos, two trips to the hardware store. Hot water by nine.", tier: 'admiration', category: 'ambition' },

  // ─── Tier 4: Comfort & Attachment (11) ───
  { id: 'recharge', short: "How you shake off a bad week", text: "What do you do to shake off a bad week? The actual thing, not just sleep.", helpText: TRIVIA, exampleAnswer: "Drive up the canyon Saturday morning with a thermos and no plan. Sometimes I fish, sometimes I sit on the tailgate. Back by noon.", tier: 'comfort', category: 'warmth' },
  { id: 'close_people', short: "What your oldest friend teases you about", text: "What does your oldest friend always give you a hard time about?", helpText: TRIVIA, exampleAnswer: "Danny won't let go of the fact that I planned our Moab trip with a spreadsheet. It had tabs. One of them was labeled 'snacks'.", tier: 'comfort', category: 'warmth' },
  { id: 'love_language_real', short: "What you always end up doing at family stuff", text: "What do you always end up doing at family stuff or a friend's place without being asked?", helpText: TRIVIA, exampleAnswer: "Fixing whatever's broken. I show up to my mom's for dinner and end up under the sink. My brother-in-law has started leaving a list on the fridge.", tier: 'comfort', category: 'warmth' },
  { id: 'disagree_well', short: "A dumb argument you keep having", text: "What's a dumb argument you keep having with someone in your family? How does it usually end?", helpText: TRIVIA, exampleAnswer: "Whether a hot dog is a sandwich. Four hours, in a car, with my dad. We agreed to stop. Neither of us has conceded.", tier: 'comfort', category: 'humor' },
  { id: 'safe_place', short: "The spot you keep going back to", text: "Where's a spot you go back to over and over? What do you do there?", helpText: TRIVIA, exampleAnswer: "A bench at the top of the trail behind my parents' place. I've been going up there since high school. Mostly I just sit. Once a guy was on it and I walked the loop twice waiting for him to leave.", tier: 'comfort', category: 'warmth' },
  { id: 'standing_ritual', short: "The plan that never moves", text: "What's the standing plan in your week that never moves? What's the rule?", helpText: "Who's there, where it is, what got said last time. " + TRIVIA, exampleAnswer: "Sunday pho with my brother, same booth since 2019. Rule is you can bring someone, but they order from the back of the menu. His girlfriend ordered tripe first try. She's in.", tier: 'comfort', category: 'warmth' },
  { id: 'morning_person', short: "Your actual morning", text: "Walk me through your morning. The real one, not the one you'd like to have.", helpText: TRIVIA, exampleAnswer: "Snooze twice. Instant oatmeal standing up. Ten minutes looking for my keys because I refuse to own a key hook. Four minutes late to everything. It's a system.", tier: 'comfort', category: 'humor' },
  { id: 'small_repair', short: "What you keep running", text: "What do you keep running that most people would have let go? How's it doing?", helpText: "A truck, a watch, a mower, a group chat, a long-distance friendship. " + TRIVIA, exampleAnswer: "My grandpa's '94 Ranger. Worth about two grand, costs me more than that a year. Starts every time. I'm not selling it.", tier: 'comfort', category: 'warmth' },
  { id: 'learned_from_someone', short: "What you do the way you were taught", text: "What do you still do exactly the way someone taught you? Who was it?", helpText: TRIVIA, exampleAnswer: "Clean as you go. My first boss at the shop. Halfway through cooking my kitchen looks like nobody's been in it, and people find that weird.", tier: 'comfort', category: 'warmth' },
  { id: 'counted_on', short: "Who counts on you every week", text: "Who counts on you for something every week? What is it?", helpText: TRIVIA, exampleAnswer: "My sister. I've got her kids Wednesday nights so she can work her shift. We do homework, then we do something I'd get in trouble for.", tier: 'comfort', category: 'warmth' },
  { id: 'chore_you_like', short: "A chore you actually like", text: "What's a chore you actually like doing? When did you last do it?", helpText: TRIVIA, exampleAnswer: "Mowing. Straight lines, headphones in, forty-five minutes where nobody needs anything. Did mine Saturday, then did the neighbor's because I wasn't done.", tier: 'comfort', category: 'warmth' },

  // ─── Fun / Wildcard (10) ───
  { id: 'conspiracy', short: "A hot take you've tested", text: "What's a hot take you've actually tested? What's the evidence?", helpText: TRIVIA, exampleAnswer: "Any restaurant with a neon sign that has a slogan on it has bad food. I keep a note in my phone. Eleven for eleven.", tier: 'fun', category: 'humor' },
  { id: 'worst_date', short: "A date that went sideways", text: "Tell me about a date that went sideways. What was your move?", helpText: TRIVIA, exampleAnswer: "It turned out to be his coworker's engagement party. He'd double-booked. Someone handed me the card to sign, so I signed it 'so happy for you two, Jess, Dave's date' and left after the toast.", tier: 'fun', category: 'humor' },
  { id: 'irrational_fear', short: "An irrational fear", text: "What's an irrational fear you have? When did it last get you?", helpText: TRIVIA, exampleAnswer: "The end of escalators. Last week at the airport I did the little hop, with a suitcase, and a kid laughed at me. Fair.", tier: 'fun', category: 'humor' },
  { id: 'superpower', short: "Pointless effort you're proud of", text: "What's something pointless you've put real effort into? Walk me through it.", helpText: TRIVIA, exampleAnswer: "A spreadsheet ranking every bagel place within twenty minutes. Columns for crust, chew, and whether they toast without asking, which is disqualifying. Thirty-one entries.", tier: 'fun', category: 'humor' },
  { id: 'apocalypse_skill', short: "The useful thing nobody expects", text: "What's a useful thing you can do that nobody expects? When did it last come in handy?", helpText: TRIVIA, exampleAnswer: "I can back up a trailer. Farm kid. Last month my neighbor was losing a fight with a U-Haul, so I did it in one try and walked back inside without a word.", tier: 'fun', category: 'humor' },
  { id: 'most_me_photo', short: "A photo that needs explaining", text: "What's a photo of you that would take some explaining? Describe it.", helpText: TRIVIA, exampleAnswer: "Me holding a frozen turkey like a newborn, in July, in a Halloween costume. Lost a fantasy football bet. The forfeit was a full photoshoot. There are eleven.", tier: 'fun', category: 'warmth' },
  { id: 'dating_confession', short: "The part of dates you're bad at", text: "What part of a first date are you actually bad at? Tell me about one that went that way.", helpText: TRIVIA, exampleAnswer: "The goodbye. I've hugged, handshaked, and waved at the same person in one motion. Last one ended in a headbutt. She texted 'nice headbutt', so, fine.", tier: 'fun', category: 'vulnerability' },
  { id: 'first_job', short: "Your first job", text: "What was your first job, and what were you bad at?", helpText: TRIVIA, exampleAnswer: "Dairy Queen at sixteen. Could not do the curl on the cone. Mine looked defeated. They moved me to drive-thru, where I flourished.", tier: 'fun', category: 'humor' },
  { id: 'overpacked', short: "What you always bring", text: "What's something you always bring that nobody else does? When did it last pay off?", helpText: TRIVIA, exampleAnswer: "Band-aids, in every bag. Wedding last month, a bridesmaid's heel strap drew blood, and I produced one mid-reception. I've been thanked in a toast. Not my toast.", tier: 'fun', category: 'humor' },
  { id: 'bad_at_pretending', short: "What you can't hide", text: "What are you bad at hiding? When did it last give you away?", helpText: TRIVIA, exampleAnswer: "Being bored. My face just leaves. In a meeting my manager stopped and said 'Kayla has notes.' I did not have notes. I had a face.", tier: 'fun', category: 'humor' },
]

/**
 * Prompts retired in the v3 and v4 rewrites. Kept only so historical voice_memos rows
 * still render their question text; never offered to users.
 */
export const RETIRED_PROMPT_TEXT: Record<string, string> = {
  different_life: "If you woke up tomorrow in a completely different career, what would you want it to be?",
  perfect_evening: "Describe your perfect low-key evening.",
  values_test: "When's a time your values were tested and you held firm?",
  grateful_for: "What's something small that you're grateful for today?",
  relationship_lesson: "What's the most important thing you've learned about relationships?",
  time_machine: "If you could go back and give your 18-year-old self one piece of advice, what would it be?",
  celebrity_dinner: "You get dinner with one person, living or dead. Who and why?",
  three_things: "You can only bring three things to a desert island. What are they?",
  gives_you_chills: "What's something that gives you actual chills? Music, a moment, a place?",
  laugh_hardest: "Tell us about the last time you laughed so hard you couldn't breathe.",
  proud_of_someone: "Who are you most proud of and why?",
  hard_day: "What do you need from someone when you're having a hard day?",
  // v4
  obsession: "What are you obsessed with that most people find boring? What do your friends say?",
}

const PROMPT_TEXT_BY_ID = new Map<string, string>([
  ...QUESTION_BANK.map(q => [q.id, q.text] as [string, string]),
  ...Object.entries(RETIRED_PROMPT_TEXT),
])

/** Question text for any prompt id, including retired ones. */
export function getPromptText(id: string): string | undefined {
  return PROMPT_TEXT_BY_ID.get(id)
}

/**
 * The four pitch angles. `fun` is a wildcard tier, not an angle — it mostly
 * feeds i_sharing, so it is never required for a profile to be complete.
 */
export const ANGLE_TIERS = ['self_expansion', 'i_sharing', 'admiration', 'comfort'] as const
export type AngleTier = (typeof ANGLE_TIERS)[number]

export const ANGLE_LABELS: Record<AngleTier, string> = {
  self_expansion: 'What you chase',
  i_sharing: 'How you see things',
  admiration: 'What you pull off',
  comfort: 'What you come home to',
}

const TIER_BY_ID = new Map(QUESTION_BANK.map(q => [q.id, q.tier]))

export interface ProfileCompletion {
  answered: number
  covered: AngleTier[]
  missing: AngleTier[]
  isComplete: boolean
}

/**
 * A profile is complete when every angle has at least one story behind it.
 *
 * This threshold is derived, not chosen: `generateTrailer` writes from one of
 * four angles, and the thin-data swap fires when the assigned angle has no
 * feeding material. An angle with zero memos is an angle we can never pitch
 * this person from, so "complete" means all four are writable. Count alone
 * would not do — six memos all in one tier still leaves three angles dead.
 * Memos recorded against retired prompt ids still count toward `answered`
 * but cannot contribute coverage, since their tier is gone.
 */
export function getProfileCompletion(
  answeredPromptIds: string[],
  /** Prompts outside QUESTION_BANK (fished from quiz answers) whose tiers still count. */
  extra: PromptDef[] = [],
): ProfileCompletion {
  const tiers = new Map(TIER_BY_ID)
  for (const p of extra) tiers.set(p.id, p.tier)
  const covered = new Set<AngleTier>()
  for (const id of answeredPromptIds) {
    const tier = tiers.get(id)
    if (tier && (ANGLE_TIERS as readonly string[]).includes(tier)) {
      covered.add(tier as AngleTier)
    }
  }
  const missing = ANGLE_TIERS.filter(t => !covered.has(t))
  return {
    answered: answeredPromptIds.length,
    covered: ANGLE_TIERS.filter(t => covered.has(t)),
    missing,
    isComplete: missing.length === 0,
  }
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Options for the prompt picker: `count` prompts the user chooses between.
 *
 * Ordered by what the profile still needs — one from each uncovered angle
 * first, so picking any option moves the profile toward complete. Remaining
 * slots are filled at random from everything unanswered (including `fun`), so
 * the list never looks like a chore. Excludes anything already answered or
 * explicitly passed over.
 */
/**
 * The angle this round should ask about: the first one with no story behind it.
 * Onboarding asks for three recordings, and asking each from a different angle
 * is what makes the profile writable from every direction — a shuffled list can
 * put all three in one tier and leave three angles dead.
 *
 * Returns null once every angle is covered.
 */
export function getNextAngle(
  answeredPromptIds: string[],
  personalised: PromptDef[] = [],
): AngleTier | null {
  return getProfileCompletion(answeredPromptIds, personalised).missing[0] ?? null
}

export function getPromptChoices(
  answeredPromptIds: string[],
  count = 5,
  excludeIds: string[] = [],
  /**
   * Prompts fished from this reader's quiz answers. They lead the list: the
   * quiz's whole promise is that the mic gets aimed, and a personalised prompt
   * buried below five generic ones does not read as "they listened".
   */
  personalised: PromptDef[] = [],
  /**
   * Constrain the whole round to one angle. Every option on screen then belongs
   * to the same bucket, which is what lets the screen be titled and what makes
   * consecutive rounds visibly different.
   */
  angle?: AngleTier | null,
): PromptDef[] {
  const taken = new Set([...answeredPromptIds, ...excludeIds])
  const inAngle = (p: PromptDef) => !angle || p.tier === angle
  const available = QUESTION_BANK.filter(p => !taken.has(p.id) && inAngle(p))
  const { missing } = getProfileCompletion(answeredPromptIds, personalised)

  // Lead with ONE personalised prompt, not all of them. Leading with the whole
  // set meant that after recording one, the next draw showed the same rows in
  // the same order and read as "nothing happened". One per round also spreads
  // them across the recordings instead of spending them all on screen one.
  // A personalised prompt from this round's angle leads it, when the reader's
  // answers produced one.
  const picked: PromptDef[] = personalised.filter(p => !taken.has(p.id) && inAngle(p)).slice(0, 1)
  if (!angle) {
    for (const tier of missing) {
      if (picked.length >= count) break
      const candidates = shuffle(available.filter(p => p.tier === tier && !picked.includes(p)))
      if (candidates.length) picked.push(candidates[0])
    }
  }

  const rest = shuffle(available.filter(p => !picked.includes(p)))
  for (const p of rest) {
    if (picked.length >= count) break
    picked.push(p)
  }

  // Personalised prompts keep the top of the list; only the bank fill shuffles.
  const lead = picked.filter(p => personalised.includes(p))
  return [...lead, ...shuffle(picked.filter(p => !personalised.includes(p)))]
}

// Onboarding gets a mix: 2 self-expansion, 1 each of i-sharing, admiration, comfort, fun
const ONBOARDING_WEIGHTS: Record<string, number> = {
  self_expansion: 2,
  i_sharing: 1,
  admiration: 1,
  comfort: 1,
  fun: 1,
}

export function getOnboardingPrompts(count = 6): PromptDef[] {
  const pool = [...QUESTION_BANK]
  const selected: PromptDef[] = []

  // Pick weighted by tier
  const tierOrder = Object.entries(ONBOARDING_WEIGHTS)
    .flatMap(([tier, weight]) => Array(weight).fill(tier))

  // Shuffle tier order
  for (let i = tierOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tierOrder[i], tierOrder[j]] = [tierOrder[j], tierOrder[i]]
  }

  for (const tier of tierOrder) {
    if (selected.length >= count) break
    const candidates = pool.filter(p => p.tier === tier && !selected.includes(p))
    if (candidates.length === 0) continue
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    selected.push(pick)
    pool.splice(pool.indexOf(pick), 1)
  }

  // Fill remaining slots randomly
  while (selected.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length)
    selected.push(pool[idx])
    pool.splice(idx, 1)
  }

  return selected
}

export function getRandomPrompt(excludeIds: string[]): PromptDef | null {
  const candidates = QUESTION_BANK.filter(p => !excludeIds.includes(p.id))
  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

/**
 * Get prompts targeted at a specific tier (dimension), excluding already-answered ones.
 * Returns 3 recommended prompts for the target tier + 3 from other tiers.
 */
export function getTargetedPrompts(
  targetTier: string,
  excludeIds: string[],
  count = 3,
): { targeted: PromptDef[]; others: PromptDef[] } {
  const available = QUESTION_BANK.filter(p => !excludeIds.includes(p.id))

  // Map dimension names to tier names
  const tierMap: Record<string, string> = {
    explorer: 'self_expansion',
    connector: 'i_sharing',
    builder: 'admiration',
    nurturer: 'comfort',
    wildcard: 'fun',
    // Also accept tier names directly
    self_expansion: 'self_expansion',
    i_sharing: 'i_sharing',
    admiration: 'admiration',
    comfort: 'comfort',
    fun: 'fun',
  }
  const tier = tierMap[targetTier] || targetTier

  const inTier = available.filter(p => p.tier === tier)
  const outOfTier = available.filter(p => p.tier !== tier)

  // Shuffle
  const shuffled = (arr: PromptDef[]) => arr.sort(() => Math.random() - 0.5)

  return {
    targeted: shuffled(inTier).slice(0, count),
    others: shuffled(outOfTier).slice(0, count),
  }
}
