'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { BUSINESS_LIMITS, CHANNEL_LIMITS, type Tier, type BusinessType, type PrimaryGoal } from '@/types'

interface BusinessInput {
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

export async function createBusiness(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: userData } = await supabase
    .from('users')
    .select('tier')
    .eq('id', user.id)
    .single()

  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  const limit = BUSINESS_LIMITS[(userData?.tier ?? 'trial') as Tier]
  if (limit !== null && (count ?? 0) >= limit) {
    return { error: `Your plan allows up to ${limit} businesses` }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const type = formData.get('type') as BusinessType

  const validationError = validateBusinessInput({ name, description, type })
  if (validationError) return { error: validationError }

  const { data, error } = await supabase
    .from('businesses')
    .insert({ user_id: user.id, name, description, type, sort_order: count ?? 0 })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/dashboard')
  return { data }
}

export async function updateBusiness(
  businessId: string,
  updates: Partial<{
    name: string
    description: string
    primary_goal: PrimaryGoal
    success_definition: string
    content_themes: string[]
    cold_start_notes: string
  }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', businessId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/dashboard')
  return { data }
}

export async function getBusinesses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('sort_order')

  return data ?? []
}
