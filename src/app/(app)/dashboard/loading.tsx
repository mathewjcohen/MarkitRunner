export default function DashboardLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 rounded-lg mb-8" style={{ backgroundColor: '#E8E4DC', width: '8rem' }} />
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 rounded-2xl" style={{ backgroundColor: '#E8E4DC' }} />
        ))}
      </div>
    </div>
  )
}
