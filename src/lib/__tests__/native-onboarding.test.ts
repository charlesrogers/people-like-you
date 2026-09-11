import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({location:vi.fn(),owner:vi.fn(),from:vi.fn(),update:vi.fn(),upsert:vi.fn(),read:vi.fn(),write:vi.fn()}))
vi.mock('@/lib/geo',()=>({resolveUserLocation:mocks.location}))
vi.mock('@/lib/model-data/auth',()=>({authenticatedProfileOwner:mocks.owner}))
vi.mock('@/lib/supabase',()=>({createServerClient:()=>({from:mocks.from})}))
import { PATCH } from '@/app/api/native-onboarding/route'
const basics={first_name:'Fixture',gender:'Woman',birth_year:1991,zipcode:'84101',email:'new@example.invalid'}
const prefs={age_range_min:30,age_range_max:45,distance_radius:'few_hours',faith_importance:'important',kids:'open'}
function request(body:unknown) {return new NextRequest('https://fixture.invalid/api/native-onboarding',{method:'PATCH',body:JSON.stringify(body)})}
beforeEach(()=>{
 vi.clearAllMocks();mocks.owner.mockResolvedValue(true);mocks.location.mockResolvedValue({latitude:40.7,longitude:-111.8,metro_code:"fixture-metro"})
 mocks.read.mockResolvedValue({data:{id:'fixture-person',email:'existing@example.invalid',phone_number:null},error:null})
 mocks.write.mockResolvedValue({error:null});mocks.upsert.mockResolvedValue({error:null})
 mocks.from.mockImplementation(()=>({select:()=>({eq:()=>({maybeSingle:mocks.read})}),update:(value:unknown)=>{mocks.update(value);return {eq:mocks.write}},upsert:mocks.upsert}))
})
describe('native onboarding persistence',()=>{
 it('rejects an unauthenticated or wrong-owner request before any database access',async()=>{mocks.owner.mockResolvedValue(false);expect((await PATCH(request({userId:'other',section:'basics',basics}))).status).toBe(401);expect(mocks.from).not.toHaveBeenCalled()})
 it('saves basics and the selected gender without replacing an existing email',async()=>{expect((await PATCH(request({userId:'fixture-person',section:'basics',basics}))).status).toBe(200);expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({first_name:'Fixture',gender:'Woman',seeking:'Men',onboarding_stage:'voice'}));expect(mocks.update.mock.calls[0][0]).not.toHaveProperty('email');expect(mocks.write).toHaveBeenCalledWith('id','fixture-person')})
 it('resolves the ZIP for matching and clears stale coordinates if the new ZIP is unknown',async()=>{
 await PATCH(request({userId:'fixture-person',section:'basics',basics}));expect(mocks.location).toHaveBeenCalledWith('84101');expect(mocks.update.mock.calls[0][0]).toMatchObject({latitude:40.7,longitude:-111.8,metro_code:'fixture-metro'})
 mocks.location.mockResolvedValue(null);await PATCH(request({userId:'fixture-person',section:'basics',basics}));expect(mocks.update.mock.calls[1][0]).toMatchObject({latitude:null,longitude:null,metro_code:null})
 })
 it('can collect an optional notification email for a phone-only account',async()=>{mocks.read.mockResolvedValue({data:{id:'fixture-person',email:null,phone_number:'+15550000000'},error:null});expect((await PATCH(request({userId:'fixture-person',section:'basics',basics}))).status).toBe(200);expect(mocks.update.mock.calls[0][0].email).toBe('new@example.invalid')})
 it('does not accept an invalid birth year or ZIP',async()=>{expect((await PATCH(request({userId:'fixture-person',section:'basics',basics:{...basics,birth_year:2020}}))).status).toBe(400);expect(mocks.update).not.toHaveBeenCalled()})
 it('saves preferences to the owner before advancing the stage',async()=>{expect((await PATCH(request({userId:'fixture-person',section:'preferences',preferences:prefs}))).status).toBe(200);expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({...prefs,user_id:'fixture-person'}),{onConflict:'user_id'});expect(mocks.update).toHaveBeenCalledWith({onboarding_stage:'photos'})})
 it('does not advance after a failed preference write',async()=>{mocks.upsert.mockResolvedValue({error:{message:'fixture error'}});expect((await PATCH(request({userId:'fixture-person',section:'preferences',preferences:prefs}))).status).toBe(500);expect(mocks.update).not.toHaveBeenCalled()})
 it('rejects invalid preference options',async()=>{expect((await PATCH(request({userId:'fixture-person',section:'preferences',preferences:{...prefs,kids:'invalid'}}))).status).toBe(400);expect(mocks.upsert).not.toHaveBeenCalled()})
 it('reports a failed user update',async()=>{mocks.write.mockResolvedValue({error:{message:'fixture error'}});expect((await PATCH(request({userId:'fixture-person',section:'basics',basics}))).status).toBe(500)})
})
