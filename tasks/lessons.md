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
