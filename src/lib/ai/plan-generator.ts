import type { Business, Channel, ChannelType, WeeklyPlanOutput } from '@/types'

export function buildPlanPrompt(
  business: Business,
  channels: Channel[],
  weekStart: string
): string {
  const channelList = channels
    .map((c) => `- ${c.type}${c.label ? ` (${c.label})` : ''} — ${c.cadence}`)
    .join('\n')

  return `You are a marketing coach helping an indie founder stay consistent.

Business: ${business.name}
Description: ${business.description}
Primary goal: ${business.primary_goal.replace(/_/g, ' ')}
Success definition: ${business.success_definition}
Content themes: ${business.content_themes.join(', ')}
${business.cold_start_notes ? `Notes: ${business.cold_start_notes}` : ''}

Active channels:
${channelList}

Generate a weekly marketing plan for the week starting ${weekStart}.

Rules:
- One task per channel per cadence period (daily channels get 5 tasks Mon-Fri, weekly channels get 1 task)
- Each task needs a clear, specific action (not vague advice)
- scheduled_date must be YYYY-MM-DD format, within the week starting ${weekStart}
- Tasks should align with the primary goal: ${business.primary_goal.replace(/_/g, ' ')}

Respond with ONLY valid JSON matching this schema:
{
  "tasks": [
    {
      "title": "string (max 80 chars)",
      "description": "string (1-2 sentences, specific action)",
      "channel_type": "one of: discord|instagram|youtube|email_newsletter|reddit|tiktok|linkedin|facebook|forum|marketplace|website_blog",
      "scheduled_date": "YYYY-MM-DD"
    }
  ],
  "summary": "string (1 sentence overview of the week's focus)"
}`
}

export function validatePlanOutput(raw: string): WeeklyPlanOutput {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Plan response is not valid JSON')
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as { tasks: unknown }).tasks) ||
    typeof (parsed as { summary: unknown }).summary !== 'string'
  ) {
    throw new Error('Plan response missing tasks array or summary')
  }

  const output = parsed as WeeklyPlanOutput

  for (const task of output.tasks) {
    if (!task.title || !task.description || !task.channel_type || !task.scheduled_date) {
      throw new Error(`Task missing required fields: ${JSON.stringify(task)}`)
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(task.scheduled_date)) {
      throw new Error(`Invalid date format: ${task.scheduled_date}`)
    }
  }

  return output
}
