#!/usr/bin/env node
/**
 * Food Service — Product Image Pipeline
 *
 * Usage:
 *   node scripts/image-pipeline.js audit          — show products without images
 *   node scripts/image-pipeline.js prompts        — generate AI prompt list (JSON)
 *   node scripts/image-pipeline.js assign <map>   — apply image assignments from JSON map
 *
 * Map JSON format: { "product-id": "/products/filename.webp", ... }
 */

const fs   = require("fs")
const path = require("path")

// ─── PARSE products.ts ────────────────────────────────────────────────────────

function parseProducts() {
  const src = fs.readFileSync(path.join(__dirname, "../src/data/products.ts"), "utf8")
  const products = []

  // Split on product object boundaries
  const entries = src.split(/(?=  \{[\s\n]+id: )/)
  for (const entry of entries) {
    const idM       = entry.match(/id:\s+"([^"]+)"/)
    const titleM    = entry.match(/title:\s+"([^"]+)"/)
    const categoryM = entry.match(/category:\s+"([^"]+)"/)
    const imageM    = entry.match(/image:\s+"([^"]+)"/)
    const emojiM    = entry.match(/emoji:\s+"([^"]+)"/)
    const descM     = entry.match(/description:\s+"([^"]+)"/)

    if (!idM || !titleM) continue
    products.push({
      id:       idM[1],
      title:    titleM[1],
      category: categoryM?.[1] ?? "",
      emoji:    emojiM?.[1]    ?? "",
      desc:     descM?.[1]     ?? "",
      image:    imageM?.[1]    ?? null,
    })
  }
  return products
}

// ─── CATEGORY → visual style hint ────────────────────────────────────────────

const CATEGORY_HINTS = {
  "Мясо и птица":          "fresh raw meat cut on white background, professional food photography",
  "Рыба и морепродукты":   "fresh seafood on ice, professional food photography",
  "Молочные продукты":     "dairy product packaging on white background, clean studio shot",
  "Овощи и фрукты":        "fresh produce on white background, natural lighting",
  "Хлеб и выпечка":        "fresh baked goods on wooden board, warm lighting",
  "Бакалея":               "grocery product in branded packaging, clean studio shot",
  "Соусы и специи":        "sauce or spice bottle/jar on white background, product photography",
  "Напитки":               "beverage in glass or bottle, clean studio shot",
  "Кондитерские изделия":  "confectionery product on white background, food photography",
  "Заморозка":             "frozen food package on white background, studio lighting",
  "Снеки":                 "snack product in packaging on white background",
  "Кофе, чай и какао":     "coffee or tea product on minimal background, cozy lighting",
  "Здоровое питание":      "healthy food product on clean white background",
  "Детское питание":       "children's food product in colorful packaging",
  "Готовая еда":           "prepared food dish on plate, professional food photography",
  "HoReCa":                "professional catering product, clean studio shot",
}

// ─── COMMANDS ─────────────────────────────────────────────────────────────────

const [,, cmd, arg] = process.argv

if (cmd === "audit" || !cmd) {
  const products = parseProducts()
  const noImg    = products.filter(p => !p.image)
  const withImg  = products.filter(p =>  p.image)

  console.log(`\n📊 Image Coverage`)
  console.log(`  Total products : ${products.length}`)
  console.log(`  With images    : ${withImg.length} (${Math.round(withImg.length / products.length * 100)}%)`)
  console.log(`  Without images : ${noImg.length}`)

  const byCat = {}
  noImg.forEach(p => { byCat[p.category] = (byCat[p.category] ?? 0) + 1 })
  console.log("\n📁 Missing by category:")
  Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([cat, n]) => {
    console.log(`  ${String(n).padStart(3)}  ${cat}`)
  })

  console.log("\n🔍 First 20 products without images:")
  noImg.slice(0, 20).forEach(p => console.log(`  ${p.id.padEnd(32)} ${p.emoji} ${p.title}`))
}

else if (cmd === "prompts") {
  const products  = parseProducts()
  const noImg     = products.filter(p => !p.image)
  const prompts   = noImg.map(p => ({
    id:       p.id,
    title:    p.title,
    category: p.category,
    filename: `/products/${p.id}.webp`,
    prompt:   `${p.title}, ${CATEGORY_HINTS[p.category] ?? "grocery product, studio photography"}, high quality, sharp, realistic`,
    negPrompt: "text, watermark, logo, cartoon, illustration, painting, drawing, unrealistic",
  }))

  const outPath = path.join(__dirname, "../scripts/image-prompts.json")
  fs.writeFileSync(outPath, JSON.stringify(prompts, null, 2), "utf8")
  console.log(`✅ Generated ${prompts.length} prompts → scripts/image-prompts.json`)
  console.log(`   Use with: DALL-E 3, Stable Diffusion, Midjourney, or any image generation API`)
}

else if (cmd === "assign") {
  if (!arg) { console.error("Usage: node image-pipeline.js assign <map.json>"); process.exit(1) }
  const map      = JSON.parse(fs.readFileSync(arg, "utf8"))
  const srcPath  = path.join(__dirname, "../src/data/products.ts")
  let   src      = fs.readFileSync(srcPath, "utf8")
  let   assigned = 0

  for (const [id, imgPath] of Object.entries(map)) {
    // Match product block that has this id but NO image yet
    const pattern = new RegExp(
      `(  \\{[^}]*?id: "${id}"[^}]*?)((?:,\\s*\\n\\s*)(category:))`,
      "s"
    )
    if (pattern.test(src) && !src.match(new RegExp(`id: "${id}"[^}]*?image:`))) {
      src = src.replace(
        new RegExp(`(  \\{[^\\}]*?id: "${id}", emoji: "[^"]+")`, "s"),
        `$1, image: "${imgPath}"`
      )
      assigned++
      console.log(`  ✅ ${id} → ${imgPath}`)
    } else {
      console.log(`  ⏭  ${id} — already has image or not found`)
    }
  }

  fs.writeFileSync(srcPath, src, "utf8")
  console.log(`\n✅ Assigned ${assigned} images`)
}

else {
  console.log("Commands: audit | prompts | assign <map.json>")
}
