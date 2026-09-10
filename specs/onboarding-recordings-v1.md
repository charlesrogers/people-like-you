# V1 recording intake

Approved by Charles on September 9, 2026; implemented September 10.

- Four main recordings, each at least 20 seconds. Keep choice across the existing story categories.
- Show the minimum before recording, elapsed/remaining time during recording, and a clear threshold-reached state.
- Allow stopping/canceling at any time; saving remains unavailable below 20 seconds. Do not auto-stop at the minimum.
- Preserve a valid take after upload failure and allow retry. Cancel and unmount never submit a take.
- Independently decode upload audio on the server; ignore claimed duration. FFmpeg is required locally, in the runtime image, and in the staging test runner. No migration is required.
- Restore only active, qualifying saved takes. Do not delete historical recordings; short takes simply do not satisfy the new intake requirement.
- `/api/onboarding-prompts` is a shared native contract: version, minimumRecordingSeconds, requiredRecordings, angles, and prompts.
- Personalized follow-ups and content-quality gates are deferred to v2. Transcription/extraction for writing introductions remains separate from recording-step completion.
- Sequence: staging engineering checks → production website for Charles and his wife → corrections → native TestFlight for friends. Native implementation in the separate local Xcode project is prepared and simulator-build verified, not distributed yet.

Verification: 153 unit/integration tests including actual WAV/MP4/WebM decoding and forged duration; production Next build; isolated real-browser recorder test with generated microphone audio at phone viewport; native simulator build. Browser harness is outside the repo and never deployed. Full real-member onboarding and real-iPhone microphone testing remain the human walkthrough.
