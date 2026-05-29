/**
 * Prune orphan products from Supabase.
 *
 * An "orphan" is any row in the Supabase `products` table whose id is NOT
 * present in src/data/products.ts (the source of truth). These accumulate
 * from old catalog structures (e.g. the pre-retail HoReCa pivot).
 *
 * Safety:
 *   - Writes a full backup of every deleted row to
 *     docs/catalog-audit/orphan-backup.json before deleting.
 *   - Deletes strictly by explicit id list (never a broad filter).
 *
 * Usage:
 *   npx tsx scripts/prune-orphan-products.ts --dry     # report only
 *   npx tsx scripts/prune-orphan-products.ts           # backup + delete
 */

import { createClient } from "@supabase/supabase-js"
import { products as local } from "../src/data/products"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

const env = readFileSync(join(process.cwd(), ".env.local"), "utf-8")
const get = (k: string) =>
  (env.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "")

const DRY = process.argv.includes("--dry")
const BACKUP = join(process.cwd(), "docs", "catalog-audit", "orphan-backup.json")

async function main() {
  const client = createClient(
    get("NEXT_PUBLIC_SUPABASE_URL"),
    get("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  )

  const { data, error } = await client.from("products").select("*")
  if (error) { console.error("Fetch failed:", error.message); process.exit(1) }
  const rows = data ?? []

  const localIds = new Set(local.map((p) => p.id))
  const orphans  = rows.filter((r) => !localIds.has(r.id))

  console.log(`Supabase rows: ${rows.length}  |  local products.ts: ${local.length}  |  orphans: ${orphans.length}`)

  if (!orphans.length) { console.log("Nothing to prune."); return }

  // 1. Backup
  writeFileSync(BACKUP, JSON.stringify(orphans, null, 2), "utf-8")
  console.log(`Backup written: ${BACKUP} (${orphans.length} rows)`)

  if (DRY) { console.log("Dry run — no deletions performed."); return }

  // 2. Delete strictly by id list
  const ids = orphans.map((o) => o.id)
  const { error: delErr, count } = await client
    .from("products")
    .delete({ count: "exact" })
    .in("id", ids)

  if (delErr) { console.error("Delete failed:", delErr.message); process.exit(1) }
  console.log(`Deleted ${count ?? ids.length} orphan rows.`)

  // 3. Verify
  const { count: remaining } = await client
    .from("products")
    .select("*", { count: "exact", head: true })
  console.log(`\nRemaining Supabase rows: ${remaining}  |  expected: ${local.length}`)
  console.log(remaining === local.length ? "✓ Supabase == products.ts" : "✗ MISMATCH — investigate")
}

main()
