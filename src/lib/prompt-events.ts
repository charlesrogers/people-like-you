import { track } from './analytics'
import { apiFetch } from './api-client'

export type PromptEventName = 'shown' | 'picked' | 'passed' | 'skipped' | 'recorded'
export type ExampleArm = 'on' | 'off'

/**
 * Example on/off split for the v4 prompt test, fixed per account by the last
 * hex digit of the user id: even shows the example answer, odd hides it.
 * Deterministic, so the arm survives reloads with nothing stored, and every
 * account sits in exactly one arm for as long as the split runs.
 */
export function exampleArm(userId: string): ExampleArm {
  const digit = userId.replace(/[^0-9a-f]/gi, '').slice(-1)
  return parseInt(digit || '0', 16) % 2 === 0 ? 'on' : 'off'
}

export interface PromptEventInput {
  userId: string
  promptId: string
  promptSource: 'bank' | 'fished'
  event: PromptEventName
  /** The tier the round was asking about. */
  angle?: string | null
  /** 1-based row in the picker, for `shown` and `picked`. */
  position?: number | null
  exampleShown?: boolean | null
}

/**
 * One row in prompt_events plus a PostHog event. Fire-and-forget: analytics
 * must never slow down or break the recording flow.
 */
export function logPromptEvent(input: PromptEventInput): void {
  track(`voice_prompt_${input.event}`, {
    prompt_id: input.promptId,
    prompt_source: input.promptSource,
    angle: input.angle ?? null,
    position: input.position ?? null,
    example_shown: input.exampleShown ?? null,
  })
  try {
    void apiFetch('/api/prompt-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Never let instrumentation surface to the user.
  }
}
