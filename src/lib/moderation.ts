/**
 * Content moderation — the Apple Guideline 1.2 "filter objectionable material" pillar.
 * Uses OpenAI's omni-moderation endpoint (free) to screen every piece of user-posted
 * content (photos, chat text, voice transcripts) BEFORE it can reach another member.
 *
 * Fail-open on API error (availability > perfect coverage), but every decision — including
 * errors — is logged to moderation_events so nothing screened is silently trusted.
 */
import OpenAI from 'openai'
import { logModerationEvent } from './db'
import { isRejectable } from './safety-logic'

export interface ModerationResult {
  flagged: boolean
  rejected: boolean
  categories: string[]
  scores: Record<string, number>
  errored: boolean
}

type ModInput =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

async function runModeration(input: ModInput[]): Promise<ModerationResult> {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const res = await openai.moderations.create({ model: 'omni-moderation-latest', input })
    const r = res.results[0]
    const flaggedCats = Object.entries(r.categories)
      .filter(([, v]) => v === true)
      .map(([k]) => k)
    const rejected = isRejectable(flaggedCats)
    return {
      flagged: r.flagged,
      rejected,
      categories: flaggedCats,
      scores: r.category_scores as unknown as Record<string, number>,
      errored: false,
    }
  } catch (err) {
    console.error('[moderation] API error — failing open:', err)
    return { flagged: false, rejected: false, categories: [], scores: {}, errored: true }
  }
}

export async function moderateText(text: string): Promise<ModerationResult> {
  if (!text || !text.trim()) {
    return { flagged: false, rejected: false, categories: [], scores: {}, errored: false }
  }
  return runModeration([{ type: 'text', text }])
}

/** dataUrl must be a base64 data URL (e.g. `data:image/jpeg;base64,...`). */
export async function moderateImageDataUrl(dataUrl: string): Promise<ModerationResult> {
  return runModeration([{ type: 'image_url', image_url: { url: dataUrl } }])
}

/**
 * Screen content and persist the decision. Returns the result so the caller can
 * reject the post when `rejected` is true.
 */
export async function screenAndLog(
  userId: string,
  surface: 'photo' | 'chat_message' | 'voice_transcript' | 'profile_text',
  contentRef: string | null,
  result: ModerationResult,
): Promise<ModerationResult> {
  await logModerationEvent({
    user_id: userId,
    surface,
    content_ref: contentRef,
    flagged: result.flagged,
    rejected: result.rejected,
    categories: result.categories,
    scores: result.scores,
    outcome: result.errored ? 'error' : result.rejected ? 'rejected' : 'checked',
  }).catch(err => console.error('[moderation] failed to log event:', err))
  return result
}
