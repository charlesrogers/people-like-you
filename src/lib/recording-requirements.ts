/** V1 intake rule, shared by the recorder, upload route and progress restore. */
export const MIN_RECORDING_SECONDS = 20
export const REQUIRED_ONBOARDING_RECORDINGS = 4

export function meetsRecordingMinimum(durationSeconds: number): boolean {
  return Number.isFinite(durationSeconds) && durationSeconds >= MIN_RECORDING_SECONDS
}

export function isQualifyingRecording(memo: {
  duration_seconds: number
  processing_status?: string
}): boolean {
  return memo.processing_status !== 'replaced' && meetsRecordingMinimum(memo.duration_seconds)
}
