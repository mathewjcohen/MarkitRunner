import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'MarkitRunner <noreply@markitrunner.com>'

export async function sendEmail(to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('Email send error:', error)
    return { error: error.message }
  }

  return { data }
}
