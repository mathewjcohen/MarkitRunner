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
})

describe('validatePlanOutput', () => {
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
    const result = validatePlanOutput(validPlan)
    expect(result.tasks).toHaveLength(1)
    expect(result.summary).toBe('Focus on audience growth through LinkedIn this week')
  })

  it('throws on invalid JSON', () => {
    expect(() => validatePlanOutput('not json')).toThrow('not valid JSON')
  })

  it('throws when tasks array is missing', () => {
    expect(() => validatePlanOutput(JSON.stringify({ summary: 'ok' }))).toThrow()
  })

  it('throws on invalid date format', () => {
    const bad = JSON.stringify({
      tasks: [{ title: 'T', description: 'D', channel_type: 'linkedin', scheduled_date: '06/09/2026' }],
      summary: 'ok',
    })
    expect(() => validatePlanOutput(bad)).toThrow('Invalid date format')
  })
})
