import type { Category } from "@/types"

export const categories: Category[] = [
  { id: "discounts",  emoji: "🔥", title: "Скидки",              description: "Акции, спеццены и товары недели." },
  { id: "meat",       emoji: "🍗", title: "Мясо и птица",        description: "Курица, говядина, свинина, колбасы и гастрономия." },
  { id: "seafood",    emoji: "🐟", title: "Рыба и морепродукты", description: "Лосось, тунец, креветки, икра и морепродукты." },
  { id: "dairy",      emoji: "🥛", title: "Молочные продукты",   description: "Молоко, кефир, йогурт, сметана, масло, сыр." },
  { id: "vegetables", emoji: "🥦", title: "Овощи и фрукты",      description: "Свежие овощи, фрукты, зелень и грибы." },
  { id: "bakery",     emoji: "🍞", title: "Выпечка и хлеб",      description: "Хлеб, булочки, круассаны, самса, пирожные." },
  { id: "drinks",     emoji: "🧃", title: "Напитки",              description: "Соки, воды, газировка, холодный чай, компоты." },
  { id: "coffee",     emoji: "☕", title: "Кофе, чай, какао",    description: "Зерновой кофе, сиропы, матча, barista milk." },
  { id: "confectionery", emoji: "🍫", title: "Кондитерские",     description: "Шоколад, конфеты, печенье, торты, десерты." },
  { id: "grocery",    emoji: "🌾", title: "Бакалея",              description: "Рис, макароны, мука, сахар, крупы, консервы." },
  { id: "frozen",     emoji: "❄️", title: "Заморозка",            description: "Пельмени, вареники, картофель фри, полуфабрикаты." },
  { id: "sauces",     emoji: "🫙", title: "Соусы и специи",       description: "Соевый соус, кетчуп, маринады, оливковое масло." },
  { id: "snacks",     emoji: "🍿", title: "Снеки",                description: "Чипсы, сухарики, орехи, попкорн, батончики." },
  { id: "readyfood",  emoji: "🍱", title: "Готовая еда",          description: "Суши, пицца, роллы, бургеры, блины, комбо-наборы." },
  { id: "sushi",      emoji: "🍣", title: "Суши ингредиенты",     description: "Рис, нори, крем-сыр, соусы и всё для sushi kitchen." },
  { id: "pizza",      emoji: "🍕", title: "Пицца и итальянское",  description: "Моцарелла, пепперони, соусы, тесто." },
  { id: "packaging",  emoji: "📦", title: "Упаковка и HoReCa",    description: "Контейнеры, пицца-боксы, стаканы, расходники." },
  { id: "sets",       emoji: "🎁", title: "Наборы",               description: "Семейный, суши, кофейный, завтрак, кондитерский." },
  { id: "new",        emoji: "✨", title: "Новинки",              description: "Свежие поступления этой недели." },
  { id: "top",        emoji: "⭐", title: "Топ продаж",           description: "Самые популярные товары у покупателей." },
]

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}

export const CATEGORY_FILTER: Record<string, string> = {
  discounts:     "",
  meat:          "Птица и мясо",
  seafood:       "Рыба и морепродукты",
  dairy:         "Молочные продукты",
  vegetables:    "Овощи и фрукты",
  bakery:        "Выпечка и снеки",
  drinks:        "Напитки",
  coffee:        "Кофе и бар",
  confectionery: "Кондитерское",
  grocery:       "Бакалея",
  frozen:        "Заморозка",
  sauces:        "Соусы и специи",
  snacks:        "Снеки",
  readyfood:     "Готовая еда",
  sushi:         "Суши ингредиенты",
  pizza:         "Пицца и итальянское",
  packaging:     "Упаковка HoReCa",
  sets:          "Наборы",
  new:           "",
  top:           "",
}

export const CATEGORY_COLORS: Record<string, string> = {
  discounts:     "#EF4444",
  meat:          "#DC2626",
  seafood:       "#0369A1",
  dairy:         "#0891B2",
  vegetables:    "#16A34A",
  bakery:        "#D97706",
  drinks:        "#7C3AED",
  coffee:        "#92400E",
  confectionery: "#EC4899",
  grocery:       "#CA8A04",
  frozen:        "#0284C7",
  sauces:        "#EA580C",
  snacks:        "#B45309",
  readyfood:     "#059669",
  sushi:         "#DC2626",
  pizza:         "#EA580C",
  packaging:     "#005B46",
  sets:          "#6D28D9",
  new:           "#0D9E76",
  top:           "#F59E0B",
}

// Maps Russian display name (as stored in Product.category) → accent color
export const CATEGORY_COLORS_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_FILTER)
    .filter(([, name]) => name)
    .map(([id, name]) => [name, CATEGORY_COLORS[id] ?? "#005B46"])
)
