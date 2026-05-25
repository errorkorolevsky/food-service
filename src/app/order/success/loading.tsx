import Navbar from "@/components/layout/Navbar"

export default function OrderSuccessLoading() {
  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-fs-graphite">
      <Navbar />
      <div className="fs-container py-12 sm:py-20">
        <div className="max-w-2xl mx-auto">

          {/* Success icon skeleton */}
          <div className="text-center mb-14">
            <div className="w-24 h-24 rounded-3xl mx-auto mb-8 skeleton-green" />
            <div className="h-6 w-32 skeleton-green rounded-full mx-auto mb-6" />
            <div className="h-9 w-64 skeleton-green rounded-xl mx-auto" />
            <div className="h-5 w-80 skeleton-green rounded-lg mx-auto mt-4" />
          </div>

          {/* Order info card skeleton */}
          <div className="bg-fs-white border border-fs-border rounded-2xl p-8 mb-6">
            <div className="flex items-center justify-between mb-8">
              <div className="h-5 w-28 skeleton-green rounded-lg" />
              <div className="h-5 w-24 skeleton-green rounded-lg" />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-fs-offwhite border border-fs-border rounded-xl p-4">
                  <div className="h-3 w-12 skeleton-green rounded mx-auto mb-2" />
                  <div className="h-4 w-16 skeleton-green rounded mx-auto" />
                </div>
              ))}
            </div>

            {/* Address skeleton */}
            <div className="h-11 skeleton-green rounded-xl mb-5" />

            {/* Items skeleton */}
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 skeleton-green rounded-lg flex-shrink-0" />
                  <div className="flex-1 h-4 skeleton-green rounded-lg" />
                  <div className="w-16 h-4 skeleton-green rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* CTA buttons skeleton */}
          <div className="flex gap-3">
            <div className="flex-1 h-12 skeleton-green rounded-xl" />
            <div className="flex-1 h-12 skeleton-green rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  )
}
