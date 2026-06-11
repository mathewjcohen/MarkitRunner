'use server'

import { createClient } from '@/lib/supabase/server'
import { buildWeekRange } from '@/lib/utils/date'
import { revalidatePath } from 'next/cache'
import { anthropic, AI_MODELS } from '@/lib/ai/anthropic'
import { buildReplacementPrompt, parseReplacementTask } from '@/lib/ai/task-replacer'
import type { Business, Channel } from '@/types'


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

  revalidatePath('/app/dashboard')
  revalidatePath('/app/today')
  revalidatePath('/app/weekly')
  return { success: true }
}

export async function uncompleteTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('tasks')
    .update({ completed_at: null })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/app/dashboard')
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

export async function replaceTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: task } = await supabase
    .from('tasks')
    .select('*, businesses(*), channels(*)')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  if (!task) return { error: 'Task not found' }
  if (task.replaced_at) return { error: 'Task already replaced' }

  const { error: markError } = await supabase
    .from('tasks')
    .update({ replaced_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', user.id)

  if (markError) return { error: markError.message }

  const prompt = buildReplacementPrompt(
    task.scheduled_date,
    task.businesses as Business,
    task.channels as Channel,
    task.title
  )

  const message = await anthropic.messages.create({
    model: AI_MODELS.task_replacement,
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawContent = message.content[0]
  if (rawContent.type !== 'text') return { error: 'Unexpected AI response' }

  let replacement
  try {
    replacement = parseReplacementTask(rawContent.text)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to parse replacement' }
  }

  const { error: insertError } = await supabase.from('tasks').insert({
    business_id: task.business_id,
    user_id: user.id,
    plan_id: task.plan_id,
    channel_id: task.channel_id,
    title: replacement.title,
    description: replacement.description,
    scheduled_date: task.scheduled_date,
  })

  if (insertError) return { error: insertError.message }

  revalidatePath('/app/today')
  revalidatePath('/app/weekly')
  return { success: true }
}
