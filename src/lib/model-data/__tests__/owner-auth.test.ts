import { beforeEach,expect,it,vi } from 'vitest'
import { authenticatedProfileOwner } from '../auth'
const mock=vi.hoisted(()=>({auth:vi.fn(),profile:vi.fn()}))
vi.mock('../../supabase',()=>({createServerClient:()=>({auth:{getUser:mock.auth},from:()=>({select:()=>({eq:()=>({maybeSingle:mock.profile})})})})}))
const headers=new Headers({authorization:'Bearer fixture-token'})
beforeEach(()=>{vi.resetAllMocks()})
it('accepts the actual auth UUID without consulting an email bridge',async()=>{
 mock.auth.mockResolvedValue({data:{user:{id:'fixture-profile'}},error:null})
 expect(await authenticatedProfileOwner(headers,'fixture-profile')).toBe(true)
 expect(mock.profile).not.toHaveBeenCalled()
})
it('supports a legacy profile through its confirmed auth email',async()=>{
 mock.auth.mockResolvedValue({data:{user:{id:'different-auth-id',email:'fixture@example.invalid',email_confirmed_at:'fixture-confirmed'}},error:null})
 mock.profile.mockResolvedValue({data:{email:'FIXTURE@example.invalid'},error:null})
 expect(await authenticatedProfileOwner(headers,'legacy-profile-id')).toBe(true)
})
it('rejects an unconfirmed email bridge',async()=>{
 mock.auth.mockResolvedValue({data:{user:{id:'different-auth-id',email:'fixture@example.invalid'}},error:null})
 expect(await authenticatedProfileOwner(headers,'legacy-profile-id')).toBe(false)
 expect(mock.profile).not.toHaveBeenCalled()
})
it('rejects another person’s profile and missing credentials',async()=>{
 mock.auth.mockResolvedValue({data:{user:{id:'different-auth-id',email:'fixture@example.invalid',email_confirmed_at:'fixture-confirmed'}},error:null})
 mock.profile.mockResolvedValue({data:{email:'another@example.invalid'},error:null})
 expect(await authenticatedProfileOwner(headers,'other-profile-id')).toBe(false)
 expect(await authenticatedProfileOwner(new Headers(),'other-profile-id')).toBe(false)
})
