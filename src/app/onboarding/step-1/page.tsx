'use client'

import { createBusiness } from '@/actions/businesses'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const BUSINESS_TYPES = [
  { value: 'saas_app', label: 'SaaS app' },
  { value: 'mobile_app', label: 'Mobile app' },
  { value: 'physical_product', label: 'Physical product' },
  { value: 'artisan_craft', label: 'Artisan / craft' },
  { value: 'service_business', label: 'Service business' },
  { value: 'content_creator', label: 'Content creator' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
]

export default function OnboardingStep1() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createBusiness(formData)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push(`/onboarding/step-2?business_id=${result.data.id}`)
  }

  return (
    <div className="step-enter">
      <OnboardingProgress currentStep={1} totalSteps={6} />
      <h1
        className="text-3xl mb-2 leading-tight"
        style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
      >
        Tell us about your first business
      </h1>
      <p className="text-sm mb-7" style={{ color: '#736C5E' }}>
        You can add more after setup.
      </p>
      <form action={handleSubmit} className="flex flex-col gap-3.5">
        <input
          name="name"
          placeholder="Business name"
          required
          className="border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 w-full"
          style={{ borderColor: '#E8E4DC', color: '#18160F' }}
          onFocus={e => (e.currentTarget.style.outlineColor = '#B8601F')}
        />
        <select
          name="type"
          required
          className="border rounded-xl px-4 py-2.5 text-sm w-full cursor-pointer focus:outline-none"
          style={{ borderColor: '#E8E4DC', color: '#18160F' }}
        >
          <option value="">Business type</option>
          {BUSINESS_TYPES.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <textarea
          name="description"
          placeholder="One-line description of what you do"
          required
          rows={2}
          className="border rounded-xl px-4 py-2.5 text-sm resize-none w-full focus:outline-none"
          style={{ borderColor: '#E8E4DC', color: '#18160F' }}
        />
        {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors mt-1 disabled:opacity-60"
          style={{ backgroundColor: loading ? '#9A4F17' : '#B8601F', color: '#FFFFFF' }}
        >
          {loading ? 'Saving…' : 'Continue →'}
        </button>
      </form>
    </div>
  )
}
