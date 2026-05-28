# Action Plan — Pre-Image-Generation Fixes

Execute in order before AI image generation phase.

---

## Phase 1: Fix Hard Mismatches (30 min)

Remove wrong `image:` fields from 4 products in `src/data/products.ts`:

```typescript
// REMOVE image field from these products:

// sugar-sand — sugar-powder.webp is wrong (granulated ≠ powdered)
{ id: "sugar-sand", /* remove image: "/products/sugar-powder.webp" */ }

// ketchup-hot — spicy-sauce.webp is wrong (ketchup bottle ≠ generic sauce jar)
{ id: "ketchup-hot", /* remove image: "/products/spicy-sauce.webp" */ }

// tabasco — duplicate of ketchup-hot, wrong image
{ id: "tabasco", /* remove image: "/products/spicy-sauce.webp" */ }

// vanilla-extract — vanilla-syrup is wrong (powder sachet ≠ syrup bottle)
{ id: "vanilla-extract", /* remove image: "/products/vanilla-syrup.webp" */ }
```

---

## Phase 2: Fix Category Mismatches (15 min)

```typescript
// Move oils from Бакалея to Масло и жиры:
{ id: "sunflower-oil-refined", category: "Масло и жиры" }
{ id: "olive-oil-ev", category: "Масло и жиры" }

// Move oat drink to match other plant milks:
{ id: "oat-drink", category: "Здоровое питание" }
```

---

## Phase 3: Remove Duplicate Product (10 min)

`chocolate-milka` and `chocolate-bar-milka` are the same product (Milka 90г, ₸490).

**Keep:** `chocolate-bar-milka` (has image: `chocolate-bar.webp`)  
**Remove:** `chocolate-milka` (no image, redundant)

---

## Phase 4: Fix Units (10 min)

```typescript
// Dill and parsley — change "100г" to "пучок"
{ id: "dill", unit: "пучок" }
{ id: "parsley", unit: "пучок" }
```

---

## Phase 5: Archive Candidate Images (visual review required)

1. View each file in `/public/products/` using image viewer
2. If image has Food Service branding/logo → move to `public/products/_archived/`
3. If image shows restaurant-plated food (not supermarket packaging) → move to archive

Files to check:
- `sushi-set-classic.webp`
- `cream-cheese-rolls.webp`
- `beef-burger-patty.webp`
- `cream-cheese-cake.webp`
- `blini-filled.webp`
- `panko-store.webp`
- `chocolate-bar.webp`

```powershell
# Create archive directory
New-Item -ItemType Directory -Force -Path "public/products/_archived"
# Move suspect files after visual review
Move-Item "public/products/sushi-set-classic.webp" "public/products/_archived/"
# etc.
```

---

## Phase 6: Catalog Foundation Verification

After all fixes, run these checks:

```bash
# Count products with image
grep -c 'image:' src/data/products.ts

# Find any remaining spicy-sauce.webp references
grep -n 'spicy-sauce' src/data/products.ts

# Find any sugar-powder.webp references
grep -n 'sugar-powder' src/data/products.ts

# Find any vanilla-syrup.webp references
grep -n 'vanilla-syrup' src/data/products.ts
```

Expected results after fixes:
- `image:` count: 79 (83 - 4 removed)
- `spicy-sauce` references: 0
- `sugar-powder` references: 0
- `vanilla-syrup` references: 0

---

## Phase 7: Update image-prompts.json

After Phase 1–4, re-run the image pipeline audit to regenerate prompts for the 4 previously-mismatched products that now have no image:

```bash
node scripts/image-pipeline.js audit
node scripts/image-pipeline.js prompts
```

This will add `sugar-sand`, `ketchup-hot`, `tabasco`, `vanilla-extract` back to the generation queue with correct prompts.

---

## Ready for Image Generation When:

- [ ] Phase 1 done: 4 wrong image fields removed
- [ ] Phase 2 done: 3 category corrections applied
- [ ] Phase 3 done: chocolate-milka duplicate removed  
- [ ] Phase 4 done: dill/parsley units fixed
- [ ] Phase 5 done: archive candidates visually reviewed
- [ ] Phase 6 done: verification grep passes
- [ ] Phase 7 done: image-prompts.json regenerated

---

## Image Generation Priorities (after above)

| Batch | Products | Category | Count |
|-------|----------|----------|-------|
| Batch 1 | All P1 isHit + isPopular items | All categories | ~80 |
| Batch 2 | P1 remaining | Remaining popular | ~65 |
| Batch 3 | P2 items | All categories | ~130 |
| Batch 4 | P3 items + sets | Low priority | ~30 |

**Total to generate: ~305 + 4 (remapped) = ~309 images**
