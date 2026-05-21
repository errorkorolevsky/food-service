import type { Metadata } from "next"
import { Package, Truck, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Каталог — Food Service",
  description: "Более 30 позиций HoReCa: морепродукты, суши-ингредиенты, кофе, выпечка, заморозка и расходники для ресторанов Шымкента.",
  openGraph: {
    title: "Каталог Food Service — HoReCa поставки",
    description: "Seafood, Coffee, Bakery, Sushi и HoReCa Essentials с доставкой 15–30 мин по Шымкенту.",
  },
}

import Navbar from "@/components/layout/Navbar"
import CartButton from "@/components/layout/CartButton"
import CartDrawer from "@/components/layout/CartDrawer"
import CatalogSection from "@/components/sections/CatalogSection"
import FadeIn from "@/components/ui/FadeIn"
import FloatingNotification from "@/components/ui/FloatingNotification"

const stats = [
  { icon: Package, value: "200+",   label: "позиций в каталоге" },
  { icon: Truck,   value: "15 мин", label: "среднее время доставки" },
  { icon: Zap,     value: "AI",     label: "умный подбор поставок" },
]

export default function CatalogPage() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />

      {/* HERO */}
      <div className="fs-section relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-60 pointer-events-none" />

        <div className="fs-container py-16 relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 text-white px-4 py-2 rounded-pill text-caption font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
              HoReCa Catalog
            </div>
            <h1 className="text-heading text-white">
              Всё для вашей
              <br />
              профессиональной
              <br />
              кухни.
            </h1>
            <p className="text-body-lg text-white/70 mt-6 max-w-xl">
              Свежие продукты, кофе, выпечка и ингредиенты
              для ресторанов, кофеен и dark kitchen Шымкента.
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

      <CatalogSection />

      <CartDrawer />
      <CartButton />
      <FloatingNotification />
    </main>
  )
}
