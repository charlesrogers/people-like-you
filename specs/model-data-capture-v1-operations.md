# Operational model-data capture v1 — 2026-09-10

Implements the reduced scope Charles requested after reading `specs/12-training-data-capture.md` and `research/2026-09-09-local-pitch-model/app-data-contract.md`: capture ordinary product activity now; obtain shared-model-training permissions later. No human-review workbench, cohort assignment, training exporter, local-model training/download, bulk generation, or offline coverage queue was added. The original specification remains a future target, not a claim of completion.

## Captured chain

- Web onboarding, profile recordings, voice-to-unlock, and prepared native uploads send the displayed question/help/example. Legacy clients are explicitly labeled `legacy_server_reconstruction`; that is not proof of the historical displayed copy.
- Audio transcription attempts retain the audio content hash and format (not another audio copy), requested model, returned model ID where supplied, complete SDK-returned response, usage where returned, request ID, latency and sanitized failure codes. OpenAI does not always return the resolved model ID or usage; those fields remain unknown.
- Immutable transcript records retain complete text, SHA-256, source question, prior transcript reference, and transcription-call parents. Member corrections use authenticated `PATCH /api/voice-memo` with `{memoId, transcript}`. There is no correction/review UI in this pass.
- Pass 1 keeps complete model coding and raw response plus per-claim evidence spans. Offsets are UTF-16 code units with an exclusive end. Claims distinguish speaker/third person, exact quote/paraphrase, reported observation/interpretation/unknown/contradiction. Speaker reports are not independently verified facts. Invalid quotations are retained as failures, never silently promoted to verbatims.
- Pass 2 retains complete synthesis, all its current source records and all provider output, before the existing app projection. Replaced answers are excluded. Legacy source analyses are retained as labeled snapshots without inventing old model-call provenance.
- Every trailer invocation captures an input packet: reader/subject profile snapshots, selected source transcripts, source IDs, and the exact writer input. All three initial drafts, every critic, optional regeneration and selected immutable revision remain in the chain. Critic receives the source evidence; deterministic quote checks can reject a draft even if its model critic passes it. This is automatic checking, not human approval or established disclosure clearance.
- Delivery requires the exact revision/text/reader/subject. Database guard prevents direct `daily_intros` writes that bypass this requirement when enabled. Static fallbacks and historical introductions get explicitly incomplete revisions; they are not valid supervised writing examples.
- Web feedback and the prepared native client send the displayed revision. Old feedback without a revision stays unlinked. Server-returned exposure is distinct from client-visible card events; client visibility is best-effort telemetry and never proof of reading. Profile feedback and synthetic taste-card feedback are retained separately. Likes, dates, taste votes and profile feedback are not writing-quality approvals or same-input draft preferences.

## Instrumented generation entry points

1. `processVoiceMemo`: transcription including model fallback/retries, story extraction and person synthesis; used by onboarding processing and the memo cron.
2. `/api/transcribe`: authenticated standalone transcription; explicitly marked without an answer row.
3. `generateTrailer`: normal scheduled introductions (`cron/deliver-matches`), resume (`cadence`), bonus introductions (`feedback`) and voice-to-unlock (`voice-prompt-loop`). `generateDailyThree` retains returned revision IDs as well.
4. Legacy `generateNarrativeWithPipeline`/`generateMatchAngle` route through the captured trailer engine when capture is enabled. Standalone legacy scalar extraction/vouch analysis and standalone legacy critic refuse unowned calls. The one-off `generate-charles-intros` script also uses the capture wrapper and refuses calls without a capture context when enabled.

Not captured as model-training material here: private chat/disclosure prompts, date-feedback classification, pre-date nudges, embeddings and moderation-service calls. Those are separate product paths, not answer-analysis/synthesis/pitch-writing calls. The vouch processing route was already a stub; this release does not activate it or claim vouch lineage. No application delivery route intentionally bypasses recording while capture is enabled. Existing history predating this deployment cannot recover its missing old drafts or provider calls.

## Privacy, eligibility and lifecycle

All captured records are service-role-only (RLS and revoked anon/authenticated permissions). The new admin status endpoint returns counts, never member content, and requires `x-admin-secret`. Raw provider errors/headers are not copied into records. Full operational model inputs/outputs can contain names and other member data; no real captures belong in Git.

`training_eligible` is constrained to false in the database. Permissions, teacher-output training clearance, human factual/disclosure review and partition assignment remain unresolved by design. No export or training code is shipped. Later opt-in alone does not automatically make these captures a clean training dataset. In particular, later partition assignment must exclude or regenerate cross-partition reader/subject packets. Existing sources remain labeled when capture began after their original analysis.

Transcript change/replacement invalidates downstream analysis, synthesis, packets, drafts and revisions recursively. A stale revision cannot be newly delivered. Account deletion removes records involving that person as reader or subject and their descendants, including linked introductions. Answer deletion purges its descendants. Service-role `model_data_purge_person(person_id, 'revocation')` supports erasure; it does not implement a consent-management UI. Erasure audit keeps only reason, time and count, not identifying tombstones.

The existing product intake stays four recordings of at least 20 seconds. This is not the proposed six-answer / 150-person / 1,500-approved-example beta. There are no approved examples merely because capture works.

## Rollout and verification

Migration: `025_model_data_capture.sql`. Additive schema; capture starts OFF. Staging and production share the database. Dry-run in a rollback transaction with `ON_ERROR_STOP=1` before deployment. Do not enable the shared switch while an old production container is serving: its unrecorded writes would be rejected by the delivery guard.

1. Run `npm run verify:model-data`, `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Verification uses embedded PostgreSQL and fixture-only provider stubs; no real participants or paid calls.
2. Deploy the capture commit to staging, verify `/api/onboarding-prompts` includes `captureContractVersion: capture-v1`, and unauthorized `/api/admin/model-data/status` returns 401. Verify migration objects and RLS in the shared database.
3. Deploy the identical change to production and verify the new contract and container. Only then set `model_data_settings.capture_enabled=true` for the singleton row. Provider calls fail closed if required capture persistence fails.
4. Read `SELECT model_data_status()` or authenticated `GET /api/admin/model-data/status`. Inspect counts by kind/status, stale records, subjects with transcripts, quote failures and unlinked revisions/feedback. `approvedExamples` and `trainingEligible` stay zero. Counts are capture inventory, not dataset readiness.
5. Rollback: turn the database switch OFF before restoring an old app container. Retain captures. Do not delete the migration or use destructive schema rollback. Optional `MODEL_DATA_CAPTURE_ENABLED=false` bypasses application capture, but the database guard must also be disabled for an old writer.

Validation at authoring: fixture suite passes; full test suite passes; production build and TypeScript pass. Full lint has the same nine pre-existing errors as main (React effects and two prefer-const findings); no new lint errors. Native simulator build passes. No paid end-to-end provider run or real-member generation was used for verification.

## Native client

Five surgical edits in the separate existing native checkout preserve unrelated work: `Services/VoiceService.swift`, `Views/Onboarding/VoiceRecordingView.swift`, `Views/Profile/VoicePromptView.swift`, `Models/Match.swift`, `Views/Discovery/DashboardView.swift`. Question snapshots and exact feedback revisions are included in the next build. Simulator build is verified; this is not a TestFlight upload. Existing app versions still produce labeled legacy question provenance/unlinked feedback.

## Changed web files

- `migrations/025_model_data_capture.sql`
- `package-lock.json`
- `package.json`
- `specs/model-data-capture-v1-operations.md`
- `src/app/api/admin/model-data/status/route.ts`
- `src/app/api/cadence/route.ts`
- `src/app/api/cron/deliver-matches/route.ts`
- `src/app/api/feedback/route.ts`
- `src/app/api/intros/event/route.ts`
- `src/app/api/matches/route.ts`
- `src/app/api/onboarding-prompts/route.ts`
- `src/app/api/process-memos/route.ts`
- `src/app/api/profile-feedback/route.ts`
- `src/app/api/taste-calibration/route.ts`
- `src/app/api/transcribe/route.ts`
- `src/app/api/voice-memo/route.ts`
- `src/app/api/voice-prompt-loop/route.ts`
- `src/app/dashboard/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/components/DailyThree.tsx`
- `src/components/ProfileTab.tsx`
- `src/components/VoicePromptLoop.tsx`
- `src/lib/api-client.ts`
- `src/lib/db.ts`
- `src/lib/extraction-v2.ts`
- `src/lib/extraction.ts`
- `src/lib/intro-engine-v2.ts`
- `src/lib/matchmaker.ts`
- `src/lib/model-data/__tests__/capture.test.ts`
- `src/lib/model-data/__tests__/client-auth.test.ts`
- `src/lib/model-data/__tests__/fixtures.ts`
- `src/lib/model-data/__tests__/pipeline.test.ts`
- `src/lib/model-data/auth.ts`
- `src/lib/model-data/core.ts`
- `src/lib/model-data/member-feedback.ts`
- `src/lib/model-data/pitches.ts`
- `src/lib/model-data/provider.ts`
- `src/lib/model-data/sources.ts`
- `src/lib/model-data/store.ts`
- `src/lib/narrative-critic.ts`
- `src/lib/pitch-events.ts`
- `src/lib/session.ts`
- `src/lib/types.ts`
- `src/scripts/generate-charles-intros.ts`
