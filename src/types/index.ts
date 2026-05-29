// ─── PRODUCT ────────────────────────────────────────────────────────────────

export type ProductCategory =
  | "Мясо и птица"
  | "Рыба и морепродукты"
  | "Молочные продукты"
  | "Яйца"
  | "Овощи и фрукты"
  | "Хлеб и выпечка"
  | "Напитки"
  | "Кофе, чай и какао"
  | "Кондитерские изделия"
  | "Снеки"
  | "Бакалея"
  | "Заморозка"
  | "Соусы и специи"
  | "Масло и жиры"
  | "Готовая еда"
  | "Детское питание"
  | "Здоровое питание"
  | "Упаковка HoReCa"
  | "Наборы"

/** Verification state for product images */
export type ImageStatus =
  | "verified_exact"     // exact brand+product match — safe for production
  | "verified_generic"   // correct generic product, no brand conflict — safe for production
  | "needs_review"       // possible match, uncertain — show placeholder
  | "rejected"           // confirmed mismatch removed — show placeholder
  | "missing"            // no usable image found — show placeholder
  // legacy values kept for Supabase rows written before this audit
  | "real_verified"
  | "matched_unverified"
  | "placeholder"

export type Product = {
  id:               string
  emoji:            string
  image?:           string
  imageStatus?:     ImageStatus
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
  id:        string
  title:     string
  price:     number
  oldPrice?: number
  emoji:     string
  image?:    string
  quantity:  number
  note?:     string
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
