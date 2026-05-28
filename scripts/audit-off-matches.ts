/**
 * Quality audit for OpenFoodFacts image matches.
 * Removes images where the OFf result is clearly a wrong product type.
 *
 * Usage:
 *   npx tsx scripts/audit-off-matches.ts --dry-run   # show what would be removed
 *   npx tsx scripts/audit-off-matches.ts              # remove bad matches
 */

import * as fs   from "fs"
import * as path from "path"

const SOURCES_FILE  = path.join(process.cwd(), "docs", "catalog-audit", "image-sources.json")
const PRODUCTS_DIR  = path.join(process.cwd(), "public", "products")

type Entry = {
  status:      string
  source_type: string | null
  source_name: string
  local_path?: string | null
  note?:       string
}

// ─── REJECTION RULES ──────────────────────────────────────────────────────────
//
// For each product ID, specify keywords that would indicate a WRONG match.
// If source_name contains any of these keywords → reject.
//
// Format: productId → [...reject keywords]

const REJECT_KEYWORDS: Record<string, string[]> = {
  // Fresh produce — must show raw produce, not processed products containing it
  "potatoes":    ["chips", "crisps", "vodka", "soup", "puree"],
  "carrots":     ["cake", "juice", "baby food", "soup"],
  "onions":      ["sour cream", "onion rings", "chips", "crisps", "powder", "sauce"],
  "cabbage":     ["slaw", "coleslaw", "juice", "pickled", "soup"],
  "tomatoes":    ["sauce", "soup", "juice", "ketchup", "paste", "sun-dried"],
  "cucumbers":   ["pickled", "gherkin"],
  "bell-pepper": ["sauce", "soup", "stuffed", "powder"],
  "eggplant":    ["spread", "caviar"],
  "garlic":      ["powder", "herbs", "sauce", "seasoning", "garlic &", "& garlic"],
  "bananas":     ["juice", "chips", "candy", "flavor", "flavour", "yogurt", "bread"],
  "oranges":     ["juice", "drink", "candy", "flavor", "flavour"],
  "mandarins":   ["juice", "drink", "candy"],
  "grapes":      ["juice", "wine", "raisin", "nectar", "anti-ox"],
  "pears":       ["juice", "nectar", "baby"],
  "avocado":     ["oil spray", "oil spray", "guacamole", "sauce", "toast"],
  "mango":       ["juice", "drink", "candy", "chutney"],
  "pineapple":   ["juice", "drink", "candy", "upside"],
  "kiwi":        ["juice", "drink"],
  "strawberry":  ["jam", "yogurt", "candy", "ice cream", "cereal", "granola"],
  "lemon":       ["juice", "soda", "drink", "lemonade", "fanta", "tops", "candy"],
  "pomegranate": ["juice", "drink", "milk", "yogurt", "candy", "raspberry-pomegranate"],
  "cherry":      ["granola", "yogurt", "candy", "jam", "juice", "cranberry", "strawberry"],
  "dill":        ["sauce", "falafel", "seasoning", "cream", "moutarde", "senap"],
  "parsley":     ["falafel", "sauce", "seasoning", "mix", "dates"],
  "mushrooms":   ["soup", "sauce", "powder", "dried", "pizza"],
  "zucchini":    ["mix", "soup", "chips", "bulgur"],
  "beet":        ["juice", "chips", "salad", "pickled"],
  "blueberry":   ["muffin", "yogurt", "jam", "biscuit", "cereal", "musli", "muesli"],
  "spinach":     ["soup", "pasta", "powder", "mix"],

  // Meat — must not show processed/cooked products for raw meat IDs
  "carbonate":      ["bicarbonate", "baking soda", "soude", "de soude"],
  "turkey-fillet":  ["sea bass", "lemon pepper"],
  "chicken-liver":  ["pâté", "pate", "paté"],
  "beef-liver":     ["pâté", "pate", "paté"],
  "whole-chicken":  ["stock", "bouillon", "broth"],
  "chicken-thighs": ["isn't", "is not"],  // OFf returned literally "ISN'T CHICKEN THIGHS"

  // Seafood — reject seasoning/flavour products
  "tiger-shrimp":  ["flavour", "flavor", "seasoning", "crackers"],
  "cooked-shrimp": ["flavour", "flavor", "seasoning", "crackers"],
  "mussels":       ["soup", "sauce"],

  // Beverages — wrong variants
  "energy-monster": ["munch", "crisps", "chips"],  // Monster Munch ≠ Monster Energy
  "fanta":          ["tops lemon", "lemon 1.5"],    // Fanta should be orange flavour
  "lemon":          ["fanta", "tops"],

  // Dairy
  "cheesecake":     ["skyr", "yogurt", "yaourt"],   // Skyr yogurt ≠ cheesecake dessert
  "cream-10":       ["heavy", "whipped", "36%", "38%"],  // Heavy cream ≠ 10% drinking cream

  // Confectionery — wrong product types
  "caramel-candy":  ["tablette", "barre"],           // Chocolate bar ≠ caramel candy
  "granola-bar":    ["malt loaf", "soreen", "malt"], // Malt loaf ≠ granola bar
  "flax-seeds":     ["granola", "cereal", "bar", "bread"], // Granola/cereal ≠ plain flax seeds
  "goji-berries":   ["flaxseed", "seed mix", "sunflower", "pumpkin seed"], // Seed mix ≠ goji berries
  "cherry":         ["compote"],   // cherry compote is a cooked product, not fresh cherry

  // Frozen food — wrong types
  "blini-meat":          ["falafel", "pois chiches"],   // Falafel ≠ Russian blini
  "blini-cottage":       ["falafel", "pois chiches"],
  "french-fries-mccain": ["patate douce", "sweet potato"],  // Sweet potato fries ≠ McCain
  "ice-cream-chocolate": ["lollipop", "sorbet", "fruit"],   // Fruit lollipop ≠ chocolate ice cream
  "spring-rolls-frozen": ["falafel"],
  "frozen-broccoli":     ["buckwheat", "bulgur", "rice", "mix"],  // Mixed dish ≠ frozen broccoli
  "frozen-strawberry":   ["jam", "yogurt"],             // Processed ≠ frozen strawberries

  // Spices — must show actual spice package, not product using spice as ingredient
  "black-pepper-ground": ["chili", "olive oil", "peppers in", "tortilla"],
  "paprika-smoked":      ["tortilla", "lentil", "chip", "crisp", "popped"],
  "turmeric":            ["juice", "drink", "shot", "smoothie", "yogurt"],
  "curry-mix":           ["paste", "sauce", "ready meal", "tin"],
  "zira-cumin":          ["bread", "pastry", "cracker"],
  "bay-leaf":            ["tea", "drink", "salad", "peppery"],
  "vanilla-extract":     ["ice cream", "yogurt", "cereal", "protein"],

  // Sauces — wrong types
  "ketchup-hot":    ["vinegar", "chutney"],
  "mustard-dijon":  ["vinegar"],
  "hummus-classic": ["soup"],

  // Oils — must show actual oil bottle, not products made with oil
  "olive-oil-ev":     ["dressing", "spray"],
  "sesame-oil":       ["dressing", "paste", "tahini"],
  "corn-oil":         ["flakes", "cereal", "starch", "syrup"],
  "coconut-oil":      ["cream", "milk", "flakes", "shampoo"],
  "coconut-milk-tin": ["chocolate", "crepe", "crêpe", "candy", "ice cream"], // Must show actual coconut milk can
  "sunflower-oil-refined": ["seeds", "seed bar"],
  "walnut-oil":       ["walnuts", "mixed nuts"],
  "avocado-oil":      ["guacamole", "spray", "spray oil"],

  // Ready food — wrong types
  "borsch-ready":         ["powder", "seasoning"],
  "salad-olivie":         ["seasoning", "powder"],
  "burger-beef-fresh":    ["patty seasoning"],
  "shawarma-chicken":     ["seasoning", "powder"],

  // Baby — wrong types
  "baby-cereal-corn":       ["canned", "corn on", "vegetable"],  // Canned veg ≠ baby corn cereal
  "baby-formula-nan1":      ["adult", "protein"],
  "baby-formula-nutrilon2": ["adult", "protein"],
  "baby-porridge-rice-nestle": ["lion", "wild", "chocolate"],  // Lion chocolate cereal ≠ baby rice
  "baby-cereal-corn":       ["canned", "can ", "corn on"],     // Canned baby corn ≠ corn cereal
  "baby-cookies-gerber":    [],   // Arrowroot cookies → acceptable (Gerber baby cookies brand)

  // Ready food — other wrong types
  "pizza-margarita-fresh":  ["chorizo", "pepperoni", "chicken"],  // Meat pizza ≠ Margherita
  "lard-smoked":            ["rösti", "rosti", "bacon bits", "emmental"],  // Dish ≠ raw lard

  // Sushi/Japanese items — wrong types
  "unagi":             ["sauce", "sushi sauce"],  // Sauce ≠ smoked eel meat
  "ginger-marinated":  ["tofu", "miso"],          // Tofu ≠ marinated sushi ginger
  "chickpeas-dry":     ["shells", "pasta", "flour"],  // Chickpea pasta ≠ dry chickpeas

  // Drinks/syrups — wrong types
  "caramel-syrup":     ["coffee syrup", "coffee flavor"],  // Coffee syrup ≠ caramel syrup
}

// ─── ALWAYS REJECT product IDs that OFf cannot match well ────────────────────
// These categories never have useful OFf data for raw product images
const ALWAYS_REJECT_CATEGORIES = new Set([
  // Bulk fresh produce without barcodes — OFf only has packaged products
  "potatoes", "carrots", "onions", "cabbage", "bell-pepper", "eggplant",
  "garlic", "bananas", "oranges", "mandarins", "pears", "dill", "parsley",
  "mushrooms", "zucchini", "beet", "spinach", "tomatoes", "cucumbers",
  // Sets (composite products)
  "family-basket", "breakfast-set", "bbq-set", "sushi-kit", "coffee-set",
  "healthy-set", "baby-set", "cheese-wine-set", "baking-set", "plov-set",
  // HoReCa packaging (no consumer product images)
  "containers-500ml", "containers-1000ml", "pizza-boxes-30cm",
  "cups-paper-300ml", "cups-paper-400ml", "lids-for-cups",
  "cutlery-set-pack", "napkins-paper", "foil-food", "cling-film",
  "parchment-paper", "trash-bags-20l",
  // Products with no barcode or OFf coverage
  "carbonate",      // свинина карбонат — local unpackaged meat
  "chicken-liver",  // raw liver — no barcode
  "beef-liver",     // raw liver — no barcode
  "whole-chicken",  // fresh whole chicken — local
])

function shouldReject(id: string, entry: Entry): { reject: boolean; reason: string } {
  // Always reject certain categories
  if (ALWAYS_REJECT_CATEGORIES.has(id)) {
    return { reject: true, reason: `always-reject category` }
  }

  // Check reject keywords against source_name
  const nameLower = entry.source_name.toLowerCase()
  const keywords  = REJECT_KEYWORDS[id] ?? []
  for (const kw of keywords) {
    if (nameLower.includes(kw.toLowerCase())) {
      return { reject: true, reason: `source_name "${entry.source_name}" matches reject keyword "${kw}"` }
    }
  }

  return { reject: false, reason: "" }
}

function main() {
  const args   = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")

  const manifest: Record<string, Entry> = JSON.parse(fs.readFileSync(SOURCES_FILE, "utf-8"))

  const offEntries = Object.entries(manifest)
    .filter(([, e]) => e.source_type === "openfoodfacts")

  console.log(`\n  OFf Quality Audit — ${new Date().toISOString().slice(0, 10)}`)
  console.log(`  ${dryRun ? "[DRY RUN — no changes]" : "[LIVE — will delete files]"}`)
  console.log(`  OFf entries to audit: ${offEntries.length}`)
  console.log(`  ${"─".repeat(55)}\n`)

  let kept = 0, rejected = 0

  for (const [id, entry] of offEntries) {
    const { reject, reason } = shouldReject(id, entry)

    if (reject) {
      console.log(`  ✗ REJECT  ${id.padEnd(35)} ${entry.source_name.slice(0, 40)}`)
      console.log(`           reason: ${reason}`)

      if (!dryRun) {
        // Remove from manifest
        delete manifest[id]
        // Delete from disk
        const filePath = path.join(PRODUCTS_DIR, `${id}.webp`)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log(`           deleted: ${filePath}`)
        }
      }
      rejected++
    } else {
      console.log(`  ✓ KEEP    ${id.padEnd(35)} ${entry.source_name.slice(0, 40)}`)
      kept++
    }
  }

  if (!dryRun) {
    fs.writeFileSync(SOURCES_FILE, JSON.stringify(manifest, null, 2), "utf-8")
  }

  const diskFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith(".webp")).length

  console.log(`\n  ${"─".repeat(55)}`)
  console.log(`  Kept: ${kept}  |  Rejected: ${rejected}`)
  console.log(`  Files on disk after audit: ${dryRun ? `(dry run — unchanged)` : diskFiles}`)
  console.log(`  Manifest entries: ${Object.keys(manifest).length}\n`)
}

main()
