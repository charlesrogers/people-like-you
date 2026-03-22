import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createServerClient } from './supabase'
import { getUserVoiceMemos, updateVoiceMemo, saveCompositeProfile, getSoftPreferences } from './db'
import type { MemoExtraction, CompositeProfile } from './types'

const anthropic = new Anthropic()

// ─── Transcription (GPT-4o Mini Transcribe) ───

export async function transcribeAudio(storagePath: string): Promise<string> {
  const supabase = createServerClient()

  const { data: audioData, error } = await supabase.storage
    .from('voice-memos')
    .download(storagePath)

  if (error || !audioData) {
    throw new Error(`Failed to download audio: ${error?.message}`)
  }

  const ext = storagePath.endsWith('.mp4') ? 'mp4' : 'webm'
  const mime = ext === 'mp4' ? 'audio/mp4' : 'audio/webm'
  const file = new File([audioData], `audio.${ext}`, { type: mime })

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const transcription = await openai.audio.transcriptions.create({
    model: 'gpt-4o-mini-transcribe',
    file,
  })

  return transcription.text
}

// ─── Per-Memo Extraction (Claude Haiku 4.5) ───

export async function extractFromTranscript(
  transcript: string,
  promptCategory: string
): Promise<MemoExtraction> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
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
  "notable_quotes": ["1-3 compelling phrases or sentences worth using in a match introduction — things that reveal personality, humor, or depth"]
}

Score based on evidence in the transcript only. If insufficient signal for a field, use 0.5 for numeric fields or empty arrays. notable_quotes should be direct quotes or close paraphrases that are vivid and specific.`,
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

// ─── Composite Profile Aggregation ───

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

  // Union arrays with dedup
  const unionArrays = (getter: (e: MemoExtraction) => string[]): string[] => {
    const set = new Set<string>()
    extractions.forEach(e => getter(e).forEach(v => set.add(v)))
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

// ─── Full Pipeline: transcribe + extract + aggregate ───

export async function processVoiceMemo(memoId: string): Promise<void> {
  const { getVoiceMemo } = await import('./db')
  const memo = await getVoiceMemo(memoId)
  if (!memo) throw new Error(`Memo ${memoId} not found`)

  // Step 1: Transcribe if needed
  let transcript = memo.transcript
  if (!transcript) {
    console.log(`Transcribing memo ${memoId}...`)
    transcript = await transcribeAudio(memo.audio_storage_path)
    await updateVoiceMemo(memoId, { transcript })
    console.log(`Transcribed memo ${memoId}: ${transcript.substring(0, 80)}...`)
  }

  // Step 2: Extract personality signals
  console.log(`Extracting signals from memo ${memoId}...`)
  // Look up prompt category from prompts table
  const supabase = createServerClient()
  const { data: prompt } = await supabase
    .from('prompts')
    .select('category')
    .eq('id', memo.prompt_id)
    .single()
  const category = prompt?.category || 'depth'

  const extraction = await extractFromTranscript(transcript, category)
  await updateVoiceMemo(memoId, { extraction })
  console.log(`Extracted signals from memo ${memoId}`)

  // Step 3: Re-aggregate composite profile
  console.log(`Aggregating composite profile for user ${memo.user_id}...`)
  await aggregateCompositeProfile(memo.user_id)
  console.log(`Composite profile updated for user ${memo.user_id}`)
}
