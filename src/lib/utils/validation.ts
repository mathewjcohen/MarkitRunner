import { BUSINESS_LIMITS, CHANNEL_LIMITS, type Tier, type BusinessType } from '@/types'

export interface BusinessInput {
  name: string
  description: string
  type: BusinessType | string
  content_themes?: string[]
}

export function validateBusinessInput(input: BusinessInput): string | null {
  if (!input.name.trim()) return 'Name is required'
  if (!input.description.trim()) return 'Description is required'
  if (input.content_themes !== undefined && input.content_themes.length !== 3) {
    return 'Exactly 3 content themes required'
  }
  return null
}

export function validateChannelCount(tier: Tier, currentCount: number): string | null {
  const limit = CHANNEL_LIMITS[tier]
  if (limit !== null && currentCount >= limit) {
    return `${tier.charAt(0).toUpperCase() + tier.slice(1)} plan allows ${limit} channels per business`
  }
  return null
}
