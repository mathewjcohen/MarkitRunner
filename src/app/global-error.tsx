'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const truncatedMessage = error.message.length > 120 ? error.message.slice(0, 120) + '...' : error.message

  return (
    <html>
      <body className="min-h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#F7F5F1' }}>
        <div
          className="rounded-lg p-8 w-full max-w-sm border text-center"
          style={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E8E4DC',
          }}
        >
          {/* Heading */}
          <h1
            className="text-xl font-semibold mb-3"
            style={{
              fontFamily: 'var(--font-display)',
              color: '#736C5E',
            }}
          >
            Something went wrong
          </h1>

          {/* Error message */}
          <p
            className="text-sm mb-6"
            style={{
              color: '#736C5E',
              fontFamily: 'var(--font-body)',
              lineHeight: '1.5',
            }}
          >
            {truncatedMessage || 'An unexpected error occurred. Please try again.'}
          </p>

          {/* Try again button */}
          <button
            onClick={reset}
            className="w-full px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: '#B8601F',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#9A4F17'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#B8601F'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
