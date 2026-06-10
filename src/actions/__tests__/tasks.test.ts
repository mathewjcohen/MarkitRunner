import { buildWeekRange } from '@/actions/tasks'

describe('buildWeekRange', () => {
  it('returns Monday to Sunday for a given week start', () => {
    const { start, end } = buildWeekRange('2026-06-09') // June 9, 2026 is a Tuesday
    expect(start).toBe('2026-06-08') // Monday
    expect(end).toBe('2026-06-14')   // Sunday
  })

  it('handles Sunday input by going back to Monday', () => {
    const { start, end } = buildWeekRange('2026-06-14') // Sunday
    expect(start).toBe('2026-06-08')
    expect(end).toBe('2026-06-14')
  })
})
