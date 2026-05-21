// ─── PLURALIZATION ───────────────────────────────────────────────────────────

export function plural(n: number, forms: [string, string, string]): string {
  const m10  = n % 10
  const m100 = n % 100
  if (m100 >= 11 && m100 <= 14) return forms[2]
  if (m10 === 1)                 return forms[0]
  if (m10 >= 2 && m10 <= 4)     return forms[1]
  return forms[2]
}

// ─── PRICE ───────────────────────────────────────────────────────────────────

export function formatPrice(n: number): string {
  return `₸${n.toLocaleString("ru-KZ")}`
}

export function parsePrice(price: string): number {
  return Number(price.replace(/[^\d]/g, ""))
}
