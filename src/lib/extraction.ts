import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createServerClient } from './supabase'
import { getUserVoiceMemos, updateVoiceMemo, saveCompositeProfile, getSoftPreferences } from './db'
import type {
  MemoExtraction,
  CompositeProfile,
  HumorSignature,
  AestheticResonance,
  EmotionalProcessing,
  AttachmentProxy,
} from './types'

const anthropic = new Anthropic()

// --- Transcription with retry + model fallback ---

export async function transcribeAudio(storagePath: string): Promise<string> {
  const supabase = createServerClient()

  const { data: audioData, error } = await supabase.storage
    .from('voice-memos')
    .download(storagePath)

  if (error || !audioData) {
    throw new Error(`Failed to download audio: ${error?.message}`)
  }

  // Detect format from file path — Safari records as m4a, Chrome/Firefox as webm
  const pathLower = storagePath.toLowerCase()
  let ext = 'webm'
  let mime = 'audio/webm'
  if (pathLower.endsWith('.m4a') || pathLower.endsWith('.mp4')) {
    ext = 'm4a'
    mime = 'audio/m4a'
  }
  const file = new File([audioData], `audio.${ext}`, { type: mime })

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Try primary model twice, then fallback model twice
  const models: Array<'gpt-4o-mini-transcribe' | 'whisper-1'> = ['gpt-4o-mini-transcribe', 'whisper-1']
  let lastError: Error | null = null

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const transcription = await openai.audio.transcriptions.create({ model, file })
        const text = transcription.text?.trim()

        if (!text || text.length < 5) {
          console.warn(`transcribeAudio: ${model} attempt ${attempt + 1} returned empty/short (${text?.length || 0} chars)`)
          continue
        }

        console.log(`transcribeAudio: ${model} attempt ${attempt + 1} succeeded (${text.length} chars)`)
        return text
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.warn(`transcribeAudio: ${model} attempt ${attempt + 1} failed:`, lastError.message)
        if (attempt === 0) await new Promise(r => setTimeout(r, 1000))
      }
    }
  }

  throw new Error(`Transcription failed after all attempts: ${lastError?.message || 'empty transcript'}`)
}

// --- Per-Memo Extraction (Claude Haiku 4.5) ---

export async function extractFromTranscript(
  transcript: string,
  promptCategory: string
): Promise<MemoExtraction> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `You are a personality analyst extracting structured signals from a voice memo transcript. The person was answering a ${promptCategory} prompt.

Transcript:
"${transcript}"

Extract signals and return ONLY a JSON object:
{
  "big_five_signals": {
    "openness": 0.0-1.0,
    "conscientiousness": 0.0-1.0,
    "extraversion": 0.0-1.0,
    "agreeableness": 0.0-1.0,
    "neuroticism": 0.0-1.0
  },
  "humor_style": "witty_dry | goofy | sarcastic | wholesome | deadpan | storytelling",
  "communication_warmth": 0.0-1.0,
  "communication_directness": 0.0-1.0,
  "energy_enthusiasm": 0.0-1.0,
  "storytelling_ability": 0.0-1.0,
  "passion_indicators": ["topics or activities they clearly care about"],
  "kindness_markers": ["evidence of care, empathy, generosity toward others"],
  "vulnerability_authenticity": 0.0-1.0,
  "interest_tags": ["specific interests, hobbies, skills mentioned"],
  "values": ["core values expressed or implied"],
  "goals": ["goals, aspirations, or directions mentioned"],
  "notable_quotes": ["1-3 compelling phrases or sentences worth using in a match introduction -- things that reveal personality, humor, or depth"],

  "humor_signature": {
    "what_makes_them_laugh": ["specific things, topics, or situations they find funny"],
    "humor_examples": ["actual jokes, funny observations, or witty remarks they made"],
    "laugh_triggers": ["patterns in what triggers their humor -- absurdity, wordplay, self-deprecation, irony, etc."]
  },
  "aesthetic_resonance": {
    "what_moves_them": ["experiences, art, music, nature, ideas that emotionally move them"],
    "what_they_notice": ["details or qualities they pay attention to -- what catches their eye or ear"],
    "chills_triggers": ["moments or experiences they describe as giving them chills, goosebumps, or deep feeling"]
  },
  "emotional_processing": {
    "logic_vs_emotion": 0.0-1.0,
    "internal_vs_external": 0.0-1.0
  },
  "attachment_signals": {
    "comfort_with_closeness": 0.0-1.0,
    "comfort_with_independence": 0.0-1.0,
    "reassurance_seeking": 0.0-1.0
  },
  "values_in_action_stories": ["specific stories where they DEMONSTRATED a value through action, not just stated it -- e.g. 'I quit my job to care for my mom' not 'family is important to me'"],
  "competence_stories": ["narratives of mastery, skill development, or overcoming challenges through competence -- things they built, learned, achieved, or figured out"]
}

Scoring rules:
- Score numeric fields based on evidence in the transcript only. Default to 0.5 if insufficient signal.
- For humor_signature: extract actual examples from the transcript. Leave arrays empty if no humor is present.
- For aesthetic_resonance: look for moments of emotional response to beauty, art, nature, ideas. Leave arrays empty if none evident.
- For emotional_processing: logic_vs_emotion 0 = pure emotion-first, 1 = pure logic-first. internal_vs_external 0 = processes internally/privately, 1 = processes by talking it out. Default both to 0.5 if unclear.
- For attachment_signals: look for how they talk about closeness, independence, needing reassurance in relationships. Default to 0.5 if unclear.
- For values_in_action_stories: only include SPECIFIC stories with concrete actions, not abstract value statements. Empty array if none.
- For competence_stories: only include narratives where they describe building, learning, or mastering something. Empty array if none.
- Set humor_signature, aesthetic_resonance, emotional_processing, or attachment_signals to null if there is truly zero signal for that category.
- notable_quotes should be direct quotes or close paraphrases that are vivid and specific.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to extract structured data from transcript')
  }
  return JSON.parse(jsonMatch[0])
}

// --- Friend Vouch Extraction (Claude Haiku 4.5) ---

export async function extractFromVouch(
  transcript: string
): Promise<{
  notable_quotes: string[]
  qualities_highlighted: string[]
  specific_stories: string[]
  relationship_context: string | null
  warmth_endorsement: number
  reliability_endorsement: number
  humor_endorsement: number
  overall_sentiment: string
}> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a friend vouch -- a voice memo recorded by someone's friend to vouch for them on a dating app. Third-party observations are especially valuable because they reveal qualities people can't credibly claim about themselves.

Transcript:
"${transcript}"

Extract signals and return ONLY a JSON object:
{
  "notable_quotes": ["2-4 direct quotes from the friend that are vivid, specific, and would make someone want to meet this person -- things like 'She's the person everyone calls at 2am' or 'He once drove 6 hours just to surprise his mom'"],
  "qualities_highlighted": ["specific qualities the friend highlights -- not generic like 'nice' but specific like 'remembers every detail about your life' or 'makes strangers feel comfortable immediately'"],
  "specific_stories": ["concrete anecdotes the friend shares that demonstrate character -- actions, not adjectives"],
  "relationship_context": "how the friend knows this person and for how long, if mentioned (e.g. 'college roommate for 4 years', 'coworker turned close friend')",
  "warmth_endorsement": 0.0-1.0,
  "reliability_endorsement": 0.0-1.0,
  "humor_endorsement": 0.0-1.0,
  "overall_sentiment": "a one-sentence summary of the friend's overall take on this person"
}

Rules:
- Prioritize SPECIFIC observations over generic praise. "She's great" is useless. "She remembered my dog's birthday" is gold.
- notable_quotes should be direct quotes from the friend, not paraphrases.
- specific_stories should be concrete anecdotes with actions and outcomes.
- relationship_context should be null if the friend doesn't mention how they know the person.
- Score endorsement fields based on how enthusiastically the friend vouches in each area. Default to 0.5 if not addressed.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to extract structured data from vouch transcript')
  }
  return JSON.parse(jsonMatch[0])
}

// --- Composite Profile Aggregation ---

export async function aggregateCompositeProfile(userId: string): Promise<CompositeProfile> {
  const memos = await getUserVoiceMemos(userId)
  const extractedMemos = memos.filter(m => m.extraction !== null)

  if (extractedMemos.length === 0) {
    throw new Error('No extracted memos to aggregate')
  }

  const extractions = extractedMemos.map(m => m.extraction as MemoExtraction)
  const count = extractions.length

  // Weighted average for numeric fields (recent memos weighted slightly more)
  const weightedAvg = (getter: (e: MemoExtraction) => number): number => {
    let totalWeight = 0
    let totalValue = 0
    extractions.forEach((e, i) => {
      const weight = 1 + (i / count) * 0.5 // later memos get up to 1.5x weight
      totalWeight += weight
      totalValue += getter(e) * weight
    })
    return Math.round((totalValue / totalWeight) * 100) / 100
  }

  // Weighted average that skips null parent objects
  const weightedAvgNullable = (getter: (e: MemoExtraction) => number | null): number | null => {
    let totalWeight = 0
    let totalValue = 0
    let hasAny = false
    extractions.forEach((e, i) => {
      const val = getter(e)
      if (val !== null && val !== undefined) {
        hasAny = true
        const weight = 1 + (i / count) * 0.5
        totalWeight += weight
        totalValue += val * weight
      }
    })
    if (!hasAny) return null
    return Math.round((totalValue / totalWeight) * 100) / 100
  }

  // Union arrays with dedup
  const unionArrays = (getter: (e: MemoExtraction) => string[]): string[] => {
    const set = new Set<string>()
    extractions.forEach(e => {
      const arr = getter(e)
      if (arr) arr.forEach(v => set.add(v))
    })
    return Array.from(set)
  }

  // Big Five average
  const big5 = {
    openness: weightedAvg(e => e.big_five_signals.openness),
    conscientiousness: weightedAvg(e => e.big_five_signals.conscientiousness),
    extraversion: weightedAvg(e => e.big_five_signals.extraversion),
    agreeableness: weightedAvg(e => e.big_five_signals.agreeableness),
    neuroticism: weightedAvg(e => e.big_five_signals.neuroticism),
  }

  // Most common humor style
  const humorCounts: Record<string, number> = {}
  extractions.forEach(e => {
    humorCounts[e.humor_style] = (humorCounts[e.humor_style] || 0) + 1
  })
  const humor_style = Object.entries(humorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

  // Determine excitement type from Big Five + soft preferences
  const softPrefs = await getSoftPreferences(userId)
  const excitement_type = inferExcitementType(big5, softPrefs)

  // Collect top notable quotes (max 6, from most recent memos first)
  const allQuotes = extractions
    .slice()
    .reverse()
    .flatMap(e => e.notable_quotes || [])
    .slice(0, 6)

  // --- Phase 2: Aggregate humor_signature (union all examples) ---
  const humorSigs = extractions.map(e => e.humor_signature).filter(Boolean) as HumorSignature[]
  const humor_signature: HumorSignature | null = humorSigs.length > 0
    ? {
        what_makes_them_laugh: [...new Set(humorSigs.flatMap(h => h.what_makes_them_laugh))],
        humor_examples: [...new Set(humorSigs.flatMap(h => h.humor_examples))],
        laugh_triggers: [...new Set(humorSigs.flatMap(h => h.laugh_triggers))],
      }
    : null

  // --- Phase 2: Aggregate aesthetic_resonance (union all items) ---
  const aesthetics = extractions.map(e => e.aesthetic_resonance).filter(Boolean) as AestheticResonance[]
  const aesthetic_resonance: AestheticResonance | null = aesthetics.length > 0
    ? {
        what_moves_them: [...new Set(aesthetics.flatMap(a => a.what_moves_them))],
        what_they_notice: [...new Set(aesthetics.flatMap(a => a.what_they_notice))],
        chills_triggers: [...new Set(aesthetics.flatMap(a => a.chills_triggers))],
      }
    : null

  // --- Phase 2: Aggregate emotional_processing (weighted average) ---
  const emotional_processing: EmotionalProcessing | null = (() => {
    const logicEmotion = weightedAvgNullable(e => e.emotional_processing?.logic_vs_emotion ?? null)
    const intExt = weightedAvgNullable(e => e.emotional_processing?.internal_vs_external ?? null)
    if (logicEmotion === null && intExt === null) return null
    return {
      logic_vs_emotion: logicEmotion ?? 0.5,
      internal_vs_external: intExt ?? 0.5,
    }
  })()

  // --- Phase 2: Aggregate attachment_proxy (weighted average) ---
  const attachment_proxy: AttachmentProxy | null = (() => {
    const closeness = weightedAvgNullable(e => e.attachment_signals?.comfort_with_closeness ?? null)
    const independence = weightedAvgNullable(e => e.attachment_signals?.comfort_with_independence ?? null)
    const reassurance = weightedAvgNullable(e => e.attachment_signals?.reassurance_seeking ?? null)
    if (closeness === null && independence === null && reassurance === null) return null
    return {
      comfort_with_closeness: closeness ?? 0.5,
      comfort_with_independence: independence ?? 0.5,
      reassurance_seeking: reassurance ?? 0.5,
    }
  })()

  // --- Phase 2: Aggregate values_in_action + demonstrated_competence (union + dedup) ---
  const values_in_action = unionArrays(e => e.values_in_action_stories || [])
  const demonstrated_competence = unionArrays(e => e.competence_stories || [])

  const composite: Omit<CompositeProfile, 'id'> = {
    user_id: userId,
    big_five_proxy: big5,
    humor_style,
    communication_warmth: weightedAvg(e => e.communication_warmth),
    communication_directness: weightedAvg(e => e.communication_directness),
    energy_enthusiasm: weightedAvg(e => e.energy_enthusiasm),
    storytelling_ability: weightedAvg(e => e.storytelling_ability),
    passion_indicators: unionArrays(e => e.passion_indicators),
    kindness_markers: unionArrays(e => e.kindness_markers),
    vulnerability_authenticity: weightedAvg(e => e.vulnerability_authenticity),
    interest_tags: unionArrays(e => e.interest_tags),
    values: unionArrays(e => e.values),
    goals: unionArrays(e => e.goals),
    excitement_type,
    notable_quotes: allQuotes,
    memo_count: count,
    last_updated: new Date().toISOString(),
    // Phase 2: I-sharing vectors
    humor_signature,
    aesthetic_resonance,
    emotional_processing,
    // Phase 2: Attachment vectors
    attachment_proxy,
    // Phase 2: Admiration vectors
    values_in_action,
    demonstrated_competence,
    friend_vouch_quotes: [], // populated separately via vouch pipeline
    // Phase 5: Embedding
    embedding: null,
  }

  return saveCompositeProfile(composite)
}

function inferExcitementType(
  big5: Record<string, number>,
  softPrefs: { energy_level?: string | null; life_stage_priority?: string | null; communication_style?: string | null } | null
): 'explorer' | 'nester' | 'intellectual' | 'spark' {
  // Score each type
  const scores = {
    explorer: 0,
    nester: 0,
    intellectual: 0,
    spark: 0,
  }

  // Big Five signals
  if (big5.openness > 0.65) { scores.explorer += 2; scores.intellectual += 1 }
  if (big5.agreeableness > 0.65) scores.nester += 2
  if (big5.extraversion > 0.65) scores.spark += 2
  if (big5.conscientiousness > 0.65) scores.nester += 1
  if (big5.openness > 0.7 && big5.extraversion < 0.5) scores.intellectual += 2

  // Soft preference signals
  if (softPrefs) {
    if (softPrefs.energy_level === 'adventurous') scores.explorer += 2
    if (softPrefs.energy_level === 'homebody') scores.nester += 1
    if (softPrefs.life_stage_priority === 'family') scores.nester += 2
    if (softPrefs.life_stage_priority === 'career') scores.intellectual += 1
    if (softPrefs.communication_style === 'expressive') scores.spark += 1
    if (softPrefs.communication_style === 'direct') scores.intellectual += 1
  }

  // Return highest scoring type
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return sorted[0][0] as 'explorer' | 'nester' | 'intellectual' | 'spark'
}

// --- V2 excitement type inference ---

function inferExcitementTypeFromV2(profile: import('./extraction-v2').PersonalityProfile): 'explorer' | 'nester' | 'intellectual' | 'spark' {
  const scores = {
    explorer: profile.explorer.confidence,
    nester: profile.nurturer.confidence,
    intellectual: profile.builder.confidence,
    spark: profile.connector.confidence + profile.wildcard.confidence * 0.5,
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return sorted[0][0] as 'explorer' | 'nester' | 'intellectual' | 'spark'
}

// --- Full Pipeline: transcribe + extract + aggregate ---

export async function processVoiceMemo(memoId: string): Promise<void> {
  const { getVoiceMemo } = await import('./db')
  const memo = await getVoiceMemo(memoId)
  if (!memo) throw new Error(`Memo ${memoId} not found`)

  try {
  // Step 1: Transcribe if needed
  let transcript = memo.transcript
  if (!transcript) {
    console.log(`Transcribing memo ${memoId}...`)
    transcript = await transcribeAudio(memo.audio_storage_path)
    await updateVoiceMemo(memoId, { transcript, processing_status: 'transcribed' as const })
    console.log(`Transcribed memo ${memoId}: ${transcript.substring(0, 80)}...`)
  }

  // Step 2: Track transcript quality metrics
  const wordCount = transcript.split(/\s+/).filter(Boolean).length
  const sentenceCount = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0).length
  console.log(`Memo ${memoId}: ${wordCount} words, ${sentenceCount} sentences, ${memo.duration_seconds || 0}s`)

  // Save prompt-level metrics for question quality tracking
  const supabase = createServerClient()
  await supabase.from('prompt_metrics').upsert({
    prompt_id: memo.prompt_id,
    user_id: memo.user_id,
    word_count: wordCount,
    sentence_count: sentenceCount,
    duration_seconds: memo.duration_seconds || 0,
    created_at: new Date().toISOString(),
  }, { onConflict: 'prompt_id,user_id' }).then(({ error }) => {
    if (error) console.warn('prompt_metrics upsert failed (table may not exist yet):', error.message)
  })

  // Step 3: Run v2 Pass 1 (story extraction) on this memo
  console.log(`[v2] Pass 1: extracting story from memo ${memoId}...`)
  const { extractStory } = await import('./extraction-v2')
  const { QUESTION_BANK } = await import('./prompts')
  const promptTextMap = new Map(QUESTION_BANK.map(q => [q.id, q.text]))
  const promptText = promptTextMap.get(memo.prompt_id) || memo.prompt_id

  const storyExtraction = await extractStory(transcript, memo.prompt_id, promptText)
  // Store Pass 1 output in the extraction field (replaces old format)
  await updateVoiceMemo(memoId, { extraction: storyExtraction as unknown as MemoExtraction })
  console.log(`[v2] Pass 1 done for memo ${memoId}: depth=${storyExtraction.response_depth}, ${storyExtraction.notable_quotes.length} quotes`)

  // Step 4: Run v2 Pass 2 (personality profile) across ALL user's memos
  console.log(`[v2] Pass 2: building personality profile for user ${memo.user_id}...`)
  const allMemos = await getUserVoiceMemos(memo.user_id)
  const allStories = allMemos
    .filter(m => m.extraction && typeof m.extraction === 'object' && 'story_summary' in (m.extraction as unknown as Record<string, unknown>))
    .map(m => m.extraction as unknown as import('./extraction-v2').StoryExtraction)

  if (allStories.length > 0) {
    const { buildPersonalityProfile } = await import('./extraction-v2')
    const profile = await buildPersonalityProfile(allStories)
    console.log(`[v2] Pass 2 done: primary=${profile.primary_energy?.slice(0, 60)}`)

    // Save as composite profile (map v2 output to composite format)
    await saveCompositeProfile({
      user_id: memo.user_id,
      big_five_proxy: {},
      humor_style: profile.humor_signature || null,
      communication_warmth: null,
      communication_directness: null,
      energy_enthusiasm: null,
      storytelling_ability: null,
      passion_indicators: [
        ...profile.explorer.data_points,
        ...profile.connector.data_points,
      ],
      kindness_markers: profile.nurturer.data_points,
      vulnerability_authenticity: null,
      interest_tags: profile.conversation_fuel,
      values: profile.builder.data_points,
      goals: [],
      excitement_type: inferExcitementTypeFromV2(profile),
      notable_quotes: profile.all_quotes,
      memo_count: allStories.length,
      last_updated: new Date().toISOString(),
      // Store the full v2 profile in extended fields
      humor_signature: profile.humor_signature ? { what_makes_them_laugh: [], humor_examples: [profile.humor_signature], laugh_triggers: [] } : null,
      aesthetic_resonance: null,
      emotional_processing: null,
      attachment_proxy: null,
      values_in_action: profile.builder.data_points,
      demonstrated_competence: profile.wildcard.data_points,
      // Store raw v2 profile as JSON for future use
      primary_energy: profile.primary_energy,
      hidden_depth: profile.hidden_depth,
      // Life-stage signals (Rule 9)
      life_stage: profile.life_stage ?? null,
    } as unknown as Parameters<typeof saveCompositeProfile>[0])
    console.log(`[v2] Composite profile saved for user ${memo.user_id}`)
  } else {
    // Fall back to old aggregation if no v2 stories yet
    console.log(`[v2] No v2 stories found, falling back to old aggregation`)
    await aggregateCompositeProfile(memo.user_id)
  }

  await updateVoiceMemo(memoId, { processing_status: 'extracted' as const, processing_error: null })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await updateVoiceMemo(memoId, {
      processing_status: 'failed' as const,
      processing_error: msg,
      retry_count: (memo.retry_count || 0) + 1,
    }).catch(() => {}) // don't let status update failure mask the real error
    throw err
  }
}
