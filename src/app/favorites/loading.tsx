import Navbar from "@/components/layout/Navbar"

export default function FavoritesLoading() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <div className="fs-container py-12">
        <div className="h-8 w-40 skeleton-green rounded-xl mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-fs-white border border-fs-border rounded-2xl overflow-hidden shadow-card">
              <div className="h-40 sm:h-48 skeleton-green border-b border-fs-border" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 w-3/4 skeleton-green rounded-lg" />
                <div className="h-3 w-full skeleton-green rounded-lg" />
                <div className="h-6 w-20 skeleton-green rounded-lg mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
