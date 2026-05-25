import Navbar from "@/components/layout/Navbar"

function SkeletonMetric() {
  return (
    <div className="bg-white border border-fs-border rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 skeleton-green rounded-2xl" />
        <div className="h-5 w-12 skeleton-green rounded-full" />
      </div>
      <div className="h-8 w-24 skeleton-green rounded-lg mb-2" />
      <div className="h-3 w-32 skeleton-green rounded" />
    </div>
  )
}

export default function AdminLoading() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <div className="fs-container py-12">
        {/* PIN guard skeleton */}
        <div className="max-w-sm mx-auto flex flex-col items-center gap-6 py-20">
          <div className="w-16 h-16 skeleton-green rounded-3xl" />
          <div className="h-6 w-40 skeleton-green rounded-lg" />
          <div className="h-4 w-48 skeleton-green rounded" />
          <div className="grid grid-cols-3 gap-3 w-full">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-16 skeleton-green rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
