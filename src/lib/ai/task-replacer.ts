import type { Business, Channel, ChannelType } from '@/types'
import { PLATFORM_CONTEXT } from './plan-generator'

export interface ReplacementTask {
  title: string
  description: string
}

export function buildReplacementPrompt(
  scheduledDate: string,
  business: Business,
  channel: Channel,
  rejectedTitle: string,
  previousRejections: { title: string }[] = []
): string {
  const channelLabel = channel.label
    ? `${channel.type} (${channel.label})`
    : channel.type
  const platformContext = PLATFORM_CONTEXT[channel.type as ChannelType] ?? ''

  const previousSection = previousRejections.length > 0
    ? `\nPreviously rejected ideas on this channel (avoid these too — do not suggest anything conceptually similar):\n${previousRejections.map((r) => `- ${r.title}`).join('\n')}\n`
    : ''

  return `You are a marketing coach. Generate ONE replacement marketing task.

Business: ${business.name}
Description: ${business.description}
Goal: ${business.primary_goal.replace(/_/g, ' ')}
Themes: ${business.content_themes.join(', ')}
Channel: ${channelLabel}
Platform: ${platformContext}
${channel.platform_notes ? `User notes: ${channel.platform_notes}` : ''}

The previous task was rejected as not doable on this platform:
Rejected: "${rejectedTitle}"
${previousSection}
Generate a different task for ${scheduledDate} on this channel.

Rules:
- Must be genuinely doable on this platform given its constraints
- Must NOT be similar to the rejected task or any previously rejected idea above
- Clear, specific action (not vague advice)

Respond with ONLY valid JSON:
{
  "title": "string (max 80 chars)",
  "description": "string (1-2 sentences, specific action)"
}`
}

export function parseReplacementTask(raw: string): ReplacementTask {
  const cleaned = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('Replacement response is not valid JSON')
  }

  const obj = parsed as Record<string, unknown>
  if (typeof obj.title !== 'string' || typeof obj.description !== 'string') {
    throw new Error('Replacement response missing title or description')
  }

  return { title: obj.title, description: obj.description }
}
