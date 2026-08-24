export interface PromptDef {
  id: string
  text: string
  helpText: string
  exampleAnswer: string
  tier: 'self_expansion' | 'i_sharing' | 'admiration' | 'comfort' | 'fun'
  category: string
}

const TRIVIA = "The small stuff is the good stuff — the more specific, the better."

export const QUESTION_BANK: PromptDef[] = [
  // ─── Tier 1: Self-Expansion (12) ───
  { id: 'rabbit_hole', text: "What's the last rabbit hole you went down? How far did it actually go?", helpText: TRIVIA, exampleAnswer: "The Titanic sub thing. I ended up reading the actual court filings at 2am. I can name everyone on board. My girlfriend has banned it at dinner.", tier: 'self_expansion', category: 'depth' },
  { id: 'taught_yourself', text: "What's something you taught yourself with nobody to ask? What did you wreck along the way?", helpText: TRIVIA, exampleAnswer: "Cutting my own hair. The first attempt required wearing a hat to a Zoom wedding. I have proper shears now and I do the back with two mirrors.", tier: 'self_expansion', category: 'ambition' },
  { id: 'show_someone_your_city', text: "Who's the last person you showed your city? Where'd you take them, and did they get it?", helpText: TRIVIA, exampleAnswer: "My roommate visited and I made her hike forty minutes to my swimming hole. She wanted the aquarium. We went to the aquarium. It was great.", tier: 'self_expansion', category: 'warmth' },
  { id: 'changed_your_mind', text: "What did you used to be completely sure about? Where were you when it fell apart?", helpText: TRIVIA, exampleAnswer: "I was sure I hated cilantro — I sent things back over it. Then I ate a whole bowl of my friend's curry and she told me after. Fifteen years, performed.", tier: 'self_expansion', category: 'depth' },
  { id: 'obsession', text: "What are you obsessed with that most people find boring? What do your friends say?", helpText: TRIVIA, exampleAnswer: "Grocery store layouts. The good ones walk you past produce first. My boyfriend calls it my lap of judgment and he's started timing it.", tier: 'self_expansion', category: 'depth' },
  { id: 'side_quest', text: "What's a side quest you ended up on? Start where you got pulled off course.", helpText: TRIVIA, exampleAnswer: "Went to buy a dresser off Marketplace and the guy ran a pigeon rescue. Stayed an hour. Met every pigeon. Did get the dresser.", tier: 'self_expansion', category: 'warmth' },
  { id: 'best_purchase', text: "What's something about you people don't believe at first? Tell me how it usually comes up.", helpText: "The thing you have to prove. " + TRIVIA, exampleAnswer: "That I don't drink. People argue with me about it at weddings, so I hold a lime soda all night as a decoy. Easier than the conversation.", tier: 'self_expansion', category: 'humor' },
  { id: 'unpopular_take', text: "What's the take you've had to defend out loud? Who's still mad at you about it?", helpText: TRIVIA, exampleAnswer: "Die Hard is not a Christmas movie. I made a slide deck. I presented it at Thanksgiving. My brother-in-law texts me the poster every December first.", tier: 'self_expansion', category: 'humor' },
  { id: 'bucket_list_done', text: "What's something you'd been saying you'd do for years and then finally did? How did the actual day go?", helpText: TRIVIA, exampleAnswer: "Finally walked the Camino after nine years of saying I would. Cried in a pharmacy on day two and did the last 400 miles in orthopedic sandals.", tier: 'self_expansion', category: 'ambition' },
  { id: 'world_expert', text: "What do people come to you about? Tell me about the last time someone did.", helpText: TRIVIA, exampleAnswer: "Used cars. My coworker called me from the lot last month and I made him film the guy walking around it. He did not buy the car.", tier: 'self_expansion', category: 'depth' },
  { id: 'weekend_project', text: "What's something you tried exactly once? Tell me how it ended.", helpText: "The one and only time. " + TRIVIA, exampleAnswer: "Hot yoga. I didn't know it was hot yoga. Wore a hoodie, lasted twenty minutes, sat in my car with the AC on. The mat's in my closet, judging me.", tier: 'self_expansion', category: 'humor' },
  { id: 'last_new_place', text: "Where's the last new place you went, however small? What was the verdict?", helpText: TRIVIA, exampleAnswer: "Drove forty minutes for a famous pie. Verdict: pie was fine. The waitress told us about her divorce for twenty minutes, which was worth the drive.", tier: 'self_expansion', category: 'warmth' },

  // ─── Tier 2: I-Sharing (12) ───
  { id: 'made_them_watch', text: "What's the thing you love that you make other people experience? Tell me about your most recent victim.", helpText: "The song, the show, the dish, the view — the one you push on people. " + TRIVIA, exampleAnswer: "The Twilight Zone episode where the guy breaks his glasses. I've made three people watch it just to see their face at the end. My roommate calls it an ambush.", tier: 'i_sharing', category: 'depth' },
  { id: 'friends_still_bring_up', text: "What's something you did that your friends still bring up? Tell it the way they tell it.", helpText: "The more embarrassing the better — this is a judgment-free zone. " + TRIVIA, exampleAnswer: "I once confidently ordered 'a jacket of pork' in Spanish at a taqueria. My friends have ordered jackets of things at every dinner since.", tier: 'i_sharing', category: 'humor' },
  { id: 'notice_first', text: "What do you notice everywhere that nobody else does? When did it last ruin something?", helpText: TRIVIA, exampleAnswer: "Continuity errors. I said 'her coffee refilled itself' out loud during a thriller and my girlfriend paused it and issued a formal warning.", tier: 'i_sharing', category: 'depth' },
  { id: 'guilty_pleasure', text: "What's the thing you enjoy that you'd have to explain? Tell me about the last time you did it.", helpText: TRIVIA, exampleAnswer: "Mall pretzels. I drive to the mall for the pretzel. Saturday I went in, got it, and left without entering a single store.", tier: 'i_sharing', category: 'humor' },
  { id: 'weird_habit', text: "What's a habit of yours someone has actually commented on? What did they say?", helpText: TRIVIA, exampleAnswer: "I narrate my own cooking like a show. My sister walked in on 'and now we fold' and has never let it go.", tier: 'i_sharing', category: 'humor' },
  { id: 'song_on_repeat', text: "What have you had on repeat lately? How many times are we talking, honestly?", helpText: TRIVIA, exampleAnswer: "Tusk, by Fleetwood Mac, on every single drive for two months. Spotify says four hundred plays. My carpool has limited me to one per trip.", tier: 'i_sharing', category: 'humor' },
  { id: 'movie_scene', text: "What do you find beautiful that everyone else thinks is ugly? What have you done about it?", helpText: "The building, the object, the view nobody else would photograph. " + TRIVIA, exampleAnswer: "Spiral parking garages. There's a concrete one downtown from the seventies and I'll pay extra to park in it. I have photographed it. Twice.", tier: 'i_sharing', category: 'depth' },
  { id: 'pet_peeve', text: "What's a small thing that bothers you more than it should? When did it last get you?", helpText: TRIVIA, exampleAnswer: "Loud chewers. My coworker eats almonds at 2pm and I bought headphones specifically for almond frequencies. Yesterday I had them on before he opened the drawer.", tier: 'i_sharing', category: 'humor' },
  { id: 'comfort_food', text: "What's your comfort food? Tell me the embarrassing specifics.", helpText: TRIVIA, exampleAnswer: "Boxed mac and cheese with an egg stirred in off the heat. Learned it from a roommate in 2014 and never told anyone because it sounds disgusting.", tier: 'i_sharing', category: 'warmth' },
  { id: 'ick_or_green_flag', text: "When's a time you decided you liked someone in about four seconds? What did they do — and what did you do about it?", helpText: TRIVIA, exampleAnswer: "A guy at trivia handed the other team the tiebreaker because they'd 'worked harder for it.' I made him join our team the same night.", tier: 'i_sharing', category: 'depth' },
  { id: 'dealbreaker_funny', text: "What's a small thing you've genuinely held against someone? Be honest about how petty it was.", helpText: TRIVIA, exampleAnswer: "I held a parking job against a coworker for a full year. He parked fine every day after. I was still watching.", tier: 'i_sharing', category: 'humor' },
  { id: 'slow_tuesday', text: "What's a bit you run that everyone around you has to tolerate? When did it last go too far?", helpText: "The voice, the running joke, the thing you say every single time. " + TRIVIA, exampleAnswer: "I voice my dog's inner monologue. He's British and deeply disappointed in us. I did it through a whole dinner at my in-laws' and my father-in-law asked if I was okay.", tier: 'i_sharing', category: 'humor' },

  // ─── Tier 3: Admiration (12) ───
  { id: 'bet_on_yourself', text: "Tell me about a bet you made on yourself. What's the part you didn't tell anyone about?", helpText: TRIVIA, exampleAnswer: "Quit marketing for nursing school. What nobody knew: I sold my car to cover first semester and told everyone I was 'trying transit.'", tier: 'admiration', category: 'ambition' },
  { id: 'hardest_thing', text: "What have you put absurd effort into for no good reason? How far did it go?", helpText: TRIVIA, exampleAnswer: "Three years reverse-engineering a chili from a place in Cincinnati. Forty batches. Batch thirty-one I wrote CLOSE in caps. Then I lost the notebook.", tier: 'admiration', category: 'ambition' },
  { id: 'helped_someone', text: "What's something you've done to help someone that got weirdly elaborate?", helpText: TRIVIA, exampleAnswer: "Neighbor's car died so I drove her kids to school for two weeks. They rated my music every morning out of ten. Sixes, mostly.", tier: 'admiration', category: 'warmth' },
  { id: 'figured_it_out', text: "What do you do yourself that most people pay for? Tell me about the first attempt.", helpText: TRIVIA, exampleAnswer: "I do my own brakes. First time I put the pads in backwards and drove four blocks making a noise I still think about.", tier: 'admiration', category: 'ambition' },
  { id: 'trusted_with', text: "When's a time someone put you in charge of something that mattered? How far did you take it?", helpText: TRIVIA, exampleAnswer: "My sister had me officiate her wedding. I interviewed them separately for material, like a journalist. Nine drafts. The dog joke killed.", tier: 'admiration', category: 'warmth' },
  { id: 'against_the_grain', text: "When's a time you did the thing nobody around you would have picked? What did they say?", helpText: TRIVIA, exampleAnswer: "Whole family's in finance. I announced the teaching credential at Thanksgiving. Dad said 'if this is about money, we can help.' It was not about money.", tier: 'admiration', category: 'ambition' },
  { id: 'building_right_now', text: "What are you building right now? Walk me through where it's at — including the part that isn't working.", helpText: TRIVIA, exampleAnswer: "Training for a triathlon. Still the slowest person in the pool. The part that isn't working is the swim. And my alarm.", tier: 'admiration', category: 'ambition' },
  { id: 'failure_lesson', text: "Tell me about something you got badly wrong. How long did it take to admit it?", helpText: TRIVIA, exampleAnswer: "Started a T-shirt company, lost $15k. The unsold boxes lived in my dining room for a year — I ate Thanksgiving next to them twice.", tier: 'admiration', category: 'vulnerability' },
  { id: 'mentor_moment', text: "What do you have unreasonably high standards about? Tell me about the last time it cost you.", helpText: TRIVIA, exampleAnswer: "Road-trip playlists. I build them with an actual arc. On the last four-hour drive my friends held a vote and overrode me inside twenty minutes.", tier: 'admiration', category: 'depth' },
  { id: 'secret_talent', text: "What are you unexpectedly good at? Tell me how you found out.", helpText: TRIVIA, exampleAnswer: "I do calligraphy. Big bearded guy, delicate hand lettering. Found out at a wedding when they ran out of place cards and handed me a pen.", tier: 'admiration', category: 'humor' },
  { id: 'getting_better_at', text: "What are you actively bad at and still doing? How's it going this week?", helpText: TRIVIA, exampleAnswer: "Pottery, month four. Everything I make is a 'bowl' in the sense that it's round and holds nothing. I've kept every one.", tier: 'admiration', category: 'vulnerability' },
  { id: 'stood_up_for', text: "When's a time you said the inconvenient thing out loud? Bonus points if the stakes were tiny.", helpText: TRIVIA, exampleAnswer: "Told my book club I hadn't read the book. Then that I hadn't read the last six. We're a wine club with a reading problem now.", tier: 'admiration', category: 'warmth' },

  // ─── Tier 4: Comfort & Attachment (9) ───
  { id: 'recharge', text: "What's your weird recovery ritual after a brutal week? The specific one, not the sleep.", helpText: TRIVIA, exampleAnswer: "I reorganise the fridge. Everything comes out, gets wiped, goes back by height. My roommate has learned not to speak to me during it.", tier: 'comfort', category: 'warmth' },
  { id: 'close_people', text: "What's your oldest friend always giving you a hard time about?", helpText: TRIVIA, exampleAnswer: "Dani won't let go of the bachelorette spreadsheet. It had tabs. One of them was labeled 'pool time.'", tier: 'comfort', category: 'warmth' },
  { id: 'love_language_real', text: "What's your specific way of showing you care that other people find a little odd?", helpText: TRIVIA, exampleAnswer: "I make people playlists and never tell them. I just add songs to a shared file for months and hope they notice.", tier: 'comfort', category: 'warmth' },
  { id: 'disagree_well', text: "Tell me about a stupid argument you've had with someone you love. Who won?", helpText: TRIVIA, exampleAnswer: "Whether a hot dog is a sandwich. Four hours. In a car. We formally agreed to stop and neither of us has conceded.", tier: 'comfort', category: 'humor' },
  { id: 'safe_place', text: "What's a place you have a completely unearned sense of ownership over? What's your spot?", helpText: TRIVIA, exampleAnswer: "My grandma's kitchen counter. I sit on it, she tells me to get off, I don't. Thirty years of the same argument, same rooster wallpaper.", tier: 'comfort', category: 'warmth' },
  { id: 'standing_ritual', text: "What's the standing plan in your week that never moves? What's the rule you enforce?", helpText: "A standing thing — who's there, where it happens, what got said last time. " + TRIVIA, exampleAnswer: "Sunday pho with my brother, same booth since 2019. My rule: you can bring someone, but they order from the offal section. His girlfriend picked tripe.", tier: 'comfort', category: 'warmth' },
  { id: 'morning_person', text: "Walk us through your morning routine — the real one, not the aspirational one.", helpText: TRIVIA, exampleAnswer: "Snooze twice. Scroll phone guiltily. Stare at wall with coffee. Get ready in 15 minutes. Every day.", tier: 'comfort', category: 'humor' },
  { id: 'small_repair', text: "What do you keep alive that most people would have let die? How's it doing?", helpText: "A pan, a plant, a watch, a long-distance friendship — whatever you keep going. " + TRIVIA, exampleAnswer: "My grandpa's watch. Worth about forty bucks, goes to a guy downtown once a year. He remembers the watch, not me, which I respect.", tier: 'comfort', category: 'warmth' },
  { id: 'learned_from_someone', text: "What do you still do exactly the way someone taught you? Who was it?", helpText: TRIVIA, exampleAnswer: "Clean as you go. Marisol, my first boss at the coffee shop. My kitchen looks uninhabited mid-recipe and people find it unsettling.", tier: 'comfort', category: 'warmth' },

  // ─── Fun / Wildcard (10) ───
  { id: 'conspiracy', text: "What's a hot take you've actually tested? What's the evidence?", helpText: TRIVIA, exampleAnswer: "Family-style restaurants are a scam — you get less food and you have to negotiate for it. I've done the math at three separate places.", tier: 'fun', category: 'humor' },
  { id: 'worst_date', text: "Tell me about a date that went sideways. What was your move?", helpText: TRIVIA, exampleAnswer: "It turned out to be his coworker's engagement party — he'd double-booked. Someone handed me the card to sign. I signed it 'So happy for you two — Jess, Dave's date' and left after the toast.", tier: 'fun', category: 'humor' },
  { id: 'irrational_fear', text: "What's an irrational fear you have? Tell me about the last time it got you.", helpText: TRIVIA, exampleAnswer: "Escalators — the flattening part at the end. Last week at the airport I did the little hop, with a suitcase, and a kid laughed at me. Fair.", tier: 'fun', category: 'humor' },
  { id: 'superpower', text: "What's something pointless you've put real effort into? Walk me through it.", helpText: TRIVIA, exampleAnswer: "I built a spreadsheet ranking every bagel place within a twenty-minute walk. Columns for crust, chew, and whether they toast without asking, which is disqualifying.", tier: 'fun', category: 'humor' },
  { id: 'apocalypse_skill', text: "What's the useful thing you can do that nobody expects? When did it last come in handy?", helpText: TRIVIA, exampleAnswer: "I can back up a trailer — farm kid. Last month my neighbour was losing to a U-Haul, so I did it in one try and walked back inside without a word.", tier: 'fun', category: 'humor' },
  { id: 'most_me_photo', text: "What's a photo of you that would take some explaining? Describe it.", helpText: TRIVIA, exampleAnswer: "Me holding a frozen turkey like a newborn, in July, in a Halloween costume. I lost a fantasy football bet and the forfeit was the full photoshoot. There are eleven of them.", tier: 'fun', category: 'warmth' },
  { id: 'dating_confession', text: "What's the part of a first date you're actually bad at? Tell me about one that went that way.", helpText: TRIVIA, exampleAnswer: "The goodbye. I've hugged, handshaked, and waved at the same person in one motion. Last one ended in an accidental headbutt. She texted 'nice headbutt,' so — fine.", tier: 'fun', category: 'vulnerability' },
  { id: 'first_job', text: "What was your first job and what were you bad at?", helpText: TRIVIA, exampleAnswer: "Dairy Queen at sixteen. Could not do the curl on the cone — mine looked defeated. They moved me to drive-thru, where I flourished.", tier: 'fun', category: 'humor' },
  { id: 'overpacked', text: "What's something you always bring that nobody else does? When did it last pay off?", helpText: TRIVIA, exampleAnswer: "Band-aids, in every bag. At a wedding last month a bridesmaid's heel strap drew blood and I produced one mid-reception. I've since been thanked in a toast. Not my toast.", tier: 'fun', category: 'humor' },
  { id: 'bad_at_pretending', text: "What are you visibly bad at hiding? When did it last give you away?", helpText: TRIVIA, exampleAnswer: "My boredom face. In a meeting my manager stopped and said, 'Kayla has notes.' I did not have notes. I had a face.", tier: 'fun', category: 'humor' },
]

/**
 * Prompts retired in the v3 rewrite. Kept only so historical voice_memos rows
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
}

const PROMPT_TEXT_BY_ID = new Map<string, string>([
  ...QUESTION_BANK.map(q => [q.id, q.text] as [string, string]),
  ...Object.entries(RETIRED_PROMPT_TEXT),
])

/** Question text for any prompt id, including retired ones. */
export function getPromptText(id: string): string | undefined {
  return PROMPT_TEXT_BY_ID.get(id)
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
