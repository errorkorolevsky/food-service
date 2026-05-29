/**
 * Scrapes product image URLs from arbuz.kz for fresh produce and other
 * items that OFf cannot find. Uses agent-browser CLI via child_process.
 *
 * Usage:
 *   npx tsx scripts/scrape-arbuz-images.ts
 *
 * Output: docs/catalog-audit/arbuz-matches.json
 *   { "potatoes": { url: "https://...", alt: "Картофель кг", note: "" }, ... }
 */

import { execSync } from "child_process"
import * as fs from "fs"
import * as path from "path"

const OUT_FILE = path.join(process.cwd(), "docs", "catalog-audit", "arbuz-matches.json")

// ─── SEARCH TARGETS ───────────────────────────────────────────────────────────
// Format: id → { query: Russian search term, mustInclude: words the alt MUST have,
//                mustExclude: words the alt must NOT have }

const TARGETS: Record<string, { query: string; mustInclude?: string[]; mustExclude?: string[] }> = {
  // Fresh produce
  "potatoes":     { query: "картофель", mustInclude: ["картофель"], mustExclude: ["мираторг", "вареники", "пирог", "чипс", "батат", "суп", "дольк"] },
  "onions":       { query: "лук репчатый", mustInclude: ["лук"], mustExclude: ["зелен", "порей", "маринов", "жарен", "гриль", "кольц", "пирог"] },
  "cabbage":      { query: "капуста белокочанная", mustInclude: ["капуст"], mustExclude: ["брокколи", "цветн", "брюссел", "маринов", "квашен", "салат"] },
  "cucumbers":    { query: "огурцы свежие", mustInclude: ["огурц"], mustExclude: ["маринов", "соленые", "пикул"] },
  "bell-pepper":  { query: "перец болгарский", mustInclude: ["перец"], mustExclude: ["молот", "чили", "острый", "соус", "фарш", "жарен"] },
  "eggplant":     { query: "баклажан", mustInclude: ["баклажан"], mustExclude: ["икра", "маринов", "запечен"] },
  "bananas":      { query: "бананы", mustInclude: ["банан"], mustExclude: ["чипс", "сок", "конфет", "сушен"] },
  "oranges":      { query: "апельсины", mustInclude: ["апельсин"], mustExclude: ["сок", "нектар", "мармел", "конфет"] },
  "grapes":       { query: "виноград", mustInclude: ["виноград"], mustExclude: ["сок", "изюм", "вино", "компот"] },
  "pears":        { query: "груши свежие", mustInclude: ["груш"], mustExclude: ["сок", "нектар", "компот", "варен", "детск"] },
  "avocado":      { query: "авокадо", mustInclude: ["авокадо"], mustExclude: ["гуакамол", "сок", "спред", "масл"] },
  "pineapple":    { query: "ананас", mustInclude: ["ананас"], mustExclude: ["сок", "конфет", "консерв", "кольц"] },
  "lemon":        { query: "лимон", mustInclude: ["лимон"], mustExclude: ["сок", "лимонад", "конфет", "чай", "уксус"] },
  "garlic":       { query: "чеснок", mustInclude: ["чеснок"], mustExclude: ["порошок", "гранул", "соус", "маринов"] },
  "mushrooms":    { query: "шампиньоны свежие", mustInclude: ["шампиньон"], mustExclude: ["суп", "соус", "замороженные", "маринов", "паста"] },
  "blueberry":    { query: "черника", mustInclude: ["черник"], mustExclude: ["варен", "джем", "йогурт", "морс"] },
  "cherry":       { query: "черешня", mustInclude: ["черешн"], mustExclude: ["варен", "джем", "йогурт", "компот"] },
  // Also try вишня as fallback for cherry
  "pomegranate":  { query: "гранат", mustInclude: ["гранат"], mustExclude: ["сок", "нектар", "морс", "мороженое"] },

  // Other missing items
  "mussels":           { query: "мидии", mustInclude: ["мидии"], mustExclude: ["суп"] },
  "salmon-lightly-salted": { query: "семга слабосоленая", mustInclude: ["семг"], mustExclude: ["стейк", "горбуш"] },
  "cream-10":          { query: "сливки 10%", mustInclude: ["сливк"], mustExclude: ["33%", "35%", "38%"] },
  "cream-33":          { query: "сливки 33%", mustInclude: ["сливк", "33"] },
  "ryazhenka":         { query: "ряженка", mustInclude: ["ряженк"] },
  "cottage-cheese-soft": { query: "творог мягкий", mustInclude: ["творог"], mustExclude: ["зерненый", "сырок"] },
  "chicken-legs":      { query: "куриные голени", mustInclude: ["голен"], mustExclude: ["копчен", "вареные", "готов"] },
  "cod-fillet":        { query: "треска филе", mustInclude: ["треск"], mustExclude: ["копчен", "соленая"] },
  "red-caviar":        { query: "икра красная лосося", mustInclude: ["икра"], mustExclude: ["черная", "минтай"] },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function ab(cmd: string): string {
  try {
    return execSync(`agent-browser ${cmd}`, { encoding: "utf-8", timeout: 20000 })
  } catch (e: unknown) {
    return ""
  }
}

function evalPage(js: string): string {
  const result = ab(`eval "${js.replace(/"/g, '\\"')}"`)
  const trimmed = result.trim()
  // agent-browser eval wraps the result in an outer JSON string
  try { return JSON.parse(trimmed) as string } catch { return trimmed }
}

function extractImages(): Array<{ url: string; alt: string }> {
  const raw = evalPage("JSON.stringify([...document.querySelectorAll('img')].filter(img=>img.src.includes('arbuz-kz-products')).map(img=>({url:img.src,alt:img.alt})))")
  try { return JSON.parse(raw) as Array<{ url: string; alt: string }> } catch { return [] }
}

function findBestImage(
  images: Array<{ url: string; alt: string }>,
  opts: { mustInclude?: string[]; mustExclude?: string[] }
): { url: string; alt: string } | null {
  const { mustInclude = [], mustExclude = [] } = opts
  for (const img of images) {
    const altL = img.alt.toLowerCase()
    const excluded = mustExclude.some(kw => altL.includes(kw.toLowerCase()))
    if (excluded) continue
    const included = mustInclude.length === 0 || mustInclude.some(kw => altL.includes(kw.toLowerCase()))
    if (included) return img
  }
  return null
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const results: Record<string, { url: string; alt: string; note: string }> = {}

  // Load existing results so we can resume
  if (fs.existsSync(OUT_FILE)) {
    const existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf-8"))
    Object.assign(results, existing)
  }

  console.log("\n  Arbuz.kz Image Scraper")
  console.log(`  Targets: ${Object.keys(TARGETS).length} products\n`)

  // Reuse open session or open a fresh one
  ab("open https://arbuz.kz")
  ab("wait --load networkidle")

  for (const [id, opts] of Object.entries(TARGETS)) {
    if (results[id]) {
      console.log(`  ○ ${id.padEnd(30)} (already found)`)
      continue
    }

    process.stdout.write(`  ? ${id.padEnd(30)} `)

    // Use JS to navigate via the search input — finds ref dynamically each time
    const escaped = opts.query.replace(/'/g, "\\'")
    ab(`eval "var inp = document.querySelector('input[type=text]') || document.querySelector('input[type=search]'); if(inp){inp.focus();inp.value='';}"`)
    // Find fresh input ref and fill it
    const snap = ab("snapshot -i -c")
    const inputRef = snap.match(/textbox[^\n]*\[ref=(e\d+)\]/)?.[1] ?? "e44"
    ab(`fill ${inputRef} "${opts.query}"`)
    ab("press Enter")
    ab("wait --load networkidle")

    // Some pages need a moment for JS to render product cards
    const images = extractImages()

    const best = findBestImage(images, opts)
    if (best) {
      // Strip size params — use base URL for downloading
      const cleanUrl = best.url.split("?")[0]
      results[id] = { url: cleanUrl, alt: best.alt, note: `arbuz.kz: ${best.alt}` }
      console.log(`✓  ${best.alt.slice(0, 50)}`)
    } else {
      console.log(`✗  not found (${images.length} images on page)`)
    }

    // Save after each product
    fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2))

    // Small delay between searches
    await new Promise(r => setTimeout(r, 800))
  }

  ab("close")

  console.log(`\n  ─────────────────────────────────────────────`)
  console.log(`  Found: ${Object.keys(results).length} products`)
  console.log(`  Saved: ${OUT_FILE}\n`)
  console.log("  Next: copy URLs into MAGNUM_MATCHES in scripts/batch-fetch-images.ts")
  console.log("        then run: npx tsx scripts/batch-fetch-images.ts --magnum\n")
}

main().catch(e => { console.error("Fatal:", e.message); process.exit(1) })
