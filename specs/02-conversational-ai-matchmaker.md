# Proposal 2: Conversational AI Matchmaker — The Voice-Native Intelligence Layer

## The One-Sentence Version

Replace the questionnaire-with-voice-input model with an actual AI conversational partner that interviews users, delivers matches via personalized audio, conducts post-date debriefs, and builds an evolving relationship with each user over time.

---

## Why This Exists

PLY's thesis page says: "Narrative, not data." But the current system *collects data* (voice recordings processed into structured JSON) and *outputs narrative* (AI-generated text cards). The user's experience is still fundamentally form-like: record a clip for this prompt, record a clip for that prompt, wait for a text card.

The old Google Form was 30 questions. The current onboarding is 6 voice prompts. Both are questionnaires — one typed, one spoken. Neither is a conversation.

A real matchmaker doesn't hand you a form. They sit with you, listen, ask follow-ups, notice what you light up about, probe the things you gloss over. They remember what you said three weeks ago and connect it to something you said today. They deliver an introduction by *telling you a story*, not showing you a card.

The entire product should feel like a relationship with a person who knows you deeply and is genuinely invested in finding you the right partner.

---

## What We're Building

### Component 1: Adaptive Conversational Onboarding

**Current flow:** User sees prompt → records voice memo → moves to next prompt → repeat 2-6 times.

**New flow:** User opens a voice conversation with the matchmaker. The matchmaker has a personality, a voice, and a conversational style. The conversation is guided but adaptive.

**How it works:**

The AI matchmaker has a conversation plan — topics it needs to cover to build a complete composite profile. But the ORDER and DEPTH of those topics adapts to what the user says.

```
Conversation plan (internal state):

Tier 1 — Self-Expansion Signals:
- [ ] Novel expertise / worlds they inhabit (what do they know deeply?)
- [ ] Growth trajectory (where are they headed, not just where they are?)
- [ ] Passions and interests (what lights them up?)

Tier 2 — I-Sharing Signals:
- [ ] Humor signature (what SPECIFICALLY makes them laugh — not category, but examples)
- [ ] Aesthetic/sensory resonance (what moves them, what they notice, what gives them chills)
- [ ] Emotional processing style (logic-first or emotion-first? Process by talking or doing?)

Tier 3 — Admiration Signals:
- [ ] Values-in-action (stories of values being lived, not stated)
- [ ] Demonstrated competence (mastery stories — what have they gotten really good at?)
- [ ] What they admire in others (reveals their own value hierarchy)

Tier 4 — Comfort/Stability Signals:
- [ ] Warmth signal (empathy, care for others)
- [ ] Vulnerability signal (growth edges, fears, what they're working on)
- [ ] Attachment behaviors (how they handle closeness, space, reassurance)
- [ ] Communication style (how they express themselves naturally)
```

> **Research mapping:** These tiers correspond to the four matching vector tiers from the dating research synthesis (Aron & Aron self-expansion model, Pinel I-sharing, mate-value signaling, Bowlby attachment theory). Each tier maps to a distinct mechanism that creates romantic chemistry. [Ref: dating_app_research.docx.md, Part 5]

The matchmaker opens with something warm and low-stakes:

> "Hey, I'm really glad you're here. Before we get into anything, I'm curious — what's something that happened recently that made you genuinely smile?"

From the user's response, the system extracts signals AND decides what to explore next. If the user tells a story about their kid doing something funny → follow up on family, warmth, humor. If they mention a work achievement → follow up on ambition, what drives them. If they deflect with something vague → gently probe for specificity.

**Key follow-up patterns:**

| User says... | System recognizes... | Follow-up direction |
|---|---|---|
| "I love hiking" | Generic interest, no signal yet | "What is it about hiking specifically — the solitude, the views, the physical challenge?" |
| "I just got promoted" | Ambition signal, but surface | "Congrats. What did getting there cost you? Was it worth it?" |
| "I'm really close with my family" | Warmth signal, but cliche | "Tell me about a time one of them surprised you." |
| "Honestly, I'm kind of nervous" | Vulnerability, authentic | "That's a really good sign, actually. The people who are a little nervous tend to care more. What made you decide to try this?" |

**I-Sharing extraction questions** (weave in naturally, don't rapid-fire):

| Question | What it extracts |
|---|---|
| "What's the last thing that gave you actual chills?" | Aesthetic/sensory resonance |
| "When you walk into a room, what do you notice first?" | Perceptual style, sensory priorities |
| "What kind of moment makes you grab someone's arm and say 'did you SEE that'?" | I-sharing fuel — what triggers shared experience |
| "What's something that cracks you up that other people don't find funny?" | Humor signature granularity |
| "When something hits you emotionally, do you need to talk about it right away or sit with it first?" | Emotional processing style |

> **Research basis (Pinel et al., 2006-2018):** I-sharing — believing you share an identical subjective experience with someone — increases liking even for objectively dissimilar people. It's the "click" people describe but can't explain. These questions surface the raw material for I-sharing matches. [Ref: dating_app_research.docx.md, Missing Mechanism 3]

**Attachment-revealing questions** (behavioral, never clinical labels):

| Question | What it extracts |
|---|---|
| "When someone you're seeing goes quiet for a day, what's your first thought?" | Anxious vs. secure attachment response |
| "How do you handle it when someone needs more space than you expected?" | Comfort-with-independence |
| "What does reassurance look like to you — what actually makes you feel better?" | Reassurance-seeking style |
| "When things get tense in a relationship, are you the person who wants to talk it out right now or take a breather first?" | Conflict approach, pursuit/withdrawal pattern |

> **Research basis (Bowlby; Hazan & Shaver, 1987):** Attachment style combinations predict relationship dysfunction patterns. Assessed behaviorally, not clinically — the system stores comfort-with-closeness, comfort-with-independence, and reassurance-seeking as continuous dimensions, never labels like "anxious" or "avoidant." [Ref: dating_app_research.docx.md, Part 5 Tier 4]

**What the system is doing under the hood:**

1. Real-time speech-to-text (streaming, not batch)
2. After each user turn: run extraction on the new content (what signals did this add?)
3. Check conversation plan: which topics still need coverage?
4. Generate next question based on: (a) what they just said, (b) what's still uncovered, (c) conversational flow (don't whiplash between topics)
5. Text-to-speech the response and stream it back

**Conversation length:** Target 8-12 minutes. The system tracks signal coverage and gently wraps when it has enough: "I feel like I'm getting a really good picture of who you are. One last thing — what's the quality in other people you admire most?"

**Session breaks:** Users can pause and come back. The matchmaker remembers: "Hey, welcome back. Last time we were talking about your move to Denver and what that meant for you. I wanted to follow up on something..."

### Component 2: Matchmaker Voice and Personality

The matchmaker needs to be a *character*, not a generic AI assistant.

**Voice:** Warm, mid-tempo, slight smile in the delivery. Not a radio announcer. Not a therapist. Think: your most perceptive friend who also happens to have great taste in people. Consistent across all interactions — the same "person" every time.

**Personality traits:**
- Genuinely curious (asks real follow-ups, not rote)
- Gently direct (will call out vagueness: "That sounds like something you'd put on a resume. Tell me the real version.")
- Warm but not saccharine (no "that's amazing!" after every response)
- Has a sense of humor (can match the user's energy — dry with dry people, playful with playful people)
- Remembers everything (references past conversations naturally)

**The matchmaker's primary design goal is COMFORT.**

> **Research basis (Liepmann et al., 2025):** Comfort is the 3rd most cited element of romantic chemistry — feeling at ease, authentic, easy communication. Dating apps create the OPPOSITE: constant evaluation, rejection, choice overload. The matchmaker must be the antidote. Every interaction should make the user feel less evaluated and more understood. [Ref: dating_app_research.docx.md, Missing Mechanism 4]

The conversation should feel like talking to someone who already likes you and is rooting for you. Not an interviewer assessing your dateability. The matchmaker's warmth should make users practice being authentic — because that's who they need to be on the date.

**What the matchmaker NEVER does:**
- Judges ("That's interesting" in a way that implies the opposite)
- Flatters inauthentically ("Wow, you sound like an AMAZING person!")
- Therapizes ("It sounds like you might have some attachment issues")
- Rushes ("Great, next question...")
- Breaks character (no "As an AI language model...")
- Creates an evaluation frame ("Tell me why someone should want to date you")

### Component 3: Voice-Native Match Delivery

**Current flow:** User opens dashboard → sees text card with narrative → reads → decides.

**New flow:** User gets a notification: "Your matchmaker has an introduction for you." They open the app and hear:

> "So, I want to tell you about someone. Her name is Sarah. You know how you told me that the thing you respect most in people is when they commit to something hard even when no one's watching? Sarah said something in our conversation that stopped me — she talked about training for an ultramarathon, and the part she focused on wasn't the race. It was the 4 AM runs in the rain when nobody knew she was out there. I think you two would have a lot to talk about."

**This is fundamentally different from a text card.** The matchmaker is *telling you about someone they know*, drawing a specific connection to something *you* said. It's the friend-at-a-dinner-party experience from the thesis, literally enacted.

**Technical flow:**
1. Matching engine selects best candidate (Proposal 1)
2. Narrative engine generates the script (Proposal 4)
3. TTS renders the script in the matchmaker's voice
4. Audio is stored and served when user opens the app
5. After listening, user sees a minimal visual: first name, one photo (or no photo — reveal comes later), and Like/Pass buttons

**The text narrative still exists** as a fallback and reference — users can read it after listening. But the primary experience is audio.

### Component 4: Post-Date Conversational Debrief

**Current spec (unbuilt):** Post-date safety questionnaire — checkboxes about physical safety, accuracy, willingness to recommend.

**New approach:** The matchmaker checks in conversationally.

> "Hey, I heard you had your date with Marcus last night. How'd it go? And I mean really — not the Instagram version."

**What the system extracts from the debrief:**

| Signal | How it feeds back |
|---|---|
| Physical safety | Trust/safety scoring (Proposal 3) |
| "He was taller/shorter than expected" | Photo accuracy flagging |
| "The conversation flowed really well" | Mutual Like → high-quality match confirmation |
| "He was nice but I didn't feel a spark" | Embedding model learns: compatibility ≠ chemistry |
| "I want to see them again" | Strongest positive signal — upweight this pairing's features |
| "The thing about him that surprised me was..." | Novel data for the OTHER person's profile |
| "We both started laughing at the exact same thing" | I-sharing confirmation — strongest chemistry signal |
| "I felt really comfortable, like I could just be myself" | Comfort/safety confirmation — validates attachment compatibility |

**Critical insight:** Post-date debriefs generate data about *both* people, not just the person talking. When Sarah says "Marcus was more thoughtful than I expected from his profile," that updates Marcus's composite profile. This is data you can't get any other way.

**The debrief should use "What surprised you?" as the primary question** — not "How was it?" or "Rate your date." Surprise reveals where the match hypothesis was right or wrong, and it bypasses the garbage-data problem of asking people to evaluate (Eastwick & Finkel, 2008). [Ref: dating_app_research.docx.md, Part 6 Feedback Loop Design]

### Component 5.5: Friend Vouch Feature

**The concept:** Users can invite a friend to record a 60-second voice memo answering: "What's the thing about [Name] that people don't see right away?"

**Why this matters:** Social proof carries more credibility than self-report. "The thing about Marcus is he remembers everything you tell him, and three months later he'll reference something you said in passing" — this is an admiration signal that Marcus could never credibly say about himself. [Ref: dating_app_research.docx.md, Part 5 Tier 3 — Social Proof Narrative]

**How it works:**
1. User sends an invite link to a friend (text/email)
2. Friend opens link → records 60-second voice memo → submits
3. Memo goes through same extraction pipeline: transcription → trait extraction
4. Extracted signals merge into the user's composite profile with a `source: friend_vouch` tag
5. Notable quotes from friend vouches get priority in narrative generation (Spec 04) because third-party credibility > self-report

**Rules:**
- Maximum 3 friend vouches per user (diminishing returns after that)
- Friends cannot vouch for someone they're also matching with on the platform
- Vouch content is NEVER shown raw to matches — it's extracted and woven into narratives
- Optional but highly encouraged: "Profiles with friend vouches get 40% more interest" (once validated)

### Component 6: Ongoing Relationship

The matchmaker isn't just for onboarding and match delivery. It becomes an ongoing presence:

- **Weekly check-in:** "How's your week been? Anything on your mind?" (feeds Proposal 5 — Living Profile)
- **Post-pass reflection:** "You passed on the last three intros. Not judging — but I want to make sure I'm reading you right. What's missing?"
- **Celebration:** "I noticed you and Jordan scheduled a third date. I'm really happy about that one."
- **Re-engagement:** "It's been a while since we talked. Whenever you're ready, I'm here."

---

## What RIGHT Looks Like

### The conversation feels natural, not scripted
- Users forget they're talking to an AI within the first 2 minutes
- The system responds to WHAT THEY ACTUALLY SAID, not to keyword triggers
- Follow-up questions reference specific things the user mentioned, not generic prompts
- The conversation has natural rhythm — the matchmaker doesn't ask a question every turn; sometimes it reflects, sometimes it shares a brief observation

### The matchmaker has memory and continuity
- "Last week you mentioned you were nervous about trying this. How are you feeling now?"
- "When I introduced you to Marcus, you said you loved that he was into woodworking. I have someone else who makes things with their hands, but in a completely different way..."
- References to past conversations feel organic, not retrieved-from-database robotic

### Audio quality is indistinguishable from a real person
- Consistent voice across all interactions (same timbre, cadence, personality)
- Natural prosody — emphasis on the right words, pauses for effect
- Emotional range — warm when celebrating, gentle when probing, excited when introducing a great match
- No uncanny valley — if the TTS can't hit this bar, the feature isn't ready

### The extraction is BETTER than the current pipeline
- Conversational data yields richer signals than prompted recordings because follow-ups go deeper
- The system captures things people wouldn't put in a questionnaire: hesitations, topic avoidance, what they light up about vs. what they report dutifully
- Composite profiles from conversational onboarding have higher completion rates on all signal dimensions

### Users actively look forward to interactions
- The matchmaker check-in isn't a chore — it's something they want to engage with
- Re-engagement rates after the conversational matchmaker are higher than after text notifications
- Users tell friends about "their matchmaker" as a character, not as an app feature

---

## What WRONG Looks Like

### The uncanny valley chatbot
**The failure:** The matchmaker sounds like a customer service bot with a personality veneer. "That's great to hear! Now, tell me about your values!" Users feel patronized and disengage faster than they would with a simple form.

**Why it happens:** Treating the conversation as a structured interview with natural language glue instead of an actual adaptive conversation. The follow-ups are templated ("Tell me more about that"), the transitions are abrupt, and the emotional register is flat.

**How to prevent it:**
- The conversational AI must have access to the FULL conversation history, not just the last turn
- Follow-up generation should reference SPECIFIC words and phrases from the user's response
- Build a library of 100+ real matchmaker conversations (human-written) as few-shot examples for the LLM
- Extensive user testing with the question: "Did this feel like talking to a person or a system?" If more than 30% say "system," it's not ready
- The matchmaker should occasionally say unexpected things: "Wait, go back — you said that so casually but I think there's a story there"

### Privacy violation feeling
**The failure:** Users feel surveilled, not supported. The matchmaker "remembers too much" or references things the user said in a way that feels creepy rather than attentive. "Last week you seemed stressed when you mentioned your ex" — that's a therapist move, not a friend move.

**Why it happens:** The system treats all conversational data as equally fair game for reference. But there's a difference between "you mentioned you love cooking" (safe) and "you sounded sad when you talked about your last relationship" (intimate).

**How to prevent it:**
- Categorize extracted signals by sensitivity: interests/hobbies (low), values/goals (medium), emotional states/past relationships (high)
- High-sensitivity signals feed the matching model but are NEVER directly referenced by the matchmaker unless the user brings it up again
- The matchmaker references *content* ("you mentioned hiking"), not *emotional states* ("you seemed excited about hiking")
- Give users a "what does my matchmaker know about me?" view where they can see and delete anything

### Conversation that goes nowhere
**The failure:** The matchmaker is so focused on being natural that it forgets to collect the data it needs. A 12-minute conversation yields less signal than the current 6 voice prompts because the user chatted about surface-level topics and the AI didn't steer.

**Why it happens:** Optimizing for conversational quality without tracking signal coverage. The system is "nice" but not "useful."

**How to prevent it:**
- Internal signal coverage tracker runs after every turn: "Which of the 7 signal domains have sufficient data?"
- If coverage is below threshold at minute 8, the matchmaker gently steers: "I love hearing about your weekend plans. Can I shift gears for a second? I want to ask you something that might be a little more personal."
- Every conversation has a minimum signal threshold it must hit before the system considers onboarding complete
- A/B test: compare composite profile completeness between conversational vs. prompted approaches. If prompted wins, the conversation isn't doing its job

### Latency that kills the magic
**The failure:** User finishes speaking, then waits 3-5 seconds for the matchmaker to respond. The "thinking" pause destroys the conversational illusion.

**Why it happens:** Pipeline: speech-to-text (500ms) → extraction (200ms) → conversation planning (500ms) → response generation (1000ms) → TTS (500ms) = 2.7 seconds minimum. Add network latency and it's 3-4 seconds.

**How to prevent it:**
- Stream EVERYTHING. STT streams as user speaks. Start generating response before user finishes (predict likely ending). Stream TTS as response generates.
- Use filler patterns: the matchmaker can say "Hmm" or "Yeah" immediately while the real response generates — this is what real humans do
- Target < 1.5 second response latency for 90th percentile
- If the system needs more time, the matchmaker says something authentic: "Let me think about that for a second..." (buys 2-3 seconds naturally)
- Measure and alert on p95 latency. If it crosses 2 seconds, something is broken.

### Cost explosion
**The failure:** Real-time conversational AI with streaming STT + LLM + TTS for every interaction, for every user, costs $5-10 per onboarding session and $1-2 per match delivery. At scale, this is unsustainable.

**Why it happens:** The obvious architecture uses frontier models for everything: Claude Opus for conversation, highest-quality TTS for voice, real-time Whisper for transcription.

**How to prevent it:**
- Conversation AI: Use Claude Haiku or a fine-tuned smaller model for turn-by-turn responses. Reserve Opus-class for the initial conversation planning and final composite extraction
- TTS: Pre-render common phrases and transitions. Only generate novel audio for match-specific content
- Cache aggressively: the matchmaker's opening line, transition phrases, and closing are always the same — render once, reuse forever
- STT: Use the cheapest real-time option (Deepgram, AssemblyAI) for streaming, not Whisper
- Budget target: < $0.50 per onboarding conversation, < $0.05 per match audio delivery
- Track cost-per-user-per-month and set hard alerts

---

## Technical Architecture

### Real-Time Conversation Stack

```
User's microphone
      │
      ▼
Streaming STT (Deepgram/AssemblyAI)
      │ (partial transcripts arrive every 200-500ms)
      ▼
Turn Detection (silence > 1.5s = turn complete)
      │
      ▼
┌─────────────────────────────────┐
│  Conversation Engine (LLM)       │
│                                  │
│  Inputs:                         │
│  - Full conversation history     │
│  - Signal coverage state         │
│  - User's composite (so far)     │
│  - Conversation plan             │
│                                  │
│  Outputs:                        │
│  - Next response text            │
│  - Updated signal coverage       │
│  - Extracted traits from turn    │
│  - Internal notes for matching   │
└─────────────────────────────────┘
      │
      ▼
Streaming TTS (ElevenLabs / Azure Neural Voice)
      │
      ▼
User's speaker
```

### Audio Match Delivery Pipeline

```
Match selected (from Proposal 1)
      │
      ▼
Narrative script generated (from Proposal 4)
      │
      ▼
Script personalization:
  - Insert recipient's name
  - Reference recipient's past conversation moments
  - Reference subject's notable quotes
      │
      ▼
TTS render (matchmaker voice)
      │
      ▼
Audio stored in Supabase Storage
      │
      ▼
Push notification → user opens app → audio plays
      │
      ▼
User sees: first name + Like/Pass
(photo reveal is separate, deliberate action)
```

### State Management

Each user has a `matchmaker_state` record:

```
{
  conversation_history: [...],     // full transcript of all conversations
  signal_coverage: {               // which domains have data
    warmth: 0.8,
    humor: 0.6,
    depth: 0.9,
    ambition: 0.4,                 // needs more coverage
    vulnerability: 0.7,
    self_expansion: 0.9,
    communication_style: 0.8
  },
  conversation_count: 3,
  last_conversation_at: "...",
  matchmaker_notes: [              // internal observations
    "Gets animated about cooking — possible passion indicator",
    "Deflected when asked about long-term goals — revisit",
    "Humor style: self-deprecating with warmth"
  ],
  sensitivity_tags: {              // what NOT to reference directly
    mentioned_ex: true,
    mentioned_health_issue: false,
    expressed_insecurity_about: ["height", "career change"]
  }
}
```

---

## Phasing

**Phase A: Audio match delivery only** (easiest, highest impact)
- Generate match narratives as audio using TTS
- Keep current prompted voice memo onboarding
- This is a feature, not a rearchitecture

**Phase B: Post-date conversational debrief**
- After a date, user gets a voice check-in
- Semi-structured: matchmaker asks 3-4 questions, extracts signals
- This generates the highest-value training data

**Phase C: Conversational onboarding**
- Full adaptive conversation replaces fixed prompts
- This is the big UX shift and needs the most testing

**Phase D: Ongoing relationship**
- Weekly check-ins, longitudinal personality tracking
- Matchmaker references past conversations naturally
- This requires the most sophisticated memory management

Build A first. It's a single-weekend project that dramatically changes the product feel. B generates data. C is the big bet. D is the long game.
