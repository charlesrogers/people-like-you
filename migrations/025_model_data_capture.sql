-- Operational capture only. No training permission, cohort assignment, or export is implied.
CREATE TABLE IF NOT EXISTS model_data_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 kind text NOT NULL,
 record_key text NOT NULL UNIQUE,
 payload jsonb NOT NULL,
 payload_hash text NOT NULL,
 person_ids uuid[] NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(),
 training_eligible boolean NOT NULL DEFAULT false CHECK (training_eligible = false)
);
CREATE INDEX IF NOT EXISTS model_data_people_idx ON model_data_records USING gin(person_ids);
CREATE INDEX IF NOT EXISTS model_data_kind_idx ON model_data_records(kind, created_at);
CREATE TABLE IF NOT EXISTS model_data_edges (
 child_id uuid NOT NULL REFERENCES model_data_records(id) ON DELETE CASCADE,
 parent_id uuid NOT NULL REFERENCES model_data_records(id) ON DELETE CASCADE,
 PRIMARY KEY(child_id,parent_id), CHECK(child_id <> parent_id)
);
CREATE INDEX IF NOT EXISTS model_data_parent_idx ON model_data_edges(parent_id);
CREATE TABLE IF NOT EXISTS model_data_invalidations (
 record_id uuid PRIMARY KEY REFERENCES model_data_records(id) ON DELETE CASCADE,
 reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS model_data_attempts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 job_id uuid NOT NULL REFERENCES model_data_records(id) ON DELETE CASCADE,
 attempt_number integer NOT NULL,
 status text NOT NULL DEFAULT 'started' CHECK(status IN ('started','completed','provider_failed','parse_failed')),
 started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
 response jsonb, parsed_output jsonb, request_id text, usage jsonb,
 latency_ms integer, error_code text,
 UNIQUE(job_id,attempt_number)
);
CREATE TABLE IF NOT EXISTS model_data_erasure_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 reason text NOT NULL, records_removed integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS model_data_settings (
 id boolean PRIMARY KEY DEFAULT true CHECK(id), capture_enabled boolean NOT NULL DEFAULT false
);
INSERT INTO model_data_settings(id,capture_enabled) VALUES(true,false) ON CONFLICT DO NOTHING;

ALTER TABLE voice_memos ADD COLUMN IF NOT EXISTS question_record_id uuid REFERENCES model_data_records(id) ON DELETE SET NULL;
ALTER TABLE voice_memos ADD COLUMN IF NOT EXISTS transcript_record_id uuid REFERENCES model_data_records(id) ON DELETE SET NULL;
ALTER TABLE voice_memos ADD COLUMN IF NOT EXISTS analysis_record_id uuid REFERENCES model_data_records(id) ON DELETE SET NULL;
ALTER TABLE composite_profiles ADD COLUMN IF NOT EXISTS synthesis_record_id uuid REFERENCES model_data_records(id) ON DELETE SET NULL;
ALTER TABLE daily_intros ADD COLUMN IF NOT EXISTS pitch_revision_id uuid REFERENCES model_data_records(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION model_data_append(p_kind text,p_key text,p_payload jsonb,p_people uuid[],p_parents uuid[])
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result_id uuid; existing_hash text; h text; people uuid[];
BEGIN
 IF EXISTS(SELECT 1 FROM unnest(p_parents) p WHERE NOT EXISTS(SELECT 1 FROM model_data_records r WHERE r.id=p)) THEN RAISE EXCEPTION 'Missing lineage parent'; END IF;
 SELECT coalesce(array_agg(DISTINCT person ORDER BY person), '{}') INTO people FROM (
  SELECT unnest(p_people) person UNION SELECT unnest(r.person_ids) FROM model_data_records r WHERE r.id=ANY(p_parents)
 ) q WHERE person IS NOT NULL;
 IF EXISTS(SELECT 1 FROM unnest(people) p WHERE NOT EXISTS(SELECT 1 FROM users u WHERE u.id=p)) THEN RAISE EXCEPTION 'Unknown lineage person'; END IF;
 h:=encode(sha256(convert_to(jsonb_build_object('kind',p_kind,'payload',p_payload,'people',people,'parents',(SELECT coalesce(jsonb_agg(x ORDER BY x),'[]') FROM unnest(p_parents) x))::text,'UTF8')),'hex');
 INSERT INTO model_data_records(kind,record_key,payload,payload_hash,person_ids) VALUES(p_kind,p_key,p_payload,h,people)
 ON CONFLICT(record_key) DO NOTHING RETURNING id INTO result_id;
 IF result_id IS NULL THEN
  SELECT id,payload_hash INTO result_id,existing_hash FROM model_data_records WHERE record_key=p_key;
  IF existing_hash<>h THEN RAISE EXCEPTION 'Idempotency key payload mismatch'; END IF;
 END IF;
 INSERT INTO model_data_edges(child_id,parent_id) SELECT result_id,x FROM unnest(p_parents) x ON CONFLICT DO NOTHING;
 IF EXISTS(SELECT 1 FROM model_data_invalidations WHERE record_id=ANY(p_parents)) THEN
  INSERT INTO model_data_invalidations(record_id,reason) VALUES(result_id,'stale_parent') ON CONFLICT DO NOTHING;
 END IF;
 RETURN result_id;
END $$;

CREATE OR REPLACE FUNCTION model_data_start_attempt(p_job uuid) RETURNS SETOF model_data_attempts
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer;
BEGIN
 PERFORM id FROM model_data_records WHERE id=p_job AND kind='model_job' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Missing model job'; END IF;
 SELECT coalesce(max(attempt_number),0)+1 INTO n FROM model_data_attempts WHERE job_id=p_job;
 RETURN QUERY INSERT INTO model_data_attempts(job_id,attempt_number) VALUES(p_job,n) RETURNING *;
END $$;

CREATE OR REPLACE FUNCTION model_data_stale(p_roots uuid[],p_reason text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
 WITH RECURSIVE affected(id) AS (
  SELECT unnest(p_roots) UNION SELECT e.child_id FROM model_data_edges e JOIN affected a ON e.parent_id=a.id
 ) INSERT INTO model_data_invalidations(record_id,reason)
 SELECT id,p_reason FROM affected WHERE id IN(SELECT id FROM model_data_records) ON CONFLICT DO NOTHING;
$$;
CREATE OR REPLACE FUNCTION model_data_purge(p_roots uuid[],p_reason text) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer; targets uuid[];
BEGIN
 WITH RECURSIVE affected(id) AS (
  SELECT unnest(p_roots) UNION SELECT e.child_id FROM model_data_edges e JOIN affected a ON e.parent_id=a.id
 ) SELECT array_agg(id) INTO targets FROM affected;
 DELETE FROM daily_intros WHERE pitch_revision_id=ANY(targets);
 DELETE FROM model_data_records WHERE id=ANY(targets);
 GET DIAGNOSTICS n=ROW_COUNT;
 INSERT INTO model_data_erasure_events(reason,records_removed) VALUES(p_reason,n);
 RETURN n;
END $$;
CREATE OR REPLACE FUNCTION model_data_purge_person(p_person uuid,p_reason text DEFAULT 'revocation') RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 RETURN model_data_purge(ARRAY(SELECT id FROM model_data_records WHERE p_person=ANY(person_ids)),p_reason);
END $$;
CREATE OR REPLACE FUNCTION model_data_before_user_delete() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN PERFORM model_data_purge_person(OLD.id,'account_deleted'); RETURN OLD; END $$;
DROP TRIGGER IF EXISTS model_data_user_delete ON users;
CREATE TRIGGER model_data_user_delete BEFORE DELETE ON users FOR EACH ROW EXECUTE FUNCTION model_data_before_user_delete();
CREATE OR REPLACE FUNCTION model_data_memo_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='DELETE' THEN
  PERFORM model_data_purge(array_remove(ARRAY[OLD.question_record_id,OLD.transcript_record_id,OLD.analysis_record_id],NULL),'answer_deleted'); RETURN OLD;
 END IF;
 IF NEW.transcript IS DISTINCT FROM OLD.transcript OR (NEW.processing_status='replaced' AND OLD.processing_status IS DISTINCT FROM 'replaced') THEN
  PERFORM model_data_stale(array_remove(ARRAY[OLD.transcript_record_id,OLD.analysis_record_id],NULL),'answer_changed');
  NEW.transcript_record_id:=NULL; NEW.analysis_record_id:=NULL;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS model_data_memo_change ON voice_memos;
CREATE TRIGGER model_data_memo_change BEFORE UPDATE OF transcript,processing_status OR DELETE ON voice_memos FOR EACH ROW EXECUTE FUNCTION model_data_memo_change();
CREATE OR REPLACE FUNCTION model_data_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Captured records are immutable; append a correction'; END $$;
DROP TRIGGER IF EXISTS model_data_immutable ON model_data_records;
CREATE TRIGGER model_data_immutable BEFORE UPDATE ON model_data_records FOR EACH ROW EXECUTE FUNCTION model_data_immutable();
CREATE OR REPLACE FUNCTION model_data_attempt_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.status<>'started' OR NEW.job_id<>OLD.job_id OR NEW.attempt_number<>OLD.attempt_number OR NEW.started_at<>OLD.started_at THEN RAISE EXCEPTION 'Completed attempts are immutable'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS model_data_attempt_immutable ON model_data_attempts;
CREATE TRIGGER model_data_attempt_immutable BEFORE UPDATE ON model_data_attempts FOR EACH ROW EXECUTE FUNCTION model_data_attempt_immutable();

-- Once enabled, even direct database writers must link the exact immutable revision.
CREATE OR REPLACE FUNCTION model_data_delivery_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE revision model_data_records;
BEGIN
 IF NOT coalesce((SELECT capture_enabled FROM model_data_settings WHERE id=true),false) THEN RETURN NEW; END IF;
 SELECT * INTO revision FROM model_data_records WHERE id=NEW.pitch_revision_id AND kind='pitch_revision';
 IF NOT FOUND OR revision.payload->>'text' IS DISTINCT FROM NEW.narrative
   OR revision.payload->>'readerId' IS DISTINCT FROM NEW.user_id::text
   OR revision.payload->>'subjectId' IS DISTINCT FROM NEW.matched_user_id::text
   OR EXISTS(SELECT 1 FROM model_data_invalidations WHERE record_id=NEW.pitch_revision_id)
 THEN RAISE EXCEPTION 'Exact current pitch revision required'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS model_data_delivery_guard ON daily_intros;
CREATE TRIGGER model_data_delivery_guard BEFORE INSERT OR UPDATE OF narrative,pitch_revision_id ON daily_intros
FOR EACH ROW EXECUTE FUNCTION model_data_delivery_guard();

CREATE OR REPLACE FUNCTION model_data_set_transcript(p_memo uuid,p_person uuid,p_text text,p_record uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM id FROM voice_memos WHERE id=p_memo AND user_id=p_person AND processing_status IS DISTINCT FROM 'replaced' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Answer not found'; END IF;
 IF NOT EXISTS(SELECT 1 FROM model_data_records WHERE id=p_record AND kind='transcript' AND payload->>'text'=p_text AND p_person=ANY(person_ids)) THEN RAISE EXCEPTION 'Correction snapshot mismatch'; END IF;
 UPDATE voice_memos SET transcript=p_text,processing_status='pending',extraction=NULL,processing_error=NULL WHERE id=p_memo;
 UPDATE voice_memos SET transcript_record_id=p_record,analysis_record_id=NULL WHERE id=p_memo;
END $$;

CREATE OR REPLACE FUNCTION model_data_status() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path=public AS $$
SELECT jsonb_build_object(
 'captureEnabled',(SELECT capture_enabled FROM model_data_settings WHERE id=true),
 'recordsByKind',(SELECT coalesce(jsonb_object_agg(kind,n),'{}') FROM (SELECT kind,count(*) n FROM model_data_records GROUP BY kind) q),
 'attemptsByStatus',(SELECT coalesce(jsonb_object_agg(status,n),'{}') FROM (SELECT status,count(*) n FROM model_data_attempts GROUP BY status) q),
 'staleRecords',(SELECT count(*) FROM model_data_invalidations),
 'subjectsWithTranscripts',(SELECT count(DISTINCT payload->>'personId') FROM model_data_records WHERE kind='transcript'),
 'quoteFailures',(SELECT count(*) FROM model_data_records r, LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(r.payload->'quoteChecks')='array' THEN r.payload->'quoteChecks' ELSE '[]'::jsonb END) q WHERE q->>'valid'='false' OR (q ? 'span' AND q->'span'='null'::jsonb)),
 'unlinkedPitchRevisions',(SELECT count(*) FROM model_data_records WHERE kind='pitch_revision' AND payload->>'revisionSource'='fallback_or_unlinked_legacy'),
 'unlinkedFeedback',(SELECT count(*) FROM model_data_records WHERE kind='feedback' AND payload->>'linkStatus'='unlinked_legacy'),
 'trainingEligible',0,'approvedExamples',0,'datasetReadiness','not_evaluated_no_review_or_permission_workflow'
);
$$;

CREATE OR REPLACE FUNCTION model_data_profile_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.synthesis_record_id IS NOT NULL AND EXISTS(SELECT 1 FROM model_data_invalidations WHERE record_id=NEW.synthesis_record_id) THEN RAISE EXCEPTION 'Stale synthesis cannot replace profile'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS model_data_profile_guard ON composite_profiles;
CREATE TRIGGER model_data_profile_guard BEFORE INSERT OR UPDATE OF synthesis_record_id ON composite_profiles FOR EACH ROW EXECUTE FUNCTION model_data_profile_guard();

DO $$ DECLARE t text; f record; BEGIN
 FOREACH t IN ARRAY ARRAY['model_data_records','model_data_edges','model_data_invalidations','model_data_attempts','model_data_erasure_events','model_data_settings'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('REVOKE ALL ON %I FROM anon, authenticated',t);
  EXECUTE format('GRANT ALL ON %I TO service_role',t);
 END LOOP;
 FOR f IN SELECT oid::regprocedure signature FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname LIKE 'model_data_%' LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role',f.signature);
 END LOOP;
END $$;
