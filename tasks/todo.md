# Voice prompts v4 — plain voice, ~100 prompts, real-recording test

Started 2026-09-02. Decisions from Charles (chat, 2026-09-02): apply copy now, before testing; voice = plainer and warmer; bank stays ~100 so different people answer different things; prune by ignore-rate, never by taste; Charles records with wife, brother and friends.

## Hard constraints (check every item against these)
- Bank stays at ~100 prompts total. Never propose shrinking it.
- Voice: plain and warm. A wink is allowed in the `fun` tier only.
- Every prompt clears the v3 structural floor: protagonist, no superlatives, "the last" only when live / high-frequency / landmark-marked.
- App copy stays community-generic (no LDS branding inside the app).
- One variable per test split.

## Checklist
- [x] P0a `extraction.ts` resolves fished + nerd-out prompt text (was told "fished_Q11_4") *(2026-09-02, session branch)*
- [x] P0b ProfileTab renders fished prompt text instead of the raw id *(2026-09-02)*
- [x] P0c Instrument the voice step before Charles records: picker impression, pick, skip-after-open, seconds from prompt open to record, re-record count. PostHog `track` events + columns on `prompt_metrics`.
- [x] P1a Nerd-out gets its second clause *(2026-09-02)*
- [x] P1b Fished 38 → v3 structure in plain voice, reconciled to the CURRENT quiz options (Q4:3, Q9:3, Q11:2 have no v3 text; write new). Update `specs/matching-v2-voice-prompt-map.md` and the copy-freeze suite together.
- [x] P1c Bank → plain voice. Fold collapsed constructs (rabbit_hole/obsession vs nerd-out; taught_yourself/figured_it_out; hardest_thing/superpower/mentor_moment). Re-aim comfort at warmth. Grow to ~100 total with construct-family caps (witness device ≤15%). Examples rewritten as a person talking, two sentences, no button. Short labels reviewed.
- [ ] P1d Full set to Charles for review before it ships.
- [x] P2 Test protocol written (EXECUTION.md STATE 2026-09-02) (who, n, split, what's measured, how the pitches are read).
- [ ] P3 Push to staging, verify the new copy serves, Charles records.
- [ ] P4 Read transcripts + pitches → decisions; register the example on/off split with the growth cockpit if the key is available.

## Review
- 2026-09-02: instrumentation + v4 copy built on the session branch, 100 prompts (60 + 38 + nerd-out). Correction captured: interiority-coded copy loses men (lessons.md). Waiting on Charles's read of the full set (P1d) before P3.
