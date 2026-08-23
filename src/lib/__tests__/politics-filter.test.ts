import { describe, it, expect } from 'vitest'
import { isPoliticsDealbreaker, politicsGap, POLITICS_GAP_THRESHOLD } from '../db'
import type { ReaderTraitsRow } from '../types'

type Importance = 'none' | 'prefer' | 'strong'

const reader = (position: number | null, importance: Importance | null, id = 'u'): ReaderTraitsRow => ({
  user_id: id, big5: null, milieu: null,
  homogamy: { politics_position: position, politics_importance: importance },
  convo: null, taste_priors: null, pickiness: null, scale_use: null,
  register: null, instrument_version: 'B-1.0', completed_at: '2026-08-23T00:00:00Z',
})

// U16 — politics is a 3-way importance, not a boolean toggle.
describe('U16 — politics hard filter, all three tiers', () => {
  it('threshold is a gap of MORE THAN 2 steps', () => {
    expect(POLITICS_GAP_THRESHOLD).toBe(2)
    expect(politicsGap(reader(0, 'strong'), reader(4, 'none'))).toBe(4)
  })

  describe('tier 3 (strong)', () => {
    it('filters at a gap over 2, in both directions', () => {
      expect(isPoliticsDealbreaker(reader(0, 'strong', 'a'), reader(3, 'none', 'b'))).toBe(true)
      expect(isPoliticsDealbreaker(reader(3, 'none', 'a'), reader(0, 'strong', 'b'))).toBe(true)
      expect(isPoliticsDealbreaker(reader(0, 'strong', 'a'), reader(4, 'strong', 'b'))).toBe(true)
    })

    it('does not filter at the boundary gap of exactly 2', () => {
      expect(isPoliticsDealbreaker(reader(0, 'strong'), reader(2, 'strong'))).toBe(false)
    })

    it('does not filter at gaps of 0 or 1', () => {
      expect(isPoliticsDealbreaker(reader(2, 'strong'), reader(2, 'strong'))).toBe(false)
      expect(isPoliticsDealbreaker(reader(2, 'strong'), reader(3, 'strong'))).toBe(false)
    })
  })

  describe('tier 2 (prefer) — logged, never filters at launch', () => {
    it.each([0, 1, 2, 3, 4])('never filters against position %i', (pos) => {
      expect(isPoliticsDealbreaker(reader(0, 'prefer', 'a'), reader(pos, 'prefer', 'b'))).toBe(false)
      expect(isPoliticsDealbreaker(reader(4, 'prefer', 'a'), reader(pos, 'none', 'b'))).toBe(false)
    })
  })

  describe('tier 1 (none)', () => {
    it('never filters', () => {
      expect(isPoliticsDealbreaker(reader(0, 'none'), reader(4, 'none'))).toBe(false)
    })
  })

  describe('missing data', () => {
    it('never filters when either side has no position', () => {
      // Q22 is skippable while Q23 is still asked: importance without a position
      // is meaningful, it just cannot filter.
      expect(isPoliticsDealbreaker(reader(null, 'strong', 'a'), reader(4, 'strong', 'b'))).toBe(false)
      expect(isPoliticsDealbreaker(reader(0, 'strong', 'a'), reader(null, 'strong', 'b'))).toBe(false)
      expect(politicsGap(reader(null, 'strong'), reader(4, 'strong'))).toBeNull()
    })

    it('never filters when a user has no reader_traits row at all', () => {
      expect(isPoliticsDealbreaker(null, reader(4, 'strong'))).toBe(false)
      expect(isPoliticsDealbreaker(reader(0, 'strong'), null)).toBe(false)
      expect(isPoliticsDealbreaker(undefined, undefined)).toBe(false)
    })
  })
})
