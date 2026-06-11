'use client'

import { updateBusiness } from '@/actions/businesses'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  businessId: string
  initialNotes: string
}

export function Step5Form({ businessId, initialNotes }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const notes = formData.get('cold_start_notes') as string
    if (notes.trim()) {
      await updateBusiness(businessId, { cold_start_notes: notes })
    }
    router.push(`/onboarding/step-6?business_id=${businessId}`)
  }

  return (
    <div className="step-enter">
      <OnboardingProgress currentStep={5} totalSteps={6} />
      <h1
        className="text-3xl mb-2 leading-tight"
        style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
      >
        Last 3 marketing efforts
      </h1>
      <p className="text-sm mb-2" style={{ color: '#736C5E' }}>
        Don&apos;t overthink it — describe the last 3 things you actually did to promote this business.
      </p>
      <p
        className="text-xs mb-7 px-3 py-2 rounded-lg"
        style={{ color: '#736C5E', backgroundColor: '#F7F5F1' }}
      >
        The AI uses this to start from where you are, not from scratch.
      </p>
      <form action={handleSubmit} className="flex flex-col gap-3.5">
        <textarea
          name="cold_start_notes"
          placeholder="e.g. Posted in a Discord server, tweeted about a new feature, sent an update to my email list…"
          rows={5}
          defaultValue={initialNotes}
          className="border rounded-xl px-4 py-2.5 text-sm resize-none w-full focus:outline-none"
          style={{ borderColor: '#E8E4DC', color: '#18160F' }}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors disabled:opacity-60"
          style={{ backgroundColor: '#B8601F', color: '#FFFFFF' }}
        >
          {loading ? 'Saving…' : 'Continue →'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => router.push(`/onboarding/step-6?business_id=${businessId}`)}
          className="text-sm cursor-pointer transition-colors"
          style={{ color: '#A89F94' }}
        >
          Skip (not recommended)
        </button>
      </form>
    </div>
  )
}
