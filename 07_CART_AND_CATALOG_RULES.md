# 07_CART_AND_CATALOG_RULES.md

# FOOD SERVICE — CART & CATALOG SYSTEM RULES

## SYSTEM PURPOSE

Этот файл определяет:
- как должен работать каталог
- как должна работать корзина
- как должен ощущаться shopping experience
- как построить premium ecommerce UX
- как избежать chaotic marketplace feeling

Главная цель:
создать luxury-tech grocery experience мирового уровня.


---

# GLOBAL ECOMMERCE PHILOSOPHY

Food Service НЕ должен ощущаться как:
- дешёвый marketplace
- overloaded grocery app
- chaotic ecommerce template
- noisy catalog

Food Service должен ощущаться как:
- curated ecosystem
- premium grocery experience
- cinematic ecommerce product
- intelligent product platform

## USER MUST FEEL

- скорость
- лёгкость
- premium quality
- smoothness
- control
- visual comfort


---

# CATALOG EXPERIENCE PHILOSOPHY

## THE CATALOG IS THE HEART OF THE PRODUCT

Каталог — это не список товаров.

Это:
- визуальная система
- curated experience
- digital shelf ecosystem

Каталог обязан:
- быть чистым
- быть понятным
- быть визуально сбалансированным
- быть responsive
- быть fast
- быть emotionally pleasant


---

# PRODUCT GRID SYSTEM

## GRID PHILOSOPHY

Сетка должна:
- иметь breathing space
- ощущаться organized
- быть responsive
- масштабироваться cleanly

## GRID MUST FEEL

- premium
- clean
- modern
- breathable

## NEVER

- overcrowded cards
- tiny spacing
- chaotic alignment
- inconsistent sizing

## RESPONSIVE GRID RULES

### MOBILE
- 2-column optimized
- thumb-friendly spacing
- readable cards

### TABLET
- balanced grid density

### DESKTOP
- cinematic spacing
- premium breathing room


---

# PRODUCT CARD SYSTEM

## PRODUCT CARD PHILOSOPHY

Карточка товара = главный UI элемент проекта.

Карточка обязана:
- выглядеть дорого
- ощущаться clean
- быть highly readable
- иметь subtle depth
- быть visually balanced

## CARD STRUCTURE

Карточка должна содержать:
- product image
- product title
- category/subtitle
- pricing
- CTA/add-to-cart
- optional status tags

## IMPORTANT

Иерархия должна быть:
1. image
2. title
3. price
4. CTA

## NEVER

- clutter
- excessive labels
- giant badges
- visual overload
- too much text


---

# PRODUCT IMAGE SYSTEM

## IMAGE PHILOSOPHY

Все product images должны:
- выглядеть как единая фотосессия
- иметь одинаковое lighting behavior
- иметь premium grocery aesthetic
- иметь consistent background logic

## IMAGE STYLE

Allowed:
- cinematic studio lighting
- dark premium ecommerce
- realistic textures
- matte atmosphere
- realistic shadows

Forbidden:
- random PNG cutouts
- inconsistent styles
- low-quality images
- chaotic backgrounds
- poster-style advertising

## IMAGE INTERACTIONS

Добавить:
- smooth loading
- subtle zoom
- soft hover transitions
- cinematic image reveal

## IMPORTANT

Изображения НЕ должны:
- прыгать
- лагать
- резко менять размер


---

# PRODUCT CARD MOTION SYSTEM

## HOVER BEHAVIOR

Hover должен:
- ощущаться мягко
- быть subtle
- добавлять depth feeling

## ALLOWED

- slight elevation
- soft glow
- subtle scale
- smooth transition
- image depth motion

## FORBIDDEN

- aggressive scale
- flashy effects
- heavy shadows
- exaggerated motion

## MOTION TIMING

Hover:
150ms–250ms

Reveal:
300ms–500ms

## USE

- Framer Motion
- transform
- opacity
- GPU-friendly animations


---

# PRODUCT INFORMATION HIERARCHY

## TYPOGRAPHY PRIORITY

### PRIMARY
Product title

### SECONDARY
Price

### TERTIARY
Category / description

### CTA
Clear but not aggressive

## IMPORTANT

Пользователь должен:
- мгновенно понимать товар
- мгновенно видеть цену
- не теряться в интерфейсе


---

# ADD TO CART EXPERIENCE

## ADD TO CART MUST FEEL

- instant
- satisfying
- responsive
- premium

## REQUIRED INTERACTIONS

### BUTTON FEEDBACK
- soft press effect
- smooth state transition
- loading indication

### SUCCESS FEEDBACK
- subtle confirmation
- cart counter animation
- smooth drawer update

## FORBIDDEN

- laggy updates
- confusing states
- instant jarring UI changes


---

# CARTDRAWER SYSTEM

# CARTDRAWER IS A PREMIUM EXPERIENCE

Корзина обязана ощущаться:
- smooth
- modern
- lightweight
- responsive
- elegant

## DRAWER OPENING

Drawer должен:
- открываться плавно
- иметь inertia feel
- не вызывать FPS drops

## USE

- spring animations
- soft opacity transitions
- backdrop blur
- cinematic entrance

## AVOID

- instant popping
- lag
- blocking animations


---

# CART ITEM SYSTEM

## CART ITEMS MUST FEEL

- organized
- readable
- interactive
- clean

## ITEM CONTENT

Каждый item:
- image
- title
- quantity controls
- price
- remove action

## QUANTITY CONTROLS

Quantity controls обязаны:
- быть tactile
- responsive
- smooth
- mobile-friendly

## REMOVE ACTION

Удаление должно:
- быть animated
- быть smooth
- не ломать layout


---

# CART STATE SYSTEM

## REQUIRED STATES

### EMPTY CART
Даже пустая корзина должна:
- выглядеть premium
- иметь atmosphere
- не ощущаться broken

### LOADING STATE
Добавить:
- skeletons
- shimmer
- soft placeholders

### ERROR STATE
Ошибки должны:
- быть clean
- быть understandable
- не ломать UX

## SUCCESS STATE
Добавить:
- subtle confirmation
- smooth transitions


---

# CART UX RULES

## USER MUST ALWAYS UNDERSTAND

- что добавлено
- сколько товаров
- итоговую цену
- как изменить количество
- как удалить товар

## NEVER

- hidden interactions
- confusing controls
- unclear totals
- broken updates


---

# CHECKOUT EXPERIENCE RULES

## CHECKOUT MUST FEEL

- trustworthy
- simple
- fast
- modern

## UX GOALS

Минимизировать:
- friction
- confusion
- unnecessary steps

## IMPORTANT

Checkout НЕ должен:
- ощущаться stressful
- быть перегруженным
- ломаться на mobile


---

# FILTER & SEARCH SYSTEM

## SEARCH EXPERIENCE

Поиск обязан:
- быть быстрым
- быть responsive
- иметь clean UI

## FILTERS

Фильтры должны:
- быть понятными
- не перегружать интерфейс
- быть mobile-friendly

## MOBILE FILTER UX

Mobile filters обязаны:
- работать через drawer/sheet
- быть smooth
- не ломать scroll


---

# RESPONSIVE ECOMMERCE RULES

## MOBILE SHOPPING EXPERIENCE

Mobile UX — критически важен.

## MUST SUPPORT

- one-hand usage
- fast navigation
- touch-friendly controls
- smooth scrolling

## CHECK

- cart drawer
- catalog grid
- buttons
- filters
- typography
- checkout flow

## NEVER

- tiny touch targets
- overflow bugs
- broken spacing
- desktop-only layouts


---

# PERFORMANCE RULES

## CATALOG PERFORMANCE

Обязательно:
- lazy loading images
- optimized rendering
- virtualized lists if needed
- smooth scrolling

## AVOID

- rerender storms
- layout shifts
- laggy interactions
- oversized product assets

## IMAGE OPTIMIZATION

Использовать:
- Next/Image
- responsive sizing
- blur placeholders
- optimized formats


---

# ZUSTAND CART RULES

## STORE PHILOSOPHY

Cart store обязан:
- быть predictable
- быть typed
- быть modular
- быть scalable

## STORE MUST HANDLE

- add item
- remove item
- update quantity
- calculate totals
- persist cart
- sync UI state

## NEVER

- duplicate logic
- mutate state unsafely
- create hidden side effects


---

# DESIGN CONSISTENCY RULES

Все ecommerce элементы обязаны:
- соответствовать design system
- соответствовать motion system
- соответствовать spacing system

## NEVER

- random card sizes
- inconsistent buttons
- inconsistent hover states
- chaotic pricing styles


---

# QA CHECKLIST

Перед завершением ecommerce задачи проверить:

## UX
- intuitive?
- fast?
- clean?

## VISUAL
- balanced?
- premium?
- readable?

## MOTION
- smooth?
- subtle?
- responsive?

## MOBILE
- touch-friendly?
- responsive?
- stable?

## PERFORMANCE
- optimized?
- no lag?
- no layout shifts?


---

# FINAL EXPERIENCE TARGET

Пользователь должен ощущать:

“Это premium AI-powered grocery ecosystem.”

А НЕ:
“очередной интернет-магазин.”


---

# FINAL DIRECTIVE

Claude Code обязан:
- строить premium catalog experience
- создавать satisfying cart interactions
- поддерживать responsive ecommerce UX
- избегать marketplace chaos
- сохранять cinematic luxury-tech aesthetic


---

# END OF FILE