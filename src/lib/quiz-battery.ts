// AUTO-DERIVED FROM `specs/matching-v2-questionnaire-battery-v1.md` (rc10).
//
// COPY IS FROZEN — stems, option labels and emoji all ship byte-for-byte.
// `src/lib/__tests__/quiz-copy-freeze.test.ts` asserts every string against the
// spec file and fails the build on drift. Raise anything that reads wrong with
// Charles; never edit it here.
//
// rc10: 17 items (the nerd-out moved out of the quiz into the voice
// step), no block-card interstitials, one emoji per option, and NO trait
// double-scoring of milieu items — that was a spec error. An option set built so
// no answer lands worse than its siblings cannot also be scored ordinally on a
// desirable trait. C and A therefore ship with one indicator each, logged and
// never reported as measurements.

export const INSTRUMENT_VERSION = 'B-1.0'

export type Trait = 'O' | 'E' | 'C' | 'A' | 'N'
export type Register = 'playful' | 'earnest'
export type PoliticsImportance = 'none' | 'prefer' | 'strong'

export interface QuizOption {
  /** One emoji, content not decoration. Null on the politics items by design. */
  emoji: string | null
  label: string
}

export interface TraitScoring {
  trait: Trait
  /** Per-option value on the 1-4 scale, index-aligned with `options` as listed. */
  values: number[]
}

export interface QuizItem {
  id: string
  code: string
  block: number
  stem: string
  options: QuizOption[]
  skippable: boolean
  polarityRandomised: boolean
  scoring: TraitScoring[]
  register?: Register[]
  /** Fine-print line under the options (Q22 only). */
  sub?: string
}

export interface QuizBlock {
  block: number
  name: string
  /** House chart token used for this block's background tint. Null = plain background. */
  tint: string | null
  items: string[]
}

export const QUIZ_ITEMS: QuizItem[] = [
  {
    id: "Q1", code: "M1", block: 1,
    stem: "At seventeen, you were:",
    options: [
      { emoji: "🎭", label: "theatre kid" },
      { emoji: "🏀", label: "jock" },
      { emoji: "📚", label: "honor-roll grinder" },
      { emoji: "🗓️", label: "the one organizing the hang" },
      { emoji: "🎧", label: "happily unaffiliated" },
      { emoji: "🦋", label: "a completely different person" },
    ],
    skippable: true, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q2", code: "M3", block: 1,
    stem: "The wedding reception is winding down. Where are you?",
    options: [
      { emoji: "🏠", label: "already home, shoes off" },
      { emoji: "🍰", label: "at a side table, deep in the actual conversation" },
      { emoji: "🎇", label: "outside, handing out sparklers" },
      { emoji: "🕺", label: "on the dance floor since the first song" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q3", code: "T-O1", block: 2,
    stem: "It's 1am. You're still up because:",
    options: [
      { emoji: "📺", label: "the show kept autoplaying" },
      { emoji: "🔍", label: "I fell into someone's photos from 2019" },
      { emoji: "🐇", label: "I'm down a Wikipedia rabbit hole" },
      { emoji: "🔨", label: "I'm working on a project I can't put down" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'O', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q4", code: "T-O3", block: 2,
    stem: "One free day in a city you've never been to.",
    options: [
      { emoji: "📸", label: "I'm not missing the must-see things" },
      { emoji: "🛏️", label: "whatever's near where I'm staying" },
      { emoji: "🚶", label: "I walk until something happens" },
      { emoji: "🔖", label: "I've had places saved on Instagram for months" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'O', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q5", code: "T-E1", block: 2,
    stem: "You're seated next to a stranger at a work dinner.",
    options: [
      { emoji: "🍽️", label: "I get through it" },
      { emoji: "🙂", label: "polite, mostly quiet" },
      { emoji: "💬", label: "I find the one thing we both know about" },
      { emoji: "🎤", label: "I'm holding court by dessert" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'E', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q6", code: "T-E2", block: 2,
    stem: "Your phone rings. No text first.",
    options: [
      { emoji: "📵", label: "I don't answer the phone. Ever." },
      { emoji: "⭐", label: "I answer for maybe four people" },
      { emoji: "😬", label: "I answer, but I'm already worried" },
      { emoji: "📞", label: "I pick up before it rings twice" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'E', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q7", code: "T-C1", block: 2,
    stem: "You're meeting someone at 7.",
    options: [
      { emoji: "⏰", label: "I'm there at 6:50" },
      { emoji: "🎯", label: "I'm there at 7" },
      { emoji: "📲", label: "7:05, and I texted" },
      { emoji: "🎪", label: "7:15, but I have a good excuse" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [{ trait: 'C', values: [4.0, 3.0, 2.0, 1.0] }],  // as listed: high -> low
  },
  {
    id: "Q8", code: "T-A1", block: 2,
    stem: "Your closest friend is getting back together with the ex. Again.",
    options: [
      { emoji: "🗣️", label: "I say exactly what I think" },
      { emoji: "🤐", label: "I say it once, then I'm supportive" },
      { emoji: "🎣", label: "I ask questions until they hear themselves" },
      { emoji: "🤝", label: "I keep my mouth shut and stay close" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'A', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q9", code: "M4", block: 3,
    stem: "Your last three Saturdays, honestly:",
    options: [
      { emoji: "🌄", label: "outside before most people were up" },
      { emoji: "🛌", label: "deliberately doing nothing, and it was glorious" },
      { emoji: "🔧", label: "elbow-deep in something I was making or fixing" },
      { emoji: "🎉", label: "out with people until late" },
      { emoji: "💻", label: "working, and not entirely mad about it" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q10", code: "M7", block: 3,
    stem: "The thing in your place a guest always asks about:",
    options: [
      { emoji: "🖼️", label: "the art" },
      { emoji: "🪑", label: "a chair I overpaid for but I love" },
      { emoji: "🚲", label: "the gear — bike, skis, clubs" },
      { emoji: "🎸", label: "an instrument" },
      { emoji: "🛠️", label: "something I made" },
      { emoji: "😶", label: "nothing — I just haven't got round to it" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q11", code: "M8", block: 3,
    stem: "It's their birthday. Your gift:",
    options: [
      { emoji: "😂", label: "something that makes them laugh out loud" },
      { emoji: "🎨", label: "something I made" },
      { emoji: "🎁", label: "the thing they mentioned once, months ago" },
      { emoji: "🎟️", label: "a day out, not an object" },
      { emoji: "🫂", label: "I'm not a gift person — I'll be there, though" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q12", code: "M5", block: 4,
    stem: "The tell that you like someone:",
    options: [
      { emoji: "😏", label: "the teasing starts" },
      { emoji: "🃏", label: "the jokes get weirdly specific" },
      { emoji: "📱", label: "memes. lots of memes." },
      { emoji: "💌", label: "I say it out loud, probably too early" },
      { emoji: "🚗", label: "I start showing up for things" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    register: ['playful', 'playful', 'playful', 'earnest', 'earnest'],
  },
  {
    id: "Q13", code: "CS1", block: 4,
    stem: "Your friend just did something genuinely impressive. What you actually say:",
    options: [
      { emoji: "🥊", label: "something that sounds like an insult" },
      { emoji: "🤯", label: "\"okay, that's actually incredible\"" },
      { emoji: "🫶", label: "I tell them properly, out loud" },
      { emoji: "📣", label: "I tell everyone except them" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    register: ['playful', 'playful', 'earnest', 'earnest'],
  },
  {
    id: "Q14", code: "H1", block: 5,
    stem: "Education:",
    options: [
      { emoji: "🏫", label: "high school" },
      { emoji: "📗", label: "some college" },
      { emoji: "🎓", label: "bachelor's" },
      { emoji: "🔬", label: "grad school or beyond" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q15", code: "H3", block: 5,
    stem: "The next five years, honestly:",
    options: [
      { emoji: "📈", label: "my work gets serious" },
      { emoji: "🏡", label: "my life gets full — people, a house, all of it" },
      { emoji: "🎢", label: "both, and I know how that sounds" },
      { emoji: "🌊", label: "I've stopped making five-year plans" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q16", code: "H2", block: 5,
    stem: "Politically, roughly:",
    options: [
      { emoji: null, label: "progressive" },
      { emoji: null, label: "lean progressive" },
      { emoji: null, label: "somewhere in the middle" },
      { emoji: null, label: "lean conservative" },
      { emoji: null, label: "conservative" },
      { emoji: null, label: "rather not say" },
    ],
    skippable: true, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q17", code: "H2b", block: 5,
    stem: "How much does politics matter in someone you'd date?",
    options: [
      { emoji: null, label: "not really something I think about" },
      { emoji: null, label: "I'd rather be close on it" },
      { emoji: null, label: "honestly, I'd struggle with someone far from me" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    sub: "Only the last one narrows who you'll see.",
  },
]

export const QUIZ_BLOCKS: QuizBlock[] = [
  { block: 1, name: "Identity", tint: "chart-1", items: ['Q1', 'Q2'] },
  { block: 2, name: "Wired", tint: "chart-5", items: ['Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'] },
  { block: 3, name: "Actual life", tint: "chart-2", items: ['Q9', 'Q10', 'Q11'] },
  { block: 4, name: "How you talk", tint: "chart-3", items: ['Q12', 'Q13'] },
  { block: 5, name: "Facts", tint: null, items: ['Q14', 'Q15', 'Q16', 'Q17'] },
]

/** Framing copy, battery §2c. Block cards were removed in rc8. */
export const FRAMING = {
  intro: "For us to set you up with people, we want to see what really makes you tick.",
  reassurance: "Nothing here is graded, and none of it is shown to anyone as a score.",
  skip: "skip this one",
  close: "Next we'll ask you about a couple of things you just told us, and you get to answer out loud.",
} as const

/** The nerd-out, moved out of the quiz into the voice step (battery §2b). */
export const NERD_OUT_PROMPT = {
  id: 'nerd_out',
  text: 'What do you nerd out on?',
  help: 'The small stuff is the good stuff — the more specific, the better.',
} as const

/** Items whose answer seeds a fished voice prompt. */
export const SEEDING_ITEMS: string[] = ['Q1', 'Q2', 'Q4', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11']

/** Q16 index -> politics position on a 0-4 scale. Index 5 ("rather not say") is null. */
export const POLITICS_POSITION: (number | null)[] = [0, 1, 2, 3, 4, null]

/** Q17 index -> importance tier. */
export const POLITICS_IMPORTANCE: PoliticsImportance[] = ['none', 'prefer', 'strong']

export const ITEM_COUNT = QUIZ_ITEMS.length

export function getItem(id: string): QuizItem | undefined {
  return QUIZ_ITEMS.find(i => i.id === id)
}

export function blockOf(itemId: string): QuizBlock | undefined {
  return QUIZ_BLOCKS.find(b => b.items.includes(itemId))
}
