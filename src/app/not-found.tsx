import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#F7F5F1' }}>
      <div className="text-center px-4">
        {/* Heading */}
        <h1
          className="text-4xl font-semibold mb-3"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#18160F',
          }}
        >
          Page not found
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg mb-8"
          style={{
            color: '#736C5E',
            fontFamily: 'var(--font-body)',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist.
        </p>

        {/* Link back to dashboard */}
        <Link
          href="/"
          className="inline-block px-6 py-2 rounded-md font-medium transition-colors cursor-pointer"
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
          Back to home
        </Link>
      </div>
    </div>
  )
}
