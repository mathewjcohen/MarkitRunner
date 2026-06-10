'use client'

import { createCheckoutSession, createPortalSession } from '@/actions/stripe'
import type { PriceId } from '@/lib/stripe/client'

interface PricingCardProps {
  tier: 'trial' | 'maker' | 'studio'
  planName: string
  price: string
  billingPeriod: 'monthly' | 'yearly'
  description: string
  features: string[]
  currentPlan: 'trial' | 'maker' | 'studio' | null
  monthlyPriceId: PriceId
  yearlyPriceId: PriceId
}

export function PricingCard({
  tier,
  planName,
  price,
  billingPeriod,
  description,
  features,
  currentPlan,
  monthlyPriceId,
  yearlyPriceId,
}: PricingCardProps) {
  const priceId = billingPeriod === 'monthly' ? monthlyPriceId : yearlyPriceId
  const isCurrentPlan = currentPlan === tier

  const handleCheckout = async () => {
    await createCheckoutSession(priceId)
  }

  const handleManageSubscription = async () => {
    await createPortalSession()
  }

  return (
    <div
      className="rounded-2xl border p-8 flex flex-col h-full transition-all hover:shadow-sm"
      style={{
        backgroundColor: isCurrentPlan ? '#FFFBF5' : '#FFFFFF',
        borderColor: isCurrentPlan ? '#B8601F' : '#E8E4DC',
      }}
    >
      {isCurrentPlan && (
        <span
          className="text-xs font-semibold mb-4 inline-block w-fit px-2 py-1 rounded"
          style={{ backgroundColor: '#B8601F', color: '#FFFFFF' }}
        >
          Current Plan
        </span>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#18160F' }}>
          {planName}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold" style={{ color: '#B8601F' }}>
            {price}
          </span>
          <span className="text-sm" style={{ color: '#736C5E' }}>
            /{billingPeriod === 'monthly' ? 'month' : 'year'}
          </span>
        </div>
        <p className="text-sm mt-2" style={{ color: '#736C5E' }}>
          {description}
        </p>
      </div>

      <div className="flex-1 mb-6">
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#18160F' }}>
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#B8601F' }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={isCurrentPlan ? handleManageSubscription : handleCheckout}
        className="w-full py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer"
        style={{
          backgroundColor: isCurrentPlan ? '#E8E4DC' : '#B8601F',
          color: isCurrentPlan ? '#18160F' : '#FFFFFF',
        }}
        onMouseEnter={(e) => {
          if (!isCurrentPlan) {
            e.currentTarget.style.backgroundColor = '#9A4F17'
          }
        }}
        onMouseLeave={(e) => {
          if (!isCurrentPlan) {
            e.currentTarget.style.backgroundColor = '#B8601F'
          }
        }}
      >
        {isCurrentPlan ? 'Manage Subscription' : 'Choose Plan'}
      </button>
    </div>
  )
}
