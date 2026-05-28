/**
 * B2C Product Image Generator — Food Service Kazakhstan
 *
 * Generates product images via DALL-E 3, converts to WebP via sharp,
 * and saves to public/products/.
 *
 * Usage:
 *   npx tsx scripts/generate-product-images.ts          # test batch (10 products)
 *   npx tsx scripts/generate-product-images.ts --all    # full P1 batch (~71 products)
 *   npx tsx scripts/generate-product-images.ts --id eggs-c1,tomatoes  # specific IDs
 *
 * Required env var (add to .env.local):
 *   OPENAI_API_KEY=sk-...
 *
 * Visual standard (07_image_strategy.md):
 *   - Dark #0A0A0A background, soft studio lighting
 *   - Real consumer packaging (NOT wholesale/catering sizes)
 *   - No "FOOD SERVICE KAZAKHSTAN" branding
 *   - Portrait 3:4 orientation (1024×1792 → resized to 600×800 WebP)
 *   - Reference: lays-chips.webp is the gold standard
 */

import OpenAI from "openai"
import * as fs from "fs"
import * as path from "path"
import * as https from "https"
import * as http from "http"
import sharp from "sharp"

// ─── ENV ──────────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

// ─── TYPES ────────────────────────────────────────────────────────────────────

type ImageEntry = {
  id:       string
  title:    string
  tier:     "A" | "B" | "C" | "D" | "E"
  prompt:   string
  filename: string
}

// ─── PRODUCT LIST ─────────────────────────────────────────────────────────────
//
// Tier A = real branded consumer products
// Tier B = generic packaged products
// Tier C = fresh produce
// Tier D = raw meat / fish in vacuum pack
// Tier E = ready food in sealed supermarket tray
//
// PHASE 0 — test batch (10 products, all tiers covered)
// PHASE 1 — P1 popular products

const PRODUCTS: ImageEntry[] = [
  // ─── PHASE 0: TEST BATCH ────────────────────────────────────────────────────
  {
    id: "eggs-c1",
    title: "Яйца куриные С1 (10шт)",
    tier: "B",
    filename: "eggs-c1.webp",
    prompt:
      "10 chicken eggs in an open cardboard egg carton, consumer retail packaging, " +
      "beige/brown cardboard carton with simple label, professional product photography, " +
      "dark charcoal background, soft studio lighting, product centered, photorealistic, " +
      "sharp focus on egg textures, no branding logos",
  },
  {
    id: "white-bread",
    title: "Хлеб белый нарезной (500г)",
    tier: "B",
    filename: "white-bread.webp",
    prompt:
      "Sliced white bread loaf in a clear plastic bag with paper label, " +
      "500g supermarket bread packaging, consumer retail format, " +
      "professional product photography, dark studio background, " +
      "soft front lighting, loaf visible through plastic, photorealistic, " +
      "no brand names or logos",
  },
  {
    id: "tomatoes",
    title: "Помидоры (1кг)",
    tier: "C",
    filename: "tomatoes.webp",
    prompt:
      "Fresh ripe red tomatoes in a plastic mesh net bag with a weight tag, " +
      "1 kilogram, supermarket produce packaging, bright red tomatoes, " +
      "professional product photography, dark charcoal background, " +
      "studio lighting, photorealistic, vibrant natural color, no brand logos",
  },
  {
    id: "butter-725",
    title: "Масло сливочное 72.5% (200г)",
    tier: "B",
    filename: "butter-725.webp",
    prompt:
      "Butter block wrapped in gold foil and white paper packaging, " +
      "consumer retail butter 200 grams, label reads Maslo Slivochnoye 72.5 percent, " +
      "professional product photography, dark studio background, " +
      "soft warm lighting, photorealistic, generic dairy packaging, " +
      "no brand logos",
  },
  {
    id: "ketchup-heinz",
    title: "Кетчуп Heinz томатный (570г)",
    tier: "A",
    filename: "ketchup-heinz.webp",
    prompt:
      "Heinz tomato ketchup 570g plastic squeeze bottle, " +
      "iconic red Heinz label with keystone logo, " +
      "consumer retail bottle, professional product photography, " +
      "dark studio background, soft studio lighting, photorealistic, " +
      "bottle centered upright, sharp label detail",
  },
  {
    id: "cola",
    title: "Кока-Кола 1.5л",
    tier: "A",
    filename: "cola.webp",
    prompt:
      "Coca-Cola 1.5 liter clear plastic PET bottle with red cap, " +
      "iconic Coca-Cola red label with white script logo and Cyrillic text, " +
      "consumer retail bottle, professional product photography, " +
      "dark studio background, soft studio lighting, photorealistic, " +
      "bottle centered, label facing forward, condensation on bottle surface",
  },
  {
    id: "buckwheat-uvelka",
    title: "Гречка ядрица Увелка (1кг)",
    tier: "A",
    filename: "buckwheat-uvelka.webp",
    prompt:
      "Uvelka buckwheat groats 1kg paper bag, " +
      "cream and beige paper packaging with green and orange Uvelka branding, " +
      "consumer retail grain bag, professional product photography, " +
      "dark studio background, soft studio lighting, photorealistic, " +
      "bag centered upright, brand label visible",
  },
  {
    id: "pelmeni-beef",
    title: "Пельмени Сибирские говяжьи (900г)",
    tier: "B",
    filename: "pelmeni-beef.webp",
    prompt:
      "Frozen Russian pelmeni dumplings in a rectangular cardboard box, " +
      "900 gram consumer retail packaging, blue and white box design, " +
      "Pelmeni Sibirskie label visible, frozen food category, " +
      "professional product photography, dark studio background, " +
      "soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "chicken-legs",
    title: "Куриные ножки (1кг)",
    tier: "D",
    filename: "chicken-legs.webp",
    prompt:
      "Raw chicken drumsticks in a clear plastic vacuum-sealed tray, " +
      "1 kilogram retail meat packaging, white polystyrene tray with transparent wrap, " +
      "simple weight label sticker, professional product photography, " +
      "dark studio background, soft cool lighting, photorealistic, " +
      "fresh raw chicken appearance, no artificial colors",
  },
  {
    id: "natural-honey",
    title: "Мёд цветочный натуральный (500г)",
    tier: "B",
    filename: "natural-honey.webp",
    prompt:
      "Clear glass jar of golden flower honey 500 grams, " +
      "simple paper label Med Tsvetochny Naturalny, " +
      "golden amber honey visible through glass, metallic lid, " +
      "professional product photography, dark studio background, " +
      "warm golden backlighting, photorealistic, glass jar centered, " +
      "honey glow from backlight, premium artisan look",
  },

  // ─── PHASE 1: P1 BATCH — Meat & Poultry ────────────────────────────────────
  {
    id: "chicken-fillet",
    title: "Куриное филе охлаждённое (1кг)",
    tier: "D",
    filename: "chicken-fillet.webp",
    prompt:
      "Fresh raw chicken breast fillet in clear vacuum-sealed retail packaging, " +
      "1kg polystyrene tray with transparent film wrap, weight label sticker, " +
      "professional product photography, dark studio background, " +
      "soft cool lighting, photorealistic, fresh pale pink chicken color",
  },
  {
    id: "chicken-thighs",
    title: "Куриные бёдра (1кг)",
    tier: "D",
    filename: "chicken-thighs.webp",
    prompt:
      "Raw chicken thighs in clear vacuum-sealed retail tray packaging, " +
      "1kg white polystyrene tray with transparent stretch wrap, weight label, " +
      "professional product photography, dark charcoal background, " +
      "soft studio lighting, photorealistic, fresh chicken appearance",
  },
  {
    id: "whole-chicken",
    title: "Курица целая охлаждённая (~1.6кг)",
    tier: "D",
    filename: "whole-chicken.webp",
    prompt:
      "Whole fresh raw broiler chicken in clear retail vacuum packaging, " +
      "white polystyrene tray with transparent film, weight label 1.5-1.8kg, " +
      "professional product photography, dark background, " +
      "soft cool lighting, photorealistic, clean pale skin appearance",
  },
  {
    id: "chicken-wings",
    title: "Куриные крылья (1кг)",
    tier: "D",
    filename: "chicken-wings.webp",
    prompt:
      "Raw chicken wings in clear plastic vacuum-sealed retail tray, " +
      "1 kilogram retail meat package, white polystyrene tray, transparent wrap, " +
      "weight label sticker, professional product photography, dark studio background, " +
      "soft cool lighting, photorealistic",
  },
  {
    id: "beef-tenderloin",
    title: "Говядина вырезка (~500г)",
    tier: "D",
    filename: "beef-tenderloin.webp",
    prompt:
      "Fresh beef tenderloin in clear vacuum-sealed retail packaging, " +
      "500g polystyrene tray with transparent film wrap, weight label, " +
      "deep red premium beef color, professional product photography, " +
      "dark studio background, soft lighting, photorealistic",
  },
  {
    id: "beef-minced",
    title: "Фарш говяжий (500г)",
    tier: "D",
    filename: "beef-minced.webp",
    prompt:
      "Ground beef minced meat in a clear plastic retail tray, " +
      "500g white polystyrene tray with transparent stretch wrap, weight label, " +
      "fresh red ground beef visible through packaging, " +
      "professional product photography, dark background, soft cool lighting, photorealistic",
  },
  {
    id: "pork-neck",
    title: "Свинина шея (~500г)",
    tier: "D",
    filename: "pork-neck.webp",
    prompt:
      "Fresh pork neck cut in clear vacuum-sealed retail packaging, " +
      "500g white polystyrene tray with transparent film, weight label, " +
      "pale pink pork meat with marbling visible, " +
      "professional product photography, dark studio background, soft lighting, photorealistic",
  },

  // ─── PHASE 1: Dairy ─────────────────────────────────────────────────────────
  {
    id: "milk-whole",
    title: "Молоко цельное 3.5% (1л)",
    tier: "B",
    filename: "milk-whole.webp",
    prompt:
      "1 liter milk carton, UHT whole milk 3.5 percent fat, " +
      "white and blue clean consumer packaging with cow illustration, " +
      "professional product photography, dark studio background, " +
      "soft front lighting, photorealistic, carton centered upright",
  },
  {
    id: "milk-25",
    title: "Молоко 2.5% (1л)",
    tier: "B",
    filename: "milk-25.webp",
    prompt:
      "1 liter milk carton, UHT milk 2.5 percent fat, " +
      "white and light blue consumer packaging, supermarket dairy format, " +
      "professional product photography, dark studio background, " +
      "soft front lighting, photorealistic, carton centered upright",
  },
  {
    id: "smetana",
    title: "Сметана 20% (400г)",
    tier: "B",
    filename: "smetana.webp",
    prompt:
      "Smetana sour cream 400g plastic cup with foil seal and snap lid, " +
      "generic white consumer dairy packaging, 20 percent fat label, " +
      "professional product photography, dark studio background, " +
      "soft lighting, photorealistic, cup centered upright",
  },
  {
    id: "butter-82",
    title: "Масло сливочное 82.5% (200г)",
    tier: "B",
    filename: "butter-82.webp",
    prompt:
      "Butter block 200 grams wrapped in gold foil with paper label, " +
      "consumer retail butter 82.5 percent fat, " +
      "professional product photography, dark studio background, " +
      "warm soft lighting, photorealistic, gold foil texture visible",
  },
  {
    id: "ryazhenka",
    title: "Ряженка 4% (500мл)",
    tier: "B",
    filename: "ryazhenka.webp",
    prompt:
      "Ryazhenka fermented baked milk 500ml plastic bottle, " +
      "beige and cream colored consumer dairy packaging, 4 percent fat, " +
      "professional product photography, dark studio background, " +
      "soft warm lighting, photorealistic, bottle centered upright",
  },
  {
    id: "kefir-25",
    title: "Кефир 2.5% (1л)",
    tier: "B",
    filename: "kefir-25.webp",
    prompt:
      "Kefir 1 liter plastic bottle or carton, 2.5 percent fat, " +
      "white consumer dairy packaging with blue accents, supermarket format, " +
      "professional product photography, dark studio background, " +
      "soft front lighting, photorealistic",
  },

  // ─── PHASE 1: Vegetables & Fruits ───────────────────────────────────────────
  {
    id: "potatoes",
    title: "Картофель (2кг)",
    tier: "C",
    filename: "potatoes.webp",
    prompt:
      "Fresh potatoes in a mesh net bag with weight tag, 2 kilograms, " +
      "supermarket produce packaging, clean yellow-brown potatoes, " +
      "professional product photography, dark charcoal background, " +
      "soft studio lighting, photorealistic, natural potato texture",
  },
  {
    id: "carrots",
    title: "Морковь (1кг)",
    tier: "C",
    filename: "carrots.webp",
    prompt:
      "Fresh orange carrots in a mesh net bag with weight label, 1 kilogram, " +
      "supermarket produce packaging, bright orange carrots with green tops trimmed, " +
      "professional product photography, dark background, " +
      "studio lighting, photorealistic, vibrant natural orange color",
  },
  {
    id: "cucumber",
    title: "Огурцы (1кг)",
    tier: "C",
    filename: "cucumber.webp",
    prompt:
      "Fresh green cucumbers loose or in a clear plastic bag, 1 kilogram, " +
      "supermarket produce format, bright fresh green cucumbers, " +
      "professional product photography, dark background, " +
      "soft studio lighting, photorealistic",
  },
  {
    id: "onion-white",
    title: "Лук репчатый (1кг)",
    tier: "C",
    filename: "onion-white.webp",
    prompt:
      "Yellow onions in a mesh net bag, 1 kilogram, " +
      "supermarket produce packaging with weight tag, golden paper-skin onions, " +
      "professional product photography, dark charcoal background, " +
      "soft studio lighting, photorealistic",
  },
  {
    id: "avocado",
    title: "Авокадо (1шт)",
    tier: "C",
    filename: "avocado.webp",
    prompt:
      "One ripe Hass avocado, dark bumpy skin, consumer single unit, " +
      "supermarket produce style, professional product photography, " +
      "dark charcoal background, soft studio lighting, photorealistic, " +
      "natural deep green-black color",
  },
  {
    id: "bananas",
    title: "Бананы (1кг)",
    tier: "C",
    filename: "bananas.webp",
    prompt:
      "Fresh yellow bananas bunch approximately 1 kilogram, " +
      "ripe yellow consumer supermarket bananas, " +
      "professional product photography, dark charcoal background, " +
      "soft studio lighting, photorealistic, vibrant yellow color",
  },
  {
    id: "apples-red",
    title: "Яблоки красные (1кг)",
    tier: "C",
    filename: "apples-red.webp",
    prompt:
      "Fresh red apples in a clear plastic bag with weight sticker, 1 kilogram, " +
      "supermarket produce packaging, bright red Fuji or Gala apples, " +
      "professional product photography, dark background, " +
      "soft studio lighting, photorealistic",
  },
  {
    id: "cabbage-white",
    title: "Капуста белокочанная (1шт)",
    tier: "C",
    filename: "cabbage-white.webp",
    prompt:
      "Fresh whole white cabbage head, consumer supermarket produce, " +
      "round pale green cabbage, professional product photography, " +
      "dark charcoal background, soft studio lighting, photorealistic",
  },

  // ─── PHASE 1: Bakery ────────────────────────────────────────────────────────
  {
    id: "dark-bread",
    title: "Хлеб ржаной (400г)",
    tier: "B",
    filename: "dark-bread.webp",
    prompt:
      "Dark rye bread loaf in a clear plastic bag with paper label, " +
      "400g consumer retail packaging, Russian rye bread style, " +
      "professional product photography, dark studio background, " +
      "soft front lighting, photorealistic, dark brown bread texture visible",
  },
  {
    id: "bread-baton",
    title: "Батон нарезной (400г)",
    tier: "B",
    filename: "bread-baton.webp",
    prompt:
      "Sliced white wheat baton bread in clear plastic bag, " +
      "400g consumer retail format, Russian baton loaf style, " +
      "professional product photography, dark studio background, " +
      "soft front lighting, photorealistic, soft white bread texture visible",
  },

  // ─── PHASE 1: Beverages ──────────────────────────────────────────────────────
  {
    id: "sparkling-water",
    title: "Вода газированная (1.5л)",
    tier: "A",
    filename: "sparkling-water.webp",
    prompt:
      "Bonaqua or similar sparkling mineral water 1.5 liter PET bottle, " +
      "clear plastic bottle with blue label, screw cap, " +
      "consumer retail bottle, professional product photography, " +
      "dark studio background, soft lighting, photorealistic, " +
      "condensation on bottle, bottle centered upright",
  },
  {
    id: "still-water",
    title: "Вода питьевая (1.5л)",
    tier: "A",
    filename: "still-water.webp",
    prompt:
      "Still drinking water 1.5 liter clear PET plastic bottle, " +
      "clean white and blue label, screw cap, consumer retail format, " +
      "professional product photography, dark studio background, " +
      "soft studio lighting, photorealistic, bottle centered upright",
  },
  {
    id: "orange-juice",
    title: "Сок апельсиновый (1л)",
    tier: "A",
    filename: "orange-juice.webp",
    prompt:
      "Orange juice 1 liter Tetra Pak carton, " +
      "J7 or similar consumer brand, orange packaging with orange slice graphics, " +
      "professional product photography, dark studio background, " +
      "soft warm lighting, photorealistic, carton centered upright",
  },
  {
    id: "pepsi",
    title: "Pepsi 1.5л",
    tier: "A",
    filename: "pepsi.webp",
    prompt:
      "Pepsi Cola 1.5 liter clear PET plastic bottle with blue cap, " +
      "iconic Pepsi blue red white label with Cyrillic text, " +
      "consumer retail bottle, professional product photography, " +
      "dark studio background, soft studio lighting, photorealistic, " +
      "bottle centered, label facing forward",
  },

  // ─── PHASE 1: Snacks ────────────────────────────────────────────────────────
  {
    id: "lays-sour-cream",
    title: "Чипсы Lay's Сметана (140г)",
    tier: "A",
    filename: "lays-sour-cream.webp",
    prompt:
      "Lay's potato chips 140g bag, sour cream and onion flavor, " +
      "yellow Lay's bag with Cyrillic text Smetana i Luk, " +
      "consumer retail snack bag, professional product photography, " +
      "dark studio background, soft studio lighting, photorealistic, " +
      "bag centered, label visible",
  },
  {
    id: "snickers",
    title: "Snickers (55г)",
    tier: "A",
    filename: "snickers.webp",
    prompt:
      "Snickers chocolate bar 55g standard size, " +
      "iconic brown and red Snickers wrapper with white logo, " +
      "consumer retail candy bar, professional product photography, " +
      "dark studio background, soft studio lighting, photorealistic, " +
      "bar centered, label facing forward",
  },
  {
    id: "milka-chocolate",
    title: "Шоколад Milka молочный (90г)",
    tier: "A",
    filename: "milka-chocolate.webp",
    prompt:
      "Milka milk chocolate 90g bar in purple packaging, " +
      "iconic purple Milka wrapper with cow logo and Cyrillic text, " +
      "consumer retail chocolate bar, professional product photography, " +
      "dark studio background, soft studio lighting, photorealistic, " +
      "bar centered, purple packaging visible",
  },

  // ─── PHASE 1: Pantry Staples ─────────────────────────────────────────────────
  {
    id: "sunflower-oil",
    title: "Масло подсолнечное (1л)",
    tier: "B",
    filename: "sunflower-oil.webp",
    prompt:
      "Sunflower oil 1 liter clear PET plastic bottle, " +
      "golden yellow cooking oil, simple consumer label with sunflower graphic, " +
      "professional product photography, dark studio background, " +
      "warm soft lighting, photorealistic, bottle centered upright, " +
      "golden oil color visible through clear bottle",
  },
  {
    id: "sugar-white",
    title: "Сахар белый (1кг)",
    tier: "B",
    filename: "sugar-white.webp",
    prompt:
      "White granulated sugar 1 kilogram paper bag with clear window, " +
      "consumer retail packaging, simple label Sakhar, " +
      "professional product photography, dark studio background, " +
      "soft front lighting, photorealistic, white paper bag centered upright",
  },
  {
    id: "salt-iodized",
    title: "Соль йодированная (1кг)",
    tier: "B",
    filename: "salt-iodized.webp",
    prompt:
      "Iodized table salt 1 kilogram paper package or carton box, " +
      "consumer retail salt packaging, blue and white label Sol Iodirovanaya, " +
      "professional product photography, dark studio background, " +
      "soft front lighting, photorealistic",
  },
  {
    id: "rice-long",
    title: "Рис длиннозернистый (1кг)",
    tier: "B",
    filename: "rice-long.webp",
    prompt:
      "Long grain white rice 1 kilogram paper bag or clear plastic bag, " +
      "consumer retail rice packaging with window showing rice grains, " +
      "professional product photography, dark studio background, " +
      "soft studio lighting, photorealistic",
  },
  {
    id: "pasta-spaghetti",
    title: "Спагетти (400г)",
    tier: "A",
    filename: "pasta-spaghetti.webp",
    prompt:
      "Barilla spaghetti 400g blue cardboard box, " +
      "iconic blue Barilla packaging with yellow logo, " +
      "consumer retail pasta box, professional product photography, " +
      "dark studio background, soft studio lighting, photorealistic, " +
      "box centered upright",
  },
  {
    id: "ketchup-classic",
    title: "Кетчуп томатный классический (500г)",
    tier: "B",
    filename: "ketchup-classic.webp",
    prompt:
      "Tomato ketchup 500g plastic squeeze bottle, " +
      "red generic consumer packaging with tomato graphic, " +
      "supermarket ketchup bottle, professional product photography, " +
      "dark studio background, soft studio lighting, photorealistic, " +
      "bottle centered upright",
  },
  {
    id: "mayo-provansale",
    title: "Майонез Провансаль (400мл)",
    tier: "B",
    filename: "mayo-provansale.webp",
    prompt:
      "Mayonnaise 400ml soft squeeze tube or jar, " +
      "white consumer packaging labeled Provansale, " +
      "professional product photography, dark studio background, " +
      "soft lighting, photorealistic, package centered upright",
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const mod  = url.startsWith("https") ? https : http
    mod.get(url, (res) => {
      res.pipe(file)
      file.on("finish", () => file.close(() => resolve()))
    }).on("error", (err) => {
      fs.unlink(dest, () => {})
      reject(err)
    })
  })
}

async function pngToWebp(pngPath: string, webpPath: string): Promise<void> {
  await sharp(pngPath)
    .resize(600, 800, { fit: "contain", background: { r: 10, g: 10, b: 10 } })
    .webp({ quality: 88 })
    .toFile(webpPath)
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error("❌  OPENAI_API_KEY not found. Add it to .env.local:\n   OPENAI_API_KEY=sk-...")
    process.exit(1)
  }

  const client = new OpenAI({ apiKey })
  const outDir  = path.join(process.cwd(), "public", "products")
  const tmpDir  = path.join(process.cwd(), ".next", "tmp-img-gen")
  fs.mkdirSync(tmpDir, { recursive: true })

  // ─── arg parsing ────────────────────────────────────────────────────────────
  const args     = process.argv.slice(2)
  const runAll   = args.includes("--all")
  const idArg    = args.find((a) => a.startsWith("--id="))?.slice(5)
               ?? (args.find((a) => !a.startsWith("--")) ?? "")
  const idFilter = idArg ? idArg.split(",").map((s) => s.trim()).filter(Boolean) : []

  const TEST_BATCH_IDS = new Set([
    "eggs-c1","white-bread","tomatoes","butter-725","ketchup-heinz",
    "cola","buckwheat-uvelka","pelmeni-beef","chicken-legs","natural-honey",
  ])

  let queue: ImageEntry[]
  if (idFilter.length > 0) {
    queue = PRODUCTS.filter((p) => idFilter.includes(p.id))
    if (queue.length === 0) {
      console.error(`❌  No products matched --id=${idFilter.join(",")}`)
      process.exit(1)
    }
  } else if (runAll) {
    queue = PRODUCTS
  } else {
    queue = PRODUCTS.filter((p) => TEST_BATCH_IDS.has(p.id))
  }

  // skip already-generated files
  const toGenerate = queue.filter((p) => !fs.existsSync(path.join(outDir, p.filename)))
  const skipped    = queue.length - toGenerate.length

  console.log(`\n🍅  Food Service — B2C Image Generator`)
  console.log(`   Model:    dall-e-3  |  Size: 1024×1792  |  Quality: standard`)
  console.log(`   Mode:     ${runAll ? "full P1 batch" : idFilter.length ? `--id filter` : "test batch (10)"}`)
  console.log(`   Queue:    ${toGenerate.length} to generate${skipped > 0 ? `, ${skipped} already exist (skipped)` : ""}`)
  console.log(`   Output:   public/products/\n`)

  if (toGenerate.length === 0) {
    console.log("✅  All images already exist. Run with --force to regenerate.")
    return
  }

  let ok = 0, fail = 0

  for (let i = 0; i < toGenerate.length; i++) {
    const item     = toGenerate[i]
    const pad      = `[${String(i + 1).padStart(2)}/${toGenerate.length}]`
    const webpPath = path.join(outDir, item.filename)
    const tmpPng   = path.join(tmpDir, `${item.id}.png`)

    process.stdout.write(`${pad} ${item.id} (Tier ${item.tier})  …  `)

    try {
      const response = await client.images.generate({
        model:   "dall-e-3",
        prompt:  item.prompt,
        size:    "1024x1792",
        quality: "standard",
        n:       1,
      })

      const url = response.data[0]?.url
      if (!url) throw new Error("No URL in response")

      await downloadFile(url, tmpPng)
      await pngToWebp(tmpPng, webpPath)
      fs.unlinkSync(tmpPng)

      console.log(`✓  ${item.filename}`)
      ok++
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`✗  FAILED — ${msg}`)
      fail++
    }

    // DALL-E 3 rate limit: 5 img/min on Tier 1, be safe with 13s gap
    if (i < toGenerate.length - 1) await sleep(13_000)
  }

  // cleanup tmp dir
  try { fs.rmdirSync(tmpDir) } catch {}

  console.log(`\n─────────────────────────────────────────`)
  console.log(`  Generated: ${ok}   Failed: ${fail}   Skipped: ${skipped}`)
  if (ok > 0) {
    console.log(`\n  ✅  Images saved to public/products/`)
    console.log(`  Next: add image: "/products/<filename>" to products.ts for each generated product`)
    console.log(`  Then re-seed Supabase: npx tsx scripts/seed-products.ts`)
  }
  if (fail > 0) {
    console.log(`\n  ⚠️   Some images failed. Re-run to retry (existing files are skipped).`)
  }
  console.log()
}

main().catch((err) => {
  console.error("\n❌  Fatal error:", err.message)
  process.exit(1)
})
