export interface PromptDef {
  id: string
  text: string
  helpText: string
  exampleAnswer: string
  tier: 'self_expansion' | 'i_sharing' | 'admiration' | 'comfort' | 'fun'
  category: string
}

export const QUESTION_BANK: PromptDef[] = [
  // ─── Tier 1: Self-Expansion (12) ───
  { id: 'rabbit_hole', text: "What's a rabbit hole you've gone down recently that you can't stop thinking about?", helpText: "A podcast, Wikipedia deep dive, hobby obsession — anything you've been weirdly into lately.", exampleAnswer: "I have a sourdough starter named Gerald. He's 3 months old and I talk to him.", tier: 'self_expansion', category: 'depth' },
  { id: 'taught_yourself', text: "What's something you taught yourself that you're proud of?", helpText: "Could be a skill, a recipe, fixing something — anything you figured out on your own.", exampleAnswer: "I changed my own brakes from a YouTube video. My hands were shaking the whole time.", tier: 'self_expansion', category: 'ambition' },
  { id: 'show_someone_your_city', text: "If someone visited your city for one day and you were in charge, where are you taking them?", helpText: "Your favorite spots — the ones you actually go to, not the tourist traps.", exampleAnswer: "Breakfast tacos at this 6-table spot nobody knows about, then the rooftop with the sunset.", tier: 'self_expansion', category: 'warmth' },
  { id: 'changed_your_mind', text: "What's something you used to believe that you've completely changed your mind about?", helpText: "An opinion, a life plan, something about yourself — a real shift.", exampleAnswer: "I thought you had to have it all figured out by 25. My dad switched careers at 50 and proved me wrong.", tier: 'self_expansion', category: 'depth' },
  { id: 'different_life', text: "If you woke up tomorrow in a completely different career, what would you want it to be?", helpText: "Dream job, guilty pleasure career, the thing you'd do if money didn't matter.", exampleAnswer: "National park ranger. Cabin, hikes, geology lectures. I think about it more than I should.", tier: 'self_expansion', category: 'depth' },
  { id: 'obsession', text: "What's something you're a little obsessed with that most people find boring?", helpText: "The thing your friends' eyes glaze over about.", exampleAnswer: "Fonts. I have opinions about kerning. Bad typography on menus genuinely ruins my meal.", tier: 'self_expansion', category: 'depth' },
  { id: 'side_quest', text: "What's a random side quest you've been on recently?", helpText: "Something unplanned — a detour, a spontaneous decision, a weird adventure.", exampleAnswer: "Saw a sign for a free pottery class, walked in, made the ugliest bowl you've ever seen. Going back next week.", tier: 'self_expansion', category: 'warmth' },
  { id: 'best_purchase', text: "What's the best thing you've bought for under $50?", helpText: "Something that made your life better, made you laugh, or you use constantly.", exampleAnswer: "A $12 headlamp. Most useful thing I own. I look ridiculous wearing it.", tier: 'self_expansion', category: 'humor' },
  { id: 'unpopular_take', text: "Give us your most unpopular opinion.", helpText: "Food, movies, life philosophy — something where you're genuinely in the minority.", exampleAnswer: "Pancakes at 8pm hit different. Breakfast for dinner supremacy.", tier: 'self_expansion', category: 'humor' },
  { id: 'bucket_list_done', text: "What's something you've actually checked off your bucket list?", helpText: "Big or small — a trip, a goal, a fear you conquered.", exampleAnswer: "Went skydiving. Cried on the plane. Jumped anyway. Best 60 seconds of my life.", tier: 'self_expansion', category: 'ambition' },
  { id: 'world_expert', text: "What topic could you give a 20-minute talk on with zero preparation?", helpText: "The thing you know cold. Your domain of accidental expertise.", exampleAnswer: "The history of pizza in America. I know way too much. Don't get me started.", tier: 'self_expansion', category: 'depth' },
  { id: 'weekend_project', text: "What's a project you've been working on in your spare time?", helpText: "Building something, learning something, creating something.", exampleAnswer: "Refinishing a dresser I found on the side of the road. Solid oak under three layers of paint.", tier: 'self_expansion', category: 'ambition' },

  // ─── Tier 2: I-Sharing (12) ───
  { id: 'gives_you_chills', text: "What's something that gives you actual chills? Music, a moment, a place?", helpText: "That full-body reaction when something hits you just right.", exampleAnswer: "When the crowd sings and the artist stops and just lets them carry it. Every time.", tier: 'i_sharing', category: 'vulnerability' },
  { id: 'laugh_hardest', text: "Tell us about the last time you laughed so hard you couldn't breathe.", helpText: "The full story — who was there, what happened, why was it so funny?", exampleAnswer: "My roommate tried a backflip into the pool, grabbed the fence, the fence broke, and he fell in sideways.", tier: 'i_sharing', category: 'humor' },
  { id: 'notice_first', text: "When you walk into a room, what do you notice first?", helpText: "Not people — the vibe, the details, the energy.", exampleAnswer: "The lighting. Warm lighting = I'm staying. Fluorescent = I'm leaving.", tier: 'i_sharing', category: 'depth' },
  { id: 'perfect_evening', text: "Describe your perfect low-key evening.", helpText: "Not a special occasion — just a regular Tuesday that goes exactly right.", exampleAnswer: "Homemade pasta, Fleetwood Mac on vinyl, candle on the patio. Asleep by 10.", tier: 'i_sharing', category: 'warmth' },
  { id: 'guilty_pleasure', text: "What's a guilty pleasure you're not even a little ashamed of?", helpText: "The thing you enjoy that's not cool but you don't care.", exampleAnswer: "Every season of The Bachelor. I have a group chat about it. I will not apologize.", tier: 'i_sharing', category: 'humor' },
  { id: 'weird_habit', text: "What's a weird habit you have that you've never been able to explain?", helpText: "Something you do that's just... you.", exampleAnswer: "I eat cereal with a fork. The milk-to-cereal ratio with a spoon is wrong. People are horrified.", tier: 'i_sharing', category: 'humor' },
  { id: 'song_on_repeat', text: "What song have you had on repeat lately and why?", helpText: "The one you keep going back to. What is it about it?", exampleAnswer: "'Vienna' by Billy Joel. 'Slow down, you crazy child' — I needed to hear that.", tier: 'i_sharing', category: 'vulnerability' },
  { id: 'movie_scene', text: "What's a movie or TV scene that lives rent-free in your head?", helpText: "The one you think about randomly. What about it stuck with you?", exampleAnswer: "Good Will Hunting. 'It's not your fault.' Fell apart watching it alone in college.", tier: 'i_sharing', category: 'vulnerability' },
  { id: 'pet_peeve', text: "What's a pet peeve that tells people a lot about you?", helpText: "The small thing that bothers you way more than it should.", exampleAnswer: "People who don't push in their chairs. I know it's unhinged. I can't help it.", tier: 'i_sharing', category: 'humor' },
  { id: 'comfort_food', text: "What's your comfort food and what memory is attached to it?", helpText: "The food you go to when you need to feel better.", exampleAnswer: "Grandma's chicken soup. One bite and I'm 8 years old at her kitchen table.", tier: 'i_sharing', category: 'warmth' },
  { id: 'ick_or_green_flag', text: "What's a surprisingly specific green flag in a person?", helpText: "Not the obvious stuff. The tiny thing that makes you go 'oh, I like them.'", exampleAnswer: "When someone is nice to the waiter without making a show of it. Tells me everything.", tier: 'i_sharing', category: 'depth' },
  { id: 'dealbreaker_funny', text: "What's a hilariously specific dealbreaker you have?", helpText: "The thing that's maybe not rational but you can't get past.", exampleAnswer: "If you don't like dogs, I can't do it. I don't even have one yet but I need to know you're capable.", tier: 'i_sharing', category: 'humor' },

  // ─── Tier 3: Admiration (12) ───
  { id: 'bet_on_yourself', text: "Tell us about a time you bet on yourself and it worked out.", helpText: "A risk you took — career, relationship, move — where you trusted your gut.", exampleAnswer: "Quit marketing for nursing school. Everyone called it a quarter-life crisis. I call it the ER.", tier: 'admiration', category: 'ambition' },
  { id: 'hardest_thing', text: "What's the hardest thing you've done that you're glad you did?", helpText: "Something that was genuinely difficult but you'd do it again.", exampleAnswer: "Moved across the country at 23 knowing nobody. First three months were brutal. Changed everything.", tier: 'admiration', category: 'vulnerability' },
  { id: 'helped_someone', text: "Tell us about a time you helped someone and it stuck with you.", helpText: "A moment where you made a real difference for someone.", exampleAnswer: "Neighbor's car broke down with her kids inside. I drove them to school. Still have the thank you card.", tier: 'admiration', category: 'warmth' },
  { id: 'figured_it_out', text: "What's something you figured out that nobody showed you how to do?", helpText: "A problem you solved through pure trial and error.", exampleAnswer: "Built my own budget app because every other one was garbage. Took 3 months. It's ugly but it works.", tier: 'admiration', category: 'ambition' },
  { id: 'proud_of_someone', text: "Who are you most proud of and why?", helpText: "A person in your life who did something that makes you light up talking about it.", exampleAnswer: "My sister has dyslexia. They said college would be too hard. She graduated summa cum laude.", tier: 'admiration', category: 'warmth' },
  { id: 'against_the_grain', text: "When's a time you went against what everyone expected of you?", helpText: "A decision where you chose your own path instead of the easy one.", exampleAnswer: "Whole family is in finance. I became a teacher. Never once dreaded a Monday.", tier: 'admiration', category: 'ambition' },
  { id: 'building_right_now', text: "What are you actively building or working toward right now?", helpText: "A goal, a project, a skill — something you're in the middle of.", exampleAnswer: "Training for a triathlon. Still the slowest person in the pool. Show up at 5:30am anyway.", tier: 'admiration', category: 'ambition' },
  { id: 'failure_lesson', text: "What's a failure that taught you something you couldn't have learned any other way?", helpText: "Not a humble brag — a real one. What did it change about you?", exampleAnswer: "Started a business, lost $15k. Learned I'm more resilient than I thought.", tier: 'admiration', category: 'vulnerability' },
  { id: 'mentor_moment', text: "Who's someone who changed the way you see the world?", helpText: "A person who shifted your perspective — teacher, parent, friend, stranger.", exampleAnswer: "Professor who said 'your questions matter more than your answers.' Think about it every week.", tier: 'admiration', category: 'depth' },
  { id: 'secret_talent', text: "What's a talent you have that would surprise people who just met you?", helpText: "Something that doesn't fit the first impression you give off.", exampleAnswer: "I do calligraphy. Big bearded guy, delicate hand lettering. Done 10 friends' wedding invites.", tier: 'admiration', category: 'humor' },
  { id: 'values_test', text: "When's a time your values were tested and you held firm?", helpText: "A moment where doing the right thing was the hard thing.", exampleAnswer: "Found a wallet with $600. Nobody around. Tracked down the owner and drove it to their house.", tier: 'admiration', category: 'warmth' },
  { id: 'getting_better_at', text: "What's something you're actively trying to get better at?", helpText: "A skill, a habit, an aspect of yourself you're working on.", exampleAnswer: "Listening. I used to just wait for my turn to talk. Harder than it sounds.", tier: 'admiration', category: 'vulnerability' },

  // ─── Tier 4: Comfort & Attachment (9) ───
  { id: 'recharge', text: "How do you recharge after a really long week?", helpText: "What does genuine rest look like for you?", exampleAnswer: "No alarm, coffee on the porch, zero plans. That's how I come back to life.", tier: 'comfort', category: 'warmth' },
  { id: 'close_people', text: "How would your closest friend describe you when you're at your best?", helpText: "Not how you'd describe yourself — how they'd describe you.", exampleAnswer: "She'd say I'm the friend who actually shows up. Not texts — drives over with food.", tier: 'comfort', category: 'warmth' },
  { id: 'love_language_real', text: "What's the way you show someone you care about them? Give us a specific example.", helpText: "Not the love language quiz answer — the actual thing you do.", exampleAnswer: "You mention a job interview Thursday? I'm texting you Thursday morning. Every time.", tier: 'comfort', category: 'warmth' },
  { id: 'disagree_well', text: "How do you handle it when you disagree with someone you care about?", helpText: "Be honest — do you shut down, talk it out, need space?", exampleAnswer: "I need 20 minutes to cool down. Try me before that and I'll say something dumb.", tier: 'comfort', category: 'vulnerability' },
  { id: 'safe_place', text: "Describe a place that feels like home to you.", helpText: "Could be an actual place or a feeling. Where do you feel most at ease?", exampleAnswer: "My parents' back porch in the fall. Dad telling a story he's told 50 times. Could sit there forever.", tier: 'comfort', category: 'warmth' },
  { id: 'hard_day', text: "What do you need from someone when you're having a hard day?", helpText: "Not what you think you should say — what you actually need.", exampleAnswer: "Just sit with me. Don't try to fix it. Maybe bring takeout.", tier: 'comfort', category: 'vulnerability' },
  { id: 'morning_person', text: "Walk us through your morning routine — the real one, not the aspirational one.", helpText: "What actually happens between waking up and leaving the house?", exampleAnswer: "Snooze twice. Scroll phone guiltily. Stare at wall with coffee. Get ready in 15 minutes. Every day.", tier: 'comfort', category: 'humor' },
  { id: 'grateful_for', text: "What's something small that you're grateful for today?", helpText: "Not the big stuff — something tiny and specific.", exampleAnswer: "Coworker left a sticky note that said 'you killed it.' Made my whole day.", tier: 'comfort', category: 'warmth' },
  { id: 'relationship_lesson', text: "What's the most important thing you've learned about relationships?", helpText: "A real lesson from experience, not a quote from Instagram.", exampleAnswer: "Being right is less important than being kind. I won every argument with my ex. We're not together.", tier: 'comfort', category: 'vulnerability' },

  // ─── Fun / Wildcard (10) ───
  { id: 'conspiracy', text: "What's a conspiracy theory or hot take you're willing to die on?", helpText: "Doesn't have to be serious. The weirder the better.", exampleAnswer: "Mattress Firm is a money laundering front. I will not be taking questions.", tier: 'fun', category: 'humor' },
  { id: 'worst_date', text: "What's your best worst-date story?", helpText: "The one that's funny now but was painful in the moment.", exampleAnswer: "His ex was our waitress. She cried. He cried. I ate my pasta in silence. Three stars.", tier: 'fun', category: 'humor' },
  { id: 'irrational_fear', text: "What's an irrational fear you have?", helpText: "Something that doesn't make logical sense but gets you every time.", exampleAnswer: "Escalators. What if my shoelace gets caught? I know it's irrational. I think about it every time.", tier: 'fun', category: 'humor' },
  { id: 'time_machine', text: "If you could go back and give your 18-year-old self one piece of advice, what would it be?", helpText: "What do you know now that would have changed everything then?", exampleAnswer: "Stop trying to be cool. The people who matter like you because you're weird.", tier: 'fun', category: 'vulnerability' },
  { id: 'celebrity_dinner', text: "You get dinner with one person, living or dead. Who and why?", helpText: "Not who sounds impressive — who you actually want to talk to.", exampleAnswer: "Anthony Bourdain. Street food and stories about the world. I miss that guy.", tier: 'fun', category: 'depth' },
  { id: 'superpower', text: "If you could have one mundane superpower, what would it be?", helpText: "Not flying or invisibility. Something weirdly practical.", exampleAnswer: "Falling asleep instantly. The hours I've lost replaying dumb things I said in 2019.", tier: 'fun', category: 'humor' },
  { id: 'apocalypse_skill', text: "In a zombie apocalypse, what's the one skill you bring to the group?", helpText: "What's your survival value?", exampleAnswer: "I can cook anything out of nothing. While y'all eat canned beans, I'm making a stew. Morale officer.", tier: 'fun', category: 'humor' },
  { id: 'most_me_photo', text: "If you had to pick one photo on your phone that captures who you really are, what would it be?", helpText: "Not your best photo — the most YOU photo. Describe it.", exampleAnswer: "Campsite, covered in dirt, holding a fish, huge grin. Hair is a disaster. Completely happy.", tier: 'fun', category: 'warmth' },
  { id: 'three_things', text: "You can only bring three things to a desert island. What are they?", helpText: "Be practical, be funny, be honest — whatever you want.", exampleAnswer: "A knife, a solar charger, and my Kindle with every book I've been meaning to read.", tier: 'fun', category: 'humor' },
  { id: 'dating_confession', text: "What's something you're a little nervous about when it comes to dating?", helpText: "Something real. Vulnerability is attractive.", exampleAnswer: "I either go too deep too fast or freeze and talk about the weather. No middle ground.", tier: 'fun', category: 'vulnerability' },
]

// Onboarding gets a mix: 2 self-expansion, 2 i-sharing/fun, 1 admiration, 1 comfort
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
