/**
 * Test the v2 intro engine on fake profiles.
 *
 * Usage:
 *   npx tsx src/scripts/test-intro-v2.ts <subject_name> <reader_name>
 *   npx tsx src/scripts/test-intro-v2.ts --all
 */

import { getAllUsers, getCompositeProfile } from '../lib/db'
import { generateTrailer } from '../lib/intro-engine-v2'
import type { User, CompositeProfile } from '../lib/types'

async function testPair(subjectName: string, readerName: string) {
  const users = await getAllUsers()
  const subject = users.find(u => u.first_name === subjectName && u.is_seed)
  const reader = users.find(u => u.first_name === readerName && u.is_seed)

  if (!subject || !reader) {
    console.error(`Could not find ${subjectName} or ${readerName} in seed profiles`)
    return
  }

  const subjectProfile = await getCompositeProfile(subject.id)
  const readerProfile = await getCompositeProfile(reader.id)

  if (!subjectProfile || !readerProfile) {
    console.error('Missing composite profile')
    return
  }

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  Selling ${subject.first_name} to ${reader.first_name}`)
  console.log(`${'═'.repeat(60)}`)
  console.log(`  Subject: ${subject.first_name} (${subjectProfile.excitement_type})`)
  console.log(`  Reader: ${reader.first_name} (${readerProfile.excitement_type})`)
  console.log()

  const start = Date.now()
  const result = await generateTrailer(
    reader as User,
    subject as User,
    readerProfile as CompositeProfile,
    subjectProfile as CompositeProfile,
  )
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)

  console.log(`  📝 INTRO (v${result.version}, ${elapsed}s, critic: ${result.criticScore}/50):`)
  console.log(`  ┌${'─'.repeat(56)}┐`)
  for (const line of result.narrative.split(/(?<=\.) (?=[A-Z])/)) {
    console.log(`  │ ${line.trim()}`)
  }
  console.log(`  └${'─'.repeat(56)}┘`)
  console.log()
}

async function main() {
  const args = process.argv.slice(2)

  if (args[0] === '--all') {
    // Test a few key pairings
    const pairings = [
      ['Maya', 'Marcus'],    // explorer → nester (sell Maya to Marcus)
      ['Leo', 'Sophie'],     // spark → nester (sell Leo to Sophie)
      ['Emma', 'Kai'],       // intellectual → explorer (sell Emma to Kai)
      ['Daniel', 'Priya'],   // spark → intellectual (sell Daniel to Priya)
    ]
    for (const [subject, reader] of pairings) {
      await testPair(subject, reader)
    }
  } else if (args.length === 2) {
    await testPair(args[0], args[1])
  } else {
    console.log('Usage:')
    console.log('  npx tsx src/scripts/test-intro-v2.ts Maya Marcus')
    console.log('  npx tsx src/scripts/test-intro-v2.ts --all')
  }
}

main().catch(console.error)
