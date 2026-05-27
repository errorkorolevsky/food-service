"use client"

import { Package, Truck, Zap } from "lucide-react"
import FadeIn from "@/components/ui/FadeIn"
import { useLang } from "@/locales"

export default function CatalogHero({ productCount }: { productCount?: number }) {
  const { t } = useLang()

  const stats = [
    { icon: Package, value: productCount ? `${productCount}+` : "357+", label: t.catalog.stat1 },
    { icon: Truck,   value: "15",                                        label: t.catalog.stat2 },
    { icon: Zap,     value: "AI",                                        label: t.catalog.stat3 },
  ]

  return (
    <div className="fs-section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-60 pointer-events-none" />

      <div className="fs-container py-16 relative z-10">
        <FadeIn>
          <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 text-white px-4 py-2 rounded-pill text-caption font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
            {t.catalog.heroBadge}
          </div>
          <h1 className="text-heading text-white">
            {t.catalog.heroTitle1}
            <br />
            {t.catalog.heroTitle2}
            <br />
            {t.catalog.heroTitle3}
          </h1>
          <p className="text-body-lg text-white/70 mt-6 max-w-xl">
            {t.catalog.heroSubtitle}
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="
                  bg-white/10 border border-white/20 rounded-xl
                  p-4 text-center backdrop-blur-sm
                "
              >
                <Icon size={18} strokeWidth={1.5} className="text-white/70 mx-auto mb-2" />
                <p className="text-title font-black text-white">{value}</p>
                <p className="text-label text-white/60 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
