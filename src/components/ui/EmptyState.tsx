interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; href: string }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div
        className="rounded-lg p-8 w-full max-w-sm border"
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E8E4DC',
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#736C5E' }}
          >
            <rect x="6" y="6" width="36" height="36" rx="2" />
            <path d="M16 20l8 8 8-8" />
            <circle cx="24" cy="24" r="18" fill="none" />
          </svg>
        </div>

        {/* Title */}
        <h2
          className="text-xl font-semibold text-center mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#18160F',
          }}
        >
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p
            className="text-sm text-center mb-6"
            style={{
              color: '#736C5E',
              fontFamily: 'var(--font-body)',
            }}
          >
            {description}
          </p>
        )}

        {/* Action */}
        {action && (
          <a
            href={action.href}
            className="block w-full px-4 py-2 text-center rounded-md font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: '#B8601F',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#9A4F17'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#B8601F'
            }}
          >
            {action.label}
          </a>
        )}
      </div>
    </div>
  )
}
