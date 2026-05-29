/**
 * Product Image Normalization
 *
 * Reprocesses all existing WebP files in public/products/ to produce
 * visually consistent frames:
 *
 *   1. Trim near-white borders from the source image
 *   2. Fit the product into a 480×480 square (80% of 600px)
 *   3. Extend with 60px white padding on all sides → 600×600 final
 *   4. Product occupies ~80% of the frame, centered
 *
 * Usage:
 *   npx tsx scripts/normalize-images.ts            # process all
 *   npx tsx scripts/normalize-images.ts --dry-run  # preview only
 *   npx tsx scripts/normalize-images.ts --id=lemon,garlic
 */

import sharp from "sharp"
import * as fs from "fs"
import * as path from "path"

const PRODUCTS_DIR  = path.join(process.cwd(), "public", "products")
const FINAL_SIZE    = 600
const PADDING_PX    = 60                          // 10% each side
const PRODUCT_SIZE  = FINAL_SIZE - PADDING_PX * 2 // 480px — product fill area
const WHITE         = { r: 255, g: 255, b: 255, alpha: 1 }
const TRIM_THRESHOLD = 25                          // 25/255 — trims near-white edges

async function normalizeOne(filePath: string): Promise<"ok" | "skip" | "err"> {
  try {
    const raw = fs.readFileSync(filePath)

    // 1. Get metadata to check current dimensions
    const meta = await sharp(raw).metadata()
    if (!meta.width || !meta.height) return "skip"

    // 2. Trim near-white borders
    let trimmed: Buffer
    try {
      trimmed = await sharp(raw)
        .flatten({ background: WHITE })             // flatten transparency → white
        .trim({ background: WHITE, threshold: TRIM_THRESHOLD })
        .toBuffer()
    } catch {
      // trim can fail if entire image is white; fall back to raw
      trimmed = raw
    }

    // 3. Check trimmed size — skip if result is tiny (over-trimmed)
    const trimMeta = await sharp(trimmed).metadata()
    if ((trimMeta.width ?? 0) < 60 || (trimMeta.height ?? 0) < 60) return "skip"

    // 4. Fit product into PRODUCT_SIZE square with white background, then extend
    const tmp = filePath + ".norm.tmp"
    await sharp(trimmed)
      .resize(PRODUCT_SIZE, PRODUCT_SIZE, {
        fit: "contain",
        background: WHITE,
        withoutEnlargement: false,
      })
      .extend({
        top:    PADDING_PX,
        bottom: PADDING_PX,
        left:   PADDING_PX,
        right:  PADDING_PX,
        background: WHITE,
      })
      .webp({ quality: 90 })
      .toFile(tmp)

    fs.renameSync(tmp, filePath)
    return "ok"
  } catch {
    return "err"
  }
}

async function main() {
  const args    = process.argv.slice(2)
  const dryRun  = args.includes("--dry-run")
  const idFlag  = args.find(a => a.startsWith("--id="))?.slice(5) ?? ""
  const idFilter = idFlag ? new Set(idFlag.split(",").map(s => s.trim())) : null

  const files = fs.readdirSync(PRODUCTS_DIR)
    .filter(f => f.endsWith(".webp") && !f.startsWith("_"))
    .filter(f => !idFilter || idFilter.has(f.replace(".webp", "")))
    .map(f => path.join(PRODUCTS_DIR, f))

  console.log(`\n  Image Normalizer`)
  console.log(`  Target:  ${PRODUCT_SIZE}px product in ${FINAL_SIZE}px frame (${Math.round(PRODUCT_SIZE/FINAL_SIZE*100)}% fill)`)
  console.log(`  Padding: ${PADDING_PX}px each side`)
  console.log(`  Files:   ${files.length}${dryRun ? "  [DRY RUN]" : ""}`)
  console.log(`  ${"─".repeat(50)}\n`)

  if (dryRun) {
    console.log("  Dry run: no changes written.\n")
    return
  }

  let ok = 0, skip = 0, err = 0

  for (const f of files) {
    const name = path.basename(f, ".webp").padEnd(40)
    process.stdout.write(`  ${name} `)
    const result = await normalizeOne(f)
    if (result === "ok")   { console.log("✓"); ok++ }
    if (result === "skip") { console.log("○ skipped"); skip++ }
    if (result === "err")  { console.log("✗ error");  err++ }
  }

  console.log(`\n  ${"─".repeat(50)}`)
  console.log(`  OK: ${ok}  Skipped: ${skip}  Errors: ${err}`)
  console.log(`  Done.\n`)
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1) })
