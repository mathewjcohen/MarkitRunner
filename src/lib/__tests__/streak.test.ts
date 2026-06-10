import {
  getPeriodDates,
  calculateStreakForChannel,
  calculateConsistencyScore,
} from '../streak'

describe('getPeriodDates', () => {
  // June 2026: starts on Monday June 1
  it('daily: returns all weekdays in June 2026', () => {
    const dates = getPeriodDates('daily', 2026, 6)
    // June 2026 has 30 days; weekdays: need to count Mon-Fri
    // Week 1: Mon Jun 1 - Fri Jun 5 = 5
    // Week 2: Mon Jun 8 - Fri Jun 12 = 5
    // Week 3: Mon Jun 15 - Fri Jun 19 = 5
    // Week 4: Mon Jun 22 - Fri Jun 26 = 5
    // Week 5: Mon Jun 29 - Tue Jun 30 = 2
    expect(dates.length).toBe(22)
    expect(dates[0]).toBe('2026-06-01')
    expect(dates).not.toContain('2026-06-06') // Saturday
    expect(dates).not.toContain('2026-06-07') // Sunday
  })

  it('weekly: returns Mondays only', () => {
    const dates = getPeriodDates('weekly', 2026, 6)
    expect(dates).toEqual(['2026-06-01', '2026-06-08', '2026-06-15', '2026-06-22', '2026-06-29'])
  })

  it('2x_week: returns Mondays and Thursdays', () => {
    const dates = getPeriodDates('2x_week', 2026, 6)
    expect(dates).toContain('2026-06-01') // Monday
    expect(dates).toContain('2026-06-04') // Thursday
    expect(dates).toContain('2026-06-08') // Monday
    expect(dates.length).toBe(9) // 5 Mondays + 4 Thursdays in June 2026
  })

  it('monthly: returns only the 1st', () => {
    const dates = getPeriodDates('monthly', 2026, 6)
    expect(dates).toEqual(['2026-06-01'])
  })
})

describe('calculateStreakForChannel', () => {
  const tasks = [
    { channel_id: 'c1', scheduled_date: '2026-06-01', completed_at: '2026-06-01T10:00:00Z' },
    { channel_id: 'c1', scheduled_date: '2026-06-08', completed_at: '2026-06-08T10:00:00Z' },
    { channel_id: 'c1', scheduled_date: '2026-06-15', completed_at: null },
  ]

  it('returns 0 when no tasks completed', () => {
    expect(calculateStreakForChannel('c1', [], 'weekly', '2026-06-09')).toBe(0)
  })

  it('counts consecutive completed weeks', () => {
    // Today is June 9 (Tuesday). Most recent expected Monday was June 8 ✅, June 1 ✅
    // June 15 hasn't happened yet (it's in the future relative to June 9)
    const streak = calculateStreakForChannel('c1', tasks, 'weekly', '2026-06-09')
    expect(streak).toBe(2)
  })

  it('breaks streak on first missing completion', () => {
    const tasksWithGap = [
      { channel_id: 'c1', scheduled_date: '2026-06-08', completed_at: '2026-06-08T10:00:00Z' },
      // June 1 NOT completed — gap
    ]
    const streak = calculateStreakForChannel('c1', tasksWithGap, 'weekly', '2026-06-09')
    expect(streak).toBe(1) // only June 8 counts
  })
})

describe('calculateConsistencyScore', () => {
  it('returns 100 when all expected tasks completed', () => {
    const tasks = [
      { channel_id: 'c1', scheduled_date: '2026-06-01', completed_at: '2026-06-01T10:00:00Z' },
    ]
    expect(calculateConsistencyScore('c1', tasks, 'monthly', 2026, 6)).toBe(100)
  })

  it('returns 0 when no tasks completed', () => {
    expect(calculateConsistencyScore('c1', [], 'monthly', 2026, 6)).toBe(0)
  })

  it('returns partial score for partial completion', () => {
    // weekly in June 2026: 5 Mondays
    const tasks = [
      { channel_id: 'c1', scheduled_date: '2026-06-01', completed_at: '2026-06-01T10:00:00Z' },
      { channel_id: 'c1', scheduled_date: '2026-06-08', completed_at: '2026-06-08T10:00:00Z' },
      // 3 more not done
    ]
    const score = calculateConsistencyScore('c1', tasks, 'weekly', 2026, 6)
    expect(score).toBe(40) // 2/5 = 40%
  })
})
