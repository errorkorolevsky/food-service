import Navbar from "@/components/layout/Navbar"

export default function TrackingLoading() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <div className="fs-container py-12">
        <div className="max-w-lg mx-auto flex flex-col gap-5">
          <div className="h-8 w-44 skeleton-green rounded-xl" />
          <div className="h-14 skeleton-green rounded-xl" />
          <div className="h-48 skeleton-green rounded-2xl" />
          <div className="h-32 skeleton-green rounded-2xl" />
        </div>
      </div>
    </main>
  )
}
