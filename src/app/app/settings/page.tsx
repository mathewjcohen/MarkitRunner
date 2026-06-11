import { createClient } from '@/lib/supabase/server'
import { getUsageWallState } from '@/actions/usage'
import { SettingsSignOut } from '@/components/settings/SettingsSignOut'
import { SettingsPasswordReset } from '@/components/settings/SettingsPasswordReset'
import { SettingsBillingButton } from '@/components/settings/SettingsBillingButton'
import { SettingsDeleteAccount } from '@/components/settings/SettingsDeleteAccount'
import { redirect } from 'next/navigation'

const TIER_LABELS: Record<string, string> = {
  trial: 'Free Trial',
  maker: 'Maker',
  studio: 'Studio',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: userData }, usage] = await Promise.all([
    supabase.from('users').select('tier, trial_ends_at, stripe_customer_id, deletion_scheduled_at').eq('id', user.id).single(),
    getUsageWallState(),
  ])

  const tier = userData?.tier ?? 'trial'
  const trialEndsAt = userData?.trial_ends_at
  const hasStripeCustomer = !!userData?.stripe_customer_id
  const deletionScheduledAt = userData?.deletion_scheduled_at ?? null

  const daysLeft = trialEndsAt
    ? Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000)
    : null

  const usagePct = Math.min(100, (usage.used / usage.limit) * 100)
  const barColor = usagePct >= 100 ? '#DC2626' : usagePct >= 80 ? '#D97706' : 'var(--color-accent)'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-semibold mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
      >
        Settings
      </h1>

      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Account */}
        <section>
          <h2
            className="text-xs font-semibold mb-3 uppercase tracking-widest"
            style={{ color: 'var(--color-text-subtle)' }}
          >
            Account
          </h2>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Email address
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {user.email}
              </p>
            </div>

            <div
              className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Password
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Send a reset link to your email address
                </p>
              </div>
              <SettingsPasswordReset />
            </div>

            <div className="px-5 py-4 flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Sign out of MarkitRunner
              </p>
              <SettingsSignOut />
            </div>
          </div>
        </section>

        {/* Plan & Billing */}
        <section>
          <h2
            className="text-xs font-semibold mb-3 uppercase tracking-widest"
            style={{ color: 'var(--color-text-subtle)' }}
          >
            Plan & Billing
          </h2>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Current plan
                </p>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {TIER_LABELS[tier] ?? tier}
                </p>
                {tier === 'trial' && daysLeft !== null && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: daysLeft <= 3 ? '#DC2626' : 'var(--color-text-muted)' }}
                  >
                    {daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining` : 'Trial expired'}
                  </p>
                )}
              </div>
              {tier === 'trial' ? (
                <a
                  href="/upgrade"
                  className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#FFFFFF' }}
                >
                  Upgrade
                </a>
              ) : (
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: '#F0FDF4',
                    color: '#16A34A',
                    border: '1px solid #BBF7D0',
                  }}
                >
                  Active
                </span>
              )}
            </div>

            <div className="px-5 py-4" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  AI actions this month
                </p>
                <p className="text-sm font-semibold" style={{ color: barColor }}>
                  {usage.used} / {usage.limit}
                </p>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--color-border)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${usagePct}%`, backgroundColor: barColor }}
                />
              </div>
              {usage.atLimit && (
                <p className="text-xs mt-2" style={{ color: '#DC2626' }}>
                  Monthly limit reached.{' '}
                  <a href="/upgrade" className="underline cursor-pointer" style={{ color: 'var(--color-accent)' }}>
                    Upgrade to continue
                  </a>
                </p>
              )}
            </div>

            {hasStripeCustomer && (
              <div
                className="px-5 py-4 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    Billing
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Update payment method, view invoices, or cancel
                  </p>
                </div>
                <SettingsBillingButton />
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2
            className="text-xs font-semibold mb-3 uppercase tracking-widest"
            style={{ color: 'var(--color-text-subtle)' }}
          >
            Danger Zone
          </h2>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <SettingsDeleteAccount deletionScheduledAt={deletionScheduledAt} />
          </div>
        </section>
      </div>
    </div>
  )
}
