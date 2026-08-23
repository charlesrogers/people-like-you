// AUTO-DERIVED FROM `specs/matching-v2-questionnaire-battery-v1.md` (rc6).
//
// COPY IS FROZEN. Every stem, option and framing string below is byte-for-byte
// identical to the spec — `src/lib/__tests__/quiz-copy-freeze.test.ts` asserts it
// against the spec file itself and fails the build on any drift. If a string
// reads wrong, raise it with Charles; do not edit it here.

export const INSTRUMENT_VERSION = 'B-1.0'

export type Trait = 'O' | 'E' | 'C' | 'A' | 'N'
export type Register = 'playful' | 'earnest'
export type PoliticsImportance = 'none' | 'prefer' | 'strong'

export interface TraitScoring {
  trait: Trait
  /**
   * Per-option value on the 1-4 trait scale, index-aligned with `options` as
   * listed here (i.e. before any polarity flip). Scoring un-flips first.
   */
  values: number[]
}

export interface QuizItem {
  id: string
  /** Spec code (M1, T-O1, H2b...) — kept so the battery stays traceable to the spec. */
  code: string
  block: number
  stem: string
  options: string[]
  skippable: boolean
  /**
   * Straightline protection: the 9 trait items have their option order reversed
   * for a random half of users, seeded per user so Back does not reshuffle.
   * Q9 is exempt — its options are a clock and must stay in time order.
   */
  polarityRandomised: boolean
  scoring: TraitScoring[]
  /** Register indicator (Q16, Q17): per-option register, index-aligned. */
  register?: Register[]
  kind: 'choice' | 'free'
}

export interface QuizBlock {
  block: number
  /** Zero-tap block card shown before the block's items. Block 5 has none. */
  card: string | null
  items: string[]
}

export const QUIZ_ITEMS: QuizItem[] = [
  {
    id: "Q1", code: "M1", block: 1,
    stem: "At seventeen you were, on the record…",
    options: [
      "theatre kid",
      "jock",
      "honor-roll grinder",
      "the one organizing the hang",
      "happily unaffiliated",
      "a completely different person",
    ],
    skippable: true, polarityRandomised: false,
    scoring: [],
    kind: 'choice',
  },
  {
    id: "Q2", code: "M2", block: 1,
    stem: "The group is picking a restaurant. Fourteen messages in.",
    options: [
      "I've already picked it",
      "I've sent three links and a walking distance",
      "I said \"I'm easy\" and meant it",
      "I sent a meme about how long this is taking",
      "I muted it and I'll go wherever",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [{ trait: 'E', values: [4, 3, 2, 3, 1] }],  // nominal on this trait - explicit per-option values (SV)
    kind: 'choice',
  },
  {
    id: "Q3", code: "M3", block: 1,
    stem: "Wedding reception, 10pm.",
    options: [
      "already home, shoes off",
      "at a side table, deep in the actual conversation",
      "outside, handing out sparklers",
      "on the dance floor since the first song",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [{ trait: 'E', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
    kind: 'choice',
  },
  {
    id: "Q4", code: "T-O1", block: 2,
    stem: "It's 1am. You're still up because:",
    options: [
      "the show kept autoplaying",
      "I lost track of time",
      "I went looking for one fact two hours ago",
      "I've got an idea and I'm not putting it down",
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'O', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
    kind: 'choice',
  },
  {
    id: "Q5", code: "T-O2", block: 2,
    stem: "Last thing you said yes to with no idea what you were doing:",
    options: [
      "that was this month",
      "sometime this year",
      "a few years back",
      "I like knowing what I'm doing",
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'O', values: [4.0, 3.0, 2.0, 1.0] }],  // as listed: high -> low
    kind: 'choice',
  },
  {
    id: "Q6", code: "T-O3", block: 2,
    stem: "One free day in a city you've never been to.",
    options: [
      "I'm not missing the must-see things",
      "whatever's near where I'm staying",
      "I walk until something happens",
      "I ask someone who lives there and go do that",
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'O', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
    kind: 'choice',
  },
  {
    id: "Q7", code: "T-E1", block: 2,
    stem: "The party's good. You've been there three hours.",
    options: [
      "actually, I left an hour ago",
      "I'm in the long goodbye",
      "second wind",
      "I'm deciding where everyone goes next",
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'E', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
    kind: 'choice',
  },
  {
    id: "Q8", code: "T-E2", block: 2,
    stem: "Your phone rings. No text first.",
    options: [
      "I don't answer the phone. Ever.",
      "I let it go and text back \"everything ok?\"",
      "I answer, bracing",
      "I'm delighted — it's been ages",
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'E', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
    kind: 'choice',
  },
  {
    id: "Q9", code: "T-C1", block: 2,
    stem: "You're meeting someone at 7.",
    options: [
      "I'm there at 6:50",
      "I'm there at 7",
      "7:05, and I texted",
      "7:15, but I have a story",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [{ trait: 'C', values: [4.0, 3.0, 2.0, 1.0] }],  // as listed: high -> low
    kind: 'choice',
  },
  {
    id: "Q10", code: "T-A1", block: 2,
    stem: "Your closest friend is getting back together with the ex. Again.",
    options: [
      "I say exactly what I think",
      "I say it once, then I'm supportive",
      "I ask questions until they hear themselves",
      "I keep my mouth shut and stay close",
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'A', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
    kind: 'choice',
  },
  {
    id: "Q11", code: "T-N1", block: 2,
    stem: "You sent a text an hour ago. Nothing back.",
    options: [
      "nothing, they're busy",
      "I've reread what I sent",
      "I've reread it and drafted the follow-up",
      "I know exactly what it means",
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'N', values: [1.0, 2.0, 3.0, 4.0] }],  // as listed: low -> high
    kind: 'choice',
  },
  {
    id: "Q12", code: "T-N2", block: 2,
    stem: "Someone says \"can I give you some feedback?\"",
    options: [
      "my stomach drops",
      "I brace, then I'm fine",
      "sure, go ahead",
      "I asked for it, that's why I'm here",
    ],
    skippable: false, polarityRandomised: true,
    scoring: [{ trait: 'N', values: [4.0, 3.0, 2.0, 1.0] }],  // as listed: high -> low
    kind: 'choice',
  },
  {
    id: "Q13", code: "M4", block: 3,
    stem: "Your last three Saturdays, honestly:",
    options: [
      "outside before most people were up",
      "nothing on the calendar, and that was the point",
      "elbow-deep in something I was making or fixing",
      "at someone's kitchen table too long",
      "working, and not entirely mad about it",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [{ trait: 'C', values: [4, 1, 3, 2, 4] }],  // nominal on this trait - explicit per-option values (SV)
    kind: 'choice',
  },
  {
    id: "Q14", code: "M7", block: 3,
    stem: "The thing in your place a guest always asks about:",
    options: [
      "the art",
      "a chair I overpaid for",
      "the gear — bike, skis, clubs",
      "an instrument",
      "something I made",
      "nothing, and I've never once thought about it",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    kind: 'choice',
  },
  {
    id: "Q15", code: "M8", block: 3,
    stem: "It's their birthday. Your move:",
    options: [
      "something that makes them laugh out loud",
      "something I made",
      "the thing they mentioned once, months ago",
      "a day out, not an object",
      "I'm not a gift person — I'll be there, though",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [{ trait: 'A', values: [3, 4, 4, 3, 2] }],  // nominal on this trait - explicit per-option values (SV)
    kind: 'choice',
  },
  {
    id: "Q16", code: "M5", block: 4,
    stem: "The tell that you like someone:",
    options: [
      "the teasing starts",
      "the jokes get weirdly specific",
      "I say it out loud, probably too early",
      "I start showing up for things",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    register: ['playful', 'playful', 'earnest', 'earnest'],
    kind: 'choice',
  },
  {
    id: "Q17", code: "CS1", block: 4,
    stem: "Your friend just did something genuinely impressive. What you actually say:",
    options: [
      "something that sounds like an insult",
      "\"okay, that's actually incredible\"",
      "I tell them properly, out loud",
      "I tell everyone except them",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    register: ['playful', 'playful', 'earnest', 'earnest'],
    kind: 'choice',
  },
  {
    id: "Q18", code: "CS2", block: 4,
    stem: "Dinner with someone you just met goes well. Afterwards:",
    options: [
      "they know more about me",
      "I know more about them",
      "we found one thing we both care about and never left it",
      "we argued about something for an hour",
      "about even, honestly",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    kind: 'choice',
  },
  {
    id: 'Q19', code: 'M9', block: 5,
    stem: "What do you nerd out on?",
    options: [],
    skippable: true, polarityRandomised: false, scoring: [], kind: 'free',
  },
  {
    id: "Q20", code: "H1", block: 6,
    stem: "Education:",
    options: [
      "high school",
      "some college",
      "bachelor's",
      "grad school or beyond",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    kind: 'choice',
  },
  {
    id: "Q21", code: "H3", block: 6,
    stem: "The next five years, honestly:",
    options: [
      "my work gets serious",
      "my life gets full — people, a house, all of it",
      "both, and I know how that sounds",
      "I've stopped making five-year plans",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    kind: 'choice',
  },
  {
    id: "Q22", code: "H2", block: 6,
    stem: "Politically, roughly:",
    options: [
      "progressive",
      "lean progressive",
      "somewhere in the middle",
      "lean conservative",
      "conservative",
      "rather not say",
    ],
    skippable: true, polarityRandomised: false,
    scoring: [],
    kind: 'choice',
  },
  {
    id: "Q23", code: "H2b", block: 6,
    stem: "How much does this matter in someone you'd date?",
    options: [
      "not really something I think about",
      "I'd rather be close on it",
      "honestly, I'd struggle with someone far from me",
    ],
    skippable: false, polarityRandomised: false,
    scoring: [],
    kind: 'choice',
  },
]

export const QUIZ_BLOCKS: QuizBlock[] = [
  { block: 1, card: "Let's start with who you've been.", items: ['Q1', 'Q2', 'Q3'] },
  { block: 2, card: "Now, how you're built.", items: ['Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12'] },
  { block: 3, card: "What your weeks actually look like.", items: ['Q13', 'Q14', 'Q15'] },
  { block: 4, card: "How you come across.", items: ['Q16', 'Q17', 'Q18'] },
  { block: 5, card: null, items: ['Q19'] },
  { block: 6, card: "A few plain ones, then you're done.", items: ['Q20', 'Q21', 'Q22', 'Q23'] },
]

/** Framing copy, §4 of the battery spec. Frozen. */
export const FRAMING = {
  intro: "A few questions so we know how to introduce you. Nothing here is graded, and none of it is shown to anyone as a score.",
  honesty: "Answer as the person who'll actually be sitting across the table.",
  skip: "skip this one",
  close: "That's it. Next we'll ask you about a couple of things you just told us, and you get to answer out loud.",
  q19TextPlaceholder: "specific beats impressive",
  q19AudioAffordance: "or say it \u2014 30 seconds",
  q23Sub: "Only the last one narrows who you'll see.",
} as const

/** The 11 items whose answers seed a fished voice prompt (D-QD4). */
export const SEEDING_ITEMS: string[] = ['Q1', 'Q3', 'Q5', 'Q6', 'Q9', 'Q10', 'Q13', 'Q14', 'Q15', 'Q19', 'Q21']

/** Q22 index -> politics position on a 0-4 left/right scale. Index 5 ("rather not say") is null. */
export const POLITICS_POSITION: (number | null)[] = [0, 1, 2, 3, 4, null]

/** Q23 index -> importance tier. */
export const POLITICS_IMPORTANCE: PoliticsImportance[] = ['none', 'prefer', 'strong']

export const ITEM_COUNT = QUIZ_ITEMS.length

export function getItem(id: string): QuizItem | undefined {
  return QUIZ_ITEMS.find(i => i.id === id)
}
