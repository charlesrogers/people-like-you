/**
 * Push notification sender (APNs HTTP/2)
 *
 * Sends push notifications to iOS devices via Apple Push Notification service.
 * Gracefully no-ops if APNs env vars are not configured.
 *
 * Required env vars:
 *   APNS_KEY_ID     — Key ID from Apple Developer portal
 *   APNS_TEAM_ID    — Apple Developer Team ID
 *   APNS_BUNDLE_ID  — App bundle identifier (e.g., com.peoplelikeyou.app)
 *   APNS_KEY        — Base64-encoded .p8 private key contents
 */

import * as http2 from 'node:http2'
import * as crypto from 'node:crypto'
import { createServerClient } from './supabase'

const APNS_HOST = process.env.NODE_ENV === 'production'
  ? 'api.push.apple.com'
  : 'api.sandbox.push.apple.com'

let cachedToken: { jwt: string; expiresAt: number } | null = null

function getApnsJwt(): string | null {
  const keyId = process.env.APNS_KEY_ID
  const teamId = process.env.APNS_TEAM_ID
  const keyBase64 = process.env.APNS_KEY

  if (!keyId || !teamId || !keyBase64) return null

  // Reuse token if valid (APNs tokens last 1 hour, we refresh at 50 min)
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.jwt
  }

  const key = Buffer.from(keyBase64, 'base64').toString('utf8')
  const now = Math.floor(Date.now() / 1000)

  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ iss: teamId, iat: now })).toString('base64url')

  const signer = crypto.createSign('SHA256')
  signer.update(`${header}.${payload}`)
  const signature = signer.sign(key, 'base64url')

  const jwt = `${header}.${payload}.${signature}`
  cachedToken = { jwt, expiresAt: Date.now() + 50 * 60 * 1000 }
  return jwt
}

async function sendToDevice(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<boolean> {
  const jwt = getApnsJwt()
  if (!jwt) return false

  const bundleId = process.env.APNS_BUNDLE_ID
  if (!bundleId) return false

  return new Promise((resolve) => {
    const client = http2.connect(`https://${APNS_HOST}`)

    client.on('error', () => {
      client.close()
      resolve(false)
    })

    const payload = JSON.stringify({
      aps: {
        alert: { title, body },
        sound: 'default',
      },
      ...(data || {}),
    })

    const req = client.request({
      ':method': 'POST',
      ':path': `/3/device/${token}`,
      'authorization': `bearer ${jwt}`,
      'apns-topic': bundleId,
      'apns-push-type': 'alert',
      'content-type': 'application/json',
    })

    req.on('response', (headers) => {
      const status = headers[':status']
      client.close()
      resolve(status === 200)
    })

    req.on('error', () => {
      client.close()
      resolve(false)
    })

    req.end(payload)
  })
}

/**
 * Send a push notification to all of a user's registered devices.
 * Gracefully no-ops if APNs is not configured or user has no tokens.
 */
export async function sendPush(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<{ sent: number; failed: number }> {
  // Check if APNs is configured
  if (!process.env.APNS_KEY_ID || !process.env.APNS_TEAM_ID || !process.env.APNS_KEY) {
    return { sent: 0, failed: 0 }
  }

  const db = createServerClient()
  const { data: tokens } = await db
    .from('device_tokens')
    .select('token, platform')
    .eq('user_id', userId)

  if (!tokens || tokens.length === 0) {
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  for (const { token, platform } of tokens) {
    if (platform === 'ios') {
      const ok = await sendToDevice(token, title, body, data)
      if (ok) sent++
      else failed++
    }
    // Web push can be added here later
  }

  return { sent, failed }
}
