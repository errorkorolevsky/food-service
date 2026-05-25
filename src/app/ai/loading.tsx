import Navbar from "@/components/layout/Navbar"

export default function AiLoading() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <div className="fs-container py-12">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="h-8 w-48 skeleton-green rounded-xl" />
          <div className="h-[60vh] skeleton-green rounded-2xl" />
          <div className="h-14 skeleton-green rounded-xl" />
        </div>
      </div>
    </main>
  )
}
