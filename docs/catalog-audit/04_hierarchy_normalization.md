# Catalog Hierarchy Normalization — Magnum-Style

---

## Current Structure (22 categories)

```
discounts, meat, seafood, dairy, eggs, vegetables, bakery, drinks, coffee,
confectionery, snacks, grocery, frozen, sauces, oils, readyfood, baby,
healthy, packaging, sets, new, top
```

---

## Magnum KZ Reference Structure

Magnum (Kazakhstan's dominant supermarket) uses this hierarchy:

1. **Молочные продукты и яйца** — eggs inside dairy, not separate
2. **Мясо и птица** — includes deli/gastronomy (нарезки)
3. **Рыба и морепродукты** — fresh + smoked + preserved
4. **Фрукты и овощи** — fruits before vegetables in naming
5. **Хлеб и выпечка**
6. **Бакалея** — includes oils, pasta, cereals, canned goods, sauces, condiments
7. **Заморозка** — includes ice cream
8. **Напитки** — all beverages including alcohol
9. **Кондитерские изделия и снеки** — combined category
10. **Готовая еда и кулинария**
11. **Детское питание**
12. **Правильное питание** (Health food)
13. **Чай, кофе, какао** (tea first in CIS supermarket ordering)
14. **Бытовая химия** (household — not relevant for food-service)

---

## Structural Issues in Current Catalog

### Issue 1: Eggs as Standalone Category
- **Current:** `eggs` is its own category (5 products)
- **Magnum standard:** Eggs are part of "Молочные продукты и яйца"
- **Recommendation:** Keep as standalone for UX clarity (eggs are searched independently). No change needed — it's a deliberate simplification.
- **Decision:** ✅ Keep as-is

### Issue 2: Oils (Масло и жиры) as Standalone
- **Current:** 8 oil products in "Масло и жиры"
- **Conflict:** `sunflower-oil-refined` and `olive-oil-ev` are in **"Бакалея"** instead
- **Fix needed:** Move the two misfiled oils to "Масло и жиры"
- **Decision:** ⚠️ Fix category for sunflower-oil-refined and olive-oil-ev

### Issue 3: Canned Fish in Бакалея
- `canned-tuna-oil` and `canned-sardine` are in "Бакалея"
- In Magnum: canned fish is in Бакалея (correct for shelf-stable products)
- **Decision:** ✅ Keep as-is

### Issue 4: Oatmeal Drink in Two Categories
- `oat-drink` ("Напиток овсяный Oatly") is in **"Напитки"**
- `oat-milk-oatly` ("Молоко овсяное Oatly Barista") is in **"Здоровое питание"**
- Same brand, same product type, split across categories
- **Decision:** ⚠️ Both should be in "Здоровое питание" OR "Молочные продукты". Move `oat-drink` to "Здоровое питание"

### Issue 5: Chocolate Milka Duplicated
- `chocolate-milka` ("Шоколад Milka молочный", id: chocolate-milka, no image) in Кондитерские
- `chocolate-bar-milka` ("Шоколад Milka молочный", id: chocolate-bar-milka, **has image**) also in Кондитерские
- **Same product** with slightly different descriptions, same price ₸490, same unit 90г
- **Decision:** ⚠️ Remove `chocolate-milka` (no image), keep `chocolate-bar-milka` (has image: chocolate-bar.webp)

---

## Products in Wrong Categories

| Product ID | Title | Current Category | Should Be |
|-----------|-------|-----------------|-----------|
| sunflower-oil-refined | Масло подсолнечное рафинированное | Бакалея | Масло и жиры |
| olive-oil-ev | Масло оливковое Extra Virgin | Бакалея | Масло и жиры |
| oat-drink | Напиток овсяный Oatly | Напитки | Здоровое питание |

---

## Category Naming Alignment

Current order in categories.ts vs Magnum ordering:

| Current | Magnum Standard | Change? |
|---------|----------------|---------|
| "Кофе, чай и какао" | "Чай, кофе, какао" | Minor — CIS stores put tea first |
| "Овощи и фрукты" | "Фрукты и овощи" | Minor — fruits first in retail |
| "Упаковка HoReCa" | Not applicable to B2C | Review need |

**Recommendation on "Упаковка HoReCa":**
- This is a B2B category. For B2C customers it looks out of place.
- Option A: Keep hidden by default, only visible with B2B account flag
- Option B: Rename to "Для кухни и кафе" and include only consumer-facing items
- **Decision:** No change until auth/role system is implemented. Keep as-is.

---

## Recommended Minimal Fixes (Low Risk)

1. Move `sunflower-oil-refined` → category: "Масло и жиры"
2. Move `olive-oil-ev` → category: "Масло и жиры"
3. Move `oat-drink` → category: "Здоровое питание"
4. Remove duplicate `chocolate-milka` (keep `chocolate-bar-milka`)

**Products to touch: 4 edits in products.ts, 1 deletion**

---

## Category Count After Fixes

| Category | Current Count | After Fix |
|---------|--------------|-----------|
| Бакалея | ~28 products | -2 (oils moved) = ~26 |
| Масло и жиры | 8 products | +2 = 10 |
| Напитки | 25 products | -1 (oat drink moved) = 24 |
| Здоровое питание | 14 products | +1 = 15 |
| Кондитерские изделия | 24 products | -1 (duplicate removed) = 23 |
