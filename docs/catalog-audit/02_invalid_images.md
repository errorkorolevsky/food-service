# Invalid Images — Mismatches, Duplicates, Archive Candidates

---

## Section A: Hard Mismatches (Fix Required)

These images show a visually different product than what is described.

### 1. sugar-sand → sugar-powder.webp
- **Product:** "Сахар-песок белый" (white granulated sugar, 1кг bag)
- **Image:** `sugar-powder.webp` — sugar powder implies сахарная пудра (icing/confectioner's sugar)
- **Impact:** Completely different product. Granulated sugar bag ≠ fine powder
- **Action:** Remove `image` field from `sugar-sand`. Generate new image: white granulated sugar in 1kg bag/pack

### 2. ketchup-hot → spicy-sauce.webp (+ DUPLICATE)
- **Product:** "Кетчуп Чили острый" (chili ketchup, bottle 350г)
- **Image:** `spicy-sauce.webp` — generic hot sauce in non-ketchup packaging
- **Impact:** Wrong format (ketchup = squeeze bottle; spicy-sauce = generic sauce jar)
- **Action:** Remove `image` field from `ketchup-hot`. Generate new image: chili ketchup in squeeze bottle

### 3. tabasco → spicy-sauce.webp (DUPLICATE + MISMATCH)
- **Product:** "Tabasco острый соус" (Tabasco, glass bottle 60мл)
- **Image:** `spicy-sauce.webp` — **same file as ketchup-hot** — Tabasco is a distinct branded small glass bottle
- **Impact:** Two different products share one image. Tabasco's iconic 60ml glass bottle not represented at all
- **Action:** Remove `image` field from `tabasco`. Generate new image: small glass hot sauce bottle (Tabasco-style)

### 4. vanilla-extract → vanilla-syrup.webp
- **Product:** "Ванилин для выпечки" (vanillin baking powder, 10г packet)
- **Image:** `vanilla-syrup.webp` — liquid syrup in bottle
- **Impact:** 10г powder sachet ≠ 1L syrup bottle. Completely different visual and category
- **Action:** Remove `image` field from `vanilla-extract`. Generate new image: small powder sachet/packet

---

## Section B: Minor Mismatches (Acceptable but Suboptimal)

These images are visually close but technically incorrect in naming or subtype.

| Product ID | Product | Image | Issue |
|-----------|---------|-------|-------|
| croissant | Круассан масляный (fresh) | croissant-frozen.webp | File named "frozen" but product is fresh bakery item |
| flour-premium | Мука пшеничная в/с | flour-confectionery.webp | "confectionery" in name; product is general-purpose flour |
| margarine-baking | Маргарин для выпечки | butter-confectionery.webp | Margarine ≠ butter visually or nutritionally |
| frozen-blueberry | Черника замороженная | frozen-berries.webp | File = "berries" plural; product = specifically blueberry |

---

## Section C: Archive Candidates (Requires Visual Inspection)

These images may have been AI-generated with:
- Custom "Food Service" logo/branding overlaid on packaging
- Restaurant-style food photography (plated/styled) instead of supermarket product photography (packaged)
- Inconsistent photography style (cinematic vs neutral white-background product shots)

**Archive if the image shows branded packaging or styled food plating:**

| File | Assigned Product | Likely Issue |
|------|-----------------|-------------|
| `sushi-set-classic.webp` | Суши сет Японское | Supermarket sushi = sealed plastic tray; if image shows artistic plating → archive |
| `cream-cheese-rolls.webp` | Роллы Калифорния | Supermarket rolls = sealed tray; if artistically presented → archive |
| `beef-burger-patty.webp` | Бургер говяжий | Ready food burger; if styled as restaurant photo → archive |
| `cream-cheese-cake.webp` | Чизкейк Нью-Йорк | If whole cake styled vs boxed slice → archive |
| `blini-filled.webp` | Блины с мясом | If plated/styled vs frozen package shot → archive |
| `panko-store.webp` | Сухари панко крупные | "Store" in name suggests fake branded bag — verify |
| `chocolate-bar.webp` | Шоколад Milka | Verify no "Food Service" logo on packaging |

**Archive destination:** `public/products/_archived/`

---

## Section D: Duplicate Issue — spicy-sauce.webp

This single image file is referenced by TWO products:
- `ketchup-hot` → `/products/spicy-sauce.webp`
- `tabasco` → `/products/spicy-sauce.webp`

Both products show identical images in the catalog — this is a user-facing quality failure.
Both need individual image generation before either can be marked valid.

---

## Summary of Actions

| Action | Products | Count |
|--------|----------|-------|
| Remove `image` field (hard mismatch) | sugar-sand, ketchup-hot, tabasco, vanilla-extract | 4 |
| Visual verify then archive if styled | sushi-set-classic, cream-cheese-rolls, beef-burger-patty, cream-cheese-cake, blini-filled, panko-store, chocolate-bar | 7 |
| Minor fix (low priority) | croissant, flour-premium, margarine-baking, frozen-blueberry | 4 |
