'use server'

import { createClient } from '@/lib/supabase/server'
import { AI_LIMITS } from '@/lib/ai/anthropic'
import type { AIActionType, Tier } from '@/types'

export async function isAtLimit(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return true

  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_actions_used, ai_actions_reset_at')
    .eq('id', user.id)
    .single()

  const { data: userData } = await supabase
    .from('users')
    .select('tier')
    .eq('id', user.id)
    .single()

  if (!profile || !userData) return true

  const tier = (userData.tier ?? 'trial') as Tier
  const limit = AI_LIMITS[tier]
  const used = profile.ai_actions_used ?? 0

  // Auto-reset if it's been more than 30 days
  const resetAt = profile.ai_actions_reset_at
    ? new Date(profile.ai_actions_reset_at)
    : null
  const now = new Date()
  if (!resetAt || now.getTime() - resetAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
    await supabase
      .from('profiles')
      .update({ ai_actions_used: 0, ai_actions_reset_at: now.toISOString() })
      .eq('id', user.id)
    return false
  }

  return used >= limit
}

export async function trackUsage(actionType: AIActionType, tokensUsed: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('ai_usage')
    .insert({ user_id: user.id, action_type: actionType, tokens_used: tokensUsed })

  // Increment profile counter manually
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('ai_actions_used')
    .eq('id', user.id)
    .single()

  await supabase
    .from('profiles')
    .update({ ai_actions_used: (currentProfile?.ai_actions_used ?? 0) + 1 })
    .eq('id', user.id)
}

export async function getUsageWallState(): Promise<{
  used: number
  limit: number
  tier: Tier
  atLimit: boolean
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const fallback = { used: 0, limit: 5, tier: 'trial' as Tier, atLimit: false }
  if (!user) return fallback

  const [{ data: profile }, { data: userData }] = await Promise.all([
    supabase.from('profiles').select('ai_actions_used').eq('id', user.id).single(),
    supabase.from('users').select('tier').eq('id', user.id).single(),
  ])

  const tier = (userData?.tier ?? 'trial') as Tier
  const limit = AI_LIMITS[tier]
  const used = profile?.ai_actions_used ?? 0

  return { used, limit, tier, atLimit: used >= limit }
}
