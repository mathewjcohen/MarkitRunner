import { getUsageWallState } from '@/actions/usage'
import { TopNav } from '@/components/nav/TopNav'
import { TrialBanner } from '@/components/ui/TrialBanner'
import { OnboardingBanner } from '@/components/ui/OnboardingBanner'
import { BottomNav } from '@/components/nav/BottomNav'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const usage = await getUsageWallState()

  // Fetch trial data for TrialBanner
  let daysLeft = 0
  let tier = 'trial'
  let onboardingComplete = true
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const [userResult, profileResult] = await Promise.all([
        supabase.from('users').select('tier, trial_ends_at').eq('id', user.id).single(),
        supabase.from('profiles').select('onboarding_complete').eq('id', user.id).single(),
      ])

      if (userResult.data) {
        tier = userResult.data.tier
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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F1' }}>
      <TopNav usage={usage} />

      {/* Trial banner */}
      <TrialBanner daysLeft={daysLeft} tier={tier} />

      {/* Onboarding incomplete banner */}
      {!onboardingComplete && <OnboardingBanner />}

      {/* Page content */}
      <main className="flex-1 pb-14 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
