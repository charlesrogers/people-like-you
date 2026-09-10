import { NextResponse } from 'next/server'
import { QUESTION_BANK, ANGLE_TIERS } from '@/lib/prompts'
import { MIN_RECORDING_SECONDS, REQUIRED_ONBOARDING_RECORDINGS } from '@/lib/recording-requirements'

/** Shared content/intake contract for native onboarding. No member data. */
export async function GET() {
  return NextResponse.json({
    version: 'recordings-v1-20s',
    captureContractVersion: 'capture-v1.1',
    minimumRecordingSeconds: MIN_RECORDING_SECONDS,
    requiredRecordings: REQUIRED_ONBOARDING_RECORDINGS,
    angles: ANGLE_TIERS,
    prompts: QUESTION_BANK,
  })
}
