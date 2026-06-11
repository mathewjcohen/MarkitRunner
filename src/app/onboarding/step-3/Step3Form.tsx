'use client'

import { updateBusiness } from '@/actions/businesses'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { PrimaryGoal } from '@/types'

const GOALS: { value: PrimaryGoal; label: string }[] = [
  { value: 'grow_audience', label: 'Grow my audience' },
  { value: 'drive_sales', label: 'Drive sales' },
  { value: 'build_community', label: 'Build a community' },
  { value: 'increase_awareness', label: 'Increase awareness' },
  { value: 'get_feedback', label: 'Get feedback' },
  { value: 'launch_something', label: 'Launch something' },
]

const VALID_GOALS: PrimaryGoal[] = [
  'grow_audience',
  'drive_sales',
  'build_community',
  'increase_awareness',
  'get_feedback',
  'launch_something',
]

interface Props {
  businessId: string
  initialGoal: PrimaryGoal | ''
  initialSuccess: string
}

export function Step3Form({ businessId, initialGoal, initialSuccess }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const rawGoal = formData.get('primary_goal') as string

    if (!VALID_GOALS.includes(rawGoal as PrimaryGoal)) {
      setError('Please select a valid goal')
      setLoading(false)
      return
    }

    const result = await updateBusiness(businessId, {
      primary_goal: rawGoal as PrimaryGoal,
      success_definition: formData.get('success_definition') as string,
    })
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push(`/onboarding/step-4?business_id=${businessId}`)
  }

  return (
    <div className="step-enter">
      <OnboardingProgress currentStep={3} totalSteps={6} />
      <h1
        className="text-3xl mb-2 leading-tight"
        style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
      >
        What are you working toward?
      </h1>
      <p className="text-sm mb-7" style={{ color: '#736C5E' }}>
        The AI uses this to keep every plan focused.
      </p>
      <form action={handleSubmit} className="flex flex-col gap-3.5">
        <select
          name="primary_goal"
          required
          defaultValue={initialGoal}
          className="border rounded-xl px-4 py-2.5 text-sm w-full cursor-pointer focus:outline-none"
          style={{ borderColor: '#E8E4DC', color: '#18160F' }}
        >
          <option value="">Primary goal</option>
          {GOALS.map(g => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
        <textarea
          name="success_definition"
          placeholder="What does good look like in 90 days?"
          required
          rows={3}
          defaultValue={initialSuccess}
          className="border rounded-xl px-4 py-2.5 text-sm resize-none w-full focus:outline-none"
          style={{ borderColor: '#E8E4DC', color: '#18160F' }}
        />
        {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors mt-1 disabled:opacity-60"
          style={{ backgroundColor: '#B8601F', color: '#FFFFFF' }}
        >
          {loading ? 'Saving…' : 'Continue →'}
        </button>
      </form>
    </div>
  )
}
