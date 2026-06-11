'use client'

import { completeOnboarding } from '@/actions/auth'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function OnboardingStep6() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFinish() {
    setLoading(true)
    const result = await completeOnboarding()
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    router.push('/app/today')
  }

  return (
    <div className="step-enter">
      <OnboardingProgress currentStep={6} totalSteps={6} />
      <h1
        className="text-3xl mb-2 leading-tight"
        style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
      >
        You&apos;re all set
      </h1>
      <p className="text-sm mb-8" style={{ color: '#736C5E' }}>
        Want to add another business now? You can always add more from the dashboard.
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push('/onboarding/step-1')}
          className="rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors border"
          style={{ borderColor: '#E8E4DC', color: '#18160F' }}
        >
          Add another business
        </button>
        {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}
        <button
          onClick={handleFinish}
          disabled={loading}
          className="rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors disabled:opacity-60"
          style={{ backgroundColor: '#B8601F', color: '#FFFFFF' }}
        >
          {loading ? 'Setting up…' : 'Generate my first plan →'}
        </button>
      </div>
    </div>
  )
}
