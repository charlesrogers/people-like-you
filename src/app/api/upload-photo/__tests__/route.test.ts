import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { NextRequest } from 'next/server'
const fixture=vi.hoisted(()=>({allowed:true,upload:vi.fn(),moderate:vi.fn(),save:vi.fn()}))
vi.mock('@/lib/model-data/auth',()=>({captureActorAllowed:async()=>fixture.allowed}))
vi.mock('@/lib/moderation',()=>({moderateImageDataUrl:async(data:string)=>{fixture.moderate(data);return {rejected:false}},screenAndLog:async(_u:unknown,_s:unknown,_c:unknown,result:unknown)=>result}))
vi.mock('@/lib/photos',()=>({signPhotoUrl:async()=>'/signed-fixture'}))
vi.mock('@/lib/db',()=>({savePhoto:async(data:unknown)=>{fixture.save(data);return {id:'fixture',storage_path:'fixture.jpg'}}}))
vi.mock('@/lib/supabase',()=>({createServerClient:()=>({storage:{from:()=>({upload:async(...args:unknown[])=>{fixture.upload(...args);return {error:null}},getPublicUrl:()=>({data:{publicUrl:'/fixture'}})})}})}))
import { POST } from '../route'
function request(bytes:Uint8Array) {
 const body=new FormData();body.append('userId','fixture-owner');body.append('photo',new File([bytes as BlobPart],'camera.HEIC',{type:'image/heic'}))
 return new NextRequest('http://localhost/api/upload-photo',{method:'POST',body})
}
beforeEach(()=>{fixture.allowed=true;vi.clearAllMocks()})
describe('HEIC upload route',()=>{
 it('moderates and stores the converted JPEG, never the raw HEIC',async()=>{
  const response = await POST(request(readFileSync('src/lib/__tests__/fixtures/photo.heic')))
  expect(response.status).toBe(200)
  expect(fixture.moderate.mock.calls[0][0]).toMatch(/^data:image\/jpeg;base64,/)
  const [path,bytes,options]=fixture.upload.mock.calls[0]
  expect(path).toMatch(/\.jpg$/);expect([...bytes.subarray(0,3)]).toEqual([255,216,255]);expect(options.contentType).toBe('image/jpeg')
 })
 it('rejects invalid HEIC before moderation, storage or photo records',async()=>{
  expect((await POST(request(new Uint8Array([1,2,3])))).status).toBe(422)
  expect(fixture.upload).not.toHaveBeenCalled();expect(fixture.moderate).not.toHaveBeenCalled();expect(fixture.save).not.toHaveBeenCalled()
 })
 it('requires ownership before conversion or storage',async()=>{
  fixture.allowed=false;expect((await POST(request(new Uint8Array([1])))).status).toBe(401);expect(fixture.upload).not.toHaveBeenCalled()
 })
})
