import { buildPlanPrompt, validatePlanOutput } from '../plan-generator'
import type { Business, Channel } from '@/types'

const mockBusiness: Business = {
  id: 'b1',
  user_id: 'u1',
  name: 'TestCo',
  description: 'A SaaS for developers',
  type: 'saas_app',
  primary_goal: 'grow_audience',
  success_definition: 'Reach 1000 followers',
  content_themes: ['dev tools', 'productivity', 'open source'],
  cold_start_notes: null,
  sort_order: 0,
  is_active: true,
  archived_at: null,
  created_at: '2026-01-01T00:00:00Z',
}

const mockLinkedinChannel: Channel = {
  id: 'c1',
  business_id: 'b1',
  user_id: 'u1',
  type: 'linkedin',
  label: null,
  cadence: 'weekly',
  platform_notes: null,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

describe('buildPlanPrompt', () => {
  it('includes business name and description', () => {
    const prompt = buildPlanPrompt(mockBusiness, [mockLinkedinChannel], '2026-06-09')
    expect(prompt).toContain('TestCo')
    expect(prompt).toContain('A SaaS for developers')
  })

  it('includes the week start date', () => {
    const prompt = buildPlanPrompt(mockBusiness, [mockLinkedinChannel], '2026-06-09')
    expect(prompt).toContain('2026-06-09')
  })

  it('includes channel type and cadence', () => {
    const prompt = buildPlanPrompt(mockBusiness, [mockLinkedinChannel], '2026-06-09')
    expect(prompt).toContain('linkedin')
    expect(prompt).toContain('weekly')
  })

  it('includes content themes', () => {
    const prompt = buildPlanPrompt(mockBusiness, [mockLinkedinChannel], '2026-06-09')
    expect(prompt).toContain('dev tools')
  })

  it('includes cold start notes when present', () => {
    const biz = { ...mockBusiness, cold_start_notes: 'Just launched last week' }
    const prompt = buildPlanPrompt(biz, [mockLinkedinChannel], '2026-06-09')
    expect(prompt).toContain('Just launched last week')
  })

  it('includes marketplace platform constraint in prompt', () => {
    const marketplaceChannel: Channel = {
      ...mockLinkedinChannel,
      id: 'c2',
      type: 'marketplace',
      label: 'Reverb',
      platform_notes: null,
    }
    const prompt = buildPlanPrompt(mockBusiness, [marketplaceChannel], '2026-06-09')
    expect(prompt).toContain('PHYSICAL GOODS only')
    expect(prompt).toContain('Do NOT suggest listing apps')
  })

  it('includes channel platform_notes when present', () => {
    const channelWithNotes: Channel = {
      ...mockLinkedinChannel,
      platform_notes: 'Reverb.com — music gear sales only',
    }
    const prompt = buildPlanPrompt(mockBusiness, [channelWithNotes], '2026-06-09')
    expect(prompt).toContain('Reverb.com — music gear sales only')
  })

  it('includes rejected ideas section when rejections are provided', () => {
    const rejections = [{ title: 'Post a giveaway contest' }, { title: 'Write a comparison post' }]
    const prompt = buildPlanPrompt(mockBusiness, [mockLinkedinChannel], '2026-06-09', [], rejections)
    expect(prompt).toContain('Permanently rejected ideas')
    expect(prompt).toContain('Post a giveaway contest')
    expect(prompt).toContain('Write a comparison post')
  })

  it('omits rejected ideas section when rejections array is empty', () => {
    const prompt = buildPlanPrompt(mockBusiness, [mockLinkedinChannel], '2026-06-09', [], [])
    expect(prompt).not.toContain('Permanently rejected ideas')
  })

  it('omits recent tasks section when recentTasks array is empty', () => {
    const prompt = buildPlanPrompt(mockBusiness, [mockLinkedinChannel], '2026-06-09', [], [])
    expect(prompt).not.toContain('Recent tasks')
  })

  it('includes both history sections when both are provided', () => {
    const tasks = [{ title: 'Tutorial on pricing', description: null, scheduled_date: '2026-06-07' }]
    const rejections = [{ title: 'Post a giveaway' }]
    const prompt = buildPlanPrompt(mockBusiness, [mockLinkedinChannel], '2026-06-09', tasks, rejections)
    expect(prompt).toContain('Recent tasks')
    expect(prompt).toContain('Tutorial on pricing')
    expect(prompt).toContain('Permanently rejected ideas')
    expect(prompt).toContain('Post a giveaway')
  })

  it('includes format rotation rule', () => {
    const prompt = buildPlanPrompt(mockBusiness, [mockLinkedinChannel], '2026-06-09')
    expect(prompt).toContain('tutorial')
    expect(prompt).toContain('behind-the-scenes')
  })
})

describe('validatePlanOutput', () => {
  const weekStart = '2026-06-09'

  const validPlan = JSON.stringify({
    tasks: [
      {
        title: 'Post about productivity',
        description: 'Share a tip about task batching',
        channel_type: 'linkedin',
        scheduled_date: '2026-06-09',
      },
    ],
    summary: 'Focus on audience growth through LinkedIn this week',
  })

  it('parses valid plan output', () => {
    const result = validatePlanOutput(validPlan, weekStart)
    expect(result.tasks).toHaveLength(1)
    expect(result.summary).toBe('Focus on audience growth through LinkedIn this week')
  })

  it('throws on invalid JSON', () => {
    expect(() => validatePlanOutput('not json', weekStart)).toThrow('not valid JSON')
  })

  it('throws when tasks array is missing', () => {
    expect(() => validatePlanOutput(JSON.stringify({ summary: 'ok' }), weekStart)).toThrow()
  })

  it('throws on invalid date format', () => {
    const bad = JSON.stringify({
      tasks: [{ title: 'T', description: 'D', channel_type: 'linkedin', scheduled_date: '06/09/2026' }],
      summary: 'ok',
    })
    expect(() => validatePlanOutput(bad, weekStart)).toThrow('Invalid date format')
  })

  it('throws when task date is before week start', () => {
    const bad = JSON.stringify({
      tasks: [{ title: 'T', description: 'D', channel_type: 'linkedin', scheduled_date: '2026-06-08' }],
      summary: 'ok',
    })
    expect(() => validatePlanOutput(bad, weekStart)).toThrow('outside week')
  })

  it('throws when task date is after week end', () => {
    const bad = JSON.stringify({
      tasks: [{ title: 'T', description: 'D', channel_type: 'linkedin', scheduled_date: '2026-06-16' }],
      summary: 'ok',
    })
    expect(() => validatePlanOutput(bad, weekStart)).toThrow('outside week')
  })

  it('accepts task dates on the last day of the week', () => {
    const plan = JSON.stringify({
      tasks: [{ title: 'T', description: 'D', channel_type: 'linkedin', scheduled_date: '2026-06-15' }],
      summary: 'ok',
    })
    const result = validatePlanOutput(plan, weekStart)
    expect(result.tasks[0].scheduled_date).toBe('2026-06-15')
  })

  it('strips markdown code fences before parsing', () => {
    const fenced = '```json\n' + validPlan + '\n```'
    const result = validatePlanOutput(fenced, weekStart)
    expect(result.tasks).toHaveLength(1)
  })
})
