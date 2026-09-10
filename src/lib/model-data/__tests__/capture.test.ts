import { afterAll,beforeAll,describe,expect,it,vi } from 'vitest'
import { fixture,SUBJECT,READER,MEMO } from './fixtures'
import { withCaptureStore } from '../store'
import { captureCall,withModelContext } from '../provider'
import { CaptureError,checkPitchQuotes,hash,quoteSpan } from '../core'
import { captureAnalysis,snapshotTranscript } from '../sources'
import { captureCandidate,captureRevision,recordDelivery,recordProductFeedback,type PitchCapture } from '../pitches'
let f:Awaited<ReturnType<typeof fixture>>
beforeAll(async()=>{f=await fixture()},30000)
afterAll(async()=>{await f?.db.close()})
let serial=0
const append=(kind:string,payload:unknown={},parents:string[]=[],people=[SUBJECT])=>f.store.append(kind,`fixture-${++serial}`,payload,people,parents)
describe('immutable capture using the actual SQL migration',()=>{
 it('deduplicates identical records, rejects changed payloads and updates',async()=>{
  const id=await f.store.append('transcript','stable',{text:'fixture'},[SUBJECT],[])
  expect(await f.store.append('transcript','stable',{text:'fixture'},[SUBJECT],[])).toBe(id)
  await expect(f.store.append('transcript','stable',{text:'changed'},[SUBJECT],[])).rejects.toThrow('Idempotency')
  await expect(f.db.query("UPDATE model_data_records SET payload='{}' WHERE id=$1",[id])).rejects.toThrow('immutable')
 })
 it('does not permit automatic training eligibility or public reads',async()=>{
  await expect(f.db.exec("INSERT INTO model_data_records(kind,record_key,payload,payload_hash,training_eligible) VALUES('x','forbidden','{}','x',true)")).rejects.toThrow('check constraint')
  await f.db.exec('SET ROLE authenticated')
  await expect(f.db.exec('SELECT * FROM model_data_records')).rejects.toThrow('permission denied')
  await f.db.exec('RESET ROLE')
 })
 it('invalidates all downstream descendants after replacement/correction',async()=>{
  const transcript=await append('transcript');const analysis=await append('analysis',{},[transcript]);const synthesis=await append('synthesis',{},[analysis]);const packet=await append('pitch_packet',{},[synthesis],[READER])
  await f.db.query('UPDATE voice_memos SET transcript_record_id=$1,analysis_record_id=$2 WHERE id=$3',[transcript,analysis,MEMO])
  await f.db.query("UPDATE voice_memos SET transcript='corrected fixture text' WHERE id=$1",[MEMO])
  expect(await f.store.isStale(packet)).toBe(true)
  const descendant=await append('pitch_candidate',{},[packet]);expect(await f.store.isStale(descendant)).toBe(true)
  const memo=(await f.db.query<{transcript_record_id:string|null}>('SELECT * FROM voice_memos WHERE id=$1',[MEMO])).rows[0]
  expect(memo.transcript_record_id).toBeNull()
 })
 it('inherits reader and subject identities into descendants and erases by either owner',async()=>{
  const packet=await append('pitch_packet',{},[],[READER,SUBJECT]);const draft=await append('pitch_candidate',{},[packet],[])
  expect((await f.store.get(draft)).person_ids).toEqual([SUBJECT,READER])
  await f.db.query("SELECT model_data_purge_person($1,'fixture_revocation')",[READER])
  await expect(f.store.get(draft)).rejects.toThrow('Missing record')
  expect((await f.db.query('SELECT * FROM model_data_erasure_events')).rows.length).toBeGreaterThan(0)
 })
 it('checks exact revision identity and text even for direct database writers',async()=>{
  await f.db.exec('UPDATE model_data_settings SET capture_enabled=true')
  await expect(f.db.query('INSERT INTO daily_intros(user_id,matched_user_id,narrative) VALUES($1,$2,$3)',[READER,SUBJECT,'missing'])).rejects.toThrow('revision required')
  const rev=await append('pitch_revision',{text:'fixture pitch',readerId:READER,subjectId:SUBJECT},[],[READER,SUBJECT])
  await f.db.query('INSERT INTO daily_intros(user_id,matched_user_id,narrative,pitch_revision_id) VALUES($1,$2,$3,$4)',[READER,SUBJECT,'fixture pitch',rev])
  await expect(f.db.query('UPDATE daily_intros SET narrative=$1 WHERE pitch_revision_id=$2',['different',rev])).rejects.toThrow('revision required')
  await f.store.stale([rev],'source_changed')
  await expect(f.db.query('INSERT INTO daily_intros(user_id,matched_user_id,narrative,pitch_revision_id) VALUES($1,$2,$3,$4)',[READER,SUBJECT,'fixture pitch',rev])).rejects.toThrow('revision required')
  await f.db.query("SELECT model_data_purge_person($1,'fixture_revocation')",[READER])
  expect((await f.db.query('SELECT * FROM daily_intros WHERE pitch_revision_id=$1',[rev])).rows).toHaveLength(0)
 })
 it('atomically saves a correction, resets processing and refuses mismatched text',async()=>{
  const old=await append('transcript',{text:'old',personId:SUBJECT})
  await f.db.query('UPDATE voice_memos SET transcript_record_id=$1 WHERE id=$2',[old,MEMO])
  const correction=await append('transcript',{text:'corrected',personId:SUBJECT})
  await expect(f.db.query('SELECT model_data_set_transcript($1,$2,$3,$4)',[MEMO,SUBJECT,'wrong',correction])).rejects.toThrow('mismatch')
  await f.db.query('SELECT model_data_set_transcript($1,$2,$3,$4)',[MEMO,SUBJECT,'corrected',correction])
  const memo=(await f.db.query<{transcript:string,transcript_record_id:string,processing_status:string}>('SELECT * FROM voice_memos WHERE id=$1',[MEMO])).rows[0]
  expect(memo).toMatchObject({transcript:'corrected',transcript_record_id:correction,processing_status:'pending'})
  expect(await f.store.isStale(old)).toBe(true)
  expect(await f.store.isStale(correction)).toBe(false)
 })
 it('erases captured lineage on account deletion without retaining identifying tombstones',async()=>{
  const third='00000000-0000-4000-8000-000000000004'
  await f.db.query('INSERT INTO users VALUES($1)',[third])
  const source=await append('transcript',{},[],[third])
  const child=await append('pitch_packet',{},[source],[SUBJECT])
  await f.db.query('DELETE FROM users WHERE id=$1',[third])
  await expect(f.store.get(source)).rejects.toThrow('Missing')
  await expect(f.store.get(child)).rejects.toThrow('Missing')
  const audit=JSON.stringify((await f.db.query('SELECT * FROM model_data_erasure_events')).rows)
  expect(audit).not.toContain(third)
 })
 it('reports capture counts separately from dataset readiness',async()=>{
  const {rows}=await f.db.query<{status:{approvedExamples:number,trainingEligible:number,datasetReadiness:string}}>('SELECT model_data_status() status')
  expect(rows[0].status.approvedExamples).toBe(0)
  expect(rows[0].status.trainingEligible).toBe(0)
  expect(rows[0].status.datasetReadiness).toContain('not_evaluated')
 })
 it('allocates retry numbers atomically and freezes terminal attempts',async()=>{
  const job=await append('model_job');const a=await f.store.start(job);const b=await f.store.start(job)
  expect([a.attempt_number,b.attempt_number]).toEqual([1,2])
  await f.store.finish(a.id,{status:'completed',response:{text:'fixture'}})
  await expect(f.store.finish(a.id,{status:'completed',response:{text:'changed'}})).rejects.toThrow('immutable')
 })
})
describe('provider lineage and evidence (no network or paid model calls)',()=>{
 it('retains raw returns, parsed coding, exact input, model, usage, request ID, and retries',async()=>{
  const invoke=vi.fn().mockRejectedValueOnce({status:429,message:'secret must not persist'}).mockResolvedValue({data:{model:'actual-model',content:[{type:'text',text:'{"claims":[]}'}]},requestId:'fixture-request',usage:{input_tokens:12,output_tokens:8}})
  const outputs:string[]=[]
  await withCaptureStore(f.store,()=>withModelContext({people:[SUBJECT],parents:[],outputs},()=>captureCall('answer_analysis','test-v1','anthropic','requested-model',{system:'fixture exact input',temperature:0.2},invoke,true)))
  const output=await f.store.get(outputs[0]);const job=await f.store.get(String(output.payload.jobId))
  expect(job.payload.assembledInput).toEqual({system:'fixture exact input',temperature:0.2})
  expect(output.payload.actualModelId).toBe('actual-model')
  const attempts=(await f.db.query<{error_code:string,response:unknown,parsed_output:unknown,request_id:string,usage:unknown}>('SELECT * FROM model_data_attempts WHERE job_id=$1 ORDER BY attempt_number',[job.id])).rows
  expect(attempts).toHaveLength(2);expect(attempts[0].error_code).toBe('provider_http_429')
  expect(attempts[1].parsed_output).toEqual({claims:[]});expect(attempts[1].request_id).toBe('fixture-request')
  expect(JSON.stringify(attempts)).not.toContain('secret must not persist')
 })
 it('fails closed if a returned provider response cannot be persisted',async()=>{
  const outputs:string[]=[]
  const call=vi.fn().mockResolvedValue({data:{text:'fixture return'}})
  await expect(withCaptureStore({...f.store,finish:async()=>{throw new CaptureError()}},()=>withModelContext({people:[SUBJECT],parents:[],outputs},()=>captureCall('transcription','write-failure','openai','fixture',{},call)))).rejects.toThrow('capture failed')
  expect(call).toHaveBeenCalledTimes(1)
  expect(outputs).toHaveLength(0)
 })
 it('retains malformed JSON without making an approved analysis',async()=>{
  const outputs:string[]=[]
  await expect(withCaptureStore(f.store,()=>withModelContext({people:[SUBJECT],parents:[],outputs},()=>captureCall('answer_analysis','bad','anthropic','fixture',{},async()=>({data:{content:[{type:'text',text:'not json'}]}}),true)))).rejects.toThrow('invalid JSON')
  expect((await f.store.get(outputs[0])).payload.parseFailed).toBe(true)
 })
 it('refuses calls without ownership or a durable pre-call job',async()=>{
  const call=vi.fn()
  await expect(withCaptureStore(f.store,()=>captureCall('x','v','anthropic','fixture',{},call))).rejects.toThrow('owner/context')
  await expect(withCaptureStore({...f.store,append:async()=>{throw new CaptureError()}},()=>withModelContext({people:[SUBJECT],parents:[],outputs:[]},()=>captureCall('x','v','anthropic','fixture',{},call)))).rejects.toThrow('capture failed')
  expect(call).not.toHaveBeenCalled()
 })
 it('records third-person attribution as third-person and unsupported claims as unknown',async()=>{
  const text='My brother built the boat. I painted it.';const source=await append('transcript',{text})
  const analysis=await withCaptureStore(f.store,()=>captureAnalysis(SUBJECT,source,text,{claims:[{person:'brother',source_text:'My brother built the boat.',epistemic_status:'observed',quote_kind:'paraphrase'},{person:'speaker',source_text:'I sailed around the world',epistemic_status:'observed',quote_kind:'exact_quote'}]},[]))
  const claims=(await f.store.get(analysis)).payload.claims as {personId:string|null,epistemic_status:string,quoteValidation:boolean}[]
  expect(claims[0].personId).toBeNull();expect(claims[1].epistemic_status).toBe('unknown');expect(claims[1].quoteValidation).toBe(false)
 })
 it('handles Unicode offsets and does not label paraphrases as quotes',()=>{
  const text='🙂 I built a boat.';const span=quoteSpan(text,'I built a boat.')!
  expect(text.slice(span.start,span.end)).toBe('I built a boat.')
  expect(checkPitchQuotes('“I made a yacht.”',[{id:'fixture',personId:SUBJECT,text}])[0].valid).toBe(false)
  expect(hash({b:2,a:1})).toBe(hash({a:1,b:2}))
 })
 it('snapshots complete corrected transcripts with source hash and supersession',async()=>{
  await withCaptureStore(f.store,async()=>{
   const memo={id:MEMO,user_id:SUBJECT,prompt_id:'fixture',transcript:null}
   const first=await snapshotTranscript(memo,'First fixture transcript.')
   const second=await snapshotTranscript({...memo,transcript:'First fixture transcript.',transcript_record_id:first},'Corrected fixture transcript.')
   expect((await f.store.get(second!)).payload.supersedesSnapshotId).toBe(first)
   expect((await f.store.get(second!)).payload.textSha256).toMatch(/^[a-f0-9]{64}$/)
  })
 })
 it('keeps all drafts, regeneration, selected revision and exact feedback separately',async()=>{
  await withCaptureStore(f.store,async()=>{
   const packet=await append('pitch_packet',{},[],[READER,SUBJECT]);const context={people:[READER,SUBJECT],parents:[packet],outputs:[]}
   const capture:PitchCapture={packetId:packet,context,sources:[]}
   const drafts=await Promise.all(['a','b','c'].map((text,i)=>captureCandidate(capture,text,`initial-${i}`,[])))
   const regeneration=await captureCandidate(capture,'revised','regeneration',[],{reason:'fixture'})
   const revision=await captureRevision(capture,'revised',[...drafts,regeneration] as string[],regeneration)
   const intro={id:'fixture-intro',user_id:READER,matched_user_id:SUBJECT,narrative:'revised',pitch_revision_id:revision} as Parameters<typeof recordProductFeedback>[0]
   await recordDelivery(intro)
   await recordProductFeedback(intro,READER,revision!,{action:'interested'},'event-1')
   await recordProductFeedback(intro,READER,revision!,{action:'interested'},'event-1')
   await expect(recordProductFeedback(intro,SUBJECT,revision!,{},'wrong')).rejects.toThrow('mismatch')
   await expect(recordDelivery({...intro,narrative:'modified'})).rejects.toThrow('mismatch')
   const feedback=(await f.db.query<{payload:{eventClass:string}}>("SELECT payload FROM model_data_records WHERE kind='feedback' AND record_key=$1",[`feedback:${READER}:event-1`])).rows
   expect(feedback).toHaveLength(1);expect(feedback[0].payload.eventClass).toBe('product_outcome')
   expect((await f.db.query('SELECT * FROM model_data_edges WHERE child_id=$1',[revision])).rows.length).toBeGreaterThanOrEqual(5)
  })
 })
})
