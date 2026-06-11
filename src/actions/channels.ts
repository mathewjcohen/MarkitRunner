'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateChannelCount } from '@/lib/utils/validation'
import type { ChannelType, Cadence, Tier } from '@/types'

export async function createChannel(
  businessId: string,
  channelType: ChannelType,
  cadence: Cadence,
  label?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: userData } = await supabase
    .from('users')
    .select('tier')
    .eq('id', user.id)
    .single()

  const { count } = await supabase
    .from('channels')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('is_active', true)

  const limitError = validateChannelCount((userData?.tier ?? 'trial') as Tier, count ?? 0)
  if (limitError) return { error: limitError }

  const { data, error } = await supabase
    .from('channels')
    .insert({
      business_id: businessId,
      user_id: user.id,
      type: channelType,
      cadence,
      label: label ?? null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/dashboard')
  return { data }
}

export async function clearChannelsForBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('business_id', businessId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getChannelsForBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('channels')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('created_at')

  return data ?? []
}

export async function deleteChannel(channelId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('channels')
    .update({ is_active: false })
    .eq('id', channelId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/app/dashboard')
  revalidatePath('/app/settings')
  return { success: true }
}

export async function updateChannelNotes(channelId: string, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('channels')
    .update({ platform_notes: notes.trim() || null })
    .eq('id', channelId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/app/settings')
  revalidatePath('/app/dashboard')
  return { success: true }
}
