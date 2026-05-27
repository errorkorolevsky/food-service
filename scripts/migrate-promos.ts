/**
 * Creates promo_codes table and seeds starter codes.
 */

import { createClient } from "@supabase/supabase-js"

const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !svcKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const client = createClient(url, svcKey, { auth: { persistSession: false } })

async function main() {
  // Create table if it doesn't exist
  const { error: ddlError } = await client.rpc("exec_sql" as never, {
    sql: `
      CREATE TABLE IF NOT EXISTS promo_codes (
        code           text PRIMARY KEY,
        discount_type  text        NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
        discount_value integer     NOT NULL CHECK (discount_value > 0),
        min_order      integer     NOT NULL DEFAULT 0,
        max_uses       integer,
        uses           integer     NOT NULL DEFAULT 0,
        expires_at     timestamptz,
        is_active      boolean     NOT NULL DEFAULT true,
        created_at     timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE IF EXISTS promo_codes ENABLE ROW LEVEL SECURITY;
    `
  } as never)

  if (ddlError) {
    console.log("DDL via RPC not available, trying direct insert...")
  } else {
    console.log("Table created/verified.")
  }

  // Insert starter promo codes
  const promos = [
    { code: "WELCOME10", discount_type: "percent", discount_value: 10,  min_order: 0,    max_uses: null, expires_at: null, is_active: true, uses: 0 },
    { code: "FOOD20",    discount_type: "percent", discount_value: 20,  min_order: 5000, max_uses: null, expires_at: null, is_active: true, uses: 0 },
    { code: "FREESHIP",  discount_type: "fixed",   discount_value: 990, min_order: 2000, max_uses: null, expires_at: null, is_active: true, uses: 0 },
    { code: "SUMMER15",  discount_type: "percent", discount_value: 15,  min_order: 3000, max_uses: null, expires_at: null, is_active: true, uses: 0 },
    { code: "VIP500",    discount_type: "fixed",   discount_value: 500, min_order: 4000, max_uses: null, expires_at: null, is_active: true, uses: 0 },
  ]

  const { error } = await client
    .from("promo_codes")
    .upsert(promos, { onConflict: "code" })

  if (error) { console.error("Upsert error:", error.message); process.exit(1) }
  console.log(`Done. Upserted ${promos.length} promo codes.`)
  promos.forEach((p) => {
    const disc = p.discount_type === "percent" ? `${p.discount_value}%` : `₸${p.discount_value}`
    const min  = p.min_order ? ` (min ₸${p.min_order})` : ""
    console.log(`  ${p.code} — ${disc} off${min}`)
  })
}

main()
