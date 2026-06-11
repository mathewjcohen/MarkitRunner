import type { User, Profile, Business, Channel, Task, GeneratedPlan, MetricSnapshot, UsageEvent } from '@/types'

describe('type contracts', () => {
  it('Business has required fields', () => {
    const b: Business = {
      id: 'uuid',
      user_id: 'uuid',
      name: 'Fretfolio',
      description: 'A guitar app',
      type: 'saas_app',
      primary_goal: 'grow_audience',
      success_definition: '100 paying users',
      content_themes: ['behind the scenes', 'tutorials', 'product education'],
      cold_start_notes: null,
      sort_order: 0,
      is_active: true,
      archived_at: null,
      created_at: new Date().toISOString(),
    }
    expect(b.content_themes).toHaveLength(3)
  })

  it('Channel cadence is constrained', () => {
    const valid: Channel['cadence'][] = ['daily', 'weekly', '2x_week', 'monthly']
    valid.forEach(v => expect(v).toBeTruthy())
  })

  it('UsageEvent action_type is constrained', () => {
    const valid: UsageEvent['action_type'][] = [
      'weekly_plan', 'daily_focus', 'content_prompt', 'onboarding', 'cold_start'
    ]
    valid.forEach(v => expect(v).toBeTruthy())
  })
})
