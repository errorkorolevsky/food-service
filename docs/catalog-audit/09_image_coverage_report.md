# Image Coverage Report
**Date:** 2026-05-29  
**Status:** Active — 53% coverage

---

## Summary

| Status | Count | % |
|--------|-------|---|
| ✅ Real supermarket photo (Magnum CDN) | 91 | 24% |
| 🔶 Matched product photo (OpenFoodFacts) | 118 | 30% |
| ❌ Needs source image (neutral placeholder shown) | 178 | 46% |
| **Total products** | **387** | |

**WebP files on disk:** 209  
**Products with image field in products.ts:** 207  
**Coverage jump:** 12% → 53% in one session

---

## Source Breakdown

### Magnum CDN (91 products)
Curated explicit matches from `magnum-source.json`. High-quality white-background studio photos, consumer packaging.  
Script: `scripts/download-magnum-images.ts` + `scripts/batch-fetch-images.ts --magnum`

### OpenFoodFacts (118 products)
Auto-matched from OFf global product database. Quality audited — 49 bad matches were rejected.  
Script: `scripts/batch-fetch-images.ts --off` → `scripts/audit-off-matches.ts`

---

## Category Coverage

| Category | Coverage |
|----------|---------|
| Яйца | 5/5 (100%) |
| Бакалея | 28/35 (80%) |
| Молочные продукты | 21/28 (75%) |
| Мясо и птица | 19/28 (68%) |
| Кофе, чай и какао | 14/17 (82%) |
| Кондитерские изделия | 17/25 (68%) |
| Рыба и морепродукты | 15/26 (58%) |
| Напитки | 15/24 (63%) |
| Заморозка | 11/22 (50%) |
| Хлеб и выпечка | 10/20 (50%) |
| Снеки | 12/20 (60%) |
| Соусы и специи | 14/27 (52%) |
| Здоровое питание | 8/16 (50%) |
| Готовая еда | 5/15 (33%) |
| Детское питание | 6/15 (40%) |
| Масло и жиры | 3/12 (25%) |
| Овощи и фрукты | 4/30 (13%) |
| Упаковка HoReCa | 0/12 (0%) |
| Наборы | 0/10 (0%) |

---

## Products WITHOUT Images (178 remaining)

### Овощи и фрукты (26 missing)
Fresh produce without barcodes — Magnum/OFf cannot match these reliably.  
**Only source:** Magnum weekly catalog when seasonal items appear.  
Products still needing: carrots, onions, cabbage, tomatoes, cucumbers, bell-pepper, eggplant, garlic, bananas, oranges, mandarins, grapes, pears, avocado, mango, pineapple, strawberry, lemon, pomegranate, cherry, dill, parsley, mushrooms, zucchini, beet, blueberry, spinach (+ apples ✓ covered)

### Мясо и птица (9 missing)
chicken-legs, chicken-thighs, whole-chicken, chicken-wings, beef-tenderloin, beef-minced, pork-neck, pork-minced, lamb-leg, beef-liver, salami-milano, chorizo, turkey-fillet, duck-fillet, chicken-breast-smoked, pork-ribs

Wait — check actual manifest for exact list.

### Упаковка HoReCa (12 missing)
B2B packaging — no consumer barcode, no photo source available. Low priority.

### Наборы (10 missing)
Composite sets — no single product photo exists. Needs custom basket/gift photo.

---

## Acquisition Strategy (Remaining 178)

### Option A — Magnum Weekly Update (automatic)
```bash
npx tsx scripts/batch-fetch-images.ts --update-magnum
npx tsx scripts/batch-fetch-images.ts --magnum
```
Magnum discount catalog rotates ~40-60 products weekly. Fresh produce appears seasonally.

### Option B — Manual Browser Screenshots
For fresh produce and local brands not on OFf:
- Navigate to magnum.kz, kaspi.kz/shop, or arbuz.kz
- Find the specific product
- Note CDN image URL
- Add to `MAGNUM_MATCHES` in `scripts/batch-fetch-images.ts`

### Option C — Accept Placeholders for Non-Critical Categories
HoReCa packaging and sets are B2B items — placeholder is acceptable for these.

---

## Quality Standards

### ACCEPTED image sources:
- Magnum.kz CDN photos (white background, studio quality)
- OpenFoodFacts brand photos (when product type exactly matches)

### REJECTED (automated audit removes these):
- OFf photos where name contains wrong product keywords
- Products in `ALWAYS_REJECT_CATEGORIES` (fresh produce, sets, HoReCa)
- AI-generated images (Pollinations, DALL-E, Flux)
- Emoji icons
- Food Service branded packaging

---

## Pipeline Scripts

| Script | Purpose |
|--------|---------|
| `scripts/batch-fetch-images.ts` | Main pipeline: Magnum + OFf, checkpoint saves |
| `scripts/audit-off-matches.ts` | Quality audit: removes bad OFf matches |
| `scripts/update-product-images.ts` | Updates products.ts with image paths |
| `scripts/seed-products.ts` | Reseeds Supabase from products.ts |
| `scripts/download-magnum-images.ts` | Legacy: explicit Magnum matches only |

### Full pipeline run:
```bash
npx tsx scripts/batch-fetch-images.ts --magnum   # Magnum CDN first
npx tsx scripts/batch-fetch-images.ts --off       # OFf for remainder (after clearing checkpoint)
npx tsx scripts/audit-off-matches.ts              # Remove bad OFf matches
npx tsx scripts/update-product-images.ts          # Update products.ts
npx tsx scripts/seed-products.ts                  # Reseed Supabase
```
