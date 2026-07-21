/**
 * Discord alerting for safety-critical events (reports, moderation escalations).
 * Webhook URL is a secret — set DISCORD_SAFETY_WEBHOOK as a Coolify runtime env var.
 * Fails open: a missing/broken webhook must never break the user-facing flow it guards.
 */
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
