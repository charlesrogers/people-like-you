import { afterEach,beforeEach,expect,it,vi } from 'vitest'
import { apiFetch } from '../../api-client'
const mock=vi.hoisted(()=>({refresh:vi.fn()}))
vi.mock('../../supabase',()=>({createBrowserClient:()=>({auth:{refreshSession:mock.refresh}})}))
beforeEach(()=>{
 const values=new Map([['ply_access_token','old-fixture-token'],['ply_refresh_token','fixture-refresh']])
 vi.stubGlobal('localStorage',{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v),removeItem:(k:string)=>values.delete(k)})
 vi.stubGlobal('window',{location:{href:''}})
})
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks()})
it('authenticates multipart capture without setting a broken content type',async()=>{
 const fetch=vi.fn().mockResolvedValue(new Response('{}'))
 vi.stubGlobal('fetch',fetch)
 await apiFetch('/api/voice-memo',{method:'POST',body:new FormData()})
 const headers=fetch.mock.calls[0][1].headers as Headers
 expect(headers.get('authorization')).toBe('Bearer old-fixture-token')
 expect(headers.has('content-type')).toBe(false)
})
it('refreshes the stored token and retries capture with the new token',async()=>{
 const fetch=vi.fn().mockResolvedValueOnce(new Response('{}',{status:401})).mockResolvedValue(new Response('{}'))
 vi.stubGlobal('fetch',fetch)
 mock.refresh.mockResolvedValue({data:{session:{access_token:'new-fixture-token',refresh_token:'new-fixture-refresh'}},error:null})
 await apiFetch('/api/feedback',{method:'POST',body:'fixture'})
 expect(mock.refresh).toHaveBeenCalledWith({refresh_token:'fixture-refresh'})
 expect((fetch.mock.calls[1][1].headers as Headers).get('authorization')).toBe('Bearer new-fixture-token')
})
it('does not attach the member token to external URLs',async()=>{
 const fetch=vi.fn().mockResolvedValue(new Response('{}'));vi.stubGlobal('fetch',fetch)
 await apiFetch('https://fixture.invalid/api/example')
 expect((fetch.mock.calls[0][1].headers as Headers).has('authorization')).toBe(false)
})
