# 09_QA_AND_SECURITY_RULES.md

# FOOD SERVICE — QA & SECURITY RULES

## SYSTEM PURPOSE

Этот файл определяет:
- как Claude Code должен проверять проект
- как предотвращать баги
- как защищать архитектуру
- как безопасно работать с API и ключами
- как поддерживать production-grade stability

Главная цель:
создать безопасный, стабильный и production-ready ecosystem мирового уровня.


---

# GLOBAL QA PHILOSOPHY

QA = не отдельный этап.

QA обязан быть:
- встроен в каждый task
- встроен в каждый refactor
- встроен в каждый UI update
- встроен в каждый deployment

## CLAUDE CODE MUST THINK

Не:
“код работает”

А:
- насколько стабильно?
- насколько безопасно?
- насколько масштабируемо?
- насколько production-ready?
- какие edge cases?
- что может сломаться позже?


---

# GLOBAL SECURITY PHILOSOPHY

Security обязана быть:
- proactive
- systematic
- invisible
- scalable

## NEVER

- expose secrets
- leak environment variables
- trust unsafe inputs
- hardcode credentials
- bypass validation

## ALWAYS

- validate
- sanitize
- isolate
- protect
- verify


---

# QA EXECUTION SYSTEM

# EVERY TASK MUST INCLUDE QA

Перед завершением любой задачи Claude Code обязан проверить:

## FUNCTIONAL QA
- feature works?
- edge cases handled?
- no runtime errors?
- no console warnings?

## UI QA
- responsive?
- spacing consistent?
- typography clean?
- hover states working?

## UX QA
- intuitive?
- smooth?
- clear?
- premium feeling?

## PERFORMANCE QA
- optimized?
- no FPS drops?
- no rerender storms?

## SECURITY QA
- safe inputs?
- protected state?
- no exposed secrets?


---

# CRITICAL QA CHECKLIST

# BEFORE EVERY COMMIT

Claude Code обязан проверить:

## BUILD CHECK

```bash id="0ep7mq"
npm run build

Проверить:

build success
type safety
no critical warnings
LINT CHECK
npm run lint

Проверить:

no major lint issues
no unused imports
no dangerous patterns
TYPE CHECK
npm run type-check

или:

tsc --noEmit
RESPONSIVE CHECK

Проверить:

mobile
tablet
desktop
ultrawide
PERFORMANCE CHECK

Проверить:

layout shifts
animation smoothness
image loading
hydration behavior
RESPONSIVE QA RULES
EVERY COMPONENT MUST BE TESTED ON
MOBILE

320px → 768px

TABLET

768px → 1024px

DESKTOP

1024px+

CHECK FOR
overflow
broken layout
collapsed spacing
unreadable text
touch issues
scroll bugs
NEVER
desktop-only thinking
fixed-width assumptions
hidden mobile bugs
MOTION QA RULES
EVERY ANIMATION MUST BE CHECKED FOR
smoothness
performance
responsiveness
consistency
CHECK
FPS stability
hover timing
transition quality
animation overlap
reduced motion compatibility
NEVER
laggy motion
excessive transforms
animation spam
heavy repaints
ZUSTAND STATE QA RULES
VERIFY
state consistency
persistence
updates
hydration safety
CHECK FOR
stale state
duplicated logic
unintended rerenders
race conditions
NEVER
unsafe mutation
hidden side effects
inconsistent updates
API SECURITY RULES
NEVER EXPOSE
API keys
service role keys
database credentials
secret tokens
internal URLs
NEVER
commit .env
log secrets
expose private endpoints
send sensitive data to frontend
ALWAYS
use environment variables
validate requests
sanitize input
protect endpoints
ENVIRONMENT VARIABLE RULES
REQUIRED STRUCTURE
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
IMPORTANT
NEVER:
hardcode keys
expose service role keys
commit .env.local
ALWAYS:
use env accessors
separate public/private vars
isolate server-only secrets
SUPABASE SECURITY RULES
MUST USE
Row Level Security (RLS)
permission validation
secure queries
NEVER
trust client-side protection
expose admin access
bypass RLS
VERIFY
table permissions
insert/update restrictions
authenticated access rules
GITHUB SECURITY RULES
NEVER COMMIT
.env files
secrets
tokens
private configs
service credentials
REQUIRED
.env
.env.local
.env.production
CHECK BEFORE PUSH
no secrets in diff
no sensitive logs
no exposed URLs
VERCEL SECURITY RULES
DEPLOYMENT RULES

Environment variables обязаны:

храниться в Vercel dashboard
быть separated by environment
never exposed in frontend
VERIFY
preview deployments
production environment
build logs
serverless function safety
RAILWAY SECURITY RULES
NEVER
expose internal database URLs
leak credentials
trust public networking by default
ALWAYS
use environment variables
isolate services
verify deployment configs
AUTHENTICATION RULES
FUTURE AUTH SYSTEM MUST
validate sessions securely
use protected routes
prevent unauthorized access
support scalable auth architecture
NEVER
trust frontend auth only
expose sensitive user data
store unsafe tokens
INPUT VALIDATION RULES
ALL USER INPUT MUST BE
sanitized
validated
type-safe
NEVER TRUST
query params
form input
external data
URL state
ALWAYS
validate schema
handle edge cases
prevent malformed state
ERROR HANDLING RULES
ERRORS MUST
fail gracefully
preserve UX
avoid crashes
avoid white screens
UI ERRORS MUST
look clean
feel intentional
not expose internals
NEVER
show stack traces to users
leak backend info
expose sensitive errors
PERFORMANCE QA RULES
CHECK FOR
unnecessary rerenders
hydration mismatch
animation lag
image bloat
memory leaks
USE
memoization
lazy loading
optimized images
dynamic imports
AVOID
massive client bundles
unnecessary global state
excessive animation cost
HYDRATION SAFETY RULES
PREVENT
SSR mismatch
client/server inconsistencies
flashing content
CHECK
localStorage usage
window access
dynamic rendering
locale hydration
ALWAYS
guard browser APIs
safely initialize state
ACCESSIBILITY QA RULES
CHECK
keyboard navigation
focus states
readable contrast
semantic HTML
IMPORTANT

Premium UX = accessible UX.

NEVER
remove focus visibility
create inaccessible controls
ignore screen readers
PRODUCTION READINESS CHECKLIST

Перед production deployment Claude Code обязан проверить:

TECHNICAL
build passes
lint passes
type-check passes
UI
responsive stable
animations smooth
no broken layouts
UX
intuitive
polished
clean
PERFORMANCE
optimized
lightweight
fast
SECURITY
no exposed secrets
protected environment
safe APIs
STABILITY
no critical warnings
no runtime crashes
no hydration issues
INCIDENT PREVENTION RULES
BEFORE LARGE REFACTOR

Claude Code обязан:

analyze dependencies
identify risks
isolate changes
preserve rollback ability
NEVER
rewrite blindly
break stable systems
mix unrelated changes
QA PRIORITY ORDER
P0

Critical bugs/security risks

P1

UX/performance/responsive issues

P2

Visual polish inconsistencies

P3

Experimental improvements

FINAL QUALITY STANDARD

Food Service обязан ощущаться:

stable
secure
polished
premium
reliable
production-grade

НЕ:

experimental
unstable
hacked together
fragile
FINAL DIRECTIVE

Claude Code обязан:

проверять каждый change
предотвращать баги заранее
защищать архитектуру
сохранять production stability
соблюдать security best practices
создавать world-class engineering quality
END OF FILE