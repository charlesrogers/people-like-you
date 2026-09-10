import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { captureStore } from '@/lib/model-data/store'
import { captureCall,withModelContext } from '@/lib/model-data/provider'
import { captureQuestion } from '@/lib/model-data/sources'
import { bytesHash,textHash,hash } from '@/lib/model-data/core'
import { authenticatedProfileOwner } from '@/lib/model-data/auth'
import { moderateText, screenAndLog } from '@/lib/moderation'

export async function POST(req: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY,maxRetries:0 })
  const formData = await req.formData()
  const audio = formData.get('audio') as File | null
  const userId = (formData.get('userId') as string | null) || null

  if (!audio) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
  }

  if (audio.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 25MB)' }, { status: 400 })
  }

  try {
    const store=captureStore();const capture=await store.enabled()
    if(capture) {
      if(!userId || !await authenticatedProfileOwner(req.headers,userId))return NextResponse.json({error:'Authentication required'},{status:401})
    }
    let displayed:unknown=null
    try {displayed=JSON.parse(String(formData.get('promptSnapshot')||'null'))}catch{}
    const question=capture?await captureQuestion(userId!,String(formData.get('promptId')||'standalone_unspecified'),displayed):null
    const outputs:string[]=[]
    const audioSha256=bytesHash(new Uint8Array(await audio.arrayBuffer()))
    const transcription=await withModelContext({people:userId?[userId]:[],parents:question?[question]:[],outputs},()=>captureCall('transcription','standalone-v1','openai','gpt-4o-mini-transcribe',{
      model:'gpt-4o-mini-transcribe',audioSha256,format:audio.type,
    },async()=>{
      const {data,request_id}=await openai.audio.transcriptions.create({model:'gpt-4o-mini-transcribe',file:audio}).withResponse()
      return {data,requestId:request_id,usage:(data as unknown as {usage?:unknown}).usage}
    }))
    if(capture)await store.append('transcript',hash({question,outputs,text:transcription.text}),{
      text:transcription.text,textSha256:textHash(transcription.text),questionId:question,
      provenance:'standalone_transcription_no_answer_row',personId:userId,
    },[userId!],[...(question?[question]:[]),...outputs])

    // Content moderation (Apple 1.2): profile voice memos become member-visible narratives.
    const modResult = await moderateText(transcription.text)
    if (userId) await screenAndLog(userId, 'voice_transcript', 'onboarding_memo', modResult)
    else if (modResult.rejected) console.warn('[transcribe] rejected memo with no userId:', modResult.categories)
    if (modResult.rejected) {
      return NextResponse.json(
        { error: 'That recording goes against our community standards. Please try again.' },
        { status: 422 },
      )
    }

    return NextResponse.json({ text: transcription.text })
  } catch {
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
