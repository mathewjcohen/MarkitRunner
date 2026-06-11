'use server'

import { createClient } from '@/lib/supabase/server'
import { buildWeekRange } from '@/lib/utils/date'
import { revalidatePath } from 'next/cache'


export async function getTasksForWeek(weekStart: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { start, end } = buildWeekRange(weekStart)

  const { data } = await supabase
    .from('tasks')
    .select('*, businesses(name), channels(type, label)')
    .eq('user_id', user.id)
    .gte('scheduled_date', start)
    .lte('scheduled_date', end)
    .order('scheduled_date')

  return data ?? []
}

export async function getTodayTask() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('tasks')
    .select('*, businesses(name, content_themes), channels(type, label)')
    .eq('user_id', user.id)
    .eq('scheduled_date', today)
    .is('completed_at', null)
    .order('created_at')
    .limit(1)
    .single()

  return data ?? null
}

export async function completeTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('tasks')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/app/today')
  revalidatePath('/app/weekly')
  return { success: true }
}

export async function deferTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get current deferred_count first
  const { data: task } = await supabase
    .from('tasks')
    .select('deferred_count')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  const { error } = await supabase
    .from('tasks')
    .update({
      scheduled_date: tomorrow.toISOString().split('T')[0],
      deferred_count: (task?.deferred_count ?? 0) + 1,
    })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/app/today')
  return { success: true }
}
