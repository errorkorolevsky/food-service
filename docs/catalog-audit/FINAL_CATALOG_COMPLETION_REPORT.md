# Final Catalog Completion Report — Phases C & D (2026-05-30)

Goal: maximum correct source-image coverage before any AI standardization.
No AI/redesign performed — source images only.

## PHASE D — FINAL STATE (authoritative, `npm run validate:images`)

| Field | Count | % |
|-------|------:|--:|
| **Total products** | 387 | — |
| **With image** | 342 | **88%** |
| **Missing image** | 45 | 12% |
| **Verified exact** | 36 | — |
| **Verified generic** | 287 | — |
| **Verified total** | **323** | **83%** |
| **Needs review** | 45 | — |
| **Rejected** | 0 | — |
| Validator errors | 0 | ✓ |

Phase D added **+13** verified images (incl. `water-premium` = real Evian) by
re-harvesting arbuz.kz with hand-tuned brand queries and visually verifying all
22 candidates (accepted 14, rejected 8 wrong matches — e.g. Snickers for
`candy-korovka`, Danissimo for `creme-brulee-dessert`, corn crackers for
`corn-oil`). The validator also blocked `cheese-cream` (title Philadelphia,
image Hochland — competitor) → reverted to needs_review.

Every one of the remaining 45 products is now explicitly `needs_review` with a
written reason in `image-sources.json` (combo bundle / not stocked on arbuz /
no exact source). **Rejected is now 0** — nothing shows a wrong or competitor
image; gaps are honest placeholders awaiting correct sourcing or the AI
standardization pass.

### Remaining 45 needs_review — reason groups
- **Combo sets (9)** — no single-product SKU photo exists.
- **HoReCa packaging (5)** — containers/cups/lids/cutlery/pizza-boxes; supplier feed.
- **Not on arbuz / niche (31)** — `energy-monster`, `cheese-cream` (Philadelphia),
  `samsa-potato`, `pirozhok`, `baton`, `eggs-c0`, `grapes`, `dill`, `blueberry`,
  `whole-chicken`, `capelin-smoked`, `unagi`/`unagi-sauce`, `sushi-rice-koshi`,
  `pasta-tiger`, `black-tea-akbar`, `hot-chocolate`, `baklava`, `honey-gingerbread`,
  `caramel-candy`, `candy-korovka`, `creme-brulee-dessert`, `corn-oil`,
  `lard-smoked`, `goji-berries`, baby-food variants, etc.

---

## PHASE C (earlier same day)

Goal: bring every one of the 387 products to a verified, brand-accurate image.

## Result summary

| Metric | Start of Phase C | End of Phase C |
|--------|-----------------:|---------------:|
| Total products | 387 | 387 |
| **Verified (exact + generic)** | 275 | **310** |
| — verified_exact | 33 | 35 |
| — verified_generic | 242 | 275 |
| Needs review | 6 | 3 |
| Rejected | 21 | 4 |
| **Missing image** | 87 | **55** |
| Validator errors | 0 | **0** |

> Counts from `npm run validate:images`. "Verified (safe)" = 310/387 = **80%**
> with a real, on-disk, brand-checked image; **+35 products** newly imaged this
> phase, every one visually verified. With-image path total: 332/387 (86%).

## Method

1. Built a worklist of the 93 products without a verified image.
2. Automated harvesting of arbuz.kz: drove the on-site search box (`#search-input`)
   over short brand/type queries via agent-browser, parsed result `alt`+`src`
   pairs, and scored each candidate against the product title, brand and
   volume to pick the best image.
3. Fetched 55 candidates and normalised them (white-bg, 600×600) through the
   existing sharp pipeline.
4. **Visually verified every candidate** on labelled contact sheets (WANT vs
   GOT). Accepted 35, **rejected 20** wrong matches (the auto-picker had
   returned e.g. a Colgate toothbrush for `pirozhok`, Whiskas cat food for
   `chickpeas-dry`, Snickers for `candy-korovka`, Kinder for `black-tea-akbar`).

No placeholders, competitor products, wrong variants, user photos or cropped
screenshots were accepted. Rejected images were deleted; those products keep an
honest empty state until a correct image is sourced.

## Verification criteria applied to each accepted image
Brand · packaging · volume/weight · product type · category — each checked
against the product record before acceptance.

## Why 0 / 0 / 0 was not fully reached

58 products still lack a usable verified image (55 missing + 3 needs_review +
4 rejected). These fall into groups where a clean,
correct single-product photo does **not** exist or is not available on arbuz.kz,
and faking one would violate the rules above:

- **Наборы / combos (9)** — `family-basket`, `breakfast-set`, `bbq-set`,
  `sushi-kit`, `coffee-set`, `healthy-set`, `baby-set`, `baking-set`,
  `plov-set`. These are assembled bundles, not SKUs; **no single product photo
  exists by definition.** Recommendation: render a branded composite, or drop
  these from the catalog.
- **HoReCa packaging (6)** — `containers-500ml/1000ml`, `pizza-boxes-30cm`,
  `cups-paper-400ml`, `lids-for-cups`, `cutlery-set-pack`, `trash-bags-20l`.
  Generic; sourceable later from a packaging supplier catalogue.
- **Not stocked / no clean match on arbuz.kz (~36)** — niche or specific
  variants: `energy-monster`, `water-premium` (Evian), `kombucha`,
  `unagi`/`unagi-sauce`, `sushi-rice-koshi`, `goji-berries`, `eggs-c0`/`eggs-sv`,
  `whole-chicken`, several baby-food variants, `rice-basmati`, `pasta-tiger`
  (Barilla Conchiglie), confectionery (`baklava`, `honey-gingerbread`,
  `caramel-candy`, `candy-korovka`, `creme-brulee-dessert`), `corn-oil`,
  `margarine-baking`, `lard-smoked`, `butter-825`, `cheese-cream` (Philadelphia),
  `black-tea-akbar`, `hot-chocolate`, etc.

Full residual list is in `.audit/worklist.json` (regenerate any time with the
worklist script).

## Final status

```
Total products:    387
Verified exact:    35
Verified generic:  275
Needs review:      3      (energy-monster, baby-formula-nan1, rice-basmati)
Rejected:          4
Missing image:     55
Errors:            0      ✓ No blocking errors
```

Brand integrity holds: no named-brand product shows a competitor, amateur photo
or wrong variant. The remaining gaps are documented and can be closed by
sourcing the specific items above (manual arbuz search or a supplier feed).
