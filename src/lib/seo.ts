export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

export const LANG_ALTERNATES = {
  canonical: BASE_URL,
  languages: {
    "ru-RU": BASE_URL,
    "kk-KZ": BASE_URL,
  },
}

export function buildAlternates(path = "") {
  const url = `${BASE_URL}${path}`
  return {
    canonical: url,
    languages: {
      "ru-RU": url,
      "kk-KZ": url,
    },
  }
}

export const META_RU = {
  home: {
    title:       "Food Service — Продукты с доставкой на дом · Шымкент",
    description: "Онлайн-магазин продуктов и готовой еды с доставкой на дом в Шымкенте. Свежие продукты, мясо, молочное, напитки, заморозка и многое другое.",
  },
  catalog: {
    title:       "Каталог — Food Service Шымкент",
    description: "Более 200 позиций: мясо, рыба, молочные, напитки, заморозка и многое другое с доставкой по Шымкенту.",
  },
  ai: {
    title:       "AI Ассистент — Food Service",
    description: "AI-powered помощник по закупкам для HoReCa. Умные рекомендации по ценам и ассортименту для ресторанов и кофеен Шымкента.",
  },
}

export function buildProductJsonLd(product: {
  id: string
  title: string
  description: string
  image?: string
  priceNum: number
  rating: string
  category: string
  inStock: boolean
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.image
      ? product.image.startsWith("http") ? product.image : `${BASE_URL}${product.image}`
      : undefined,
    sku: product.id,
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.priceNum,
      priceCurrency: "KZT",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Food Service" },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      bestRating: "5",
      worstRating: "1",
      ratingCount: "1",
    },
  }
}

export const META_KZ = {
  home: {
    title:       "Food Service — Тауарлар үйге жеткізу · Шымкент",
    description: "Шымкентте үйге жеткізумен онлайн-азық-түлік дүкені. Таза өнімдер, ет, сүт өнімдері, сусындар, мұздатылған тағамдар.",
  },
  catalog: {
    title:       "Каталог — Food Service Шымкент",
    description: "200-ден астам позиция: ет, балық, сүт өнімдері, сусындар, мұздатылған тағамдар Шымкентте жеткізумен.",
  },
  ai: {
    title:       "AI Көмекші — Food Service",
    description: "HoReCa үшін AI-сатып алу көмекшісі. Шымкент мейрамханалары мен кофеханаларына ақылды ұсыныстар.",
  },
}
