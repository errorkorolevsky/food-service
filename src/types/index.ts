// ─── PRODUCT ────────────────────────────────────────────────────────────────

export type ProductCategory =
  | "Рыба и морепродукты"
  | "Суши ингредиенты"
  | "Пицца и итальянское"
  | "Кондитерское"
  | "Кофе и бар"
  | "Сыры и молочное"
  | "Птица и мясо"
  | "Заморозка"
  | "Соусы и специи"
  | "Бакалея"
  | "Овощи и фрукты"
  | "Напитки"
  | "Готовая еда"
  | "Выпечка и снеки"
  | "Упаковка HoReCa"
  | "Наборы"
  | "Молочные продукты"
  | "Снеки"
  | "Топ продаж"
  | "Новинки"

export type Product = {
  id:               string
  emoji:            string
  image?:           string
  category:         ProductCategory
  title:            string
  description:      string
  /** Строка вида "₸1490" — для отображения */
  price:            string
  /** Числовая цена для корзины */
  priceNum:         number
  /** Старая цена до скидки (числовая) */
  oldPriceNum?:     number
  /** Процент скидки, напр. 20 */
  discountPercent?: number
  /** Единица измерения: "кг", "шт", "л", "500г" и т.д. */
  unit?:            string
  rating:           string
  inStock:          boolean
  isPopular?:       boolean
  isNew?:           boolean
  isHit?:           boolean
  tags?:            string[]
}

// ─── CATEGORY ───────────────────────────────────────────────────────────────

export type Category = {
  id:          string
  emoji:       string
  title:       string
  description: string
}

// ─── CART ────────────────────────────────────────────────────────────────────

export type CartItem = {
  id:       string
  title:    string
  price:    number
  emoji:    string
  image?:   string
  quantity: number
}

// ─── ORDER ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "processing"
  | "in_delivery"
  | "delivered"
  | "cancelled"

export type Order = {
  id:        string
  items:     CartItem[]
  total:     number
  status:    OrderStatus
  createdAt: string
  address:   string
  payment:   "kaspi" | "freedom" | "cash"
}

// ─── USER ────────────────────────────────────────────────────────────────────

export type UserRole = "client" | "admin" | "supplier" | "courier"

export type User = {
  id:       string
  name:     string
  email:    string
  phone?:   string
  role:     UserRole
  company?: string
}
