export default function MetricsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 rounded-lg mb-8" style={{ backgroundColor: '#E8E4DC', width: '8rem' }} />
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl" style={{ backgroundColor: '#E8E4DC' }} />
        ))}
      </div>
    </div>
  )
}
