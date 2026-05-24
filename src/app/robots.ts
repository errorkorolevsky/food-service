import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/order/success"],
      },
    ],
    sitemap: "https://food-service.kz/sitemap.xml",
  }
}
