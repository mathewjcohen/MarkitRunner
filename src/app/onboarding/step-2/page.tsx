'use client'

import { createChannel } from '@/actions/channels'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { ChannelType } from '@/types'

const CHANNELS: { value: ChannelType; label: string }[] = [
  { value: 'discord', label: 'Discord' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'email_newsletter', label: 'Email newsletter' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook / Meta' },
  { value: 'forum', label: 'Forum or community' },
  { value: 'marketplace', label: 'Marketplace (Reverb, Etsy…)' },
  { value: 'website_blog', label: 'Website / blog' },
]

export default function OnboardingStep2() {
  const router = useRouter()
  const params = useSearchParams()
  const businessId = params.get('business_id')!
  const [selected, setSelected] = useState<ChannelType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function toggle(type: ChannelType) {
    setSelected(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  async function handleNext() {
    if (selected.length === 0) {
      setError('Select at least one channel')
      return
    }
    setLoading(true)
    for (const channelType of selected) {
      const result = await createChannel(businessId, channelType, 'weekly')
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
    }
    router.push(`/onboarding/step-3?business_id=${businessId}`)
  }

  return (
    <div className="step-enter">
      <OnboardingProgress currentStep={2} totalSteps={6} />
      <h1
        className="text-3xl mb-2 leading-tight"
        style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
      >
        What channels do you use?
      </h1>
      <p className="text-sm mb-6" style={{ color: '#736C5E' }}>
        Pick up to 3 to start. You can add more later.
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {CHANNELS.map(ch => {
          const isSelected = selected.includes(ch.value)
          return (
            <button
              key={ch.value}
              type="button"
              onClick={() => toggle(ch.value)}
              className="rounded-full px-3.5 py-1.5 text-sm cursor-pointer transition-all border"
              style={{
                borderColor: isSelected ? '#B8601F' : '#E8E4DC',
                backgroundColor: isSelected ? '#FEF0E6' : 'transparent',
                color: isSelected ? '#B8601F' : '#736C5E',
                fontWeight: isSelected ? 500 : 400,
              }}
            >
              {ch.label}
            </button>
          )
        })}
      </div>
      {error && <p className="text-sm mb-4" style={{ color: '#DC2626' }}>{error}</p>}
      <button
        onClick={handleNext}
        disabled={loading}
        className="w-full rounded-xl px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors disabled:opacity-60"
        style={{ backgroundColor: '#B8601F', color: '#FFFFFF' }}
      >
        {loading ? 'Saving…' : 'Continue →'}
      </button>
    </div>
  )
}
