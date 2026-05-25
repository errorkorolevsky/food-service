import type { MetadataRoute } from "next"
import { getAllProductIds } from "@/lib/db/products"
import { BASE_URL } from "@/lib/seo"

function withAlternates(url: string) {
  return {
    url,
    alternates: {
      languages: {
        "ru-RU": url,
        "kk-KZ": url,
      },
    },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { ...withAlternates(BASE_URL),              lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { ...withAlternates(`${BASE_URL}/catalog`), lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { ...withAlternates(`${BASE_URL}/ai`),      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ]

  const ids = await getAllProductIds()

  const productRoutes: MetadataRoute.Sitemap = ids.map((id) => ({
    ...withAlternates(`${BASE_URL}/product/${id}`),
    lastModified:    now,
    changeFrequency: "weekly",
    priority:        0.7,
  }))

  return [...staticRoutes, ...productRoutes]
}
