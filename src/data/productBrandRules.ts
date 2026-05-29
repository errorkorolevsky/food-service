/**
 * Brand dictionary for semantic image validation.
 *
 * Each entry defines what keywords identify the brand in an image source name,
 * and what keywords are forbidden (cross-brand substitutions that must never happen).
 *
 * Used by scripts/validate-product-images.ts and referenced in the audit report.
 */

export type BrandRule = {
  /** Keywords that confirm the image belongs to this brand (case-insensitive) */
  allowed: string[]
  /** Keywords that indicate a forbidden cross-brand substitution */
  forbidden: string[]
}

export const BRAND_RULES: Record<string, BrandRule> = {
  // ─── BEVERAGES ──────────────────────────────────────────────────────────────
  "Coca-Cola": {
    allowed:  ["coca-cola", "coca cola", "coke", "кока-кола"],
    forbidden: ["pepsi", "sprite", "fanta", "7up", "mountain dew"],
  },
  "Pepsi": {
    allowed:  ["pepsi", "пепси"],
    forbidden: ["coca-cola", "coke", "sprite", "fanta", "7up"],
  },
  "Sprite": {
    allowed:  ["sprite", "спрайт"],
    forbidden: ["fanta", "coca-cola", "pepsi", "7up"],
  },
  "Fanta": {
    allowed:  ["fanta", "фанта"],
    forbidden: ["sprite", "coca-cola", "pepsi"],
  },
  "Red Bull": {
    allowed:  ["red bull", "redbull", "ред булл"],
    forbidden: ["monster", "gorilla", "burn", "adrenaline rush"],
  },
  "Monster": {
    allowed:  ["monster energy", "monster"],
    forbidden: ["red bull", "gorilla", "burn"],
  },
  "Evian": {
    allowed:  ["evian"],
    forbidden: ["bonaqua", "asu", "samal", "borjomi", "voss"],
  },

  // ─── COFFEE & TEA ───────────────────────────────────────────────────────────
  "Nescafe": {
    allowed:  ["nescafe", "nescafé", "несκafe", "нескафе"],
    forbidden: ["jacobs", "lavazza", "tchibo", "maxwell"],
  },
  "Jacobs": {
    allowed:  ["jacobs", "якобс"],
    forbidden: ["nescafe", "lavazza", "tchibo", "maxwell"],
  },
  "Lavazza": {
    allowed:  ["lavazza", "лавацца"],
    forbidden: ["jacobs", "nescafe", "tchibo", "illy"],
  },
  "Akbar": {
    allowed:  ["akbar", "акбар"],
    forbidden: ["greenfield", "tess", "lipton", "ahmad", "bayce"],
  },
  "Greenfield": {
    allowed:  ["greenfield", "гринфилд"],
    forbidden: ["tess", "akbar", "lipton", "ahmad"],
  },
  "Tess": {
    allowed:  ["tess", "тесс"],
    forbidden: ["greenfield", "akbar", "lipton"],
  },

  // ─── CONFECTIONERY ──────────────────────────────────────────────────────────
  "Nutella": {
    allowed:  ["nutella", "нутелла"],
    forbidden: ["milka", "alpen gold", "шоколадная паста", "hazelnut spread"],
  },
  "Milka": {
    allowed:  ["milka", "милка"],
    forbidden: ["alpen gold", "ritter sport", "nestle"],
  },
  "Oreo": {
    allowed:  ["oreo", "орео"],
    forbidden: ["jubilee", "бонdi", "bahlsen"],
  },
  "KitKat": {
    allowed:  ["kitkat", "kit kat", "киткат"],
    forbidden: ["twix", "snickers", "bounty", "mars"],
  },
  "Snickers": {
    allowed:  ["snickers", "сникерс"],
    forbidden: ["mars", "bounty", "twix", "kitkat"],
  },
  "Mars": {
    allowed:  ["mars bar", "марс"],
    forbidden: ["snickers", "bounty", "twix"],
  },
  "Bounty": {
    allowed:  ["bounty", "баунти"],
    forbidden: ["snickers", "mars", "twix", "kitkat"],
  },
  "Raffaello": {
    allowed:  ["raffaello", "рафаэлло"],
    forbidden: ["ferrero rocher", "after eight"],
  },
  "Ferrero Rocher": {
    allowed:  ["ferrero rocher", "ферреро"],
    forbidden: ["raffaello", "nutella"],
  },
  "Chupa Chups": {
    allowed:  ["chupa chups", "чупа чупс"],
    forbidden: [],
  },
  "Haribo": {
    allowed:  ["haribo", "харибо"],
    forbidden: [],
  },
  "Pringles": {
    allowed:  ["pringles", "принглс"],
    forbidden: ["lays", "doritos", "cheetos"],
  },
  "Lay's": {
    allowed:  ["lays", "lay's", "лейс"],
    forbidden: ["pringles", "doritos"],
  },

  // ─── DAIRY & CHEESES ────────────────────────────────────────────────────────
  "Philadelphia": {
    allowed:  ["philadelphia", "филадельфия"],
    forbidden: ["president", "almette", "hochland", "vsyo v dom", "всё в дом"],
  },
  "President": {
    allowed:  ["president", "président", "президент"],
    forbidden: ["philadelphia", "hochland", "prostokvashino", "простоквашино"],
  },
  "Activia": {
    allowed:  ["activia", "активиа", "активия"],
    forbidden: ["danone plain", "campina", "ehrmann"],
  },
  "Prostokvashino": {
    allowed:  ["prostokvashino", "простоквашино"],
    forbidden: ["president", "danone"],
  },

  // ─── BABY FOOD ──────────────────────────────────────────────────────────────
  "Gerber": {
    allowed:  ["gerber", "гербер", "graduates"],
    forbidden: ["frutonya", "фрутоняня", "agusha", "агуша", "heinz"],
  },
  "Agusha": {
    allowed:  ["agusha", "агуша"],
    forbidden: ["gerber", "frutonya", "heinz"],
  },
  "FrutoNyanya": {
    allowed:  ["frutonya", "фрутоняня", "фруто няня"],
    forbidden: ["gerber", "agusha"],
  },

  // ─── PASTA ──────────────────────────────────────────────────────────────────
  "Barilla": {
    allowed:  ["barilla", "барилла"],
    forbidden: ["makfa", "макфа", "sultan", "султан", "pasta zara"],
  },

  // ─── CANNED GOODS ───────────────────────────────────────────────────────────
  "Bonduelle": {
    allowed:  ["bonduelle", "бондюэль"],
    forbidden: ["globus", "глобус", "green ray", "зелёный великан"],
  },

  // ─── CHIPS & SNACKS ─────────────────────────────────────────────────────────
  "Halva": {
    // generic product — forbidden substitution types
    allowed:  ["halva", "халва", "sunflower halva", "подсолнечная халва"],
    forbidden: ["spread", "паста", "alpen gold", "шоколад"],
  },
}

/**
 * Check if an image source name contains a forbidden substitution for a given brand.
 * Returns the forbidden keyword found, or null if no conflict.
 */
export function detectBrandConflict(
  brand: string,
  imageSourceName: string,
): string | null {
  const rule = BRAND_RULES[brand]
  if (!rule) return null
  const lower = imageSourceName.toLowerCase()
  for (const forbidden of rule.forbidden) {
    if (lower.includes(forbidden.toLowerCase())) return forbidden
  }
  return null
}

/**
 * Check if an image source name confirms the brand match.
 */
export function confirmsBrand(
  brand: string,
  imageSourceName: string,
): boolean {
  const rule = BRAND_RULES[brand]
  if (!rule) return false
  const lower = imageSourceName.toLowerCase()
  return rule.allowed.some((kw) => lower.includes(kw.toLowerCase()))
}
