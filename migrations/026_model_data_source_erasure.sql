-- Erasure must remove cached synthesis as well as immutable capture descendants.
CREATE OR REPLACE FUNCTION model_data_purge(p_roots uuid[],p_reason text) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer; targets uuid[];
BEGIN
 WITH RECURSIVE affected(id) AS (
  SELECT unnest(p_roots) UNION SELECT e.child_id FROM model_data_edges e JOIN affected a ON e.parent_id=a.id
 ) SELECT array_agg(id) INTO targets FROM affected;
 DELETE FROM daily_intros WHERE pitch_revision_id=ANY(targets);
 DELETE FROM composite_profiles WHERE synthesis_record_id=ANY(targets);
 DELETE FROM model_data_records WHERE id=ANY(targets);
 GET DIAGNOSTICS n=ROW_COUNT;
 INSERT INTO model_data_erasure_events(reason,records_removed) VALUES(p_reason,n);
 RETURN n;
END $$;
CREATE OR REPLACE FUNCTION model_data_memo_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='DELETE' THEN
  -- Older profiles have no synthesis pointer; do not retain their cached answer material.
  DELETE FROM composite_profiles WHERE user_id=OLD.user_id;
  PERFORM model_data_purge(array_remove(ARRAY[OLD.question_record_id,OLD.transcript_record_id,OLD.analysis_record_id],NULL),'answer_deleted'); RETURN OLD;
 END IF;
 IF NEW.transcript IS DISTINCT FROM OLD.transcript OR (NEW.processing_status='replaced' AND OLD.processing_status IS DISTINCT FROM 'replaced') THEN
  PERFORM model_data_stale(array_remove(ARRAY[OLD.transcript_record_id,OLD.analysis_record_id],NULL),'answer_changed');
  IF OLD.transcript IS NOT NULL THEN
   DELETE FROM composite_profiles WHERE user_id=OLD.user_id AND synthesis_record_id IS NULL;
  END IF;
  NEW.transcript_record_id:=NULL; NEW.analysis_record_id:=NULL;
 END IF;
 RETURN NEW;
END $$;
