import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
const mocks = vi.hoisted(() => ({
  measure: vi.fn(), save: vi.fn(), replace: vi.fn(), get: vi.fn(), upload: vi.fn(), client: vi.fn(),
}))
vi.mock('@/lib/audio-duration', () => ({ measureAudioDuration: mocks.measure }))
vi.mock('@/lib/db', () => ({ saveVoiceMemo: mocks.save, markReplacedMemosForPrompt: mocks.replace, getUserVoiceMemos: mocks.get }))
vi.mock('@/lib/supabase', () => ({ createServerClient: mocks.client }))
import { POST, GET } from '@/app/api/voice-memo/route'

function request(claimedSeconds = '90') {
  const body = new FormData()
  body.set('audio', new File(['fixture'], 'memo.m4a', { type: 'audio/mp4' }))
  body.set('userId', 'member'); body.set('promptId', 'rabbit_hole'); body.set('durationSeconds', claimedSeconds)
  return new NextRequest('http://localhost/api/voice-memo', { method: 'POST', body })
}
beforeEach(() => {
  vi.resetAllMocks()
  mocks.client.mockReturnValue({ storage: { from: () => ({ upload: mocks.upload }) } })
  mocks.upload.mockResolvedValue({ error: null }); mocks.save.mockResolvedValue({ id: 'saved' })
})
describe('voice memo intake', () => {
  it('rejects a short clip with forged duration before replacing or storing anything', async () => {
    mocks.measure.mockResolvedValue(19.999)
    const res = await POST(request('90'))
    expect(res.status).toBe(422)
    expect(mocks.client).not.toHaveBeenCalled()
    expect(mocks.replace).not.toHaveBeenCalled()
    expect(mocks.save).not.toHaveBeenCalled()
  })
  it('stores and returns the measured duration, even when the client claims zero', async () => {
    mocks.measure.mockResolvedValue(20.25)
    const res = await POST(request('0'))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ id: 'saved', duration_seconds: 20 })
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ duration_seconds: 20 }))
  })
  it('does not discard an old recording when validation infrastructure is unavailable', async () => {
    mocks.measure.mockRejectedValue(Object.assign(new Error('missing ffmpeg'), { code: 'ENOENT' }))
    expect((await POST(request())).status).toBe(503)
    expect(mocks.replace).not.toHaveBeenCalled()
  })
  it('omits replaced recordings from resume data', async () => {
    mocks.get.mockResolvedValue([
      { id: 'old', prompt_id: 'p', duration_seconds: 25, processing_status: 'replaced' },
      { id: 'new', prompt_id: 'p', duration_seconds: 21, processing_status: 'pending' },
    ])
    const res = await GET(new NextRequest('http://localhost/api/voice-memo?userId=member'))
    expect((await res.json()).memos.map((m: { id: string }) => m.id)).toEqual(['new'])
  })
})
