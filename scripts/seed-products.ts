/**
 * Seed script: inserts/updates all products from src/data/products.ts into Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed-products.ts
 *
 * Required env vars (add to .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← Dashboard → Settings → API → service_role key
 */

import { createClient } from "@supabase/supabase-js"
import { products } from "../src/data/products"
import { readFileSync } from "fs"
import { join } from "path"

// Load .env.local manually (tsx doesn't auto-load it)
try {
  const envFile = readFileSync(join(process.cwd(), ".env.local"), "utf-8")
  for (const line of envFile.split("\n")) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const eq = t.indexOf("=")
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
    if (!process.env[k]) process.env[k] = v
  }
} catch {}

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !svcKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
  process.exit(1)
}

const client = createClient(url, svcKey, {
  auth: { persistSession: false },
})

const rows = products.map((p) => ({
  id:               p.id,
  emoji:            p.emoji,
  image:            p.image ?? null,
  image_status:     p.imageStatus ?? null,
  category:         p.category,
  title:            p.title,
  description:      p.description,
  price:            p.price,
  price_num:        p.priceNum,
  old_price_num:    p.oldPriceNum     ?? null,
  discount_percent: p.discountPercent ?? null,
  unit:             p.unit            ?? null,
  rating:           p.rating,
  in_stock:         p.inStock,
  is_popular:       p.isPopular       ?? false,
  is_new:           p.isNew           ?? false,
  is_hit:           p.isHit           ?? false,
  tags:             p.tags            ?? [],
}))

async function seed() {
  console.log(`Seeding ${rows.length} products…`)

  const { error, count } = await client
    .from("products")
    .upsert(rows, { onConflict: "id", count: "exact" })

  if (error) {
    console.error("Seed failed:", error.message)
    process.exit(1)
  }

  console.log(`Done. Upserted ${count ?? rows.length} products.`)
}

seed()
