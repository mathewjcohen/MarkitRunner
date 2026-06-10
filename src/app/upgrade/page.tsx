import { createClient } from '@/lib/supabase/server'
import { PRICE_IDS } from '@/lib/stripe/client'
import { PricingPage } from '@/components/upgrade/PricingPage'

export const metadata = {
  title: 'Upgrade - Tempo',
  description: 'Choose your plan to unlock more features',
}

export default async function UpgradePage() {
  // Fetch current user's tier to show which plan they're on
  let currentTier: 'trial' | 'maker' | 'studio' | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('tier')
        .eq('id', user.id)
        .single()
      if (userData) {
        currentTier = userData.tier
      }
    }
  } catch (error) {
    console.error('Failed to fetch user tier:', error)
  }

  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F5F1' }}>
      {/* Header */}
      <header
        className="border-b"
        style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <a
            href="/app/dashboard"
            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: '#736C5E' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to dashboard
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#18160F', fontFamily: 'var(--font-display)' }}>
              Choose your plan
            </h1>
            <p className="text-lg" style={{ color: '#736C5E' }}>
              Unlock more businesses, channels, and AI actions with a paid plan.
            </p>
          </div>

          {stripeConfigured ? (
            <PricingPage currentTier={currentTier} priceIds={PRICE_IDS} />
          ) : (
            <div
              className="rounded-2xl p-12 text-center border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
            >
              <p className="text-lg font-semibold mb-2" style={{ color: '#18160F' }}>Paid plans coming soon</p>
              <p style={{ color: '#736C5E' }}>Billing will be available shortly. Everything is free during early access.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
