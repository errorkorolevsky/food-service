/**
 * Semantic image audit for all products.
 *
 * Classifies each product's image into a proposed status using the image
 * manifest (what the photo actually depicts), brand rules, duplicate
 * detection and placeholder detection. Writes a report; changes nothing.
 *
 * Proposed statuses:
 *   verified_exact   — branded product, source confirms the SAME brand
 *   verified_generic — unbranded/staple product, same product-type stand-in
 *   needs_review     — branded product whose image source does NOT confirm the
 *                      brand, or unclear/empty source, or suspicious duplicate
 *   rejected         — cross-brand conflict or wrong product type
 *
 * Usage: npx tsx scripts/semantic-audit.ts
 */
import * as fs from "fs"
import * as path from "path"
import { products } from "../src/data/products"
import { BRAND_RULES, detectBrandConflict, confirmsBrand } from "../src/data/productBrandRules"

const PRODUCTS_DIR = path.join(process.cwd(), "public", "products")
const SOURCES_FILE = path.join(process.cwd(), "docs", "catalog-audit", "image-sources.json")
const REPORT_FILE  = path.join(process.cwd(), "docs", "catalog-audit", "semantic-audit-report.json")

const sources: Record<string, { source_name?: string; note?: string }> =
  fs.existsSync(SOURCES_FILE) ? JSON.parse(fs.readFileSync(SOURCES_FILE, "utf-8")) : {}

// Named brands the user requires exact-brand matches for (no generic stand-ins).
// Union of BRAND_RULES keys + explicit high-value brands.
const PROTECTED: Record<string, string[]> = {}
for (const [brand, rule] of Object.entries(BRAND_RULES)) {
  PROTECTED[brand] = [brand.toLowerCase(), ...rule.allowed.map((k) => k.toLowerCase())]
}
// extra protected brands (name-only match in title & source)
for (const b of ["Bonduelle", "Mars", "Twix", "Barilla", "Heinz", "Makfa", "President", "Ferrero", "Raffaello", "Pringles", "Lay's", "Lays", "Danone", "Activia", "Agusha", "Gerber", "Nestle", "Nestlé", "Nutrilon", "NAN"]) {
  PROTECTED[b] = PROTECTED[b] ?? [b.toLowerCase()]
}

const onDisk = (img?: string) =>
  !!img && fs.existsSync(path.join(PRODUCTS_DIR, img.replace(/^\/products\//, "")))

type Row = {
  id: string; title: string; cat: string; image?: string
  current?: string; proposed: string; reason: string; src: string; note: string
}

const rows: Row[] = []
const imageUsage = new Map<string, string[]>()

function brandInTitle(title: string): string | null {
  const t = title.toLowerCase()
  for (const [brand, kws] of Object.entries(PROTECTED)) {
    if (kws.some((k) => t.includes(k))) return brand
  }
  return null
}

function sourceConfirms(brand: string, src: string): boolean {
  if (BRAND_RULES[brand]) return confirmsBrand(brand, src)
  // extra brand: name appears in source
  return (PROTECTED[brand] ?? []).some((k) => src.toLowerCase().includes(k))
}

for (const p of products) {
  const img = p.image
  const has = onDisk(img)
  const src = (sources[p.id]?.source_name ?? "").trim()
  const note = (sources[p.id]?.note ?? "").trim()
  if (img) imageUsage.set(img, [...(imageUsage.get(img) ?? []), p.id])

  // Products with NO usable image → skip from image-quality classification
  if (!has) {
    rows.push({ id: p.id, title: p.title, cat: p.category, image: img,
      current: p.imageStatus, proposed: img ? "needs_review" : "missing",
      reason: img ? "image path set but file missing on disk" : "no image",
      src, note })
    continue
  }

  const brand = brandInTitle(p.title)
  const noteL = note.toLowerCase()
  let proposed = "verified_generic"
  let reason = "generic same-type image"

  if (brand) {
    const conflict = BRAND_RULES[brand] ? detectBrandConflict(brand, src) : null
    if (conflict) { proposed = "rejected"; reason = `BRAND CONFLICT: "${brand}" vs forbidden "${conflict}" in source` }
    else if (src && sourceConfirms(brand, src)) { proposed = "verified_exact"; reason = `source confirms brand "${brand}"` }
    else { proposed = "needs_review"; reason = `branded "${brand}" but source does NOT confirm it (src="${src || "∅"}")` }
  } else {
    if (/wrong type/i.test(note)) { proposed = "rejected"; reason = `note: WRONG TYPE — ${note}` }
    else if (/stand-in|stand in|—|wrong brand/i.test(note) || /stand-in/i.test(src)) { proposed = "verified_generic"; reason = `same-type stand-in (generic product)` }
    else { proposed = "verified_exact"; reason = "matched, no brand concern" }
  }

  rows.push({ id: p.id, title: p.title, cat: p.category, image: img,
    current: p.imageStatus, proposed, reason, src, note })
}

// duplicate detection
const dups: Record<string, string[]> = {}
for (const [img, ids] of imageUsage) if (ids.length > 1) dups[img] = ids

// mark duplicates (different products sharing one photo) as needs_review unless
// they are obvious variants (shared id stem)
for (const [img, ids] of Object.entries(dups)) {
  const stems = new Set(ids.map((id) => id.replace(/-?\d+%?$/, "").replace(/-(light|zero|max)$/, "")))
  const variant = stems.size === 1
  if (variant) continue
  for (const id of ids) {
    const r = rows.find((x) => x.id === id)
    if (r && (r.proposed === "verified_exact" || r.proposed === "verified_generic")) {
      r.proposed = "needs_review"
      r.reason = `DUPLICATE image shared by [${ids.join(", ")}]`
    }
  }
}

// summary
const count = (s: string) => rows.filter((r) => r.proposed === s).length
const changed = rows.filter((r) => r.current !== r.proposed)

console.log("── Semantic audit (proposed) ──")
console.log("total products:   ", rows.length)
console.log("verified_exact:   ", count("verified_exact"))
console.log("verified_generic: ", count("verified_generic"))
console.log("needs_review:     ", count("needs_review"))
console.log("rejected:         ", count("rejected"))
console.log("missing:          ", count("missing"))
console.log("duplicate images: ", Object.keys(dups).length)
console.log("status changes vs current:", changed.length)

console.log("\n── Proposed REJECTED ──")
for (const r of rows.filter((r) => r.proposed === "rejected")) console.log(`  ${r.id.padEnd(26)} ${r.reason}`)

console.log("\n── Proposed NEEDS_REVIEW ──")
for (const r of rows.filter((r) => r.proposed === "needs_review")) console.log(`  ${r.id.padEnd(26)} ${r.reason}`)

console.log("\n── Duplicate image groups ──")
for (const [img, ids] of Object.entries(dups)) console.log(`  ${img.replace("/products/", "")}  ←  [${ids.join(", ")}]`)

fs.writeFileSync(REPORT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), summary: {
  total: rows.length, verified_exact: count("verified_exact"), verified_generic: count("verified_generic"),
  needs_review: count("needs_review"), rejected: count("rejected"), missing: count("missing"),
  duplicates: Object.keys(dups).length, changes: changed.length,
}, duplicates: dups, rows }, null, 2), "utf-8")
console.log(`\nReport: ${REPORT_FILE}`)
