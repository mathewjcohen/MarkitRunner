import { buildFocusPrompt, parseFocusResult, selectFocusTask } from '../daily-focus'
import type { Task, Business, Channel } from '@/types'

const mockBusiness: Business = {
  id: 'b1',
  user_id: 'u1',
  name: 'TestCo',
  description: 'A SaaS for developers',
  type: 'saas_app',
  primary_goal: 'grow_audience',
  success_definition: 'Reach 1000 followers',
  content_themes: ['dev tools', 'productivity'],
  cold_start_notes: null,
  sort_order: 0,
  is_active: true,
  archived_at: null,
  created_at: '2026-01-01T00:00:00Z',
}

const mockChannel: Channel = {
  id: 'c1',
  business_id: 'b1',
  user_id: 'u1',
  type: 'linkedin',
  label: null,
  cadence: 'weekly',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    business_id: 'b1',
    channel_id: 'c1',
    user_id: 'u1',
    plan_id: null,
    title: 'Post about dev tools',
    description: 'Share a tip about automation',
    scheduled_date: '2026-06-09',
    completed_at: null,
    deferred_count: 0,
    ai_prompt_angle: null,
    ai_prompt_opening: null,
    ai_prompt_generated_at: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('buildFocusPrompt', () => {
  it('includes task title and business name', () => {
    const prompt = buildFocusPrompt({ task: makeTask(), business: mockBusiness, channel: mockChannel })
    expect(prompt).toContain('Post about dev tools')
    expect(prompt).toContain('TestCo')
  })

  it('includes channel type', () => {
    const prompt = buildFocusPrompt({ task: makeTask(), business: mockBusiness, channel: mockChannel })
    expect(prompt).toContain('linkedin')
  })

  it('includes channel label when present', () => {
    const labeledChannel = { ...mockChannel, label: 'personal' }
    const prompt = buildFocusPrompt({ task: makeTask(), business: mockBusiness, channel: labeledChannel })
    expect(prompt).toContain('linkedin (personal)')
  })

  it('includes task description when present', () => {
    const prompt = buildFocusPrompt({ task: makeTask(), business: mockBusiness, channel: mockChannel })
    expect(prompt).toContain('Share a tip about automation')
  })
})

describe('parseFocusResult', () => {
  it('parses valid JSON', () => {
    const raw = JSON.stringify({ angle: 'authentic', opening: 'Most devs ignore this.' })
    const result = parseFocusResult(raw)
    expect(result.angle).toBe('authentic')
    expect(result.opening).toBe('Most devs ignore this.')
  })

  it('throws on invalid JSON', () => {
    expect(() => parseFocusResult('not json')).toThrow('not valid JSON')
  })

  it('throws on missing fields', () => {
    expect(() => parseFocusResult(JSON.stringify({ angle: 'bold' }))).toThrow()
  })
})

describe('selectFocusTask', () => {
  it('returns null for empty array', () => {
    expect(selectFocusTask([])).toBeNull()
  })

  it('returns null if all tasks completed', () => {
    const tasks = [makeTask({ completed_at: '2026-06-09T10:00:00Z' })]
    expect(selectFocusTask(tasks)).toBeNull()
  })

  it('prefers most deferred task', () => {
    const t1 = makeTask({ id: 't1', deferred_count: 1 })
    const t2 = makeTask({ id: 't2', deferred_count: 3 })
    const t3 = makeTask({ id: 't3', deferred_count: 0 })
    expect(selectFocusTask([t1, t2, t3])?.id).toBe('t2')
  })

  it('falls back to earliest date when deferred counts equal', () => {
    const t1 = makeTask({ id: 't1', scheduled_date: '2026-06-10' })
    const t2 = makeTask({ id: 't2', scheduled_date: '2026-06-08' })
    expect(selectFocusTask([t1, t2])?.id).toBe('t2')
  })
})
