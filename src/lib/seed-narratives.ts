export interface SeedNarrative {
  id: string
  gender: 'Man' | 'Woman'
  name: string
  narrative: string
  style: 'explorer' | 'nester' | 'intellectual' | 'spark'
  attributes: string[]
}

export const SEED_NARRATIVES: SeedNarrative[] = [
  // ─── Women (shown to men) ───
  {
    id: 'seed_f_explorer', gender: 'Woman', name: 'Maya', style: 'explorer',
    narrative: "She saved for two years, quit her job, and spent three months at a wildlife sanctuary in Costa Rica. Now she photographs urban hawks and raccoons and they're showing up in galleries.",
    attributes: ['adventure', 'ambition', 'story'],
  },
  {
    id: 'seed_f_nester', gender: 'Woman', name: 'Emma', style: 'nester',
    narrative: "Her best friend says she's the person everyone calls at 2am — not for advice, but because she listens until you figure it out yourself. Her fourth graders still write her letters years later.",
    attributes: ['kindness', 'values', 'vulnerability'],
  },
  {
    id: 'seed_f_intellectual', gender: 'Woman', name: 'Priya', style: 'intellectual',
    narrative: "Data scientist by day, philosophy reader by night — and she'll explain the connection with a straight face and somehow make it fascinating. Taught herself chess at 25 and now competes locally.",
    attributes: ['ambition', 'interests', 'story'],
  },
  {
    id: 'seed_f_spark', gender: 'Woman', name: 'Jordan', style: 'spark',
    narrative: "Got lost in Tokyo with a dead phone, ended up at a karaoke bar with strangers who didn't speak English, says she's never laughed harder. Does standup on open mic nights — mostly jokes about dating and her mom.",
    attributes: ['humor', 'story', 'adventure'],
  },
  {
    id: 'seed_f_vulnerability', gender: 'Woman', name: 'Lily', style: 'nester',
    narrative: "Moved across the country at 22 knowing nobody — says the first three months were the loneliest of her life, but she wouldn't undo it. Volunteers at a crisis hotline and says the bravest thing anyone does is ask for help.",
    attributes: ['vulnerability', 'kindness', 'values'],
  },
  {
    id: 'seed_f_ambition', gender: 'Woman', name: 'Zara', style: 'intellectual',
    narrative: "Taught herself ceramics from YouTube, sold her first piece at a farmers market, and now has a waitlist. Best compliment she ever got: 'you're the hardest worker who doesn't seem like they're working.'",
    attributes: ['ambition', 'story', 'interests'],
  },

  // ─── Men (shown to women) ───
  {
    id: 'seed_m_explorer', gender: 'Man', name: 'Marcus', style: 'explorer',
    narrative: "Converted a van into a mobile workshop and drove it from Utah to Alaska, stopping to fix things for people along the way — a fence in Montana, a porch in BC, a church steeple in a town of 200.",
    attributes: ['adventure', 'story', 'ambition'],
  },
  {
    id: 'seed_m_nester', gender: 'Man', name: 'Daniel', style: 'nester',
    narrative: "His sister says he remembers your coffee order after hearing it once and shows up with it when you're having a bad week. Coaches youth basketball — one kid couldn't make a free throw all season, so he stayed after practice every week until he hit one.",
    attributes: ['kindness', 'values', 'vulnerability'],
  },
  {
    id: 'seed_m_intellectual', gender: 'Man', name: 'Kai', style: 'intellectual',
    narrative: "Writing a book about his hometown's forgotten music scene — interviewing old jazz musicians, digging through archives. Taught himself to code just to build the website for it.",
    attributes: ['interests', 'ambition', 'story'],
  },
  {
    id: 'seed_m_spark', gender: 'Man', name: 'Leo', style: 'spark',
    narrative: "Showed up to a costume party as Bob Ross, painted a 'happy little tree' live, and it was actually good. He's the guy who ends up in a 2-hour conversation with the person nobody else is talking to.",
    attributes: ['humor', 'kindness', 'story'],
  },
  {
    id: 'seed_m_vulnerability', gender: 'Man', name: 'Ethan', style: 'nester',
    narrative: "Talks about his mom like she's his hero — she raised three kids alone. Went through a rough patch in his mid-twenties and says 'asking for help isn't weakness, it's the opposite.'",
    attributes: ['vulnerability', 'values', 'ambition'],
  },
  {
    id: 'seed_m_ambition', gender: 'Man', name: 'Sam', style: 'intellectual',
    narrative: "Failed at his first business, lost everything, moved back in with his parents at 27. Started over, built something better, now mentors other first-time founders on weekends.",
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
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
