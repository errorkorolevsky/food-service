/**
 * Batch Image Acquisition Pipeline
 *
 * Sources (priority order):
 *   1. Magnum.kz CDN — explicit curated mappings from magnum-source.json
 *   2. OpenFoodFacts — global product DB, free public API
 *
 * Features:
 *   - Saves checkpoint every 10 products (survives socket errors)
 *   - Skips products already on disk or in manifest
 *   - Retries failed downloads up to 3 times with backoff
 *   - Batched output with progress tracking
 *
 * Usage:
 *   npx tsx scripts/batch-fetch-images.ts           # process all without images
 *   npx tsx scripts/batch-fetch-images.ts --report  # show coverage stats
 *   npx tsx scripts/batch-fetch-images.ts --magnum  # Magnum matches only
 *   npx tsx scripts/batch-fetch-images.ts --off     # OpenFoodFacts only
 *   npx tsx scripts/batch-fetch-images.ts --id=apples,sausage-doctor
 */

import * as fs    from "fs"
import * as path  from "path"
import * as https from "https"
import * as http  from "http"
import sharp from "sharp"

// ─── PATHS ────────────────────────────────────────────────────────────────────

const PRODUCTS_DIR = path.join(process.cwd(), "public", "products")
const SOURCES_FILE = path.join(process.cwd(), "docs", "catalog-audit", "image-sources.json")
const MAGNUM_FILE  = path.join(process.cwd(), "docs", "catalog-audit", "magnum-source.json")
const TMP_DIR      = path.join(process.cwd(), ".next", "tmp-batch-img")
const CHECKPOINT   = path.join(process.cwd(), ".next", "img-batch-checkpoint.json")

fs.mkdirSync(PRODUCTS_DIR, { recursive: true })
fs.mkdirSync(TMP_DIR,      { recursive: true })

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Status = "real_verified" | "matched_unverified" | "missing"
type SourceType = "magnum_cdn" | "openfoodfacts" | null

interface Entry {
  status:      Status
  source_type: SourceType
  source_name: string
  source_url?: string
  barcode?:    string | null
  local_path?: string | null
  note?:       string
  fetched?:    string
}

type Manifest = Record<string, Entry>

interface Product {
  id:       string
  title:    string
  category: string
  image?:   string
}

// ─── EXPLICIT MAGNUM MATCHES ─────────────────────────────────────────────────
// Format: ourProductId → { file: Magnum CDN path suffix, note?: string }
// CDN base: https://magnum.kz:1337
//
// Curated from docs/catalog-audit/magnum-source.json
// Legend: [✓] exact match, [~] same product type, different brand/size

const MAGNUM_MATCHES: Record<string, { file: string; note?: string }> = {

  // ─── BEVERAGES ───────────────────────────────────────────────────────────────
  "pepsi":                 { file: "/uploads/4870145005569_c02e4d911b.jpg" },                    // Pepsi 2L ✓
  "cola":                  { file: "/uploads/4870145005545_dbd455c439.jpg", note: "Pepsi Cola 1L stand-in" }, // [~]
  "energy-redbull":        { file: "/uploads/9002490100070_fe7d4de32b.jpg" },                    // Red Bull 250ml ✓
  "water-still":           { file: "/uploads/4870001157906_9d685cf10a.jpg" },                    // ASU still 1.5L ✓
  "water-sparkling":       { file: "/uploads/4870207510246_4a3fe2bc6c.jpg", note: "Samal sparkling 1.5L" }, // [~]
  "apple-juice":           { file: "/uploads/4870001150013_90a1b6dd48.jpg", note: "Da-Da juice 950ml" }, // [~]
  "orange-juice":          { file: "/uploads/4870002327483_f9e5292e3e.jpg", note: "Da-Da nectar 1.9L" }, // [~]
  "iced-tea":              { file: "/uploads/5449000216335_8a35514461.jpg" },                    // Fuse Tea 1.5L ✓
  "chocolate-milk-drink":  { file: "/uploads/4610133100223_8b44fe72ea.jpg", note: "Lugovoye Pole 200ml cocktail" }, // [~]
  "tomato-juice":          { file: "/uploads/4870002328411_a11a6f537c.jpg", note: "Da-Da green apple juice — juice stand-in" }, // [~]
  "multifruit-juice":      { file: "/uploads/4870001150013_90a1b6dd48.jpg", note: "Da-Da juice — multifruit stand-in" }, // [~]

  // ─── COFFEE, TEA, COCOA ──────────────────────────────────────────────────────
  "coffee-ground-jacobs":   { file: "/uploads/4607001779650_a66d762d63.jpg" },                  // Jacobs Gold 190g ✓
  "coffee-instant-nescafe": { file: "/uploads/4600680017495_2e6adb46ec.jpg" },                  // Nescafe Gold 320g ✓
  "black-tea-akbar":        { file: "/uploads/8690717004365_6589aa0d36.jpg", note: "Bayce black tea 100 bags" }, // [~]
  "cacao-nesquik":          { file: "/uploads/8445290452979_21a6b6e9ac.jpg" },                  // Nesquik 400g ✓
  "green-tea-greenfield":   { file: "/uploads/4605246009198_0f616785c4.jpg", note: "Tess tea 100 bags" }, // [~]
  "coffee-beans-lavazza":   { file: "/uploads/8714599524220_b6a397caeb.jpg", note: "Jacobs Monarch 95g — coffee beans stand-in" }, // [~]
  "coffee-3in1":            { file: "/uploads/8714599524220_b6a397caeb.jpg", note: "Jacobs Monarch — 3-in-1 stand-in" }, // [~]
  "hot-chocolate":          { file: "/uploads/8445290452979_21a6b6e9ac.jpg", note: "Nesquik — hot chocolate stand-in" }, // [~]
  "earl-grey":              { file: "/uploads/4605246009198_0f616785c4.jpg", note: "Tess tea — Earl Grey stand-in" }, // [~]
  "herbal-tea":             { file: "/uploads/4605246009198_0f616785c4.jpg", note: "Tess tea — herbal stand-in" }, // [~]
  "ginger-tea":             { file: "/uploads/4605246009198_0f616785c4.jpg", note: "Tess tea — ginger stand-in" }, // [~]

  // ─── SNACKS ──────────────────────────────────────────────────────────────────
  "lays-classic":           { file: "/uploads/4690388119096_e14da1b6c2.jpg" },                  // Lay's 70g ✓
  "lays-paprika":           { file: "/uploads/4690388119096_e14da1b6c2.jpg", note: "Lays — paprika variant" }, // [~]
  "snickers":               { file: "/uploads/4607065001445_1ea9f69896.jpg", note: "Snickers/Mars/Twix group" }, // [~]
  "kitkat":                 { file: "/uploads/40052403_87226de0e0.jpg" },                        // KitKat 41.5g ✓
  "chocolate-bar-milka":    { file: "/uploads/7622202395956_103442928e.jpg" },                  // Milka 80-97g ✓
  "oreo":                   { file: "/uploads/7622210375742_20e2a61cc0.jpg" },                  // Oreo 228g ✓
  "nutella":                { file: "/uploads/7622201459826_6b61a6cfde.jpg", note: "Milka paste — Nutella stand-in" }, // [~]
  "crackers-rye":           { file: "/uploads/4870247058081_d678aa37fe.jpg", note: "Juzon crackers 150g" }, // [~]
  "jubilee-cookies":        { file: "/uploads/4780111072078_78e855beb6.jpg", note: "Kunde cookies 260g" }, // [~]
  "halva-sunflower":        { file: "/uploads/7622201695989_3c76c47a61.jpg", note: "WRONG TYPE: Alpen Gold spread — replace ASAP" }, // ✗
  "marmalade-fruit":        { file: "/uploads/8691216090439_19f9d693ab.jpg", note: "Haribo gummy bears 80g" }, // [~]
  "bounty":                 { file: "/uploads/4607065001445_1ea9f69896.jpg", note: "Snickers/Mars/Twix — Bounty stand-in (Mars family)" }, // [~]
  "tuc-crackers":           { file: "/uploads/4870247058081_d678aa37fe.jpg", note: "Juzon crackers — TUC stand-in" }, // [~]

  // ─── DAIRY ───────────────────────────────────────────────────────────────────
  "milk-25":           { file: "/uploads/4870002011238_e81c72c452.jpg" },                        // Molochny Mir 2.5% ✓
  "milk-32":           { file: "/uploads/4870002012839_88826eef04.jpg", note: "Adal 3.2% 925ml" }, // [~]
  "milk-ultra":        { file: "/uploads/4700040111846_36bee47e92.jpg", note: "Umut i Ko 3.2% 1L" }, // [~]
  "sour-cream-20":     { file: "/uploads/4870002012709_3f9d11b779.jpg" },                        // Molochny Mir 20% ✓
  "sour-cream-15":     { file: "/uploads/4870002012709_3f9d11b779.jpg", note: "Molochny Mir sour cream — 15% stand-in" }, // [~]
  "butter-725":        { file: "/uploads/4870002012372_fc2c56d95a.jpg" },                        // Molochny Mir 72.5% 180g ✓
  "butter-825":        { file: "/uploads/4870002012372_fc2c56d95a.jpg", note: "Molochny Mir butter — 82.5% stand-in" }, // [~]
  "kefir-25":          { file: "/uploads/4870002012754_45b6e99973.jpg" },                        // Molochny Mir kefir 2.5% ✓
  "kefir-1":           { file: "/uploads/4870002012754_45b6e99973.jpg", note: "Molochny Mir kefir — 1% stand-in" }, // [~]
  "yogurt-natural":    { file: "/uploads/4870206411711_23f8be4ccf.jpg", note: "Danone Activia 650g" }, // [~]
  "yogurt-berry":      { file: "/uploads/4605627008024_cb98382b4b.jpg", note: "Campina Nezhy Legky yogurt" }, // [~]
  "curd-snack":        { file: "/uploads/4600605028858_9021270a4e.jpg", note: "Prostokvashino snack 40g" }, // [~]
  "cheese-russian":    { file: "/uploads/4607168783040_bf074dec22.jpg", note: "Yugovsky Gollandsky 50% 300g" }, // [~]
  "cheese-gouda":      { file: "/uploads/2110126_f736547d92.jpg", note: "Lamber 50% kg — Gouda stand-in" }, // [~]
  "cheese-suluguni":   { file: "/uploads/2142765_413177df79.jpg", note: "Bay Chechilbay smoked — Suluguni stand-in" }, // [~]
  "cheese-cream":      { file: "/uploads/4870237156872_b395b817bc.jpg", note: "Vsyo v Dom creamy 50% 350g" }, // [~]
  "processed-cheese":  { file: "/uploads/4870237156872_b395b817bc.jpg", note: "Vsyo v Dom cheese — processed stand-in" }, // [~]

  // ─── EGGS ────────────────────────────────────────────────────────────────────
  "eggs-c1":   { file: "/uploads/4870237158753_6c2873dc63.jpg", note: "Lugovoye Pole 30pcs" }, // [~]
  "eggs-c0":   { file: "/uploads/4870237158753_6c2873dc63.jpg", note: "Lugovoye Pole 30pcs — C0 stand-in" }, // [~]
  "eggs-sv":   { file: "/uploads/4870237158753_6c2873dc63.jpg", note: "Lugovoye Pole — premium grade stand-in" }, // [~]

  // ─── FRUIT & VEG ─────────────────────────────────────────────────────────────
  "apples":    { file: "/uploads/2131237_763c3a74c0.jpg", note: "Apple Red Prince Poland" }, // [~]

  // ─── MEAT ────────────────────────────────────────────────────────────────────
  "chicken-fillet":       { file: "/uploads/2196453_b3836f2c5e.jpg" },                          // Alel chicken fillet ✓
  "sausage-doctor":       { file: "/uploads/4607958072682_e8bc39b533.jpg", note: "Papa Mozhet Doktorskaya 400g" }, // [~]
  "sausage-smoked":       { file: "/uploads/4607089698812_edb487f685.jpg", note: "Cherkiz Bogorodskaya 300g" }, // [~]
  "frankfurters":         { file: "/uploads/2130215_1cd9ed3140.jpg", note: "Papa Mozhet Juicy frankfurters kg" }, // [~]
  "ham-boiled":           { file: "/uploads/4607958074761_9ff05ea54b.jpg", note: "Ostankino fillet sausage 500g" }, // [~]
  "beef-ribs":            { file: "/uploads/2137915_0c2d7adece.jpg", note: "Beef brisket chilled — ribs stand-in" }, // [~]

  // ─── FISH (CANNED) ───────────────────────────────────────────────────────────
  "canned-tuna-oil":      { file: "/uploads/4870218890313_4016399d07.jpg" },                    // Natural tuna 185g ✓
  "canned-sardine":       { file: "/uploads/4605463006710_1129c63344.jpg", note: "Sprats Za Rodinu 270g — sardine stand-in" }, // [~]
  "crab-sticks":          { file: "/uploads/4870218890313_4016399d07.jpg", note: "Tuna — canned seafood stand-in" }, // [~]

  // ─── PANTRY ──────────────────────────────────────────────────────────────────
  "spaghetti-barilla":    { file: "/uploads/4601780009885_f392b85107.jpg", note: "Makfa pasta 400g — spaghetti stand-in" }, // [~]
  "penne-barilla":        { file: "/uploads/4601780009885_f392b85107.jpg", note: "Makfa pasta 400g — penne stand-in" }, // [~]
  "farfalle":             { file: "/uploads/4870091000700_004b301ff1.jpg", note: "Sultan pasta 400g — farfalle stand-in" }, // [~]
  "rice-long":            { file: "/uploads/4870201180452_453ba0a77c.jpg", note: "Arnau rice 3kg" }, // [~]
  "rice-basmati":         { file: "/uploads/4870201180452_453ba0a77c.jpg", note: "Arnau rice — basmati stand-in" }, // [~]
  "rice-round":           { file: "/uploads/4870201180452_453ba0a77c.jpg", note: "Arnau rice — round stand-in" }, // [~]
  "flour-premium":        { file: "/uploads/4870001400019_524e3a6496.jpg" },                    // Tsesna flour 2kg ✓
  "sugar-sand":           { file: "/uploads/4870237150122_8991663957.jpg", note: "Vsyo v Dom sugar 800g" }, // [~]
  "tomato-paste-pomidorka": { file: "/uploads/4870001080907_d5b602e343.jpg", note: "Tsin-Kaz 198g" }, // [~]
  "canned-peas-bonduelle": { file: "/uploads/5998304240022_630fcd3ad0.jpg", note: "Globus peas 425ml" }, // [~]
  "canned-corn-bonduelle": { file: "/uploads/5998304241111_e1bf0e22ce.jpg", note: "Globus corn 425ml" }, // [~]
  "canned-beans":         { file: "/uploads/3083680009508_2772cd5d0f.jpg" },                    // Bonduelle red beans 425ml ✓
  "mayo-provencal":       { file: "/uploads/4604248002725_fca300ed5d.jpg" },                    // Makheyev 770g ✓
  "mayo-light":           { file: "/uploads/4604248002725_fca300ed5d.jpg", note: "Makheyev — light mayo stand-in" }, // [~]

  // ─── FROZEN ──────────────────────────────────────────────────────────────────
  "pelmeni-beef":         { file: "/uploads/745314466165_c81df76e47.jpg" },                     // Meat to Eat 1kg ✓
  "pelmeni-pork":         { file: "/uploads/2115247_cbbf609c32.jpg", note: "Ansar Muslim pelmeni kg — pork stand-in" }, // [~]
  "pizza-pepperoni-fresh": { file: "/uploads/2453289_56a23878a8.jpg" },                         // Frozen pepperoni 600g ✓
  "pizza-frozen-margarita": { file: "/uploads/2453289_56a23878a8.jpg", note: "Frozen pizza — margarita stand-in" }, // [~]
  "ice-cream-vanilla":    { file: "/uploads/4870233463561_536bb07aa7.jpg", note: "Mishka na Polyuse 75g" }, // [~]
  "cheburek-meat":        { file: "/uploads/2479921_7d25673d3d.jpg", note: "Cheburek with chicken 150g" }, // [~]

  // ─── BREAD & BAKERY ──────────────────────────────────────────────────────────
  "croissant":            { file: "/uploads/2416084_c36e006673.jpg", note: "Croissant with condensed milk 70g" }, // [~]

  // ─── BABY FOOD ───────────────────────────────────────────────────────────────
  "baby-puree-apple-gerber": { file: "/uploads/4600338006574_96d645830c.jpg", note: "FrutoNyanya puree 90g" }, // [~]
  "baby-juice-agusha":       { file: "/uploads/4607096002985_5f567dab90.jpg" },                 // Agusha juice 200g ✓
  "baby-puree-pear":         { file: "/uploads/4600338006574_96d645830c.jpg", note: "FrutoNyanya — pear stand-in" }, // [~]
  "baby-puree-carrot":       { file: "/uploads/4600338008592_3276d4f20f.jpg", note: "FrutoNyanya fruit pieces 15g" }, // [~]

  // ─── ARBUZ.KZ — fresh produce, dairy, fish, meat ─────────────────────────
  // Full CDN URLs (arbuz.kz/image/s3/arbuz-kz-products/...)
  "potatoes":     { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__fc40a303-938c-4f80-8cd5-ebf4beb5c7bd-2000001_1_jpg.jpg",             note: "Картофель кг — arbuz.kz" },
  "bananas":      { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__b488f887-debc-495e-8698-9ddf01381fa6-2001001_jpg.jpg",               note: "Бананы, кг — arbuz.kz" },
  "cucumbers":    { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__4d35edfa-fe25-419f-95e9-4a8743d01c33-2066849_jpg.jpg",               note: "Огурцы Green Land Миринда, кг — arbuz.kz" },
  "oranges":      { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__4f7068e4-7f1f-4f9f-adfa-7e9399b2c68a-2066854_jpg.jpg",               note: "Апельсин Египет, кг — arbuz.kz" },
  "eggplant":     { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__6bc8dba7-4d2f-4aae-a637-0f839accc8b9-2011028_5_jpg.jpg",              note: "Баклажаны, кг — arbuz.kz" },
  "lemon":        { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__86ad4144-866c-44c4-a359-7b56e9eb9df5-img_7742_jpg.jpg",              note: "Лимон Узбекистан, кг — arbuz.kz" },
  "cherry":       { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__fcb177be-7454-429f-af25-d63ae641b851-269450_001_jpg.jpg",             note: "Черешня Суммит Arbuz Select кг — arbuz.kz" },
  "onions":       { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__53c49baa-0aff-4ed1-b97c-832844f4bb61-2066893_4_jpg.jpg",             note: "Лук репчатый молодой сетка, кг — arbuz.kz" },
  "bell-pepper":  { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__89f32aae-182f-4240-b914-52d20cf795e7-2079329_2_jpg.jpg",             note: "Микс перец Болгарский So Fresh, кг — arbuz.kz" },
  "avocado":      { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__949a2dbf-32ee-4265-8558-8c7dc4e13a17-234428_3_jpg.jpg",              note: "Авокадо Хасс, 2 шт — arbuz.kz" },
  "mushrooms":    { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__98dae6db-29a5-4476-9182-3ee939907ce0-img_7685_jpg.jpg",              note: "Грибы шампиньоны кг — arbuz.kz" },
  "mussels":      { file: "https://arbuz.kz/image/s3/arbuz-kz-products/234231-midii_ria_austral_dvustvorchatye_40_60_kg.jpg",                          note: "Мидии двустворчатые замороженные — arbuz.kz" },
  "red-caviar":   { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__e9184c1c-9d61-4276-87d3-7f7137dc56e7-shablon_jpg.jpg",               note: "Икра красная лососевая 95 г — arbuz.kz" },
  "salmon-lightly-salted": { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__c949bc0e-452d-435b-ad4a-b7640a28171d-2570846_jpg.jpg",      note: "Семга Jaqsi Fish слабосолёная, 100 г — arbuz.kz" },
  "cod-fillet":   { file: "https://arbuz.kz/image/s3/arbuz-kz-products/233100-file_treski_kingfisher_n_sh_kg.png",                                     note: "Филе трески Kingfisher замороженное — arbuz.kz" },
  "ryazhenka":    { file: "https://arbuz.kz/image/s3/arbuz-kz-products/image__239840-ryazhenka_dep_depovskaya_2_5_500_ml.jpg",                         note: "Ряженка Dep 2.5%, 500 мл — arbuz.kz" },
  "cheese-adygei":{ file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__be460043-88b2-4958-ad86-07619811d784-vybor-turlova_png.png",         note: "Сыр Ляззат адыгейский рассольный 45%, кг — arbuz.kz" },
  "beef-liver":   { file: "https://arbuz.kz/image/s3/arbuz-kz-products/7334a451-c3e0-4915-8f73-263e789b81e9-778_2_kopiya_18_png.png",                  note: "Говяжья печень Arbuz Select фермерская — arbuz.kz" },
  "chorizo":      { file: "https://arbuz.kz/image/s3/arbuz-kz-products/254226-kolbasa_pervomaiskie_delikatesy_chorizo_syrokopchenaya_narezka_200_g.png",note: "Колбаса Чоризо сырокопченая 200 г — arbuz.kz" },
  "cream-10":     { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__5242f132-6c7c-469c-91e0-2ba911af78db-172382-001_jpg.jpg",            note: "Сливки Adal 10% 0.95 л — arbuz.kz" },
  "cream-33":     { file: "https://arbuz.kz/image/s3/arbuz-kz-products/file_name__245f45db-54e8-40f6-84bd-46c4d8edc299-4660141573489_fresh_i_prochee_1_jpg.jpg", note: "Сливки Эконива Professional Line 33% — arbuz.kz" },
  "cottage-cheese-soft": { file: "https://arbuz.kz/image/s3/arbuz-kz-products/image__288379-tvorog_prostokvashino_myagkii_5_170_g.jpg",               note: "Творог Простоквашино мягкий 5%, 170 г — arbuz.kz" },
  "chicken-legs": { file: "https://arbuz.kz/image/s3/arbuz-kz-products/298335-golen_kurinaya_arbuz_select_0_9_kg.png",                                 note: "Голень куриная Arbuz Select 900 г — arbuz.kz" },
}

const MAGNUM_CDN = "https://magnum.kz:1337"

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function loadManifest(): Manifest {
  if (!fs.existsSync(SOURCES_FILE)) return {}
  return JSON.parse(fs.readFileSync(SOURCES_FILE, "utf-8"))
}

function saveManifest(m: Manifest): void {
  fs.writeFileSync(SOURCES_FILE, JSON.stringify(m, null, 2), "utf-8")
}

function loadProducts(): Product[] {
  const src   = fs.readFileSync(path.join(process.cwd(), "src", "data", "products.ts"), "utf-8")
  const out: Product[] = []
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
    if (line.includes("},") && cur.id && cur.title) { out.push(cur as Product); cur = {} }
  }
  return out
}

function onDisk(id: string): boolean {
  return fs.existsSync(path.join(PRODUCTS_DIR, `${id}.webp`))
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

async function downloadWithRetry(url: string, dest: string, retries = 3): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await downloadOnce(url, dest)
      return
    } catch (err) {
      if (attempt === retries) throw err
      const wait = attempt * 2000
      process.stdout.write(`  [retry ${attempt}/${retries} in ${wait/1000}s] `)
      await sleep(wait)
    }
  }
}

function downloadOnce(url: string, dest: string, timeoutMs = 25000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { reject(new Error("Download timeout")) }, timeoutMs)
    const file  = fs.createWriteStream(dest)

    function get(u: string, hops = 5): void {
      const mod = u.startsWith("https") ? https : http
      mod.get(u, { headers: { "User-Agent": "FoodService/1.0 image-fetcher" } }, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && hops > 0) {
          return get(res.headers.location, hops - 1)
        }
        if (res.statusCode !== 200) {
          clearTimeout(timer)
          file.close()
          reject(new Error(`HTTP ${res.statusCode}`))
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

async function toWebp(src: string, dest: string): Promise<boolean> {
  try {
    const meta = await sharp(src).metadata()
    if ((meta.width ?? 0) < 150 || (meta.height ?? 0) < 150) return false
    await sharp(src)
      .resize(600, 800, { fit: "contain", background: { r: 255, g: 255, b: 255 } })
      .webp({ quality: 90 })
      .toFile(dest)
    return true
  } catch {
    return false
  }
}

function saveCheckpoint(done: string[]): void {
  fs.writeFileSync(CHECKPOINT, JSON.stringify({ done, savedAt: new Date().toISOString() }), "utf-8")
}

function loadCheckpoint(): Set<string> {
  if (!fs.existsSync(CHECKPOINT)) return new Set()
  try {
    const { done } = JSON.parse(fs.readFileSync(CHECKPOINT, "utf-8"))
    return new Set(done as string[])
  } catch {
    return new Set()
  }
}

// ─── OPENFOODFACTS QUERY OVERRIDES ───────────────────────────────────────────
// Explicit English search queries for products where auto-translation fails.
// Format: productId → "exact English search string for OFf"
// When an override is present the first OFf result with a valid image is taken
// (no keyword-match required, since we control the query).

const OFf_QUERY_OVERRIDES: Record<string, string> = {

  // ─── MEAT & FISH ─────────────────────────────────────────────────────────────
  "chicken-legs":           "chicken drumsticks legs fresh",
  "chicken-thighs":         "chicken thighs fresh",
  "whole-chicken":          "whole chicken broiler",
  "pork-minced":            "minced pork ground",
  "turkey-fillet":          "turkey fillet breast",
  "chicken-liver":          "chicken liver fresh",
  "beef-liver":             "beef liver fresh",
  "chorizo":                "chorizo sausage dried cured",
  "carbonate":              "smoked pork loin carbonate",
  "salmon-lightly-salted":  "lightly salted salmon gravlax",
  "tiger-shrimp":           "tiger shrimp raw frozen",
  "cooked-shrimp":          "cooked shrimp peeled frozen",
  "mussels":                "mussels smoked canned",
  "red-caviar":             "salmon roe red caviar",
  "cod-fillet":             "cod fillet frozen",
  "pike-perch":             "pike perch zander fillet",
  "capelin-smoked":         "capelin smoked fish",
  "octopus-mini":           "baby octopus frozen seafood",
  "sea-cocktail":           "frozen seafood cocktail mix",

  // ─── DAIRY ───────────────────────────────────────────────────────────────────
  "cottage-cheese-soft":    "soft cottage cheese quark",
  "cheese-adygei":          "Adyghe cheese soft white",
  "cream-10":               "light cream 10 percent coffee",
  "cream-33":               "heavy whipping cream 33 percent",
  "cream-38":               "double cream 38 percent",
  "ryazhenka":              "ryazhenka baked fermented milk",
  "barista-milk":           "barista oat milk Oatly",

  // ─── FRESH PRODUCE ───────────────────────────────────────────────────────────
  "potatoes":               "potatoes bag fresh",
  "carrots":                "carrots fresh bag",
  "tomatoes":               "tomatoes fresh red",
  "cucumbers":              "cucumbers fresh",
  "bell-pepper":            "bell pepper red yellow",
  "eggplant":               "eggplant aubergine fresh",
  "bananas":                "bananas fresh yellow",
  "oranges":                "oranges fresh",
  "mandarins":              "mandarins clementines fresh",
  "pears":                  "pears fresh",
  "strawberry":             "strawberries fresh",
  "mushrooms":              "champignons mushrooms fresh",
  "beet":                   "beetroot beet fresh",
  "spinach":                "spinach fresh leaves",
  "pomegranate":            "pomegranate fresh",
  "lemon":                  "lemon fresh yellow",
  "zucchini":               "zucchini courgette fresh",
  "garlic":                 "garlic bulb fresh",

  // ─── BREAD & BAKERY ──────────────────────────────────────────────────────────
  "white-bread":            "white bread loaf sliced",
  "dark-bread":             "dark rye bread loaf",
  "whole-wheat-bread":      "whole wheat bread whole grain",
  "baton":                  "baton white bread roll",
  "baguette":               "baguette French bread",
  "samsa-meat":             "samsa meat pastry Central Asian",
  "samsa-potato":           "samsa potato pastry",
  "tandyr-bread":           "tandoor flatbread",
  "pirozhok":               "pirozhki baked stuffed bun",

  // ─── BEVERAGES ───────────────────────────────────────────────────────────────
  "kvass":                  "kvass kvas bread fermented drink",
  "tan":                    "tan ayran sparkling fermented milk drink",
  "pomegranate-juice":      "pomegranate juice 100 percent",
  "peach-nectar":           "peach nectar juice",
  "raspberry-morse":        "raspberry fruit drink mors",
  "water-premium":          "premium still mineral water glass bottle",
  "kombucha":               "kombucha raw organic fermented tea",
  "oat-drink":              "oat drink plant based",

  // ─── COFFEE & COCOA ──────────────────────────────────────────────────────────
  "coffee-arabica-ground":  "100 percent arabica ground coffee",
  "cocoa-jb":               "cocoa powder pure unsweetened",

  // ─── CONFECTIONERY & SNACKS ──────────────────────────────────────────────────
  "raffaello":              "Raffaello coconut white Ferrero",
  "candy-korovka":          "Korovka toffee milk candy",
  "zephyr-vanilla":         "zephyr marshmallow vanilla",
  "baklava":                "baklava honey nut pastry",
  "honey-gingerbread":      "honey gingerbread cookies",
  "creme-brulee-dessert":   "crème brûlée dessert cup",
  "lollipop-chupa":         "Chupa Chups lollipop",
  "popcorn-caramel":        "caramel popcorn snack",
  "raisins":                "raisins golden sultanas",
  "sunflower-seeds":        "roasted sunflower seeds",
  "pumpkin-seeds":          "pumpkin seeds roasted",
  "roasted-chickpea":       "roasted chickpeas snack",
  "dates":                  "Medjool dates dried fruit",
  "hazelnut-roasted":       "roasted hazelnuts shelled",

  // ─── PANTRY ──────────────────────────────────────────────────────────────────
  "oatmeal-hercules":       "rolled oats Hercules flakes",
  "olive-oil-ev":           "extra virgin olive oil cold pressed",
  "olive-oil-monini":       "Monini extra virgin olive oil",
  "strawberry-jam":         "strawberry jam confiture",
  "condensed-milk":         "sweetened condensed milk",
  "apple-vinegar":          "apple cider vinegar Heinz",
  "sunflower-seeds-oil":    "refined sunflower oil cooking",
  "margarine-baking":       "margarine baking butter substitute",
  "flaxseed-oil":           "flaxseed linseed oil cold pressed",
  "avocado-oil":            "avocado oil cold pressed",
  "walnut-oil":             "walnut oil cold pressed",
  "zira-cumin":             "cumin seeds whole",
  "oregano-dried":          "dried oregano Italian herbs",
  "wasabi-paste":           "wasabi paste S&B tube",
  "sushi-rice-koshi":       "koshihikari sushi rice Japanese",
  "unagi-sauce":            "unagi sauce eel teriyaki",

  // ─── SAUCES ──────────────────────────────────────────────────────────────────
  "tabasco":                "Tabasco original pepper sauce McIlhenny",
  "worcestershire-sauce":   "Lea Perrins Worcestershire sauce",
  "teriyaki-sauce":         "Kikkoman teriyaki sauce",
  "sesame-oil":             "sesame oil toasted dark",

  // ─── OILS & FATS ─────────────────────────────────────────────────────────────

  // ─── FROZEN ──────────────────────────────────────────────────────────────────
  "varenyky-potato":        "varenyky pierogi potato dumplings",
  "varenyky-cherry":        "varenyky cherry dumplings Ukrainian",
  "blini-cottage":          "blini crepes cottage cheese filled",
  "frozen-strawberry":      "frozen strawberries IQF",
  "frozen-blueberry":       "frozen blueberries IQF",
  "frozen-vegmix":          "frozen mixed vegetables carrots peas",
  "samsa-frozen":           "samsa frozen pastry meat",
  "pizza-dough-frozen":     "frozen pizza dough",

  // ─── READY FOOD ──────────────────────────────────────────────────────────────
  "sushi-set-japan":        "sushi set assorted Japanese",
  "rolls-california":       "California rolls sushi",
  "plov-ready":             "pilaf plov rice meat ready",
  "borsch-ready":           "borscht beetroot soup ready",
  "salad-olivie":           "Olivier salad Russian",
  "lagman-ready":           "lagman noodle soup",
  "hotdog-ready":           "hot dog sausage bun",
  "dolma-ready":            "dolma stuffed grape leaves",

  // ─── BABY FOOD ───────────────────────────────────────────────────────────────
  "baby-porridge-buckwheat":"Heinz baby buckwheat porridge cereal",
  "baby-porridge-oat":      "Heinz baby oat porridge cereal",
  "baby-formula-nan1":      "NAN 1 Nestlé infant formula",
  "baby-formula-nutrilon2": "Nutrilon 2 follow on milk formula",
  "baby-yogurt-agusha":     "Agusha baby yogurt",
  "baby-water":             "baby drinking water still",
  "baby-kefir-tema":        "Tema baby kefir",
  "baby-puree-tube":        "baby fruit puree squeeze pouch",

  // ─── HEALTHY / SPORTS ────────────────────────────────────────────────────────
  "protein-bar-rex":        "Rex protein bar chocolate",
  "chia-seeds":             "chia seeds organic",
  "almond-milk-tetrapak":   "almond milk unsweetened tetrapak",
  "spirulina-powder":       "spirulina powder organic green",

  // ─── HORECA PACKAGING (low priority — but OFf might have them) ───────────────
  "foil-food":              "aluminum foil kitchen roll",
  "cling-film":             "cling film food wrap",
  "parchment-paper":        "parchment paper baking",
  "trash-bags-20l":         "trash bags garbage bags 20L",
  "cups-paper-300ml":       "paper cups disposable 300ml",
  "cups-paper-400ml":       "paper cups disposable 400ml",
  "containers-500ml":       "plastic food containers 500ml",
  "containers-1000ml":      "plastic food containers 1000ml",
  "cutlery-set-pack":       "disposable plastic cutlery fork spoon set",
  "lids-for-cups":          "lids for paper cups",
  "pizza-boxes-30cm":       "pizza boxes cardboard 30cm",
}

// ─── OPENFOODFACTS ────────────────────────────────────────────────────────────

function normalizeRu(s: string): string {
  return s.toLowerCase()
    .replace(/«|»|"|"/g, "")
    .replace(/\d+(\.\d+)?\s*(г|кг|мл|л|шт|пак|уп|%)/gi, "")
    .replace(/\s+/g, " ").trim()
}

async function tryOpenFoodFacts(p: Product): Promise<{ url: string; name: string } | null> {
  const titleLower = p.title.toLowerCase()

  // ── Check explicit override first ───────────────────────────────────────────
  const hasOverride = Object.prototype.hasOwnProperty.call(OFf_QUERY_OVERRIDES, p.id)
  const overrideQuery = hasOverride ? OFf_QUERY_OVERRIDES[p.id] : null

  // ── Auto-build query from Russian title keywords ────────────────────────────
  const termMap: Record<string, string> = {
    "лосось": "salmon", "форель": "trout", "тунец": "tuna", "скумбрия": "mackerel",
    "минтай": "pollock", "сельдь": "herring", "креветки": "shrimp", "кальмар": "squid",
    "мидии": "mussels", "икра": "caviar", "крабовые палочки": "crab sticks",
    "курица": "chicken", "говядина": "beef", "свинина": "pork", "баранина": "lamb",
    "колбаса": "sausage", "сосиски": "frankfurters", "ветчина": "ham", "бекон": "bacon",
    "молоко": "milk", "кефир": "kefir", "йогурт": "yogurt", "сметана": "sour cream",
    "творог": "cottage cheese", "масло сливочное": "butter", "сыр": "cheese",
    "сливки": "cream", "мороженое": "ice cream",
    "яблоки": "apples", "апельсины": "oranges", "бананы": "bananas", "помидоры": "tomatoes",
    "огурцы": "cucumbers", "картофель": "potatoes", "морковь": "carrots", "лук": "onion",
    "капуста": "cabbage", "перец болгарский": "bell pepper", "авокадо": "avocado",
    "манго": "mango", "клубника": "strawberry", "черника": "blueberry",
    "шампиньоны": "mushrooms",
    "чипсы": "chips", "миндаль": "almonds", "кешью": "cashews", "арахис": "peanuts",
    "фисташки": "pistachios", "грецкие орехи": "walnuts", "семечки": "sunflower seeds",
    "гречка": "buckwheat", "рис": "rice", "макароны": "pasta", "мука": "flour",
    "сахар": "sugar", "мёд": "honey", "варенье": "jam", "сгущённое молоко": "condensed milk",
    "фасоль": "beans", "горошек": "peas", "кукуруза": "corn",
    "кофе": "coffee", "чай": "tea", "какао": "cocoa",
    "шоколад": "chocolate", "конфеты": "candy", "печенье": "cookies", "вафли": "waffles",
    "зефир": "marshmallow", "мармелад": "gummy", "пряники": "gingerbread",
    "майонез": "mayonnaise", "кетчуп": "ketchup", "горчица": "mustard",
    "соевый соус": "soy sauce", "перец": "pepper", "соль": "salt",
    "хлеб": "bread", "батон": "loaf", "лаваш": "lavash", "круассан": "croissant",
    "пельмени": "pelmeni dumplings", "вареники": "varenyky", "манты": "manti",
    "картофель фри": "french fries", "пицца": "pizza",
    "масло подсолнечное": "sunflower oil", "масло оливковое": "olive oil",
    "протеин": "protein", "гранола": "granola", "тофу": "tofu",
    "миндальное молоко": "almond milk", "овсяное молоко": "oat milk",
    "спирулина": "spirulina",
    "сок": "juice", "нектар": "nectar", "вода": "water", "квас": "kvass",
    "компот": "compote", "айран": "ayran",
  }

  const id = p.id.replace(/-/g, " ")
  let autoQuery = id
  for (const [ru, en] of Object.entries(termMap)) {
    if (titleLower.includes(ru)) { autoQuery = en + " " + p.id.split("-").slice(-1)[0]; break }
  }
  const brandMatch = p.title.match(/\b(Pringles|Lay['s]*|Haribo|Rafaello|Raffaello|Ferrero|Bounty|KitKat|Milka|Oreo|Nescafe|Jacobs|Nesquik|Heinz|Kikkoman|Tabasco|McCain|Chupa|Mentos|Evian|Monster|Sprite|Fanta)\b/i)
  if (brandMatch) autoQuery = brandMatch[1] + " " + id.split(" ").slice(-1)[0]

  const query = overrideQuery ?? autoQuery

  const url = `https://world.openfoodfacts.org/cgi/search.pl?${new URLSearchParams({
    search_terms: query.slice(0, 60),
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "8",
    fields: "product_name,brands,image_front_url,image_url",
  })}`

  const tmpFile = path.join(TMP_DIR, `off-${p.id}.json`)
  try {
    await downloadWithRetry(url, tmpFile, 2)
    const data = JSON.parse(fs.readFileSync(tmpFile, "utf-8"))
    fs.unlinkSync(tmpFile)

    for (const r of (data.products ?? [])) {
      const imgUrl = r.image_front_url ?? r.image_url
      if (!imgUrl || imgUrl.includes("thumb")) continue

      if (hasOverride) {
        // Explicit override: require at least the first meaningful word of the
        // override query to appear in the product name/brand (prevents gross mismatches
        // like "oranges fresh" → Tic Tac Orange candy).
        const firstWord = query.toLowerCase().split(" ").find(w => w.length > 3) ?? ""
        const rName2 = ((r.product_name ?? "") + " " + (r.brands ?? "")).toLowerCase()
        if (!firstWord || rName2.includes(firstWord)) {
          return { url: imgUrl, name: (r.product_name ?? r.brands ?? query).slice(0, 80) }
        }
        continue
      }

      // Auto query: require at least one keyword to appear in the product name
      const rName  = ((r.product_name ?? "") + " " + (r.brands ?? "")).toLowerCase()
      const qWords = query.toLowerCase().split(" ").filter(w => w.length > 3)
      if (qWords.some(w => rName.includes(w))) {
        return { url: imgUrl, name: (r.product_name ?? r.brands ?? query).slice(0, 80) }
      }
    }
  } catch {
    try { fs.unlinkSync(tmpFile) } catch {}
  }
  return null
}

// ─── CORE: PROCESS SINGLE PRODUCT ─────────────────────────────────────────────

async function processOne(
  p: Product,
  manifest: Manifest,
  modeOff: boolean,
  modeMagnum: boolean,
): Promise<"found_magnum" | "found_off" | "missing" | "skipped"> {

  // Skip if already on disk
  if (onDisk(p.id)) {
    if (!manifest[p.id]) {
      // Backfill manifest for orphan files
      manifest[p.id] = {
        status: "matched_unverified",
        source_type: "magnum_cdn",
        source_name: "Previously downloaded",
        local_path: `/products/${p.id}.webp`,
        fetched: new Date().toISOString().slice(0, 10),
      }
    }
    return "skipped"
  }

  const tmpFile = path.join(TMP_DIR, `${p.id}-src`)
  const outPath = path.join(PRODUCTS_DIR, `${p.id}.webp`)

  // ── SOURCE 1: Magnum/Arbuz explicit match ───────────────────────────────────
  if (!modeOff) {
    const match = MAGNUM_MATCHES[p.id]
    if (match) {
      // Support full URLs (arbuz.kz) and Magnum CDN path suffixes
      const srcUrl = match.file.startsWith("http") ? match.file : MAGNUM_CDN + match.file
      try {
        await downloadWithRetry(srcUrl, tmpFile, 3)
        const ok = await toWebp(tmpFile, outPath)
        try { fs.unlinkSync(tmpFile) } catch {}
        if (ok) {
          manifest[p.id] = {
            status: match.note?.includes("WRONG") ? "matched_unverified" : "matched_unverified",
            source_type: "magnum_cdn",
            source_name: match.note ?? "Magnum CDN explicit match",
            source_url:  srcUrl,
            local_path:  `/products/${p.id}.webp`,
            ...(match.note ? { note: match.note } : {}),
            fetched: new Date().toISOString().slice(0, 10),
          }
          return "found_magnum"
        }
      } catch {
        try { fs.unlinkSync(tmpFile) } catch {}
      }
    }
  }

  if (modeMagnum) return "missing"

  // ── SOURCE 2: OpenFoodFacts ──────────────────────────────────────────────────
  await sleep(500)
  const off = await tryOpenFoodFacts(p)
  if (off) {
    try {
      await downloadWithRetry(off.url, tmpFile, 3)
      const ok = await toWebp(tmpFile, outPath)
      try { fs.unlinkSync(tmpFile) } catch {}
      if (ok) {
        manifest[p.id] = {
          status: "matched_unverified",
          source_type: "openfoodfacts",
          source_name: off.name,
          source_url:  off.url,
          local_path:  `/products/${p.id}.webp`,
          fetched: new Date().toISOString().slice(0, 10),
        }
        return "found_off"
      }
    } catch {
      try { fs.unlinkSync(tmpFile) } catch {}
    }
  }

  // Mark as missing
  manifest[p.id] = {
    status: "missing",
    source_type: null,
    source_name: "Not found in Magnum or OpenFoodFacts",
    local_path: null,
    fetched: new Date().toISOString().slice(0, 10),
  }
  return "missing"
}

// ─── REPORT ───────────────────────────────────────────────────────────────────

function printReport(): void {
  const products = loadProducts()
  const manifest = loadManifest()
  const total  = products.length
  const onDiskCount = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith(".webp")).length
  const verified   = Object.values(manifest).filter(e => e.status === "real_verified").length
  const matched    = Object.values(manifest).filter(e => e.status === "matched_unverified").length
  const missing    = Object.values(manifest).filter(e => e.status === "missing").length
  const covered    = products.filter(p => onDisk(p.id)).length

  console.log(`\n  Image Coverage — ${new Date().toISOString().slice(0, 10)}`)
  console.log(`  ${"─".repeat(50)}`)
  console.log(`  Total products:       ${total}`)
  console.log(`  WebP files on disk:   ${onDiskCount}`)
  console.log(`  ✅ real_verified:      ${verified}`)
  console.log(`  🔶 matched_unverified: ${matched}`)
  console.log(`  ❌ missing:            ${missing}`)
  console.log(`  Coverage:             ${covered}/${total} (${Math.round(covered/total*100)}%)\n`)

  const byCat: Record<string, { total: number; covered: number }> = {}
  for (const p of products) {
    if (!byCat[p.category]) byCat[p.category] = { total: 0, covered: 0 }
    byCat[p.category].total++
    if (onDisk(p.id)) byCat[p.category].covered++
  }
  for (const [cat, { total: t, covered: c }] of Object.entries(byCat).sort((a, b) => b[1].total - a[1].total)) {
    const bar = "█".repeat(Math.round(c/t*10)) + "░".repeat(10 - Math.round(c/t*10))
    console.log(`  ${bar} ${cat.padEnd(28)} ${c}/${t}`)
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const args      = process.argv.slice(2)
  const doReport  = args.includes("--report")
  const modeMagnum = args.includes("--magnum")
  const modeOff   = args.includes("--off")
  const idFlag    = args.find(a => a.startsWith("--id="))?.slice(5) ?? ""
  const idFilter  = idFlag ? idFlag.split(",").map(s => s.trim()) : []

  if (doReport) { printReport(); return }

  const products = loadProducts()
  let manifest   = loadManifest()
  const checkpoint = loadCheckpoint()

  // Determine queue
  let queue: Product[]
  if (idFilter.length) {
    queue = products.filter(p => idFilter.includes(p.id))
  } else {
    // All products without existing disk files
    queue = products.filter(p => !onDisk(p.id) && !manifest[p.id]?.local_path)
  }

  const toProcess = queue.filter(p => !checkpoint.has(p.id))
  const skipped   = queue.length - toProcess.length

  console.log(`\n  Batch Image Fetcher`)
  console.log(`  Sources: ${modeOff ? "OpenFoodFacts only" : modeMagnum ? "Magnum CDN only" : "Magnum CDN → OpenFoodFacts"}`)
  console.log(`  Queue: ${toProcess.length} products  |  Already done: ${skipped + queue.filter(p => onDisk(p.id)).length}`)
  console.log(`  Checkpoint: every 10 products → ${CHECKPOINT}`)
  console.log(`  ${"─".repeat(55)}\n`)

  if (!toProcess.length) {
    console.log("  Nothing to fetch. Run --report to see coverage.")
    if (checkpoint.size > 0) {
      console.log(`  (Checkpoint has ${checkpoint.size} completed IDs — delete it to reprocess)`)
    }
    return
  }

  let foundMagnum = 0, foundOff = 0, notFound = 0, diskSkipped = 0
  const doneIds = [...checkpoint]

  const BATCH_SIZE = 10

  for (let i = 0; i < toProcess.length; i++) {
    const p   = toProcess[i]
    const pad = `[${String(i + 1).padStart(3)}/${toProcess.length}]`

    // Reload manifest each iteration so parallel batches don't overwrite
    manifest = loadManifest()

    process.stdout.write(`  ${pad} ${p.id.padEnd(35)} `)

    const result = await processOne(p, manifest, modeOff, modeMagnum)

    // Save manifest immediately after each product
    saveManifest(manifest)

    switch (result) {
      case "found_magnum": {
        const e = manifest[p.id]
        console.log(`✓ magnum  — ${(e?.source_name ?? "").slice(0, 40)}`)
        foundMagnum++
        break
      }
      case "found_off": {
        const e = manifest[p.id]
        console.log(`✓ off     — ${(e?.source_name ?? "").slice(0, 40)}`)
        foundOff++
        break
      }
      case "skipped":
        console.log(`○ on disk`)
        diskSkipped++
        break
      case "missing":
        console.log(`✗ not found`)
        notFound++
        break
    }

    doneIds.push(p.id)

    // Checkpoint every BATCH_SIZE products
    if ((i + 1) % BATCH_SIZE === 0) {
      saveCheckpoint(doneIds)
      console.log(`\n  ── checkpoint saved (${i + 1}/${toProcess.length} done) ──\n`)
    }

    await sleep(600)
  }

  // Final checkpoint
  saveCheckpoint(doneIds)
  try { fs.rmdirSync(TMP_DIR) } catch {}

  console.log(`\n  ${"─".repeat(55)}`)
  console.log(`  Magnum: ${foundMagnum}  OpenFoodFacts: ${foundOff}  Not found: ${notFound}  Skipped: ${diskSkipped}`)

  printReport()
}

main().catch(e => { console.error("\nFatal:", e.message); process.exit(1) })
