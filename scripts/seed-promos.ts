/**
 * Seed script: inserts starter promo codes into Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed-promos.ts
 */

import { createClient } from "@supabase/supabase-js"

const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !svcKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const client = createClient(url, svcKey, { auth: { persistSession: false } })

const promos = [
  { code: "WELCOME10",  discount_type: "percent", discount_value: 10,   min_order: 0,    max_uses: null, expires_at: null },
  { code: "FOOD20",     discount_type: "percent", discount_value: 20,   min_order: 5000, max_uses: null, expires_at: null },
  { code: "FREESHIP",   discount_type: "fixed",   discount_value: 990,  min_order: 2000, max_uses: null, expires_at: null },
  { code: "SUMMER15",   discount_type: "percent", discount_value: 15,   min_order: 3000, max_uses: null, expires_at: null },
  { code: "VIP500",     discount_type: "fixed",   discount_value: 500,  min_order: 4000, max_uses: null, expires_at: null },
]

async function main() {
  const rows = promos.map((p) => ({ ...p, is_active: true, uses: 0 }))

  const { error } = await client
    .from("promo_codes")
    .upsert(rows, { onConflict: "code" })

  if (error) { console.error("Error:", error.message); process.exit(1) }
  console.log(`Done. Upserted ${rows.length} promo codes.`)
  promos.forEach((p) => console.log(`  ${p.code} — ${p.discount_type === "percent" ? p.discount_value + "%" : "₸" + p.discount_value} off${p.min_order ? " (min ₸" + p.min_order + ")" : ""}`))
}

main()
