export default function TodayLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-7 rounded-lg mb-2" style={{ backgroundColor: '#E8E4DC', width: '6rem' }} />
      <div className="h-4 rounded-lg mb-8" style={{ backgroundColor: '#E8E4DC', width: '10rem' }} />
      <div className="h-56 rounded-2xl" style={{ backgroundColor: '#E8E4DC' }} />
    </div>
  )
}
