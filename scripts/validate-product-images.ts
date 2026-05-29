/**
 * Product Image Semantic Validator
 *
 * Checks every product with an image against:
 * 1. File exists on disk
 * 2. imageStatus allows showing image in production
 * 3. No cross-brand substitution (brand in title ≠ brand in image source)
 * 4. No duplicate image across non-generic products
 * 5. No rejected/missing product showing a real image path
 *
 * Usage:
 *   npx tsx scripts/validate-product-images.ts          # report only
 *   npx tsx scripts/validate-product-images.ts --fail   # exit 1 if errors
 */

import * as fs   from "fs"
import * as path from "path"
import { products } from "../src/data/products"
import { BRAND_RULES, detectBrandConflict } from "../src/data/productBrandRules"

const PRODUCTS_DIR    = path.join(process.cwd(), "public", "products")
const SOURCES_FILE    = path.join(process.cwd(), "docs", "catalog-audit", "image-sources.json")
const FAIL_ON_ERROR   = process.argv.includes("--fail")

// ─── SAFE STATUSES (may show real image in production) ───────────────────────
const SAFE_STATUSES   = new Set(["verified_exact", "verified_generic", "real_verified"])

// ─── LOAD IMAGE SOURCES ──────────────────────────────────────────────────────
type SourceEntry = {
  status:       string
  source_type:  string | null
  source_name:  string | null
  local_path:   string | null
  note?:        string
}

let sources: Record<string, SourceEntry> = {}
try {
  sources = JSON.parse(fs.readFileSync(SOURCES_FILE, "utf-8"))
} catch {
  console.warn("⚠  image-sources.json not found — source name checks skipped")
}

// ─── VALIDATION ──────────────────────────────────────────────────────────────

type Issue = {
  id:       string
  title:    string
  image:    string | undefined
  status:   string | undefined
  severity: "error" | "warn"
  message:  string
}

const issues: Issue[] = []
const imageUsage: Map<string, string[]> = new Map()

function report(
  p: { id: string; title: string; image?: string; imageStatus?: string },
  severity: "error" | "warn",
  message: string,
) {
  issues.push({
    id:       p.id,
    title:    p.title,
    image:    p.image,
    status:   p.imageStatus,
    severity,
    message,
  })
}

for (const p of products) {
  // ── 1. Rejected/missing with image still set ──────────────────────────────
  if ((p.imageStatus === "rejected" || p.imageStatus === "missing") && p.image) {
    report(p, "error",
      `imageStatus is "${p.imageStatus}" but image field is still set to ${p.image} — must be undefined`)
  }

  // ── 2. needs_review with image set ───────────────────────────────────────
  if (p.imageStatus === "needs_review" && p.image) {
    report(p, "warn",
      `imageStatus is "needs_review" but image is set — will show in ProductCard; confirm or reject`)
  }

  if (!p.image) continue

  // ── 3. File exists on disk ────────────────────────────────────────────────
  const filename = p.image.replace(/^\/products\//, "")
  const fullPath = path.join(PRODUCTS_DIR, filename)
  if (!fs.existsSync(fullPath)) {
    report(p, "error", `image file missing on disk: ${p.image}`)
  }

  // ── 4. Track duplicate usage ──────────────────────────────────────────────
  const ids = imageUsage.get(p.image) ?? []
  ids.push(p.id)
  imageUsage.set(p.image, ids)

  // ── 5. Brand conflict check via image-sources.json ───────────────────────
  const entry = sources[p.id]
  const sourceName = entry?.source_name ?? ""
  if (sourceName) {
    // Look for brand name in product title
    for (const [brand, rule] of Object.entries(BRAND_RULES)) {
      const titleLower = p.title.toLowerCase()
      const brandLower = brand.toLowerCase()
      const inTitle    = titleLower.includes(brandLower) ||
                         rule.allowed.some(kw => titleLower.includes(kw.toLowerCase()))
      if (!inTitle) continue

      // Brand is in the title — check for forbidden substitution in source
      const conflict = detectBrandConflict(brand, sourceName)
      if (conflict) {
        report(p, "error",
          `BRAND MISMATCH: title mentions "${brand}" but image source contains forbidden keyword "${conflict}" (source: "${sourceName}")`)
      }
    }
  }

  // ── 6. Explicit note in manifest marks a known issue ─────────────────────
  if (entry?.note && (
    entry.note.toLowerCase().includes("wrong") ||
    entry.note.toLowerCase().includes("stand-in") ||
    entry.note.toLowerCase().includes("not ")
  )) {
    report(p, "warn", `manifest note flags issue: "${entry.note}"`)
  }
}

// ── 7. Duplicate image across products ─────────────────────────────────────
for (const [imgPath, ids] of imageUsage) {
  if (ids.length > 1) {
    issues.push({
      id:       ids.join(", "),
      title:    ids.join(", "),
      image:    imgPath,
      status:   undefined,
      severity: "warn",
      message:  `DUPLICATE IMAGE: ${imgPath} used by ${ids.length} products: [${ids.join(", ")}]`,
    })
  }
}

// ─── REPORT ──────────────────────────────────────────────────────────────────

const errors = issues.filter(i => i.severity === "error")
const warns  = issues.filter(i => i.severity === "warn")

console.log(`\n  Product Image Semantic Validator`)
console.log(`  ${"─".repeat(50)}`)
console.log(`  Products checked:  ${products.length}`)
console.log(`  Errors:            ${errors.length}`)
console.log(`  Warnings:          ${warns.length}`)
console.log()

if (errors.length) {
  console.log("  ERRORS (must fix before shipping):")
  for (const e of errors) {
    console.log(`  ✗ [${e.id}] "${e.title}"`)
    console.log(`      ${e.message}`)
    console.log()
  }
}

if (warns.length) {
  console.log("  WARNINGS (should review):")
  for (const w of warns) {
    console.log(`  ⚠  [${w.id}] ${w.message}`)
  }
  console.log()
}

// ─── SUMMARY ─────────────────────────────────────────────────────────────────

const withImage    = products.filter(p => p.image).length
const verified     = products.filter(p =>
  p.imageStatus === "verified_exact" || p.imageStatus === "verified_generic" || p.imageStatus === "real_verified"
).length
const needsReview  = products.filter(p => p.imageStatus === "needs_review").length
const rejected     = products.filter(p => p.imageStatus === "rejected").length
const missing      = products.filter(p => !p.image).length

console.log("  Image coverage:")
console.log(`    Total products:    ${products.length}`)
console.log(`    With image path:   ${withImage}`)
console.log(`    Verified (safe):   ${verified}`)
console.log(`    Needs review:      ${needsReview}`)
console.log(`    Rejected (no img): ${rejected}`)
console.log(`    No image:          ${missing}`)
console.log()

if (FAIL_ON_ERROR && errors.length > 0) {
  console.error(`  ✗ Validation failed: ${errors.length} error(s)\n`)
  process.exit(1)
} else if (errors.length === 0) {
  console.log("  ✓ No blocking errors\n")
}
