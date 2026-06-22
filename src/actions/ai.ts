'use server'

import { createClient } from '@/lib/supabase/server'
import { anthropic, AI_MODELS } from '@/lib/ai/anthropic'
import { buildPlanPrompt, validatePlanOutput } from '@/lib/ai/plan-generator'
import { isAtLimit, trackUsage } from '@/actions/usage'
import { revalidatePath } from 'next/cache'
import type { WeeklyPlanOutput } from '@/types'

export async function generateWeeklyPlan(
  businessId: string,
  weekStartDate: string
): Promise<{ data?: WeeklyPlanOutput; error?: string }> {
  const atLimit = await isAtLimit()
  if (atLimit) return { error: 'Monthly AI action limit reached. Upgrade to continue.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const eightWeeksAgo = new Date(weekStartDate)
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)
  const eightWeeksAgoStr = eightWeeksAgo.toISOString().split('T')[0]

  const [{ data: business }, { data: channels }, { data: recentTasks }, { data: rejectedIdeas }] =
    await Promise.all([
      supabase.from('businesses').select('*').eq('id', businessId).eq('user_id', user.id).single(),
      supabase.from('channels').select('*').eq('business_id', businessId).eq('is_active', true),
      supabase
        .from('tasks')
        .select('title, description, scheduled_date')
        .eq('business_id', businessId)
        .gte('scheduled_date', eightWeeksAgoStr)
        .lt('scheduled_date', weekStartDate)
        .order('scheduled_date', { ascending: false }),
      supabase
        .from('rejected_ideas')
        .select('title')
        .eq('business_id', businessId)
        .eq('user_id', user.id)
        .order('rejected_at', { ascending: false }),
    ])

  if (!business) return { error: 'Business not found' }
  if (!channels?.length) return { error: 'No active channels found for this business' }

  const prompt = buildPlanPrompt(business, channels, weekStartDate, recentTasks ?? [], rejectedIdeas ?? [])

  const message = await anthropic.messages.create({
    model: AI_MODELS.weekly_plan,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawContent = message.content[0]
  if (rawContent.type !== 'text') return { error: 'Unexpected AI response type' }

  let plan: WeeklyPlanOutput
  try {
    plan = validatePlanOutput(rawContent.text, weekStartDate)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to parse plan' }
  }

  const tokensUsed = message.usage.input_tokens + message.usage.output_tokens
  await trackUsage('weekly_plan', tokensUsed)

  const weekEndDate = new Date(weekStartDate)
  weekEndDate.setDate(weekEndDate.getDate() + 6)
  const weekEndStr = weekEndDate.toISOString().split('T')[0]

  await supabase
    .from('tasks')
    .delete()
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .gte('scheduled_date', weekStartDate)
    .lte('scheduled_date', weekEndStr)
    .is('completed_at', null)

  const { data: planRecord } = await supabase
    .from('generated_plans')
    .insert({
      business_id: businessId,
      user_id: user.id,
      week_start: weekStartDate,
      plan_json: plan,
      model_used: AI_MODELS.weekly_plan,
    })
    .select()
    .single()

  const taskInserts = plan.tasks.map((t) => ({
    business_id: businessId,
    user_id: user.id,
    plan_id: planRecord?.id ?? null,
    channel_id: channels.find((c) => c.type === t.channel_type)?.id ?? channels[0].id,
    title: t.title,
    description: t.description,
    scheduled_date: t.scheduled_date,
  }))

  await supabase.from('tasks').insert(taskInserts)

  revalidatePath('/app/dashboard')
  revalidatePath('/app/weekly')

  return { data: plan }
}
