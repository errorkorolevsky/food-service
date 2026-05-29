/**
 * Updates products.ts to add image: "/products/<id>.webp" for all products
 * that have a downloaded image in the manifest (and file on disk).
 *
 * Usage:
 *   npx tsx scripts/update-product-images.ts --dry-run  # show changes only
 *   npx tsx scripts/update-product-images.ts             # apply changes
 */

import * as fs   from "fs"
import * as path from "path"

const SOURCES_FILE   = path.join(process.cwd(), "docs", "catalog-audit", "image-sources.json")
const PRODUCTS_FILE  = path.join(process.cwd(), "src", "data", "products.ts")
const PRODUCTS_DIR   = path.join(process.cwd(), "public", "products")

function onDisk(id: string): boolean {
  return fs.existsSync(path.join(PRODUCTS_DIR, `${id}.webp`))
}

function main() {
  const args   = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")

  const manifest: Record<string, { local_path?: string | null }> =
    JSON.parse(fs.readFileSync(SOURCES_FILE, "utf-8"))

  // Build set of IDs that have both a manifest entry with local_path AND the file on disk
  const readyIds = new Set(
    Object.entries(manifest)
      .filter(([id, e]) => e.local_path && onDisk(id))
      .map(([id]) => id)
  )

  let src = fs.readFileSync(PRODUCTS_FILE, "utf-8")
  let changed = 0
  let removed = 0
  let alreadyHave = 0
  let notReady = 0

  // ── Pass 0: remove image fields for files no longer on disk ──────────────────
  // Handles the case where audit deleted a file that products.ts still references.
  const stalePattern = /image:\s*"\/products\/([^"]+)\.webp",\s*/g
  src = src.replace(stalePattern, (match, id) => {
    if (!onDisk(id)) {
      removed++
      if (dryRun) console.log(`  - ${id} → removed stale image field (file deleted by audit)`)
      return ""
    }
    return match
  })

  // ── Pass 1: add image fields for products with valid disk files ───────────────
  // Pattern: `id: "<id>", emoji:` → `id: "<id>", image: "/products/<id>.webp", emoji:`
  // Also handle: `id: "<id>",\n` followed by no image (multiline)

  for (const id of readyIds) {
    // Check if already has image field
    const hasImage = src.includes(`id: "${id}", image:`)
    if (hasImage) {
      alreadyHave++
      continue
    }

    // Try to insert image field — two patterns:
    // 1. Same-line emoji:  id: "X", emoji: "..."
    const pattern1 = `id: "${id}", emoji:`
    // 2. id on its own line followed by category/title
    const pattern2 = `id: "${id}",`

    if (src.includes(pattern1)) {
      src = src.replace(pattern1, `id: "${id}", image: "/products/${id}.webp", emoji:`)
      changed++
      if (dryRun) console.log(`  + ${id} → added image field (same-line emoji)`)
    } else if (src.includes(pattern2)) {
      // Only replace the first occurrence (correct id)
      const idx = src.indexOf(pattern2)
      if (idx !== -1) {
        // Check that next non-whitespace after the comma is NOT "image:" (avoid double-add)
        const after = src.slice(idx + pattern2.length, idx + pattern2.length + 60)
        if (!after.includes("image:")) {
          src = src.slice(0, idx + pattern2.length) +
                ` image: "/products/${id}.webp",` +
                src.slice(idx + pattern2.length)
          changed++
          if (dryRun) console.log(`  + ${id} → added image field (after id comma)`)
        }
      }
    } else {
      notReady++
    }
  }

  console.log(`\n  Product Image Updater`)
  console.log(`  ${"─".repeat(40)}`)
  console.log(`  Ready images in manifest: ${readyIds.size}`)
  console.log(`  Stale refs removed:       ${removed}`)
  console.log(`  Already in products.ts:   ${alreadyHave}`)
  console.log(`  Added image field:        ${changed}`)
  console.log(`  ID not found in file:     ${notReady}`)
  console.log()

  if (dryRun) {
    console.log("  [DRY RUN — no changes written]\n")
    return
  }

  if (changed > 0 || removed > 0) {
    fs.writeFileSync(PRODUCTS_FILE, src, "utf-8")
    console.log(`  ✓ products.ts updated (+${changed} added, -${removed} removed)\n`)
    console.log("  Next steps:")
    console.log("    npx tsx scripts/seed-products.ts   ← reseed Supabase")
    console.log("    npm run dev                         ← verify in browser\n")
  } else {
    console.log("  No changes needed.\n")
  }
}

main()
