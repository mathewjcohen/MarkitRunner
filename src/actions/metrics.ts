'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { MetricCategory } from '@/types'

export async function logMetric(
  businessId: string,
  metricKey: string,
  metricLabel: string,
  metricCategory: MetricCategory,
  value: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('metric_snapshots')
    .insert({
      business_id: businessId,
      user_id: user.id,
      metric_key: metricKey,
      metric_label: metricLabel,
      metric_category: metricCategory,
      value,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/app/metrics')
  revalidatePath('/app/dashboard')
  return { data }
}

export async function getMetricsForBusiness(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('metric_snapshots')
    .select('*')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(50)

  return data ?? []
}

export async function getLatestMetricsByKey(businessId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Get latest snapshot per metric_key
  const { data } = await supabase
    .from('metric_snapshots')
    .select('*')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })

  if (!data) return []

  // Deduplicate by metric_key, keep most recent
  const seen = new Set<string>()
  return data.filter((m) => {
    if (seen.has(m.metric_key)) return false
    seen.add(m.metric_key)
    return true
  })
}
