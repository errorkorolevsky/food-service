# Catalog Audit Summary
**Date:** 2026-05-28  
**Scope:** Full audit of 388 products + 82 image files

---

## Totals

| Metric | Count |
|--------|-------|
| Total products | 388 |
| Products with image | 83 |
| Products without image | 305 |
| Unique image files on disk (.webp) | 82 |
| Images with correct product match | 74 |
| Images with mismatches / issues | 8 |
| Shared/duplicate image assignments | 1 pair (spicy-sauce) |

---

## Critical Issues (Fix Before Image Generation)

### P0 — Duplicate Image
- `spicy-sauce.webp` assigned to **both** `ketchup-hot` AND `tabasco` — two distinct product types showing identical image

### P0 — Product/Image Type Mismatch
- `sugar-sand` ("Сахар-песок белый") → `sugar-powder.webp` — granulated sugar ≠ powdered/icing sugar. Completely different product visually
- `vanilla-extract` ("Ванилин для выпечки") → `vanilla-syrup.webp` — dry powder packet ≠ liquid syrup bottle

### P1 — Style/Brand Conflicts
- `croissant` (fresh bakery item) → `croissant-frozen.webp` — file name implies frozen product
- `ketchup-hot` ("Кетчуп Чили") → `spicy-sauce.webp` — ketchup bottle ≠ generic sauce jar
- `tabasco` → `spicy-sauce.webp` — Tabasco brand bottle ≠ generic sauce (also duplicate)
- `flour-premium` ("Мука пшеничная в/с") → `flour-confectionery.webp` — confectionery flour is specialty; product is general baking flour

### P2 — Naming Inconsistencies (minor)
- `salmon-lightly-salted` → `salmon-premium.webp` — ambiguous branding
- `frozen-blueberry` → `frozen-berries.webp` — berries plural vs specific blueberry
- `coffee-beans-lavazza` → `espresso-blend.webp` — specific brand vs generic blend name
- `margarine-baking` → `butter-confectionery.webp` — margarine ≠ butter (different product)
- `cream-cheese` (Philadelphia) → `cream-cheese-69.webp` — file name references fat% not brand

---

## Archive Candidates (Visually Verify)

These images were AI-generated for styled food presentation — may conflict with realistic supermarket packaging style:

| File | Reason |
|------|--------|
| `sushi-set-classic.webp` | Ready food — supermarket sets use plastic trays, not plated presentation |
| `cream-cheese-rolls.webp` | Ready rolls — supermarket format is sealed tray, not artisanal plating |
| `beef-burger-patty.webp` | Product is "Бургер готовый" — may be styled as restaurant-grade photo |
| `cream-cheese-cake.webp` | Cheesecake — supermarket format is boxed/sliced, not open presentation |
| `blini-filled.webp` | Filled blini — likely plated/styled vs sealed frozen package |
| `panko-store.webp` | Name "store" suggests fake-branded packaging style |
| `chocolate-bar.webp` | May have custom "Food Service" branding overlay on bar |

---

## Catalog Hierarchy Issues

| Issue | Products Affected |
|-------|------------------|
| Oils in wrong category | `sunflower-oil-refined`, `olive-oil-ev` in Бакалея instead of Масло и жиры |
| Category split inconsistency | `oat-drink` in Напитки, `oat-milk-oatly` in Здоровое питание — same product type |
| Eggs standalone category | Magnum-style combines eggs with dairy |
| Масло и жиры isolated | Magnum merges oils into Бакалея subcategory |

---

## Naming Issues Summary

- 8 products with hard-coded brand names that may cause legal/display issues
- 3 products with inconsistent weight format (г vs кг cutoffs)
- 2 products duplicated in confectionery: `chocolate-milka` AND `chocolate-bar-milka` are the same product (Milka 90г)

---

## Reports in this directory

| File | Contents |
|------|---------|
| `01_valid_images.md` | 74 correctly matched images |
| `02_invalid_images.md` | 8 problem images + archive candidates |
| `03_no_image_products.md` | All 305 products needing images by category |
| `04_hierarchy_normalization.md` | Magnum-style structure analysis |
| `05_naming_units.md` | Product naming and unit normalization |
| `06_action_plan.md` | Prioritized fix list |
