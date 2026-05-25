# FOOD SERVICE — QA, SECURITY & PRODUCTION SAFETY SYSTEM

# SYSTEM PURPOSE

Этот файл определяет:
- как Claude Code должен проверять качество проекта
- как предотвращать critical issues
- как поддерживать production stability
- как обеспечивать безопасность системы
- как сохранять production-grade reliability

Главная цель:
создать:
- стабильный ecommerce ecosystem
- безопасный production-ready продукт
- predictable architecture
- reliable customer experience

НЕ:
- unstable AI-generated project
- fragile frontend system
- unsafe deployment structure
- chaotic development environment

---

# PRIMARY SYSTEM PRINCIPLE

Главный приоритет:
STABILITY > SPEED

Любое изменение обязано:
- сохранять reliability
- сохранять predictability
- сохранять scalability
- сохранять безопасность
- сохранять UX integrity

---

# REAL PRODUCT PRINCIPLE

Food Service обязан ощущаться:
- production-grade
- stable
- trustworthy
- secure
- predictable

Пользователь НЕ должен:
- видеть ошибки
- сталкиваться с broken UI
- чувствовать instability
- терять данные
- сталкиваться с unsafe behavior

---

# GLOBAL QA PHILOSOPHY

Claude Code НЕ должен:
- blindly rewrite systems
- ship unverified code
- ignore responsive issues
- ignore hydration problems
- ignore performance degradation

Claude Code ОБЯЗАН:
- проверять impact изменений
- проводить validation
- сохранять architecture integrity
- сохранять UX consistency
- предотвращать regressions

---

# CORE QA PIPELINE

# EVERY IMPLEMENTATION MUST FOLLOW:

1. Analyze
2. Plan
3. Implement safely
4. Validate
5. Optimize
6. Polish
7. Re-check

---

# CRITICAL QA RULE

Если изменение:
- ломает UX
- ломает responsive behavior
- снижает performance
- создаёт instability
- создаёт visual inconsistency

изменение НЕ должно попадать в production.

---

# FUNCTIONAL QA SYSTEM

# REQUIRED CHECKS

После каждой реализации проверить:

## FUNCTIONAL LOGIC

- logic works correctly?
- no runtime errors?
- no undefined states?
- no broken imports?
- no console errors?
- no state corruption?

---

# CHECK

- cart logic
- quantity updates
- language switching
- product rendering
- navigation
- checkout flow
- responsive drawers
- API responses

---

# IMPORTANT

Даже “маленький баг”:
- разрушает premium feeling
- снижает trust
- делает продукт дешёвым

---

# RESPONSIVE QA SYSTEM

# REQUIRED BREAKPOINTS

Проверять обязательно:

## MOBILE
320px–768px

## TABLET
768px–1024px

## DESKTOP
1024px–1440px

## LARGE DESKTOP
1440px+

---

# REQUIRED RESPONSIVE CHECKS

- spacing
- overflow
- typography
- touch targets
- navigation
- drawers
- cart interactions
- grids
- product cards
- filters

---

# MOBILE-FIRST PRINCIPLE

Mobile UX —
критически важен.

Mobile НЕ должен ощущаться:
- desktop-adapted
- cramped
- overloaded
- broken

---

# UI QA SYSTEM

# CHECK VISUAL CONSISTENCY

Проверять:
- spacing rhythm
- typography hierarchy
- hover consistency
- border radius consistency
- motion consistency
- alignment
- visual calmness

---

# REMOVE

- fragmented UI
- inconsistent spacing
- random visual density
- chaotic hierarchy

---

# IMPORTANT

Premium UI =
consistent UI.

---

# UX QA SYSTEM

# UX MUST FEEL

- intuitive
- responsive
- calm
- trustworthy
- frictionless

---

# CHECK

- CTA clarity
- navigation flow
- catalog usability
- checkout simplicity
- interaction comfort
- loading behavior

---

# IMPORTANT

Если пользователь:
- путается
- думает слишком долго
- не понимает next step

UX считается broken.

---

# PERFORMANCE QA SYSTEM

# REQUIRED PERFORMANCE CHECKS

Проверять:

- rerenders
- layout shifts
- hydration mismatch
- FPS drops
- animation smoothness
- image loading
- interaction latency

---

# AVOID

- rendering storms
- oversized bundles
- laggy animations
- heavy transitions
- expensive renders

---

# PERFORMANCE PRINCIPLE

Даже красивый UI ощущается дешёвым,
если:
- лагает
- тормозит
- дёргается
- нестабилен

---

# HYDRATION SAFETY SYSTEM

# CRITICAL NEXT.JS RULES

Проверять:
- SSR safety
- hydration consistency
- client/server sync
- browser API safety

---

# AVOID

- hydration mismatch
- unsafe localStorage access
- unstable rendering
- conditional hydration bugs

---

# ALWAYS

- guard browser APIs
- isolate client-only logic
- use mounted checks safely
- maintain deterministic rendering

---

# STATE MANAGEMENT SAFETY

# ZUSTAND RULES

Store logic обязана быть:
- predictable
- modular
- hydration-safe
- scalable

---

# NEVER

- mutate state directly
- overload stores
- create circular updates
- create rerender storms

---

# ALWAYS

- isolate logic
- optimize selectors
- avoid unnecessary subscriptions
- maintain stable state flow

---

# SECURITY PRINCIPLES

# NEVER EXPOSE

- API keys
- secret tokens
- database credentials
- admin logic
- sensitive environment variables

---

# ENVIRONMENT RULES

Использовать:
- .env.local
- secure environment variables
- server-side protection
- restricted access

---

# IMPORTANT

Sensitive logic НЕ должен:
- попадать в client bundle
- быть hardcoded
- быть exposed in frontend

---

# API SECURITY SYSTEM

# REQUIRED

Проверять:
- request validation
- safe error handling
- API fallback logic
- rate-limit readiness

---

# AVOID

- exposing raw errors
- unsafe fetch logic
- unhandled API failures
- insecure requests

---

# FORM SAFETY SYSTEM

# FORMS MUST

- validate input
- sanitize data
- handle errors safely
- preserve UX quality

---

# CHECK

- invalid input
- empty states
- network failures
- loading states
- duplicate submissions

---

# ERROR HANDLING SYSTEM

# ERRORS MUST FEEL

- calm
- readable
- understandable
- premium

---

# NEVER

- raw stack traces
- ugly error blocks
- broken layouts
- panic UX

---

# REQUIRED

- graceful fallbacks
- subtle messaging
- stable UI states
- retry behavior

---

# EMPTY STATE SYSTEM

# EMPTY STATES MUST FEEL

- intentional
- polished
- branded
- useful

---

# NEVER

- blank screens
- broken containers
- dead interfaces
- unfinished states

---

# LOADING STATE SYSTEM

# LOADING UX MUST FEEL

- smooth
- lightweight
- responsive
- modern

---

# USE

- skeletons
- shimmer
- progressive loading
- subtle placeholders

---

# AVOID

- layout jumping
- flashing
- blocking rendering
- spinner overload

---

# ACCESSIBILITY QA SYSTEM

# REQUIRED CHECKS

- keyboard navigation
- focus states
- readable contrast
- semantic structure
- touch accessibility

---

# IMPORTANT

Premium UX =
accessible UX.

---

# DEPLOYMENT SAFETY SYSTEM

# BEFORE DEPLOYMENT CHECK

Обязательно проверить:

## BUILD

- successful production build
- no critical warnings
- optimized output

---

## RESPONSIVE

- all breakpoints stable
- no overflow
- no mobile breakage

---

## UX

- checkout works
- cart works
- localization works
- navigation works

---

## PERFORMANCE

- Lighthouse sanity check
- animation smoothness
- image optimization
- hydration stability

---

# SAFE DEVELOPMENT RULES

# NEVER

- push untested code
- rewrite architecture blindly
- ignore console warnings
- sacrifice UX for visuals
- overload interfaces

---

# ALWAYS

- verify impact
- maintain stability
- prioritize predictability
- protect architecture
- preserve UX quality

---

# AI SAFETY PRINCIPLE

Claude Code обязан:
- думать production-first
- избегать хаотичных решений
- избегать unnecessary complexity
- избегать overengineering

---

# IMPORTANT

AI-generated code без QA =
technical debt.

---

# FINAL PRODUCT PRINCIPLE

Финальный продукт должен ощущаться:
- stable
- polished
- trustworthy
- predictable
- secure
- production-ready

Пользователь должен чувствовать:
что это:
- настоящий современный сервис
- качественный ecommerce ecosystem
- стабильный digital product

А НЕ:
- AI-generated prototype
- unstable startup demo
- experimental interface.