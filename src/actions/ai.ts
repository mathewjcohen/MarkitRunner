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

  const [{ data: business }, { data: channels }] = await Promise.all([
    supabase.from('businesses').select('*').eq('id', businessId).eq('user_id', user.id).single(),
    supabase.from('channels').select('*').eq('business_id', businessId).eq('is_active', true),
  ])

  if (!business) return { error: 'Business not found' }
  if (!channels?.length) return { error: 'No active channels found for this business' }

  const prompt = buildPlanPrompt(business, channels, weekStartDate)

  const message = await anthropic.messages.create({
    model: AI_MODELS.weekly_plan,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawContent = message.content[0]
  if (rawContent.type !== 'text') return { error: 'Unexpected AI response type' }

  let plan: WeeklyPlanOutput
  try {
    plan = validatePlanOutput(rawContent.text)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to parse plan' }
  }

  const tokensUsed = message.usage.input_tokens + message.usage.output_tokens
  await trackUsage('weekly_plan', tokensUsed)

  // Persist plan record
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

  // Insert tasks from plan
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
