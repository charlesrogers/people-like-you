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
    // rc8 removed milieu double-scoring, so only Q4-Q12 contribute.
    // O: Q4 asc->1, Q5 asc->1, Q6 asc->1   => 1
    // E: Q7 asc->1, Q8 asc->1              => 1
    // C: Q9 desc->4                        => 4
    // A: Q10 asc->1                        => 1
    // N: Q11 asc->1, Q12 desc->4           => 2.5
    expect(scoreBig5(allFirst)).toEqual({ O: 1, E: 1, C: 4, A: 1, N: 2.5 })
  })

  it('no milieu item contributes to any trait (rc8: double-scoring removed)', () => {
    for (const id of ['Q1', 'Q2', 'Q3', 'Q13', 'Q14', 'Q15', 'Q18', 'Q19', 'Q20', 'Q21', 'Q22']) {
      expect(getItem(id)!.scoring, `${id} must not score a trait`).toEqual([])
    }
  })

  it('un-flips polarity before scoring', () => {
    // Q4 has 4 options, ascending 1..4. Displayed index 0 while flipped is
    // canonical index 3, i.e. the top of the scale.
    expect(scoreBig5([r('Q4', 0, true)]).O).toBe(4)
    expect(scoreBig5([r('Q4', 0, false)]).O).toBe(1)
  })

  it('a skipped item contributes nothing and is never imputed', () => {
    expect(scoreBig5([r('Q4', null), r('Q5', 0), r('Q6', 3)]).O).toBe(2.5) // (1+4)/2
    expect(scoreBig5([]).O).toBeNull()
    expect(scoreBig5([r('Q1', 0)]).O).toBeNull()  // Q1 scores no trait
  })

  it('indicator counts match the rc8 construct budget', () => {
    const counts: Record<string, number> = {}
    for (const item of QUIZ_ITEMS) for (const s of item.scoring) counts[s.trait] = (counts[s.trait] ?? 0) + 1
    // C and A are single-indicator by design: logged, never reported as
    // measurements. O and E are what the pre-registered hypotheses need.
    expect(counts).toEqual({ O: 3, E: 2, C: 1, A: 1, N: 2 })
  })

  it('rounds to 2dp', () => {
    // Q4 asc 1 + Q5 asc 2 + Q6 asc 3 = 6/3 = 2
    expect(scoreBig5([r('Q4', 0), r('Q5', 1), r('Q6', 2)]).O).toBe(2)
  })
})

describe('polarity', () => {
  it('Q9 is never flipped — its options are a clock', () => {
    for (let i = 0; i < 500; i++) expect(isPolarityFlipped(`user-${i}`, 'Q9')).toBe(false)
    expect(displayOptions('Q9', false)).toEqual(getItem('Q9')!.options)
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
    const flipped = Array.from({ length: 2000 }, (_, i) => isPolarityFlipped(`u${i}`, 'Q4')).filter(Boolean).length
    expect(flipped).toBeGreaterThan(800)
    expect(flipped).toBeLessThan(1200)
  })

  it('canonicalIndex round-trips a flipped display order', () => {
    const opts = getItem('Q4')!.options
    const shown = displayOptions('Q4', true)
    shown.forEach((opt, displayed) => {
      expect(opts[canonicalIndex('Q4', displayed, true)]).toEqual(opt)
    })
  })
})

describe('U19 — register from two items', () => {
  it('both playful -> playful', () => {
    expect(deriveRegister([r('Q16', 0), r('Q17', 1)])).toBe('playful')
  })
  it('both earnest -> earnest', () => {
    expect(deriveRegister([r('Q16', 3), r('Q17', 3)])).toBe('earnest')
  })

  it('reads the rc8 fifth option on Q16 ("memes. lots of memes.") as playful', () => {
    expect(getItem('Q16')!.options[2].label).toBe('memes. lots of memes.')
    expect(deriveRegister([r('Q16', 2)])).toBe('playful')
  })
  it('split -> earnest (tie default, SV)', () => {
    expect(deriveRegister([r('Q16', 0), r('Q17', 2)])).toBe('earnest')
    expect(deriveRegister([r('Q16', 4), r('Q17', 0)])).toBe('earnest')
  })
  it('one indicator only -> that indicator', () => {
    expect(deriveRegister([r('Q16', 0)])).toBe('playful')
    expect(deriveRegister([r('Q17', 3)])).toBe('earnest')
  })
  it('both missing -> earnest', () => {
    expect(deriveRegister([])).toBe('earnest')
    expect(deriveRegister([r('Q16', null), r('Q17', null)])).toBe('earnest')
  })
  it('un-flips before reading the register map', () => {
    // Displayed 0 on the 5-option Q16 un-flips to canonical 4 => earnest.
    expect(deriveRegister([r('Q16', 0, true)])).toBe('earnest')
  })
})

describe('scoreQuiz — full traits object', () => {
  it('stamps the instrument version and maps politics', () => {
    const traits = scoreQuiz([...allFirst, r('Q21', 4), r('Q22', 2)])
    expect(traits.instrument_version).toBe(INSTRUMENT_VERSION)
    expect(traits.homogamy.politics_position).toBe(4)
    expect(traits.homogamy.politics_importance).toBe('strong')
  })

  it('"rather not say" stores a null position while importance is still recorded', () => {
    const traits = scoreQuiz([r('Q21', 5), r('Q22', 2)])
    expect(traits.homogamy.politics_position).toBeNull()
    expect(traits.homogamy.politics_importance).toBe('strong')
  })

  it('a skipped Q22 stores null, never a midpoint', () => {
    const traits = scoreQuiz([r('Q21', null), r('Q22', 0)])
    expect(traits.homogamy.politics_position).toBeNull()
    expect(traits.homogamy.politics_importance).toBe('none')
  })

  it('carries labels alongside indices for legibility', () => {
    const traits = scoreQuiz([r('Q1', 5)])
    expect(traits.milieu.M1).toEqual({ index: 5, label: 'a completely different person' })
  })
})
