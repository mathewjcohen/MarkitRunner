import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const PRICE_IDS = {
  maker_monthly: 'price_maker_monthly',
  maker_yearly: 'price_maker_yearly',
  studio_monthly: 'price_studio_monthly',
  studio_yearly: 'price_studio_yearly',
} as const

export type PriceId = (typeof PRICE_IDS)[keyof typeof PRICE_IDS]

export function getTierFromPriceId(priceId: string): 'maker' | 'studio' | null {
  if (priceId === PRICE_IDS.maker_monthly || priceId === PRICE_IDS.maker_yearly) {
    return 'maker'
  }
  if (priceId === PRICE_IDS.studio_monthly || priceId === PRICE_IDS.studio_yearly) {
    return 'studio'
  }
  return null
}
