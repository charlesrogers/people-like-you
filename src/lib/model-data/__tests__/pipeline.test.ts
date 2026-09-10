import { afterAll,beforeAll,describe,expect,it,vi } from 'vitest'
import { fixture,SUBJECT,READER,MEMO } from './fixtures'
import { withCaptureStore } from '../store'
import { generateTrailer } from '../../intro-engine-v2'
import type { CompositeProfile,User } from '../../types'
const mock=vi.hoisted(()=>({memos:[] as Record<string,unknown>[],inputs:[] as string[],inventQuotes:false}))
vi.mock('../../supabase',()=>({createServerClient:()=>({from:()=>({select:()=>({in:()=>({neq:async()=>({data:mock.memos,error:null})})})})})}))
vi.mock('@anthropic-ai/sdk',()=>({default:class {
 messages={create:(input:{messages:{content:string}[]})=>({withResponse:async()=>{
  const prompt=input.messages[0].content;mock.inputs.push(prompt)
  const isCritic=prompt.includes('critical_blockers')
  const regenerate=prompt.includes('A previous draft scored poorly')
  const score=prompt.includes('Revised fixture pitch')?5:2
  const text=isCritic?JSON.stringify({critical_blockers:[],disclosure_status:'unknown',hook_power:score,intrigue:score,specificity:score,mystery:score,feedback:'fixture feedback'}):mock.inventQuotes?'He said “fabricated quotation”.':regenerate?'Revised fixture pitch. He painted the boat.':'Initial fixture pitch. He painted the boat.'
  return {data:{model:'fixture-model',content:[{type:'text',text}],usage:{input_tokens:10,output_tokens:10}},request_id:`fixture-${mock.inputs.length}`}
 }})}
}}))
let f:Awaited<ReturnType<typeof fixture>>
beforeAll(async()=>{
 f=await fixture()
 const source=await f.store.append('transcript','pipeline-source',{text:'I painted the boat.',personId:SUBJECT},[SUBJECT],[])
 mock.memos=[{id:MEMO,user_id:SUBJECT,transcript_record_id:source,transcript:'I painted the boat.'}]
},30000)
afterAll(async()=>{await f?.db.close()})
const reader={id:READER,first_name:'Fixture Reader'} as User
const subject={id:SUBJECT,first_name:'Fixture Subject'} as User
const profile={interest_tags:['boats'],values:[],passion_indicators:[],kindness_markers:[],notable_quotes:['I painted the boat.']} as unknown as CompositeProfile
describe('actual three-draft pipeline with fixture-only provider',()=>{
 it('captures every initial draft, critique, regeneration, evidence and selected revision',async()=>{
  const result=await withCaptureStore(f.store,()=>generateTrailer(reader,subject,profile,profile,'scene'))
  expect(result.narrative).toBe('Revised fixture pitch. He painted the boat.')
  expect(result.generationAttempts).toBe(2)
  const counts=(await f.db.query<{kind:string,n:number}>('SELECT kind,count(*)::int n FROM model_data_records GROUP BY kind')).rows
  expect(counts.find(r=>r.kind==='pitch_candidate')?.n).toBe(4)
  expect(counts.find(r=>r.kind==='model_output')?.n).toBe(8)
  expect(counts.find(r=>r.kind==='pitch_revision')?.n).toBe(1)
  const critics=mock.inputs.filter(p=>p.includes('critical_blockers'))
  expect(critics).toHaveLength(4)
  expect(critics.every(p=>p.includes('I painted the boat.'))).toBe(true)
  const revision=await f.store.get(result.pitchRevisionId!)
  expect(revision.payload.reviewStatus).toBe('unreviewed')
  expect(revision.person_ids).toEqual([SUBJECT,READER])
 })
 it('retains rejected drafts but refuses a fabricated quote even when the model critic misses it',async()=>{
  mock.inventQuotes=true
  await expect(withCaptureStore(f.store,()=>generateTrailer(reader,subject,profile,profile,'quote'))).rejects.toThrow('No source-supported')
  const revisions=(await f.db.query("SELECT * FROM model_data_records WHERE kind='pitch_revision'")).rows
  expect(revisions).toHaveLength(1)
  const candidates=(await f.db.query<{payload:{quoteChecks:{valid:boolean}[]}}>("SELECT payload FROM model_data_records WHERE kind='pitch_candidate'")).rows
  expect(candidates.filter(c=>c.payload.quoteChecks.some(q=>!q.valid))).toHaveLength(3)
 })
})
