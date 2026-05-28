# Image Coverage Report
**Date:** 2026-05-29  
**Status:** Work in progress — 11% coverage

---

## Summary

| Status | Count | % |
|--------|-------|---|
| ✅ Real supermarket photo | 44 | 11% |
| ⬜ Needs source image (neutral placeholder shown) | 343 | 89% |
| **Total products** | **387** | |

---

## Products WITH Real Images (44)

All sourced from Magnum.kz CDN (professional studio photos, white background, consumer packaging).

| ID | Category | Source match |
|----|----------|-------------|
| chicken-fillet | Мясо и птица | Алель chicken fillet kg ✓ |
| milk-25 | Молочные продукты | Молочный Мир 2.5% 900ml ✓ |
| milk-32 | Молочные продукты | Adal 3.2% 925ml ≈ |
| kefir-25 | Молочные продукты | Молочный Мир kefir 2.5% ✓ |
| yogurt-natural | Молочные продукты | Danone Activia pitevoy 650g ≈ |
| sour-cream-20 | Молочные продукты | Молочный Мир smetana 20% ✓ |
| butter-725 | Молочные продукты | Молочный Мир butter 72.5% 180g ✓ |
| curd-snack | Молочные продукты | Prostokvashino snack 40g ≈ |
| eggs-c1 | Яйца | Lugovoye Pole eggs 30pcs ≈ |
| eggs-c0 | Яйца | Lugovoye Pole eggs 30pcs ≈ (same image) |
| water-still | Напитки | ASU still 1.5L ✓ |
| water-sparkling | Напитки | Samal sparkling 1.5L ≈ |
| apple-juice | Напитки | Da-Da juice 950ml ≈ |
| orange-juice | Напитки | Da-Da apple nector 1.9L ≈ |
| energy-redbull | Напитки | Red Bull 250ml ✓ |
| iced-tea | Напитки | Fuse Tea 1.5L ≈ |
| chocolate-milk-drink | Напитки | Lugovoye Pole cocktail 200ml ≈ |
| coffee-ground-jacobs | Кофе, чай и какао | Jacobs Gold 190g ✓ |
| coffee-instant-nescafe | Кофе, чай и какао | Nescafe Gold 320g ✓ |
| black-tea-akbar | Кофе, чай и какао | Bayce tea 100 bags ≈ |
| green-tea-greenfield | Кофе, чай и какао | Tess tea 100 bags ≈ |
| cacao-nesquik | Кофе, чай и какао | Nesquik 400g ✓ |
| jubilee-cookies | Кондитерские изделия | Kunde cookies ≈ |
| halva-sunflower | Кондитерские изделия | Alpen Gold spread (wrong product type!) ✗ |
| snickers | Кондитерские изделия | Snickers+Mars+Twix promo group (multi-product!) ≈ |
| kitkat | Кондитерские изделия | KitKat 41.5g ✓ |
| oreo | Кондитерские изделия | Oreo 228g ✓ |
| nutella | Кондитерские изделия | Milka nut paste (wrong brand!) ≈ |
| chocolate-bar-milka | Кондитерские изделия | Milka 80-97g ✓ |
| lays-classic | Снеки | Lay's 70g (original gold standard) ✓ |
| crackers-rye | Снеки | Juzon crackers 150g ≈ |
| rice-long | Бакалея | Arnau rice 3kg ≈ |
| spaghetti-barilla | Бакалея | Makfa penne 400g (wrong pasta shape!) ≈ |
| flour-premium | Бакалея | Tsesna flour 2kg ✓ |
| sugar-sand | Бакалея | Vsyo v Dom sugar 800g ≈ |
| tomato-paste-pomidorka | Бакалея | Tsin-Kaz 198g ≈ |
| canned-peas-bonduelle | Бакалея | Globus peas 425ml ≈ |
| canned-corn-bonduelle | Бакалея | Globus corn 425ml ≈ |
| canned-tuna-oil | Бакалея | Natural tuna 185g ✓ |
| pelmeni-beef | Заморозка | Meat to Eat pelmeni 1kg ✓ |
| mayo-provencal | Соусы и специи | Makheev Provansale 770g ✓ |
| pizza-pepperoni-fresh | Готовая еда | Frozen pepperoni pizza 600g ✓ |
| baby-puree-apple-gerber | Детское питание | FrutoNyanya puree 90g ≈ |
| baby-juice-agusha | Детское питание | Agusha juice 200g ✓ |

**Legend:** ✓ = exact match, ≈ = close enough (same product type, different brand/size), ✗ = wrong

**Images requiring replacement:**
- `halva-sunflower` → currently shows Alpen Gold chocolate spread (completely wrong)
- `snickers` → shows Snickers+Twix+Mars group promo (acceptable as placeholder)
- `nutella` → shows Milka paste instead of Nutella (acceptable as similar product)
- `spaghetti-barilla` → shows penne (Makfa) not spaghetti (acceptable shape difference)

---

## Needs Source Image by Category (343 products)

| Category | Count | Priority | Notes |
|----------|-------|----------|-------|
| Овощи и фрукты | 30 | P1 | Fresh produce — Magnum seasonal, check weekly |
| Мясо и птица | 27 | P1 | Raw meat — need vacuum pack photos |
| Бакалея | 27 | P1 | Most are branded, findable on Magnum |
| Рыба и морепродукты | 26 | P1 | Salmon, shrimp etc |
| Соусы и специи | 26 | P1 | Ketchup, mustard, spices |
| Кондитерские изделия | 18 | P1 | Raffaello, Ferrero, candy |
| Снеки | 18 | P1 | Pringles, nuts, seeds |
| Заморозка | 21 | P2 | Varenyky, manti, fries, ice cream |
| Молочные продукты | 21 | P2 | Cheese varieties, cream, cheese spreads |
| Хлеб и выпечка | 20 | P2 | Bread loaves, pastries |
| Здоровое питание | 16 | P2 | Granola, chia, protein |
| Детское питание | 13 | P2 | Baby formula, porridge |
| Напитки | 17 | P2 | Cola, Pepsi need exact match |
| Кофе, чай и какао | 12 | P2 | Lavazza, Nespresso capsules |
| Масло и жиры | 12 | P2 | Olive oil, butter varieties |
| Наборы | 10 | P3 | Sets — low priority |
| Упаковка HoReCa | 12 | P3 | B2B items — low priority |
| Яйца | 3 | P2 | Farm eggs, C0 variety |

---

## UI Status

| Component | Fallback | Status |
|-----------|---------|--------|
| ProductCard | Neutral grey placeholder + "Фото скоро" | ✅ Fixed |
| ProductQuickView | Neutral grey placeholder + "Фото скоро" | ✅ Fixed |
| ProductClient (detail page) | Neutral grey placeholder + "Фото скоро" | ✅ Fixed |
| GlobalSearch results | Neutral grey icon | ✅ Fixed |
| Cart / Checkout items | Emoji (acceptable — small line items) | OK |
| Admin dashboard | Emoji (internal tool) | OK |

---

## Next Source Acquisition

**Option A — Magnum weekly update:**  
Run `npx tsx scripts/download-magnum-images.ts` each week.  
Magnum discount catalog rotates ~40-60 products weekly.  
At current rate: ~100% coverage in 6-8 weeks.

**Option B — Manual priority batch:**  
Focus on top 30 products (isHit + isPopular) without images.  
Navigate manually to magnum.kz and note product image URLs.

**DO NOT use:**
- AI-generated images (Pollinations, DALL-E, Flux) — rejected, cartoon quality
- Emoji icons — removed from product display
- Branded Food Service packaging — all archived
