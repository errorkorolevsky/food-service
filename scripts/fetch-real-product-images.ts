/**
 * Real Product Image Acquisition Pipeline
 *
 * Sources (in priority order):
 *   1. Magnum.kz CDN — weekly discount catalog (121 products, rotates)
 *   2. OpenFoodFacts — global product DB, free public API, ~3M products
 *   3. Manual — mark as needs_manual_source for human review
 *
 * Output:
 *   - public/products/real/<id>.webp  (600×800 q90, white bg)
 *   - docs/catalog-audit/image-sources.json  (provenance manifest)
 *
 * Usage:
 *   npx tsx scripts/fetch-real-product-images.ts --all
 *   npx tsx scripts/fetch-real-product-images.ts --id tomatoes,carrots
 *   npx tsx scripts/fetch-real-product-images.ts --report
 *   npx tsx scripts/fetch-real-product-images.ts --update-magnum
 */

import * as fs    from "fs"
import * as path  from "path"
import * as https from "https"
import * as http  from "http"
import sharp from "sharp"

// ─── ENV ──────────────────────────────────────────────────────────────────────

function loadEnv() {
  const p = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const eq = t.indexOf("=")
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
    if (!process.env[k]) process.env[k] = v
  }
}
loadEnv()

// ─── PATHS ────────────────────────────────────────────────────────────────────

const REAL_DIR     = path.join(process.cwd(), "public", "products", "real")
const PRODUCTS_DIR = path.join(process.cwd(), "public", "products")
const SOURCES_FILE = path.join(process.cwd(), "docs", "catalog-audit", "image-sources.json")
const MAGNUM_FILE  = path.join(process.cwd(), "docs", "catalog-audit", "magnum-source.json")
const TMP_DIR      = path.join(process.cwd(), ".next", "tmp-img-fetch")

fs.mkdirSync(REAL_DIR, { recursive: true })
fs.mkdirSync(TMP_DIR,  { recursive: true })

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ImageStatus = "real_verified" | "matched_unverified" | "placeholder" | "missing"

type SourceEntry = {
  status:       ImageStatus
  source_type:  "magnum_cdn" | "openfoodfacts" | "manufacturer" | "manual" | null
  source_name:  string
  source_url?:  string
  barcode?:     string | null
  local_path?:  string | null
  note?:        string
  fetched?:     string
}

type SourceManifest = Record<string, SourceEntry>

type Product = {
  id:       string
  title:    string
  category: string
  tags?:    string[]
  image?:   string
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function loadManifest(): SourceManifest {
  if (!fs.existsSync(SOURCES_FILE)) return {}
  return JSON.parse(fs.readFileSync(SOURCES_FILE, "utf-8"))
}

function saveManifest(manifest: SourceManifest): void {
  fs.writeFileSync(SOURCES_FILE, JSON.stringify(manifest, null, 2), "utf-8")
}

function loadProducts(): Product[] {
  const src  = fs.readFileSync(path.join(process.cwd(), "src", "data", "products.ts"), "utf-8")
  const products: Product[] = []
  const lines = src.split("\n")
  let cur: Partial<Product> = {}

  for (const line of lines) {
    const idM    = line.match(/id:\s*"([^"]+)"/)
    const titleM = line.match(/title:\s*"([^"]+)"/)
    const catM   = line.match(/category:\s*"([^"]+)"/)
    const imgM   = line.match(/image:\s*"([^"]+)"/)
    if (idM)    cur.id       = idM[1]
    if (titleM) cur.title    = titleM[1]
    if (catM)   cur.category = catM[1]
    if (imgM)   cur.image    = imgM[1]
    if (line.includes("},") && cur.id && cur.title) {
      products.push(cur as Product)
      cur = {}
    }
  }
  return products
}

function download(url: string, dest: string, timeoutMs = 20000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Download timeout")), timeoutMs)
    const file  = fs.createWriteStream(dest)

    function get(u: string, hops = 5): void {
      const mod = u.startsWith("https") ? https : http
      mod.get(u, { headers: { "User-Agent": "FoodService/1.0 image-fetcher" } }, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && hops > 0) {
          return get(res.headers.location, hops - 1)
        }
        if (res.statusCode !== 200) {
          clearTimeout(timer)
          reject(new Error(`HTTP ${res.statusCode} for ${u}`))
          return
        }
        res.pipe(file)
        file.on("finish", () => { clearTimeout(timer); file.close(() => resolve()) })
        file.on("error",  (e) => { clearTimeout(timer); reject(e) })
      }).on("error", (e) => { clearTimeout(timer); reject(e) })
    }
    get(url)
  })
}

async function toWebp(src: string, dest: string): Promise<{ width: number; height: number }> {
  const meta = await sharp(src).metadata()
  await sharp(src)
    .resize(600, 800, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
    .webp({ quality: 90 })
    .toFile(dest)
  return { width: meta.width ?? 0, height: meta.height ?? 0 }
}

async function verifyImage(filePath: string): Promise<boolean> {
  try {
    const meta = await sharp(filePath).metadata()
    return (meta.width ?? 0) >= 200 && (meta.height ?? 0) >= 200
  } catch {
    return false
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ─── NORMALISE ────────────────────────────────────────────────────────────────

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/«|»|"|"/g, "")
    .replace(/\s+/g, " ")
    .replace(/\d+(\.\d+)?\s*(г|кг|мл|л|шт|пак|уп)\.?/gi, "")
    .replace(/в ассортименте/gi, "")
    .trim()
}

function extractBrand(title: string): string | null {
  const m = title.match(/«([^»]+)»/)
  return m ? m[1].trim() : null
}

function productKeywords(p: Product): string[] {
  const brand   = extractBrand(p.title)
  const norm    = normalizeTitle(p.title)
  const words   = norm.split(" ").filter(w => w.length > 2)
  const tags    = p.tags ?? []
  return [...new Set([...(brand ? [brand.toLowerCase()] : []), ...words, ...tags])].slice(0, 8)
}

// ─── SOURCE 1: MAGNUM CDN ─────────────────────────────────────────────────────

type MagnumProduct = { id: number; name: string; image: string }

function loadMagnumCatalog(): MagnumProduct[] {
  if (!fs.existsSync(MAGNUM_FILE)) return []
  return JSON.parse(fs.readFileSync(MAGNUM_FILE, "utf-8"))
}

function magnumImageUrl(imagePath: string): string {
  return `https://magnum.kz:1337${imagePath}`
}

function scoreMagnumMatch(productTitle: string, magnumName: string): number {
  const pNorm = normalizeTitle(productTitle)
  const mNorm = normalizeTitle(magnumName)
  const pWords = new Set(pNorm.split(" ").filter(w => w.length > 2))
  const mWords = mNorm.split(" ").filter(w => w.length > 2)

  const pBrand = extractBrand(productTitle)?.toLowerCase()
  const mBrand = extractBrand(magnumName)?.toLowerCase()

  let score = 0
  // Brand match is most important
  if (pBrand && mBrand && pBrand === mBrand) score += 40
  if (pBrand && mNorm.includes(pBrand))       score += 20

  // Word overlap
  for (const w of mWords) {
    if (pWords.has(w)) score += 5
  }

  return score
}

async function tryMagnum(p: Product): Promise<{ url: string; name: string; score: number } | null> {
  const catalog = loadMagnumCatalog()
  if (!catalog.length) return null

  const matches = catalog
    .filter(m => m.image)
    .map(m => ({ url: magnumImageUrl(m.image), name: m.name, score: scoreMagnumMatch(p.title, m.name) }))
    .filter(m => m.score >= 25)
    .sort((a, b) => b.score - a.score)

  return matches[0] ?? null
}

// ─── SOURCE 2: OPENFOODFACTS ─────────────────────────────────────────────────

type OFFProduct = {
  product_name?: string
  brands?:       string
  image_url?:    string
  image_front_url?: string
  countries_tags?: string[]
}

type OFFResponse = { products: OFFProduct[]; count: number }

async function searchOpenFoodFacts(query: string, country = "russia"): Promise<OFFProduct[]> {
  const params = new URLSearchParams({
    search_terms:  query,
    search_simple: "1",
    action:        "process",
    json:          "1",
    page_size:     "5",
    fields:        "product_name,brands,image_url,image_front_url,image_front_small_url",
    tagtype_0:     "countries",
    tag_contains_0:"contains",
    tag_0:         country,
  })

  const url = `https://world.openfoodfacts.org/cgi/search.pl?${params}`
  const tmpFile = path.join(TMP_DIR, "off-response.json")

  try {
    await download(url, tmpFile, 15000)
    const data: OFFResponse = JSON.parse(fs.readFileSync(tmpFile, "utf-8"))
    fs.unlinkSync(tmpFile)
    return data.products ?? []
  } catch {
    try { fs.unlinkSync(tmpFile) } catch {}
    return []
  }
}

async function tryOpenFoodFacts(p: Product): Promise<{ url: string; name: string; brand: string } | null> {
  const brand    = extractBrand(p.title)
  const baseQuery = brand ? `${brand} ${normalizeTitle(p.title)}`.slice(0, 60) : normalizeTitle(p.title).slice(0, 60)

  // Try Russian products first, then Kazakhstan, then global
  for (const country of ["russia", "kazakhstan", ""]) {
    await sleep(500) // respect rate limit

    const results = await searchOpenFoodFacts(baseQuery, country)

    for (const r of results) {
      const imgUrl = r.image_front_url ?? r.image_url
      if (!imgUrl || imgUrl.includes("thumb")) continue

      // Basic relevance check
      const rName   = (r.product_name ?? "").toLowerCase()
      const rBrand  = (r.brands ?? "").toLowerCase()
      const ourNorm = normalizeTitle(p.title)

      const brandMatch = brand && (rBrand.includes(brand.toLowerCase()) || rName.includes(brand.toLowerCase()))
      const nameWords  = ourNorm.split(" ").filter(w => w.length > 3)
      const nameMatch  = nameWords.filter(w => rName.includes(w)).length >= Math.ceil(nameWords.length * 0.4)

      if (brandMatch || nameMatch) {
        return { url: imgUrl, name: r.product_name ?? "", brand: r.brands ?? "" }
      }
    }

    if (country === "") break
  }

  return null
}

// ─── FETCH + SAVE ─────────────────────────────────────────────────────────────

async function fetchAndSave(
  productId:   string,
  sourceUrl:   string,
  sourceName:  string,
  sourceType:  SourceEntry["source_type"],
  status:      ImageStatus,
  barcode?:    string,
  note?:       string,
): Promise<string | null> {
  const tmpFile = path.join(TMP_DIR, `${productId}-src`)
  const outPath = path.join(PRODUCTS_DIR, `${productId}.webp`)

  try {
    await download(sourceUrl, tmpFile)
    if (!(await verifyImage(tmpFile))) throw new Error("Image too small or invalid")

    const dims = await toWebp(tmpFile, outPath)
    fs.unlinkSync(tmpFile)

    const manifest = loadManifest()
    manifest[productId] = {
      status,
      source_type: sourceType,
      source_name: sourceName,
      source_url:  sourceUrl,
      local_path:  `/products/${productId}.webp`,
      ...(barcode ? { barcode } : {}),
      ...(note    ? { note }    : {}),
      fetched: new Date().toISOString().slice(0, 10),
    }
    saveManifest(manifest)

    return `/products/${productId}.webp`
  } catch (err) {
    try { fs.unlinkSync(tmpFile) } catch {}
    return null
  }
}

// ─── UPDATE MAGNUM ─────────────────────────────────────────────────────────────

async function updateMagnumCatalog(): Promise<void> {
  console.log("  Fetching latest Magnum discount catalog…")
  const tmpFile = path.join(TMP_DIR, "magnum-latest.json")
  try {
    await download("https://magnum.kz:1337/api/new-product?cunt=500&city=almaty", tmpFile, 20000)
    const data = JSON.parse(fs.readFileSync(tmpFile, "utf-8"))
    fs.copyFileSync(tmpFile, MAGNUM_FILE)
    fs.unlinkSync(tmpFile)
    console.log(`  ✓ Updated Magnum catalog: ${data.length} products`)
  } catch (err) {
    console.log(`  ✗ Magnum update failed: ${err instanceof Error ? err.message : err}`)
    try { fs.unlinkSync(tmpFile) } catch {}
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function processProduct(p: Product, manifest: SourceManifest): Promise<"found" | "not_found" | "skipped"> {
  // Skip if already has a verified image file
  const existingEntry = manifest[p.id]
  if (existingEntry?.status === "real_verified") return "skipped"
  if (existingEntry?.local_path && fs.existsSync(path.join(process.cwd(), existingEntry.local_path))) {
    return "skipped" // already downloaded, don't re-fetch
  }

  // Try Magnum first (faster, KZ source)
  const magnumMatch = await tryMagnum(p)
  if (magnumMatch && magnumMatch.score >= 30) {
    const saved = await fetchAndSave(
      p.id, magnumMatch.url, magnumMatch.name,
      "magnum_cdn", "matched_unverified",
      undefined,
      magnumMatch.score < 40 ? "Auto-matched, review needed" : undefined,
    )
    if (saved) return "found"
  }

  await sleep(600) // rate limit between sources

  // Try OpenFoodFacts
  const offMatch = await tryOpenFoodFacts(p)
  if (offMatch) {
    const saved = await fetchAndSave(
      p.id, offMatch.url, `${offMatch.brand} — ${offMatch.name}`.slice(0, 100),
      "openfoodfacts", "matched_unverified",
    )
    if (saved) return "found"
  }

  // Mark as missing
  const manifest2 = loadManifest()
  if (!manifest2[p.id]) {
    manifest2[p.id] = {
      status:      "missing",
      source_type: null,
      source_name: "Not found in Magnum or OpenFoodFacts",
      local_path:  null,
      fetched:     new Date().toISOString().slice(0, 10),
    }
    saveManifest(manifest2)
  }
  return "not_found"
}

// ─── REPORT ───────────────────────────────────────────────────────────────────

function printReport(): void {
  const products = loadProducts()
  const manifest = loadManifest()

  const real_verified      = Object.values(manifest).filter(e => e.status === "real_verified").length
  const matched_unverified = Object.values(manifest).filter(e => e.status === "matched_unverified").length
  const missing            = Object.values(manifest).filter(e => e.status === "missing").length
  const placeholder        = products.length - Object.keys(manifest).length

  console.log(`\n📊  Image Coverage Report — ${new Date().toISOString().slice(0, 10)}`)
  console.log(`${"─".repeat(55)}`)
  console.log(`  Total products:        ${products.length}`)
  console.log(`  ✅ real_verified:       ${real_verified}   (human-confirmed correct photo)`)
  console.log(`  🔶 matched_unverified: ${matched_unverified}   (auto-matched, review needed)`)
  console.log(`  ⬜ placeholder:        ${placeholder}   (no image attempted yet)`)
  console.log(`  ❌ missing:            ${missing}   (searched all sources, not found)`)
  console.log(`  Coverage (any image):  ${real_verified + matched_unverified} / ${products.length} (${Math.round((real_verified + matched_unverified) / products.length * 100)}%)`)
  console.log()

  // Per-category breakdown
  const byCat: Record<string, { total: number; covered: number }> = {}
  for (const p of products) {
    if (!byCat[p.category]) byCat[p.category] = { total: 0, covered: 0 }
    byCat[p.category].total++
    const entry = manifest[p.id]
    if (entry && (entry.status === "real_verified" || entry.status === "matched_unverified") && entry.local_path) {
      byCat[p.category].covered++
    }
  }

  console.log("  Category coverage:")
  for (const [cat, { total, covered }] of Object.entries(byCat).sort((a, b) => b[1].total - a[1].total)) {
    const bar  = "█".repeat(Math.round(covered / total * 10)) + "░".repeat(10 - Math.round(covered / total * 10))
    console.log(`    ${bar} ${cat.padEnd(25)} ${covered}/${total}`)
  }
  console.log()

  // Flagged issues
  const issues = Object.entries(manifest).filter(([, e]) => e.note)
  if (issues.length) {
    console.log("  ⚠️  Flagged for review:")
    for (const [id, e] of issues) {
      console.log(`    ${id}: ${e.note}`)
    }
  }
}

// ─── ENTRY POINT ──────────────────────────────────────────────────────────────

async function main() {
  const args     = process.argv.slice(2)
  const doReport = args.includes("--report")
  const doUpdate = args.includes("--update-magnum")
  const doAll    = args.includes("--all")
  const idFlag   = args.find(a => a.startsWith("--id="))?.slice(5) ?? args.find(a => !a.startsWith("--")) ?? ""
  const idFilter = idFlag ? idFlag.split(",").map(s => s.trim()).filter(Boolean) : []

  if (doReport) { printReport(); return }
  if (doUpdate) { await updateMagnumCatalog(); return }

  const products  = loadProducts()
  let manifest    = loadManifest()

  // Determine queue
  let queue: Product[]
  if (idFilter.length > 0) {
    queue = products.filter(p => idFilter.includes(p.id))
    if (!queue.length) { console.error(`No products matched: ${idFilter}`); process.exit(1) }
  } else if (doAll) {
    // Only process products without any image
    queue = products.filter(p => !p.image && manifest[p.id]?.status !== "real_verified" && manifest[p.id]?.status !== "matched_unverified")
  } else {
    // Default: process top priority (isHit/isPopular) without images — first 30
    const src = fs.readFileSync(path.join(process.cwd(), "src", "data", "products.ts"), "utf-8")
    const priorityIds = new Set<string>()
    const lines = src.split("\n")
    let curId = ""
    for (const line of lines) {
      const idM = line.match(/id: "([^"]+)"/)
      if (idM) curId = idM[1]
      if ((line.includes("isHit: true") || line.includes("isPopular: true")) && curId) {
        priorityIds.add(curId)
      }
    }
    queue = products
      .filter(p => priorityIds.has(p.id) && !p.image && !manifest[p.id]?.local_path)
      .slice(0, 30)
  }

  const alreadyDone = queue.filter(p => manifest[p.id]?.local_path && fs.existsSync(path.join(process.cwd(), manifest[p.id].local_path!))).length
  const toProcess   = queue.filter(p => !manifest[p.id]?.local_path || !fs.existsSync(path.join(process.cwd(), manifest[p.id].local_path!)))

  console.log(`\n🔍  Real Product Image Fetcher`)
  console.log(`   Sources: Magnum CDN → OpenFoodFacts`)
  console.log(`   Queue:   ${toProcess.length} to process${alreadyDone ? `, ${alreadyDone} skipped (already sourced)` : ""}`)
  console.log(`   Output:  public/products/<id>.webp + image-sources.json\n`)

  if (!toProcess.length) {
    console.log("✅  Nothing to fetch. Run --report to see coverage.")
    return
  }

  let found = 0, notFound = 0

  for (let i = 0; i < toProcess.length; i++) {
    const p   = toProcess[i]
    const pad = `[${String(i + 1).padStart(2)}/${toProcess.length}]`

    process.stdout.write(`${pad} ${p.id.padEnd(30)} `)

    // Reload manifest in case a previous iteration updated it
    manifest = loadManifest()

    const result = await processProduct(p, manifest)
    if (result === "found") {
      const entry = loadManifest()[p.id]
      console.log(`✓  ${entry?.source_type ?? "unknown"} — ${(entry?.source_name ?? "").slice(0, 45)}`)
      found++
    } else if (result === "not_found") {
      console.log(`✗  not found in any source`)
      notFound++
    } else {
      console.log(`○  skipped`)
    }

    await sleep(800) // polite delay between products
  }

  try { fs.rmdirSync(TMP_DIR) } catch {}

  console.log(`\n${"─".repeat(55)}`)
  console.log(`  Found: ${found}   Not found: ${notFound}   Skipped: ${alreadyDone}`)
  console.log()
  printReport()
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1) })
