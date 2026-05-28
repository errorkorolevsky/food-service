/**
 * B2C Product Image Generator — Food Service Kazakhstan
 *
 * Uses Pollinations AI (https://pollinations.ai) — completely FREE, no API key needed.
 * Model: Flux (state-of-the-art open image model)
 * Converts output to WebP 600×800 via sharp.
 *
 * Usage:
 *   npx tsx scripts/generate-product-images.ts            # test batch (10)
 *   npx tsx scripts/generate-product-images.ts --all      # full P1 (181 products)
 *   npx tsx scripts/generate-product-images.ts --id eggs-c1,tomatoes
 *   npx tsx scripts/generate-product-images.ts --force    # re-generate existing files
 *
 * No API key required. Rate limit: ~1 req/3s recommended.
 *
 * Visual standard (07_image_strategy.md):
 *   Dark #0A0A0A background · consumer retail packaging · no FS branding
 *   Output: WebP 600×800 (quality 88)
 */

import * as fs    from "fs"
import * as path  from "path"
import * as https from "https"
import * as http  from "http"
import sharp from "sharp"

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Tier = "A" | "B" | "C" | "D" | "E"
type Entry = { id: string; tier: Tier; prompt: string; filename: string }

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
//
// Tier A = real branded consumer products  (Heinz, Barilla, Lay's …)
// Tier B = generic / private-label packaged goods
// Tier C = fresh produce (loose or in net bag)
// Tier D = raw meat / fish in consumer vacuum-sealed tray
// Tier E = ready food in sealed supermarket tray
//
// Filename must match the value you will put in products.ts:
//   image: "/products/<filename>"

const PRODUCTS: Entry[] = [

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 0 — TEST BATCH (10 products, covers all 5 tiers)
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "eggs-c1", tier: "B", filename: "eggs-c1.webp",
    prompt: "10 chicken eggs in an open cardboard egg carton, consumer retail packaging, beige/brown cardboard carton with simple label, professional product photography, dark charcoal background, soft studio lighting, product centered, photorealistic, sharp focus on egg textures, no branding logos",
  },
  {
    id: "white-bread", tier: "B", filename: "white-bread.webp",
    prompt: "Sliced white bread loaf in a clear plastic bag with paper label, 500g supermarket bread packaging, consumer retail format, professional product photography, dark studio background, soft front lighting, loaf visible through plastic, photorealistic, no brand names or logos",
  },
  {
    id: "tomatoes", tier: "C", filename: "tomatoes.webp",
    prompt: "Fresh ripe red tomatoes in a plastic mesh net bag with a weight tag, 1 kilogram, supermarket produce packaging, bright red tomatoes, professional product photography, dark charcoal background, studio lighting, photorealistic, vibrant natural color, no brand logos",
  },
  {
    id: "butter-725", tier: "B", filename: "butter-725.webp",
    prompt: "Butter block wrapped in gold foil and white paper packaging, consumer retail butter 200 grams, label reads Maslo Slivochnoye 72.5 percent, professional product photography, dark studio background, soft warm lighting, photorealistic, generic dairy packaging, no brand logos",
  },
  {
    id: "ketchup-heinz", tier: "A", filename: "ketchup-heinz.webp",
    prompt: "Heinz tomato ketchup 570g plastic squeeze bottle, iconic red Heinz label with keystone logo, consumer retail bottle, professional product photography, dark studio background, soft studio lighting, photorealistic, bottle centered upright, sharp label detail",
  },
  {
    id: "cola", tier: "A", filename: "cola.webp",
    prompt: "Coca-Cola 1.5 liter clear plastic PET bottle with red cap, iconic Coca-Cola red label with white script logo and Cyrillic text, consumer retail bottle, professional product photography, dark studio background, soft studio lighting, photorealistic, bottle centered, label facing forward, condensation on bottle surface",
  },
  {
    id: "buckwheat-uvelka", tier: "A", filename: "buckwheat-uvelka.webp",
    prompt: "Uvelka buckwheat groats 1kg paper bag, cream and beige paper packaging with green and orange Uvelka branding, consumer retail grain bag, professional product photography, dark studio background, soft studio lighting, photorealistic, bag centered upright, brand label visible",
  },
  {
    id: "pelmeni-beef", tier: "B", filename: "pelmeni-beef.webp",
    prompt: "Frozen Russian pelmeni dumplings in a rectangular cardboard box, 900 gram consumer retail packaging, blue and white box design, Pelmeni Sibirskie label visible, frozen food category, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "chicken-legs", tier: "D", filename: "chicken-legs.webp",
    prompt: "Raw chicken drumsticks in a clear plastic vacuum-sealed tray, 1 kilogram retail meat packaging, white polystyrene tray with transparent wrap, simple weight label sticker, professional product photography, dark studio background, soft cool lighting, photorealistic, fresh raw chicken appearance, no artificial colors",
  },
  {
    id: "natural-honey", tier: "B", filename: "natural-honey.webp",
    prompt: "Clear glass jar of golden flower honey 500 grams, simple paper label Med Tsvetochny Naturalny, golden amber honey visible through glass, metallic lid, professional product photography, dark studio background, warm golden backlighting, photorealistic, glass jar centered, honey glow from backlight, premium artisan look",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — MEAT & POULTRY
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "chicken-fillet", tier: "D", filename: "chicken-fillet.webp",
    prompt: "Fresh raw chicken breast fillet in clear vacuum-sealed retail packaging, 1kg polystyrene tray with transparent film wrap, weight label sticker, professional product photography, dark studio background, soft cool lighting, photorealistic, fresh pale pink chicken color",
  },
  {
    id: "chicken-thighs", tier: "D", filename: "chicken-thighs.webp",
    prompt: "Raw chicken thighs in clear vacuum-sealed retail tray packaging, 1kg white polystyrene tray with transparent stretch wrap, weight label, professional product photography, dark charcoal background, soft studio lighting, photorealistic, fresh chicken appearance",
  },
  {
    id: "whole-chicken", tier: "D", filename: "whole-chicken.webp",
    prompt: "Whole fresh raw broiler chicken in clear retail vacuum packaging, white polystyrene tray with transparent film, weight label 1.5-1.8kg, professional product photography, dark background, soft cool lighting, photorealistic, clean pale skin appearance",
  },
  {
    id: "chicken-wings", tier: "D", filename: "chicken-wings.webp",
    prompt: "Raw chicken wings in clear plastic vacuum-sealed retail tray, 1 kilogram retail meat package, white polystyrene tray, transparent wrap, weight label sticker, professional product photography, dark studio background, soft cool lighting, photorealistic",
  },
  {
    id: "beef-tenderloin", tier: "D", filename: "beef-tenderloin.webp",
    prompt: "Fresh beef tenderloin in clear vacuum-sealed retail packaging, 500g polystyrene tray with transparent film wrap, weight label, deep red premium beef color, professional product photography, dark studio background, soft lighting, photorealistic",
  },
  {
    id: "beef-minced", tier: "D", filename: "beef-minced.webp",
    prompt: "Ground beef minced meat in a clear plastic retail tray, 500g white polystyrene tray with transparent stretch wrap, weight label, fresh red ground beef visible through packaging, professional product photography, dark background, soft cool lighting, photorealistic",
  },
  {
    id: "pork-neck", tier: "D", filename: "pork-neck.webp",
    prompt: "Fresh pork neck cut in clear vacuum-sealed retail packaging, 500g white polystyrene tray with transparent film, weight label, pale pink pork meat with marbling visible, professional product photography, dark studio background, soft lighting, photorealistic",
  },
  {
    id: "beef-ribs", tier: "D", filename: "beef-ribs.webp",
    prompt: "Beef short ribs in clear retail vacuum-sealed tray, approximately 500g, white polystyrene tray with transparent wrap, weight sticker label, dark red beef bone-in ribs, professional product photography, dark studio background, soft cool lighting, photorealistic",
  },
  {
    id: "pork-minced", tier: "D", filename: "pork-minced.webp",
    prompt: "Mixed pork and beef ground meat in clear retail tray, 500g white polystyrene tray with transparent stretch film, weight label, fresh pink ground meat visible, professional product photography, dark background, soft cool lighting, photorealistic",
  },
  {
    id: "sausage-doctor", tier: "B", filename: "sausage-doctor.webp",
    prompt: "Doktorskaya boiled sausage in cylindrical vacuum-sealed consumer packaging, 400g pink sausage in clear plastic with paper label, Russian Doktorskaya style, consumer retail format, professional product photography, dark studio background, soft lighting, photorealistic",
  },
  {
    id: "frankfurters", tier: "B", filename: "frankfurters.webp",
    prompt: "Milk frankfurter sausages in clear vacuum-sealed retail package, 7-8 sausages 400g, white plastic tray with film wrap and paper label, consumer retail format, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "duck-fillet", tier: "D", filename: "duck-fillet.webp",
    prompt: "Fresh duck breast fillet in clear vacuum-sealed retail packaging, 500g polystyrene tray with transparent wrap, weight label, dark pink duck meat, professional product photography, dark studio background, soft cool lighting, photorealistic",
  },
  {
    id: "chicken-breast-fresh", tier: "D", filename: "chicken-breast-fresh.webp",
    prompt: "Skinless chicken breast fresh in clear retail vacuum tray, 1kg polystyrene tray with stretch film, weight sticker, fresh pale chicken breast, professional product photography, dark background, soft cool lighting, photorealistic",
  },
  {
    id: "nuggets-chicken", tier: "B", filename: "nuggets-chicken.webp",
    prompt: "Frozen chicken nuggets in a rectangular consumer cardboard box, 400g retail packaging, golden nuggets illustration on box, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "pepperoni-slice", tier: "B", filename: "pepperoni-slice.webp",
    prompt: "Sliced pepperoni salami in clear vacuum-sealed retail packaging, 100g flat pack with transparent film, red sliced pepperoni visible, consumer deli packaging, professional product photography, dark studio background, soft lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — SEAFOOD
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "salmon-fillet", tier: "D", filename: "salmon-fillet.webp",
    prompt: "Fresh salmon fillet portion in clear retail vacuum-sealed tray, 300g white polystyrene tray with transparent film, weight label, vibrant orange-pink salmon color, professional product photography, dark studio background, soft cool lighting, photorealistic",
  },
  {
    id: "salmon-lightly-salted", tier: "D", filename: "salmon-lightly-salted.webp",
    prompt: "Lightly salted salmon fillet slices in clear vacuum-sealed retail packaging, 200g flat vacuum pack with paper label, orange-pink salmon slices visible, consumer deli seafood format, professional product photography, dark studio background, photorealistic",
  },
  {
    id: "pollock-fillet", tier: "D", filename: "pollock-fillet.webp",
    prompt: "Frozen pollock fish fillet in clear retail vacuum packaging, 500g white polystyrene tray or bag, white fish fillet, weight label, professional product photography, dark studio background, soft cool lighting, photorealistic",
  },
  {
    id: "tiger-shrimp", tier: "D", filename: "tiger-shrimp.webp",
    prompt: "Tiger shrimp in clear vacuum-sealed retail bag, 500g frozen shrimp package with weight label, grey-pink tiger shrimp visible through clear packaging, consumer frozen seafood format, professional product photography, dark studio background, photorealistic",
  },
  {
    id: "cooked-shrimp", tier: "D", filename: "cooked-shrimp.webp",
    prompt: "Cooked frozen shrimp in clear consumer retail bag, 500g vacuum-sealed packaging, pink cooked shrimp visible through clear plastic, weight label, professional product photography, dark studio background, soft lighting, photorealistic",
  },
  {
    id: "red-caviar", tier: "B", filename: "red-caviar.webp",
    prompt: "Red salmon caviar in a glass jar 140g, bright orange-red roe, simple paper label Ikra Krasnaya, metallic gold lid, professional product photography, dark studio background, warm lighting, photorealistic, glass jar centered, caviar glow from backlight",
  },
  {
    id: "crab-sticks", tier: "A", filename: "crab-sticks.webp",
    prompt: "Vici brand crab sticks 240g consumer retail package, red and white vacuum-sealed package with Vici logo, surimi crab sticks visible through packaging, professional product photography, dark studio background, soft studio lighting, photorealistic, package centered",
  },
  {
    id: "cod-fillet", tier: "D", filename: "cod-fillet.webp",
    prompt: "Fresh cod fish fillet in white retail vacuum tray, 400g polystyrene tray with transparent film wrap, white firm cod flesh, weight label, professional product photography, dark studio background, soft cool lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — DAIRY
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "milk-25", tier: "B", filename: "milk-25.webp",
    prompt: "1 liter pasteurized milk carton, 2.5 percent fat, white and blue clean consumer packaging with simple milk label, professional product photography, dark studio background, soft front lighting, photorealistic, carton centered upright",
  },
  {
    id: "milk-32", tier: "B", filename: "milk-32.webp",
    prompt: "1 liter premium selected milk carton, 3.2 percent fat, white consumer packaging with gold accent and Otbornoye label, professional product photography, dark studio background, soft front lighting, photorealistic, carton centered upright",
  },
  {
    id: "milk-ultra", tier: "B", filename: "milk-ultra.webp",
    prompt: "Ultra-pasteurized UHT milk 1 liter Tetra Pak carton, clean white and blue consumer packaging, professional product photography, dark studio background, soft front lighting, photorealistic, carton centered upright",
  },
  {
    id: "kefir-1", tier: "B", filename: "kefir-1.webp",
    prompt: "Kefir 1 liter plastic bottle or Tetra Pak carton, 1 percent fat, white consumer dairy packaging with blue label, professional product photography, dark studio background, soft front lighting, photorealistic, package centered upright",
  },
  {
    id: "kefir-25", tier: "B", filename: "kefir-25.webp",
    prompt: "Kefir 900ml plastic bottle, 2.5 percent fat, white consumer dairy packaging with clean label design, professional product photography, dark studio background, soft front lighting, photorealistic, bottle centered upright",
  },
  {
    id: "yogurt-natural", tier: "A", filename: "yogurt-natural.webp",
    prompt: "Activia natural yogurt 870g large plastic tub, iconic Activia white and green consumer packaging, professional product photography, dark studio background, soft studio lighting, photorealistic, tub centered upright with lid visible",
  },
  {
    id: "sour-cream-15", tier: "B", filename: "sour-cream-15.webp",
    prompt: "Sour cream smetana 400g plastic cup with foil seal and snap lid, 15 percent fat, generic white consumer dairy packaging, professional product photography, dark studio background, soft lighting, photorealistic, cup centered upright",
  },
  {
    id: "sour-cream-20", tier: "B", filename: "sour-cream-20.webp",
    prompt: "Sour cream smetana 400g plastic tub with foil seal and plastic lid, 20 percent fat, clean white consumer dairy packaging with simple label, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "cottage-cheese", tier: "B", filename: "cottage-cheese.webp",
    prompt: "Cottage cheese tvorog 5 percent fat in 200g plastic tray with clear lid, white grainy texture visible through clear packaging, generic consumer dairy format, professional product photography, dark studio background, soft lighting, photorealistic",
  },
  {
    id: "butter-825", tier: "B", filename: "butter-825.webp",
    prompt: "Premium Extra butter 200 grams 82.5 percent fat wrapped in gold foil with white paper packaging, consumer retail butter, premium dairy packaging, professional product photography, dark studio background, warm soft lighting, photorealistic, gold foil texture visible",
  },
  {
    id: "cheese-russian", tier: "B", filename: "cheese-russian.webp",
    prompt: "Russian hard cheese wedge 200g in vacuum-sealed yellow plastic packaging, Rossiysky style consumer cheese, transparent vacuum pack showing yellow cheese, weight label, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "cheese-mozzarella", tier: "B", filename: "cheese-mozzarella.webp",
    prompt: "Fresh mozzarella balls 125g in sealed plastic tub with brine, white mozzarella balls visible through clear tub, simple label, consumer retail format, professional product photography, dark studio background, soft cool lighting, photorealistic",
  },
  {
    id: "cheese-cream", tier: "A", filename: "cheese-cream.webp",
    prompt: "Philadelphia cream cheese 175g white cardboard tub with blue and white Philadelphia brand packaging, iconic label, consumer retail format, professional product photography, dark studio background, soft studio lighting, photorealistic, tub centered upright",
  },
  {
    id: "cream-33", tier: "B", filename: "cream-33.webp",
    prompt: "Heavy whipping cream 33 percent fat 200ml Tetra Pak carton, white consumer dairy packaging with simple label, professional product photography, dark studio background, soft warm lighting, photorealistic, carton centered",
  },
  {
    id: "cream-10", tier: "B", filename: "cream-10.webp",
    prompt: "Cooking cream 10 percent fat 200ml Tetra Pak carton, clean white consumer dairy packaging, professional product photography, dark studio background, soft front lighting, photorealistic, carton centered upright",
  },
  {
    id: "curd-snack", tier: "B", filename: "curd-snack.webp",
    prompt: "Chocolate glazed curd snack bar 50g in foil and cardboard wrapper, Russian tvorozhok syrok style, dark chocolate coating visible, consumer retail candy format, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "barista-milk", tier: "B", filename: "barista-milk.webp",
    prompt: "Barista whole milk 1 liter Tetra Pak carton, 3.5 percent fat, clean white and gold consumer packaging with Barista Edition label, professional product photography, dark studio background, soft warm lighting, photorealistic, carton centered upright",
  },
  {
    id: "cheese-cheddar", tier: "B", filename: "cheese-cheddar.webp",
    prompt: "Cheddar cheese 200g vacuum-sealed wedge in orange-yellow packaging, consumer retail aged cheddar, transparent vacuum pack showing orange cheese, weight label, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "cream-38", tier: "B", filename: "cream-38.webp",
    prompt: "Extra-thick cream 38 percent fat 200ml Tetra Pak or glass bottle, premium dairy product, white consumer packaging, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "ryazhenka", tier: "B", filename: "ryazhenka.webp",
    prompt: "Ryazhenka fermented baked milk 500ml plastic bottle, beige and cream colored consumer dairy packaging, 4 percent fat label, professional product photography, dark studio background, soft warm lighting, photorealistic, bottle centered upright",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — EGGS
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "eggs-c0", tier: "B", filename: "eggs-c0.webp",
    prompt: "10 premium selected chicken eggs in a closed cardboard egg carton, consumer retail packaging, beige cardboard carton with Otbornoye S0 label, professional product photography, dark charcoal background, soft studio lighting, photorealistic, carton centered",
  },
  {
    id: "eggs-farm", tier: "B", filename: "eggs-farm.webp",
    prompt: "10 farmhouse eggs in a rustic cardboard egg carton with a simple farm label, consumer retail packaging, natural brown and white eggs, Fermerskie label, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — VEGETABLES & FRUITS
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "potatoes", tier: "C", filename: "potatoes.webp",
    prompt: "Fresh potatoes in a mesh net bag with weight tag, 2 kilograms, supermarket produce packaging, clean yellow-brown potatoes, professional product photography, dark charcoal background, soft studio lighting, photorealistic, natural potato texture",
  },
  {
    id: "carrots", tier: "C", filename: "carrots.webp",
    prompt: "Fresh orange carrots in a mesh net bag with weight label, 1 kilogram, supermarket produce packaging, bright orange carrots with green tops trimmed, professional product photography, dark background, studio lighting, photorealistic, vibrant natural orange color",
  },
  {
    id: "onions", tier: "C", filename: "onions.webp",
    prompt: "Yellow onions in a mesh net bag, 1 kilogram, supermarket produce packaging with weight tag, golden paper-skin onions, professional product photography, dark charcoal background, soft studio lighting, photorealistic",
  },
  {
    id: "cucumbers", tier: "C", filename: "cucumbers.webp",
    prompt: "Fresh green cucumbers in a clear plastic bag or loose, approximately 1 kilogram, supermarket produce format, bright fresh green cucumbers, professional product photography, dark background, soft studio lighting, photorealistic",
  },
  {
    id: "bell-pepper", tier: "C", filename: "bell-pepper.webp",
    prompt: "Three colorful bell peppers red yellow and green in a clear plastic bag or loose, supermarket produce, professional product photography, dark charcoal background, soft studio lighting, photorealistic, vibrant colors",
  },
  {
    id: "mushrooms", tier: "C", filename: "mushrooms.webp",
    prompt: "Fresh white champignon mushrooms in a sealed plastic punnet or tray, 400g consumer produce packaging, professional product photography, dark studio background, soft front lighting, photorealistic, natural mushroom texture",
  },
  {
    id: "avocado", tier: "C", filename: "avocado.webp",
    prompt: "One ripe Hass avocado, dark bumpy skin, consumer single unit, supermarket produce style, professional product photography, dark charcoal background, soft studio lighting, photorealistic, natural deep green-black color",
  },
  {
    id: "bananas", tier: "C", filename: "bananas.webp",
    prompt: "Fresh yellow bananas bunch approximately 1 kilogram, ripe yellow consumer supermarket bananas, professional product photography, dark charcoal background, soft studio lighting, photorealistic, vibrant yellow color",
  },
  {
    id: "apples", tier: "C", filename: "apples.webp",
    prompt: "Fresh Golden Delicious apples in a clear plastic bag with weight sticker, 1 kilogram, supermarket produce packaging, bright yellow-green apples, professional product photography, dark background, soft studio lighting, photorealistic",
  },
  {
    id: "oranges", tier: "C", filename: "oranges.webp",
    prompt: "Fresh oranges in a mesh net bag with weight tag, 1 kilogram, supermarket produce packaging, bright orange skin, professional product photography, dark charcoal background, soft studio lighting, photorealistic",
  },
  {
    id: "mandarins", tier: "C", filename: "mandarins.webp",
    prompt: "Fresh mandarins tangerines in a mesh net bag, 1 kilogram, supermarket produce packaging with weight label, bright orange mandarins, professional product photography, dark background, soft studio lighting, photorealistic",
  },
  {
    id: "mango", tier: "C", filename: "mango.webp",
    prompt: "One ripe mango, yellow-orange skin with red blush, supermarket produce single fruit, professional product photography, dark charcoal background, soft warm lighting, photorealistic, tropical fruit natural appearance",
  },
  {
    id: "kiwi", tier: "C", filename: "kiwi.webp",
    prompt: "Fresh kiwi fruits in a small mesh net bag, 4-6 pieces, supermarket produce packaging, brown fuzzy kiwi exterior, professional product photography, dark background, soft studio lighting, photorealistic",
  },
  {
    id: "strawberry", tier: "C", filename: "strawberry.webp",
    prompt: "Fresh ripe red strawberries in a clear plastic punnet tray, 500g consumer produce packaging, bright red strawberries with green leaves, professional product photography, dark studio background, soft front lighting, photorealistic",
  },
  {
    id: "lemon", tier: "C", filename: "lemon.webp",
    prompt: "Three fresh lemons loose or in a small net bag, bright yellow citrus, supermarket produce format, professional product photography, dark charcoal background, soft studio lighting, photorealistic, vibrant yellow color",
  },
  {
    id: "grapes", tier: "C", filename: "grapes.webp",
    prompt: "Fresh green or red grape bunch in a clear plastic punnet, 500g consumer produce packaging, plump grapes on stem, professional product photography, dark studio background, soft front lighting, photorealistic",
  },
  {
    id: "pomegranate", tier: "C", filename: "pomegranate.webp",
    prompt: "One large ripe pomegranate, deep red skin, supermarket produce single fruit, professional product photography, dark charcoal background, soft studio lighting, photorealistic, natural produce appearance",
  },
  {
    id: "zucchini", tier: "C", filename: "zucchini.webp",
    prompt: "Two or three fresh zucchini courgettes, dark green smooth skin, supermarket produce loose format, professional product photography, dark charcoal background, soft studio lighting, photorealistic",
  },
  {
    id: "dill", tier: "C", filename: "dill.webp",
    prompt: "Fresh dill herb tied bunch approximately 100g, bright green feathery dill, supermarket produce format, professional product photography, dark studio background, soft front lighting, photorealistic, vibrant green color",
  },
  {
    id: "parsley", tier: "C", filename: "parsley.webp",
    prompt: "Fresh flat-leaf or curly parsley tied bunch approximately 100g, bright green parsley, supermarket produce format, professional product photography, dark studio background, soft front lighting, photorealistic, vibrant green color",
  },
  {
    id: "cabbage", tier: "C", filename: "cabbage.webp",
    prompt: "Fresh whole white cabbage head, consumer supermarket produce, round pale green head, professional product photography, dark charcoal background, soft studio lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — BAKERY
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "dark-bread", tier: "B", filename: "dark-bread.webp",
    prompt: "Borodinsky dark rye bread loaf in a clear plastic bag with paper label, 400g consumer retail packaging, dark brown rye bread, professional product photography, dark studio background, soft front lighting, photorealistic, dark bread texture visible",
  },
  {
    id: "baton", tier: "B", filename: "baton.webp",
    prompt: "Molochny white wheat baton bread loaf in clear plastic bag with paper label, 400g consumer retail bakery packaging, classic Russian baton shape, professional product photography, dark studio background, soft front lighting, photorealistic",
  },
  {
    id: "lavash", tier: "B", filename: "lavash.webp",
    prompt: "Armenian lavash thin flatbread in a sealed clear plastic package, consumer retail bakery format, folded thin pale flatbread, simple label, professional product photography, dark studio background, soft front lighting, photorealistic",
  },
  {
    id: "croissant", tier: "B", filename: "croissant.webp",
    prompt: "Butter croissant in a clear plastic bag or on dark background, golden-brown flaky pastry, consumer retail bakery format, professional product photography, dark studio background, soft warm lighting, photorealistic, flaky buttery texture visible",
  },
  {
    id: "samsa-meat", tier: "E", filename: "samsa-meat.webp",
    prompt: "Meat samsa triangular pastry in a sealed plastic retail tray, supermarket deli ready food packaging, black plastic tray with clear lid and price label sticker, golden-brown triangular pies, professional product photography, dark background, photorealistic",
  },
  {
    id: "napoleon-cake", tier: "E", filename: "napoleon-cake.webp",
    prompt: "Napoleon cake slice in a sealed transparent plastic consumer tray, supermarket deli format, multi-layer pastry cream cake slice, clear plastic container with price label, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "medovik", tier: "E", filename: "medovik.webp",
    prompt: "Medovik honey cake slice in a sealed plastic retail tray, supermarket deli ready food, dark plastic tray with clear lid, multi-layer honey cake with cream, price label, professional product photography, dark background, soft warm lighting, photorealistic",
  },
  {
    id: "tandyr-bread", tier: "B", filename: "tandyr-bread.webp",
    prompt: "Round tandoor flatbread lepeshka in a clear plastic bag, traditional Central Asian bread, 400g consumer retail format, golden-brown baked round flat loaf, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "baguette", tier: "B", filename: "baguette.webp",
    prompt: "French baguette in a paper or clear plastic bag, 250g consumer retail bakery format, golden-brown crispy crust baguette, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — BEVERAGES
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "water-still", tier: "B", filename: "water-still.webp",
    prompt: "Still drinking water 1.5 liter clear PET plastic bottle, clean white and blue label, screw cap, consumer retail format, professional product photography, dark studio background, soft studio lighting, photorealistic, bottle centered upright",
  },
  {
    id: "water-sparkling", tier: "B", filename: "water-sparkling.webp",
    prompt: "Sparkling mineral water 1.5 liter clear PET bottle with blue cap, blue and white label, consumer retail bottle, professional product photography, dark studio background, soft lighting, photorealistic, condensation on bottle, bottle centered upright",
  },
  {
    id: "apple-juice", tier: "A", filename: "apple-juice.webp",
    prompt: "Rich apple juice 1 liter Tetra Pak carton, golden Rich brand packaging with apple graphics, consumer retail juice carton, professional product photography, dark studio background, soft warm lighting, photorealistic, carton centered upright",
  },
  {
    id: "orange-juice", tier: "A", filename: "orange-juice.webp",
    prompt: "J7 orange juice 1 liter Tetra Pak carton, orange and yellow J7 brand packaging with orange slice graphics, consumer retail juice carton, professional product photography, dark studio background, soft warm lighting, photorealistic, carton centered upright",
  },
  {
    id: "pepsi", tier: "A", filename: "pepsi.webp",
    prompt: "Pepsi Cola 1.5 liter clear PET plastic bottle with blue cap, iconic Pepsi blue red white label with Cyrillic text, consumer retail bottle, professional product photography, dark studio background, soft studio lighting, photorealistic, bottle centered, label facing forward",
  },
  {
    id: "energy-redbull", tier: "A", filename: "energy-redbull.webp",
    prompt: "Red Bull energy drink 250ml slim can, iconic blue and silver Red Bull can with bull logo and Cyrillic text, consumer retail can, professional product photography, dark studio background, soft studio lighting, photorealistic, can centered upright",
  },
  {
    id: "iced-tea", tier: "A", filename: "iced-tea.webp",
    prompt: "Lipton iced tea 1.5 liter PET bottle, yellow Lipton brand label with lemon graphics, consumer retail bottle, professional product photography, dark studio background, soft studio lighting, photorealistic, bottle centered upright",
  },
  {
    id: "ayran", tier: "B", filename: "ayran.webp",
    prompt: "Ayran yogurt drink 250ml small plastic bottle or carton, white consumer dairy packaging with Ayran label, traditional Central Asian drink format, professional product photography, dark studio background, soft front lighting, photorealistic",
  },
  {
    id: "chocolate-milk-drink", tier: "B", filename: "chocolate-milk-drink.webp",
    prompt: "Chocolate flavored milk drink 200ml Tetra Pak mini carton, brown and white consumer packaging with chocolate milk label, professional product photography, dark studio background, soft warm lighting, photorealistic, small carton centered",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — COFFEE, TEA & COCOA
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "coffee-beans-lavazza", tier: "A", filename: "coffee-beans-lavazza.webp",
    prompt: "Lavazza Crema e Gusto coffee beans 1kg vacuum sealed bag, iconic red and gold Lavazza packaging, consumer retail coffee bag, professional product photography, dark studio background, soft studio lighting, photorealistic, bag centered upright",
  },
  {
    id: "coffee-ground-jacobs", tier: "A", filename: "coffee-ground-jacobs.webp",
    prompt: "Jacobs Monarch ground coffee 230g vacuum pack bag, iconic purple and gold Jacobs Monarch packaging with Cyrillic text, consumer retail coffee, professional product photography, dark studio background, soft studio lighting, photorealistic, pack centered",
  },
  {
    id: "coffee-instant-nescafe", tier: "A", filename: "coffee-instant-nescafe.webp",
    prompt: "Nescafe Gold instant coffee 190g glass jar, iconic gold Nescafe label, consumer retail coffee jar, professional product photography, dark studio background, soft warm lighting, photorealistic, jar centered upright, glass texture visible",
  },
  {
    id: "coffee-capsules", tier: "A", filename: "coffee-capsules.webp",
    prompt: "Nespresso coffee capsules 10 piece box, colorful Nespresso sleeves box in consumer retail format, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered",
  },
  {
    id: "coffee-3in1", tier: "A", filename: "coffee-3in1.webp",
    prompt: "MacCoffee 3-in-1 instant coffee box of 25 sachets, orange MacCoffee consumer retail packaging, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "black-tea-akbar", tier: "A", filename: "black-tea-akbar.webp",
    prompt: "Akbar Ceylon black tea 100g box with 25 or 50 teabags, red Akbar brand packaging, consumer retail tea box, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "green-tea-greenfield", tier: "A", filename: "green-tea-greenfield.webp",
    prompt: "Greenfield green tea box 25 teabags, green and white Greenfield consumer packaging, professional product photography, dark studio background, soft studio lighting, photorealistic, tea box centered upright",
  },
  {
    id: "matcha", tier: "B", filename: "matcha.webp",
    prompt: "Ceremonial grade matcha green tea powder 100g in a sealed tin or resealable pouch, vibrant green matcha powder, premium consumer packaging, professional product photography, dark studio background, soft front lighting, photorealistic",
  },
  {
    id: "cacao-nesquik", tier: "A", filename: "cacao-nesquik.webp",
    prompt: "Nesquik chocolate cocoa powder 500g tin, iconic yellow Nesquik tin with Quicky rabbit mascot, consumer retail cocoa, professional product photography, dark studio background, soft studio lighting, photorealistic, tin centered upright",
  },
  {
    id: "earl-grey", tier: "B", filename: "earl-grey.webp",
    prompt: "Earl Grey black tea with bergamot 25 teabag box, elegant blue and white consumer tea packaging, professional product photography, dark studio background, soft studio lighting, photorealistic, tea box centered",
  },
  {
    id: "cocoa-jb", tier: "B", filename: "cocoa-jb.webp",
    prompt: "Classic drinking cocoa powder 250g tin or cardboard can, dark brown consumer cocoa packaging with cocoa beans illustration, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — CONFECTIONERY
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "raffaello", tier: "A", filename: "raffaello.webp",
    prompt: "Raffaello almond coconut candies gift box 150g, iconic white cylindrical Raffaello box with golden accents, consumer retail candy box, professional product photography, dark studio background, soft warm studio lighting, photorealistic, box centered",
  },
  {
    id: "ferrero-rocher", tier: "A", filename: "ferrero-rocher.webp",
    prompt: "Ferrero Rocher hazelnut chocolates box of 8, transparent plastic box with gold packaging and red ribbon, iconic Ferrero Rocher consumer retail format, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "candy-korovka", tier: "B", filename: "candy-korovka.webp",
    prompt: "Korovka milk toffee candies assorted 250g bag, consumer retail candy packaging with cow illustration, traditional Russian milk candy, professional product photography, dark studio background, soft warm lighting, photorealistic, bag centered",
  },
  {
    id: "jubilee-cookies", tier: "A", filename: "jubilee-cookies.webp",
    prompt: "Yubileynoe Jubilee cookies 112g rectangular cardboard box, iconic cream and gold Yubileynoe packaging, consumer retail biscuit box, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "zephyr-vanilla", tier: "B", filename: "zephyr-vanilla.webp",
    prompt: "Vanilla zephyr marshmallow 250g in clear plastic bag with label, white fluffy round zephyr pieces visible through packaging, Russian zephyr consumer format, professional product photography, dark studio background, soft lighting, photorealistic",
  },
  {
    id: "halva-sunflower", tier: "B", filename: "halva-sunflower.webp",
    prompt: "Sunflower seed halva 250g in sealed plastic packaging or consumer block, traditional CIS halva, grey-brown flaky texture visible, simple packaging label, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "baklava", tier: "E", filename: "baklava.webp",
    prompt: "Honey baklava pastry assortment in a sealed plastic tray, supermarket deli ready food format, dark plastic tray with clear lid and price sticker, golden-brown layered pastry with nuts, professional product photography, dark background, photorealistic",
  },
  {
    id: "snickers", tier: "A", filename: "snickers.webp",
    prompt: "Snickers chocolate bar 55g standard size, iconic brown and red Snickers wrapper with white logo and Cyrillic text, consumer retail candy bar, professional product photography, dark studio background, soft studio lighting, photorealistic, bar centered",
  },
  {
    id: "kitkat", tier: "A", filename: "kitkat.webp",
    prompt: "KitKat Chunky 40g chocolate bar in red packaging, iconic KitKat red and white label with Cyrillic text, consumer retail chocolate bar, professional product photography, dark studio background, soft studio lighting, photorealistic, bar centered",
  },
  {
    id: "oreo", tier: "A", filename: "oreo.webp",
    prompt: "Oreo double stuffed chocolate cookies 176g consumer pack, iconic blue Oreo packaging with cookie graphics, professional product photography, dark studio background, soft studio lighting, photorealistic, pack centered",
  },
  {
    id: "nutella", tier: "A", filename: "nutella.webp",
    prompt: "Nutella hazelnut chocolate spread 350g glass jar, iconic Nutella white label with red and gold branding, consumer retail jar, professional product photography, dark studio background, soft warm lighting, photorealistic, jar centered with lid visible",
  },
  {
    id: "chocolate-bar-milka", tier: "A", filename: "chocolate-bar-milka.webp",
    prompt: "Milka milk chocolate 90g bar in purple packaging, iconic purple Milka wrapper with cow logo and Cyrillic text, consumer retail chocolate bar, professional product photography, dark studio background, soft studio lighting, photorealistic, bar centered, purple packaging visible",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — SNACKS
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "lays-classic", tier: "A", filename: "lays-classic.webp",
    prompt: "Lay's classic potato chips 140g bag, iconic yellow Lay's bag with Cyrillic text Klassicheskie, consumer retail snack bag, professional product photography, dark studio background, soft studio lighting, photorealistic, bag centered",
  },
  {
    id: "pringles-original", tier: "A", filename: "pringles-original.webp",
    prompt: "Pringles original potato crisps 165g cylinder tube, iconic red Pringles tube with Mr. P logo, consumer retail snack tube, professional product photography, dark studio background, soft studio lighting, photorealistic, tube centered upright",
  },
  {
    id: "crackers-rye", tier: "B", filename: "crackers-rye.webp",
    prompt: "Rye crackers with garlic 100g in a sealed plastic bag, dark brown rye bread crackers visible through clear packaging, consumer snack format, professional product photography, dark studio background, soft front lighting, photorealistic",
  },
  {
    id: "almonds-roasted", tier: "B", filename: "almonds-roasted.webp",
    prompt: "Roasted salted almonds 200g in a sealed resealable plastic bag, golden-brown almonds visible through clear packaging, consumer retail nut format, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "peanuts-salted", tier: "B", filename: "peanuts-salted.webp",
    prompt: "Roasted salted peanuts 200g in a sealed plastic bag, golden peanuts visible through clear packaging, consumer retail snack format, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "popcorn-caramel", tier: "B", filename: "popcorn-caramel.webp",
    prompt: "Caramel popcorn 100g in a sealed consumer retail bag or box, golden caramel popcorn visible through packaging, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "dried-apricots", tier: "B", filename: "dried-apricots.webp",
    prompt: "Dried apricots kuraga 200g in a sealed transparent consumer bag, orange dried apricot pieces visible through clear packaging, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "pistachios-salted", tier: "B", filename: "pistachios-salted.webp",
    prompt: "Roasted salted pistachios 200g in sealed resealable plastic bag, green pistachios visible through clear packaging, consumer retail nut format, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "walnuts-shelled", tier: "B", filename: "walnuts-shelled.webp",
    prompt: "Shelled walnut halves 200g in a sealed transparent consumer bag, brown walnut halves visible through clear packaging, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "sunflower-seeds", tier: "B", filename: "sunflower-seeds.webp",
    prompt: "Roasted sunflower seeds semechki 300g in a sealed consumer bag, black sunflower seeds visible through packaging, traditional Russian snack format, professional product photography, dark studio background, soft front lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — PANTRY & BAKING
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "rice-long", tier: "B", filename: "rice-long.webp",
    prompt: "Long grain parboiled rice 1 kilogram paper bag with transparent window showing rice grains, consumer retail rice packaging, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "rice-basmati", tier: "A", filename: "rice-basmati.webp",
    prompt: "Premium Basmati rice 1 kilogram bag, long grain aromatic rice, premium consumer retail packaging with mountain or India imagery, professional product photography, dark studio background, soft studio lighting, photorealistic, bag centered upright",
  },
  {
    id: "spaghetti-barilla", tier: "A", filename: "spaghetti-barilla.webp",
    prompt: "Barilla spaghetti number 5, 400g blue cardboard box, iconic blue Barilla packaging with yellow logo, consumer retail pasta box, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "oatmeal-hercules", tier: "A", filename: "oatmeal-hercules.webp",
    prompt: "Gerkules Hercules oatmeal flakes 500g cardboard box, iconic blue Gerkules box with steam and oat imagery, consumer retail cereal, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "flour-premium", tier: "B", filename: "flour-premium.webp",
    prompt: "Premium wheat flour 2 kilogram paper bag, white consumer packaging with simple Muka Pshenichnaya label, professional product photography, dark studio background, soft front lighting, photorealistic, bag centered upright",
  },
  {
    id: "sugar-sand", tier: "B", filename: "sugar-sand.webp",
    prompt: "White granulated sugar 1 kilogram paper bag with transparent window, consumer retail packaging Sakhar Pesok, professional product photography, dark studio background, soft front lighting, photorealistic, white paper bag centered upright",
  },
  {
    id: "salt-marine", tier: "B", filename: "salt-marine.webp",
    prompt: "Iodized marine sea salt 500g carton box or paper package, blue and white consumer packaging Sol Morskaya, professional product photography, dark studio background, soft front lighting, photorealistic",
  },
  {
    id: "sunflower-oil-refined", tier: "B", filename: "sunflower-oil-refined.webp",
    prompt: "Refined sunflower oil 1 liter clear PET plastic bottle, golden yellow cooking oil, simple consumer label with sunflower graphic, professional product photography, dark studio background, warm soft lighting, photorealistic, bottle centered upright, golden oil color visible",
  },
  {
    id: "olive-oil-ev", tier: "A", filename: "olive-oil-ev.webp",
    prompt: "Extra Virgin olive oil 500ml dark green glass bottle, premium consumer olive oil with elegant label, professional product photography, dark studio background, warm soft back lighting, photorealistic, dark glass bottle centered, gold-green oil glow",
  },
  {
    id: "tomato-paste-pomidorka", tier: "A", filename: "tomato-paste-pomidorka.webp",
    prompt: "Pomidorka tomato paste 140g small tin can or Tetra Pak, red Pomidorka brand packaging with tomato graphics, consumer retail tomato paste, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "canned-peas-bonduelle", tier: "A", filename: "canned-peas-bonduelle.webp",
    prompt: "Bonduelle green peas 400g tin can, iconic green Bonduelle label with pea pod graphics, consumer retail canned vegetable, professional product photography, dark studio background, soft studio lighting, photorealistic, can centered upright",
  },
  {
    id: "canned-corn-bonduelle", tier: "A", filename: "canned-corn-bonduelle.webp",
    prompt: "Bonduelle sweet corn 400g tin can, iconic yellow Bonduelle label with corn cob graphics, consumer retail canned vegetable, professional product photography, dark studio background, soft studio lighting, photorealistic, can centered upright",
  },
  {
    id: "canned-tuna-oil", tier: "B", filename: "canned-tuna-oil.webp",
    prompt: "Canned tuna in oil 185g standard tin can, simple consumer label Tunets v Masle, professional product photography, dark studio background, soft studio lighting, photorealistic, can centered upright",
  },
  {
    id: "strawberry-jam", tier: "B", filename: "strawberry-jam.webp",
    prompt: "Strawberry jam 350g glass jar, red jam visible through clear glass, simple paper label Varen'ye Klubnichnoe, metallic lid, professional product photography, dark studio background, soft warm lighting, photorealistic, glass jar centered",
  },
  {
    id: "condensed-milk", tier: "A", filename: "condensed-milk.webp",
    prompt: "Rogachev condensed milk 380g tin can, iconic light blue can with yellow cow label and Sgushchennoye Moloko text, classic Soviet-style consumer packaging, professional product photography, dark studio background, soft studio lighting, photorealistic, can centered",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — FROZEN
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "pelmeni-pork", tier: "B", filename: "pelmeni-pork.webp",
    prompt: "Frozen homestyle pelmeni dumplings in a rectangular cardboard box, 800g consumer retail packaging, Domashniye Pelmeni label, blue and white box design, frozen food category, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "varenyky-potato", tier: "B", filename: "varenyky-potato.webp",
    prompt: "Frozen varenyky dumplings with potato filling in a rectangular cardboard box, 800g consumer retail packaging, yellow and white box design with Varen'ki s Kartoshkoy label, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "varenyky-cherry", tier: "B", filename: "varenyky-cherry.webp",
    prompt: "Frozen sweet varenyky with cherry filling in a consumer cardboard box, 400g retail packaging, pink and red box design with cherry illustration, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "manti-frozen", tier: "B", filename: "manti-frozen.webp",
    prompt: "Frozen manti dumplings in a consumer cardboard box, 900g retail packaging, Central Asian style, white box with Manti label and illustration, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "blini-cottage", tier: "B", filename: "blini-cottage.webp",
    prompt: "Frozen blini pancakes filled with cottage cheese in a consumer cardboard box, 400g retail packaging, white box with Bliny s Tvorogom label, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "french-fries-mccain", tier: "A", filename: "french-fries-mccain.webp",
    prompt: "McCain French fries oven chips 750g cardboard box, iconic red McCain packaging with golden fries imagery, consumer frozen food, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "frozen-strawberry", tier: "B", filename: "frozen-strawberry.webp",
    prompt: "Frozen strawberries 400g in a sealed consumer plastic bag, red frozen strawberries visible through clear packaging, Klubnika Zamorozhennaya label, professional product photography, dark studio background, soft front lighting, photorealistic",
  },
  {
    id: "frozen-vegmix", tier: "B", filename: "frozen-vegmix.webp",
    prompt: "Mexican vegetable mix frozen 400g in a sealed consumer plastic bag, colorful frozen vegetables visible through clear packaging, Meksikanskaya Smes label, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "ice-cream-vanilla", tier: "B", filename: "ice-cream-vanilla.webp",
    prompt: "Plombir vanilla ice cream 450g consumer retail box, classic white and blue Russian plombir packaging, smooth cream white ice cream, professional product photography, dark studio background, soft cool lighting, photorealistic, box centered",
  },
  {
    id: "samsa-frozen", tier: "B", filename: "samsa-frozen.webp",
    prompt: "Frozen puff pastry samsa in consumer cardboard box, 600g retail packaging, Central Asian pastry box with Samsa Sloynaya label, professional product photography, dark studio background, soft studio lighting, photorealistic, box centered upright",
  },
  {
    id: "frozen-dough-puff", tier: "B", filename: "frozen-dough-puff.webp",
    prompt: "Frozen puff pastry dough sheets in a consumer cardboard box, 400g retail packaging, Testo Sloyonoye label, white and yellow box, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — SAUCES & SPICES
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "mayo-provencal", tier: "B", filename: "mayo-provencal.webp",
    prompt: "Provansale mayonnaise 400ml soft squeeze tube, white consumer packaging labeled Provansale, professional product photography, dark studio background, soft lighting, photorealistic, tube centered upright",
  },
  {
    id: "soy-sauce-kikkoman", tier: "A", filename: "soy-sauce-kikkoman.webp",
    prompt: "Kikkoman soy sauce 150ml glass bottle with iconic red cap and label, consumer retail bottle, professional product photography, dark studio background, soft studio lighting, photorealistic, bottle centered upright, dark amber sauce visible through glass",
  },
  {
    id: "mustard-dijon", tier: "A", filename: "mustard-dijon.webp",
    prompt: "Maille Dijon mustard 215g glass jar, iconic Maille yellow label with mustard-colored lid, consumer retail jar, professional product photography, dark studio background, soft studio lighting, photorealistic, jar centered upright",
  },
  {
    id: "mustard-russian", tier: "B", filename: "mustard-russian.webp",
    prompt: "Russian spicy mustard Gortchitsa 190g glass jar, yellow consumer packaging with simple label, professional product photography, dark studio background, soft warm lighting, photorealistic, small jar centered",
  },
  {
    id: "black-pepper-ground", tier: "B", filename: "black-pepper-ground.webp",
    prompt: "Ground black pepper 50g consumer spice container or small box, dark packaging with Perec Chernyi Molotiy label, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "tabasco", tier: "A", filename: "tabasco.webp",
    prompt: "Tabasco original hot sauce 60ml small glass bottle with red cap and iconic diamond label, consumer retail condiment bottle, professional product photography, dark studio background, soft studio lighting, photorealistic, small bottle centered",
  },
  {
    id: "ketchup-classic", tier: "B", filename: "ketchup-classic.webp",
    prompt: "Tomato ketchup 500g plastic squeeze bottle, red generic consumer packaging with tomato graphic, supermarket ketchup bottle, professional product photography, dark studio background, soft studio lighting, photorealistic, bottle centered upright",
  },
  {
    id: "garlic-sauce", tier: "B", filename: "garlic-sauce.webp",
    prompt: "Garlic cream sauce 250ml glass jar or plastic bottle, white creamy sauce, simple label Sous Chesnochny, consumer condiment packaging, professional product photography, dark studio background, soft lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — READY FOOD
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "sushi-set-japan", tier: "E", filename: "sushi-set-japan.webp",
    prompt: "Japanese sushi set in a sealed black plastic retail tray with clear lid, supermarket deli ready food format, assorted nigiri and maki rolls visible through clear lid, price sticker label, professional product photography, dark background, soft cool lighting, photorealistic",
  },
  {
    id: "rolls-california", tier: "E", filename: "rolls-california.webp",
    prompt: "California rolls in sealed black plastic supermarket tray with clear lid, 8 pieces, rice on outside with sesame, sealed consumer ready food, price label sticker, professional product photography, dark background, soft cool lighting, photorealistic",
  },
  {
    id: "pizza-pepperoni-fresh", tier: "E", filename: "pizza-pepperoni-fresh.webp",
    prompt: "Fresh pepperoni pizza in a sealed cardboard retail box, supermarket fresh pizza format, Pizza Pepperoni label, visible through semi-transparent top, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "pizza-margarita-fresh", tier: "E", filename: "pizza-margarita-fresh.webp",
    prompt: "Fresh margarita pizza in a sealed retail box, supermarket ready food format, Pizza Margarita label, cardboard box with ventilation holes, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "burger-beef-fresh", tier: "E", filename: "burger-beef-fresh.webp",
    prompt: "Beef burger in a sealed consumer tray with clear lid, supermarket deli ready food packaging, black plastic tray, burger visible through clear top, price sticker label, professional product photography, dark background, soft warm lighting, photorealistic",
  },
  {
    id: "shawarma-chicken", tier: "E", filename: "shawarma-chicken.webp",
    prompt: "Chicken shawarma wrap in a sealed foil or plastic consumer tray, supermarket deli ready food, transparent packaging with Shawarma s Kuritsey label, price sticker, professional product photography, dark background, soft warm lighting, photorealistic",
  },
  {
    id: "plov-ready", tier: "E", filename: "plov-ready.webp",
    prompt: "Uzbek plov ready meal in a sealed black plastic retail tray with clear lid, supermarket deli format, yellow rice with meat and carrots visible through clear lid, price label sticker, professional product photography, dark background, soft warm lighting, photorealistic",
  },
  {
    id: "borsch-ready", tier: "E", filename: "borsch-ready.webp",
    prompt: "Borscht soup in a sealed transparent consumer container 500ml, supermarket deli ready food, dark red borscht soup visible through clear plastic, Borshch Domashniy label, professional product photography, dark background, photorealistic",
  },
  {
    id: "salad-olivie", tier: "E", filename: "salad-olivie.webp",
    prompt: "Olivier potato salad in a sealed clear plastic consumer container 300g, supermarket deli ready food, creamy Olivier salad visible, Salat Olive label, professional product photography, dark background, soft warm lighting, photorealistic",
  },
  {
    id: "salad-caesar-chicken", tier: "E", filename: "salad-caesar-chicken.webp",
    prompt: "Caesar salad with chicken in a sealed clear consumer tray, supermarket deli ready food, green romaine and chicken visible through clear lid, Salat Tsezar label, professional product photography, dark background, soft cool lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — BABY FOOD
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "baby-puree-apple-gerber", tier: "A", filename: "baby-puree-apple-gerber.webp",
    prompt: "Gerber apple baby puree 130g small glass jar, iconic Gerber baby food jar with green and white label and baby face logo, consumer retail baby food, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "baby-porridge-buckwheat", tier: "A", filename: "baby-porridge-buckwheat.webp",
    prompt: "Heinz baby buckwheat porridge 200g box for infants, Heinz baby cereal packaging with baby illustration and Grechnevaya Kasha label, consumer retail baby food, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "baby-formula-nan1", tier: "A", filename: "baby-formula-nan1.webp",
    prompt: "Nan 1 Premium infant formula 800g metal tin, Nestle Nan 1 baby formula tin with blue and white packaging and infant illustration, consumer retail baby food, professional product photography, dark studio background, soft studio lighting, photorealistic, tin centered upright",
  },
  {
    id: "baby-yogurt-agusha", tier: "A", filename: "baby-yogurt-agusha.webp",
    prompt: "Agusha children yogurt 200g plastic cup, colorful Agusha brand packaging with child illustration, consumer retail baby food, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },

  // ══════════════════════════════════════════════════════════════════════
  // PHASE 1 — HEALTH FOOD
  // ══════════════════════════════════════════════════════════════════════

  {
    id: "granola-honey", tier: "B", filename: "granola-honey.webp",
    prompt: "Honey and nut granola 400g in a resealable kraft paper or clear plastic bag, golden granola clusters visible, Granola s Myodom i Orekhami label, professional product photography, dark studio background, soft warm lighting, photorealistic",
  },
  {
    id: "chia-seeds", tier: "B", filename: "chia-seeds.webp",
    prompt: "Chia seeds 200g in a sealed consumer pouch or bag, black tiny chia seeds, simple Semena Chia label, health food packaging, professional product photography, dark studio background, soft front lighting, photorealistic",
  },
  {
    id: "oat-milk-oatly", tier: "A", filename: "oat-milk-oatly.webp",
    prompt: "Oatly Barista Edition oat milk 1 liter Tetra Pak carton, iconic cream-colored Oatly packaging with quirky typography, consumer retail plant milk, professional product photography, dark studio background, soft front lighting, photorealistic, carton centered upright",
  },
  {
    id: "rice-cakes", tier: "B", filename: "rice-cakes.webp",
    prompt: "Rice cakes khleptsy 100g in a consumer packaging bag, thin crispy rice cakes, Khlebtssy Risovye label, health snack format, professional product photography, dark studio background, soft studio lighting, photorealistic",
  },
  {
    id: "protein-bar-rex", tier: "A", filename: "protein-bar-rex.webp",
    prompt: "Protein Rex protein bar 60g in wrapper, colorful sports nutrition bar packaging with Protein Rex branding and nutrition info, consumer retail fitness food, professional product photography, dark studio background, soft studio lighting, photorealistic, bar centered",
  },
  {
    id: "oat-drink", tier: "B", filename: "oat-drink.webp",
    prompt: "Oat drink plant-based beverage 1 liter Tetra Pak carton, light beige and cream consumer packaging with oat grain graphics, Napitek Ovsyany label, professional product photography, dark studio background, soft front lighting, photorealistic, carton centered",
  },
]

// ─── TEST BATCH IDS ───────────────────────────────────────────────────────────

const TEST_BATCH = new Set([
  "eggs-c1","white-bread","tomatoes","butter-725","ketchup-heinz",
  "cola","buckwheat-uvelka","pelmeni-beef","chicken-legs","natural-honey",
])

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt"

function pollinationsUrl(prompt: string, seed: number): string {
  const encoded = encodeURIComponent(prompt)
  return `${POLLINATIONS_BASE}/${encoded}?width=600&height=800&model=flux&nologo=true&enhance=true&seed=${seed}`
}

function fetchToFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const mod  = url.startsWith("https") ? https : http

    function get(u: string, redirects = 5): void {
      mod.get(u, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && redirects > 0) {
          file.close()
          return get(res.headers.location, redirects - 1)
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }
        res.pipe(file)
        file.on("finish", () => file.close(() => resolve()))
      }).on("error", (err) => { fs.unlink(dest, () => {}); reject(err) })
    }
    get(url)
  })
}

async function toWebp(src: string, dest: string): Promise<void> {
  await sharp(src)
    .resize(600, 800, { fit: "contain", background: { r: 10, g: 10, b: 10 } })
    .webp({ quality: 88 })
    .toFile(dest)
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const outDir = path.join(process.cwd(), "public", "products")
  const tmpDir = path.join(process.cwd(), ".next", "tmp-img-gen")
  fs.mkdirSync(tmpDir, { recursive: true })

  // arg parsing
  const args     = process.argv.slice(2)
  const runAll   = args.includes("--all")
  const force    = args.includes("--force")
  const idFlag   = args.find(a => a.startsWith("--id="))?.slice(5)
                ?? args.find(a => !a.startsWith("--")) ?? ""
  const idFilter = idFlag ? idFlag.split(",").map(s => s.trim()).filter(Boolean) : []

  let queue: Entry[]
  if (idFilter.length > 0) {
    queue = PRODUCTS.filter(p => idFilter.includes(p.id))
    if (!queue.length) { console.error(`❌  No products matched --id=${idFilter}`); process.exit(1) }
  } else if (runAll) {
    queue = PRODUCTS
  } else {
    queue = PRODUCTS.filter(p => TEST_BATCH.has(p.id))
  }

  const toGen   = force ? queue : queue.filter(p => !fs.existsSync(path.join(outDir, p.filename)))
  const skipped = queue.length - toGen.length

  console.log(`\n🍅  Food Service — B2C Image Generator (Pollinations AI · Flux · FREE)`)
  console.log(`   600×800 WebP  ·  no API key needed  ·  ~3s between requests`)
  console.log(`   Mode: ${runAll ? "full P1" : idFilter.length ? "--id filter" : "test batch (10)"}  ·  Queue: ${toGen.length}${skipped ? `, ${skipped} skipped` : ""}`)
  console.log(`   Output: public/products/\n`)

  if (!toGen.length) { console.log("✅  All images exist. Use --force to regenerate."); return }

  let ok = 0, fail = 0
  const seed = Math.floor(Math.random() * 999999)

  for (let i = 0; i < toGen.length; i++) {
    const p      = toGen[i]
    const pad    = `[${String(i + 1).padStart(3)}/${toGen.length}]`
    const webp   = path.join(outDir, p.filename)
    const tmpJpg = path.join(tmpDir, `${p.id}.jpg`)

    process.stdout.write(`${pad} ${p.id} (${p.tier})  …  `)
    try {
      const url = pollinationsUrl(p.prompt, seed + i)
      await fetchToFile(url, tmpJpg)

      // verify the file is a valid image (not an error page)
      const meta = await sharp(tmpJpg).metadata()
      if (!meta.width || meta.width < 100) throw new Error("Invalid image received")

      await toWebp(tmpJpg, webp)
      fs.unlinkSync(tmpJpg)
      console.log(`✓  ${p.filename}`)
      ok++
    } catch (err: unknown) {
      try { fs.unlinkSync(tmpJpg) } catch {}
      console.log(`✗  ${err instanceof Error ? err.message : err}`)
      fail++
    }
    if (i < toGen.length - 1) await sleep(3_500) // polite rate limit
  }

  try { fs.rmdirSync(tmpDir) } catch {}

  console.log(`\n${"─".repeat(50)}`)
  console.log(`  Generated: ${ok}   Failed: ${fail}   Skipped: ${skipped}`)
  if (ok > 0) {
    console.log(`\n  Next steps:`)
    console.log(`  1. Add image: "/products/<filename>" to each product in src/data/products.ts`)
    console.log(`  2. Re-seed Supabase:  npx tsx scripts/seed-products.ts`)
    console.log(`  3. Verify images in browser at http://localhost:3000/catalog`)
  }
  if (fail > 0) console.log(`\n  Re-run to retry failed images (existing files are skipped automatically).`)
  console.log()
}

main().catch(err => { console.error("\n❌  Fatal:", err.message); process.exit(1) })
