# Ongoing Tests

## Test 1: Life-Stage Soft Scoring (weight 0.35)
- **Started:** 2026-03-24
- **Hypothesis:** Extracted life-stage signals (rootedness, pace, chapter, trajectory) improve match quality when scored at 0.35 weight (~8% of total score).
- **What to watch:**
  - Do matches with high life-stage alignment convert to mutual likes more often?
  - Are reinventors being correctly distinguished from launchers? (Spot-check extraction output for users age 35+)
  - Does the 0.35 weight meaningfully change rankings vs. no life-stage scoring?
- **Success criteria:** Life-stage-aligned matches have >=10% higher mutual-like rate than misaligned, after controlling for personality score.
- **Failure criteria:** Reinventing/launching misclassification rate > 20% for users 35+. Or no measurable difference in outcomes.
- **Decision point:** Review after 50 mutual matches have been generated with life-stage scoring active.
- **Next step if successful:** Increase weight to 0.75.
- **Next step if failed:** Remove from scoring, keep extraction for narrative use only.
