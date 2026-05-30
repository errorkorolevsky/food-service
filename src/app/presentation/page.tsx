import type { Metadata } from "next"

import { products } from "@/data/products"
import Presentation from "@/components/presentation/Presentation"
import type { PresProduct } from "@/components/presentation/types"

export const metadata: Metadata = {
  title: "Food Service Kazakhstan — Презентация продукта",
  description:
    "Интерактивная премиальная презентация Food Service Kazakhstan — современной mobile-first платформы доставки продуктов в Шымкенте.",
  robots: { index: false, follow: false },
}

/** Curated, visually diverse products with verified images for the showcase. */
const FEATURED_IDS = [
  "strawberry",
  "salmon-fillet",
  "croissant",
  "milk-32",
  "avocado",
  "cola",
  "bananas",
  "orange-juice",
]

function pick(): PresProduct[] {
  const byId = new Map(products.map((p) => [p.id, p]))
  const chosen = FEATURED_IDS.map((id) => byId.get(id)).filter(
    (p): p is (typeof products)[number] => Boolean(p)
  )
  // Fallback: if curated ids are missing, fill from products that have images.
  const list = chosen.length >= 4 ? chosen : products.filter((p) => p.image).slice(0, 8)
  return list.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    priceNum: p.priceNum,
    oldPriceNum: p.oldPriceNum,
    discountPercent: p.discountPercent,
    image: p.image,
    emoji: p.emoji,
    category: p.category,
    rating: p.rating,
    unit: p.unit,
    description: p.description,
  }))
}

export default function PresentationPage() {
  const list = pick()
  return <Presentation products={list} featured={list[0]} />
}
