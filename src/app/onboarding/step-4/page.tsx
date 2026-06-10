'use client'

import { Suspense } from 'react'
import { updateBusiness } from '@/actions/businesses'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

function Step4Content() {
  const router = useRouter()
  const params = useSearchParams()
  const businessId = params.get('business_id')!
  const [themes, setThemes] = useState(['', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function updateTheme(i: number, value: string) {
    setThemes(prev => prev.map((t, idx) => (idx === i ? value : t)))
  }

  async function handleSubmit() {
    if (themes.some(t => !t.trim())) {
      setError('All 3 themes are required')
      return
    }
    setLoading(true)
    const result = await updateBusiness(businessId, { content_themes: themes })
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push(`/onboarding/step-5?business_id=${businessId}`)
  }

  return (
    <div className="step-enter">
      <OnboardingProgress currentStep={4} totalSteps={6} />
      <h1
        className="text-3xl mb-2 leading-tight"
        style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
      >
        Pick 3 content themes
      </h1>
      <p className="text-sm mb-1" style={{ color: '#736C5E' }}>
        These shape every plan the AI generates for you.
      </p>
      <p className="text-xs mb-7" style={{ color: '#A89F94' }}>
        Examples: "behind the scenes", "customer stories", "tutorials"
      </p>
      <div className="flex flex-col gap-3 mb-6">
        {themes.map((t, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span
              className="text-xs font-medium w-5 text-right flex-shrink-0"
              style={{ color: '#B8601F' }}
            >
              {i + 1}
            </span>
            <input
              value={t}
              onChange={e => updateTheme(i, e.target.value)}
              placeholder={`Theme ${i + 1}`}
              className="border rounded-xl px-4 py-2.5 text-sm flex-1 focus:outline-none"
              style={{ borderColor: '#E8E4DC', color: '#18160F' }}
            />
          </div>
        ))}
      </div>
      {error && <p className="text-sm mb-4" style={{ color: '#DC2626' }}>{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors disabled:opacity-60"
        style={{ backgroundColor: '#B8601F', color: '#FFFFFF' }}
      >
        {loading ? 'Saving…' : 'Continue →'}
      </button>
    </div>
  )
}

export default function OnboardingStep4() {
  return (
    <Suspense fallback={<div className="animate-pulse" style={{ minHeight: 400 }} />}>
      <Step4Content />
    </Suspense>
  )
}
