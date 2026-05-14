export default function Loading() {
  return (
    <div className="container-page py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-40 bg-white/10 rounded" />
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-56" />
          ))}
        </div>
      </div>
    </div>
  )
}
