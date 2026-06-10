import { buildWeekRange } from '@/actions/tasks'

describe('buildWeekRange', () => {
  it('returns Monday to Sunday for a given week start', () => {
    const { start, end } = buildWeekRange('2026-06-09')
    expect(start).toBe('2026-06-09') // Monday of that week
    expect(end).toBe('2026-06-15')   // Sunday
  })
})
