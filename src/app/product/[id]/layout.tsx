import type { Metadata } from "next"
import { getProductById } from "@/lib/db/products"
import { buildAlternates } from "@/lib/seo"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return { title: "Товар не найден — Food Service" }
  }

  const title = `${product.title} — Food Service`
  const description = product.description
    ? `${product.description} — доставка по Шымкенту.`
    : `${product.title} с доставкой на дом в Шымкенте. Food Service.`

  return {
    title,
    description,
    alternates: buildAlternates(`/product/${id}`),
    openGraph: {
      title,
      description,
      url:    `https://food-service.kz/product/${id}`,
      locale: "ru_RU",
      alternateLocale: ["kk_KZ"],
      ...(product.image ? { images: [{ url: product.image, alt: product.title }] } : {}),
    },
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children
}
