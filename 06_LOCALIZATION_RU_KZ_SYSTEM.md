FOOD SERVICE — RU/KZ LOCALIZATION SYSTEM
SYSTEM PURPOSE

Этот файл определяет:

как должна работать multilingual architecture
как реализовать scalable RU/KZ localization
как сохранить premium UX на двух языках
как избежать localization chaos
как сделать language switching seamless

Главная задача:
создать:

production-grade localization system
scalable multilingual architecture
natural bilingual experience

НЕ:

machine-translation feeling
хаотичный multilingual UI
broken responsive layouts
PRIMARY LOCALIZATION PRINCIPLE

Localization — это НЕ:

просто перевод текста
random string replacement
giant JSON dump
secondary feature

Localization = полноценная product system.

GLOBAL LOCALIZATION PHILOSOPHY

RU и KZ должны ощущаться:

одинаково качественно
одинаково premium
одинаково production-ready

Пользователь НЕ должен чувствовать:
что один язык:

хуже
менее проработан
secondary
machine-generated
SUPPORTED LANGUAGES
PRIMARY LANGUAGES
RU

Русский язык — основной язык платформы.

KZ

Казахский язык — equal-first language.

IMPORTANT PRINCIPLE

KZ localization НЕ должна:

ощущаться как “дополнительный перевод”
ломать layout
ухудшать UX
выглядеть robotic
USER EXPERIENCE PRINCIPLE

Language switching обязан ощущаться:

мгновенным
smooth
responsive
integrated
production-ready

НЕ:

laggy
flashing
broken
disruptive
REAL PRODUCT PRINCIPLE

Localization обязан ощущаться:

как часть продукта
как native UX
как scalable architecture

НЕ:

как temporary solution
как patched system
как AI translation layer
LOCALIZATION ARCHITECTURE
REQUIRED STRUCTURE
/src
  /locales
    /ru
      common.json
      homepage.json
      catalog.json
      cart.json
      checkout.json
      navbar.json
      footer.json

    /kz
      common.json
      homepage.json
      catalog.json
      cart.json
      checkout.json
      navbar.json
      footer.json
IMPORTANT RULES

НЕ использовать:

giant translation file
random translation structure
duplicated strings
chaotic keys
ALWAYS
split translations by feature
keep translations modular
maintain semantic structure
keep naming scalable
TRANSLATION KEY SYSTEM
CORRECT EXAMPLE
{
  "catalog": {
    "title": "Каталог",
    "searchPlaceholder": "Поиск товаров"
  }
}
WRONG EXAMPLE
{
  "title1": "Каталог",
  "searchText": "Поиск"
}
KEY RULES

Keys обязаны быть:

semantic
predictable
scalable
grouped logically
NEVER
vague naming
duplicated keys
random structures
inconsistent terminology
LANGUAGE PROVIDER SYSTEM
REQUIRED

Создать centralized localization provider.

PROVIDER RESPONSIBILITIES

Localization provider обязан:

хранить current locale
управлять language switching
предоставлять translations
sync language globally
safely hydrate on client/server
MUST SUPPORT
dynamic switching
persistence
hydration safety
SSR compatibility
responsive updates
PREFER
Context API
или
Zustand integration
IMPORTANT

Localization system НЕ должен:

вызывать hydration mismatch
создавать flashing language
ломать rendering
вызывать rerender storms
LANGUAGE SWITCHER SYSTEM
GOAL

Language switcher обязан ощущаться:

clean
subtle
premium
responsive
SWITCHING MUST BE
instant
smooth
stable
visually calm
SWITCHER MUST
clearly indicate active language
preserve route state
work perfectly on mobile
have subtle interactions
AVOID
full page reload
flashing UI
layout jumps
broken active state
LOCALIZATION UX RULES
TEXT LENGTH HANDLING

RU и KZ имеют:

разную длину текста
разную плотность
разный visual rhythm
UI MUST HANDLE
multiline text
adaptive spacing
responsive wrapping
flexible layouts
NEVER
hardcoded widths
fixed assumptions
clipped translations
broken buttons
RESPONSIVE LOCALIZATION
MOBILE LOCALIZATION

Localization обязана:

корректно работать на mobile
не ломать spacing
не ломать cards
не ломать navigation
ALWAYS CHECK
navbar
catalog
cart
buttons
filters
drawers
checkout
product cards
IMPORTANT

KZ localization НЕ должен:

ломать hierarchy
ломать alignment
ухудшать readability
TRANSLATION QUALITY PRINCIPLE

Translations обязаны ощущаться:

natural
human
modern
premium
readable
AVOID
robotic wording
awkward phrasing
literal machine translation
inconsistent terminology
TONE OF VOICE

Tone обязан быть:

clean
modern
professional
friendly
calm
AVOID
bureaucratic language
outdated phrasing
corporate heaviness
unnatural wording
TERMINOLOGY CONSISTENCY SYSTEM
IMPORTANT

Одинаковые термины обязаны:

переводиться одинаково
использоваться consistently
быть centralized
EXAMPLES
RU
Каталог
Корзина
Оформление заказа
Популярные товары
KZ
Каталог
Себет
Тапсырысты рәсімдеу
Танымал тауарлар
NEVER
использовать несколько переводов одного слова
хаотично менять терминологию
смешивать стили языка
LOCALIZATION PERFORMANCE RULES
MUST OPTIMIZE
translation loading
bundle splitting
locale hydration
dictionary imports
PREFER
lazy-loaded dictionaries
route-based translation loading
memoized translation access
AVOID
loading all locales at once
giant translation payloads
unnecessary rerenders
SEO LOCALIZATION SYSTEM

Localization architecture обязана быть готова к:

multilingual SEO
localized metadata
alternate indexing
locale routes
FUTURE SUPPORT
/ru
/kz
META SUPPORT

Каждый язык обязан поддерживать:

translated titles
translated descriptions
localized OpenGraph
localized SEO metadata
DEVELOPMENT RULES
NEVER HARDCODE TEXT
FORBIDDEN
<h1>Каталог</h1>
REQUIRED
<h1>{t("catalog.title")}</h1>
IMPORTANT

Весь UI текст обязан:

идти через localization system
быть centralized
быть scalable
COMPONENT LOCALIZATION RULES

Каждый компонент обязан:

поддерживать translations
корректно адаптироваться под длину текста
поддерживать responsive localization
PRIORITY COMPONENTS
HIGH PRIORITY
navbar
catalog
product cards
cart drawer
checkout
MEDIUM PRIORITY
homepage sections
footer
forms
buttons
STATE MANAGEMENT RULES

Localization state обязан быть:

predictable
globally accessible
hydration-safe
persistent
MUST PERSIST
selected language
user preference
PREFER
localStorage persistence
SSR-safe initialization
optional cookie sync
HYDRATION SAFETY RULES

Localization НЕ должен:

вызывать SSR mismatch
создавать flashing content
ломать hydration
ALWAYS
safely initialize locale
sync client/server state
guard browser APIs
ACCESSIBILITY RULES

Localization обязан:

сохранять readability
сохранять contrast
сохранять hierarchy
поддерживать keyboard navigation
IMPORTANT

Premium multilingual UX =
accessible multilingual UX.

QA VALIDATION CHECKLIST

Перед production release обязательно проверить:

FUNCTIONAL QA
language switching works
translations load correctly
no missing keys
no fallback errors
UI QA
responsive layouts stable
no text overflow
hierarchy preserved
spacing remains clean
UX QA
switching feels seamless
no visual flashing
no confusing behavior
PERFORMANCE QA
no unnecessary rerenders
optimized locale loading
no hydration instability
FINAL LOCALIZATION PRINCIPLE

Localization должен ощущаться:

native
invisible
seamless
scalable
production-ready

Пользователь должен чувствовать:
что оба языка —
это:

полноценная часть продукта
качественный digital experience
modern ecosystem UX

А НЕ:

AI translation layer
secondary feature
temporary localization solution.