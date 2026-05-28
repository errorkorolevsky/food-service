/**
 * Magnum Source Image Downloader
 *
 * Downloads real product images from Magnum.kz CDN and converts to WebP 600x800.
 * Source: https://magnum.kz:1337/api/new-product?cunt=500&city=almaty
 *
 * Usage:
 *   npx tsx scripts/download-magnum-images.ts            # download all matched
 *   npx tsx scripts/download-magnum-images.ts --preview  # list matches, no download
 *
 * Images are high-quality white-background product photos from Magnum's own CDN.
 * After download they are resized to 600x800 WebP (quality 90, white bg preserved).
 */

import * as fs   from "fs"
import * as path from "path"
import * as https from "https"
import * as http  from "http"
import sharp from "sharp"

const CDN = "https://magnum.kz:1337/uploads/"
const OUT = path.join(process.cwd(), "public", "products")
const SRC = path.join(process.cwd(), "docs", "catalog-audit", "magnum-source.json")

// ─── MATCHING MAP ─────────────────────────────────────────────────────────────
//
// Format: { ourProductId: "magnum_barcode_hash.jpg" }
//
// Matched manually from magnum-source.json against products.ts
// by product type, brand, category and unit size.
//
// Note: some matches are "close enough" (same product type, different local brand).
// These are marked with [~] in comments.

const MATCHES: Record<string, string> = {

  // ─── BEVERAGES ───────────────────────────────────────────────────────────────
  "pepsi":           "4870145005569_c02e4d911b.jpg",   // Pepsi 2L
  "cola":            "4870145005545_dbd455c439.jpg",   // Pepsi Cola 1L [~] Coca-Cola not in Magnum discount list
  "energy-redbull":  "9002490100070_fe7d4de32b.jpg",   // Red Bull 250ml
  "water-still":     "4870001157906_9d685cf10a.jpg",   // ASU still 1.5L
  "water-sparkling": "4870207510246_4a3fe2bc6c.jpg",   // Samal sparkling 1.5L [~]
  "apple-juice":     "4870001150013_90a1b6dd48.jpg",   // Da-Da juice 950ml [~]
  "orange-juice":    "4870002327483_f9e5292e3e.jpg",   // Da-Da apple 1.9L nector [~]
  "iced-tea":        "5449000216335_8a35514461.jpg",   // Fuse Tea 1.5L
  "chocolate-milk-drink": "4610133100223_8b44fe72ea.jpg", // Lugovoye Pole cocktail 200ml [~]

  // ─── COFFEE, TEA, COCOA ───────────────────────────────────────────────────────
  "coffee-ground-jacobs":   "4607001779650_a66d762d63.jpg", // Jacobs Gold 190g
  "coffee-instant-nescafe": "4600680017495_2e6adb46ec.jpg", // Nescafe Gold 320g
  "black-tea-akbar":        "8690717004365_6589aa0d36.jpg", // Bayce black tea 100 bags [~]
  "cacao-nesquik":          "8445290452979_21a6b6e9ac.jpg", // Nesquik 400g
  "green-tea-greenfield":   "4605246009198_0f616785c4.jpg", // Tess tea 100 bags [~]

  // ─── SNACKS & CONFECTIONERY ───────────────────────────────────────────────────
  "lays-classic":        "4690388119096_e14da1b6c2.jpg", // Lay's 70g
  "snickers":            "4607065001445_1ea9f69896.jpg", // Snickers/Mars/Twix 50g
  "kitkat":              "40052403_87226de0e0.jpg",      // KitKat 41.5g
  "chocolate-bar-milka": "7622202395956_103442928e.jpg", // Milka 80-97g
  "oreo":                "7622210375742_20e2a61cc0.jpg", // Oreo 228g
  "nutella":             "7622201459826_6b61a6cfde.jpg", // Milka nut paste 350g [~]
  "crackers-rye":        "4870247058081_d678aa37fe.jpg", // Juzon crackers 150g [~]
  "jubilee-cookies":     "4780111072078_78e855beb6.jpg", // Kunde cookies 260-290g [~]
  "halva-sunflower":     "7622201695989_3c76c47a61.jpg", // Alpen Gold 80-85g [~chocolate spread]

  // ─── DAIRY ───────────────────────────────────────────────────────────────────
  "milk-25":          "4870002011238_e81c72c452.jpg",   // Molochny Mir 2.5% 900ml
  "milk-32":          "4870002012839_88826eef04.jpg",   // Adal 3.2% 925ml [~]
  "sour-cream-20":    "4870002012709_3f9d11b779.jpg",   // Molochny Mir 20% 350g
  "butter-725":       "4870002012372_fc2c56d95a.jpg",   // Molochny Mir butter 72.5% 180g
  "kefir-25":         "4870002012754_45b6e99973.jpg",   // Molochny Mir kefir 2.5%
  "yogurt-natural":   "4870206411711_23f8be4ccf.jpg",   // Danone Activia drinking 650g [~]
  "curd-snack":       "4600605028858_9021270a4e.jpg",   // Prostokvashino snack 40g [~]

  // ─── EGGS ────────────────────────────────────────────────────────────────────
  "eggs-c1":  "4870237158753_6c2873dc63.jpg",  // Lugovoye Pole premium eggs 30pcs [~]
  "eggs-c0":  "4870237158753_6c2873dc63.jpg",  // Same image, different grade

  // ─── PANTRY ──────────────────────────────────────────────────────────────────
  "spaghetti-barilla":    "4601780009885_f392b85107.jpg", // Makfa 400g [~] penne not spaghetti but real pasta photo
  "rice-long":            "4870201180452_453ba0a77c.jpg", // Arнau rice 3kg [~]
  "flour-premium":        "4870001400019_524e3a6496.jpg", // Tsesna flour 2kg
  "sugar-sand":           "4870237150122_8991663957.jpg", // Vsyo v Dom sugar 800g [~]
  "mayo-provencal":       "4604248002725_fca300ed5d.jpg", // Makheyev Provansale 770g
  "canned-peas-bonduelle": "5998304240022_630fcd3ad0.jpg", // Globus green peas 425ml [~]
  "canned-corn-bonduelle": "5998304241111_e1bf0e22ce.jpg", // Globus corn 425ml [~]
  "canned-tuna-oil":      "4870218890313_4016399d07.jpg", // Natural tuna 185g
  "tomato-paste-pomidorka": "4870001080907_d5b602e343.jpg", // Tsin-Kaz 198g [~]
  "condensed-milk":       "4870004936324_a5c9e45edd.jpg", // Kubley beef stew [✗ wrong - skip]
  "buckwheat-uvelka":     "4870091000700_004b301ff1.jpg", // Sultan pasta 400g [✗ wrong - skip]

  // ─── FROZEN ──────────────────────────────────────────────────────────────────
  "pelmeni-beef":         "745314466165_c81df76e47.jpg",  // Meat to Eat pelmeni 1kg
  "pizza-pepperoni-fresh": "2453289_56a23878a8.jpg",      // Frozen pepperoni pizza 600g

  // ─── MEAT (Magnum has some fresh/packaged) ────────────────────────────────────
  "chicken-fillet":       "2196453_b3836f2c5e.jpg",      // Alel chicken fillet kg

  // ─── BABY FOOD ───────────────────────────────────────────────────────────────
  "baby-puree-apple-gerber": "4600338006574_96d645830c.jpg", // FrutoNyanya puree 90g [~]
  "baby-juice-agusha":       "4607096002985_5f567dab90.jpg", // Agusha juice 200g

  // ─── SAUCES ──────────────────────────────────────────────────────────────────
  "ketchup-heinz":    "3083680616904_45fa65e62d.jpg", // Bonduelle cucumbers [✗ skip - no heinz]

}

// Products marked as wrong matches (skip them)
const SKIP = new Set(["condensed-milk", "buckwheat-uvelka", "ketchup-heinz"])

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const mod  = url.startsWith("https") ? https : http
    function get(u: string, hops = 5): void {
      (u.startsWith("https") ? https : http).get(u, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && hops > 0)
          return get(res.headers.location, hops - 1)
        if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return }
        res.pipe(file)
        file.on("finish", () => file.close(() => resolve()))
      }).on("error", (err) => { fs.unlink(dest, () => {}); reject(err) })
    }
    get(url)
  })
}

async function toWebp(src: string, dest: string): Promise<void> {
  // Preserve white background (Magnum images have white/light bg)
  // Resize to 600x800 portrait, contain within bounds
  await sharp(src)
    .resize(600, 800, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
    .webp({ quality: 90 })
    .toFile(dest)
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const args    = process.argv.slice(2)
  const preview = args.includes("--preview")
  const force   = args.includes("--force")

  const validMatches = Object.entries(MATCHES).filter(([id]) => !SKIP.has(id))

  if (preview) {
    console.log(`\n📋  Magnum Image Matches (${validMatches.length} products)\n`)
    validMatches.forEach(([id, file]) => {
      const exists = fs.existsSync(path.join(OUT, id + ".webp"))
      console.log(`  ${exists ? "✓" : "○"} ${id.padEnd(35)} ← ${file}`)
    })
    const skipped = [...SKIP]
    if (skipped.length) {
      console.log(`\n  Skipped (wrong match): ${skipped.join(", ")}`)
    }
    return
  }

  const toDownload = validMatches.filter(([id]) =>
    force || !fs.existsSync(path.join(OUT, id + ".webp"))
  )
  const alreadyDone = validMatches.length - toDownload.length

  console.log(`\n🛒  Magnum → Food Service Image Downloader`)
  console.log(`   Source: magnum.kz:1337/uploads/`)
  console.log(`   Matched: ${validMatches.length}  ·  Queue: ${toDownload.length}${alreadyDone ? `  ·  ${alreadyDone} skipped (exist)` : ""}`)
  console.log(`   Output: public/products/  (600×800 WebP q90, white bg)\n`)

  if (!toDownload.length) {
    console.log("✅  All matched images already downloaded. Use --force to re-download.")
    return
  }

  const tmpDir = path.join(process.cwd(), ".next", "tmp-img-dl")
  fs.mkdirSync(tmpDir, { recursive: true })

  let ok = 0, fail = 0

  for (let i = 0; i < toDownload.length; i++) {
    const [id, srcFile] = toDownload[i]
    const pad    = `[${String(i + 1).padStart(2)}/${toDownload.length}]`
    const srcUrl = CDN + srcFile
    const tmpJpg = path.join(tmpDir, id + ".jpg")
    const webp   = path.join(OUT, id + ".webp")

    process.stdout.write(`${pad} ${id}  …  `)
    try {
      await download(srcUrl, tmpJpg)
      const meta = await sharp(tmpJpg).metadata()
      if (!meta.width || meta.width < 50) throw new Error("Invalid image")
      await toWebp(tmpJpg, webp)
      fs.unlinkSync(tmpJpg)
      console.log(`✓  (${meta.width}×${meta.height} src)`)
      ok++
    } catch (err: unknown) {
      try { fs.unlinkSync(tmpJpg) } catch {}
      console.log(`✗  ${err instanceof Error ? err.message : err}`)
      fail++
    }
    if (i < toDownload.length - 1) await sleep(300) // polite delay
  }

  try { fs.rmdirSync(tmpDir) } catch {}

  console.log(`\n${"─".repeat(50)}`)
  console.log(`  Downloaded: ${ok}   Failed: ${fail}   Skipped: ${alreadyDone}`)
  if (ok > 0) {
    console.log(`\n  Next steps:`)
    console.log(`  1. Add image: "/products/<id>.webp" to products.ts for each downloaded product`)
    console.log(`  2. Run: npx tsx scripts/seed-products.ts`)
    console.log(`  3. Check: http://localhost:3000/catalog`)
  }
  console.log()
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1) })
