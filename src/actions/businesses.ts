'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { BUSINESS_LIMITS, type Tier, type BusinessType, type PrimaryGoal } from '@/types'
import { validateBusinessInput, validateChannelCount } from '@/lib/utils/validation'

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

export async function getBusinesses(includeArchived = false) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase.from('businesses').select('*').eq('user_id', user.id).order('sort_order')

  if (!includeArchived) {
    query = query.is('archived_at', null)
  }

  const { data } = await query
  return data ?? []
}

export async function pauseBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('businesses')
    .update({ is_active: false })
    .eq('id', businessId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/app/dashboard')
  return { success: true }
}

export async function resumeBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('businesses')
    .update({ is_active: true })
    .eq('id', businessId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/app/dashboard')
  return { success: true }
}

export async function archiveBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('businesses')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', businessId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/app/dashboard')
  return { success: true }
}

export async function restoreBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('businesses')
    .update({ archived_at: null, is_active: true })
    .eq('id', businessId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/app/dashboard')
  return { success: true }
}

export async function deleteBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', businessId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/app/dashboard')
  return { success: true }
}

export async function purgeExpiredArchives() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('user_id', user.id)
    .not('archived_at', 'is', null)
    .lt('archived_at', cutoff.toISOString())

  if (error) return { error: error.message }
  return { success: true }
}
