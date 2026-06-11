import type { Business, Channel, ChannelType, WeeklyPlanOutput } from '@/types'

export const PLATFORM_CONTEXT: Record<ChannelType, string> = {
  discord: 'A community text/voice platform. Post in channels, host events, share updates, and engage in discussions. Can include links, images, and announcements.',
  instagram: 'A visual social platform. Create image/video posts, Reels, and Stories. Growth via hashtags, consistent posting, and engagement.',
  youtube: 'A video platform. Publish long-form videos, Shorts, or Community posts. Growth via SEO, thumbnails, and upload consistency.',
  email_newsletter: 'A direct-to-inbox owned channel. Write and send newsletters, product updates, or drip sequences. High trust, no algorithm.',
  reddit: 'A community forum of subreddits. Share posts, comment in discussions, and answer questions. Rules vary by subreddit — add genuine value before any promotion.',
  tiktok: 'A short-form vertical video platform. Hook-driven 15–60 second clips. Organic reach via algorithm, trends, and sounds.',
  linkedin: 'A professional networking platform. Share thought leadership, industry insights, company updates, and career content.',
  facebook: 'A social networking platform. Post in Groups, on Pages, and in the feed. Events and community groups are effective for engagement.',
  forum: 'A niche topic-specific online forum. Participate in threads, answer questions, share resources. Build reputation before promoting.',
  marketplace: 'A transactional marketplace for PHYSICAL GOODS only (e.g. Reverb for music gear, Etsy for handmade items, eBay for general merchandise). Tasks must involve listing, pricing, photographing, or promoting a physical item for sale. CRITICAL: Do NOT suggest listing apps, software, SaaS tools, subscriptions, or digital services — these cannot be sold on a physical goods marketplace. Do NOT suggest community posts, discussions, or brand awareness tactics.',
  website_blog: 'Your own website or blog. Publish SEO articles, guides, landing pages, or case studies. Fully owned, no algorithm dependency.',
}

export function buildPlanPrompt(
  business: Business,
  channels: Channel[],
  weekStart: string
): string {
  const channelList = channels
    .map((c) => {
      const label = c.type + (c.label ? ` (${c.label})` : '')
      const context = PLATFORM_CONTEXT[c.type as ChannelType] ?? ''
      const notes = c.platform_notes ? `\n  User notes: ${c.platform_notes}` : ''
      return `- ${label} — ${c.cadence}\n  Platform: ${context}${notes}`
    })
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
- Tasks MUST be feasible on the described platform — respect the Platform constraints for each channel
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
  // Claude sometimes wraps JSON in markdown code fences — strip them before parsing
  const cleaned = raw.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
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
