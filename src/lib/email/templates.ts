export interface WelcomeEmailProps {
  firstName: string | null
}

export interface WeeklySummaryProps {
  firstName: string | null
  completedTasks: number
  totalTasks: number
  businessNames: string[]
  weekOf: string
}

export interface TrialExpiryProps {
  firstName: string | null
  daysLeft: number
}

export function welcomeEmail({ firstName }: WelcomeEmailProps): { subject: string; html: string } {
  const name = firstName ?? 'there'
  return {
    subject: 'Welcome to Tempo — your marketing rhythm starts now',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F5F1;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <p style="font-size:24px;font-weight:600;color:#18160F;margin:0 0 24px 0;font-family:Georgia,serif;">
      Hey ${name}.
    </p>
    <p style="font-size:16px;color:#18160F;line-height:1.7;margin:0 0 16px 0;">
      Welcome to Tempo — the marketing planner built for founders who are running multiple
      businesses and need to stay consistent without burning out.
    </p>
    <p style="font-size:16px;color:#18160F;line-height:1.7;margin:0 0 32px 0;">
      Your trial is active. Add your first business and let Tempo generate your weekly plan.
    </p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard"
       style="display:inline-block;background:#B8601F;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;">
      Get started
    </a>
    <p style="font-size:13px;color:#736C5E;margin:48px 0 0 0;line-height:1.6;">
      Tempo — stay in rhythm.<br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color:#B8601F;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`.trim(),
  }
}

export function weeklySummaryEmail({
  firstName,
  completedTasks,
  totalTasks,
  businessNames,
  weekOf,
}: WeeklySummaryProps): { subject: string; html: string } {
  const name = firstName ?? 'there'
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const businessList = businessNames.map((b) => `<li style="margin:4px 0;">${b}</li>`).join('')

  return {
    subject: `Your week in Tempo — ${completedTasks}/${totalTasks} tasks done`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F5F1;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <p style="font-size:13px;color:#736C5E;margin:0 0 16px 0;text-transform:uppercase;letter-spacing:0.08em;">
      Week of ${weekOf}
    </p>
    <p style="font-size:24px;font-weight:600;color:#18160F;margin:0 0 24px 0;font-family:Georgia,serif;">
      Hey ${name}.
    </p>
    <div style="background:#FFFFFF;border-radius:16px;padding:24px;margin:0 0 24px 0;border:1px solid #E8E4DC;">
      <p style="font-size:13px;color:#736C5E;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.08em;">
        This week
      </p>
      <p style="font-size:40px;font-weight:600;color:#18160F;margin:0 0 4px 0;font-family:Georgia,serif;line-height:1;">
        ${completedTasks}<span style="font-size:20px;color:#736C5E;">/${totalTasks}</span>
      </p>
      <p style="font-size:14px;color:#736C5E;margin:0;">tasks completed (${pct}%)</p>
    </div>
    ${businessNames.length > 0 ? `
    <p style="font-size:14px;color:#18160F;margin:0 0 8px 0;">Active businesses:</p>
    <ul style="margin:0 0 32px 0;padding-left:20px;color:#18160F;font-size:14px;line-height:1.8;">
      ${businessList}
    </ul>` : ''}
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/app/today"
       style="display:inline-block;background:#B8601F;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;">
      See today's task
    </a>
    <p style="font-size:13px;color:#736C5E;margin:48px 0 0 0;line-height:1.6;">
      Tempo — stay in rhythm.<br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color:#B8601F;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`.trim(),
  }
}

export function trialExpiryEmail({
  firstName,
  daysLeft,
}: TrialExpiryProps): { subject: string; html: string } {
  const name = firstName ?? 'there'
  const urgency = daysLeft <= 1 ? 'Your trial ends tomorrow' : `${daysLeft} days left in your trial`

  return {
    subject: `${urgency} — keep your rhythm going`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F5F1;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <p style="font-size:24px;font-weight:600;color:#18160F;margin:0 0 24px 0;font-family:Georgia,serif;">
      Hey ${name}.
    </p>
    <p style="font-size:16px;color:#18160F;line-height:1.7;margin:0 0 16px 0;">
      ${urgency}. Upgrade to keep your weekly plans, streaks, and marketing rhythm intact.
    </p>
    <div style="background:#FDF8F4;border-left:4px solid #B8601F;border-radius:0 12px 12px 0;padding:16px 20px;margin:0 0 32px 0;">
      <p style="font-size:14px;color:#18160F;margin:0;font-weight:500;">
        Maker — $12/month
      </p>
      <p style="font-size:13px;color:#736C5E;margin:4px 0 0 0;">
        3 businesses · 3 channels each · 30 AI actions/month
      </p>
    </div>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/upgrade"
       style="display:inline-block;background:#B8601F;color:#FFFFFF;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:500;">
      Upgrade now
    </a>
    <p style="font-size:13px;color:#736C5E;margin:48px 0 0 0;line-height:1.6;">
      Tempo — stay in rhythm.<br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color:#B8601F;">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`.trim(),
  }
}
