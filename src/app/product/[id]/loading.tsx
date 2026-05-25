import Navbar from "@/components/layout/Navbar"

export default function ProductLoading() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <div className="fs-container py-12">
        {/* Back link */}
        <div className="h-4 w-28 skeleton-green rounded mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Image */}
          <div className="min-h-[280px] sm:min-h-[380px] lg:min-h-[560px] skeleton-green rounded-2xl" />

          {/* Info */}
          <div className="space-y-7">
            <div className="flex gap-2">
              <div className="h-6 w-24 skeleton-green rounded-full" />
              <div className="h-6 w-16 skeleton-green rounded-full" />
            </div>
            <div className="h-10 w-3/4 skeleton-green rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-full skeleton-green rounded" />
              <div className="h-4 w-5/6 skeleton-green rounded" />
              <div className="h-4 w-4/6 skeleton-green rounded" />
            </div>
            <div className="h-10 w-36 skeleton-green rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 skeleton-green rounded-xl" />
              ))}
            </div>
            <div className="border-t border-fs-border" />
            <div className="flex gap-4">
              <div className="flex-1 h-14 skeleton-green rounded-xl" />
              <div className="h-14 w-14 skeleton-green rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
