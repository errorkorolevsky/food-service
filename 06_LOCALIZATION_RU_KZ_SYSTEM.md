# 06_LOCALIZATION_RU_KZ_SYSTEM.md

# FOOD SERVICE — RU/KZ LOCALIZATION SYSTEM

## SYSTEM PURPOSE

Этот файл определяет:
- как должна работать multilingual architecture
- как реализовать RU/KZ localization
- как избежать localization chaos
- как сделать language switching seamless
- как построить scalable internationalization system

Главная цель:
создать production-grade multilingual architecture мирового уровня.


---

# GLOBAL LOCALIZATION PHILOSOPHY

Localization — это НЕ:
- просто перевод текста
- random string replacement
- хаотичные JSON-файлы

Localization = полноценная архитектурная система.

Языковая система обязана:
- масштабироваться
- быть maintainable
- быть consistent
- быть fast
- быть UX-friendly

## USER MUST FEEL

Переключение языка должно ощущаться:
- мгновенным
- естественным
- seamless
- integrated

НЕ:
- broken
- laggy
- inconsistent


---

# SUPPORTED LANGUAGES

## PRIMARY LANGUAGES

### RU
Русский язык — основной язык платформы.

### KZ
Казахский язык — полноценный equal-first language.

## IMPORTANT

KZ localization НЕ должна:
- выглядеть как machine translation
- ощущаться secondary
- ломать layout

Оба языка должны:
- иметь одинаковое качество
- одинаковую UX ценность
- одинаковую visual consistency


---

# LOCALIZATION ARCHITECTURE

# REQUIRED STRUCTURE

## CREATE

```bash
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

      IMPORTANT

НЕ использовать:

giant translation file
хаотичные ключи
duplicated translations
ALWAYS:
split by feature/module
keep translations organized
use scalable naming
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
RULES

Keys должны:

быть semantic
быть predictable
быть scalable
быть grouped logically
NEVER:
random names
duplicated keys
vague naming
LANGUAGE PROVIDER SYSTEM
REQUIRED

Создать centralized localization provider.

RESPONSIBILITIES

Provider обязан:

хранить current locale
управлять language switching
предоставлять translations
sync language state globally
MUST SUPPORT
dynamic switching
persistence
SSR compatibility
client hydration safety
PREFER
Context API
или
Zustand integration
IMPORTANT

Localization system НЕ должен:

вызывать hydration mismatch
ломать rendering
создавать flashing
LANGUAGE SWITCHER SYSTEM
GOAL

Language switcher должен ощущаться premium.

REQUIRED BEHAVIOR
SWITCHING MUST BE:
instant
smooth
responsive
visually polished
SWITCHER MUST:
clearly indicate active language
have subtle hover states
work perfectly on mobile
preserve route state
AVOID:
full page refresh
flashing
layout jumps
inconsistent state
LOCALIZATION UX RULES
TEXT LENGTH HANDLING

KZ и RU тексты могут иметь:

разную длину
разную плотность
разную typography rhythm
UI MUST HANDLE:
long labels
multiline text
adaptive spacing
responsive wrapping
NEVER:
hardcode widths
assume same text length
clip translations
RESPONSIVE LOCALIZATION
MOBILE LOCALIZATION

Localization обязана:

корректно работать на mobile
не ломать spacing
не ломать cards
не ломать buttons
CHECK:
navbar
buttons
cards
filters
drawers
cart
checkout
IMPORTANT

Kazakh language НЕ должен ломать:

alignment
typography
layout hierarchy
TRANSLATION QUALITY SYSTEM
TRANSLATIONS MUST FEEL
natural
modern
premium
native
human
AVOID
robotic translation
awkward phrasing
literal machine translation
inconsistent terminology
TONE OF VOICE

Tone должен быть:

clean
modern
professional
premium
friendly

НЕ:

corporate-heavy
outdated
bureaucratic
TERMINOLOGY CONSISTENCY
CREATE SHARED TERMINOLOGY SYSTEM

Одинаковые термины должны:

переводиться одинаково
использоваться consistently
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
IMPORTANT

Нельзя:

менять терминологию хаотично
использовать несколько переводов одного слова
LOCALIZATION PERFORMANCE RULES
MUST OPTIMIZE
translation loading
bundle splitting
locale hydration
dynamic imports
PREFER
lazy-loaded dictionaries
route-based translation loading
memoized translation access
AVOID
loading all locales at once
giant translation payloads
unnecessary rerenders
SEO LOCALIZATION SYSTEM
REQUIRED

Localization architecture должна быть готова к:

multilingual SEO
locale routes
metadata translations
alternate language indexing
FUTURE SUPPORT
/ru
/kz
META TAGS

Каждый язык должен поддерживать:

translated titles
translated descriptions
localized OpenGraph metadata
LOCALIZATION DEVELOPMENT RULES
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
EVERY COMPONENT MUST:
support translations
support dynamic text
support responsive localization
avoid fixed-width assumptions
COMPONENTS TO PRIORITIZE
HIGH PRIORITY
navbar
catalog
product cards
cart drawer
checkout
MEDIUM PRIORITY
homepage sections
footer
buttons
forms
STATE MANAGEMENT RULES

Localization state обязан:

быть predictable
быть globally available
быть persistent
MUST PERSIST:
selected language
user preference
PREFER:
localStorage persistence
cookie sync if SSR needed
HYDRATION SAFETY RULES

Localization НЕ должен:

создавать hydration mismatch
вызывать flashing language
ломать SSR rendering
ALWAYS:
initialize safely
sync client/server locale
avoid rendering mismatch
LOCALIZATION QA CHECKLIST

Перед завершением localization задачи проверить:

FUNCTIONAL
language switching works?
translations loading?
persistence working?
UI
no overflow?
no layout breaking?
typography balanced?
RESPONSIVE
mobile safe?
tablet safe?
desktop safe?
PERFORMANCE
no rerender storms?
no hydration issues?
optimized loading?
FUTURE SCALABILITY

Архитура обязана быть готова к:

EN localization
Uzbek localization
AI translations
CMS integration
admin translation panel
IMPORTANT

Система должна масштабироваться:
без полного rewrite.

FINAL LOCALIZATION EXPERIENCE GOAL

Пользователь должен ощущать:

“Этот продукт изначально создавался multilingual-first.”

А НЕ:
“сюда потом добавили второй язык.”

FINAL DIRECTIVE

Claude Code обязан:

строить scalable localization architecture
поддерживать premium UX
избегать localization chaos
обеспечивать seamless language switching
сохранять visual consistency между языками
END OF FILE