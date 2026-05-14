export default function Loading() {
  return (
    <div className="container-page py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-24 bg-white/10 rounded" />
        <div className="h-10 w-2/3 bg-white/10 rounded" />
        <div className="h-64 w-full bg-white/10 rounded" />
      </div>
    </div>
  )
}
