# Lessons Learned

Rules derived from mistakes in this project. Claude MUST review this file at the start of every session and follow these rules.

---

### 2026-03-24 — Claimed "live" without verifying deployment (UPDATED for Coolify)

**What went wrong:** Said code was "pushed and live" multiple times after `git push`, but the deploy hadn't actually completed.

**Why it's wrong:** `git push` != deployed. Builds can fail silently and the production URL may still serve an old version.

**Rule:** After every `git push`, verify deploy completed on Coolify: (1) `gh run list` — Actions succeeded, (2) `ssh root@95.216.205.160 "docker ps --format '{{.Names}} {{.CreatedAt}}' | grep v62x9"` — container timestamp is after push, (3) `curl -sf https://people-like-you.com` — 200. Never say "live" until confirmed.

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

### 2026-03-25 — Vercel auto-deploy not connected (OBSOLETE — see 2026-03-29 below)

**OBSOLETE:** PLY no longer deploys to Vercel. All apps are on Coolify/Hetzner. See 2026-03-29 entry.

**Category:** obsolete

---

### 2026-03-25 — Silent audio recording on Safari (WebM/Opus)

**What went wrong:** Catherine's 6 voice memos were all digital silence (-91dB). The MediaRecorder reported `audio/webm;codecs=opus` as supported, created the files, but captured zero audio. Transcription returned empty strings, extraction ran on empty input producing garbage, and the user saw a blank profile.

**Why it's wrong:** The VoiceRecorder component checks `isTypeSupported` but never verifies the recording actually contains audio. Safari/iOS has known issues where WebM MediaRecorder returns technically valid but silent files. No validation at any layer caught this.

**Rule:** After recording, check the blob size relative to duration (< 1KB/sec is suspicious). Consider adding client-side audio level detection during recording. When transcription returns empty/very short text for a long recording, flag it as a recording issue rather than silently proceeding.

**Category:** mistake

---

### 2026-03-25 — Coolify: standalone mode requires different start command

**What went wrong:** Added `output: "standalone"` to next.config.ts but kept `npm run start` (which runs `next start`) as the start command. Next.js standalone mode requires `node .next/standalone/server.js`. App built successfully but served 404s, requiring another full 10-min rebuild.

**Why it's wrong:** Made a config change without reading what it requires. Each wasted rebuild on Coolify/Nixpacks takes 10+ minutes.

**Rule:** When adding `output: "standalone"` to any Next.js app, ALWAYS set the start command to `node .next/standalone/server.js`. Never use `next start` with standalone mode.

**Category:** mistake

---

### 2026-03-25 — Coolify: Nixpacks auto-detected wrong package manager (3 failed deploys)

**What went wrong:** Nixpacks detected pnpm and ran `pnpm i --frozen-lockfile` — failed (no pnpm-lock.yaml). Switched to `npm ci` — failed (no package-lock.json). Third try with `npm install` worked. Three failed deploys before getting it right.

**Why it's wrong:** Didn't check what lockfile/package manager the project uses before deploying. Should set explicit commands upfront.

**Rule:** Before deploying ANY Node.js app to Coolify, check: (1) package-lock.json exists? → `npm ci`. (2) pnpm-lock.yaml exists? → `pnpm i --frozen-lockfile`. (3) Neither? → `npm install`. ALWAYS set install_command, build_command, and start_command explicitly.

**Category:** anti-pattern

---

### 2026-03-25 — Coolify: IPv6 Docker network broke Traefik proxy

**What went wrong:** Default Docker `coolify` network was created with IPv6 but the gateway had invalid format (`fd73:2eac:7fd6::1/64`). Traefik proxy couldn't start. Apps built successfully but were unreachable.

**Why it's wrong:** Didn't verify the full chain (build → container → proxy → URL). Spent time debugging app when the proxy wasn't even running.

**Rule:** After Coolify install or network changes, verify: (1) `docker ps | grep proxy` — Traefik running, (2) curl localhost:80 from server — proxy responds, (3) test app URL. If proxy won't start on Hetzner, check for IPv6 network issues.

**Category:** mistake

---

### 2026-03-25 — Coolify: Guessed API field names instead of checking docs

**What went wrong:** Tried `is_build_time` (wrong), `fqdn` (wrong — it's `domains`), wrong env var payload. Each guess was a wasted API call.

**Why it's wrong:** The Coolify API has specific field names. Guessing wastes time.

**Rule:** Coolify API known-working fields: `domains` (not `fqdn`), `install_command`/`build_command`/`start_command`, env vars use `key`/`value`/`is_preview` (no `is_build_time`). When unsure, GET the resource first to see actual field names.

**Category:** anti-pattern

---

### 2026-03-25 — Positive: API-driven batch deployment

**What went right:** After painful manual UI setup of grant-seeker, switched to Coolify API for sports-dashboard. Created app, set env vars, configured domain, triggered deploy — all via API. Much faster. Use this for all remaining apps.

**Category:** positive-pattern

---

### 2026-03-25 — Positive: Extracting env vars from existing .env files

**What went right:** Found `.env.pulled` and `.env.local` in project directories. Extracted production values and pushed to Coolify via API instead of asking user for each one.

**Category:** positive-pattern

---

### 2026-03-25 — Docker layer cache serves stale builds silently

**What went wrong:** Options app rebuilt 5+ times with new code, but deployed CSS hash never changed. Docker reused cached layers. Multiple sessions spent 30+ min adding CACHEBUST ARGs and timestamp files — none worked because old Docker images existed on server.

**Why it's wrong:** Docker `COPY . .` only invalidates at the daemon level. Old images persist. CACHEBUST ARGs don't help when old images exist.

**Rule:** When a Coolify deploy produces identical output despite code changes: (1) `ssh root@95.216.205.160`, (2) `docker images | grep <app-uuid>` find old images, (3) `docker rmi -f` all of them, (4) `docker builder prune -af`, (5) redeploy. Do NOT add CACHEBUST hacks to Dockerfiles.

**Category:** anti-pattern

---

### 2026-03-25 — 80GB disk fills up every few hours with 22 apps

**What went wrong:** Docker build cache + images filled 80GB disk 3+ times in one session. Caused Redis RDB failures → Coolify API 500s → restart loops → builds stuck → platform downtime.

**Why it's wrong:** 22 Docker images (~1-2GB each) + build cache (30-50GB) exceeds 80GB. Daily cleanup cron insufficient during active development.

**Rule:** For 20+ Docker apps, 80GB disk is insufficient — upgrade to 160GB. Before batch deploys, check `df -h /` and proactively prune if above 60%. Add disk check to CLAUDE-INFRA.md deployment checklist.

**Category:** mistake

---

### 2026-03-25 — Multiple Claude sessions fighting over the same server

**What went wrong:** Three sessions simultaneously triggered deploys, filled disk, crashed Redis, and caused Coolify restart loops. Each independently tried to fix the same server issues without knowing what others were doing.

**Why it's wrong:** Server is a shared resource. Multiple sessions making infra changes (restarting services, pruning images) conflict with each other.

**Rule:** Only ONE Claude session should manage infrastructure at a time. Other sessions should just `git push` and let auto-deploy work. If deploy fails, tell user to have the infra session investigate — don't independently SSH in and restart services.

**Category:** anti-pattern

---

### 2026-03-25 — PLY deploy failed because uncommitted files weren't in git

**What went wrong:** PLY build failed — RadarChart.tsx and personality-reveal.ts existed locally but weren't committed. Three deploy cycles wasted (~15 min each).

**Why it's wrong:** `npx next build` passes locally because files are on disk. Coolify clones from git — uncommitted files don't exist.

**Rule:** Before pushing, run `git status` and check for untracked files that new code imports. Run `npx next build` after `git stash` to simulate a clean checkout. If build fails after stash, you have uncommitted dependencies.

**Category:** mistake

---

### 2026-03-25 — Other sessions keep trying Vercel despite migration

**What went wrong:** Multiple times, other sessions tried `./scripts/deploy.sh` or `npx vercel --prod`. Charles had to manually redirect them each time.

**Why it's wrong:** CLAUDE-INFRA.md exists globally but project-level CLAUDE.md files still referenced Vercel.

**Rule:** When migrating deployment platforms, update EVERY project's CLAUDE.md immediately. Grep all repos for old platform references. Global config is backup — sessions read project-level CLAUDE.md first.

**Category:** anti-pattern

---

### 2026-03-25 — Positive: Parallel agent deployment of 20 apps

**What went right:** 3 agents deployed 16 apps in parallel — Dockerfiles, env vars, API calls, deploys. All running within 30 minutes.

**Category:** positive-pattern

---

### 2026-03-25 — Positive: Storing Supabase DB connection for future sessions

**What went right:** After migration blocked on missing DB password, reset it and stored connection string in memory. Any future session can now run migrations directly.

**Category:** positive-pattern

---

### 2026-03-25 — POSTMORTEM: options.imprevista.com broken for 2+ hours

**What went wrong:** Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` as the env var but the app code checks for `NEXT_PUBLIC_SUPABASE_KEY`. Every request threw `Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY`. The app appeared to return 200 (Next.js error boundary) so I declared it working. User saw broken pages for 2+ hours while we chased phantom Docker cache issues.

**Why it's wrong:** Never read the actual app code (`web/src/lib/supabase.ts`) to check what env var names it expects. Just assumed the PLY convention (`ANON_KEY`) would match. Then when the user reported it broken, spent 30+ min blaming Docker cache instead of checking container logs for runtime errors.

**Rule:** After setting env vars for ANY new app, IMMEDIATELY check container logs: `docker logs <container> 2>&1 | grep -i error | head -10`. A 200 HTTP status does NOT mean the app works — check for runtime errors in logs before declaring success. When an app "doesn't look right," check logs FIRST, not Docker cache.

**Category:** mistake

---

### 2026-03-25 — Wrong env var name: assumed convention instead of reading code

**What went wrong:** Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` because that's what PLY uses. But the options app (written by a different session) uses `NEXT_PUBLIC_SUPABASE_KEY`. Wrong assumption, never verified.

**Why it's wrong:** Different Claude sessions write different env var names. There is no convention — each app defines its own. The ONLY source of truth is the app's source code.

**Rule:** Before setting env vars on Coolify, grep the app's source code for `process.env.` to get the EXACT var names it expects. Never assume env var names match other projects. `grep -roh 'process\.env\.[A-Z_]*' src/ | sort -u` takes 2 seconds and prevents hours of debugging.

**Category:** anti-pattern

---

### 2026-03-25 — Declared app "working" based on HTTP 200 without checking logs

**What went wrong:** `curl` returned 200 so I said "Options is working (200)! Try it in your browser." But the 200 was Next.js rendering an error boundary page, not the actual working app. Container logs showed `Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY` on every request.

**Why it's wrong:** HTTP 200 only means the web server responded. Next.js returns 200 even for error boundaries and fallback pages. The ONLY way to know an app works is to check container logs for runtime errors AND visually verify the page content.

**Rule:** After deploying any app, verification requires ALL THREE: (1) HTTP status 200, (2) `docker logs <container> 2>&1 | tail -20` shows no errors, (3) actual page content is correct (grep for a known string in the HTML). Never declare "working" based on status code alone.

**Category:** anti-pattern

---

### 2026-03-25 — Blamed Docker cache for 30 min when the real issue was env vars

**What went wrong:** When the user said "still has OLD STYLES," both sessions assumed Docker layer caching. Spent 30+ min adding CACHEBUST ARGs, timestamp files, deleting images, pruning builder cache. The real issue was a missing env var causing runtime errors — completely unrelated to build cache.

**Why it's wrong:** Jumped to a complex infrastructure explanation when the simplest check (reading container logs) would have revealed the real problem in 10 seconds. Classic anti-pattern: diagnosing from the wrong end.

**Rule:** When a deployed app doesn't work as expected, check in this order: (1) Container logs for runtime errors — 10 seconds. (2) Env vars are correct — `docker exec <container> env | grep <KEY>`. (3) App serves correct content — curl and grep for expected strings. Only investigate Docker cache AFTER ruling out application-level issues.

**Category:** anti-pattern

---

### 2026-03-26 — GHCR migration left apps in mixed state (dockerfile vs dockerimage)

**What went wrong:** Three agents migrated 22 apps from git-build to GHCR dockerimage in parallel. But sports-dashboard and options-edge-finder stayed as `dockerfile` build type while GH Actions workflows were added expecting `dockerimage`. Result: GH Actions built and pushed to GHCR, triggered Coolify deploy, but Coolify tried to build from git instead of pulling the image. Deploy succeeded (200 from API) but nothing actually changed. Two sessions spent 30+ min each trying to diagnose why deploys weren't working.

**Why it's wrong:** The migration was done in bulk by agents without verification that EACH app's build_pack actually changed. The GH Actions workflow assumed dockerimage but the Coolify app was still dockerfile. No single source of truth for which apps are on which pipeline.

**Rule:** After any bulk infra migration, verify EVERY app's actual config matches the expected state: `curl ... /applications | python3 -c "for a in apps: print(a['name'], a['build_pack'], a.get('docker_registry_image_name','none'))"`. Don't trust agent summaries — verify the actual Coolify API state.

**Category:** mistake

---

### 2026-03-26 — GHCR packages from private repos are private by default

**What went wrong:** GH Actions pushed Docker images to GHCR from private repos. The packages inherited the repo's visibility (private). Coolify couldn't pull them without Docker registry credentials. Multiple workarounds attempted (making repos public, adding `-app` suffix packages, auth refresh) — inconsistent results across agents.

**Why it's wrong:** Assumed GHCR packages would be publicly pullable. They're not when the repo is private. This blocked the entire GHCR migration for private repos.

**Rule:** Before migrating to GHCR, either: (1) make all repos public, or (2) add a GHCR pull credential to Coolify (Settings → Docker Registries → ghcr.io with a PAT that has `read:packages`). Verify the image is pullable from the server: `ssh root@... "docker pull ghcr.io/charlesrogers/<app>:latest"` before switching Coolify to dockerimage type.

**Category:** mistake

---

### 2026-03-26 — Coolify dockerimage apps don't generate HTTPS Traefik labels

**What went wrong:** All 19 subdomain apps switched to `https://` domains but Coolify's dockerimage build pack doesn't generate HTTPS Traefik router labels (no `tls=true`, no `certresolver=letsencrypt`). Every subdomain returned 503 on HTTPS. Required a Traefik dynamic config file workaround that references Docker-discovered services.

**Why it's wrong:** Assumed Coolify would handle HTTPS for dockerimage apps the same as dockerfile apps. It doesn't — this is a known Coolify bug.

**Rule:** Coolify dockerimage apps: set domains as `http://` OR create a Traefik dynamic config at `/data/coolify/proxy/dynamic/` that adds HTTPS routers referencing `@docker` services. The dynamic config file at `/data/coolify/proxy/dynamic/imprevista-https.yml` is the HTTPS workaround — don't delete it.

**Category:** near-miss

---

### 2026-03-26 — GH Actions workflow UUIDs went stale after migration

**What went wrong:** GHCR migration agents created new Coolify apps with new UUIDs but some GH Actions workflows referenced old UUIDs. Sports-dashboard workflow had UUID `q134pyv1efvl3dm9ueocib9h` (old) instead of `i130yaoyh0hufm1omc0fv1tp` (current). Builds succeeded on GitHub but Coolify deploy trigger hit a non-existent app.

**Why it's wrong:** When creating new Coolify apps during migration, the old GH Actions workflows weren't updated. Multiple sources of truth for the UUID.

**Rule:** Store the canonical Coolify UUID in the workflow file AND verify it exists: `curl -s -H "Authorization: Bearer $TOKEN" "$BASE/applications/<UUID>" | grep -q '"uuid"'`. After any Coolify app recreation, update ALL references (workflows, CLAUDE-INFRA.md, memory files).

**Category:** mistake

---

### 2026-03-26 — Positive: Self-hosted Supabase installed in 15 minutes

**What went right:** Supabase Docker setup was cloned, configured, and running with all 13 services healthy in ~15 minutes. Studio dashboard accessible, API responding, Postgres working. Clean execution of a complex infrastructure component.

**Category:** positive-pattern

---

### 2026-03-26 — Positive: Automated backup system created and tested

**What went right:** Backup script created, tested (2.5MB Supabase dump + 1.7GB sports data), cron scheduled. Uptime Kuma deployed. Infrastructure resilience plan fully implemented except offsite sync (pending Storage Box SSH key).

**Category:** positive-pattern

---

### 2026-03-26 — Positive: Traefik dynamic config as HTTPS workaround

**What went right:** When Coolify's dockerimage apps couldn't generate HTTPS labels, created a Traefik dynamic file config that references Docker-discovered services (`@docker` suffix). This survives container restarts because service names are based on Coolify UUIDs. Elegant workaround for a platform bug.

**Category:** positive-pattern

---

### 2026-03-29 — Secrets exposed in public repos by migration agents

**What went wrong:** During GHCR migration, agents made repos public to solve private GHCR package visibility. This exposed: Supabase service role key, Gmail app password, Discord webhooks, Reddit password, MongoDB password, PostHog API keys. GitGuardian caught it but damage was done — all secrets needed rotation.

**Why it's wrong:** The agents' goal was "make GHCR work" and the fastest path was making repos public. No one checked whether repos contained secrets in env files, CLAUDE.md, or committed code. The infra session (me) should have: (1) never made repos public, (2) set up GHCR pull credentials first, (3) added `.env*` to .gitignore across all repos.

**Rule:** NEVER make a repo public to solve a deployment issue. If GHCR images need to be pullable, add a Docker registry credential to the server (`docker login ghcr.io`). Before ANY repo visibility change, grep for secrets: `git log --all -p | grep -iE 'password|secret|token|api_key' | head -20`.

**Category:** mistake

---

### 2026-03-29 — Other sessions using dead sslip.io URLs

**What went wrong:** The bettybot session used `sports-dashboard.95.216.205.160.sslip.io` (dead URL) instead of `sports.imprevista.com`. Got 404, spent time debugging "the app is down" when the app was fine — just wrong URL. Happened because the session read stale info or old CLAUDE.md.

**Why it's wrong:** Domain changes during migration weren't propagated to all project CLAUDE.md files. Each session reads its own project's CLAUDE.md, not the global CLAUDE-INFRA.md.

**Rule:** After changing any app's domain, update that project's CLAUDE.md immediately with the new URL. Every project CLAUDE.md must have a "Production URL" line that is the single source of truth for that app's URL.

**Category:** anti-pattern

---

### 2026-03-29 — Disk filled AGAIN crashing Supabase DB

**What went wrong:** 10 apps still building from git on the server filled 150GB disk (again). Supabase Postgres crashed with "No space left on device". Third time this happened in 48 hours.

**Why it's wrong:** The 6-hour cleanup cron was a bandaid. The root cause was apps building on the server. Should have converted ALL apps to dockerimage immediately instead of leaving 10 as dockerfile.

**Rule:** Zero tolerance for `dockerfile` build_pack on Coolify. ALL apps must be `dockerimage` (pull from GHCR). If GHCR pull fails, fix the auth — don't fall back to building on the server. Building on the server is the root cause of every disk crisis.

**Category:** anti-pattern

---

### 2026-03-29 — Vitest peer dependency broke Docker build

**What went wrong:** Sports-dashboard GH Actions build failed with `ERESOLVE could not resolve` — vitest@3.2.4 vs @vitest/coverage-v8@4.1.2. Three consecutive builds failed before diagnosis.

**Why it's wrong:** The bettybot session added a dev dependency without testing the Docker build. `npm ci` is strict about peer deps. The local `node_modules` had the conflicting versions resolved, but a clean `npm ci` in Docker fails.

**Rule:** After adding or updating any npm dependency, run `docker build` locally (or at minimum `rm -rf node_modules && npm ci`) before pushing. If the project doesn't have Docker locally, at least run `npm ci --dry-run` to check for resolution errors.

**Category:** near-miss

---

### 2026-03-29 — Positive: GHCR pull credential permanently fixes private image access

**What went right:** Added `docker login ghcr.io` with a PAT on the server. All private GHCR images now pullable. Converted remaining 8 dockerfile apps to dockerimage in one batch. Server no longer builds anything — disk problem permanently solved.

**Category:** positive-pattern

---

### 2026-03-29 — Tried deploying PLY to Vercel instead of Coolify (TWICE in same session)

**What went wrong:** After pushing code, ran `npx vercel --prod` to deploy. Earlier in session also deployed to Vercel. User had to tell me to read CLAUDE-INFRA.md. This is the THIRD time this mistake appears in this file.

**Why it's wrong:** Didn't read `~/.claude/CLAUDE-INFRA.md` at session start. CLAUDE.md line 2 says "NO VERCEL" in bold. Ignored it entirely.

**Rule:** At session start for ANY project: (1) Read `~/.claude/CLAUDE-INFRA.md`. (2) NEVER run `npx vercel` or `heroku` for any project. PLY deploys to Coolify (UUID: v62x9o7lxfncksjq5jrgevcc). After `git push`, verify via: `gh run list` → `ssh root@95.216.205.160 "docker ps ... | grep v62x9"` → `curl -sf https://people-like-you.com`.

**Category:** mistake

---

### 2026-03-29 — PLY still on Supabase Cloud, not self-hosted

**What went wrong:** Tried running migration on self-hosted Supabase, hit the wrong `matches` table (from a different app). PLY's tables don't exist on self-hosted Supabase. PLY is still on Supabase Cloud with `.env.local` baked into Docker image. No Supabase env vars set on Coolify.

**Why it's wrong:** Assumed PLY was fully migrated. CLAUDE-INFRA.md says "PLY → public schema" but that's the target state, not current state. Should have checked Coolify env vars and self-hosted DB tables first.

**Rule:** Before running a migration, verify which database the app actually connects to: (1) Check Coolify env vars for SUPABASE_URL. (2) If not set there, check what's baked into the Docker image via `.env.local`. (3) Verify tables exist on the target DB before running DDL.

**Category:** mistake

### 2026-07-20 — Over-scoped content moderation onto private messages
**What went wrong:** Built OpenAI moderation pre-screening on private chat messages + chat voice transcripts (src/app/api/chat/route.ts), not just public-facing content. Charles pushed back ("wtf we have to filter messages??").
**Why it's wrong:** Apple 1.2's "filter" pillar is defensibly about BROADCAST content (profile photos, profile text/voice that matches see). Private 1:1 chat is standardly handled REACTIVELY (report + block + review-on-report). Pre-scanning every DM is aggressive, unnecessary for compliance, and directly contradicts PLY's privacy positioning ("we don't read your private conversations") — the privacy page even said so while the code did the opposite.
**Rule:** Only auto-moderate PUBLIC-FACING / broadcast content (photos shown to matches, profile-derived voice memos). NEVER pre-screen private 1:1 messages — govern those with block + report + on-report review. When adding a safety feature, check it against the product's stated privacy promises before shipping.
**Category:** anti-pattern

### 2026-08-13 — Rewrote a file without checking remote branches first; nearly clobbered another session's work
**What went wrong:** Rewrote `src/app/api/waitlist/route.ts` wholesale from the version on my session branch. `origin/staging` was 2 commits ahead with T16b Phase 1 (named-metro registry, real referral jumps, admin launch dashboard, `GET /api/waitlist?code=`). The push was rejected as non-fast-forward — that rejection is the ONLY reason the work wasn't destroyed. I also numbered a migration `021_` when `021_waitlist_metro_key.sql` already existed on staging.
**Why it's wrong:** A worktree session branch is not the source of truth. Another Claude session had shipped substantial work to `staging` that never reached my branch, and a full-file `Write` silently discards it. Migration numbers are a shared namespace across branches.
**Rule:** Before rewriting ANY file (especially a full-file Write) or adding a migration, run `git fetch origin && git log --oneline HEAD..origin/staging --stat` and `ls migrations/` against the remote. Rebase onto `origin/staging` FIRST, then edit. Never pick a migration number without checking the remote branch's migrations directory.
**Category:** near-miss

### 2026-08-13 — `docker container prune -f` on a cron deleted the production database container
**What went wrong:** `/data/scripts/docker-cleanup.sh` ran `docker container prune -f` every 6 hours. When `supabase-db` exited under memory pressure on 2026-08-08, the cron permanently DELETED the container. Every app on the Hetzner box was down for 5 days; PLY served Traefik 503s the whole time.
**Why it's wrong:** Container prune is indiscriminate — it removes any stopped container, including stateful infrastructure. A crashed DB is recoverable in seconds; a *deleted* DB container turns a blip into a multi-day outage. Disk pressure is reclaimed by image/builder prune, not container prune.
**Rule:** NEVER run `docker container prune` on a scheduled job on a host running stateful services. Prune images and build cache only (`docker image prune -af`, `docker builder prune -af`). If containers must be reaped, filter explicitly by label/name and exclude infrastructure.
**Category:** anti-pattern

### 2026-08-13 — "Noticed a compromise" is not "remediated a compromise"
**What went wrong:** The sales-analyzer cryptominer documented as a "May 2026" incident was never actually removed. The dropper `/tmp/npm_update` was dated 2026-04-02 and `[system-check]` processes had 64+ days of accumulated CPU — the same infection had been mining continuously for 4.5 months on an unpatched Next.js 15.1.6 image that was never rebuilt.
**Why it's wrong:** The container kept running with its writable layer intact, so the malware survived. Writing the incident into CLAUDE.md created a false sense that it was handled.
**Rule:** Remediating a compromised container means: stop it, `--restart=no`, REMOVE the container (destroying the writable layer), rebuild the image from source on a patched base, and rotate every credential that container could read. Verify with `docker top` afterwards. An incident is not closed until the malicious process is gone AND the entry vector is patched.
**Category:** mistake

### 2026-08-14 — Tested the API instead of the user's path; shipped a phone-corrupting bug
**What went wrong:** Wrote a 21-case phone suite against `POST /api/waitlist` and reported "phone handling verified". The suite passed because `normalizePhone` correctly handles 11-digit input. But `formatPhone` in `src/components/WaitlistCapture.tsx` — the on-screen formatter every real user goes through — did `.slice(0, 10)` BEFORE stripping the leading country code, so "+1 801 555 0123" became "(180) 155-5012" and that wrong number was stored. Found only when Charles pasted a real signup's output and the stored phone read `(161) 029-9013`.
**Why it's wrong:** The API and the UI are two different entry points with two different normalizers. Exercising the one that isn't user-facing proves nothing about the one that is, and phone was the product's ONLY contact channel — a corrupted number means that lead is permanently unreachable.
**Rule:** When a client-side transform exists between the user and the API (formatters, masks, debounce, truncation), test THROUGH it, not around it. For any input field with a display formatter, unit-test the formatter itself across paste + keystroke + country-code + overlong input, and assert the value that actually reaches the request body — never claim "verified" from API-level tests alone.
**Category:** mistake

### 2026-08-22 — A green PLY deploy does not mean production is serving new code
**What went wrong:** `.github/workflows/deploy.yml` triggers the Coolify deploy, then starts polling `https://people-like-you.com/api/health` after a single `sleep 10`. Run 32593714775: deploy queued 19:30:50, health check 1/20 returned HTTP 200 at 19:31:01, workflow printed "Deploy verified healthy" and exited green. The new container was not created until 19:31:28 — 27 seconds *after* CI declared success. I ran the production verification off the back of that green and got robots.txt 404 / no GA tag, and briefly read it as a failed deploy rather than a raced one.
**Why it's wrong:** the old container keeps serving `/api/health` 200 through the entire pull-and-swap window. A liveness probe that the previous version also passes cannot distinguish "new code is live" from "nothing has happened yet." The rollback branch is unreachable for the same reason — it can only fire if the app is down for >200s, never if the new image is broken but the old one is still up.
**Rule:** Never verify a Coolify deploy with an endpoint the previous build also satisfies. Poll for a build-specific marker (the commit SHA in a `/api/health` field, or `BUILD_ID`) and require it to CHANGE from the pre-deploy value; only then treat the deploy as verified. Independently, confirm the container `CreatedAt` on the host is later than the push before reporting anything as live.
**Category:** near-miss

### 2026-08-22 — Constraint-lawyered a locked decision instead of answering the question asked
**What went wrong:** Charles asked for a content strategy for per-metro location pages built on singles-ward density. `specs/location-seo-strategy.md` spent its first three sections arguing that ward counts violate Decision Log #4 and endanger Meta authorization, proposed a community-neutral Census substitute he did not ask for, and framed the whole dataset around per-ZIP radius lookups when he wanted metro areas (Provo/Orem, SLC, Boise, Rexburg, Sacramento, Bay Area). He called the result trash and overruled the constraint in one line: "meta isn't going to care."
**Why it's wrong:** the no-LDS-branding rule is Charles's own decision, recorded by Charles. He is the person with standing to revise it, and he holds the actual risk information about how Meta reviews dating apps. Flagging a conflict once is correct; building the entire deliverable around the flag, and substituting a different premise for his, is not — it converts "here is your strategy plus one caveat" into "here is a strategy for a question you didn't ask." The ZIP framing compounded it: he said location pages, I heard programmatic SEO and answered the doorway-page question instead of the what-goes-on-a-metro-page question.
**Rule:** When a request conflicts with a previously locked decision, raise it in at most one short paragraph and then build what was asked, on the requester's premise. Never restructure a deliverable around the objection or swap in a substitute premise. And when the ask names a geographic unit (metro, city, region), build at exactly that unit — do not generalize to a finer one and then argue against the generalization.
**Category:** anti-pattern

### 2026-08-22 — Decisions must be asked inline, never in a file
**What went wrong:** Matching v2 decision memo ended with "answer D1–D10 in §9"; the chat reply gave only compressed labels, forcing Charles to open specs/matching-v2-decision-memo.md to decide.
**Why it's wrong:** Charles answers from the conversation. A file-bound ask adds a find-the-file round trip and stalls the decision loop.
**Rule:** Always write decision questions out in the reply itself — self-contained (question + options + rec). Files may duplicate the ask, never replace it.
**Category:** anti-pattern

### 2026-08-22 — Farm-outs ship with a 🔫 copy-paste prompt; URLs always inline
**What went wrong:** Delivered farm-out charters (questionnaire deep-dive, v2 brief) without ready-to-copy launch prompts; Charles had to ask for them.
**Why it's wrong:** A farm-out spec without its launch prompt isn't finished — Charles pastes prompts into fresh sessions; making him compose one (or hunt for a path/URL) is friction on every single farm-out.
**Rule:** Every farm-out deliverable ends with the full absolute path AND a self-contained copy-paste prompt starting with 🔫. Any URL the user might need goes in the message, full and clickable.
**Category:** anti-pattern

### 2026-08-23 — Quiz answers are hidden data, not pitch copy
**What went wrong:** Built all of `specs/matching-v2-questionnaire-battery-v1.md` around the charter's "every answer must be usable *verbatim* in an intro" (charter §1 job 2, criterion N3) — including a per-item "pitch-use example sentence" column and the claim that the bad-day item was "the best in the battery — every one of them is a pitch." Charles: multiple-choice answers aren't unique to anyone, so they're not interesting as pitch copy; the stories are the good parts, and the quiz is "hidden data for the narrative we weave."
**Why it's wrong:** a closed-set answer is shared by everyone who picked it, so it can never carry the specificity that makes an intro land — "she runs the sparkler exit" is true of 25% of the pool. Worse, optimising item copy for quotability actively makes items flatter and more generic, which produced exactly the "really boring and not very well written" verdict. It also inverts the deliverable ranking: it demotes D-QD4 (the voice-prompt map, which converts an answer into an actual story) below D-QD1 item copy.
**Rule:** Closed-set questionnaire answers are latent variables — they steer angle, register, the milieu sort term, and which story we fish for. They are never pitch copy. Write items for discrimination, fun, and story-fishing yield, never for verbatim quotability. Verbatim pitch material comes only from open responses: voice memos, free text, vouches.
**Category:** anti-pattern

### 2026-08-23 — Quiz items must be a scene, not a category of situation
**What went wrong:** three items in a row rejected by Charles — "Handed something you'd never have picked yourself" ("handed what? a food? a task? a game?"), "The calendar" ("who are you negotiating with?"), and "A conversation gets weird and abstract" ("this is trash"). All three name a *class* of situation with no time, object, place, or second person. Every item he kept or improved has concrete particulars: "You're meeting someone at 7", "The party's good. You've been there three hours", "The thing in your place a guest always asks about".
**Why it's wrong:** an abstract stem makes the answerer invent the scene before they can answer it, so different people end up answering different questions — the "hidden framing" problem the frame-of-reference literature specifically warns about, and a direct hit to the measurement quality the item exists for. It also reads as a personality test instead of self-expression, and it drags the options into describing dispositions ("I'll follow it for a bit") instead of behaviours.
**Rule:** every questionnaire item stem must contain at least two concrete particulars — a time, a place, an object, a number, or a specific second person. If the stem still makes sense with "in general" prefixed to it, it is not an item yet. Options must be things a person did, not attitudes they hold.
**Category:** anti-pattern

### 2026-08-23 — Four flavours of the same virtue is not an item
**What went wrong:** "Someone you love is having a bad day. You: get practical · share what I'd do · make them laugh · say nothing useful and stay anyway." Charles: "needs way more thought." All four options are kinds of good support, so the item sorts people by *support style* — a Buzzfeed love-language question — rather than measuring agreeableness at all. I had previously called it "the best item in the battery."
**Why it's wrong:** an option set with no cost attached to any branch produces near-uniform "depends" answers and no variance, which is dead-item territory (criterion N4) and contributes nothing to the trait it is nominally scoring. Traits reveal themselves where being one way costs you something — agreeableness shows up in conflict and in absorbing a let-down, not in choosing which nice thing to do.
**Rule:** before writing options, name the cost. If every option is admirable at no price, the item measures preference, not disposition — rewrite the stem so the answer has a tradeoff (say the hard thing vs keep the peace; let it go vs make it right). "Which flavour of good person are you" is never an item.
**Category:** anti-pattern

### 2026-08-23 — Don't encode one conversational style as universal
**What went wrong:** Q17 ("we're joking, then suddenly we're not / we're deep, then suddenly we're laughing") and Q18 ("they know more about me / I know more about them") both assumed connection happens through escalating mutual personal disclosure. Charles: "this is not really something everyone wants... you're really not considering male psychology. some are really into talking but others only talk about ideas and sports teams."
**Why it's wrong:** a large share of people — disproportionately men — connect through shared subject matter (a team, a project, an argument about a thing) rather than through self-disclosure. An option set that lives entirely on the disclosure axis forces those people into an answer that misdescribes them: bad data, and an alienating first impression in a product whose pool is currently 16M/6W and whose whole thesis is that the introduction should feel aimed at *this* reader.
**Rule:** before shipping any item about conversation, connection or intimacy, check the option set spans **topic-based** connection (we found the one thing we both care about; we argued about it for an hour) as well as **disclosure-based** connection. If every option involves talking about yourself or about the other person, the item measures one style and mislabels everyone else. Same check applies to gifts, affection and any other item where the "normal" behaviour is culturally gendered — always include the "I don't do that, I do this instead" option as a real answer.
**Category:** anti-pattern

### 2026-08-23 — Auto-advance without a direction flag traps the user going back
**What went wrong:** `src/components/QuizStep.tsx` gave the 5 block cards a 1.2s auto-advance timer on mount. Pressing Back from the first item of a block landed on that block's card, whose timer immediately fired again and pushed the user forward — so Back could never cross a block boundary. Found by walking the flow on staging, not by any test; the unit suite and the build were both green.
**Why it's wrong:** an auto-advancing screen is only unambiguous when it is entered going forward. On a backward entry the same timer inverts the user's intent, and the spec's own acceptance criterion was "back works from every screen, mis-tap always recoverable" — which the implementation silently violated at exactly the 5 boundaries a user is most likely to want to cross.
**Rule:** any screen that advances itself on a timer must record the direction of entry and only fire the timer when it was entered going forward. More generally: when a flow mixes auto-advance with a Back affordance, walk the flow BACKWARDS as a distinct test — forward-only clicking cannot surface this class of bug, and neither can unit tests over pure functions.
### 2026-08-24 — Review fired after the production push, not before
**What went wrong:** The intl waitlist branch (src/app/api/waitlist/route.ts) shipped to production with a cross-namespace phone-dedupe collision (10-digit intl numbers share the US keyspace and could return a US user's referral code). The specialist correctness review — which caught it in one pass — was launched AFTER the prod deploy, so the defect was live for ~10 minutes.
**Why it's wrong:** The review exists to gate shipping; running it post-deploy converts a pre-flight check into an incident report. The dedupe key design (bare digits, two normalizers, one unique index) is exactly the kind of cross-population collision a reviewer finds and an author doesn't.
**Rule:** Always launch the required specialist reviews (correctness for matching/identity/dedupe logic, reliability for migrations) BEFORE the production push and wait for the verdict; push to prod only on pass.
**Category:** near-miss

### 2026-08-24 — SEO pages shipped article-first; Charles wants WAITLIST FIRST
**What went wrong:** The 22 organic pages (/lds-singles/*, /es/*, /pt/*) were built as long-form articles in a stone/editorial style with the waitlist CTA as a link card at the very bottom. Charles: "these are horrible... really have it be WAITLIST FIRST."
**Why it's wrong:** PLY's marketing surfaces exist to convert; the root waitlist page's whole design is form-above-the-fold. Article-first pages bury the one action that matters below 1,500 words, and the stone palette doesn't even look like the brand.
**Rule:** On any PLY marketing/SEO page, the waitlist capture form is the hero — above the fold, brand-styled, with page-specific headline; the content/data sits below to support conversion and SEO, never the reverse.
**Category:** mistake

### 2026-08-23 — "Fun" specified as a QA checklist, so a joyless build passed it
**What went wrong:** `specs/farmout-v2-quiz-build.md` §4 cashed out Charles's "fun" acceptance criterion as "all 23 screens clicked on a real phone viewport, both themes, back works from every screen." The build satisfied every clause, reported fun as **met**, and Charles's verdict on the result was "pretty bad! not fun at all... it all also looks incredibly plain jane." No emoji, no motion, no visual direction of any kind. The spec carried ~4,000 words of copy, scoring and instrumentation and **zero words about what the thing should look or feel like** — I never wrote D-QD5, the UX flow spec, before farming the build out.
**Why it's wrong:** functional completeness is not delight. A criterion satisfiable by a correct-but-lifeless implementation gives the builder no way to know they failed, and it's unfair to them — they shipped exactly what was asked. The visual and motion design defaulted to whatever the framework does on its own, which is nothing.
**Rule:** never farm out a user-facing build without a visual/interaction spec alongside the copy. When an acceptance criterion is a taste word — "fun", "premium", "calm", "fast" — it must be cashed out into concrete artefacts (motion timings, colour, type scale, iconography/emoji, tap feedback, empty and loading states) or pointed at a reference implementation to match. "Clicked every screen" tests that it works; it never tests that it's good.
**Category:** mistake

### 2026-08-23 — Compressed stems until they stopped asking a question
**What went wrong:** chasing the dry register, I trimmed item stems past the point where they still posed a question or named their own scene. "Wedding reception, 10pm" dropped **"Where are you?"**. "The group is picking a restaurant" dropped **"chat"**, losing the fact that it happens in the group chat. "At seventeen you were, on the record…" and "It's their birthday. Your move:" swapped plain asks for mannerisms. Worst, Q5's stem asked *what* ("Last thing you said yes to with no idea what you were doing") while its options answered *when* ("this month / a few years back"). Charles: "you actually made the content worse."
**Why it's wrong:** dry is a register, not a compression ratio. Terseness that removes a load-bearing noun makes the reader assemble the scene themselves, which is the hidden-framing problem the frame-of-reference research warns about — and a stem whose options answer a different question than it asks is simply broken, however good the options are.
**Rule:** after writing a stem, check two things. (1) Does it contain every noun needed to picture the scene without inference? (2) Do the options grammatically answer the question the stem actually poses? Never drop a word purely to sound terser, and never let a mannerism ("on the record", "your move") stand in for the ask.
**Category:** mistake

### 2026-08-23 — "Fun" specified as a QA checklist, so a joyless build passed it
**What went wrong:** `specs/farmout-v2-quiz-build.md` §4 cashed out Charles's "fun" acceptance criterion as "all 23 screens clicked on a real phone viewport, both themes, back works from every screen." The build satisfied every clause, reported fun as **met**, and Charles's verdict on the result was "pretty bad! not fun at all... it all also looks incredibly plain jane." No emoji, no motion, no visual direction of any kind. The spec carried ~4,000 words of copy, scoring and instrumentation and **zero words about what the thing should look or feel like** — I never wrote D-QD5, the UX flow spec, before farming the build out.
**Why it's wrong:** functional completeness is not delight. A criterion satisfiable by a correct-but-lifeless implementation gives the builder no way to know they failed, and it's unfair to them — they shipped exactly what was asked. The visual and motion design defaulted to whatever the framework does on its own, which is nothing.
**Rule:** never farm out a user-facing build without a visual/interaction spec alongside the copy. When an acceptance criterion is a taste word — "fun", "premium", "calm", "fast" — it must be cashed out into concrete artefacts (motion timings, colour, type scale, iconography/emoji, tap feedback, empty and loading states) or pointed at a reference implementation to match. "Clicked every screen" tests that it works; it never tests that it's good.
**Category:** mistake

### 2026-08-23 — Compressed stems until they stopped asking a question
**What went wrong:** chasing the dry register, I trimmed item stems past the point where they still posed a question or named their own scene. "Wedding reception, 10pm" dropped **"Where are you?"**. "The group is picking a restaurant" dropped **"chat"**, losing the fact that it happens in the group chat. "At seventeen you were, on the record…" and "It's their birthday. Your move:" swapped plain asks for mannerisms. Worst, Q5's stem asked *what* ("Last thing you said yes to with no idea what you were doing") while its options answered *when* ("this month / a few years back"). Charles: "you actually made the content worse."
**Why it's wrong:** dry is a register, not a compression ratio. Terseness that removes a load-bearing noun makes the reader assemble the scene themselves, which is the hidden-framing problem the frame-of-reference research warns about — and a stem whose options answer a different question than it asks is simply broken, however good the options are.
**Rule:** after writing a stem, check two things. (1) Does it contain every noun needed to picture the scene without inference? (2) Do the options grammatically answer the question the stem actually poses? Never drop a word purely to sound terser, and never let a mannerism ("on the record", "your move") stand in for the ask.
**Category:** mistake

### 2026-08-23 — Framed a demand problem as a matching problem, and lost the relevant literature
**What went wrong:** `specs/matching-v2-reader-archetypes-brief.md` argued from mate-preference research — F1 (Joel/Eastwick/Finkel: pair attraction is unpredictable) and Eastwick & Finkel 2008 (stated preferences don't predict in-vivo preferences) — to the conclusion that "we can't have a useful taxonomy of people," then filled the gap with an eight-asset taxonomy I invented and an Anne/Jessica story I made up. Charles: *"we're not trying to engineer matches, we're trying to engineer DEMAND and ctr, you know?"* and *"is that really what people are responding to? do jessica and anne differ really that much?"*
**Why it's wrong:** the pitch card is a creative asset and a fire is a click. That is a direct-response advertising problem with a large measured literature — Matz/Kosinski's personality-targeted ads (**already sitting in our own decision memo as F4**: 40% more clicks, 50% more purchases, 3.5M people, real field experiments), large-N headline experiments, creative-effectiveness databanks, Fader's latent-heterogeneity models. By framing it as mate selection I imported "attraction is unpredictable" — a finding about *pair outcomes after meeting* — into a question about *creative response before meeting*, which it says nothing about. Then an invented taxonomy did the load-bearing work in a proposal.
**Rule:** name the problem class before choosing the literature. If the output is a piece of copy and the metric is a click-through, it is a **direct-response problem** — go to advertising and creative-effectiveness research first, and reserve relationship science for what happens *after* the click. And never let an invented taxonomy carry a proposal without labelling it as the untested assumption it is.
**Category:** mistake

### 2026-08-24 — Optimised for launch detectability instead of eventual answerability
**What went wrong:** on receiving the pitch-demand research (reader×content interaction MDE ≈ OR 2.24 at 1,200 events vs a literature-calibrated OR ≈ 1.67), I downgraded `content_targeting` from a randomised factor to "logged only," and relabelled H1/H2 as Phase T. Charles: *"we don't need to only test at launch. we're building for our first 1k and 10k users, too. so don't worry too much what is immediately detectable. we want success."*
**Why it's wrong:** logged-but-unrandomised is not a weaker version of an experiment — it is **no experiment, ever**. Randomisation cannot be backfilled. At 10k users an unrandomised log is still confounded and the question stays unanswerable permanently. I traded away a permanent capability to buy a marginal power gain on one launch readout, and the power gain was largely illusory anyway: an orthogonal, balanced binary factor barely costs the *main* effects of the other factors in a factorial design.
**Rule:** sort every design decision by whether it can be backfilled. **Randomisation and raw measurement cannot be backfilled — do them now regardless of current power.** Derived scores, dashboards, models and analyses *can* be backfilled — build those when the data justifies them. "We can't detect it yet" is an argument for postponing the analysis, never for dropping the randomisation. Pre-register on an **event-count gate**, not a calendar window, so an underpowered launch doesn't quietly become a forgotten question.
**Category:** mistake

### 2026-08-24 — A story the person merely witnessed is not material about that person
**What went wrong:** in `specs/matching-v2-prompt-bank-v2.md` I graded `laugh_hardest` — *"Tell us about the last time you laughed so hard you couldn't breathe"* — as one of the **two best-constructed prompts in the bank**, and held it up as the model for 30 rewrites. Charles: *"how would we use that to make someone sound great to a potential match?????!!?!?"* The bank's own example answer settles it: *"My roommate tried a backflip into the pool, grabbed the fence, the fence broke, and he fell in sideways."* That is a story about a roommate. Charles also flagged that people can't reliably retrieve "the last time" of anything.
**Why it's wrong:** all four pitch angles are **feeling contracts about the subject**. A story where the answerer is a bystander or an audience produces vivid material about somebody else, and no amount of craft converts it into a pitch. My six elicitation rules all optimised narrative *quality* — occasion, entry point, breach, concreteness — and not one of them checked narrative **ownership**. On the retrieval point: cued autobiographical recall returns the most *available* memory, not the most recent, so "the last time X" demands a search-and-verify people cannot perform, while "a time X" returns the most vivid instance, which is what we want anyway.
**Rule:** every prompt must pass the **protagonist test** — would a typical answer make the answerer the protagonist, or a witness? If witness, the prompt dies no matter how vivid the story. And prefer **"a time"** over **"the last time"** unless recency is itself the construct being measured (frequency anchors) or the event is recent by nature.
**Category:** anti-pattern

### 2026-08-24 — A subagent that dies on an API limit may have already delivered
**What went wrong:** two of six review forks returned `status: failed` ("reached your Fable 5 limit"). I was one step from relaunching both — ~300k tokens of duplicated work — when a directory listing showed `f3.md` and `f6.md` already on disk at full size. Both agents had completed all 35 assigned prompts and died only while composing their final summary message.
**Why it's wrong:** the harness reports the status of the agent's *final turn*, not the state of its *artifacts*. An agent instructed to write to a file does its real delivery mid-run; the closing summary is the last and least valuable thing it produces. Treating "failed" as "produced nothing" throws away completed work and doubles the spend that just hit the limit.
**Rule:** when a subagent fails, **inspect its output artifacts before relaunching it.** If the agent was told to write to a path, list and verify that path first (line count + a completeness check against the assignment, e.g. `grep -c '^### '`). Relaunch only the portion actually missing. Corollary for the launch side: always give long-running agents a file to write to rather than relying on their return message, so a late-turn failure costs the summary and not the work.
**Category:** near-miss

### 2026-08-23 — "Fun" specified as a QA checklist, so a joyless build passed it
**What went wrong:** `specs/farmout-v2-quiz-build.md` §4 cashed out Charles's "fun" acceptance criterion as "all 23 screens clicked on a real phone viewport, both themes, back works from every screen." The build satisfied every clause, reported fun as **met**, and Charles's verdict on the result was "pretty bad! not fun at all... it all also looks incredibly plain jane." No emoji, no motion, no visual direction of any kind. The spec carried ~4,000 words of copy, scoring and instrumentation and **zero words about what the thing should look or feel like** — I never wrote D-QD5, the UX flow spec, before farming the build out.
**Why it's wrong:** functional completeness is not delight. A criterion satisfiable by a correct-but-lifeless implementation gives the builder no way to know they failed, and it's unfair to them — they shipped exactly what was asked. The visual and motion design defaulted to whatever the framework does on its own, which is nothing.
**Rule:** never farm out a user-facing build without a visual/interaction spec alongside the copy. When an acceptance criterion is a taste word — "fun", "premium", "calm", "fast" — it must be cashed out into concrete artefacts (motion timings, colour, type scale, iconography/emoji, tap feedback, empty and loading states) or pointed at a reference implementation to match. "Clicked every screen" tests that it works; it never tests that it's good.
**Category:** mistake

### 2026-08-23 — Compressed stems until they stopped asking a question
**What went wrong:** chasing the dry register, I trimmed item stems past the point where they still posed a question or named their own scene. "Wedding reception, 10pm" dropped **"Where are you?"**. "The group is picking a restaurant" dropped **"chat"**, losing the fact that it happens in the group chat. "At seventeen you were, on the record…" and "It's their birthday. Your move:" swapped plain asks for mannerisms. Worst, Q5's stem asked *what* ("Last thing you said yes to with no idea what you were doing") while its options answered *when* ("this month / a few years back"). Charles: "you actually made the content worse."
**Why it's wrong:** dry is a register, not a compression ratio. Terseness that removes a load-bearing noun makes the reader assemble the scene themselves, which is the hidden-framing problem the frame-of-reference research warns about — and a stem whose options answer a different question than it asks is simply broken, however good the options are.
**Rule:** after writing a stem, check two things. (1) Does it contain every noun needed to picture the scene without inference? (2) Do the options grammatically answer the question the stem actually poses? Never drop a word purely to sound terser, and never let a mannerism ("on the record", "your move") stand in for the ask.
**Category:** mistake

### 2026-08-23 — Framed a demand problem as a matching problem, and lost the relevant literature
**What went wrong:** `specs/matching-v2-reader-archetypes-brief.md` argued from mate-preference research — F1 (Joel/Eastwick/Finkel: pair attraction is unpredictable) and Eastwick & Finkel 2008 (stated preferences don't predict in-vivo preferences) — to the conclusion that "we can't have a useful taxonomy of people," then filled the gap with an eight-asset taxonomy I invented and an Anne/Jessica story I made up. Charles: *"we're not trying to engineer matches, we're trying to engineer DEMAND and ctr, you know?"* and *"is that really what people are responding to? do jessica and anne differ really that much?"*
**Why it's wrong:** the pitch card is a creative asset and a fire is a click. That is a direct-response advertising problem with a large measured literature — Matz/Kosinski's personality-targeted ads (**already sitting in our own decision memo as F4**: 40% more clicks, 50% more purchases, 3.5M people, real field experiments), large-N headline experiments, creative-effectiveness databanks, Fader's latent-heterogeneity models. By framing it as mate selection I imported "attraction is unpredictable" — a finding about *pair outcomes after meeting* — into a question about *creative response before meeting*, which it says nothing about. Then an invented taxonomy did the load-bearing work in a proposal.
**Rule:** name the problem class before choosing the literature. If the output is a piece of copy and the metric is a click-through, it is a **direct-response problem** — go to advertising and creative-effectiveness research first, and reserve relationship science for what happens *after* the click. And never let an invented taxonomy carry a proposal without labelling it as the untested assumption it is.
**Category:** mistake

### 2026-08-24 — Optimised for launch detectability instead of eventual answerability
**What went wrong:** on receiving the pitch-demand research (reader×content interaction MDE ≈ OR 2.24 at 1,200 events vs a literature-calibrated OR ≈ 1.67), I downgraded `content_targeting` from a randomised factor to "logged only," and relabelled H1/H2 as Phase T. Charles: *"we don't need to only test at launch. we're building for our first 1k and 10k users, too. so don't worry too much what is immediately detectable. we want success."*
**Why it's wrong:** logged-but-unrandomised is not a weaker version of an experiment — it is **no experiment, ever**. Randomisation cannot be backfilled. At 10k users an unrandomised log is still confounded and the question stays unanswerable permanently. I traded away a permanent capability to buy a marginal power gain on one launch readout, and the power gain was largely illusory anyway: an orthogonal, balanced binary factor barely costs the *main* effects of the other factors in a factorial design.
**Rule:** sort every design decision by whether it can be backfilled. **Randomisation and raw measurement cannot be backfilled — do them now regardless of current power.** Derived scores, dashboards, models and analyses *can* be backfilled — build those when the data justifies them. "We can't detect it yet" is an argument for postponing the analysis, never for dropping the randomisation. Pre-register on an **event-count gate**, not a calendar window, so an underpowered launch doesn't quietly become a forgotten question.
**Category:** mistake

### 2026-08-24 — A story the person merely witnessed is not material about that person
**What went wrong:** in `specs/matching-v2-prompt-bank-v2.md` I graded `laugh_hardest` — *"Tell us about the last time you laughed so hard you couldn't breathe"* — as one of the **two best-constructed prompts in the bank**, and held it up as the model for 30 rewrites. Charles: *"how would we use that to make someone sound great to a potential match?????!!?!?"* The bank's own example answer settles it: *"My roommate tried a backflip into the pool, grabbed the fence, the fence broke, and he fell in sideways."* That is a story about a roommate. Charles also flagged that people can't reliably retrieve "the last time" of anything.
**Why it's wrong:** all four pitch angles are **feeling contracts about the subject**. A story where the answerer is a bystander or an audience produces vivid material about somebody else, and no amount of craft converts it into a pitch. My six elicitation rules all optimised narrative *quality* — occasion, entry point, breach, concreteness — and not one of them checked narrative **ownership**. On the retrieval point: cued autobiographical recall returns the most *available* memory, not the most recent, so "the last time X" demands a search-and-verify people cannot perform, while "a time X" returns the most vivid instance, which is what we want anyway.
**Rule:** every prompt must pass the **protagonist test** — would a typical answer make the answerer the protagonist, or a witness? If witness, the prompt dies no matter how vivid the story. And prefer **"a time"** over **"the last time"** unless recency is itself the construct being measured (frequency anchors) or the event is recent by nature.
**Category:** anti-pattern

### 2026-08-24 — A subagent that dies on an API limit may have already delivered
**What went wrong:** two of six review forks returned `status: failed` ("reached your Fable 5 limit"). I was one step from relaunching both — ~300k tokens of duplicated work — when a directory listing showed `f3.md` and `f6.md` already on disk at full size. Both agents had completed all 35 assigned prompts and died only while composing their final summary message.
**Why it's wrong:** the harness reports the status of the agent's *final turn*, not the state of its *artifacts*. An agent instructed to write to a file does its real delivery mid-run; the closing summary is the last and least valuable thing it produces. Treating "failed" as "produced nothing" throws away completed work and doubles the spend that just hit the limit.
**Rule:** when a subagent fails, **inspect its output artifacts before relaunching it.** If the agent was told to write to a path, list and verify that path first (line count + a completeness check against the assignment, e.g. `grep -c '^### '`). Relaunch only the portion actually missing. Corollary for the launch side: always give long-running agents a file to write to rather than relying on their return message, so a late-turn failure costs the summary and not the work.
**Category:** near-miss
### 2026-08-24 — Graded prompts for extractability, not for whether the pitch is worth reading
**What went wrong:** in `specs/prompt-review-findings.md` I passed 76 of 102 prompts on the nine criteria, treating "a pitch sentence is writable from the modal answer" as the acid test. Charles: *"these stories are all about finding something remarkable to write about our people… can the output of these stories help you pitch someone in a highly attractive way? that is the gordian knot. also these need to be fun."* Several of my passes yield sentences that are competent and completely forgettable — "Nora arrives ten minutes early to claim the corner table" is writable, protagonist-clean, retrievable, and about nobody. I also kept prompts that are emotionally heavy (bar-exam retakes, interventions, addiction) because they *produced material*, without asking whether the material makes a stranger want to meet the person or merely respect them from a distance.
**Why it's wrong:** the nine criteria are a floor, not a bar. They screen out prompts that produce *unusable* material; they say nothing about whether the usable material is *attractive*. A fire is a click on a card about a stranger — the card has to be remarkable to earn it, and worthy-but-flat loses to nothing at all. Fun is not decoration either: a prompt that is a chore to answer produces dutiful material, and dutiful material produces a dutiful pitch. Optimising the extraction pipeline while ignoring the demand side is the same class of error as grading a headline by whether it parses.
**Rule:** every prompt is graded on **remarkability first**: simulate the modal answer, write the pitch, then ask (a) is there a surprise a stranger wouldn't predict, (b) could this sentence be written about a thousand other people in the pool, (c) would you stop on it cold. If it's generic-passable, rewrite it even though it passes every structural criterion. And grade **fun both ways** — fun to answer (would they smile or brace?) and fun to read (wit, not worthiness). Heavy prompts need an affirmative defence, not a pass because they yielded nouns.
**Category:** anti-pattern

### 2026-08-25 — Pushed a build I had not confirmed, because my own check said "0"
**What went wrong:** I ran `npx next build 2>&1 | grep -cE "Compiled successfully" && echo "build OK"` as the pre-push gate in a compound command. It printed `0` — no match, i.e. the build had FAILED with an unterminated-JSX error from an unbalanced `<div>` I had just introduced in `src/app/onboarding/page.tsx`. `grep -c` exits 1 on zero matches so the `&& echo` never fired, but the `set -e` came later in the script and the push went ahead anyway. The broken commit reached `main`; only the Docker build step in CI stopped it, and migrations/deploy were skipped.
**Why it's wrong:** the house rule is to run the build before pushing, and I did run it — I just did not read the answer. A gate whose failure mode is a silent `0` in a wall of output is not a gate. Worse, I had spent the previous turn removing a JSX block and should have treated any structural edit to a 1,300-line component as build-critical.
**Rule:** never pipe the pre-push build through `grep -c` or any counter. Run `npx next build` and read the tail, or assert explicitly — `npx next build 2>&1 | tail -5` and require the literal string, failing loudly (`|| exit 1`) when it is absent. Never put the build check and the push in the same compound command where an early non-zero exit can be swallowed.
**Category:** mistake

### 2026-09-02 — Recommended shrinking the prompt bank; breadth is a product requirement
**What went wrong:** In the prompt-work review I recommended cutting the bank from 94 prompts to about 20 "proven" ones. Charles: *"i think we want like 100 questions in our bank so we can show different ones so people aren't all answering the same thing... and we can drop the ones that keep getting ignored."*
**Why it's wrong:** the pitch pool has to sound like different people. If everyone answers the same 20 prompts, every pitch has the same spine, which is the "one device fifty times" failure in another form. Breadth is what keeps pitches distinct; quality control is pruning by observed ignore-rate, not shrinking the menu up front on taste.
**Rule:** Never propose reducing the prompt bank below ~100. Keep breadth, make the constructs diverse (cap each construct family), instrument shown/picked/skipped/words per prompt, and prune the ones users ignore. Prune by data, never by taste.
**Category:** mistake
