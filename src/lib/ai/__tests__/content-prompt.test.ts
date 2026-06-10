import { buildContentPrompt, parseContentPromptResult } from '../content-prompt'
import type { Task, Business, Channel } from '@/types'

const mockBusiness: Business = {
  id: 'b1',
  user_id: 'u1',
  name: 'TestCo',
  description: 'A SaaS for developers',
  type: 'saas_app',
  primary_goal: 'grow_audience',
  success_definition: 'Reach 1000 followers',
  content_themes: ['automation', 'indie hacking'],
  cold_start_notes: null,
  sort_order: 0,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

const mockChannel: Channel = {
  id: 'c1',
  business_id: 'b1',
  user_id: 'u1',
  type: 'instagram',
  label: null,
  cadence: 'weekly',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

const mockTask: Task = {
  id: 't1',
  business_id: 'b1',
  channel_id: 'c1',
  user_id: 'u1',
  plan_id: null,
  title: 'Share automation tip',
  description: 'Post about how we automated our onboarding emails',
  scheduled_date: '2026-06-09',
  completed_at: null,
  deferred_count: 0,
  ai_prompt_angle: null,
  ai_prompt_opening: null,
  ai_prompt_generated_at: null,
  created_at: '2026-01-01T00:00:00Z',
}

describe('buildContentPrompt', () => {
  it('includes task title and business name', () => {
    const result = buildContentPrompt(mockTask, mockBusiness, mockChannel)
    expect(result).toContain('Share automation tip')
    expect(result).toContain('TestCo')
  })

  it('includes channel type', () => {
    const result = buildContentPrompt(mockTask, mockBusiness, mockChannel)
    expect(result).toContain('instagram')
  })

  it('includes channel label when present', () => {
    const labeledChannel = { ...mockChannel, label: 'personal' }
    const result = buildContentPrompt(mockTask, mockBusiness, labeledChannel)
    expect(result).toContain('instagram (personal)')
  })

  it('includes content themes', () => {
    const result = buildContentPrompt(mockTask, mockBusiness, mockChannel)
    expect(result).toContain('automation')
    expect(result).toContain('indie hacking')
  })

  it('includes prior angle when present', () => {
    const taskWithAngle = { ...mockTask, ai_prompt_angle: 'authentic' }
    const result = buildContentPrompt(taskWithAngle, mockBusiness, mockChannel)
    expect(result).toContain('authentic')
  })

  it('does not include angle line when angle is null', () => {
    const result = buildContentPrompt(mockTask, mockBusiness, mockChannel)
    expect(result).not.toContain('Previously identified angle')
  })
})

describe('parseContentPromptResult', () => {
  it('parses valid response', () => {
    const raw = JSON.stringify({
      angle: 'educational',
      prompt: 'Write a carousel post about how we automated onboarding emails.',
    })
    const result = parseContentPromptResult(raw)
    expect(result.angle).toBe('educational')
    expect(result.prompt).toContain('carousel post')
  })

  it('throws on invalid JSON', () => {
    expect(() => parseContentPromptResult('not json')).toThrow('not valid JSON')
  })

  it('throws on missing angle field', () => {
    expect(() =>
      parseContentPromptResult(JSON.stringify({ prompt: 'some prompt' }))
    ).toThrow()
  })

  it('throws on missing prompt field', () => {
    expect(() =>
      parseContentPromptResult(JSON.stringify({ angle: 'bold' }))
    ).toThrow()
  })
})
