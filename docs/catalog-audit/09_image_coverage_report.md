# Image Coverage Report
**Date:** 2026-05-29  
**Status:** Active — 62% coverage

---

## Summary

| Status | Count | % |
|--------|-------|---|
| ✅ Real supermarket photo (Magnum CDN) | 91 | 24% |
| 🔶 Matched product photo (OpenFoodFacts) | 149 | 38% |
| ❌ Needs source image (neutral placeholder shown) | 147 | 38% |
| **Total products** | **387** | |

**WebP files on disk:** 242  
**Products with image field in products.ts:** 240  
**Coverage jump:** 12% → 53% → 62% over two sessions

---

## Source Breakdown

### Magnum CDN (91 products)
Curated explicit matches from `magnum-source.json`. High-quality white-background studio photos, consumer packaging.  
Script: `scripts/batch-fetch-images.ts --magnum`

### OpenFoodFacts (149 products)
Auto-matched from OFf global product database + explicit `OFf_QUERY_OVERRIDES` map (~130 override entries).  
Quality audited via `scripts/audit-off-matches.ts`.  
Script: `scripts/batch-fetch-images.ts --off`

---

## Category Coverage

| Category | Coverage |
|----------|---------|
| Яйца | 5/5 (100%) |
| Бакалея | 30/35 (86%) |
| Снеки | 17/20 (85%) |
| Кофе, чай и какао | 14/17 (82%) |
| Молочные продукты | 22/28 (79%) |
| Хлеб и выпечка | 15/20 (75%) |
| Мясо и птица | 21/28 (75%) |
| Напитки | 16/24 (67%) |
| Рыба и морепродукты | 15/26 (58%) |
| Кондитерские изделия | 17/25 (68%) |
| Соусы и специи | 15/27 (56%) |
| Заморозка | 13/22 (59%) |
| Здоровое питание | 9/16 (56%) |
| Готовая еда | 8/15 (53%) |
| Масло и жиры | 5/12 (42%) |
| Детское питание | 7/15 (47%) |
| Овощи и фрукты | 11/30 (37%) |
| Упаковка HoReCa | 0/12 (0%) |
| Наборы | 0/10 (0%) |

---

## Products WITHOUT Images (~147 remaining)

### Овощи и фрукты (19 missing)
Fresh produce without barcodes — OFf mostly can't match these.  
**Covered by OFf:** tomatoes, carrots, mandarins, strawberry, zucchini, beet, spinach, pomegranate, mango, kiwi  
**Still missing:** potatoes, onions, cabbage, cucumbers, bell-pepper, eggplant, bananas, oranges, grapes, pears, avocado, pineapple, lemon, garlic, mushrooms, dill, parsley, blueberry, cherry  
**Only source:** Magnum weekly catalog when seasonal items appear. Use browser automation on arbuz.kz.

### Упаковка HoReCa (12 missing)
B2B packaging — low priority, placeholder acceptable.

### Наборы (10 missing)
Composite sets — no single product photo exists.

### Other gaps
- Dairy: cream-10, cream-33, cream-38, ryazhenka, cottage-cheese-soft, cheese-adygei
- Fish/seafood: salmon-lightly-salted, mussels, red-caviar, cod-fillet, pike-perch, capelin-smoked, octopus-mini
- Meat: chicken-legs, pork-minced, beef-liver, chorizo, whole-chicken, chicken-liver, carbonate
- Baby food: most CIS-brand baby products not in OFf
- Frozen: varenyky, blini, samsa, frozen berries
- CIS confectionery: raffaello, korovka candy, baklava, gingerbread, zephyr
- Specialty sauces: tabasco, worcestershire, teriyaki, unagi

---

## Acquisition Strategy (Remaining 147)

### Option A — Magnum Weekly Update (automatic)
```bash
npx tsx scripts/batch-fetch-images.ts --update-magnum
npx tsx scripts/batch-fetch-images.ts --magnum
```
Magnum discount catalog rotates ~40-60 products weekly. Fresh produce appears seasonally.

### Option B — Browser Automation on arbuz.kz / kaspi.kz
For fresh produce and local CIS brands:
- Navigate to arbuz.kz product pages (Kazakhstani grocery delivery)
- Find the specific product
- Note CDN image URL
- Add to `MAGNUM_MATCHES` in `scripts/batch-fetch-images.ts`

### Option C — Accept Placeholders for Non-Critical Categories
HoReCa packaging and sets are B2B items — placeholder is acceptable.
CIS confectionery (baklava, zephyr, etc.) — low catalog priority.

---

## Quality Standards

### ACCEPTED image sources:
- Magnum.kz CDN photos (white background, studio quality)
- OpenFoodFacts brand photos (when product type exactly matches)

### REJECTED (automated audit removes these):
- OFf photos where name matches REJECT_KEYWORDS in `audit-off-matches.ts`
- Products in `ALWAYS_REJECT_CATEGORIES` (sets, pizza boxes, raw unpackaged meat)
- AI-generated images (Pollinations, DALL-E, Flux)
- Emoji icons
- Food Service branded packaging

---

## Pipeline Scripts

| Script | Purpose |
|--------|---------|
| `scripts/batch-fetch-images.ts` | Main pipeline: Magnum + OFf, checkpoint saves, 130+ explicit OFf query overrides |
| `scripts/audit-off-matches.ts` | Quality audit: removes bad OFf matches via REJECT_KEYWORDS |
| `scripts/update-product-images.ts` | Updates products.ts: adds new refs, removes stale refs |
| `scripts/seed-products.ts` | Reseeds Supabase from products.ts |

### Full pipeline run:
```bash
npx tsx scripts/batch-fetch-images.ts --magnum   # Magnum CDN first
npx tsx scripts/batch-fetch-images.ts --off       # OFf for remainder
npx tsx scripts/audit-off-matches.ts              # Remove bad OFf matches
npx tsx scripts/update-product-images.ts          # Update products.ts
npx tsx scripts/seed-products.ts                  # Reseed Supabase
```
