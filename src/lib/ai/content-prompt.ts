import type { Task, Business, Channel } from '@/types'

export interface ContentPromptResult {
  prompt: string  // the full content prompt/brief to copy
  angle: string   // creative angle for the content
}

export function buildContentPrompt(
  task: Task,
  business: Business,
  channel: Channel
): string {
  const channelLabel = channel.label
    ? `${channel.type} (${channel.label})`
    : channel.type

  const angleContext = task.ai_prompt_angle
    ? `Previously identified angle: ${task.ai_prompt_angle}`
    : ''

  return `You are a content strategist helping an indie founder create marketing content.

Business: ${business.name}
Goal: ${business.primary_goal.replace(/_/g, ' ')}
Themes: ${business.content_themes.join(', ')}

Task: ${task.title}
${task.description ? `Details: ${task.description}` : ''}
Channel: ${channelLabel}
${angleContext}

Write a complete content brief that the founder can hand to an AI writing tool or use directly.

The brief should be:
- Channel-specific (${channel.type} best practices)
- Actionable and specific (not generic advice)
- Ready to copy-paste into a writing tool

Respond with ONLY valid JSON:
{
  "angle": "one word or short phrase describing the creative approach",
  "prompt": "the complete content brief (2-4 sentences with specific directions, tone, and what to include)"
}`
}

export function parseContentPromptResult(raw: string): ContentPromptResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Content prompt response is not valid JSON')
  }

  const obj = parsed as Record<string, unknown>
  if (typeof obj.angle !== 'string' || typeof obj.prompt !== 'string') {
    throw new Error('Content prompt response missing angle or prompt fields')
  }

  return { angle: obj.angle, prompt: obj.prompt }
}
