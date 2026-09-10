import { execFile } from 'node:child_process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const SAMPLE_RATE = 8000
const BYTES_PER_SAMPLE = 2

/** Decode actual audio samples: client fields and container duration tags are not authoritative.
 * Limit decoding to five minutes to bound resources; this does not auto-stop the recorder.
 */
export async function measureAudioDuration(audio: File): Promise<number> {
  const dir = await mkdtemp(join(tmpdir(), 'ply-audio-'))
  try {
    const path = join(dir, 'recording')
    await writeFile(path, Buffer.from(await audio.arrayBuffer()))
    const { stdout } = await execFileAsync('ffmpeg', [
      '-v', 'error', '-nostdin', '-protocol_whitelist', 'file,pipe',
      '-i', path, '-map', '0:a:0', '-vn', '-sn', '-t', '300',
      '-ac', '1', '-ar', String(SAMPLE_RATE), '-f', 's16le', 'pipe:1',
    ], { encoding: 'buffer', timeout: 30_000, maxBuffer: 5 * 1024 * 1024 })
    const seconds = stdout.length / (SAMPLE_RATE * BYTES_PER_SAMPLE)
    if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('No decodable audio')
    return seconds
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
