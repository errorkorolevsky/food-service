/**
 * Applies semantic audit decisions to src/data/products.ts:
 *
 * 1. Removes image field from products with confirmed mismatches (rejected)
 * 2. Removes image field from duplicate image assignments (secondary copies)
 * 3. Sets imageStatus on products based on audit findings
 * 4. Adds "verified_exact" / "verified_generic" to confirmed-correct products
 *
 * Usage:
 *   npx tsx scripts/apply-image-audit.ts --dry-run   # preview only
 *   npx tsx scripts/apply-image-audit.ts              # apply changes
 */

import * as fs   from "fs"
import * as path from "path"

const PRODUCTS_FILE = path.join(process.cwd(), "src", "data", "products.ts")
const DRY_RUN       = process.argv.includes("--dry-run")

// ─── AUDIT DECISIONS ─────────────────────────────────────────────────────────
//
// Derived from full manifest analysis of image-sources.json.
// Each entry: [productId, action, imageStatus, reason]

type Decision =
  | { id: string; action: "remove"; imageStatus: "rejected"; reason: string }
  | { id: string; action: "remove_duplicate"; imageStatus: "rejected"; reason: string }
  | { id: string; action: "set_status"; imageStatus: string; reason: string }

const DECISIONS: Decision[] = [

  // ─── CRITICAL BRAND MISMATCHES — image removed ───────────────────────────

  { id: "cola",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Pepsi Cola 1L (source: 'Напиток PEPSI COLA газ 1L') — product is Coca-Cola" },

  { id: "nutella",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Milka hazelnut paste — product is Nutella (different brand)" },

  { id: "halva-sunflower",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Alpen Gold chocolate spread — product is sunflower halva (wrong type and brand)" },

  { id: "coffee-beans-lavazza",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Jacobs Monarch 95g — product is Lavazza coffee beans (wrong brand)" },

  { id: "coffee-3in1",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Jacobs Monarch ground coffee — product is 3-in-1 sachets (wrong type and same wrong-brand image as coffee-beans-lavazza)" },

  { id: "crab-sticks",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows canned tuna (tuna stand-in) — product is Vici crab sticks (completely wrong product)" },

  { id: "tomato-juice",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Da-Da green apple juice — product is tomato juice (completely wrong product)" },

  { id: "spaghetti-barilla",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Makfa penne 400g — wrong brand (Barilla) and wrong pasta shape (penne ≠ spaghetti)" },

  { id: "canned-peas-bonduelle",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Globus peas — product title says Bonduelle (wrong brand)" },

  { id: "canned-corn-bonduelle",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Globus corn — product title says Bonduelle (wrong brand)" },

  { id: "cheese-cream",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Vsyo v Dom creamy 50% — product is Philadelphia cream cheese (wrong brand)" },

  { id: "processed-cheese",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Vsyo v Dom — identical image to cheese-cream, product is Президент processed cheese (wrong brand + duplicate)" },

  { id: "baby-puree-apple-gerber",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows FrutoNyanya 90g — product is Gerber apple puree (wrong brand)" },

  { id: "baby-puree-pear",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows FrutoNyanya pear stand-in — product is Gerber (wrong brand)" },

  { id: "baby-puree-carrot",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows FrutoNyanya fruit pieces 15g — product is Gerber carrot puree (wrong brand and form)" },

  { id: "granola-honey",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows a honey jar — product is honey granola (completely wrong product, same URL as natural-honey)" },

  { id: "millet",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows bread with millet (Maestro Cereale bread) — product is millet grain" },

  { id: "tuna-steak",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Calvo canned tuna in oil — product is fresh tuna steak (wrong product form)" },

  { id: "pollock-fillet",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows OMEGA3 Breaded Alaska Pollock Fish Fingers — product is raw pollock fillet (wrong product form)" },

  { id: "black-tea-akbar",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Bayce tea brand — product is Akbar tea (wrong brand)" },

  { id: "green-tea-greenfield",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Tess tea — product is Greenfield green tea (wrong brand)" },

  { id: "cheese-russian",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Yugovsky Голlandsky (Dutch cheese) — product is Российский cheese (wrong variety)" },

  { id: "cottage-cheese-soft",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Простоквашино мягкий — product title says President brand (wrong brand)" },

  { id: "ham-boiled",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Ostankino fillet sausage — product is boiled ham (wrong product type)" },

  { id: "frozen-raspberries",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows raspberries in white & dark chocolate — product is plain frozen raspberries" },

  { id: "bounty",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Snickers/Mars/Twix group promo — product is Bounty (wrong product, brand not shown)" },

  // ─── DUPLICATE IMAGES — secondary removed ────────────────────────────────

  { id: "eggs-c0",
    action: "remove_duplicate", imageStatus: "rejected",
    reason: "Same image as eggs-c1 (Луговое Поле 30pcs). C0 and C1 are different grades and need distinct photos." },

  { id: "eggs-sv",
    action: "remove_duplicate", imageStatus: "rejected",
    reason: "Same image as eggs-c1 (same barcode). СВ grade needs its own photo." },

  { id: "kefir-1",
    action: "remove_duplicate", imageStatus: "rejected",
    reason: "Same URL as kefir-25. 1% and 2.5% products cannot share a photo." },

  { id: "sour-cream-15",
    action: "remove_duplicate", imageStatus: "rejected",
    reason: "Same URL as sour-cream-20. 15% and 20% products cannot share a photo." },

  { id: "butter-825",
    action: "remove_duplicate", imageStatus: "rejected",
    reason: "Same URL as butter-725. 72.5% and 82.5% products cannot share a photo." },

  { id: "multifruit-juice",
    action: "remove_duplicate", imageStatus: "rejected",
    reason: "Same URL as apple-juice. Different juice flavours cannot share a photo." },

  { id: "rice-basmati",
    action: "remove_duplicate", imageStatus: "rejected",
    reason: "Same image as rice-long (Arnau). Basmati and long rice must have distinct photos." },

  { id: "rice-round",
    action: "remove_duplicate", imageStatus: "rejected",
    reason: "Same image as rice-long (Arnau). Round rice must have a distinct photo." },

  { id: "ginger-tea",
    action: "remove_duplicate", imageStatus: "rejected",
    reason: "Same Tess image as earl-grey and herbal-tea. Four tea variants cannot share one photo." },

  { id: "herbal-tea",
    action: "remove_duplicate", imageStatus: "rejected",
    reason: "Same Tess image used for green-tea, earl-grey, ginger-tea. Must have unique photo." },

  { id: "carrots",
    action: "remove", imageStatus: "rejected",
    reason: "Image shows Steam Bags Carrots/Peas/Sweetcorn mix — product is raw carrots" },

  // ─── KEEP but mark needs_review ──────────────────────────────────────────

  { id: "yogurt-natural",
    action: "set_status", imageStatus: "needs_review",
    reason: "Shows Activia питьевой (drinking bottle) but product is Активиа стакан 260г (cup format)" },

  { id: "earl-grey",
    action: "set_status", imageStatus: "needs_review",
    reason: "Tess makes Earl Grey tea, brand is plausible but not exact match; same image used for other teas" },

  { id: "hot-chocolate",
    action: "set_status", imageStatus: "needs_review",
    reason: "Shows Nesquik (hot cocoa brand) — product 'Горячий шоколад' has no specific brand; plausible but needs confirmation" },

  { id: "snickers",
    action: "set_status", imageStatus: "needs_review",
    reason: "Shows Snickers+Mars+Twix group promo — Snickers is in the image but not isolated" },

  { id: "baby-formula-nan1",
    action: "set_status", imageStatus: "needs_review",
    reason: "Shows NAN ET2 — product is NAN 1 (different stage)" },

  // ─── CONFIRMED CORRECT — verified_exact ──────────────────────────────────

  { id: "energy-redbull",   action: "set_status", imageStatus: "verified_exact",   reason: "Red Bull 250ml — exact brand+product match" },
  { id: "coffee-ground-jacobs", action: "set_status", imageStatus: "verified_exact", reason: "Jacobs Gold 190g — exact brand match" },
  { id: "coffee-instant-nescafe", action: "set_status", imageStatus: "verified_exact", reason: "Nescafe Gold 320g — exact brand match" },
  { id: "cacao-nesquik",    action: "set_status", imageStatus: "verified_exact",   reason: "Nesquik 400g — exact brand match" },
  { id: "kitkat",           action: "set_status", imageStatus: "verified_exact",   reason: "KitKat 41.5g — exact brand match" },
  { id: "oreo",             action: "set_status", imageStatus: "verified_exact",   reason: "Oreo 228g — exact brand match" },
  { id: "chocolate-bar-milka", action: "set_status", imageStatus: "verified_exact", reason: "Milka 80-97g — exact brand match" },
  { id: "lays-chips",       action: "set_status", imageStatus: "verified_exact",   reason: "Lays classic original — exact brand match" },
  { id: "lays-classic",     action: "set_status", imageStatus: "verified_exact",   reason: "Lays classic — exact brand match" },
  { id: "lays-paprika",     action: "set_status", imageStatus: "verified_exact",   reason: "Lays paprika — exact brand match" },
  { id: "pepsi",            action: "set_status", imageStatus: "verified_exact",   reason: "Pepsi 2L — exact brand match" },
  { id: "sprite",           action: "set_status", imageStatus: "verified_exact",   reason: "Sprite — exact brand match" },
  { id: "cola-zero",        action: "set_status", imageStatus: "verified_exact",   reason: "Coca-Cola Zero Sugar — exact brand match" },
  { id: "pringles-original",action: "set_status", imageStatus: "verified_exact",   reason: "Pringles Original — exact brand match" },
  { id: "raffaello",        action: "set_status", imageStatus: "verified_exact",   reason: "Raffaello — exact brand match" },
  { id: "ferrero-rocher",   action: "set_status", imageStatus: "verified_exact",   reason: "Ferrero Rocher — exact brand match" },
  { id: "lollipop-chupa",   action: "set_status", imageStatus: "verified_exact",   reason: "Chupa Chups — exact brand match" },
  { id: "rye-cakes-finn-crisp", action: "set_status", imageStatus: "verified_exact", reason: "Finn Crisp — exact brand match" },
  { id: "oat-milk-oatly",   action: "set_status", imageStatus: "verified_exact",   reason: "Oatly Barista — exact brand match" },

  // ─── CONFIRMED CORRECT — verified_generic ────────────────────────────────

  { id: "chicken-fillet",     action: "set_status", imageStatus: "verified_generic", reason: "Generic chicken fillet, KZ brand Алель — correct product" },
  { id: "chicken-legs",       action: "set_status", imageStatus: "verified_generic", reason: "Chicken legs Arbuz Select — correct product" },
  { id: "chicken-wings",      action: "set_status", imageStatus: "verified_generic", reason: "Chicken wings — correct product" },
  { id: "beef-minced",        action: "set_status", imageStatus: "verified_generic", reason: "Beef mince — correct product" },
  { id: "pork-minced",        action: "set_status", imageStatus: "verified_generic", reason: "Minced pork — correct product" },
  { id: "lamb-leg",           action: "set_status", imageStatus: "verified_generic", reason: "Lamb leg steaks — correct product" },
  { id: "duck-fillet",        action: "set_status", imageStatus: "verified_generic", reason: "Duck breast fillets — correct product" },
  { id: "turkey-fillet",      action: "set_status", imageStatus: "verified_generic", reason: "Turkey fillet — correct product" },
  { id: "chicken-liver",      action: "set_status", imageStatus: "verified_generic", reason: "Chicken liver — correct product" },
  { id: "beef-liver",         action: "set_status", imageStatus: "verified_generic", reason: "Beef liver Arbuz Select — correct product" },
  { id: "salami-milano",      action: "set_status", imageStatus: "verified_generic", reason: "Salami Milano — correct product type" },
  { id: "chorizo",            action: "set_status", imageStatus: "verified_generic", reason: "Chorizo KZ brand — correct product" },
  { id: "salmon-fillet",      action: "set_status", imageStatus: "verified_generic", reason: "Boneless salmon fillets — correct product" },
  { id: "salmon-steak",       action: "set_status", imageStatus: "verified_generic", reason: "Wild salmon steaks — correct product" },
  { id: "salmon-lightly-salted", action: "set_status", imageStatus: "verified_generic", reason: "Семга Jaqsi Fish слабосолёная — correct product" },
  { id: "trout-fillet",       action: "set_status", imageStatus: "verified_generic", reason: "Salmon trout — correct product" },
  { id: "mackerel-smoked",    action: "set_status", imageStatus: "verified_generic", reason: "British mackerel fillets — correct product" },
  { id: "herring-salted",     action: "set_status", imageStatus: "verified_generic", reason: "Salted herring fillets — correct product" },
  { id: "tiger-shrimp",       action: "set_status", imageStatus: "verified_generic", reason: "Tiger shrimp — correct product" },
  { id: "cooked-shrimp",      action: "set_status", imageStatus: "verified_generic", reason: "Cooked shrimp — correct product" },
  { id: "squid-rings",        action: "set_status", imageStatus: "verified_generic", reason: "Calamari rings — correct product" },
  { id: "mussels",            action: "set_status", imageStatus: "verified_generic", reason: "Frozen mussels Arbuz Select — correct product" },
  { id: "red-caviar",         action: "set_status", imageStatus: "verified_generic", reason: "Red salmon caviar Arbuz — correct product" },
  { id: "cod-fillet",         action: "set_status", imageStatus: "verified_generic", reason: "Kingfisher cod fillet — correct product" },
  { id: "octopus-mini",       action: "set_status", imageStatus: "verified_generic", reason: "Baby octopus frozen — correct product" },
  { id: "anchovy",            action: "set_status", imageStatus: "verified_generic", reason: "Anchovy fillets in oil — correct product" },
  { id: "catfish-fillet",     action: "set_status", imageStatus: "verified_generic", reason: "Catfish fillets — correct product" },
  { id: "milk-25",            action: "set_status", imageStatus: "verified_generic", reason: "Молочный Мир 2.5% — generic milk, correct product" },
  { id: "milk-32",            action: "set_status", imageStatus: "verified_generic", reason: "Adal 3.2% — generic milk, correct product" },
  { id: "milk-ultra",         action: "set_status", imageStatus: "verified_generic", reason: "Umut i Ko 3.2% UHT — generic milk, correct product" },
  { id: "kefir-25",           action: "set_status", imageStatus: "verified_generic", reason: "Молочный Мир kefir 2.5% — correct product" },
  { id: "yogurt-berry",       action: "set_status", imageStatus: "verified_generic", reason: "Campina yogurt — correct type (berry yogurt)" },
  { id: "sour-cream-20",      action: "set_status", imageStatus: "verified_generic", reason: "Молочный Мир 20% — correct product" },
  { id: "cottage-cheese",     action: "set_status", imageStatus: "verified_generic", reason: "Cottage cheese — correct product" },
  { id: "butter-725",         action: "set_status", imageStatus: "verified_generic", reason: "Молочный Мир 72.5% butter — correct product" },
  { id: "cheese-gouda",       action: "set_status", imageStatus: "verified_generic", reason: "Generic gouda-type cheese — correct product" },
  { id: "cheese-mozzarella",  action: "set_status", imageStatus: "verified_generic", reason: "Mozzarella — correct product" },
  { id: "cheese-parmesan",    action: "set_status", imageStatus: "verified_generic", reason: "Grated parmesan — correct product" },
  { id: "cheese-adygei",      action: "set_status", imageStatus: "verified_generic", reason: "Ляззат адыгейский — correct KZ product" },
  { id: "cheese-suluguni",    action: "set_status", imageStatus: "verified_generic", reason: "Smoked chechil/suluguni — correct product type" },
  { id: "cheese-cheddar",     action: "set_status", imageStatus: "verified_generic", reason: "Cheddar — correct product" },
  { id: "cream-10",           action: "set_status", imageStatus: "verified_generic", reason: "Cream 10% — correct product" },
  { id: "cream-33",           action: "set_status", imageStatus: "verified_generic", reason: "Эконива 33% cream — correct product" },
  { id: "ryazhenka",          action: "set_status", imageStatus: "verified_generic", reason: "Dep ряженка 2.5% — correct product" },
  { id: "curd-snack",         action: "set_status", imageStatus: "verified_generic", reason: "Простоквашино snack — correct product type (glazed curd)" },
  { id: "eggs-c1",            action: "set_status", imageStatus: "verified_generic", reason: "Луговое Поле eggs — correct product" },
  { id: "eggs-quail",         action: "set_status", imageStatus: "verified_generic", reason: "Quail eggs — correct product" },
  { id: "eggs-farm",          action: "set_status", imageStatus: "verified_generic", reason: "Pasture raised eggs — correct product" },
  { id: "potatoes",           action: "set_status", imageStatus: "verified_generic", reason: "Raw potatoes Arbuz — correct product" },
  { id: "tomatoes",           action: "set_status", imageStatus: "verified_generic", reason: "Red tomatoes — correct product" },
  { id: "cucumbers",          action: "set_status", imageStatus: "verified_generic", reason: "Green cucumbers Arbuz — correct product" },
  { id: "bell-pepper",        action: "set_status", imageStatus: "verified_generic", reason: "Bell peppers — correct product" },
  { id: "eggplant",           action: "set_status", imageStatus: "verified_generic", reason: "Eggplant Arbuz — correct product" },
  { id: "bananas",            action: "set_status", imageStatus: "verified_generic", reason: "Bananas Arbuz — correct product" },
  { id: "apples",             action: "set_status", imageStatus: "verified_generic", reason: "Apples Red Prince — correct product" },
  { id: "oranges",            action: "set_status", imageStatus: "verified_generic", reason: "Oranges — correct product" },
  { id: "mandarins",          action: "set_status", imageStatus: "verified_generic", reason: "Mandarin — correct product" },
  { id: "pears",              action: "set_status", imageStatus: "verified_generic", reason: "Pears — correct product" },
  { id: "avocado",            action: "set_status", imageStatus: "verified_generic", reason: "Avocado — correct product" },
  { id: "mango",              action: "set_status", imageStatus: "verified_generic", reason: "Mango — correct product" },
  { id: "pineapple",          action: "set_status", imageStatus: "verified_generic", reason: "Pineapple — correct product" },
  { id: "kiwi",               action: "set_status", imageStatus: "verified_generic", reason: "Sungold kiwi — correct product" },
  { id: "strawberry",         action: "set_status", imageStatus: "verified_generic", reason: "Strawberries — correct product" },
  { id: "lemon",              action: "set_status", imageStatus: "verified_generic", reason: "Lemons — correct product" },
  { id: "pomegranate",        action: "set_status", imageStatus: "verified_generic", reason: "Pomegranate — correct product" },
  { id: "cherry",             action: "set_status", imageStatus: "verified_generic", reason: "Cherries — correct product" },
  { id: "beet",               action: "set_status", imageStatus: "verified_generic", reason: "Red beets — correct product" },
  { id: "spinach",            action: "set_status", imageStatus: "verified_generic", reason: "Baby spinach — correct product" },
  { id: "white-bread",        action: "set_status", imageStatus: "verified_generic", reason: "White sliced bread — correct product" },
  { id: "dark-bread",         action: "set_status", imageStatus: "verified_generic", reason: "Dark rye bread — correct product" },
  { id: "whole-wheat-bread",  action: "set_status", imageStatus: "verified_generic", reason: "Whole grain bread — correct product" },
  { id: "lavash",             action: "set_status", imageStatus: "verified_generic", reason: "Lavash flatbread — correct product" },
  { id: "tandyr-bread",       action: "set_status", imageStatus: "verified_generic", reason: "Naan/tandyr round bread — correct product" },
  { id: "pita",               action: "set_status", imageStatus: "verified_generic", reason: "Pita bread — correct product" },
  { id: "baguette",           action: "set_status", imageStatus: "verified_generic", reason: "Baguette — correct product" },
  { id: "cinnamon-roll",      action: "set_status", imageStatus: "verified_generic", reason: "Cinnamon rolls — correct product" },
  { id: "croissant",          action: "set_status", imageStatus: "verified_generic", reason: "Croissant — correct product" },
  { id: "donut",              action: "set_status", imageStatus: "verified_generic", reason: "Donuts — correct product" },
  { id: "muffin",             action: "set_status", imageStatus: "verified_generic", reason: "Muffins — correct product" },
  { id: "napoleon-cake",      action: "set_status", imageStatus: "verified_generic", reason: "Napoleon cake — correct product" },
  { id: "medovik",            action: "set_status", imageStatus: "verified_generic", reason: "Medovik cake — correct product" },
  { id: "eclair",             action: "set_status", imageStatus: "verified_generic", reason: "Eclairs — correct product" },
  { id: "bagel",              action: "set_status", imageStatus: "verified_generic", reason: "Mini bagels — correct product" },
  { id: "macaron",            action: "set_status", imageStatus: "verified_generic", reason: "Macarons — correct product" },
  { id: "tiramisu",           action: "set_status", imageStatus: "verified_generic", reason: "Tiramisu dessert — correct product" },
  { id: "samsa-meat",         action: "set_status", imageStatus: "verified_generic", reason: "Самса JamBull с мясом Arbuz — correct product" },
  { id: "water-still",        action: "set_status", imageStatus: "verified_generic", reason: "ASU still water — correct product" },
  { id: "water-sparkling",    action: "set_status", imageStatus: "verified_generic", reason: "Samal sparkling water — correct product" },
  { id: "apple-juice",        action: "set_status", imageStatus: "verified_generic", reason: "Да-Да apple juice — correct product" },
  { id: "orange-juice",       action: "set_status", imageStatus: "verified_generic", reason: "Да-Да orange nectar — correct product" },
  { id: "iced-tea",           action: "set_status", imageStatus: "verified_generic", reason: "Fuse Tea — correct product" },
  { id: "chocolate-milk-drink", action: "set_status", imageStatus: "verified_generic", reason: "Луговое Поле cocktail — correct product" },
  { id: "ayran",              action: "set_status", imageStatus: "verified_generic", reason: "Ayran — correct product" },
  { id: "aloe-drink",         action: "set_status", imageStatus: "verified_generic", reason: "Aloe vera drink — correct product" },
  { id: "peach-nectar",       action: "set_status", imageStatus: "verified_generic", reason: "Peach nectar — correct product" },
  { id: "oat-drink",          action: "set_status", imageStatus: "verified_generic", reason: "Oat plant drink — correct product" },
  { id: "coffee-capsules",    action: "set_status", imageStatus: "verified_generic", reason: "Nescafe Dolce Gusto capsules — correct product" },
  { id: "fruit-tea-hibiscus", action: "set_status", imageStatus: "verified_generic", reason: "Berry fruit tea — correct product" },
  { id: "matcha",             action: "set_status", imageStatus: "verified_generic", reason: "Matcha powder — correct product" },
  { id: "coffee-arabica-ground", action: "set_status", imageStatus: "verified_generic", reason: "Жокей Арабика молотый — correct product" },
  { id: "chocolate-dark-70",  action: "set_status", imageStatus: "verified_generic", reason: "Organic dark chocolate 70% — correct product" },
  { id: "chocolate-white",    action: "set_status", imageStatus: "verified_generic", reason: "Bueno White — correct product type" },
  { id: "waffles-choco",      action: "set_status", imageStatus: "verified_generic", reason: "Chocolate waffles — correct product" },
  { id: "marshmallow",        action: "set_status", imageStatus: "verified_generic", reason: "Marshmallow — correct product" },
  { id: "crackers-rye",       action: "set_status", imageStatus: "verified_generic", reason: "Rye crackers — correct product" },
  { id: "jubilee-cookies",    action: "set_status", imageStatus: "verified_generic", reason: "Cookies — correct product type" },
  { id: "rice-long",          action: "set_status", imageStatus: "verified_generic", reason: "Arnau long rice — correct product" },
  { id: "flour-premium",      action: "set_status", imageStatus: "verified_generic", reason: "Tsesna flour — correct product" },
  { id: "sugar-sand",         action: "set_status", imageStatus: "verified_generic", reason: "Sand sugar — correct product" },
  { id: "tomato-paste-pomidorka", action: "set_status", imageStatus: "verified_generic", reason: "Tomato paste — correct product" },
  { id: "canned-tuna-oil",    action: "set_status", imageStatus: "verified_generic", reason: "Canned tuna in oil — correct product" },
  { id: "canned-beans",       action: "set_status", imageStatus: "verified_generic", reason: "Canned beans — correct product" },
  { id: "canned-sardine",     action: "set_status", imageStatus: "verified_generic", reason: "Sprats/sardine can — correct product type" },
  { id: "pelmeni-beef",       action: "set_status", imageStatus: "verified_generic", reason: "Pelmeni beef — correct product" },
  { id: "pelmeni-pork",       action: "set_status", imageStatus: "verified_generic", reason: "Pelmeni pork — correct product" },
  { id: "mayo-provencal",     action: "set_status", imageStatus: "verified_generic", reason: "Makheev Provansale mayo — correct product" },
  { id: "mayo-light",         action: "set_status", imageStatus: "verified_generic", reason: "Makheyev light mayo — correct product" },
  { id: "ketchup-heinz",      action: "set_status", imageStatus: "verified_generic", reason: "Tomato ketchup — correct product" },
  { id: "ketchup-hot",        action: "set_status", imageStatus: "verified_generic", reason: "Hot ketchup — correct product" },
  { id: "soy-sauce-kikkoman", action: "set_status", imageStatus: "verified_generic", reason: "Soy sauce — correct product" },
  { id: "oyster-sauce",       action: "set_status", imageStatus: "verified_generic", reason: "Panda oyster sauce — correct product" },
  { id: "mustard-dijon",      action: "set_status", imageStatus: "verified_generic", reason: "Dijon mustard — correct product" },
  { id: "mustard-russian",    action: "set_status", imageStatus: "verified_generic", reason: "Russian mustard — correct product" },
  { id: "zira-cumin",         action: "set_status", imageStatus: "verified_generic", reason: "Cumin — correct product" },
  { id: "vanilla-extract",    action: "set_status", imageStatus: "verified_generic", reason: "Vanilla extract — correct product" },
  { id: "tabasco",            action: "set_status", imageStatus: "verified_generic", reason: "Tabasco sauce — correct brand+product" },
  { id: "worcestershire-sauce", action: "set_status", imageStatus: "verified_generic", reason: "Worcestershire sauce — correct product" },
  { id: "balsamic-vinegar",   action: "set_status", imageStatus: "verified_generic", reason: "Balsamic cream — correct product" },
  { id: "hummus-classic",     action: "set_status", imageStatus: "verified_generic", reason: "Classic hummus — correct product" },
  { id: "pesto-sauce",        action: "set_status", imageStatus: "verified_generic", reason: "Pesto genovese — correct product" },
  { id: "garlic-sauce",       action: "set_status", imageStatus: "verified_generic", reason: "Garlic pasta sauce — correct product type" },
  { id: "pizza-tomato-sauce", action: "set_status", imageStatus: "verified_generic", reason: "Pizza tomato sauce — correct product" },
  { id: "wasabi-paste",       action: "set_status", imageStatus: "verified_generic", reason: "Wasabi paste tube — correct product" },
  { id: "sunflower-oil-refined", action: "set_status", imageStatus: "verified_generic", reason: "Refined sunflower oil — correct product" },
  { id: "olive-oil-monini",   action: "set_status", imageStatus: "verified_generic", reason: "Monini Anfora olive oil — correct brand+product" },
  { id: "sesame-oil",         action: "set_status", imageStatus: "verified_generic", reason: "Toasted sesame oil — correct product" },
  { id: "coconut-oil",        action: "set_status", imageStatus: "verified_generic", reason: "Coconut oil — correct product" },
  { id: "ghee-butter",        action: "set_status", imageStatus: "verified_generic", reason: "Ghee clarified butter — correct product" },
  { id: "flaxseed-oil",       action: "set_status", imageStatus: "verified_generic", reason: "Imperial Oil льняное — correct product" },
  { id: "avocado-oil",        action: "set_status", imageStatus: "verified_generic", reason: "Oliomania avocado oil — correct product" },
  { id: "walnut-oil",         action: "set_status", imageStatus: "verified_generic", reason: "Cold-pressed walnut oil — correct product" },
  { id: "salt-marine",        action: "set_status", imageStatus: "verified_generic", reason: "Marine salt — correct product" },
  { id: "natural-honey",      action: "set_status", imageStatus: "verified_generic", reason: "Honey — correct product" },
  { id: "condensed-milk",     action: "set_status", imageStatus: "verified_generic", reason: "Sweetened condensed milk — correct product" },
  { id: "strawberry-jam",     action: "set_status", imageStatus: "verified_generic", reason: "Bonne Maman strawberry jam — correct product" },
  { id: "apple-vinegar",      action: "set_status", imageStatus: "verified_generic", reason: "Apple cider vinegar — correct product" },
  { id: "baking-soda",        action: "set_status", imageStatus: "verified_generic", reason: "Bicarbonate of soda — correct product" },
  { id: "buckwheat-uvelka",   action: "set_status", imageStatus: "verified_generic", reason: "Fine buckwheat — correct product" },
  { id: "buckwheat-flakes",   action: "set_status", imageStatus: "verified_generic", reason: "Crispy buckwheat — correct product" },
  { id: "oatmeal-hercules",   action: "set_status", imageStatus: "verified_generic", reason: "Arbuz Select oat flakes — correct product" },
  { id: "pearl-barley",       action: "set_status", imageStatus: "verified_generic", reason: "Pearl barley — correct product" },
  { id: "lentils-green",      action: "set_status", imageStatus: "verified_generic", reason: "Green lentils — correct product" },
  { id: "pelmeni-beef",       action: "set_status", imageStatus: "verified_generic", reason: "Pelmeni beef — correct product" },
  { id: "samsa-frozen",       action: "set_status", imageStatus: "verified_generic", reason: "Самса Arbuz Select с говядиной — correct product" },
  { id: "samsa-meat",         action: "set_status", imageStatus: "verified_generic", reason: "Самса JamBull с мясом Arbuz — correct product" },
  { id: "varenyky-potato",    action: "set_status", imageStatus: "verified_generic", reason: "Беккер вареники с картошкой — correct product" },
  { id: "varenyky-cherry",    action: "set_status", imageStatus: "verified_generic", reason: "Вареники с вишней Arbuz Select — correct product" },
  { id: "blini-cottage",      action: "set_status", imageStatus: "verified_generic", reason: "Блины с творогом Arbuz Select — correct product" },
  { id: "manti-frozen",       action: "set_status", imageStatus: "verified_generic", reason: "Manti frozen — correct product" },
  { id: "manti-ready",        action: "set_status", imageStatus: "verified_generic", reason: "Манты с говядиной Arbuz — correct product" },
  { id: "frozen-strawberry",  action: "set_status", imageStatus: "verified_generic", reason: "Клубника Arbuz frozen — correct product" },
  { id: "frozen-vegmix",      action: "set_status", imageStatus: "verified_generic", reason: "Organic vegetable medley — correct product" },
  { id: "fish-cakes-frozen",  action: "set_status", imageStatus: "verified_generic", reason: "Smoked haddock fish cakes — correct product" },
  { id: "spring-rolls-frozen",action: "set_status", imageStatus: "verified_generic", reason: "Vegetable spring rolls — correct product" },
  { id: "khinkali-frozen",    action: "set_status", imageStatus: "verified_generic", reason: "Khinkali beef & lamb — correct product" },
  { id: "pizza-frozen-margarita", action: "set_status", imageStatus: "verified_generic", reason: "Frozen margarita pizza — correct product" },
  { id: "pizza-pepperoni-fresh", action: "set_status", imageStatus: "verified_generic", reason: "Pepperoni pizza — correct product" },
  { id: "frozen-dough-puff",  action: "set_status", imageStatus: "verified_generic", reason: "Puff pastry sheets — correct product" },
  { id: "pizza-dough-frozen", action: "set_status", imageStatus: "verified_generic", reason: "Frozen pizza dough — correct product" },
  { id: "ice-cream-vanilla",  action: "set_status", imageStatus: "verified_generic", reason: "Ice cream — correct product" },
  { id: "ice-cream-chocolate",action: "set_status", imageStatus: "verified_generic", reason: "Chocolate chip ice cream — correct product" },
  { id: "nuggets-chicken",    action: "set_status", imageStatus: "verified_generic", reason: "Chicken nuggets — correct product" },
  { id: "chicken-breast-fresh", action: "set_status", imageStatus: "verified_generic", reason: "Chicken breast — correct product" },
  { id: "pepperoni-slice",    action: "set_status", imageStatus: "verified_generic", reason: "Pizza pepperoni slices — correct product" },
  { id: "burger-beef-fresh",  action: "set_status", imageStatus: "verified_generic", reason: "Beef burger — correct product" },
  { id: "shawarma-chicken",   action: "set_status", imageStatus: "verified_generic", reason: "Chicken shawarma — correct product" },
  { id: "plov-ready",         action: "set_status", imageStatus: "verified_generic", reason: "Плов Arbuz Select x Damdala — correct product" },
  { id: "borsch-ready",       action: "set_status", imageStatus: "verified_generic", reason: "Борщ Arbuz Select x Damdala — correct product" },
  { id: "salad-caesar-chicken", action: "set_status", imageStatus: "verified_generic", reason: "Caesar chicken salad — correct product" },
  { id: "hotdog-ready",       action: "set_status", imageStatus: "verified_generic", reason: "Hotdog buns — correct product" },
  { id: "dolma-ready",        action: "set_status", imageStatus: "verified_generic", reason: "Stuffed grape leaves dolma — correct product" },
  { id: "cheburek-meat",      action: "set_status", imageStatus: "verified_generic", reason: "Cheburek with chicken — correct product" },
  { id: "crab-meat",          action: "set_status", imageStatus: "verified_generic", reason: "White crab meat — correct product" },
  { id: "sea-cocktail",       action: "set_status", imageStatus: "verified_generic", reason: "Морской коктейль Arbuz Select — correct product" },
  { id: "masago",             action: "set_status", imageStatus: "verified_generic", reason: "Masago capelin roe — correct product" },
  { id: "tobiko-orange",      action: "set_status", imageStatus: "verified_generic", reason: "Seaweed/flying fish caviar orange — correct product" },
  { id: "tuna-sashimi",       action: "set_status", imageStatus: "verified_generic", reason: "Tuna sashimi frozen — correct product" },
  { id: "rolls-california",   action: "set_status", imageStatus: "verified_generic", reason: "California rolls — correct product" },
  { id: "nori-gold",          action: "set_status", imageStatus: "verified_generic", reason: "Nori gold — correct product" },
  { id: "nori-silver",        action: "set_status", imageStatus: "verified_generic", reason: "Nori silver — correct product" },
  { id: "panko-breadcrumbs",  action: "set_status", imageStatus: "verified_generic", reason: "Panko Japanese breadcrumbs — correct product" },
  { id: "panko-coarse",       action: "set_status", imageStatus: "verified_generic", reason: "Coarse panko — correct product" },
  { id: "tempura-mix",        action: "set_status", imageStatus: "verified_generic", reason: "Tempura batter mix — correct product" },
  { id: "pasta-tiger",        action: "set_status", imageStatus: "verified_generic", reason: "Udon noodles — correct product type" },
  { id: "sausage-doctor",     action: "set_status", imageStatus: "verified_generic", reason: "Papa Mozhet Doktorskaya — correct product" },
  { id: "sausage-smoked",     action: "set_status", imageStatus: "verified_generic", reason: "Cherkiz smoked sausage — correct product type" },
  { id: "frankfurters",       action: "set_status", imageStatus: "verified_generic", reason: "Papa Mozhet frankfurters — correct product" },
  { id: "bacon-smoked",       action: "set_status", imageStatus: "verified_generic", reason: "HERTA bacon lardons — correct product" },
  { id: "chicken-breast-smoked", action: "set_status", imageStatus: "verified_generic", reason: "Smoked/chargrilled chicken breast — correct product" },
  { id: "pork-neck",          action: "set_status", imageStatus: "verified_generic", reason: "Pork neck cut — correct product" },
  { id: "beef-ribs",          action: "set_status", imageStatus: "verified_generic", reason: "Beef brisket/ribs — correct product type" },
  { id: "pork-ribs",          action: "set_status", imageStatus: "verified_generic", reason: "Barbecue pork ribs — correct product" },
  { id: "beef-tenderloin",    action: "set_status", imageStatus: "verified_generic", reason: "Beef tenderloin — correct product" },
  { id: "almond-milk-tetrapak", action: "set_status", imageStatus: "verified_exact", reason: "Alpro almond milk — exact brand match" },
  { id: "barista-milk",       action: "set_status", imageStatus: "verified_generic", reason: "Barista oat drink — correct product type" },
  { id: "almonds-roasted",    action: "set_status", imageStatus: "verified_generic", reason: "Roasted almonds — correct product" },
  { id: "cashews-roasted",    action: "set_status", imageStatus: "verified_generic", reason: "Roasted cashews — correct product" },
  { id: "peanuts-salted",     action: "set_status", imageStatus: "verified_generic", reason: "Salted peanuts — correct product" },
  { id: "popcorn-salted",     action: "set_status", imageStatus: "verified_generic", reason: "Sea salted popcorn — correct product" },
  { id: "popcorn-caramel",    action: "set_status", imageStatus: "verified_generic", reason: "Caramel popcorn — correct product" },
  { id: "dried-apricots",     action: "set_status", imageStatus: "verified_generic", reason: "Dried apricots — correct product" },
  { id: "raisins",            action: "set_status", imageStatus: "verified_generic", reason: "Raisins — correct product" },
  { id: "prunes-snack",       action: "set_status", imageStatus: "verified_generic", reason: "Prunes — correct product" },
  { id: "pistachios-salted",  action: "set_status", imageStatus: "verified_generic", reason: "Californian pistachios salted — correct product" },
  { id: "walnuts-shelled",    action: "set_status", imageStatus: "verified_generic", reason: "Walnuts — correct product" },
  { id: "sunflower-seeds",    action: "set_status", imageStatus: "verified_generic", reason: "Roasted sunflower seeds — correct product" },
  { id: "pumpkin-seeds",      action: "set_status", imageStatus: "verified_generic", reason: "Pumpkin seeds — correct product" },
  { id: "roasted-chickpea",   action: "set_status", imageStatus: "verified_generic", reason: "Roasted chickpeas — correct product" },
  { id: "dates",              action: "set_status", imageStatus: "verified_generic", reason: "Medjool dates — correct product" },
  { id: "hazelnut-roasted",   action: "set_status", imageStatus: "verified_generic", reason: "Roasted hazelnuts — correct product" },
  { id: "baby-formula-nutrilon2", action: "set_status", imageStatus: "verified_exact", reason: "Nutrilon Premium 2 — exact brand+product match" },
  { id: "baby-cookies-gerber", action: "set_status", imageStatus: "verified_exact", reason: "Gerber Graduates cookies — exact brand match" },
  { id: "baby-cereal-corn",   action: "set_status", imageStatus: "verified_generic", reason: "Corn baby cereal — correct product" },
  { id: "baby-juice-agusha",  action: "set_status", imageStatus: "verified_exact",   reason: "Agusha juice 200g — exact brand match" },
  { id: "tofu-natural",       action: "set_status", imageStatus: "verified_generic", reason: "Organic tofu — correct product" },
  { id: "rice-cakes",         action: "set_status", imageStatus: "verified_generic", reason: "Rice cakes — correct product" },
  { id: "granola-bar",        action: "set_status", imageStatus: "verified_generic", reason: "Granola bar — correct product" },
  { id: "spirulina-powder",   action: "set_status", imageStatus: "verified_generic", reason: "Spirulina powder — correct product" },
  { id: "psyllium-husk",      action: "set_status", imageStatus: "verified_generic", reason: "Psyllium fiber — correct product" },
  { id: "protein-powder-vanilla", action: "set_status", imageStatus: "verified_generic", reason: "Protein pudding — correct product type (protein supplement)" },
  { id: "collagen-marine",    action: "set_status", imageStatus: "verified_generic", reason: "Marine collagen peptides — correct product" },
  { id: "chia-seeds",         action: "set_status", imageStatus: "verified_generic", reason: "Chia seeds — correct product" },
  { id: "cocoa-jb",           action: "set_status", imageStatus: "verified_generic", reason: "Morinaga cocoa powder — correct product" },
  { id: "compote-cherry",     action: "set_status", imageStatus: "verified_generic", reason: "Cherry compote — correct product" },
]

// ─── APPLY ────────────────────────────────────────────────────────────────────

let src = fs.readFileSync(PRODUCTS_FILE, "utf-8")

let removed    = 0
let statusSet  = 0
let notFound   = 0

for (const d of DECISIONS) {
  if (d.action === "remove" || d.action === "remove_duplicate") {
    // Remove the image field and add/update imageStatus
    // Pattern: id: "X", image: "/products/X.webp", ...
    // Replace image field with imageStatus: "rejected"

    // Try to replace existing imageStatus
    const hasStatus = new RegExp(`(id:\\s*"${d.id}"[^}]*?)imageStatus:\\s*"[^"]*"`)
    if (hasStatus.test(src)) {
      src = src.replace(hasStatus, `$1imageStatus: "${d.imageStatus}"`)
    }

    // Remove image field
    const imgPattern = new RegExp(` image: "\\/products\\/[^"]+",`, "g")
    // We need to be precise — find the product block and remove image from it
    const blockPattern = new RegExp(
      `(id:\\s*"${d.id}"[^}]*)( image: "\\/products\\/[^"]+",)`,
      "s"
    )
    if (blockPattern.test(src)) {
      src = src.replace(blockPattern, "$1")
      removed++
      if (!DRY_RUN) {
        // no-op here, replacement tracked in final write
      } else {
        console.log(`  REMOVE image: ${d.id} — ${d.reason}`)
      }
    } else {
      // Image might not exist or already removed
    }

    // Add or update imageStatus
    const statusPattern = new RegExp(
      `(id:\\s*"${d.id}"[^,]*,)(?!\\s*imageStatus)`,
      "s"
    )
    if (statusPattern.test(src) && !src.includes(`id: "${d.id}", imageStatus:`)) {
      // Insert imageStatus after the id field
      src = src.replace(
        new RegExp(`(id:\\s*"${d.id}",)`),
        `$1 imageStatus: "${d.imageStatus}",`
      )
      statusSet++
    }

  } else if (d.action === "set_status") {
    // Add imageStatus if not present, update if present
    const existingStatus = new RegExp(`(id:\\s*"${d.id}"[^}]*?)imageStatus:\\s*"[^"]*"`, "s")
    if (existingStatus.test(src)) {
      src = src.replace(existingStatus, `$1imageStatus: "${d.imageStatus}"`)
      statusSet++
    } else if (src.includes(`id: "${d.id}"`)) {
      src = src.replace(
        new RegExp(`(id:\\s*"${d.id}",)`),
        `$1 imageStatus: "${d.imageStatus}",`
      )
      statusSet++
    } else {
      notFound++
    }
  }
}

console.log(`\n  Image Audit Applicator`)
console.log(`  ${"─".repeat(40)}`)
console.log(`  Decisions loaded:    ${DECISIONS.length}`)
console.log(`  Images removed:      ${removed}`)
console.log(`  Statuses set:        ${statusSet}`)
console.log(`  IDs not found:       ${notFound}`)

if (DRY_RUN) {
  console.log("\n  [DRY RUN — no changes written]\n")
} else {
  fs.writeFileSync(PRODUCTS_FILE, src, "utf-8")
  console.log("\n  ✓ products.ts updated")
  console.log("  Next: npx tsx scripts/seed-products.ts\n")
}
