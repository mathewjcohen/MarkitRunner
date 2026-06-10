import { getBusinesses } from '@/actions/businesses'
import { getLatestMetricsByKey, getMetricsForBusiness } from '@/actions/metrics'
import { MetricLogForm } from '@/components/metrics/MetricLogForm'
import { Sparkline } from '@/components/metrics/Sparkline'
import type { MetricSnapshot } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  app: '#3B82F6',
  content: '#8B5CF6',
  community: '#10B981',
  sales: '#B8601F',
  custom: '#736C5E',
}

function getTrendIndicator(current: number, previous: number | null): { trend: string; percentage: number; color: string } | null {
  if (previous === null) {
    return null
  }

  const delta = current - previous
  const percentage = Math.abs((delta / previous) * 100)
  const isPositive = delta > 0
  const isNeutral = delta === 0

  if (isNeutral) {
    return { trend: '—', percentage: 0, color: '#736C5E' }
  }

  return {
    trend: isPositive ? '↑' : '↓',
    percentage,
    color: isPositive ? '#10B981' : '#DC2626',
  }
}

function groupMetricsByKey(allMetrics: MetricSnapshot[]): Record<string, MetricSnapshot[]> {
  const grouped: Record<string, MetricSnapshot[]> = {}

  for (const metric of allMetrics) {
    if (!grouped[metric.metric_key]) {
      grouped[metric.metric_key] = []
    }
    grouped[metric.metric_key].push(metric)
  }

  // Sort each group by recorded_at descending and take last 10
  for (const key in grouped) {
    grouped[key] = grouped[key]
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
      .slice(0, 10)
  }

  return grouped
}

export default async function MetricsPage() {
  const businesses = await getBusinesses()

  const businessesWithMetrics = await Promise.all(
    businesses.map(async (b) => {
      const latest = await getLatestMetricsByKey(b.id)
      const allMetrics = await getMetricsForBusiness(b.id)
      const historicalByKey = groupMetricsByKey(allMetrics)
      return { business: b, metrics: latest, historicalByKey }
    })
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-semibold mb-8"
        style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
      >
        Metrics
      </h1>

      {businesses.length === 0 ? (
        <p style={{ color: '#736C5E' }}>No businesses yet.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {businessesWithMetrics.map(({ business, metrics, historicalByKey }) => (
            <div key={business.id}>
              <h2
                className="text-base font-semibold mb-4"
                style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
              >
                {business.name}
              </h2>

              {/* Current metrics grid */}
              {metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {metrics.map((m) => {
                    const historicalMetrics = historicalByKey[m.metric_key] || []
                    const hasSparklineData = historicalMetrics.length >= 3

                    // Get previous value (second-most-recent)
                    const previousValue = historicalMetrics.length >= 2 ? historicalMetrics[1].value : null
                    const trendInfo = getTrendIndicator(m.value, previousValue)

                    // Extract values for sparkline (in chronological order, oldest first)
                    const sparklineValues = historicalMetrics
                      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
                      .map((metric) => metric.value)

                    return (
                      <div
                        key={m.metric_key}
                        className="rounded-2xl p-4 border"
                        style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: CATEGORY_COLORS[m.metric_category] ?? '#736C5E' }}
                            />
                            <span className="text-xs" style={{ color: '#736C5E' }}>
                              {m.metric_label}
                            </span>
                          </div>
                          {trendInfo && (
                            <span
                              className="text-xs font-semibold"
                              style={{ color: trendInfo.color }}
                            >
                              {trendInfo.trend} {trendInfo.percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <p
                          className="text-2xl font-semibold"
                          style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
                        >
                          {m.value.toLocaleString()}
                        </p>
                        {hasSparklineData && <Sparkline values={sparklineValues} />}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Log form */}
              <div
                className="rounded-2xl p-5 border"
                style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
              >
                <p className="text-sm font-medium mb-4" style={{ color: '#18160F' }}>
                  Log a metric
                </p>
                <MetricLogForm businessId={business.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
