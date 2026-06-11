import { getUsageWallState } from '@/actions/usage'
import { TopNav } from '@/components/nav/TopNav'
import { TrialBanner } from '@/components/ui/TrialBanner'
import { OnboardingBanner } from '@/components/ui/OnboardingBanner'
import { DeletionBanner } from '@/components/ui/DeletionBanner'
import { BottomNav } from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usage = await getUsageWallState()

  let daysLeft = 0
  let tier = 'trial'
  let onboardingComplete = true
  let deletionScheduledAt: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const [userResult, profileResult] = await Promise.all([
        supabase.from('users').select('tier, trial_ends_at, deletion_scheduled_at').eq('id', user.id).single(),
        supabase.from('profiles').select('onboarding_complete').eq('id', user.id).single(),
      ])

      if (userResult.data) {
        tier = userResult.data.tier
        deletionScheduledAt = userResult.data.deletion_scheduled_at ?? null
        if (userResult.data.trial_ends_at) {
          const trialEndDate = new Date(userResult.data.trial_ends_at).getTime()
          const now = Date.now()
          daysLeft = Math.ceil((trialEndDate - now) / 86400000)
        }
      }

      onboardingComplete = profileResult.data?.onboarding_complete ?? false
    }
  } catch (error) {
    console.error('Failed to fetch layout data:', error)
  }

  const isDeletionPending = !!deletionScheduledAt && new Date(deletionScheduledAt) > new Date()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <TopNav usage={usage} />

      {isDeletionPending && deletionScheduledAt && (
        <DeletionBanner deletionScheduledAt={deletionScheduledAt} />
      )}

      <TrialBanner daysLeft={daysLeft} tier={tier} />

      {!onboardingComplete && <OnboardingBanner />}

      <main className="flex-1 pb-14 md:pb-0">{children}</main>

      <BottomNav />
    </div>
  )
}
