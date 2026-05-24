import Navbar from "@/components/layout/Navbar"

function SkeletonCard() {
  return (
    <div className="bg-fs-white border border-fs-border rounded-2xl overflow-hidden flex flex-col shadow-card">
      <div className="h-40 sm:h-48 md:h-56 skeleton-green border-b border-fs-border" />
      <div className="p-3 sm:p-5 flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="h-3 w-20 skeleton-green rounded-pill" />
          <div className="h-3 w-10 skeleton-green rounded-pill" />
        </div>
        <div className="h-5 w-3/4 skeleton-green rounded-lg" />
        <div className="h-3 w-full skeleton-green rounded-lg" />
        <div className="h-3 w-2/3 skeleton-green rounded-lg" />
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-fs-border">
          <div className="h-6 w-20 skeleton-green rounded-lg" />
          <div className="h-9 w-9 skeleton-green rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default function CatalogLoading() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />

      {/* CatalogHero skeleton */}
      <div className="h-40 sm:h-52 skeleton-green" />

      <section className="fs-section">
        <div className="fs-container py-8 sm:py-14 lg:py-20">
          {/* header */}
          <div className="flex items-end justify-between mb-6 sm:mb-10">
            <div className="flex flex-col gap-3">
              <div className="h-3 w-24 skeleton-green rounded-pill" />
              <div className="h-8 w-48 skeleton-green rounded-lg" />
            </div>
            <div className="h-3 w-16 skeleton-green rounded-pill" />
          </div>

          {/* search bar */}
          <div className="h-12 skeleton-green rounded-xl mb-4" />

          {/* filter chips */}
          <div className="flex gap-2 mb-8 mt-4">
            {[80, 120, 96, 110, 88, 104].map((w, i) => (
              <div key={i} className="h-9 skeleton-green rounded-full flex-shrink-0" style={{ width: w }} />
            ))}
          </div>

          {/* grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
