import { notFound } from "next/navigation"
import { getProductById, getRelatedProducts } from "@/lib/db/products"
import { buildProductJsonLd } from "@/lib/seo"
import ProductClient from "./ProductClient"

type Props = { params: Promise<{ id: string }> }

export const revalidate = 3600

export default async function ProductPage({ params }: Props) {
  const { id }  = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const related = await getRelatedProducts(product.category, id, 4)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductJsonLd(product)) }}
      />
      <ProductClient product={product} related={related} />
    </>
  )
}
