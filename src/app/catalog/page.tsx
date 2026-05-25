import type { Metadata } from "next"
import { META_RU, BASE_URL, buildAlternates } from "@/lib/seo"
import { getAllProducts } from "@/lib/db/products"

export const metadata: Metadata = {
  title:       META_RU.catalog.title,
  description: META_RU.catalog.description,
  alternates:  buildAlternates("/catalog"),
  openGraph: {
    title:       "Каталог Food Service — доставка продуктов в Шымкенте",
    description: "Свежие продукты, готовая еда и товары для дома с доставкой 15–30 мин по Шымкенту.",
    url:         `${BASE_URL}/catalog`,
    locale:      "ru_RU",
    alternateLocale: ["kk_KZ"],
  },
}

import Navbar from "@/components/layout/Navbar"
import CartButton from "@/components/layout/CartButton"
import CartDrawer from "@/components/layout/CartDrawer"
import Footer from "@/components/layout/Footer"
import CatalogSection from "@/components/sections/CatalogSection"
import CatalogHero from "@/components/sections/CatalogHero"
import FloatingNotification from "@/components/ui/FloatingNotification"

export default async function CatalogPage() {
  const products = await getAllProducts()

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />

      <CatalogHero />

      <CatalogSection products={products} />

      <CartDrawer />
      <CartButton />
      <FloatingNotification />

      <Footer />
    </main>
  )
}
