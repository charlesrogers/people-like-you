import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const fixture = vi.hoisted(() => ({ allowed: true, photo: null as null | {storage_path:string}, storageError: null as null | {message:string}, remove: vi.fn(), deleted: vi.fn(), filters: [] as [string,string][] }))
vi.mock('@/lib/model-data/auth',()=>({authenticatedProfileOwner:async()=>fixture.allowed}))
vi.mock('@/lib/photos',()=>({signPhotoUrl:async()=>null}))
vi.mock('@/lib/supabase',()=>({createServerClient:()=>({
  from:()=>({
    select:()=>{const query={eq:(key:string,value:string)=>{fixture.filters.push([key,value]);return query},maybeSingle:async()=>({data:fixture.photo,error:null})};return query},
    delete:()=>{fixture.deleted();const query={eq:()=>query,then:(resolve:(value:unknown)=>unknown)=>resolve({error:null})};return query},
  }),
  storage:{from:()=>({remove:async(paths:string[])=>{fixture.remove(paths);return {error:fixture.storageError}}})},
})}))
import { DELETE } from '../route'
const request=()=>new NextRequest('http://localhost/api/photos',{method:'DELETE',body:JSON.stringify({userId:'owner',photoId:'photo'})})
beforeEach(()=>{fixture.allowed=true;fixture.photo=null;fixture.storageError=null;fixture.filters=[];vi.clearAllMocks()})
describe('photo removal ownership and failures',()=>{
 it('rejects unauthenticated requests before accessing storage',async()=>{fixture.allowed=false;expect((await DELETE(request())).status).toBe(401);expect(fixture.remove).not.toHaveBeenCalled()})
 it('cannot remove a different owner’s photo',async()=>{expect((await DELETE(request())).status).toBe(200);expect(fixture.filters).toContainEqual(['user_id','owner']);expect(fixture.filters).toContainEqual(['id','photo']);expect(fixture.deleted).not.toHaveBeenCalled();expect(fixture.remove).not.toHaveBeenCalled()})
 it('keeps the record when storage removal fails so the user can retry',async()=>{fixture.photo={storage_path:'owner/photo.jpg'};fixture.storageError={message:'unavailable'};expect((await DELETE(request())).status).toBe(500);expect(fixture.deleted).not.toHaveBeenCalled()})
 it('removes the owned file and record',async()=>{fixture.photo={storage_path:'owner/photo.jpg'};expect((await DELETE(request())).status).toBe(200);expect(fixture.remove).toHaveBeenCalledWith(['owner/photo.jpg']);expect(fixture.deleted).toHaveBeenCalledOnce()})
})
