import { createHash } from 'node:crypto'

export function canonical(value: unknown): string {
  if (value === undefined) return 'null'
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  return `{${Object.entries(value).filter(([,v]) => v !== undefined).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0).map(([k,v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`
}
export const hash = (value: unknown) => createHash('sha256').update(canonical(value)).digest('hex')
export const textHash = (text: string) => createHash('sha256').update(text,'utf8').digest('hex')
export interface Source { id: string; personId: string; text: string }
export function quoteSpan(text: string, quote: string) {
  const start = quote ? text.indexOf(quote) : -1
  return start < 0 ? null : { start, end: start + quote.length, offsetUnit: 'utf16_code_units', sourceText: quote }
}
export function checkPitchQuotes(pitch: string, sources: Source[]) {
  const quotes = [...pitch.matchAll(/[“"]([^”"\n]+)[”"]/g)].map(m => m[1])
  return quotes.map(quote => {
    const source = sources.find(s => quoteSpan(s.text,quote))
    return { quote, valid: !!source, sourceId: source?.id ?? null, span: source ? quoteSpan(source.text,quote) : null }
  })
}
export class CaptureError extends Error {
  constructor(message = 'Required capture failed; retry before delivery') { super(message); this.name = 'CaptureError' }
}
export function safeError(error: unknown): string {
  // Never persist provider messages, request objects, headers, or arbitrary error text.
  const status = (error as {status?: unknown})?.status
  return typeof status === 'number' ? `provider_http_${status}` : 'provider_or_transport_error'
}

export const bytesHash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
