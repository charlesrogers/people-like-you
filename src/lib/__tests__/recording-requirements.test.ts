import { describe, expect, it } from 'vitest'
import { isQualifyingRecording, meetsRecordingMinimum } from '../recording-requirements'

describe('recording intake and resume', () => {
  it('requires twenty actual seconds, not rounded up seconds', () => {
    for (const duration of [0, 19, 19.999, -20, NaN, Infinity]) expect(meetsRecordingMinimum(duration)).toBe(false)
    expect(meetsRecordingMinimum(20)).toBe(true)
    expect(meetsRecordingMinimum(45.2)).toBe(true)
  })
  it('does not restore replaced takes or short recordings as completed answers', () => {
    expect(isQualifyingRecording({ duration_seconds: 25, processing_status: 'replaced' })).toBe(false)
    expect(isQualifyingRecording({ duration_seconds: 19, processing_status: 'extracted' })).toBe(false)
    // Extraction timing or quality does not gate this v1 intake step.
    expect(isQualifyingRecording({ duration_seconds: 20, processing_status: 'pending' })).toBe(true)
    expect(isQualifyingRecording({ duration_seconds: 20, processing_status: 'failed' })).toBe(true)
  })
})
