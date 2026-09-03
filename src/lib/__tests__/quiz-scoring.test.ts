import { describe, it, expect } from 'vitest'
import {
  scoreBig5, scoreQuiz, deriveRegister, isPolarityFlipped, canonicalIndex, displayOptions,
  type QuizResponse,
} from '../quiz-scoring'
import { QUIZ_ITEMS, getItem, INSTRUMENT_VERSION } from '../quiz-battery'

const r = (itemId: string, optionIndex: number | null, polarityFlipped = false): QuizResponse =>
  ({ itemId, optionIndex, polarityFlipped })

/** Canonical index 0 on every item. */
const allFirst: QuizResponse[] = QUIZ_ITEMS.map(i => r(i.id, 0))

describe('U17 — item-specific trait scoring (replaces the void Big Five reversal test)', () => {
  it('hand-computed fixture: canonical option 0 everywhere', () => {
    // rc10: only Q3-Q8 score. N is gone entirely (both items cut).
    // O: Q3 asc->1, Q4 asc->1  => 1 · E: Q5 asc->1, Q6 asc->1 => 1
    // C: Q7 desc->4            => 4 · A: Q8 asc->1            => 1
    expect(scoreBig5(allFirst)).toEqual({ O: 1, E: 1, C: 4, A: 1, N: null })
  })

  it('no milieu item contributes to any trait (rc8: double-scoring removed)', () => {
    for (const id of ['Q1', 'Q2', 'Q9', 'Q10', 'Q11', 'Q14', 'Q15', 'Q16', 'Q17']) {
      expect(getItem(id)!.scoring, `${id} must not score a trait`).toEqual([])
    }
  })

  it('un-flips polarity before scoring', () => {
    // Q4 has 4 options, ascending 1..4. Displayed index 0 while flipped is
    // canonical index 3, i.e. the top of the scale.
    expect(scoreBig5([r('Q3', 0, true)]).O).toBe(4)
    expect(scoreBig5([r('Q3', 0, false)]).O).toBe(1)
  })

  it('a skipped item contributes nothing and is never imputed', () => {
    expect(scoreBig5([r('Q3', null), r('Q4', 3)]).O).toBe(4) // only Q4 contributes
    expect(scoreBig5([]).O).toBeNull()
    expect(scoreBig5([r('Q1', 0)]).O).toBeNull()  // Q1 scores no trait
  })

  it('indicator counts match the rc8 construct budget', () => {
    const counts: Record<string, number> = {}
    for (const item of QUIZ_ITEMS) for (const s of item.scoring) counts[s.trait] = (counts[s.trait] ?? 0) + 1
    // rc10: C and A single-indicator, N cut entirely. O and E are what the
    // pre-registered hypotheses need and both keep two.
    expect(counts).toEqual({ O: 2, E: 2, C: 1, A: 1 })
  })

  it('rounds to 2dp', () => {
    // Q3 asc 1 + Q4 asc 2 => 1.5
    expect(scoreBig5([r('Q3', 0), r('Q4', 1)]).O).toBe(1.5)
  })
})

describe('polarity', () => {
  it('Q7 is never flipped — its options are a clock', () => {
    for (let i = 0; i < 500; i++) expect(isPolarityFlipped(`user-${i}`, 'Q7')).toBe(false)
    expect(displayOptions('Q7', false)).toEqual(getItem('Q7')!.options)
  })

  it('non-trait items are never flipped', () => {
    for (const item of QUIZ_ITEMS.filter(i => !i.polarityRandomised)) {
      expect(isPolarityFlipped('any-user', item.id)).toBe(false)
    }
  })

  it('is stable for a user+item, so Back does not reshuffle', () => {
    const a = QUIZ_ITEMS.filter(i => i.polarityRandomised).map(i => isPolarityFlipped('u1', i.id))
    const b = QUIZ_ITEMS.filter(i => i.polarityRandomised).map(i => isPolarityFlipped('u1', i.id))
    expect(a).toEqual(b)
  })

  it('flips roughly half of users', () => {
    const flipped = Array.from({ length: 2000 }, (_, i) => isPolarityFlipped(`u${i}`, 'Q3')).filter(Boolean).length
    expect(flipped).toBeGreaterThan(800)
    expect(flipped).toBeLessThan(1200)
  })

  it('canonicalIndex round-trips a flipped display order', () => {
    const opts = getItem('Q3')!.options
    const shown = displayOptions('Q3', true)
    shown.forEach((opt, displayed) => {
      expect(opts[canonicalIndex('Q3', displayed, true)]).toEqual(opt)
    })
  })
})

describe('U19 — register from two items', () => {
  it('both playful -> playful', () => {
    expect(deriveRegister([r('Q12', 0), r('Q13', 1)])).toBe('playful')
  })
  it('both earnest -> earnest', () => {
    expect(deriveRegister([r('Q12', 3), r('Q13', 3)])).toBe('earnest')
  })

  it('reads the rc8 fifth option on Q16 ("memes. lots of memes.") as playful', () => {
    expect(getItem('Q12')!.options[2].label).toBe('memes. lots of memes.')
    expect(deriveRegister([r('Q12', 2)])).toBe('playful')
  })
  it('split -> earnest (tie default, SV)', () => {
    expect(deriveRegister([r('Q12', 0), r('Q13', 2)])).toBe('earnest')
    expect(deriveRegister([r('Q12', 4), r('Q13', 0)])).toBe('earnest')
  })
  it('one indicator only -> that indicator', () => {
    expect(deriveRegister([r('Q12', 0)])).toBe('playful')
    expect(deriveRegister([r('Q13', 3)])).toBe('earnest')
  })
  it('both missing -> earnest', () => {
    expect(deriveRegister([])).toBe('earnest')
    expect(deriveRegister([r('Q12', null), r('Q13', null)])).toBe('earnest')
  })
  it('un-flips before reading the register map', () => {
    // Displayed 0 on the 5-option Q16 un-flips to canonical 4 => earnest.
    expect(deriveRegister([r('Q12', 0, true)])).toBe('earnest')
  })
})

describe('scoreQuiz — full traits object', () => {
  it('stamps the instrument version and maps politics', () => {
    const traits = scoreQuiz([...allFirst, r('Q16', 4), r('Q17', 2)])
    expect(traits.instrument_version).toBe(INSTRUMENT_VERSION)
    expect(traits.homogamy.politics_position).toBe(4)
    expect(traits.homogamy.politics_importance).toBe('strong')
  })

  it('"rather not say" stores a null position while importance is still recorded', () => {
    const traits = scoreQuiz([r('Q16', 5), r('Q17', 2)])
    expect(traits.homogamy.politics_position).toBeNull()
    expect(traits.homogamy.politics_importance).toBe('strong')
  })

  it('a skipped Q22 stores null, never a midpoint', () => {
    const traits = scoreQuiz([r('Q16', null), r('Q17', 0)])
    expect(traits.homogamy.politics_position).toBeNull()
    expect(traits.homogamy.politics_importance).toBe('none')
  })

  it('carries labels alongside indices for legibility', () => {
    const traits = scoreQuiz([r('Q1', 5)])
    expect(traits.milieu.M1).toEqual({ index: 5, label: 'a completely different person' })
  })
})
