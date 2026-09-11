import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({ memos: vi.fn(), composite: vi.fn() }))
vi.mock('@/lib/db', () => ({ getUserVoiceMemos: mocks.memos, getCompositeProfile: mocks.composite }))
import { GET } from '@/app/api/extraction-status/route'
describe('profile processing progress', () => {
 it('excludes replaced recordings so they cannot hold the native spinner open', async () => {
  mocks.memos.mockResolvedValue([
   { id: 'active', transcript: 'A complete answer.', extraction: {}, processing_status: 'extracted' },
   { id: 'old', transcript: null, extraction: null, processing_status: 'replaced' },
  ])
  mocks.composite.mockResolvedValue({ memo_count: 1 })
  const result = await GET(new NextRequest('https://fixture.invalid/api/extraction-status?userId=fixture'))
  expect(await result.json()).toMatchObject({ total: 1, transcribed: 1, extracted: 1, compositeReady: true, failedMemos: [] })
 })
 it('rejects missing member ID rather than returning misleading progress', async () => {
  const result = await GET(new NextRequest('https://fixture.invalid/api/extraction-status'))
  expect(result.status).toBe(400)
 })
})
