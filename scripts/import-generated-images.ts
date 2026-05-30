/**
 * Import AI-generated product images.
 *
 * Reads originals from docs/catalog-audit/generated-image-import-backup/,
 * matches each chosen file to a catalog product (slug), normalises it to a
 * 600×600 white-bg WEBP in public/products/generated/, moves everything not
 * chosen (duplicates + decoys) to docs/catalog-audit/generated-image-duplicates/,
 * and updates src/data/products.ts (image + imageStatus).
 *
 * Mapping is keyed by FILENAME PREFIX (text before the _2026… timestamp), so
 * ellipsis-truncated names still match.
 *
 * Usage: npx tsx scripts/import-generated-images.ts
 */
import * as fs from "fs"
import * as path from "path"
import sharp from "sharp"

const ROOT = process.cwd()
const BACKUP = path.join(ROOT, "docs", "catalog-audit", "generated-image-import-backup")
const DUPS = path.join(ROOT, "docs", "catalog-audit", "generated-image-duplicates")
const GEN = path.join(ROOT, "public", "products", "generated")
const PT = path.join(ROOT, "src", "data", "products.ts")
const MANI = path.join(ROOT, "docs", "catalog-audit", "image-sources.json")
fs.mkdirSync(DUPS, { recursive: true })
fs.mkdirSync(GEN, { recursive: true })

// slug -> { prefix (filename start, before timestamp), status }
const MAP: Record<string, { prefix: string; status: "verified_exact" | "verified_generic" }> = {
  "yogurt-natural":          { prefix: "Activia_Natural_yogurt_cup", status: "verified_exact" },
  "penne-barilla":           { prefix: "Barilla_Penne_Rigate_blue_box", status: "verified_exact" },
  "farfalle":                { prefix: "Barilla_Farfalle_blue_box", status: "verified_generic" },
  "canned-peas-bonduelle":   { prefix: "Bonduelle_Green_Peas_tin_can", status: "verified_exact" },
  "canned-corn-bonduelle":   { prefix: "Bonduelle_Sweet_Corn_tin_can", status: "verified_exact" },
  "bounty":                  { prefix: "Bounty_Chocolate_Bar", status: "verified_exact" },
  "cheese-cheddar":          { prefix: "Cheddar_cheese_in_packaging", status: "verified_generic" },
  "chocolate-white":         { prefix: "Dove_White_Chocolate_bar", status: "verified_exact" },
  "earl-grey":               { prefix: "Earl_Grey_Tea_box", status: "verified_generic" },
  "water-premium":           { prefix: "Evian_water_bottle", status: "verified_exact" },
  "ferrero-rocher":          { prefix: "Ferrero_Rocher_gold_box", status: "verified_exact" },
  "rye-cakes-finn-crisp":    { prefix: "Finn_Crisp_rye_snack_box", status: "verified_exact" },
  "baby-puree-pear":         { prefix: "Frutonyanya_Pear_Puree", status: "verified_exact" },
  "baby-puree-apple-gerber": { prefix: "Gerber_Apple_Puree", status: "verified_exact" },
  "baby-cookies-gerber":     { prefix: "Gerber_baby_cookies_package", status: "verified_exact" },
  "baby-porridge-oat":       { prefix: "Gerber_Oatmeal_baby_cereal_box", status: "verified_exact" },
  "pesto-sauce":             { prefix: "Glass_jar_of_Pesto_Sauce", status: "verified_generic" },
  "pizza-tomato-sauce":      { prefix: "Glass_jar_Tomato_Pizza_Sauce", status: "verified_generic" },
  "green-tea-greenfield":    { prefix: "Greenfield_Tea_box", status: "verified_exact" },
  "baby-porridge-buckwheat": { prefix: "Heinz_Baby_Porridge_box", status: "verified_generic" },
  "ketchup-heinz":           { prefix: "Heinz_Ketchup_bottle", status: "verified_exact" },
  "coffee-ground-jacobs":    { prefix: "Jacobs_Monarch_coffee_jar", status: "verified_exact" },
  "soy-sauce-kikkoman":      { prefix: "Kikkoman_Soy_Sauce_bottle", status: "verified_exact" },
  "kitkat":                  { prefix: "KitKat_Chunky_chocolate_bar", status: "verified_exact" },
  "kombucha":                { prefix: "Kombucha_Ginger_Lemon_bottle", status: "verified_exact" },
  "coffee-beans-lavazza":    { prefix: "Lavazza_coffee_bag", status: "verified_exact" },
  "lays-classic":            { prefix: "Lay's_Classic_chips_bag", status: "verified_exact" },
  "iced-tea":                { prefix: "Lipton_Ice_Tea_bottle", status: "verified_exact" },
  "mustard-dijon":           { prefix: "Maille_Dijon_Mustard_glass_jar", status: "verified_exact" },
  "chocolate-bar-milka":     { prefix: "Milka_Chocolate_bar_package", status: "verified_exact" },
  "cheese-mozzarella":       { prefix: "Mozzarella_cheese_in_water_package", status: "verified_generic" },
  "coffee-instant-nescafe":  { prefix: "Nescafe_Gold_coffee_glass_jar", status: "verified_exact" },
  "coffee-capsules":         { prefix: "Nespresso_coffee_capsules", status: "verified_exact" },
  "cacao-nesquik":           { prefix: "Nesquik_Cocoa_yellow_canister", status: "verified_exact" },
  "nutella":                 { prefix: "Nutella_350g_glass_jar", status: "verified_exact" },
  "baby-formula-nutrilon2":  { prefix: "Nutrilon_2_baby_formula_canister", status: "verified_exact" },
  "baby-formula-nan1":       { prefix: "Baby_formula_canister_product_photo", status: "verified_exact" },
  "oat-drink":               { prefix: "Oatly_Oat_Drink_carton", status: "verified_generic" },
  "protein-powder-vanilla":  { prefix: "Optimum_Nutrition_protein_tub", status: "verified_exact" },
  "oreo":                    { prefix: "Oreo_Original_cookie_package", status: "verified_exact" },
  "oyster-sauce":            { prefix: "Oyster_sauce_bottle_on_white", status: "verified_generic" },
  "cheese-parmesan":         { prefix: "Parmesan_cheese_in_plastic_wrap", status: "verified_generic" },
  "cheese-cream":            { prefix: "Philadelphia_Cream_Cheese_tub", status: "verified_exact" },
  "cottage-cheese-soft":     { prefix: "President_Cottage_Cheese_container", status: "verified_exact" },
  "pringles-original":       { prefix: "Pringles_Original_canister", status: "verified_exact" },
  "protein-bar-rex":         { prefix: "Protein_Rex_snack_bar_package", status: "verified_exact" },
  "raffaello":               { prefix: "Raffaello_chocolates_box", status: "verified_exact" },
  "energy-redbull":          { prefix: "Red_Bull_energy_drink_can", status: "verified_exact" },
  "snickers":                { prefix: "Snickers_Original_chocolate_bar", status: "verified_exact" },
  "garlic-sauce":            { prefix: "Squeeze_bottle_of_Garlic_Sauce", status: "verified_generic" },
  "tabasco":                 { prefix: "Tabasco_Red_Pepper_Sauce_bottle", status: "verified_exact" },
  "teriyaki-sauce":          { prefix: "Teriyaki_Sauce_bottle", status: "verified_generic" },
  "barista-milk":            { prefix: "Barista_Milk_carton", status: "verified_generic" },
  "aloe-drink":              { prefix: "Aloe_Vera_Drink_bottle", status: "verified_generic" },
}

const all = fs.readdirSync(BACKUP).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
const chosen = new Set<string>()
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 as const }

async function toWebp(srcFile: string, destFile: string): Promise<boolean> {
  try {
    let trimmed: Buffer
    try {
      trimmed = await sharp(fs.readFileSync(srcFile)).flatten({ background: WHITE }).trim({ background: WHITE, threshold: 22 }).toBuffer()
      const tm = await sharp(trimmed).metadata()
      if ((tm.width ?? 0) < 100 || (tm.height ?? 0) < 100) trimmed = fs.readFileSync(srcFile)
    } catch { trimmed = fs.readFileSync(srcFile) }
    await sharp(trimmed).resize(480, 480, { fit: "contain", background: WHITE })
      .extend({ top: 60, bottom: 60, left: 60, right: 60, background: WHITE })
      .webp({ quality: 88 }).toFile(destFile)
    return true
  } catch (e) { console.log("  ! normalize failed", path.basename(srcFile), (e as Error).message); return false }
}

async function main() {
  let src = fs.readFileSync(PT, "utf-8")
  const manifest = JSON.parse(fs.readFileSync(MANI, "utf-8"))
  const setLine = (id: string, repl: string) => {
    const re = new RegExp(`(\\n\\s*)id:\\s*"${id}"[^\\n]*?emoji:`)
    if (!re.test(src)) return false
    src = src.replace(re, `$1${repl} emoji:`)
    return true
  }

  const imported: string[] = []; const notFound: string[] = []
  for (const [slug, { prefix, status }] of Object.entries(MAP)) {
    const file = all.find((f) => f.startsWith(prefix) && !chosen.has(f))
    if (!file) { notFound.push(`${slug} (prefix "${prefix}")`); continue }
    chosen.add(file)
    const ok = await toWebp(path.join(BACKUP, file), path.join(GEN, `${slug}.webp`))
    if (!ok) { notFound.push(`${slug} (normalize fail)`); continue }
    if (!setLine(slug, `id: "${slug}", imageStatus: "${status}", image: "/products/generated/${slug}.webp",`))
      console.log("  ! products.ts line not found:", slug)
    manifest[slug] = { status: status === "verified_exact" ? "real_verified" : "matched_unverified",
      source_type: "ai_generated", source_name: file, local_path: `/products/generated/${slug}.webp`, fetched: "2026-05-30" }
    imported.push(`${slug} <- ${file} [${status}]`)
  }

  // move everything not chosen to duplicates
  let moved = 0
  for (const f of all) {
    if (chosen.has(f)) continue
    fs.copyFileSync(path.join(BACKUP, f), path.join(DUPS, f))
    moved++
  }

  fs.writeFileSync(PT, src, "utf-8")
  fs.writeFileSync(MANI, JSON.stringify(manifest, null, 2), "utf-8")

  console.log(`\nimported: ${imported.length}`)
  imported.forEach((l) => console.log("  ✓ " + l))
  console.log(`\nmoved to duplicates (dups + decoys): ${moved}`)
  if (notFound.length) { console.log(`\nNOT matched (${notFound.length}):`); notFound.forEach((l) => console.log("  ✗ " + l)) }
}
main()
