import { getBusinesses } from '@/actions/businesses'
import { getLatestMetricsByKey } from '@/actions/metrics'
import { MetricLogForm } from '@/components/metrics/MetricLogForm'

const CATEGORY_COLORS: Record<string, string> = {
  app: '#3B82F6',
  content: '#8B5CF6',
  community: '#10B981',
  sales: '#B8601F',
  custom: '#736C5E',
}

export default async function MetricsPage() {
  const businesses = await getBusinesses()

  const businessesWithMetrics = await Promise.all(
    businesses.map(async (b) => {
      const metrics = await getLatestMetricsByKey(b.id)
      return { business: b, metrics }
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
          {businessesWithMetrics.map(({ business, metrics }) => (
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
                  {metrics.map((m) => (
                    <div
                      key={m.metric_key}
                      className="rounded-2xl p-4 border"
                      style={{ backgroundColor: '#FFFFFF', borderColor: '#E8E4DC' }}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[m.metric_category] ?? '#736C5E' }}
                        />
                        <span className="text-xs" style={{ color: '#736C5E' }}>
                          {m.metric_label}
                        </span>
                      </div>
                      <p
                        className="text-2xl font-semibold"
                        style={{ fontFamily: 'var(--font-display)', color: '#18160F' }}
                      >
                        {m.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
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
