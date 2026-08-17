/**
 * Discord alerting for safety-critical events (reports, moderation escalations).
 * Webhook URL is a secret — set DISCORD_SAFETY_WEBHOOK as a Coolify runtime env var.
 * Fails open: a missing/broken webhook must never break the user-facing flow it guards.
 */
const DISCORD_LIMIT = 1900 // 2000 hard cap, leave headroom

/**
 * Post to a specific Discord webhook, splitting on line boundaries so a long message is
 * never silently truncated. Unlike sendDiscordAlert this THROWS on failure — a cron that
 * can't deliver its digest must fail loudly rather than look like a quiet day.
 */
export async function sendDiscordChunked(url: string, content: string): Promise<number> {
  const chunks: string[] = []
  let current = ''
  for (const line of content.split('\n')) {
    // A single line longer than the limit still has to be hard-split.
    if (line.length > DISCORD_LIMIT) {
      if (current) { chunks.push(current); current = '' }
      for (let i = 0; i < line.length; i += DISCORD_LIMIT) chunks.push(line.slice(i, i + DISCORD_LIMIT))
      continue
    }
    if (current.length + line.length + 1 > DISCORD_LIMIT) {
      chunks.push(current)
      current = line
    } else {
      current = current ? `${current}\n${line}` : line
    }
  }
  if (current) chunks.push(current)

  for (const chunk of chunks) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: chunk }),
    })
    if (!res.ok) {
      throw new Error(`Discord webhook returned ${res.status}: ${(await res.text()).slice(0, 200)}`)
    }
  }
  return chunks.length
}

export async function sendDiscordAlert(content: string): Promise<void> {
  const url = process.env.DISCORD_SAFETY_WEBHOOK || process.env.DISCORD_WEBHOOK_URL
  if (!url) {
    console.warn('[alert] DISCORD_SAFETY_WEBHOOK not set — safety alert dropped:', content)
    return
  }
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Discord hard-caps message content at 2000 chars.
      body: JSON.stringify({ content: content.slice(0, 1900) }),
    })
  } catch (err) {
    console.error('[alert] Discord webhook failed:', err)
  }
}
