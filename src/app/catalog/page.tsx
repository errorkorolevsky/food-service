import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Каталог — Food Service Шымкент",
  description: "Более 200 позиций: мясо, рыба, молочные, напитки, заморозка и многое другое с доставкой на дом по Шымкенту.",
  openGraph: {
    title: "Каталог Food Service — доставка продуктов в Шымкенте",
    description: "Свежие продукты, готовая еда и товары для дома с доставкой 15–30 мин по Шымкенту.",
  },
}

import Navbar from "@/components/layout/Navbar"
import CartButton from "@/components/layout/CartButton"
import CartDrawer from "@/components/layout/CartDrawer"
import Footer from "@/components/layout/Footer"
import CatalogSection from "@/components/sections/CatalogSection"
import CatalogHero from "@/components/sections/CatalogHero"
import FloatingNotification from "@/components/ui/FloatingNotification"

export default function CatalogPage() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />

      <CatalogHero />

      <CatalogSection />

      <CartDrawer />
      <CartButton />
      <FloatingNotification />

      <Footer />
    </main>
  )
}
