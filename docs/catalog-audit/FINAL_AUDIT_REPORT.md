# Catalog Image Audit — Final Report (2026-05-30)

End-to-end audit of the product catalog: database sync + full semantic image
review of all 387 products.

## 1. Database sync (Supabase ↔ source of truth)

`src/data/products.ts` is the source of truth (387 products).

| Issue | Before | After |
|-------|-------:|------:|
| Supabase rows | 471 | **387** |
| Orphan rows (HoReCa pivot leftovers) | 84 | **0** |
| `image_status` column | missing | **added** (+ CHECK constraint) |

- Added `image_status` to the `products` table; `seed-products.ts` now writes it.
- Deleted 84 orphan rows (old pre-retail HoReCa catalog: sushi/pizza/coffee-bar
  kits, duplicate-title staples). Full backup: `orphan-backup.json`.
- Re-seeded all 387 with `image` + `image_status`.

## 2. Final image coverage (authoritative — `npm run validate:images`)

```
Total products:    387
With image path:   300
Verified (safe):   275   (verified_exact + verified_generic)
Needs review:      6
Rejected (no img): 21
No image:          87
Errors:            0     ✓ No blocking errors
```

## 3. Semantic audit method

All 301 on-disk images were rendered into 19 labeled contact-sheet montages
(`scripts/build-audit-montage.ts`) and reviewed by eye against each product's
title / brand / package / category, cross-checked with the image manifest
(`image-sources.json`) and brand rules (`productBrandRules.ts`,
`scripts/semantic-audit.ts`).

**Finding: the catalog is overwhelmingly clean.** After the earlier
cross-brand fixes, the remaining issues were a small number of amateur photos
and one wrong-product image.

## 4. Fixes applied this pass

| Product | Problem | Fix |
|---------|---------|-----|
| `fanta` | Amateur 150 ml can on a countertop | Clean Fanta 1.5 L studio shot (arbuz.kz) |
| `ferrero-rocher` | Real box but hand-held over a dark stove | Clean Ferrero Rocher 200 g box (arbuz.kz) |
| `pasta-tiger` | Asian-Kitchen **Udon noodles** (wrong product) + amateur, on a Barilla Conchiglie listing | Image removed → `rejected` (placeholder until a real Barilla shot is sourced) |
| `energy-monster` | Amateur cropped can (Ultra Violet) | Kept `needs_review` (Monster Energy not stocked on arbuz.kz — no clean source found) |

Verified visually after fetch; all render correctly on the live dev catalog.

## 5. Brand integrity

No named-brand product shows a competitor's photo. The high-profile brands the
user flagged (Coca-Cola, Pepsi, Sprite, Fanta, Snickers, Nutella, Bounty,
Barilla, Bonduelle, Ferrero) were each verified against the manifest source.

## 6. Remaining `needs_review` / `rejected` (placeholders, by design)

These show the emoji placeholder — honest, no misleading photo:
`energy-monster`, `pasta-tiger`, `yogurt-natural`, `hot-chocolate`, `earl-grey`,
`rice-basmati`, `baby-formula-nan1`, plus pre-existing rejected items. Each can
have a clean studio image sourced from arbuz.kz later using the documented
workflow.

## Tooling added
- `scripts/prune-orphan-products.ts` — backup + delete orphan rows
- `scripts/build-audit-montage.ts` — labeled contact sheets for visual audit
- `scripts/semantic-audit.ts` — manifest/brand-rule flagging aid
