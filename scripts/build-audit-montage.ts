/**
 * Build labeled contact-sheet montages of every product image, grouped by
 * category, for a human/vision semantic audit.
 *
 * Each cell = product image + caption (id, title, unit, status, source).
 * Sheets are written to .audit/montage-NN.png
 *
 * Usage: npx tsx scripts/build-audit-montage.ts
 */
import * as fs from "fs"
import * as path from "path"
import sharp from "sharp"
import { products } from "../src/data/products"

const PRODUCTS_DIR = path.join(process.cwd(), "public", "products")
const SOURCES_FILE = path.join(process.cwd(), "docs", "catalog-audit", "image-sources.json")
const OUT_DIR      = path.join(process.cwd(), ".audit")
fs.mkdirSync(OUT_DIR, { recursive: true })

const sources: Record<string, { source_name?: string; note?: string }> =
  fs.existsSync(SOURCES_FILE) ? JSON.parse(fs.readFileSync(SOURCES_FILE, "utf-8")) : {}

const COLS = 4
const ROWS = 4
const PER  = COLS * ROWS
const IMG  = 200
const CAPH = 78          // caption height
const CELLW = IMG + 16
const CELLH = IMG + CAPH
const PAD = 10

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s)

type Item = { id: string; title: string; image: string; status?: string; unit?: string; cat: string }

const withImg: Item[] = products
  .filter((p) => p.image && fs.existsSync(path.join(PRODUCTS_DIR, p.image.replace(/^\/products\//, ""))))
  .map((p) => ({ id: p.id, title: p.title, image: p.image!, status: p.imageStatus, unit: p.unit, cat: p.category }))

// sort by category so each sheet is coherent
withImg.sort((a, b) => (a.cat === b.cat ? a.id.localeCompare(b.id) : a.cat.localeCompare(b.cat)))

async function cell(it: Item): Promise<Buffer> {
  const file = path.join(PRODUCTS_DIR, it.image.replace(/^\/products\//, ""))
  const img = await sharp(file).resize(IMG, IMG, { fit: "contain", background: "#fff" }).toBuffer()

  const src = clip((sources[it.id]?.source_name ?? "").replace(/\s+/g, " "), 30)
  const note = sources[it.id]?.note ? "⚑" : ""
  const cap = `
    <svg width="${CELLW}" height="${CELLH}">
      <rect width="100%" height="100%" fill="#f7f7f7"/>
      <rect x="0" y="0" width="${CELLW}" height="${IMG + 8}" fill="#ffffff"/>
      <text x="6" y="${IMG + 24}" font-family="monospace" font-size="13" font-weight="bold" fill="#111">${esc(clip(it.id, 26))}</text>
      <text x="6" y="${IMG + 40}" font-family="sans-serif" font-size="12" fill="#222">${esc(clip(it.title, 30))} ${esc(it.unit ?? "")}</text>
      <text x="6" y="${IMG + 56}" font-family="sans-serif" font-size="11" fill="#777">${esc(it.status ?? "-")} ${note}</text>
      <text x="6" y="${IMG + 71}" font-family="sans-serif" font-size="10" fill="#999">src: ${esc(src)}</text>
    </svg>`
  return sharp(Buffer.from(cap))
    .composite([{ input: img, top: 4, left: Math.round((CELLW - IMG) / 2) }])
    .png()
    .toBuffer()
}

async function main() {
  console.log(`Products with on-disk image: ${withImg.length}`)
  const sheets = Math.ceil(withImg.length / PER)
  for (let s = 0; s < sheets; s++) {
    const batch = withImg.slice(s * PER, s * PER + PER)
    const W = COLS * CELLW + PAD * (COLS + 1)
    const H = ROWS * CELLH + PAD * (ROWS + 1) + 24
    const cats = [...new Set(batch.map((b) => b.cat))].join(" | ")
    const header = `<svg width="${W}" height="24"><rect width="100%" height="100%" fill="#0a3"/><text x="8" y="17" font-family="sans-serif" font-size="14" fill="#fff">Sheet ${s + 1}/${sheets} — ${esc(clip(cats, 90))}</text></svg>`

    const composites: sharp.OverlayOptions[] = [{ input: Buffer.from(header), top: 0, left: 0 }]
    for (let i = 0; i < batch.length; i++) {
      const r = Math.floor(i / COLS)
      const c = i % COLS
      composites.push({
        input: await cell(batch[i]),
        top: 24 + PAD + r * (CELLH + PAD),
        left: PAD + c * (CELLW + PAD),
      })
    }
    const out = path.join(OUT_DIR, `montage-${String(s + 1).padStart(2, "0")}.png`)
    await sharp({ create: { width: W, height: H, channels: 3, background: "#e5e5e5" } })
      .composite(composites)
      .png()
      .toFile(out)
    console.log(`  ${out}  (${batch.length} items)`)
  }
  console.log(`\nDone. ${sheets} sheets in ${OUT_DIR}`)
}
main()
