'use client'

import { useState } from 'react'
import { PricingCard } from './PricingCard'
import type { PriceId } from '@/lib/stripe/client'

interface PricingPageProps {
  currentTier: 'trial' | 'maker' | 'studio' | null
  priceIds: {
    maker_monthly: PriceId
    maker_yearly: PriceId
    studio_monthly: PriceId
    studio_yearly: PriceId
  }
}

export function PricingPage({ currentTier, priceIds }: PricingPageProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const makerFeatures = [
    '3 businesses',
    '3 channels per business',
    '100 AI actions/month',
    'Weekly plans',
    'Daily focus',
  ]

  const studioFeatures = [
    'Unlimited businesses',
    'Unlimited channels',
    '500 AI actions/month',
    'Weekly plans',
    'Daily focus',
    'Priority support',
  ]

  return (
    <div>
      {/* Billing period toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={() => setBillingPeriod('monthly')}
          className="px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
          style={{
            backgroundColor: billingPeriod === 'monthly' ? '#B8601F' : '#E8E4DC',
            color: billingPeriod === 'monthly' ? '#FFFFFF' : '#18160F',
          }}
        >
          Monthly
        </button>
        <span style={{ color: '#736C5E', fontSize: '14px' }}>or</span>
        <button
          onClick={() => setBillingPeriod('yearly')}
          className="px-4 py-2 rounded-lg font-medium transition-all cursor-pointer relative"
          style={{
            backgroundColor: billingPeriod === 'yearly' ? '#B8601F' : '#E8E4DC',
            color: billingPeriod === 'yearly' ? '#FFFFFF' : '#18160F',
          }}
        >
          Yearly
          {billingPeriod === 'yearly' && (
            <span
              className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap px-2 py-1 rounded"
              style={{ backgroundColor: '#B8601F', color: '#FFFFFF' }}
            >
              Save 17%
            </span>
          )}
        </button>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PricingCard
          tier="maker"
          planName="Maker"
          price={billingPeriod === 'monthly' ? '$12' : '$99'}
          billingPeriod={billingPeriod}
          description="For growing indie founders"
          features={makerFeatures}
          currentPlan={currentTier}
          monthlyPriceId={priceIds.maker_monthly}
          yearlyPriceId={priceIds.maker_yearly}
        />
        <PricingCard
          tier="studio"
          planName="Studio"
          price={billingPeriod === 'monthly' ? '$29' : '$229'}
          billingPeriod={billingPeriod}
          description="For ambitious teams"
          features={studioFeatures}
          currentPlan={currentTier}
          monthlyPriceId={priceIds.studio_monthly}
          yearlyPriceId={priceIds.studio_yearly}
        />
      </div>
    </div>
  )
}
