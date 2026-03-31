import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Until domain is verified, use Resend's default sender
// After verification, switch to: hello@people-like-you.com
const FROM = process.env.EMAIL_FROM || 'People Like You <onboarding@resend.dev>'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // strip HTML for plain text fallback
    })

    if (error) {
      console.error('[email] Send failed:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true, id: data?.id }
  } catch (err) {
    console.error('[email] Exception:', err)
    return { ok: false, error: String(err) }
  }
}

// ─── Email Templates ───

export async function sendWelcomeEmail(to: string, firstName: string) {
  return sendEmail({
    to,
    subject: `Welcome to People Like You, ${firstName}!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #111;">Welcome, ${firstName} 👋</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
          You're in. We're building your taste map from your voice memos — the more you share, the better your matches will be.
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
          Your first introduction is coming soon. We'll notify you when it's ready.
        </p>
        <p style="font-size: 14px; color: #888; margin-top: 32px;">— The People Like You team</p>
      </div>
    `,
  })
}

export async function sendMatchNotification(to: string, firstName: string) {
  return sendEmail({
    to,
    subject: `${firstName}, you have a new introduction!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #111;">New introduction 💫</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
          We found someone we think you'll click with. Check your dashboard to read their story.
        </p>
        <a href="https://people-like-you.com/dashboard"
           style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #6d28d9; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
          See your match
        </a>
        <p style="font-size: 14px; color: #888; margin-top: 32px;">— The People Like You team</p>
      </div>
    `,
  })
}

export async function sendDateReminder(to: string, firstName: string, partnerName: string, venue: string, time: string) {
  return sendEmail({
    to,
    subject: `Reminder: Date with ${partnerName} tomorrow`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; color: #111;">Date tomorrow! 📅</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
          Hey ${firstName}, just a reminder — you're meeting ${partnerName} tomorrow.
        </p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-size: 15px; color: #333;"><strong>Where:</strong> ${venue}</p>
          <p style="margin: 4px 0 0; font-size: 15px; color: #333;"><strong>When:</strong> ${time}</p>
        </div>
        <p style="font-size: 14px; color: #888; margin-top: 32px;">— The People Like You team</p>
      </div>
    `,
  })
}
