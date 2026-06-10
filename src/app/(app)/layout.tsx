import { getUsageWallState } from '@/actions/usage'
import { UsageBar } from '@/components/ui/UsageBar'
import { TrialBanner } from '@/components/ui/TrialBanner'
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
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('tier, trial_ends_at')
        .eq('id', user.id)
        .single()

      if (userData) {
        tier = userData.tier
        if (userData.trial_ends_at) {
          const trialEndDate = new Date(userData.trial_ends_at).getTime()
          const now = Date.now()
          daysLeft = Math.ceil((trialEndDate - now) / 86400000)
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch trial data:', error)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F1' }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <a
                href="/app/today"
                className="text-sm font-medium cursor-pointer"
                style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
              >
                MarkitRunner
              </a>
              <nav className="flex items-center gap-4">
                <a
                  href="/app/today"
                  className="text-sm cursor-pointer transition-colors hover:opacity-70"
                  style={{ color: '#736C5E' }}
                >
                  Today
                </a>
                <a
                  href="/app/dashboard"
                  className="text-sm cursor-pointer transition-colors hover:opacity-70"
                  style={{ color: '#736C5E' }}
                >
                  Dashboard
                </a>
                <a
                  href="/app/metrics"
                  className="text-sm cursor-pointer transition-colors hover:opacity-70"
                  style={{ color: '#736C5E' }}
                >
                  Metrics
                </a>
              </nav>
            </div>
            <div className="w-48">
              <UsageBar used={usage.used} limit={usage.limit} tier={usage.tier} />
            </div>
          </div>
        </div>
      </header>

      {/* Trial banner */}
      <TrialBanner daysLeft={daysLeft} tier={tier} />

      {/* Page content */}
      <main className="flex-1 pb-14 md:pb-0">{children}</main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
