export function buildWeekRange(dateStr: string): { start: string; end: string } {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day) // local time, not UTC
  const dow = date.getDay()
  const diffToMonday = (dow === 0 ? -6 : 1 - dow)
  const monday = new Date(year, month - 1, day + diffToMonday)
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)

  function fmt(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }

  return { start: fmt(monday), end: fmt(sunday) }
}

export function getWeekDates(
  startDateStr: string
): Array<{ date: string; dayName: string; dayNum: number }> {
  const [year, month, day] = startDateStr.split('-').map(Number)
  const startDate = new Date(year, month - 1, day) // local time

  const days = []
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  for (let i = 0; i < 7; i++) {
    const d = new Date(year, month - 1, day + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    days.push({
      date: dateStr,
      dayName: dayNames[i],
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

  // If same month, show "Jun 9–15" format; if different months, show "May 31–Jun 6" format
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
