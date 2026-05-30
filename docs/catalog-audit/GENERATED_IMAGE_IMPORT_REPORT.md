# Generated Product Image Import — Report (2026-05-30)

Source folder: `C:\Users\77718\Desktop\баннеры food service\товары` (120 `.jpeg`).
(4 PNG banners in the parent folder were ignored — not product images.)

## Numbers
- **Images found:** 120
- **Imported (matched & normalised):** 54
- **Duplicates + decoys moved:** 66 → `docs/catalog-audit/generated-image-duplicates/`
- **Products updated in products.ts:** 54
- **Backup of all originals:** `docs/catalog-audit/generated-image-import-backup/` (120)
- **Corrupt/unreadable files:** 0

## Catalog coverage after import (`npm run validate:images`)
```
Total products:    387
With image path:   344
Verified (safe):   326   ✓ Errors: 0
Needs review:      43
Rejected:          0
No image:          43
```
`npx tsc --noEmit` → clean (exit 0).

## Normalisation
Every imported file → `public/products/generated/<slug>.webp`, 600×600, white
background, trimmed + `contain` (no stretch/over-crop), quality 88.
DAL guard `buildValidImageSet()` updated to include the `generated/` subfolder
so Supabase-sourced rows can serve these paths.

## Decoys / unmatched (deliberately NOT assigned to any product)
These generated images depict brands/products **not in our catalog**, so no
product received them (prevents wrong assignments like Coca-Cola←Pepsi):
Pepsi, Makfa Spaghetti, Whiskas, Mars, Milky Way, Brown M&M's,
Kinder Bueno / Chocolate / Country / Delice, Lay's Bacon, Lay's Cheese,
Pringles Cheese, Pringles Paprika, Rollton, Calvé Cheese Sauce, Actimel,
Heinz BBQ Sauce, Snickers Super, "Oatly Barilla Edition" (AI label artifact).
All moved to `generated-image-duplicates/`.

## Volume-mismatch — kept existing real photos (not replaced)
`cola`, `fanta`, `sprite` — the generated versions are 1 L but the catalog SKUs
are 1.5 L. Existing correct-volume real photos were kept (verified_exact); the
1 L generated versions went to duplicates.

## imageStatus policy
- `verified_exact` (39): exact brand + product (Snickers, Nutella, Philadelphia,
  NAN 1, Evian, Ferrero, Raffaello, KitKat, Milka, Heinz Ketchup, Maille,
  Kikkoman, Lavazza, Nescafé Gold, Nespresso, Bonduelle peas/corn, etc.)
- `verified_generic` (15): right product type, generic/variant packaging
  (mozzarella, parmesan wedge, cheddar, oyster sauce, garlic sauce, pesto,
  pizza sauce, teriyaki, barista-milk, aloe-drink, farfalle, oat-drink,
  earl-grey, Heinz baby porridge flavor, ...)

## Still `needs_review` (43 — no correct source image yet)
9 combo sets, 5 HoReCa packaging, and ~29 niche items not available as a clean
source (energy-monster, baklava, candy-korovka, eggs-c0, grapes, dill, blueberry,
whole-chicken, unagi, pasta-tiger, baby-yogurt-agusha, etc.). These are honest
placeholders — to be filled in the AI image-standardization pass.

## Changed files
- `src/data/products.ts` (54 products: image + imageStatus)
- `src/lib/db/products.ts` (valid-image guard includes `generated/`)
- `public/products/generated/*.webp` (54 new)
- `docs/catalog-audit/image-sources.json` (manifest entries)
- `docs/catalog-audit/generated-image-import-backup/` (120 originals)
- `docs/catalog-audit/generated-image-duplicates/` (66)
- `scripts/import-generated-images.ts` (importer)

## Verify locally
Dev server: http://localhost:3000/catalog — checked Все / Кондитерское /
Напитки / Молоко: new images render, no broken cards, no 404s, no wrong products.
