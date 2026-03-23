export interface SeedNarrative {
  id: string
  gender: 'Man' | 'Woman'
  name: string
  narrative: string
  style: 'explorer' | 'nester' | 'intellectual' | 'spark'
  attributes: string[] // what this narrative tests attraction to
}

export const SEED_NARRATIVES: SeedNarrative[] = [
  // ─── Women (shown to men) ───
  {
    id: 'seed_f_explorer',
    gender: 'Woman',
    name: 'Maya',
    narrative: "She quit her corporate job last year to spend three months volunteering at a wildlife sanctuary in Costa Rica — and she's not the trust-fund type, she saved for two years to do it. She came back, started a photography side project documenting urban wildlife, and now she's got raccoons and hawks showing up in galleries. You said you love people who just figure things out. She's that person, and she's got stories that'll make you rethink what's possible on a Tuesday.",
    style: 'explorer',
    attributes: ['adventure', 'ambition', 'story'],
  },
  {
    id: 'seed_f_nester',
    gender: 'Woman',
    name: 'Emma',
    narrative: "Her best friend says she's the person everyone calls at 2am — not because she gives advice, but because she just listens until you figure it out yourself. She teaches fourth grade and her students write her letters years later. She makes sourdough every Sunday, names her starters, and she'll be the first to admit her apartment looks like a bookshop exploded. There's a steadiness to her that makes people feel like they can exhale.",
    style: 'nester',
    attributes: ['kindness', 'values', 'vulnerability'],
  },
  {
    id: 'seed_f_intellectual',
    gender: 'Woman',
    name: 'Priya',
    narrative: "She's a data scientist who builds models by day and reads philosophy for fun — and she'll tell you the connection between the two with a straight face and somehow make it fascinating. She taught herself to play chess at 25 and now competes in local tournaments. When she talks about something she's working through — a proof, a recipe, a problem at work — you can see her brain light up. She's the kind of person who makes you want to be smarter just by being around her.",
    style: 'intellectual',
    attributes: ['ambition', 'interests', 'story'],
  },
  {
    id: 'seed_f_spark',
    gender: 'Woman',
    name: 'Jordan',
    narrative: "She once got lost in Tokyo with a dead phone and turned it into the best night of her trip — ended up at a karaoke bar with a group of strangers who didn't speak English, and she says she's never laughed harder in her life. She does standup on open mic nights, her jokes are mostly about dating and her mom, and she'll roast you gently within five minutes of meeting you. You won't be bored. You might lose an argument, though.",
    style: 'spark',
    attributes: ['humor', 'story', 'adventure'],
  },
  {
    id: 'seed_f_vulnerability',
    gender: 'Woman',
    name: 'Lily',
    narrative: "She moved across the country at 22 knowing nobody and says the first three months were the loneliest of her life — but she wouldn't undo it. She's the kind of person who'll tell you she cried at a commercial and not be embarrassed about it. She volunteers at a crisis hotline and says it taught her that the bravest thing anyone does is ask for help. There's something disarming about someone who's that honest about being human.",
    style: 'nester',
    attributes: ['vulnerability', 'kindness', 'values'],
  },
  {
    id: 'seed_f_ambition',
    gender: 'Woman',
    name: 'Zara',
    narrative: "She started a small ceramics business out of her garage — taught herself from YouTube, sold her first piece at a farmers market, and now has a waitlist. She's not flashy about it, you'd never know unless you asked, but when she talks about the feeling of pulling something she made out of a kiln, you can tell she found her thing. She said the best compliment she ever got was 'you're the hardest worker who doesn't seem like they're working.'",
    style: 'intellectual',
    attributes: ['ambition', 'story', 'interests'],
  },

  // ─── Men (shown to women) ───
  {
    id: 'seed_m_explorer',
    gender: 'Man',
    name: 'Marcus',
    narrative: "He spent last summer converting a van into a mobile workshop and drove it from Utah to Alaska, stopping to fix things for people along the way — a fence in Montana, a porch in British Columbia, a church steeple in a town with 200 people. He's an engineer by training but he says he's happiest when he's building something with his hands and there's sawdust in his hair. He'll take you somewhere you've never been and somehow make it feel like coming home.",
    style: 'explorer',
    attributes: ['adventure', 'story', 'ambition'],
  },
  {
    id: 'seed_m_nester',
    gender: 'Man',
    name: 'Daniel',
    narrative: "His sister says he's the kind of person who remembers your coffee order after hearing it once and shows up with it when you're having a bad week. He coaches youth basketball and the parents say he's the most patient person they've ever seen — one kid couldn't make a free throw all season and he stayed after practice with him every single week until he hit one. He cooks Sunday dinner for his friends every week. No exceptions.",
    style: 'nester',
    attributes: ['kindness', 'values', 'vulnerability'],
  },
  {
    id: 'seed_m_intellectual',
    gender: 'Man',
    name: 'Kai',
    narrative: "He's writing a book about the history of his hometown's music scene — interviewing old jazz musicians, digging through library archives, learning about a world he never knew existed two blocks from where he grew up. He taught himself to code to build the website for it. When he gets into something, he goes deep, and the way he talks about discovery — like finding a tape recording nobody's heard in 40 years — makes you want to go find something too.",
    style: 'intellectual',
    attributes: ['interests', 'ambition', 'story'],
  },
  {
    id: 'seed_m_spark',
    gender: 'Man',
    name: 'Leo',
    narrative: "He tells stories the way some people play music — there's a setup, a turn, and by the punchline you're crying laughing. He once showed up to a friend's costume party as a very committed Bob Ross, painted a 'happy little tree' live in front of everyone, and it was actually good. He's the guy at the party who ends up in a 2-hour conversation with the person nobody else is talking to. His energy is magnetic but it's not performative — he's just genuinely delighted by people.",
    style: 'spark',
    attributes: ['humor', 'kindness', 'story'],
  },
  {
    id: 'seed_m_vulnerability',
    gender: 'Man',
    name: 'Ethan',
    narrative: "He talks about his mom like she's his hero — she raised three kids alone and he says everything he knows about showing up for people he learned from watching her. He went through a rough patch in his mid-twenties and he's honest about it: 'I didn't handle it well, but I learned that asking for help isn't weakness, it's the opposite.' He's a civil rights attorney now and he says the work matters more to him than the title ever could.",
    style: 'nester',
    attributes: ['vulnerability', 'values', 'ambition'],
  },
  {
    id: 'seed_m_ambition',
    gender: 'Man',
    name: 'Sam',
    narrative: "He failed at his first business — lost everything, moved back in with his parents at 27, and says it was the best thing that happened to him because it killed his ego. He started over, built something smaller and better, and now he mentors other first-time founders on the weekends. He said 'I'd rather try and fail than wonder what if,' and coming from someone who actually did fail and came back, that hits different.",
    style: 'intellectual',
    attributes: ['ambition', 'vulnerability', 'story'],
  },
]

const ATTRIBUTE_TAGS = [
  { value: 'humor', label: 'Their humor' },
  { value: 'ambition', label: 'Their ambition' },
  { value: 'story', label: 'Their story' },
  { value: 'values', label: 'Their values' },
  { value: 'interests', label: 'Their interests' },
  { value: 'vulnerability', label: 'Their vulnerability' },
  { value: 'kindness', label: 'Their kindness' },
  { value: 'adventure', label: 'Their sense of adventure' },
]

export { ATTRIBUTE_TAGS }

export function getSeedNarrativesForGender(seekingGender: 'Man' | 'Woman', count = 6): SeedNarrative[] {
  const pool = SEED_NARRATIVES.filter(n => n.gender === seekingGender)
  // Shuffle
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
