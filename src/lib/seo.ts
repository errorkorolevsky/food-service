export const BASE_URL = "https://food-service.kz"

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
