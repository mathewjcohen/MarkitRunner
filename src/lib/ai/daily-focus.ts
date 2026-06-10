import type { Task, Business, Channel } from '@/types'

export interface FocusContext {
  task: Task
  business: Business
  channel: Channel
}

export interface FocusResult {
  angle: string   // one-word creative angle (e.g. "authentic", "bold", "story-driven")
  opening: string // opening hook sentence for the content
}

export function buildFocusPrompt(ctx: FocusContext): string {
  const channelLabel = ctx.channel.label
    ? `${ctx.channel.type} (${ctx.channel.label})`
    : ctx.channel.type

  return `You are a content coach helping an indie founder create compelling marketing content.

Business: ${ctx.business.name}
Goal: ${ctx.business.primary_goal.replace(/_/g, ' ')}
Themes: ${ctx.business.content_themes.join(', ')}

Today's task: ${ctx.task.title}
${ctx.task.description ? `Details: ${ctx.task.description}` : ''}
Channel: ${channelLabel}

Generate a creative angle and opening hook for this task.

Respond with ONLY valid JSON:
{
  "angle": "one word describing the creative approach (e.g. authentic, bold, storytelling, educational)",
  "opening": "a compelling 1-2 sentence opening hook for the content (not a generic tip, something specific and punchy)"
}`
}

export function parseFocusResult(raw: string): FocusResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Focus response is not valid JSON')
  }

  const obj = parsed as Record<string, unknown>
  if (typeof obj.angle !== 'string' || typeof obj.opening !== 'string') {
    throw new Error('Focus response missing angle or opening fields')
  }

  return { angle: obj.angle, opening: obj.opening }
}

export function selectFocusTask(tasks: Task[]): Task | null {
  if (tasks.length === 0) return null

  // Priority: overdue first (deferred), then scheduled for today, then earliest
  const incomplete = tasks.filter((t) => !t.completed_at)
  if (incomplete.length === 0) return null

  // Most deferred task wins (needs attention)
  const sorted = [...incomplete].sort((a, b) => {
    if (b.deferred_count !== a.deferred_count) return b.deferred_count - a.deferred_count
    return a.scheduled_date.localeCompare(b.scheduled_date)
  })

  return sorted[0]
}
