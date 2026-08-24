// AUTO-DERIVED FROM `specs/matching-v2-questionnaire-battery-v1.md` (rc8).
//
// COPY IS FROZEN — stems, option labels and emoji all ship byte-for-byte.
// `src/lib/__tests__/quiz-copy-freeze.test.ts` asserts every string against the
// spec file and fails the build on drift. Raise anything that reads wrong with
// Charles; never edit it here.
//
// rc8 changes: 22 items (the nerd-out moved out of the quiz into the voice
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
    stem: "At seventeen, everyone knew you as:",
    options: [
      { emoji: "🎭", label: "theatre kid" },
      { emoji: "🏀", label: "jock" },
      { emoji: "📚", label: "honor-roll grinder" },
      { emoji: "📋", label: "the one organizing the hang" },
      { emoji: "🎧", label: "happily unaffiliated" },
      { emoji: "🦋", label: "a completely different person" },
    ],
    skippable: true, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q2", code: "M2", block: 1,
    stem: "The group chat is picking a restaurant. Fourteen messages in.",
    options: [
      { emoji: "👑", label: "I've already picked it" },
      { emoji: "🔗", label: "I've sent three links and a walking distance" },
      { emoji: "🤷", label: "I said \"I'm easy\" and meant it" },
      { emoji: "😂", label: "I sent a meme about how long this is taking" },
      { emoji: "🔕", label: "I muted it and I'll go wherever" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q3", code: "M3", block: 1,
    stem: "It's 10pm at the wedding reception. Where are you?",
    options: [
      { emoji: "🏠", label: "already home, shoes off" },
      { emoji: "💬", label: "at a side table, deep in the actual conversation" },
      { emoji: "✨", label: "outside, handing out sparklers" },
      { emoji: "🕺", label: "on the dance floor since the first song" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q4", code: "T-O1", block: 2,
    stem: "It's 1am. You're still up because:",
    options: [
      { emoji: "📺", label: "the show kept autoplaying" },
      { emoji: "🕐", label: "I lost track of time" },
      { emoji: "🌀", label: "I'm down a Wikipedia rabbit hole" },
      { emoji: "🔨", label: "I'm working on a project I can't put down" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'O', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q5", code: "T-O2", block: 2,
    stem: "A friend says \"come to this thing with me, I can't really explain it.\"",
    options: [
      { emoji: "❓", label: "what is it" },
      { emoji: "📝", label: "I'll come if you tell me what it is" },
      { emoji: "🕒", label: "what time" },
      { emoji: "👟", label: "I'm already putting my shoes on" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'O', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q6", code: "T-O3", block: 2,
    stem: "One free day in a city you've never been to.",
    options: [
      { emoji: "📸", label: "I'm not missing the must-see things" },
      { emoji: "📍", label: "whatever's near where I'm staying" },
      { emoji: "🚶", label: "I walk until something happens" },
      { emoji: "🗺️", label: "I ask someone who lives there and go do that" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'O', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q7", code: "T-E1", block: 2,
    stem: "The party's good. You've been there three hours.",
    options: [
      { emoji: "🚪", label: "actually, I left an hour ago" },
      { emoji: "👋", label: "I'm in the long goodbye" },
      { emoji: "⚡", label: "second wind" },
      { emoji: "🚕", label: "I'm deciding where everyone goes next" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'E', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q8", code: "T-E2", block: 2,
    stem: "Your phone rings. No text first.",
    options: [
      { emoji: "📵", label: "I don't answer the phone. Ever." },
      { emoji: "🔢", label: "I answer for maybe four people" },
      { emoji: "😬", label: "I answer, bracing" },
      { emoji: "☎️", label: "I'm delighted — it's been ages" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'E', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q9", code: "T-C1", block: 2,
    stem: "You're meeting someone at 7.",
    options: [
      { emoji: "⏰", label: "I'm there at 6:50" },
      { emoji: "🎯", label: "I'm there at 7" },
      { emoji: "💬", label: "7:05, and I texted" },
      { emoji: "🎪", label: "7:15, but I have a story" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [{ trait: 'C', values: [4.0, 3.0, 2.0, 1.0] }],  // as listed: high -> low
  },
  {
    id: "Q10", code: "T-A1", block: 2,
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
    id: "Q11", code: "T-N1", block: 2,
    stem: "You sent a text an hour ago. Nothing back.",
    options: [
      { emoji: "🤷", label: "nothing, they're busy" },
      { emoji: "👀", label: "I've reread what I sent" },
      { emoji: "✍️", label: "I've reread it and drafted the follow-up" },
      { emoji: "🔮", label: "I know exactly what it means" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'N', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
  },
  {
    id: "Q12", code: "T-N2", block: 2,
    stem: "Someone says \"can I give you some feedback?\"",
    options: [
      { emoji: "😰", label: "my stomach drops" },
      { emoji: "😅", label: "I brace, then I'm fine" },
      { emoji: "👍", label: "sure, go ahead" },
      { emoji: "🙋", label: "I asked for it, that's why I'm here" },
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'N', values: [4.0, 3.0, 2.0, 1.0] }],  // as listed: high -> low
  },
  {
    id: "Q13", code: "M4", block: 3,
    stem: "Your last three Saturdays, honestly:",
    options: [
      { emoji: "🌄", label: "outside before most people were up" },
      { emoji: "📖", label: "nothing on the calendar, and that was the point" },
      { emoji: "🔧", label: "elbow-deep in something I was making or fixing" },
      { emoji: "🍳", label: "at someone's kitchen table too long" },
      { emoji: "💻", label: "working, and not entirely mad about it" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q14", code: "M7", block: 3,
    stem: "The thing in your place a guest always asks about:",
    options: [
      { emoji: "🖼️", label: "the art" },
      { emoji: "🪑", label: "a chair I overpaid for" },
      { emoji: "🚲", label: "the gear — bike, skis, clubs" },
      { emoji: "🎸", label: "an instrument" },
      { emoji: "🛠️", label: "something I made" },
      { emoji: "🤷", label: "nothing, and I've never once thought about it" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q15", code: "M8", block: 3,
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
    id: "Q16", code: "M5", block: 4,
    stem: "The tell that you like someone:",
    options: [
      { emoji: "😏", label: "the teasing starts" },
      { emoji: "🃏", label: "the jokes get weirdly specific" },
      { emoji: "📱", label: "memes. lots of memes." },
      { emoji: "💬", label: "I say it out loud, probably too early" },
      { emoji: "🚗", label: "I start showing up for things" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    register: ['playful', 'playful', 'playful', 'earnest', 'earnest'],
  },
  {
    id: "Q17", code: "CS1", block: 4,
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
    id: "Q18", code: "CS2", block: 4,
    stem: "Dinner with someone you just met goes well. Afterwards:",
    options: [
      { emoji: "🎤", label: "they know more about me" },
      { emoji: "👂", label: "I know more about them" },
      { emoji: "🔥", label: "we found one thing we both care about and couldn't stop talking about it" },
      { emoji: "⚔️", label: "we argued about something for an hour" },
      { emoji: "⚖️", label: "about even, honestly" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q19", code: "H1", block: 5,
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
    id: "Q20", code: "H3", block: 5,
    stem: "The next five years, honestly:",
    options: [
      { emoji: "📈", label: "my work gets serious" },
      { emoji: "🏡", label: "my life gets full — people, a house, all of it" },
      { emoji: "🎢", label: "both, and I know how that sounds" },
      { emoji: "🤷", label: "I've stopped making five-year plans" },
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
  },
  {
    id: "Q21", code: "H2", block: 5,
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
    id: "Q22", code: "H2b", block: 5,
    stem: "How much does this matter in someone you'd date?",
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
  { block: 1, name: "Identity", tint: "chart-1", items: ['Q1', 'Q2', 'Q3'] },
  { block: 2, name: "Wired", tint: "chart-5", items: ['Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12'] },
  { block: 3, name: "Actual life", tint: "chart-2", items: ['Q13', 'Q14', 'Q15'] },
  { block: 4, name: "How you talk", tint: "chart-3", items: ['Q16', 'Q17', 'Q18'] },
  { block: 5, name: "Facts", tint: null, items: ['Q19', 'Q20', 'Q21', 'Q22'] },
]

/** Framing copy, battery §2c. Block cards were removed in rc8. */
export const FRAMING = {
  intro: "A few questions so we know how to introduce you. Nothing here is graded, and none of it is shown to anyone as a score.",
  honesty: "Answer as the person who'll actually be sitting across the table.",
  skip: "skip this one",
  close: "That's it. Next we'll ask you about a couple of things you just told us, and you get to answer out loud.",
} as const

/** The nerd-out, moved out of the quiz into the voice step (battery §2b). */
export const NERD_OUT_PROMPT = {
  id: 'nerd_out',
  text: 'What do you nerd out on?',
  help: 'The small stuff is the good stuff — the more specific, the better.',
} as const

/** Items whose answer seeds a fished voice prompt. */
export const SEEDING_ITEMS: string[] = ['Q1', 'Q3', 'Q6', 'Q9', 'Q10', 'Q13', 'Q14', 'Q15']

/** Q21 index -> politics position on a 0-4 scale. Index 5 ("rather not say") is null. */
export const POLITICS_POSITION: (number | null)[] = [0, 1, 2, 3, 4, null]

/** Q22 index -> importance tier. */
export const POLITICS_IMPORTANCE: PoliticsImportance[] = ['none', 'prefer', 'strong']

export const ITEM_COUNT = QUIZ_ITEMS.length

export function getItem(id: string): QuizItem | undefined {
  return QUIZ_ITEMS.find(i => i.id === id)
}

export function blockOf(itemId: string): QuizBlock | undefined {
  return QUIZ_BLOCKS.find(b => b.items.includes(itemId))
}
