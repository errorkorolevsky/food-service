# Image Strategy — Food Service Catalog
**Date:** 2026-05-28  
**Status:** Active — governs all image generation going forward

---

## Visual Inspection Findings

### What was found across 20+ images

The entire catalog (79 images) was generated as a custom **B2B wholesale brand** under "FOOD SERVICE KAZAKHSTAN":
- 66+ images: custom dark premium packaging with "FOOD SERVICE KAZAKHSTAN" logo
- ~10 images: real brands (Hellmann's, Kikkoman, Philadelphia) in catering/HoReCa sizes (1.8L–10kg)
- **1 correct image: `lays-chips.webp`** — authentic consumer Lay's bag

### Specific failures found

| File | Problem |
|------|---------|
| salmon-fillet.webp | FS branded vacuum pack 1kg — correct product, wrong brand |
| milk-whole.webp | FS branded tetrapak 3.5% — used for 2.5% product |
| avocado.webp | FS branded 1kg bag — product is sold per piece (1шт) |
| dark-chocolate.webp | FS branded 1kg Belgian couverture — product is 100g consumer bar |
| gouda.webp | FS branded 1kg slices — product is 200g consumer pack |
| mozzarella.webp | FS branded 2.5kg pizza mozzarella — product is 125g balls in brine |
| nori-gold.webp | FS branded 50 листов — product is 10 листов |
| wasabi.webp | FS branded 1kg tube — product is 43г consumer tube |
| teriyaki-sauce.webp | FS branded 1.8L jug — product is 250ml consumer bottle |
| butter-82.webp | FS branded 1kg block — product is 200g pack |
| mayo.webp | Hellmann's 10kg catering bucket — product is 400g consumer bottle |
| soy-sauce.webp | Kikkoman 1.8L catering jug — product is 150ml consumer bottle |
| cream-cheese-cake.webp | Président 1.4kg professional tub — product is cheesecake portion |
| cream-cheese-rolls.webp | Philadelphia Professional 1kg — used for California rolls |

### Action taken
All 162 image files moved to `public/products/_archived/`  
Only `lays-chips.webp` retained as the **visual reference standard**

---

## Visual Reference: What CORRECT Looks Like

`lays-chips.webp` defines the correct direction:
- Real consumer packaging (Lay's yellow bag, Russian text "Классические")
- Correct retail size (~150г, matches product description)
- Dark studio background (consistent with app theme)
- Product-forward: product fills 70%+ of frame
- No custom branding overlays
- Professional product photography aesthetic

---

## New Visual Standard

### Guiding principle
> Every product image must look like it was photographed from a real supermarket shelf item — the package a customer would actually receive at their door.

### Background
- **Dark background**: #0A0A0A–#141414 gradient, soft reflective surface
- Consistent across ALL products — matches app dark theme
- No white backgrounds (doesn't match UI), no lifestyle backgrounds

### Lighting
- Primary: soft front-left key light
- Fill: weak right-side fill to prevent harsh shadows
- Subtle surface reflection below product (wetlook marble/stone)
- No rim lighting (too cinematic for product catalog)
- Result: premium but grounded, not dramatic

### Crop / framing
- Portrait orientation: 3:4 ratio (matches ProductCard)
- Product centered, fills 60–75% of frame
- Slight breathing room on all sides
- No tilt, no lifestyle props, no food styling around product

### Product appearance
- **Packaged goods**: show the actual retail package (bag, box, bottle, carton)
- **Fresh produce**: show the product as you'd receive it — in a net/bag, or loose on the surface
- **Ready food**: show in a supermarket-style sealed tray, not restaurant plating
- **Size**: must visually match the unit in the product description (200г butter ≠ 1kg block)

### What must NEVER appear
- "FOOD SERVICE KAZAKHSTAN" or any custom brand logo
- Catering/wholesale sizes (1.8L jugs, 10kg buckets, 2.5kg blocks)
- Restaurant-plated food presentation
- Lifestyle props (napkins, utensils, herbs scattered around)
- Watermarks or placeholder text
- Glowing effects, neon, impossible lighting

### Photography quality signals
- Sharp focus on product surface
- Packaging text legible (if present)
- Color accuracy: salmon should look orange-pink, not red or pale
- Packaging material visible: plastic wrap texture, paper grain, glass refraction

---

## Image Generation Tiers

### Tier A — Real Branded Consumer Products
Products that have established real-world packaging.  
**Approach:** AI recreation of real consumer packaging  
**Style:** Exact brand colors + typography recreation, correct consumer size

Examples: Lay's chips, Heinz ketchup, Barilla pasta, Bonduelle peas, Snickers, Milka, Nescafé, Kikkoman 150ml, Evian 500ml

**Prompt structure:**
```
[Brand name] [product name] [size] packaging, professional product photography, 
dark background, studio lighting, photorealistic, consumer retail package, 
no text errors, sharp focus
```

**Key constraint:** Size must match product unit (150ml not 1.8L, 400г not 10kg)

---

### Tier B — Generic Packaged Products
Products that exist as generic/store-brand items — no specific brand required.  
**Approach:** AI-generated realistic generic packaging  
**Style:** Clean, generic but professional packaging — like a mid-tier supermarket private label

Examples: Farmer's eggs (carton), sour cream (plastic cup), kefir (bottle), buckwheat (brown paper bag), honey (glass jar)

**Prompt structure:**
```
[Product name] in [package type], [size] label, generic supermarket packaging, 
professional product photography, dark studio background, photorealistic, 
no logos or brand names, clean packaging design
```

---

### Tier C — Fresh Produce
Unpackaged or minimally packaged fresh items.  
**Approach:** Natural product photography  
**Style:** Fresh, natural appearance — as you'd see in a supermarket produce section or bagged

Examples: tomatoes, carrots, potatoes, avocado, bananas, mushrooms, herbs

**Prompt structure for produce:**
```
Fresh [product name], supermarket produce photography, dark background, 
studio lighting, [loose/in net bag/in clear bag], photorealistic, 
vibrant natural colors, no artificial styling
```

**Note:** Herbs (dill, parsley) → show as a tied bunch. Potatoes/carrots → show in a mesh net bag with weight label.

---

### Tier D — Raw Meat & Fish
Fresh or vacuum-sealed protein products.  
**Approach:** Vacuum-sealed retail packaging with minimal label  
**Style:** Clear plastic vacuum pack, simple label with weight info

Examples: chicken fillet, salmon, beef

**Prompt structure:**
```
[Product name], vacuum-sealed retail package, clear plastic packaging, 
[weight] label, professional food photography, dark background, 
fresh appearance, no logos or branding
```

---

### Tier E — Ready Food / Готовая еда
Prepared foods sold in supermarket format.  
**Approach:** Sealed supermarket tray  
**Style:** Sealed plastic tray with paper/foil lid — like Magnum or Перекрёсток deli section

Examples: sushi sets, rolls, burgers, ready salads, plov, borsch

**Prompt structure:**
```
[Product name], sealed supermarket deli tray, black plastic tray with clear lid, 
price sticker label, professional product photography, dark background, 
photorealistic, supermarket packaging style
```

**NOT:** restaurant plating, food styling, open bowls, chopsticks on the side

---

## Generation Priority Tiers

### P1 — Generate First (highest traffic products)
~80 products. All `isPopular: true` + `isHit: true` items across major categories.

Focus: Meat, Dairy, Produce, Bread, Beverages, Snacks

| Category | Count | Why first |
|---------|-------|----------|
| Мясо и птица | 15 | High conversion, top nav |
| Молочные продукты | 12 | Daily purchase items |
| Овощи и фрукты | 20 | High browse frequency |
| Хлеб | 8 | Daily staples |
| Напитки (branded) | 8 | Immediately recognizable |
| Снеки | 8 | High impulse buy |

### P2 — Generate Second
~130 products. Remaining standard catalog items.

### P3 — Generate Last
~30 products. Low-traffic, specialty, HoReCa, sets.

---

## Test Batch: 10 Products

These 10 were selected to test all 5 tiers and verify the visual standard before scaling.

| # | ID | Title | Tier | Test goal |
|---|----|-------|------|-----------|
| 1 | eggs-c1 | Яйца куриные С1 (10шт) | B | Generic packaging, immediately recognizable |
| 2 | white-bread | Хлеб белый нарезной (500г) | B | Generic bag, bread texture |
| 3 | tomatoes | Помидоры (1кг) | C | Fresh produce in net bag |
| 4 | butter-725 | Масло сливочное 72.5% (200г) | B | Butter block in foil/paper, correct 200г size |
| 5 | ketchup-heinz | Кетчуп Heinz томатный (570г) | A | Real brand recreation |
| 6 | cola | Кока-Кола 1.5л | A | Real brand, large bottle |
| 7 | buckwheat-uvelka | Гречка ядрица Увелка (1кг) | A | CIS brand, paper bag |
| 8 | pelmeni-beef | Пельмени Сибирские (900г) | B | Frozen category, box packaging |
| 9 | chicken-legs | Куриные ножки (1кг) | D | Raw meat vacuum pack |
| 10 | natural-honey | Мёд цветочный (500г) | B | Glass jar premium item |

---

## Test Batch Prompts

Optimized for DALL-E 3 (also compatible with Midjourney v6, Stable Diffusion XL).

---

### 1. eggs-c1 — Яйца куриные С1

```
10 chicken eggs in an open cardboard egg carton, consumer retail packaging, 
beige/brown cardboard carton with simple label "Яйца С1 10шт", 
professional product photography, dark charcoal background, 
soft studio lighting, product centered, photorealistic, 
sharp focus on egg textures, no branding logos
```
**Filename:** `/products/eggs-c1.webp`

---

### 2. white-bread — Хлеб белый нарезной

```
Sliced white bread loaf in a clear plastic bag with paper label, 
500g supermarket bread packaging, consumer retail format, 
professional product photography, dark studio background, 
soft front lighting, loaf visible through plastic, photorealistic, 
no brand names or logos
```
**Filename:** `/products/white-bread.webp`

---

### 3. tomatoes — Помидоры

```
Fresh ripe red tomatoes in a plastic mesh net bag with a weight tag, 
1 kilogram, supermarket produce packaging, bright red tomatoes, 
professional product photography, dark charcoal background, 
studio lighting, photorealistic, vibrant natural color, no brand logos
```
**Filename:** `/products/tomatoes.webp`

---

### 4. butter-725 — Масло сливочное 72.5%

```
Butter block wrapped in gold foil and white paper packaging, 
consumer retail butter 200 grams, label reads "Масло Сливочное 72.5%", 
professional product photography, dark studio background, 
soft warm lighting, photorealistic, generic dairy packaging, 
no brand logos
```
**Filename:** `/products/butter-725.webp`

---

### 5. ketchup-heinz — Кетчуп Heinz томатный

```
Heinz tomato ketchup 570g plastic squeeze bottle, 
iconic red Heinz label with keystone logo, 
consumer retail bottle, professional product photography, 
dark studio background, soft studio lighting, photorealistic, 
bottle centered upright, sharp label detail
```
**Filename:** `/products/ketchup-heinz.webp`

---

### 6. cola — Кока-Кола 1.5л

```
Coca-Cola 1.5 liter clear plastic PET bottle with red cap, 
iconic Coca-Cola red label with white script logo and Cyrillic text, 
consumer retail bottle, professional product photography, 
dark studio background, soft studio lighting, photorealistic, 
bottle centered, label facing forward, condensation on bottle surface
```
**Filename:** `/products/cola.webp`

---

### 7. buckwheat-uvelka — Гречка ядрица Увелка

```
Uvelka (Увелка) buckwheat groats 1kg paper bag, 
cream/beige paper packaging with green and orange Uvelka branding, 
consumer retail grain bag, professional product photography, 
dark studio background, soft studio lighting, photorealistic, 
bag centered upright, brand label visible
```
**Filename:** `/products/buckwheat-uvelka.webp`

---

### 8. pelmeni-beef — Пельмени Сибирские говяжьи

```
Frozen Russian pelmeni dumplings in a rectangular cardboard box, 
900 gram consumer retail packaging, blue and white box design, 
"Пельмени Сибирские" label visible, frozen food category, 
professional product photography, dark studio background, 
soft studio lighting, photorealistic, box centered upright
```
**Filename:** `/products/pelmeni-beef.webp`

---

### 9. chicken-legs — Куриные ножки

```
Raw chicken drumsticks in a clear plastic vacuum-sealed tray, 
1 kilogram retail meat packaging, white polystyrene tray with transparent wrap, 
simple weight label sticker, professional product photography, 
dark studio background, soft cool lighting, photorealistic, 
fresh raw chicken appearance, no artificial colors
```
**Filename:** `/products/chicken-legs.webp`

---

### 10. natural-honey — Мёд цветочный натуральный

```
Clear glass jar of golden flower honey 500 grams, 
simple paper label "Мёд цветочный натуральный", 
golden amber honey visible through glass, metallic lid, 
professional product photography, dark studio background, 
warm golden lighting, photorealistic, glass jar centered, 
honey glow from backlight, premium artisan look
```
**Filename:** `/products/natural-honey.webp`

---

## Approval Checklist for Each Test Image

Before accepting any generated image into the catalog, verify:

- [ ] Correct product type (not wholesale/catering)
- [ ] Correct size/weight visible (200г butter not 1кг)
- [ ] No "FOOD SERVICE KAZAKHSTAN" or any unexpected logo
- [ ] Dark background consistent with UI theme
- [ ] Product fills 60–75% of frame
- [ ] Packaging looks like a real consumer product
- [ ] Text on packaging (if any) is legible and correct language
- [ ] Color accurate (salmon = orange-pink, tomatoes = red, butter = yellow)
- [ ] No AI hallucination artifacts (distorted text, impossible geometry)

---

## Scale-Up Rule

**Only begin P1 batch generation after:**
1. All 10 test images approved against the checklist
2. Visual consistency confirmed across all 10 (same background, same lighting feel)
3. At least 1 image from each tier (A–E) confirmed acceptable

If any tier fails: revise that tier's prompt structure before scaling.
