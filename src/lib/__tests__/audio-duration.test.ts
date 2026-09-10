import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { measureAudioDuration } from '../audio-duration'
import { meetsRecordingMinimum } from '../recording-requirements'

function fixture(seconds: number, format: 'wav' | 'webm' | 'mp4') {
  const codec = format === 'webm' ? ['-c:a', 'libopus'] : format === 'mp4'
    ? ['-c:a', 'aac', '-movflags', 'frag_keyframe+empty_moov+default_base_moof'] : ['-c:a', 'pcm_s16le']
  const data = execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', `sine=frequency=440:duration=${seconds}`,
    ...codec, '-f', format, 'pipe:1'], { maxBuffer: 5 * 1024 * 1024 })
  return new File([new Uint8Array(data)], `recording.${format}`, { type: `audio/${format}` })
}

describe('actual uploaded audio duration', () => {
  it.each([19.999, 20, 20.125])('measures PCM at the exact boundary (%s seconds)', async seconds => {
    const actual = await measureAudioDuration(fixture(seconds, 'wav'))
    expect(actual).toBeCloseTo(seconds, 3)
    expect(meetsRecordingMinimum(actual)).toBe(seconds >= 20)
  })
  it.each(['webm', 'mp4'] as const)('decodes short and qualifying %s recordings without trusting container duration', async format => {
    expect(meetsRecordingMinimum(await measureAudioDuration(fixture(19.5, format)))).toBe(false)
    expect(meetsRecordingMinimum(await measureAudioDuration(fixture(20.2, format)))).toBe(true)
  })
  it('rejects invalid audio', async () => {
    await expect(measureAudioDuration(new File(['not audio'], 'fake.m4a'))).rejects.toThrow()
  })
})
