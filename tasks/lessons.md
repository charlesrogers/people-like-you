# Lessons Learned

Rules derived from mistakes in this project. Claude MUST review this file at the start of every session and follow these rules.

---

### 2026-03-24 — Claimed "live" without verifying Vercel deployment

**What went wrong:** Said code was "pushed and live" multiple times after `git push`, but Vercel wasn't auto-deploying from GitHub. Changes existed on GitHub but were not serving on people-like-you.com.

**Why it's wrong:** `git push` != deployed. Vercel can fail to auto-deploy, builds can error silently, and the production URL may still serve an old version. Telling the user "it's live" when it isn't wastes their time testing old code.

**Rule:** After every `git push`, run `npx vercel --prod` to force deploy, then `curl -s https://people-like-you.com/ | grep -o 'dpl_[A-Za-z0-9]*' | head -1` to verify the new deployment ID is serving. Never say "live" until confirmed.

**Category:** mistake

---

### 2026-03-24 — Async fire-and-forget dies on Vercel serverless

**What went wrong:** `processVoiceMemo()` was called as a fire-and-forget promise (`.catch()`) inside the voice-memo API route. Vercel kills the function context after the response is sent, so transcription never completed. 7 memos uploaded, 0 transcribed.

**Why it's wrong:** Vercel serverless functions terminate when the response is sent. Any async work after `return NextResponse.json(...)` is silently killed. This is a fundamental platform constraint.

**Rule:** Never use fire-and-forget async calls in Vercel API routes. Either process synchronously (with `maxDuration`), use a separate endpoint the client calls, or use Vercel's `waitUntil()` API. Always test the async pipeline on the actual deployment platform, not just locally.

**Category:** mistake

---

### 2026-03-24 — M4A audio format not recognized

**What went wrong:** `transcribeAudio()` checked `storagePath.endsWith('.mp4')` but Safari records as `.m4a`. All Safari recordings failed with "Audio file might be corrupted or unsupported."

**Why it's wrong:** Assumed only two formats (webm/mp4) without checking what the actual uploaded files look like. Should have queried storage to see real file extensions before writing format detection.

**Rule:** When writing format detection code, always check what actual data exists first (`ls` the storage bucket, query the DB for real file paths). Never assume you know all the formats — check the data.

**Category:** mistake

---

### 2026-03-24 — iOS Swift code didn't compile — 5 separate errors requiring user round-trips

**What went wrong:** Wrote TasteCalibrationView, ProfileRevealView, SeedNarratives, and OnboardingContainer for iOS without reading the existing Swift types (Gender enum, APIClient generic signatures, CompositeProfile Codable struct). Caused 5 compile errors: smart quotes in strings, struct field ordering, `[String: Any]` with typed generics, optional enum comparison, missing FlowLayout scope.

**Why it's wrong:** Each error required Charles to copy-paste the error, wait for a fix, rebuild, and report the next error. 5 round-trips that should have been 0. The existing codebase had all the information needed to write correct code on the first try.

**Rule:** Before writing ANY new Swift file for the iOS app, read these files first: (1) the Model file for any type you'll reference, (2) APIClient.swift for the API method signatures, (3) AppState.swift for enum cases and navigation. Use the exact types — never use `[String: Any]` when the API client uses `Codable` generics. Test string literals for special characters. Check struct field ordering matches initializer ordering.

**Category:** anti-pattern

---

### 2026-03-24 — Built soft preferences UI then had to delete it

**What went wrong:** Built the entire `SoftPreferencesRanker` component (humor style, energy vibe, communication style, life stage, date activities) as part of the onboarding flow. Charles later pointed out that the research (dating_app_research.docx.md) says stated preferences don't predict chemistry. Had to remove everything.

**Why it's wrong:** Built a feature without checking whether the research supported it. The spec document was available the whole time. Building first and checking research second wastes effort.

**Rule:** Before building any preference/matching feature, check dating_app_research.docx.md first. Ask: "Does the research say this signal is predictive?" If it's a stated preference, the answer is almost always no. Extraction from behavioral data (voice memos, click patterns) is preferred over stated preferences.

**Category:** anti-pattern

---

### 2026-03-24 — Positive: Research-grounded decision making

**What went right:** When Charles asked about adding more dealbreakers, humor matching, energy vibes, etc., I checked the research document and gave evidence-based answers. This prevented building several features that would have been wasted effort. The research check should happen BEFORE building, not after.

**Category:** positive-pattern

---

### 2026-03-24 — Positive: Taste calibration as processing buffer

**What went right:** When memos weren't processing fast enough, instead of adding loading spinners, designed the taste calibration step as a productive "buffer" that gives behavioral signal while processing runs in background. This turned dead time into useful time.

**Category:** positive-pattern

---

### 2026-03-25 — DB migrations not actually applied despite file headers saying "Applied"

**What went wrong:** Migrations 004-008 had "Applied: 2026-03-24" comments in the SQL files but were NOT actually in the Supabase database. Code shipped referencing columns (observance_level, zipcode, religion, hidden_depth, primary_energy, life_stage, etc.) that didn't exist. Every API call crashed with "Could not find column X in schema cache" — but with no try/catch, the error was swallowed as empty responses.

**Why it's wrong:** Trusted file comments over actual DB state. Never verified migrations were applied by querying the DB. Led to 5+ rounds of "fix → deploy → still broken → find next missing column."

**Rule:** Before shipping code that references a DB column, verify the column exists by querying the actual database (or checking Supabase schema cache). Never trust migration file comments. When multiple columns are involved, verify ALL of them before deploying.

**Category:** mistake

---

### 2026-03-25 — No try/catch in API routes = invisible errors

**What went wrong:** The `/api/profile` route had no try/catch. When Supabase threw (missing column), Next.js returned an empty response body, causing "Unexpected end of JSON input" on the client. Took multiple rounds to even SEE the error.

**Why it's wrong:** Without error handling, API routes fail silently on Vercel. The client gets an empty response, the error is invisible, and debugging requires adding error handling first before you can even start diagnosing.

**Rule:** Every API route that does DB operations MUST have a top-level try/catch that returns `NextResponse.json({ error: message }, { status: 500 })`. The catch must serialize the error properly: `(err instanceof Error ? err.message : typeof err === 'object' && err !== null && 'message' in err ? String(err.message) : JSON.stringify(err))`. Supabase errors are objects, not Error instances.

**Category:** anti-pattern

---

### 2026-03-25 — CHECK constraints vs. UI values mismatch

**What went wrong:** The onboarding UI sent `distance_radius: 'yes'/'maybe'/'no'` but the DB column had `CHECK (distance_radius IN ('same_metro','few_hours','anywhere'))`. Constraint violation → 500.

**Why it's wrong:** Added UI for a field without reading the DB constraint. The mapping between user-facing labels and DB values was never defined.

**Rule:** When adding UI that writes to a DB column with CHECK constraints, read the constraint first and ensure the values match. When in doubt, normalize server-side so both old and new client formats work.

**Category:** mistake

---

### 2026-03-25 — Vercel auto-deploy not connected; manual deploy required

**What went wrong:** After `git push origin main`, assumed Vercel would auto-deploy. It didn't — the Vercel GitHub integration isn't connected for this repo. Had to discover this after telling the user to retry.

**Why it's wrong:** Same lesson as 2026-03-24 but a different mechanism. The rule should be: always force deploy and verify.

**Rule:** For this project, ALWAYS run `npx vercel --prod` after pushing. Do not assume auto-deploy works.

**Category:** mistake

---

### 2026-03-25 — Silent audio recording on Safari (WebM/Opus)

**What went wrong:** Catherine's 6 voice memos were all digital silence (-91dB). The MediaRecorder reported `audio/webm;codecs=opus` as supported, created the files, but captured zero audio. Transcription returned empty strings, extraction ran on empty input producing garbage, and the user saw a blank profile.

**Why it's wrong:** The VoiceRecorder component checks `isTypeSupported` but never verifies the recording actually contains audio. Safari/iOS has known issues where WebM MediaRecorder returns technically valid but silent files. No validation at any layer caught this.

**Rule:** After recording, check the blob size relative to duration (< 1KB/sec is suspicious). Consider adding client-side audio level detection during recording. When transcription returns empty/very short text for a long recording, flag it as a recording issue rather than silently proceeding.

**Category:** mistake
