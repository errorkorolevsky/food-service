# Product Naming & Units Normalization

---

## Unit Consistency Issues

### Weight threshold inconsistency
Some products use "г" where "кг" would be more natural, and vice versa:

| Product ID | Current Unit | Suggested | Reason |
|-----------|-------------|-----------|--------|
| pollock-fillet | 800г | 800г | ✓ OK |
| pelmeni-beef | 900г | 900г | ✓ OK at 900г |
| mussels | 1кг | 1кг | ✓ OK |
| salmon-fillet | 1кг | 1кг | ✓ OK |

No critical unit issues found. Units are generally consistent.

### Weight format — loose items
Some fresh produce uses inconsistent format:

| Product | Current | Issue |
|---------|---------|-------|
| dill / parsley | "100г" | Listed as "100г" but these are sold by пучок (bunch). Unit says "100г" but description says "пучок ≈100г" — inconsistent |
| avocado | "1шт" | ✓ Correct |
| mango | "1шт" | ✓ Correct |

**Fix for dill/parsley:**
- Change `unit: "100г"` to `unit: "пучок"` to match description and supermarket norm.

---

## Naming Issues

### Issue 1: Brand Names in Title
The following products embed brand names directly in the product title. In supermarket catalogs this is standard practice (Magnum does this too), but creates potential inconsistency:

| Product ID | Title | Brand in Title |
|-----------|-------|---------------|
| yogurt-natural | Йогурт натуральный Активиа | Активиа (Activia) |
| cottage-cheese-soft | Творог мягкий President | President |
| coffee-beans-lavazza | Кофе в зёрнах Lavazza Crema | Lavazza |
| coffee-ground-jacobs | Кофе молотый Jacobs Monarch | Jacobs |
| coffee-instant-nescafe | Кофе растворимый Nescafé Gold | Nescafé |
| coffee-capsules | Кофе капсулы Nespresso | Nespresso |
| coffee-3in1 | Кофе 3-в-1 MacCoffee | MacCoffee |
| black-tea-akbar | Чай чёрный Akbar Ceylon | Akbar |
| green-tea-greenfield | Чай зелёный Greenfield | Greenfield |
| cacao-nesquik | Какао Nesquik | Nesquik |
| hot-chocolate | Горячий шоколад Van Houten | Van Houten |
| apple-juice | Сок яблочный Rich | Rich |
| orange-juice | Сок апельсиновый J7 | J7 |
| iced-tea | Холодный чай Lipton | Lipton |
| oat-drink | Напиток овсяный Oatly | Oatly |
| canned-peas-bonduelle | Горошек Bonduelle | Bonduelle |
| canned-corn-bonduelle | Кукуруза Bonduelle | Bonduelle |
| ketchup-heinz | Кетчуп Heinz томатный | Heinz |
| soy-sauce-kikkoman | Соевый соус Kikkoman | Kikkoman |
| mustard-dijon | Горчица Дижонская Maille | Maille |
| spaghetti-barilla | Спагетти Barilla №5 | Barilla |
| penne-barilla | Пенне Barilla Rigate | Barilla |
| pasta-tiger | Паста тигровая Barilla | Barilla |
| chocolate-milka | Шоколад Milka молочный | Milka (duplicate — remove) |
| chocolate-bar-milka | Шоколад Milka молочный | Milka |
| snickers | Snickers шоколадный батончик | Snickers |
| kitkat | KitKat Chunky | KitKat |
| oreo | Oreo двойной шоколад | Oreo |
| nutella | Нутелла шоколадная паста | Nutella |
| raffaello | Raffaello конфеты | Raffaello |
| ferrero-rocher | Ferrero Rocher | Ferrero |
| lays-classic | Чипсы Lay's классические | Lay's |
| pringles-original | Pringles оригинальные | Pringles |
| baby-puree-apple-gerber | Пюре яблочное Gerber | Gerber |
| rye-cakes-finn-crisp | Хлебцы ржаные Finn Crisp | Finn Crisp |
| oat-milk-oatly | Молоко овсяное Oatly Barista | Oatly |
| protein-bar-rex | Протеиновый батончик Protein Rex | Protein Rex |
| protein-powder-vanilla | Протеин Optimum Vanilla | Optimum |
| crab-sticks | Крабовые палочки Vici | Vici |
| water-premium | Вода Evian Premium | Evian |
| bounty | Bounty кокосовый батончик | Bounty |

**Decision:** Brand names in titles are standard for grocery e-commerce. Keep as-is. No change.

---

### Issue 2: Inconsistent Title Format for Same Product Types

**Sausages — inconsistent format:**
- `sausage-doctor`: "Колбаса Докторская" — type last
- `sausage-smoked`: "Колбаса Краковская" — type last ✓
- `salami-milano`: "Салями Milano" — brand in title
- `pepperoni-slice`: "Пепперони нарезка" — preparation method first

**Cheeses:**
- `cheese-russian`: "Сыр Российский" — Сыр first ✓
- `cheese-gouda`: "Сыр Гауда" — Сыр first ✓
- `cheese-cheddar`: "Сыр Чеддер выдержанный" — Сыр first ✓
- `salami-milano`: mixed — "Салями" is correct as product type first

**Decision:** Format is generally consistent. Minor variations are acceptable.

---

### Issue 3: Title Length Outliers

Too long (>40 chars):
- "Кофе капсулы Nespresso Original Ristretto" — 40 chars, OK
- "Свинина шея" — too short, fine
- "Картофель фри McCain" — 20 chars, fine

No critical title length issues.

---

### Issue 4: Missing Weight in Unit for Some Products

These products list unit as "1шт" but could benefit from approximate weight in description:

| ID | Title | Current Unit | Notes |
|----|-------|-------------|-------|
| whole-chicken | Курица целая охлаждённая | 1шт | Description has ≈1.5–1.8кг ✓ |
| avocado | Авокадо | 1шт | OK |
| pomegranate | Гранат | 1шт | OK |
| mango | Манго | 1шт | OK |
| pineapple | Ананас | 1шт | Description has ≈1.2кг ✓ |

No critical issues — descriptions compensate.

---

## Summary of Required Fixes

| Type | Action | Count |
|------|--------|-------|
| Unit text | Change dill+parsley unit from "100г" to "пучок" | 2 |
| Category | Move 2 oil products to Масло и жиры | 2 |
| Category | Move oat-drink to Здоровое питание | 1 |
| Duplicate | Remove chocolate-milka (keep chocolate-bar-milka) | 1 |
| Image | Remove 4 wrong image assignments | 4 |

**Total required edits: 10 product record changes**
