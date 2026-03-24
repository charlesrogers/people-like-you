/**
 * Test the two-pass extraction on existing transcripts.
 *
 * Usage:
 *   npx tsx src/scripts/test-extraction-v2.ts <user_id>
 *   npx tsx src/scripts/test-extraction-v2.ts --list
 */

import { getAllUsers, getUserVoiceMemos, getCompositeProfile } from '../lib/db'
import { extractStory, buildPersonalityProfile, type StoryExtraction } from '../lib/extraction-v2'
import { QUESTION_BANK } from '../lib/prompts'

function divider(title: string) {
  console.log('\n' + '═'.repeat(70))
  console.log(`  ${title}`)
  console.log('═'.repeat(70))
}

function subDivider(title: string) {
  console.log('\n' + '─'.repeat(50))
  console.log(`  ${title}`)
  console.log('─'.repeat(50))
}

// Map prompt IDs to their text
const promptTextMap = new Map(QUESTION_BANK.map(q => [q.id, q.text]))

async function listUsers() {
  const users = await getAllUsers()
  for (const u of users) {
    const memos = await getUserVoiceMemos(u.id)
    const withTranscript = memos.filter(m => m.transcript && m.transcript.trim().length > 0)
    if (withTranscript.length === 0) continue
    console.log(`${u.first_name} ${u.last_name || ''} (${u.gender}) — ${withTranscript.length} memos with transcripts`)
    console.log(`  ID: ${u.id}`)
  }
}

async function testUser(userId: string) {
  const memos = await getUserVoiceMemos(userId)
  const withTranscript = memos.filter(m => m.transcript && m.transcript.trim().length > 0)

  if (withTranscript.length === 0) {
    console.error('No memos with transcripts for this user.')
    return
  }

  divider(`TWO-PASS EXTRACTION — ${withTranscript.length} memos`)

  // ─── Pass 1: Story extraction per memo ───
  subDivider('PASS 1: Story Extraction (Haiku)')

  const stories: StoryExtraction[] = []

  for (const memo of withTranscript) {
    const promptText = promptTextMap.get(memo.prompt_id) || memo.prompt_id
    const wordCount = memo.transcript!.split(/\s+/).filter(Boolean).length

    console.log(`\n  📝 ${memo.prompt_id} (${wordCount} words, ${memo.duration_seconds || 0}s)`)
    console.log(`     Prompt: "${promptText.slice(0, 80)}..."`)
    console.log(`     Transcript: "${memo.transcript!.slice(0, 120)}..."`)

    try {
      const story = await extractStory(memo.transcript!, memo.prompt_id, promptText)
      stories.push(story)

      console.log(`     Depth: ${story.response_depth}`)
      console.log(`     Summary: ${story.story_summary}`)
      if (story.concrete_details.length > 0) {
        console.log(`     Details: ${story.concrete_details.join(', ')}`)
      }
      if (story.notable_quotes.length > 0) {
        console.log(`     Quotes: ${story.notable_quotes.map(q => `"${q}"`).join(' | ')}`)
      }
      if (story.emotions_expressed.length > 0) {
        console.log(`     Emotions: ${story.emotions_expressed.join(', ')}`)
      }
    } catch (err) {
      console.error(`     ❌ Extraction failed: ${err instanceof Error ? err.message : err}`)
    }
  }

  // ─── Pass 2: Personality profile across all stories ───
  subDivider('PASS 2: Personality Profile (Sonnet)')
  console.log(`  Analyzing ${stories.filter(s => s.response_depth !== 'shallow').length} non-shallow stories...`)
  console.log()

  try {
    const profile = await buildPersonalityProfile(stories)

    // Display each dimension
    const dims = ['explorer', 'connector', 'builder', 'nurturer', 'wildcard'] as const
    const emoji: Record<string, string> = { explorer: '🧭', connector: '💜', builder: '⭐', nurturer: '🏠', wildcard: '⚡' }

    for (const dim of dims) {
      const d = profile[dim]
      const bar = '█'.repeat(Math.round(d.confidence * 20))
      const empty = '░'.repeat(20 - Math.round(d.confidence * 20))
      console.log(`  ${emoji[dim]} ${dim.toUpperCase().padEnd(12)} ${bar}${empty} ${(d.confidence * 100).toFixed(0)}%`)
      if (d.data_points.length > 0) {
        for (const dp of d.data_points) {
          console.log(`     • ${dp}`)
        }
      } else {
        console.log(`     (no data points)`)
      }
      if (d.best_quote) {
        console.log(`     💬 "${d.best_quote}"`)
      }
      console.log()
    }

    subDivider('CROSS-CUTTING SIGNALS')
    console.log(`  Primary energy: ${profile.primary_energy}`)
    console.log(`  Hidden depth: ${profile.hidden_depth}`)
    console.log(`  Humor: ${profile.humor_signature || '(none detected)'}`)
    console.log(`  Conversation fuel: ${profile.conversation_fuel.join(' | ') || '(none)'}`)

    if (profile.all_quotes.length > 0) {
      subDivider('ALL QUOTES (ranked by vividness)')
      for (const q of profile.all_quotes.slice(0, 6)) {
        console.log(`  "${q}"`)
      }
    }

    // ─── Compare with old extraction ───
    subDivider('COMPARISON: Old Composite vs New Profile')
    const oldComposite = await getCompositeProfile(userId)
    if (oldComposite) {
      console.log('\n  OLD extraction (current system):')
      console.log(`    Excitement type: ${oldComposite.excitement_type}`)
      console.log(`    Passions: ${(oldComposite.passion_indicators || []).join(', ')}`)
      console.log(`    Values: ${(oldComposite.values || []).join(', ')}`)
      console.log(`    Interests: ${(oldComposite.interest_tags || []).join(', ')}`)
      console.log(`    Quotes: ${(oldComposite.notable_quotes || []).map(q => `"${q}"`).join(' | ')}`)
      console.log()
      console.log('  NEW extraction (v2 two-pass):')
      console.log(`    Primary energy: ${profile.primary_energy}`)
      console.log(`    Top dimension: ${dims.reduce((best, d) => profile[d].confidence > profile[best].confidence ? d : best, 'explorer')}`)
      console.log(`    Conversation fuel: ${profile.conversation_fuel.join(', ')}`)
      console.log(`    Quotes: ${profile.all_quotes.slice(0, 3).map(q => `"${q}"`).join(' | ')}`)
    }

  } catch (err) {
    console.error(`  ❌ Pass 2 failed: ${err instanceof Error ? err.message : err}`)
  }

  divider('END TEST')
}

async function main() {
  const args = process.argv.slice(2)

  if (args[0] === '--list') {
    await listUsers()
  } else if (args.length === 1) {
    await testUser(args[0])
  } else {
    console.log('Usage:')
    console.log('  npx tsx src/scripts/test-extraction-v2.ts --list')
    console.log('  npx tsx src/scripts/test-extraction-v2.ts <user_id>')
  }
}

main().catch(console.error)
