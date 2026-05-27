import type { Category } from "@/types"

export const categories: Category[] = [
  { id: "discounts",     emoji: "🔥", title: "Скидки",               description: "Акции, спеццены и товары недели." },
  { id: "meat",          emoji: "🍗", title: "Мясо и птица",          description: "Курица, говядина, свинина, баранина, колбасы и деликатесы." },
  { id: "seafood",       emoji: "🐟", title: "Рыба и морепродукты",   description: "Лосось, форель, тунец, креветки, икра и морепродукты." },
  { id: "dairy",         emoji: "🥛", title: "Молочные продукты",     description: "Молоко, кефир, йогурт, сметана, масло, сыры." },
  { id: "eggs",          emoji: "🥚", title: "Яйца",                  description: "Куриные, перепелиные, фермерские яйца." },
  { id: "vegetables",    emoji: "🥦", title: "Овощи и фрукты",        description: "Свежие овощи, фрукты, зелень и грибы." },
  { id: "bakery",        emoji: "🍞", title: "Хлеб и выпечка",        description: "Хлеб, батоны, круассаны, самса, торты, пирожные." },
  { id: "drinks",        emoji: "🧃", title: "Напитки",               description: "Вода, соки, газировка, энергетики, компоты." },
  { id: "coffee",        emoji: "☕", title: "Кофе, чай и какао",     description: "Зерновой кофе, чай, матча, какао, горячий шоколад." },
  { id: "confectionery", emoji: "🍫", title: "Кондитерские изделия",  description: "Шоколад, конфеты, печенье, зефир, вафли, халва." },
  { id: "snacks",        emoji: "🍿", title: "Снеки",                 description: "Чипсы, сухарики, орехи, батончики, сухофрукты." },
  { id: "grocery",       emoji: "🌾", title: "Бакалея",               description: "Крупы, макароны, мука, консервы, варенье, мёд." },
  { id: "frozen",        emoji: "❄️", title: "Заморозка",             description: "Пельмени, вареники, полуфабрикаты, мороженое." },
  { id: "sauces",        emoji: "🫙", title: "Соусы и специи",        description: "Кетчуп, майонез, горчица, соевый соус, приправы." },
  { id: "oils",          emoji: "🫒", title: "Масло и жиры",          description: "Подсолнечное, оливковое, кокосовое масло, маргарин." },
  { id: "readyfood",     emoji: "🍱", title: "Готовая еда",           description: "Суши, пицца, шаурма, плов, салаты и горячие блюда." },
  { id: "baby",          emoji: "🍼", title: "Детское питание",       description: "Пюре, каши, смеси, йогурты и соки для детей." },
  { id: "healthy",       emoji: "🥗", title: "Здоровое питание",      description: "Протеин, гранола, суперфуды, растительное молоко." },
  { id: "packaging",     emoji: "📦", title: "Упаковка HoReCa",       description: "Контейнеры, стаканы, пакеты, фольга, расходники." },
  { id: "sets",          emoji: "🎁", title: "Наборы",                description: "Семейный, завтрак, барбекю, кофейный, детский." },
  { id: "new",           emoji: "✨", title: "Новинки",               description: "Свежие поступления этой недели." },
  { id: "top",           emoji: "⭐", title: "Топ продаж",            description: "Самые популярные товары у покупателей." },
]

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}

export const CATEGORY_FILTER: Record<string, string> = {
  discounts:     "",
  meat:          "Мясо и птица",
  seafood:       "Рыба и морепродукты",
  dairy:         "Молочные продукты",
  eggs:          "Яйца",
  vegetables:    "Овощи и фрукты",
  bakery:        "Хлеб и выпечка",
  drinks:        "Напитки",
  coffee:        "Кофе, чай и какао",
  confectionery: "Кондитерские изделия",
  snacks:        "Снеки",
  grocery:       "Бакалея",
  frozen:        "Заморозка",
  sauces:        "Соусы и специи",
  oils:          "Масло и жиры",
  readyfood:     "Готовая еда",
  baby:          "Детское питание",
  healthy:       "Здоровое питание",
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
  eggs:          "#D97706",
  vegetables:    "#16A34A",
  bakery:        "#CA8A04",
  drinks:        "#7C3AED",
  coffee:        "#92400E",
  confectionery: "#EC4899",
  snacks:        "#B45309",
  grocery:       "#CA8A04",
  frozen:        "#0284C7",
  sauces:        "#EA580C",
  oils:          "#15803D",
  readyfood:     "#059669",
  baby:          "#DB2777",
  healthy:       "#0D9E76",
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

// Maps Russian display name → { emoji, description }
export const CATEGORY_INFO_BY_NAME: Record<string, { emoji: string; description: string }> = Object.fromEntries(
  categories
    .filter((c) => CATEGORY_FILTER[c.id])
    .map((c) => [CATEGORY_FILTER[c.id], { emoji: c.emoji, description: c.description }])
)
