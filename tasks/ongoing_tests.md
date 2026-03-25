# Ongoing Tests

## Test 1: Life-Stage Soft Scoring (weight 0.35)

**Started:** 2026-03-25
**North star:** Second date rate (`date_feedback.want_to_see_again = 'yes'`)
**Strongest leading indicator:** Both-engaged chat rate (both users sent 3+ messages)

### Test Design: Natural Experiment

**Group A (scored):** Matches where BOTH users have `life_stage.confidence > 0.3` -- scoring active.
**Group B (skipped):** Matches where scoring was skipped (null or low confidence).

Within Group A:
- **A-high:** `matches.life_stage_score > 0.7`
- **A-low:** `matches.life_stage_score < 0.4`

**Hypothesis:** A-high > A-low > Group B on funnel metrics, biggest gap at chat engagement and second-date rate.

### Prerequisite: Extraction Quality

| Check | Target | Query |
|-------|--------|-------|
| Age-chapter coherence | <10% of "launching" users are 35+ | See query 2 below |
| Coverage | >30% profiles have confidence > 0.3 | See query 1 below |
| Manual review | 80%+ accuracy on 20 random profiles | Manual spot-check |

### Decision Framework

| Signal | Action |
|--------|--------|
| Extraction <30% coverage after 2 weeks | Add onboarding questions that elicit life-stage talk |
| >20% age-chapter misclassification | Revise extraction prompt |
| Chat engagement: A-high > A-low by 15%+ | Strong signal -- life-stage alignment works |
| Second date rate: A-high > A-low by 10%+ | **Increase weight to 0.75** |
| No difference after 50+ matches per group | Remove from scoring, keep for narratives only |
| Scored group WORSE than skipped | **Kill immediately** |

### Timeline

- Week 1: Extraction health check + manual review
- Week 2-3: Monitor like rates and mutual match rates
- Week 4+: Chat engagement and meet-decision data
- Week 8+ (50 matches/group): Decision point

### Monitoring Queries

**1. Extraction health (weekly)**
```sql
SELECT
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN life_stage IS NOT NULL THEN 1 END) as has_life_stage,
  COUNT(CASE WHEN (life_stage->>'confidence')::float > 0.3 THEN 1 END) as scoreable,
  COUNT(CASE WHEN life_stage->>'life_chapter' = 'launching' THEN 1 END) as launching,
  COUNT(CASE WHEN life_stage->>'life_chapter' = 'building' THEN 1 END) as building,
  COUNT(CASE WHEN life_stage->>'life_chapter' = 'established' THEN 1 END) as established,
  COUNT(CASE WHEN life_stage->>'life_chapter' = 'reinventing' THEN 1 END) as reinventing
FROM composite_profiles;
```

**2. Age-chapter coherence**
```sql
SELECT u.first_name, 2026 - u.birth_year as age,
  cp.life_stage->>'life_chapter' as chapter,
  (cp.life_stage->>'confidence')::float as confidence
FROM composite_profiles cp
JOIN users u ON u.id = cp.user_id
WHERE cp.life_stage->>'life_chapter' = 'launching'
  AND u.birth_year IS NOT NULL AND (2026 - u.birth_year) >= 35;
```

**3. Funnel: scored vs skipped (after 50+ matches)**
```sql
WITH match_ls AS (
  SELECT m.id, m.life_stage_score,
    CASE WHEN m.life_stage_score IS NOT NULL THEN 'scored' ELSE 'skipped' END as grp
  FROM matches m WHERE m.created_at > '2026-03-25'
)
SELECT grp,
  COUNT(DISTINCT di.id) as intros,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN di.status = 'liked' THEN di.id END) /
    NULLIF(COUNT(DISTINCT di.id), 0), 1) as like_rate_pct,
  COUNT(DISTINCT mm.id) as mutual_matches
FROM match_ls mls
LEFT JOIN daily_intros di ON di.match_id = mls.id
LEFT JOIN mutual_matches mm ON mm.match_id = mls.id
GROUP BY grp;
```

**4. Dose-response (after 100+ scored matches)**
```sql
SELECT
  CASE
    WHEN life_stage_score > 0.7 THEN 'high'
    WHEN life_stage_score > 0.4 THEN 'mid'
    ELSE 'low'
  END as alignment,
  COUNT(*) as matches,
  ROUND(100.0 * COUNT(CASE WHEN di.status = 'liked' THEN 1 END) /
    NULLIF(COUNT(*), 0), 1) as like_rate_pct
FROM matches m
LEFT JOIN daily_intros di ON di.match_id = m.id
WHERE m.life_stage_score IS NOT NULL AND m.created_at > '2026-03-25'
GROUP BY 1 ORDER BY 1;
```
