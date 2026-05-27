"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[RootError]", error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-[64px] font-black text-white/10 select-none">500</p>
        <h1 className="text-[22px] font-bold text-white mt-2">
          Что-то пошло не так
        </h1>
        <p className="text-[14px] text-white/50 mt-2 leading-relaxed">
          Произошла ошибка. Попробуйте обновить страницу.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-[#005B46] text-white text-[14px] font-semibold hover:bg-[#0D9E76] transition-colors"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-[14px] font-semibold hover:border-white/20 hover:text-white transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  )
}
