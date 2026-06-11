function fmt(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// weekStartDay: 0=Sunday, 1=Monday, ..., 6=Saturday (default Monday)
export function buildWeekRange(dateStr: string, weekStartDay = 1): { start: string; end: string } {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day) // local time
  const dow = date.getDay()
  const diffToStart = (dow - weekStartDay + 7) % 7
  const start = new Date(year, month - 1, day - diffToStart)
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
  return { start: fmt(start), end: fmt(end) }
}

export function getWeekDates(
  startDateStr: string
): Array<{ date: string; dayName: string; dayNum: number }> {
  const [year, month, day] = startDateStr.split('-').map(Number)
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(year, month - 1, day + i)
    days.push({
      date: fmt(d),
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
    })
  }
  return days
}

export function formatDateRange(startDateStr: string): string {
  const [year, month, day] = startDateStr.split('-').map(Number)
  const startDate = new Date(year, month - 1, day)
  const endDate = new Date(year, month - 1, day + 6)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const startMonth = monthNames[startDate.getMonth()]
  const endMonth = monthNames[endDate.getMonth()]

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startMonth} ${startDate.getDate()}–${endDate.getDate()}, ${endDate.getFullYear()}`
  } else {
    return `${startMonth} ${startDate.getDate()}–${endMonth} ${endDate.getDate()}, ${endDate.getFullYear()}`
  }
}

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}
