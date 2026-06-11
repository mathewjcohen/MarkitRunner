'use client'

import { useState } from 'react'
import type { Business, Channel, Task } from '@/types'
import { BusinessCard } from './BusinessCard'
import { DashboardTabs } from './DashboardTabs'

interface TaskWithRelations extends Task {
  businesses: { name: string } | null
  channels: { type: string; label: string | null } | null
}

export interface BusinessWithData {
  business: Business
  channels: Channel[]
  todayTasks: TaskWithRelations[]
  weekTasks: TaskWithRelations[]
  completedThisWeek: number
  totalThisWeek: number
  daysSinceLastTask: number | null
  nextTaskDate: string | null
  weekStartDate: string
}

interface DashboardShellProps {
  businessesWithData: BusinessWithData[]
  weekDates: Array<{ date: string; dayName: string; dayNum: number }>
}

export function DashboardShell({ businessesWithData, weekDates }: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'weekly'>('today')

  function handleViewWeek() {
    setActiveTab('weekly')
    // Scroll to tabs area smoothly
    setTimeout(() => {
      document.getElementById('dashboard-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <>
      <div className="flex flex-col gap-4 mb-8">
        {businessesWithData.map(
          ({ business, channels, completedThisWeek, totalThisWeek, daysSinceLastTask, nextTaskDate, weekStartDate }) => (
            <BusinessCard
              key={business.id}
              business={business}
              channels={channels}
              completedThisWeek={completedThisWeek}
              totalThisWeek={totalThisWeek}
              daysSinceLastTask={daysSinceLastTask}
              nextTaskDate={nextTaskDate}
              weekStartDate={weekStartDate}
              onViewWeek={handleViewWeek}
            />
          )
        )}
      </div>
      <div id="dashboard-tabs">
        <DashboardTabs
          businessesWithData={businessesWithData}
          weekDates={weekDates}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </>
  )
}
