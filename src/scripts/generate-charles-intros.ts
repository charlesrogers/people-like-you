/**
 * Generate 10 intro variations for Charles using different hook types.
 * Outputs an HTML file for review.
 */

import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { getUser, getCompositeProfile } from '../lib/db'

const anthropic = new Anthropic()
const CHARLES_ID = 'f4de7e33-17d0-4be2-be97-bb4fb76bf8e9'

const hookTypes = [
  { name: 'The Moment', instruction: 'Open with a vivid specific scene from his life — a moment in time, described like a movie.', requiredTranscripts: '5, 11, 8' },
  { name: 'The Quote', instruction: 'Lead with his most striking actual quote. Let his words do the talking.', requiredTranscripts: '1, 8, 9' },
  { name: 'The Contradiction', instruction: 'Open with two things about him that seem like they shouldn\'t go together — but do.', requiredTranscripts: '7, 11, 3' },
  { name: 'The Mystery', instruction: 'Hint at something intriguing about him without explaining it. Make the reader NEED to find out.', requiredTranscripts: '8, 12, 7' },
  { name: 'The Credential', instruction: 'Open with something specific he has accomplished or built that earns immediate respect.', requiredTranscripts: '8, 9, 10' },
  { name: 'The Warmth', instruction: 'Open with how he makes other people feel — a specific moment of kindness or connection.', requiredTranscripts: '11, 5, 10' },
  { name: 'The Scene', instruction: 'Paint a picture of what it\'s like to spend time with him. Make the reader feel like they\'re there.', requiredTranscripts: '4, 1, 11' },
  { name: 'The Hot Take', instruction: 'Open with his boldest opinion or most provocative stance. Make it impossible not to react.', requiredTranscripts: '7, 1, 2' },
  { name: 'The Friend Pitch', instruction: 'Write it as if his best friend is telling someone about him. Casual, specific, credible.', requiredTranscripts: '11, 8, 4' },
  { name: 'The Slow Burn', instruction: 'Start quiet and build. The first sentence is understated. Each sentence reveals more until the reader realizes this person is extraordinary.', requiredTranscripts: '10, 9, 8' },
]

async function main() {
  const user = await getUser(CHARLES_ID)
  const composite = await getCompositeProfile(CHARLES_ID)

  if (!user || !composite) {
    console.error('Could not find Charles or his composite profile')
    return
  }

  // Gather all data about Charles
  const data = `
ABOUT CHARLES:
- Passions: ${composite.passion_indicators?.join(', ') || 'unknown'}
- Values: ${composite.values?.join(', ') || 'unknown'}
- Interests: ${composite.interest_tags?.join(', ') || 'unknown'}
- Humor: ${composite.humor_style || 'unknown'}
- Quotes: ${composite.notable_quotes?.map(q => `"${q}"`).join(' | ') || 'none'}
- Kindness: ${composite.kindness_markers?.join(', ') || 'unknown'}

RAW VOICE MEMO TRANSCRIPTS (use these as primary source):

1. CONSPIRACY/HOT TAKE: "My conspiracy theory is that Anne Frank wasn't real, and my hot take that I'm willing to die on is that Apples to Apples should be banned."

2. DISAGREE: "When I disagree with someone, I figure out, I tell them directly that they're wrong."

3. HELPED SOMEONE: "Oh, I guess one time there was a lady in a wheelchair and she really needed help getting somewhere, and so I, like, pushed her there. She was just so grateful. I didn't, it didn't seem like much, but it really made a big difference to her."

4. CITY TOUR: "I'm taking them to Tim Ho Wan, and then like four more Chinese restaurants, so we can do a Chinese food crawl."

5. COMFORT FOOD: "Well, my comfort food is my friend Brenda's cookies. She gave me the recipe, but when we lived in New York City, I would go to her house on Sundays and she would just make the cookie dough and give it to me so I could just eat it without having to make the cookies. And that was fantastic."

6. BUCKET LIST: "Bought chickens, bought fruit trees, bought a house."

7. UNPOPULAR OPINION: "My most popular unpopular opinion is that I think Utah should be a theocracy and be governed by the church."

8. BUILDING RIGHT NOW: "I'm building a lot of different apps. Since the advent of AI, I've really gotten into building things. I'm really happiest when I'm building. I've built apps for my community, apps for my business, apps for fun, and I've built a dating app called People Like You."

9. BUCKET LIST (LONG): "Oh, buy a home on some land, get some chickens, plant some fruit trees that my grandkids — also, I'm gonna eat the fruit of."

10. RELATIONSHIP LESSON: "That if you're committed, you can make anything work."

11. GREEN FLAG: "A surprisingly specific thing to flag on a person is if they're willing to notice the quiet people and invite them in. Like if you're at a party and someone's standing alone, and they just go up and talk to them — that tells you everything."

12. DESERT ISLAND: "My Book of Mormon, sunscreen because I get burnt really easily, and then I guess a knife or something."
  `.trim()

  console.log('Generating 10 intros...')

  const intros: { hookType: string; narrative: string; criticScore?: number }[] = []

  for (const hook of hookTypes) {
    console.log(`  Generating: ${hook.name}...`)
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are writing an introduction for a dating app that makes Charles sound like the most fascinating person someone hasn't met yet. This is a trailer, not a profile summary.

${data}

HOOK TYPE: ${hook.name}
${hook.instruction}

MANDATORY: You MUST use data from transcripts #${hook.requiredTranscripts || '7, 8, 11'} as primary material for this intro. You may reference others too, but these MUST appear.

STRUCTURE (all 4 layers required — LABEL EACH ONE):
**[HOOK]** (1 sentence): ${hook.instruction}
**[STORY]** (2-3 sentences): A specific anecdote that shows his character through ACTION. Not adjectives — the actual thing he did. Use his words.
**[PROOF]** (1 sentence): A concrete accomplishment, thing he built, or how others see him that earns respect.
**[CLOSE]** (1 sentence): End with a concrete statement or image — NOT a rhetorical question. Paint a picture of what knowing this person is like, or land on a vivid detail that stays with you.

After the intro, add on a new line:
STRATEGY: [Explain in 1-2 sentences which psychological triggers you used and why you chose this specific combination of facts]

TONE RULES (CRITICAL — violating these makes the intro trash):
1. NEVER BRAGGY. If a story makes him sound like he's announcing his own virtue, you've failed. Show actions, don't celebrate them. The wheelchair story told as "he selflessly helped" is BRAGGY. Just show what happened.
2. NEVER PERSONIFY THE APP. Do NOT say "you need to meet" or "okay so there's this guy." This is a piece of writing, not a conversation. No narrator voice.
3. CONTRADICTION > SINGLE NOTE. Intros that show tension between two sides of someone are more compelling than developing one theme.
4. CLOSE WITH A VIVID IMAGE OR JOKE, NEVER SENTIMENT. Example of GOOD close: "He'll tell you with complete sincerity that Anne Frank wasn't real, and then — in the same breath, with the same gravity — that Apples to Apples should be banned, and you will not be able to tell which one he's more serious about." Example of BAD close: "one fruit tree, one Sunday, one finished thing at a time."
5. DON'T EXPLAIN THE MEANING. Show behavior, don't interpret it. "He goes up and talks to them" — STOP. Don't add "that tells you everything about a person."
6. FRAME ACCOMPLISHMENTS AS CREATION, NOT EGO. "Built something that didn't exist before" >> "happiest when building."
7. NO SACCHARINE. If the last sentence could go on a Hallmark card, delete it and try again.
8. SPECIFICS > PATTERNS. "Tim Ho Wan and then four more Chinese restaurants" >> "he loves food."

EXAMPLE OF A GOOD STORY SECTION:
"He's happiest when he's building — apps for his community, apps for his business, apps just for the fun of it — and somewhere in between, he bought a house and put chickens in the yard and got the trees in the ground, because he thinks that way, in decades, in people who haven't been born yet. The kind of friend who shows up every Sunday, who gets taken to Tim Ho Wan and then four more Chinese restaurants because that's just how Charles shares something he loves."
WHY THIS WORKS: Lists specific things without sounding like a resume. Connects actions to HOW HE THINKS (in decades) not WHAT HE DID. Shows warmth through pattern, not virtue stories.

STORY-SPECIFIC RULES:
- WHEELCHAIR: Do NOT use this story to make him sound virtuous or humble. If you use it at all, it's about how small things carry weight — NOT about him being a good person.
- COOKIE DOUGH: Brenda gave it to HIM. He didn't help her. It's about being truly known by someone. Don't make him sound obsessed with Brenda.
- CHICKENS/FRUIT TREES/HOUSE: This is about thinking in GENERATIONS (grandkids eating the fruit), not about "building things" or a "grocery list."
- ANNE FRANK / APPLES TO APPLES: The humor is the PAIRING — one shocking, one absurd, same gravity. This is a CLOSE, not a hook, unless you can make it work.
- BUILDING APPS: Frame as "creating things that didn't exist before" — NOT as a career flex. He built a dating app called People Like You. He built apps for his community. The point is he sees gaps and fills them.
- UTAH THEOCRACY: This is a bold, funny opinion. Use it as color, not as a political statement.
- NOTICING QUIET PEOPLE: Do NOT quote him saying "that tells you everything." Just show the behavior. Don't make it sound like self-congratulation.

FORMAT:
- 5-7 sentences total.
- NEVER describe physical appearance.
- NEVER use generic phrases like "passionate" or "driven" or "looking for someone."
- Use his ACTUAL WORDS when possible.
- Do NOT mention the reader. This is about Charles.
- Do NOT start with "Meet Charles" or "Imagine someone."`,
      }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
    intros.push({ hookType: hook.name, narrative: text })
  }

  // Build HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Charles — 10 Intro Variations</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Jost', 'Futura', system-ui, sans-serif; background: #e3ff44; color: #1a1a1a; padding: 40px 20px; }
    h1 { font-size: 2.5em; font-weight: 800; text-align: center; margin-bottom: 8px; }
    .subtitle { text-align: center; font-size: 1.1em; opacity: 0.5; margin-bottom: 40px; }
    .card { background: white; border-radius: 24px; padding: 32px; margin-bottom: 24px; max-width: 640px; margin-left: auto; margin-right: auto; box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
    .hook-type { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 4px; }
    .hook-desc { font-size: 11px; color: #bbb; margin-bottom: 16px; font-style: italic; }
    .narrative { font-size: 16px; line-height: 1.7; color: #333; }
    .number { font-size: 48px; font-weight: 800; opacity: 0.08; position: absolute; top: 16px; right: 24px; }
    .card-inner { position: relative; }
    .vote { display: flex; gap: 8px; margin-top: 20px; }
    .vote button { flex: 1; padding: 12px; border: none; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .vote .fire { background: #1a1a1a; color: white; }
    .vote .fire:hover { background: #333; }
    .vote .meh { background: #f5f5f5; color: #888; }
    .vote .meh:hover { background: #eee; }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <h1>Selling Charles</h1>
  <p class="subtitle">10 intro variations — which ones make you want to 🔥?</p>

  ${intros.map((intro, i) => `
  <div class="card">
    <div class="card-inner">
      <div class="number">${i + 1}</div>
      <div class="hook-type">${intro.hookType}</div>
      <div class="hook-desc">Strategy: ${hookTypes.find(h => h.name === intro.hookType)?.instruction.slice(0, 80) || ''}</div>
      <div class="narrative">${
        // Split narrative from strategy annotation
        (() => {
          const parts = intro.narrative.split(/STRATEGY:/i)
          const narrative = parts[0].trim()
          const strategy = parts[1]?.trim() || ''
          return `${narrative.replace(/\*\*\[(\w+)\]\*\*/g, '<span style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:1px;display:block;margin-top:12px;margin-bottom:2px">$1</span>').replace(/\n/g, '<br>')}`
            + (strategy ? `<div style="margin-top:16px;padding-top:12px;border-top:1px solid #eee;font-size:12px;color:#999;line-height:1.5"><strong>Strategy:</strong> ${strategy}</div>` : '')
        })()
      }</div>
      <div class="vote">
        <button class="fire" onclick="this.textContent='🔥 Would fire!'">🔥 Tell me more</button>
        <button class="meh" onclick="this.textContent='👋 Passed'">👋 Pass</button>
      </div>
    </div>
  </div>
  `).join('')}
</body>
</html>`

  const outPath = path.join(process.cwd(), 'charles-intros.html')
  fs.writeFileSync(outPath, html)
  console.log(`\nDone! Open: ${outPath}`)
}

main().catch(console.error)
