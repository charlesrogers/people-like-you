-- 014: Funnel v2 — chat-era funnel metrics, per-user journey (velocity) view,
-- per-metro gender ratio, and a refresh function.
--
-- Replaces the Phase-1 funnel_metrics materialized view, which measured the
-- superseded disclosure-exchange flow (always-zero columns after the
-- constrained-chat pivot) and was never refreshed or rendered anywhere.
-- See specs/roadmap-2026-07.md §2 (Measurement) and §5h (date verification).

-- ─── Funnel metrics (weekly, by intro-delivery week) ───
DROP MATERIALIZED VIEW IF EXISTS funnel_metrics;

CREATE MATERIALIZED VIEW funnel_metrics AS
SELECT
  date_trunc('week', di.created_at) AS week,
  COUNT(DISTINCT di.id) AS intros_delivered,
  COUNT(DISTINCT CASE WHEN di.status = 'liked' THEN di.id END) AS interested,
  COUNT(DISTINCT mm.id) AS mutual_matches,
  COUNT(DISTINCT CASE WHEN mm.chat_started_at IS NOT NULL THEN mm.id END) AS chats_started,
  -- both privately said yes at the blind meet-decision (status advanced past 'deciding')
  COUNT(DISTINCT CASE WHEN mm.status IN ('planning', 'date_scheduled', 'date_completed', 'relationship') THEN mm.id END) AS mutual_meet_yes,
  COUNT(DISTINCT sd.id) AS dates_scheduled,
  COUNT(DISTINCT CASE WHEN sd.status IN ('confirmed', 'completed') THEN sd.id END) AS dates_confirmed,
  -- V0: assumed complete (post-date-checkin cron flips status 2.5h after scheduled time)
  COUNT(DISTINCT CASE WHEN sd.status = 'completed' THEN sd.id END) AS dates_completed,
  -- V1: verified — both sides submitted post-date feedback
  COUNT(DISTINCT CASE WHEN sd.status = 'completed' AND fb.feedback_count = 2 THEN sd.id END) AS dates_verified,
  COUNT(DISTINCT CASE WHEN df.want_to_see_again = 'yes' THEN df.id END) AS want_second_date,
  -- pair had a second completed date
  COUNT(DISTINCT CASE WHEN cd.completed_count >= 2 THEN mm.id END) AS second_dates,
  COUNT(DISTINCT CASE WHEN mm.status = 'relationship' OR es.reason = 'found_someone_ply' THEN mm.id END) AS relationships
FROM daily_intros di
LEFT JOIN mutual_matches mm ON mm.match_id = di.match_id
LEFT JOIN scheduled_dates sd ON sd.mutual_match_id = mm.id
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS feedback_count
  FROM date_feedback df2
  WHERE df2.scheduled_date_id = sd.id
) fb ON true
LEFT JOIN date_feedback df ON df.scheduled_date_id = sd.id
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS completed_count
  FROM scheduled_dates sd2
  WHERE sd2.mutual_match_id = mm.id AND sd2.status = 'completed'
) cd ON true
LEFT JOIN exit_surveys es ON es.found_match_id = di.match_id
GROUP BY 1
ORDER BY 1 DESC;

-- ─── Per-user journey (velocity source: elapsed time between funnel stages) ───
DROP MATERIALIZED VIEW IF EXISTS user_journey;

CREATE MATERIALIZED VIEW user_journey AS
SELECT
  u.id AS user_id,
  u.is_seed,
  u.gender,
  u.metro_code,
  u.created_at AS signup_at,
  fi.first_intro_at,
  fm.first_mutual_at,
  fd.first_date_at,
  EXTRACT(EPOCH FROM (fi.first_intro_at - u.created_at)) / 86400.0 AS days_signup_to_intro,
  EXTRACT(EPOCH FROM (fm.first_mutual_at - u.created_at)) / 86400.0 AS days_signup_to_mutual,
  EXTRACT(EPOCH FROM (fd.first_date_at - fm.first_mutual_at)) / 86400.0 AS days_mutual_to_date,
  -- North star: signup → first completed date
  EXTRACT(EPOCH FROM (fd.first_date_at - u.created_at)) / 86400.0 AS days_signup_to_date
FROM users u
LEFT JOIN LATERAL (
  SELECT MIN(di.created_at) AS first_intro_at
  FROM daily_intros di WHERE di.user_id = u.id
) fi ON true
LEFT JOIN LATERAL (
  SELECT MIN(mm.created_at) AS first_mutual_at
  FROM mutual_matches mm
  WHERE mm.user_a_id = u.id OR mm.user_b_id = u.id
) fm ON true
LEFT JOIN LATERAL (
  SELECT MIN(sd.scheduled_at) AS first_date_at
  FROM scheduled_dates sd
  JOIN mutual_matches mm2 ON mm2.id = sd.mutual_match_id
  WHERE sd.status = 'completed'
    AND (mm2.user_a_id = u.id OR mm2.user_b_id = u.id)
) fd ON true;

-- ─── Per-metro gender ratio (live view — pool health) ───
CREATE OR REPLACE VIEW pool_gender_ratio AS
SELECT
  COALESCE(u.metro_code, 'unknown') AS metro_code,
  COUNT(*) FILTER (WHERE u.gender = 'Man') AS men,
  COUNT(*) FILTER (WHERE u.gender = 'Woman') AS women,
  COUNT(*) FILTER (WHERE u.gender = 'Man' AND NOT u.is_seed) AS real_men,
  COUNT(*) FILTER (WHERE u.gender = 'Woman' AND NOT u.is_seed) AS real_women
FROM users u
WHERE u.profile_status = 'active'
GROUP BY 1
ORDER BY (COUNT(*)) DESC;

-- ─── Refresh helper (called via RPC from the admin funnel API) ───
CREATE OR REPLACE FUNCTION refresh_funnel_views() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW funnel_metrics;
  REFRESH MATERIALIZED VIEW user_journey;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
