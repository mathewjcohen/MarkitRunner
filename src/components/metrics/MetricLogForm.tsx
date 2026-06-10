'use client'

import { useState } from 'react'
import { logMetric } from '@/actions/metrics'
import type { MetricCategory } from '@/types'

interface MetricLogFormProps {
  businessId: string
}

const PRESET_METRICS: { key: string; label: string; category: MetricCategory }[] = [
  { key: 'followers_instagram', label: 'Instagram Followers', category: 'content' },
  { key: 'followers_linkedin', label: 'LinkedIn Followers', category: 'content' },
  { key: 'subscribers_email', label: 'Email Subscribers', category: 'content' },
  { key: 'mrr', label: 'Monthly Revenue (MRR)', category: 'sales' },
  { key: 'signups', label: 'App Signups', category: 'app' },
  { key: 'active_users', label: 'Active Users', category: 'app' },
  { key: 'community_members', label: 'Community Members', category: 'community' },
]

const CATEGORY_COLORS: Record<MetricCategory, string> = {
  app: '#3B82F6',
  content: '#8B5CF6',
  community: '#10B981',
  sales: '#B8601F',
  custom: '#736C5E',
}

export function MetricLogForm({ businessId }: MetricLogFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [customLabel, setCustomLabel] = useState('')
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const preset = PRESET_METRICS.find((p) => p.key === selectedPreset)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value || (!selectedPreset && !customLabel)) return

    setSubmitting(true)
    setSuccess(false)

    const metricKey = selectedPreset || customLabel.toLowerCase().replace(/\s+/g, '_')
    const metricLabel = preset?.label ?? customLabel
    const category: MetricCategory = preset?.category ?? 'custom'

    const result = await logMetric(businessId, metricKey, metricLabel, category, Number(value))

    setSubmitting(false)
    if (!result.error) {
      setSuccess(true)
      setValue('')
      setTimeout(() => setSuccess(false), 2000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Preset selector */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#736C5E' }}>
          Metric
        </label>
        <select
          value={selectedPreset}
          onChange={(e) => { setSelectedPreset(e.target.value); setCustomLabel('') }}
          className="w-full text-sm rounded-xl px-3 py-2.5 border appearance-none cursor-pointer focus:outline-none"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC', color: '#18160F' }}
        >
          <option value="">Custom metric...</option>
          {PRESET_METRICS.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Custom label (when no preset) */}
      {!selectedPreset && (
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: '#736C5E' }}>
            Metric name
          </label>
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="e.g. YouTube Subscribers"
            className="w-full text-sm rounded-xl px-3 py-2.5 border focus:outline-none"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC', color: '#18160F' }}
          />
        </div>
      )}

      {/* Value */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: '#736C5E' }}>
          Current value
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          required
          className="w-full text-sm rounded-xl px-3 py-2.5 border focus:outline-none"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC', color: '#18160F' }}
        />
      </div>

      {preset && (
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[preset.category] }}
          />
          <span className="text-xs" style={{ color: '#736C5E' }}>{preset.category}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || (!selectedPreset && !customLabel) || !value}
        className="py-2.5 px-4 rounded-xl text-sm font-medium transition-opacity cursor-pointer disabled:opacity-60"
        style={{ backgroundColor: success ? '#10B981' : '#B8601F', color: '#FFFFFF' }}
      >
        {submitting ? 'Saving...' : success ? 'Saved!' : 'Log metric'}
      </button>
    </form>
  )
}
