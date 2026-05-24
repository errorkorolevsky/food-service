// One-shot: converts all public/products/*.png to WebP (quality 82, effort 4)
// Run: node scripts/convert-images.js
const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const DIR = path.join(__dirname, "../public/products")

async function main() {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".png"))
  console.log(`Found ${files.length} PNG files. Converting...`)

  let ok = 0, skip = 0, fail = 0

  for (const file of files) {
    const src = path.join(DIR, file)
    const dest = path.join(DIR, file.replace(/\.png$/, ".webp"))

    if (fs.existsSync(dest)) {
      skip++
      continue
    }

    try {
      await sharp(src)
        .webp({ quality: 82, effort: 4 })
        .toFile(dest)
      const srcSize  = fs.statSync(src).size
      const destSize = fs.statSync(dest).size
      const pct = Math.round((1 - destSize / srcSize) * 100)
      console.log(`  ✓ ${file} → ${file.replace(".png", ".webp")}  (${pct}% smaller)`)
      ok++
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`)
      fail++
    }
  }

  console.log(`\nDone: ${ok} converted, ${skip} skipped (already exist), ${fail} failed`)
}

main()
