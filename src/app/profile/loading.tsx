import Navbar from "@/components/layout/Navbar"

export default function ProfileLoading() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <div className="fs-container py-12">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 skeleton-green rounded-2xl" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-36 skeleton-green rounded-lg" />
              <div className="h-4 w-24 skeleton-green rounded-lg" />
            </div>
          </div>
          <div className="h-12 skeleton-green rounded-2xl" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 skeleton-green rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  )
}
