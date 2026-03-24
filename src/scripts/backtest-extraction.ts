/**
 * Backtest extraction: re-run v2 extraction on existing transcripts
 * and save results to a JSON file for comparison across prompt versions.
 *
 * Usage:
 *   npx tsx src/scripts/backtest-extraction.ts <user_id>
 *   npx tsx src/scripts/backtest-extraction.ts --all
 *
 * Results saved to: backtest-results/<user_id>_<version>_<timestamp>.json
 */

import fs from 'fs'
import path from 'path'
import { getAllUsers, getUserVoiceMemos, getCompositeProfile } from '../lib/db'
import { backtestUser, EXTRACTION_CONFIG } from '../lib/extraction-v2'
import { QUESTION_BANK } from '../lib/prompts'

const promptTextMap = new Map(QUESTION_BANK.map(q => [q.id, q.text]))
const resultsDir = path.join(process.cwd(), 'backtest-results')

async function runBacktest(userId: string) {
  const memos = await getUserVoiceMemos(userId)
  const withTranscript = memos.filter(m => m.transcript && m.transcript.trim().length > 0)

  if (withTranscript.length === 0) {
    console.log(`  No transcripts for ${userId}, skipping`)
    return
  }

  console.log(`\n  Running backtest on ${userId} (${withTranscript.length} memos)...`)
  console.log(`  Pass 1: ${EXTRACTION_CONFIG.pass1.version} (${EXTRACTION_CONFIG.pass1.model})`)
  console.log(`  Pass 2: ${EXTRACTION_CONFIG.pass2.version} (${EXTRACTION_CONFIG.pass2.model})`)

  const result = await backtestUser(
    userId,
    withTranscript.map(m => ({
      prompt_id: m.prompt_id,
      transcript: m.transcript!,
      duration_seconds: m.duration_seconds,
    })),
    promptTextMap,
  )

  // Also load old composite for comparison
  const oldComposite = await getCompositeProfile(userId)

  const output = {
    user_id: userId,
    memo_count: withTranscript.length,
    extraction_config: result.config,
    timestamp: new Date().toISOString(),
    stories: result.stories,
    new_profile: result.profile,
    old_composite: oldComposite ? {
      excitement_type: oldComposite.excitement_type,
      passion_indicators: oldComposite.passion_indicators,
      values: oldComposite.values,
      interest_tags: oldComposite.interest_tags,
      notable_quotes: oldComposite.notable_quotes,
      humor_style: oldComposite.humor_style,
    } : null,
  }

  // Save to file
  if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true })
  const filename = `${userId.slice(0, 8)}_${EXTRACTION_CONFIG.pass2.version}_${Date.now()}.json`
  const filepath = path.join(resultsDir, filename)
  fs.writeFileSync(filepath, JSON.stringify(output, null, 2))

  // Print summary
  const dims = ['explorer', 'connector', 'builder', 'nurturer', 'wildcard'] as const
  const emoji: Record<string, string> = { explorer: '🧭', connector: '💜', builder: '⭐', nurturer: '🏠', wildcard: '⚡' }

  console.log(`\n  Results:`)
  for (const dim of dims) {
    const d = result.profile[dim]
    const bar = '█'.repeat(Math.round(d.confidence * 10))
    console.log(`    ${emoji[dim]} ${dim.padEnd(12)} ${(d.confidence * 100).toFixed(0).padStart(3)}% ${bar}  ${d.data_points.length} data points`)
  }
  console.log(`    Primary: ${result.profile.primary_energy}`)
  console.log(`    Quotes: ${result.profile.all_quotes.length}`)
  console.log(`\n  Saved to: ${filepath}`)
}

async function main() {
  const args = process.argv.slice(2)

  if (args[0] === '--all') {
    const users = await getAllUsers()
    let tested = 0
    for (const u of users) {
      const memos = await getUserVoiceMemos(u.id)
      if (memos.some(m => m.transcript && m.transcript.trim().length > 0)) {
        await runBacktest(u.id)
        tested++
      }
    }
    console.log(`\nBacktested ${tested} users. Results in ${resultsDir}/`)
  } else if (args.length === 1) {
    await runBacktest(args[0])
  } else {
    console.log('Usage:')
    console.log('  npx tsx src/scripts/backtest-extraction.ts <user_id>')
    console.log('  npx tsx src/scripts/backtest-extraction.ts --all')
    console.log()
    console.log(`Current config: Pass 1 ${EXTRACTION_CONFIG.pass1.version}, Pass 2 ${EXTRACTION_CONFIG.pass2.version}`)
  }
}

main().catch(console.error)
