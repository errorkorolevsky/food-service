"use client"

import Link from "next/link"
import { useLang } from "@/locales"

export default function OrderSuccessError() {
  const { t } = useLang()

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        <div className="text-5xl mb-6">📦</div>
        <h2 className="text-title font-black text-fs-graphite mb-3">{t.errors.serverError}</h2>
        <p className="text-body text-fs-gray mb-8">{t.errors.errorDesc}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/tracking" className="fs-btn-primary px-5 py-3 rounded-xl text-body font-bold">
            {t.nav.tracking}
          </Link>
          <Link href="/catalog" className="fs-btn-secondary px-5 py-3 rounded-xl text-body font-medium">
            {t.errors.openCatalog}
          </Link>
        </div>
      </div>
    </main>
  )
}
