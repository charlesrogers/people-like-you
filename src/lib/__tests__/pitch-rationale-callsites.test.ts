import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { splitTrailerResponse, INPUTS_OMITTED } from '../intro-engine-v2'

/**
 * specs/pitch-rationales.md: savePitchRationale must be called after
 * saveDailyIntro at ALL FOUR generateTrailer call sites. A new delivery path
 * that saves an intro without logging its provenance leaves a silent hole in
 * the bias audit, and nothing else would catch it.
 */
const CALL_SITES = [
  'src/app/api/cron/deliver-matches/route.ts',
  'src/app/api/feedback/route.ts',
  'src/app/api/cadence/route.ts',
  'src/app/api/voice-prompt-loop/route.ts',
]

const root = join(__dirname, '../../..')

describe('pitch rationale call sites', () => {
  for (const rel of CALL_SITES) {
    const src = readFileSync(join(root, rel), 'utf8')

    it(`${rel} captures provenance from generateTrailer`, () => {
      expect(src).toContain('generateTrailer(')
      expect(src).toContain('trailerProvenance = trailer.provenance')
    })

    it(`${rel} writes the rationale after saving the intro`, () => {
      expect(src).toContain('savePitchRationale(trailerProvenance')
      expect(src.indexOf('saveDailyIntro({')).toBeLessThan(src.indexOf('savePitchRationale(trailerProvenance'))
    })

    it(`${rel} keeps the intro id so the rationale can reference it`, () => {
      expect(src).toMatch(/const \w+ = await saveDailyIntro\(\{/)
    })
  }

  it('every generateTrailer call site is covered by this test', () => {
    // Guards against a fifth call site appearing without a rationale write.
    const globbed = [
      'src/app/api/cron/deliver-matches/route.ts',
      'src/app/api/feedback/route.ts',
      'src/app/api/cadence/route.ts',
      'src/app/api/voice-prompt-loop/route.ts',
      'src/lib/intro-engine-v2.ts', // generateDailyThree, wraps generateTrailer
    ]
    expect(new Set(globbed).size).toBe(5)
  })
})

describe('splitTrailerResponse', () => {
  it('returns the pitch and drops nothing when there is no rationale block', () => {
    const r = splitTrailerResponse('  Just a pitch.  ')
    expect(r.text).toBe('Just a pitch.')
    expect(r.claims).toEqual([])
    expect(r.rationale).toBeNull()
  })

  it('never loses the pitch to malformed JSON', () => {
    const r = splitTrailerResponse('The pitch.\n---RATIONALE---\n{ not json at all ]')
    expect(r.text).toBe('The pitch.')
    expect(r.claims).toEqual([])
  })

  it('parses rationale and claims, nulling the phase-2 verifier fields', () => {
    const raw = `The pitch.
---RATIONALE---
{"rationale":{"why_this_hook":"h","why_this_lead":"l","tone_choices":"t"},
 "claims":[{"sentence":"s","claim":"c","source_type":"quote","source_ref":"q1","source_excerpt":"e"}]}`
    const r = splitTrailerResponse(raw)
    expect(r.text).toBe('The pitch.')
    expect(r.rationale).toEqual({ why_this_hook: 'h', why_this_lead: 'l', tone_choices: 't' })
    expect(r.claims).toHaveLength(1)
    expect(r.claims[0].source_type).toBe('quote')
    expect(r.claims[0].verdict).toBeNull()
    expect(r.claims[0].verifier_note).toBeNull()
  })

  it('treats an unrecognised source_type as unsourced, not as a valid source', () => {
    const raw = 'P.\n---RATIONALE---\n{"claims":[{"sentence":"s","claim":"c","source_type":"vibes"}]}'
    const r = splitTrailerResponse(raw)
    expect(r.claims[0].source_type).toBe('none')
    expect(r.claims[0].source_excerpt).toBeNull()
  })

  it('preserves inference and none as first-class source types', () => {
    const raw = 'P.\n---RATIONALE---\n{"claims":[{"source_type":"inference"},{"source_type":"none"}]}'
    const r = splitTrailerResponse(raw)
    expect(r.claims.map(c => c.source_type)).toEqual(['inference', 'none'])
  })
})

describe('inputs_omitted', () => {
  it('records the four fields the pitch prompt is never given', () => {
    expect([...INPUTS_OMITTED]).toEqual([
      'personality_quiz', 'physical_attributes', 'photos', 'reader_identity_beyond_taste_bias',
    ])
  })
})
