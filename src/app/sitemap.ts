import type { MetadataRoute } from "next"
import { products } from "@/data/products"

const BASE = "https://food-service.kz"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/catalog`, lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/ai`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url:             `${BASE}/product/${p.id}`,
    lastModified:    now,
    changeFrequency: "weekly",
    priority:        0.7,
  }))

  return [...staticRoutes, ...productRoutes]
}
