"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function CatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-fs-light border border-fs-border flex items-center justify-center text-3xl mx-auto mb-6">
          🛒
        </div>
        <h1 className="text-2xl font-bold text-fs-graphite mb-3">
          Не удалось загрузить каталог
        </h1>
        <p className="text-fs-gray text-sm mb-8 max-w-xs mx-auto">
          Попробуйте обновить страницу или вернитесь позже.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-fs-primary text-white text-sm font-medium hover:bg-fs-soft transition-colors"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-fs-border text-fs-slate text-sm font-medium hover:border-fs-primary/30 hover:text-fs-primary transition-all"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  )
}
