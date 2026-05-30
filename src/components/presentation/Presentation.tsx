"use client"

/**
 * Presentation — the full /presentation showcase. A cinematic, mobile-first
 * product demo for Food Service Kazakhstan, assembled from real design tokens,
 * real products and replicas of the live mobile UI. Section components are kept
 * small and local; shared motion/layout lives in ./primitives.
 */

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowRight, ArrowDown, ShoppingCart, Smartphone, Search, Zap, Grid3x3,
  CreditCard, MapPin, Clock, CheckCircle2, Truck, Bell, TrendingUp, User,
  Package, Send, ShieldCheck, Sparkles, Star, Plus, Heart, ShoppingBag,
} from "lucide-react"

import {
  Reveal, Stagger, StaggerItem, WordReveal, SectionShell, Eyebrow,
  Counter, GlassPanel, ScrollProgress, Float, BlurReveal, MaskReveal,
  useIsMobile,
} from "./primitives"
import {
  PhoneFrame, CatalogScreen, ProductScreen, CartScreen, ScrollPhone,
} from "./PhoneMockup"
import type { PresProduct } from "./types"

/* ════════════════════════════════════════════════════════════════════════
   FoodService brand mark (inline — no link, presentation context)
   ════════════════════════════════════════════════════════════════════════ */

function BrandMark({ white = false, size = 44 }: { white?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className="flex-shrink-0">
        <rect width="80" height="80" rx="18" fill={white ? "rgba(255,255,255,0.14)" : "#005B46"} />
        <rect x="8" y="8" width="64" height="64" rx="14" fill={white ? "rgba(255,255,255,0.1)" : "#006B54"} />
        <rect x="20" y="20" width="38" height="8" rx="4" fill="white" />
        <rect x="20" y="34" width="28" height="7" rx="3.5" fill="white" />
        <rect x="20" y="20" width="8" height="40" rx="4" fill="white" />
      </svg>
      <span className="leading-none text-left">
        <span className={`block text-base font-bold tracking-tight ${white ? "text-white" : "text-fs-graphite"}`}>
          Food Service
        </span>
        <span className={`block text-[10px] font-semibold tracking-[0.22em] uppercase mt-0.5 ${white ? "text-white/60" : "text-fs-primary"}`}>
          Kazakhstan
        </span>
      </span>
    </span>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 1 — HERO
   ════════════════════════════════════════════════════════════════════════ */

function HeroSection({ products }: { products: PresProduct[] }) {
  const pills = products.slice(0, 4)
  const mobile = useIsMobile()
  return (
    <SectionShell id="hero" ambient="strong-light" className="fs-page-bg pt-28">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* LEFT — copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center lg:justify-start mb-8"
          >
            <BrandMark />
          </motion.div>

          <h1 className="text-[2.5rem] sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.04] text-fs-graphite">
            <WordReveal text="Food Service Kazakhstan" highlight={["Service"]} />
          </h1>

          <Reveal delay={0.5} className="mt-5">
            <p className="text-base sm:text-lg text-fs-gray max-w-md mx-auto lg:mx-0 leading-relaxed">
              Современная платформа доставки продуктов для жителей{" "}
              <span className="font-semibold text-fs-graphite">Шымкента</span>.
            </p>
          </Reveal>

          <Reveal delay={0.65} className="mt-8">
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="#problem"
                className="group inline-flex items-center justify-center gap-2 rounded-pill bg-fs-primary px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(0,91,70,0.35)] transition-transform hover:scale-[1.03] active:scale-95"
              >
                Смотреть презентацию
                <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
              </a>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-pill border border-fs-border bg-fs-white px-7 py-3.5 text-sm font-bold text-fs-graphite transition-colors hover:border-fs-primary/40"
              >
                Открыть сайт
                <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          {/* stats */}
          <Reveal delay={0.85} className="mt-12">
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { v: 387, s: "+", l: "товаров" },
                { v: 19, s: "", l: "категорий" },
                { v: 100, s: "%", l: "mobile-first" },
              ].map((stat) => (
                <div key={stat.l} className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-fs-primary">
                    <Counter to={stat.v} suffix={stat.s} />
                  </div>
                  <div className="text-[11px] sm:text-xs font-medium text-fs-gray mt-1">{stat.l}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* feature chips */}
          <Reveal delay={1} className="mt-6">
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {["Mobile First", "PWA Ready", "Fast Checkout"].map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-pill bg-fs-white/70 backdrop-blur border border-fs-border px-3 py-1.5 text-[11px] font-bold text-fs-graphite">
                  <CheckCircle2 size={12} className="text-fs-primary" />
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* RIGHT — scroll-reactive phone + floating pills */}
        <div className="relative flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 80, rotateZ: -3 }}
            animate={{ opacity: 1, y: 0, rotateZ: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            {mobile ? (
              <Float amplitude={8} duration={7}>
                <PhoneFrame>
                  <CatalogScreen products={products} />
                </PhoneFrame>
              </Float>
            ) : (
              <ScrollPhone
                labels={["Каталог", "Товар", "Корзина"]}
                screens={[
                  <CatalogScreen key="cat" products={products} />,
                  <ProductScreen key="prod" product={products[0]} />,
                  <CartScreen key="cart" products={products} />,
                ]}
              />
            )}
          </motion.div>

          {/* floating product pills — desktop only to keep mobile clean */}
          <div className="hidden lg:block">
            {pills.map((p, i) => {
              const pos = [
                "top-6 -left-6",
                "top-32 -right-10",
                "bottom-24 -left-12",
                "bottom-8 -right-6",
              ][i]
              return (
                <motion.div
                  key={p.id}
                  className={`absolute ${pos} z-20`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.15, type: "spring", stiffness: 200, damping: 16 }}
                >
                  <Float amplitude={8} duration={5 + i} delay={i * 0.4}>
                    <div className="flex items-center gap-2 rounded-pill bg-white/80 backdrop-blur-xl border border-white/60 pl-2 pr-3.5 py-1.5 shadow-[0_8px_30px_rgba(0,91,70,0.12)]">
                      <span className="w-7 h-7 rounded-full bg-[#F0F4F2] flex items-center justify-center text-base overflow-hidden relative">
                        {p.image ? (
                          <Image src={p.image} alt="" fill sizes="28px" className="object-contain p-0.5" />
                        ) : p.emoji}
                      </span>
                      <span className="text-[11px] font-bold text-fs-graphite">{p.price}</span>
                    </div>
                  </Float>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* scroll hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-fs-gray"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest">Листайте</span>
        <ArrowDown size={16} />
      </motion.div>
    </SectionShell>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 2 — PROBLEM
   ════════════════════════════════════════════════════════════════════════ */

const PROBLEMS = [
  { icon: Smartphone, t: "Неудобные сайты", d: "Локальные магазины используют устаревшие интерфейсы, в которых сложно ориентироваться." },
  { icon: Grid3x3, t: "Слабая мобильная версия", d: "Desktop-вёрстка, втиснутая в телефон: мелкие кнопки, горизонтальный скролл." },
  { icon: Clock, t: "Долгий путь до заказа", d: "Слишком много шагов и форм между «хочу купить» и «оформил заказ»." },
  { icon: Sparkles, t: "Нет современного UX", d: "Отсутствие анимаций, обратной связи и ощущения качественного продукта." },
  { icon: ShoppingBag, t: "Нет ощущения приложения", d: "Сайт не похож на приложение, которым хочется пользоваться каждый день." },
]

function ProblemSection() {
  return (
    <SectionShell id="problem" bg="graphite" ambient="dark">
      <div className="text-center mb-12 lg:mb-16">
        <Eyebrow dark>Проблема</Eyebrow>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white max-w-2xl mx-auto leading-tight">
          <WordReveal text="Проблема локальной доставки продуктов" highlight={["доставки"]} />
        </h2>
      </div>

      <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROBLEMS.map(({ icon: Icon, t, d }) => (
          <StaggerItem key={t}>
            <div className="h-full rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 transition-colors hover:bg-white/[0.07]">
              <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center mb-4">
                <Icon size={20} className="text-red-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{t}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{d}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 3 — SOLUTION
   ════════════════════════════════════════════════════════════════════════ */

const SOLUTIONS = [
  { icon: Grid3x3, t: "Каталог в 2 колонки", d: "Витрина мобильного приложения прямо в браузере." },
  { icon: Zap, t: "Быстрые категории", d: "Мгновенный доступ к 19 категориям продуктов." },
  { icon: ShoppingCart, t: "Корзина — bottom sheet", d: "Привычная мобильная корзина, выезжающая снизу." },
  { icon: Smartphone, t: "PWA-поведение", d: "Устанавливается на телефон как настоящее приложение." },
]

function SolutionSection({ products }: { products: PresProduct[] }) {
  return (
    <SectionShell id="solution" ambient="light" className="fs-page-bg">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1">
          <Eyebrow>Решение</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fs-graphite leading-tight mb-8">
            <WordReveal text="Food Service решает это через mobile-first опыт" highlight={["mobile-first"]} />
          </h2>
          <Stagger className="grid sm:grid-cols-2 gap-4">
            {SOLUTIONS.map(({ icon: Icon, t, d }) => (
              <StaggerItem key={t}>
                <GlassPanel className="h-full p-5">
                  <div className="w-10 h-10 rounded-xl bg-fs-primary/10 flex items-center justify-center mb-3">
                    <Icon size={18} className="text-fs-primary" />
                  </div>
                  <h3 className="text-[15px] font-bold text-fs-graphite mb-1.5">{t}</h3>
                  <p className="text-[13px] text-fs-gray leading-relaxed">{d}</p>
                </GlassPanel>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <div className="order-1 lg:order-2 flex justify-center">
          <Reveal>
            <Float amplitude={9} duration={6.5}>
              <PhoneFrame>
                <CatalogScreen products={products} />
              </PhoneFrame>
            </Float>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 4 — CATALOG EXPERIENCE
   ════════════════════════════════════════════════════════════════════════ */

const CAT_PILLS = ["🔥 Скидки", "🍗 Мясо", "🥛 Молочное", "🥦 Овощи", "🍞 Выпечка", "🧃 Напитки", "☕ Кофе"]

function CatalogSection({ products }: { products: PresProduct[] }) {
  return (
    <SectionShell id="catalog" bg="white" ambient="light">
      <div className="text-center mb-10">
        <Eyebrow>Каталог</Eyebrow>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fs-graphite leading-tight max-w-2xl mx-auto">
          <WordReveal text="Витрина мобильного приложения" highlight={["приложения"]} />
        </h2>
        <BlurReveal delay={0.2}>
          <p className="mt-4 text-base text-fs-gray max-w-xl mx-auto">
            Каталог построен как витрина мобильного приложения: быстро, понятно, удобно.
          </p>
        </BlurReveal>
      </div>

      {/* category pills — horizontal scroll feel */}
      <Reveal delay={0.1}>
        <div className="flex gap-2.5 overflow-x-auto pb-3 mb-8 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center scrollbar-none">
          {CAT_PILLS.map((c, i) => (
            <span
              key={c}
              className={`shrink-0 rounded-pill px-4 py-2 text-sm font-semibold border transition-colors ${
                i === 0
                  ? "bg-fs-primary text-white border-fs-primary"
                  : "bg-fs-white text-fs-gray border-fs-border hover:border-fs-primary/30"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </Reveal>

      {/* product grid */}
      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" amount={0.1}>
        {products.slice(0, 8).map((p) => (
          <StaggerItem key={p.id}>
            <MiniProductCard p={p} />
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  )
}

function MiniProductCard({ p }: { p: PresProduct }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative h-full rounded-2xl bg-fs-white border border-fs-border overflow-hidden shadow-card hover:shadow-[0_24px_60px_-12px_rgba(0,91,70,0.30)] hover:border-fs-primary/30 transition-shadow duration-300 flex flex-col"
    >
      {/* depth glow on hover */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(13,158,118,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="relative w-full overflow-hidden z-[1]"
        style={{
          aspectRatio: "1 / 1",
          background: "radial-gradient(ellipse 85% 65% at 50% 70%, rgba(0,91,70,0.08) 0%, rgb(var(--fs-light)) 100%)",
        }}
      >
        {p.image ? (
          <Image
            src={p.image}
            alt={p.title}
            fill
            sizes="(max-width:640px) 50vw, 25vw"
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-4xl">{p.emoji}</span>
        )}
        {p.discountPercent && (
          <span className="absolute top-2.5 left-2.5 rounded-pill bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            -{p.discountPercent}%
          </span>
        )}
      </div>
      <div className="relative z-[1] p-3 sm:p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-fs-primary mb-1 truncate">
          {p.category}
        </span>
        <h3 className="text-sm font-bold text-fs-graphite leading-snug line-clamp-2 flex-1">{p.title}</h3>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-fs-border">
          <span className="text-base font-black text-fs-graphite">{p.price}</span>
          <span className="w-9 h-9 rounded-xl bg-fs-primary flex items-center justify-center shadow-[0_4px_14px_rgba(0,91,70,0.35)]">
            <Plus size={16} className="text-white" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 5 — PRODUCT CARD (Apple-style annotations)
   ════════════════════════════════════════════════════════════════════════ */

const CARD_NOTES = [
  { t: "Фото товара", d: "Чёткое изображение на мягком фоне" },
  { t: "Категория и рейтинг", d: "Контекст и доверие с первого взгляда" },
  { t: "Название и описание", d: "Понятно, что именно покупаешь" },
  { t: "Цена и вес", d: "Прозрачная стоимость за единицу" },
  { t: "Кнопка в корзину", d: "Один тап — товар добавлен" },
]

function ProductCardSection({ product }: { product: PresProduct }) {
  return (
    <SectionShell id="product-card" ambient="light" className="fs-page-bg">
      <div className="text-center mb-12">
        <Eyebrow>Карточка товара</Eyebrow>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fs-graphite leading-tight">
          <WordReveal text="Каждая деталь продумана" highlight={["продумана"]} />
        </h2>
      </div>

      <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-6 items-center">
        {/* left notes (desktop) */}
        <div className="hidden lg:flex flex-col gap-6 text-right">
          {CARD_NOTES.slice(0, 3).map((n, i) => (
            <AnnotationItem key={n.t} note={n} side="right" delay={i * 0.12} />
          ))}
        </div>

        {/* the card */}
        <Reveal className="justify-self-center w-full max-w-[280px]">
          <MiniProductCard p={product} />
        </Reveal>

        {/* right notes (desktop) */}
        <div className="hidden lg:flex flex-col gap-6">
          {CARD_NOTES.slice(3).map((n, i) => (
            <AnnotationItem key={n.t} note={n} side="left" delay={i * 0.12} />
          ))}
        </div>

        {/* mobile: notes list below */}
        <Stagger className="lg:hidden grid sm:grid-cols-2 gap-3 mt-2">
          {CARD_NOTES.map((n) => (
            <StaggerItem key={n.t}>
              <div className="flex items-start gap-3 rounded-xl bg-fs-white border border-fs-border p-4">
                <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-fs-primary/10 text-fs-primary flex items-center justify-center text-xs font-black">
                  ✓
                </span>
                <div>
                  <div className="text-sm font-bold text-fs-graphite">{n.t}</div>
                  <div className="text-xs text-fs-gray mt-0.5 leading-relaxed">{n.d}</div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </SectionShell>
  )
}

function AnnotationItem({
  note, side, delay,
}: { note: { t: string; d: string }; side: "left" | "right"; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div className={`flex items-center gap-3 ${side === "right" ? "flex-row-reverse text-right" : ""}`}>
        <span className="w-2 h-2 shrink-0 rounded-full bg-fs-accent shadow-[0_0_0_4px_rgba(13,158,118,0.15)]" />
        <span className={`h-px w-8 ${side === "right" ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-fs-accent/60 to-transparent`} />
        <div>
          <div className="text-sm font-bold text-fs-graphite">{note.t}</div>
          <div className="text-xs text-fs-gray mt-0.5 leading-relaxed max-w-[180px]">{note.d}</div>
        </div>
      </div>
    </Reveal>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 6 — PRODUCT PAGE
   ════════════════════════════════════════════════════════════════════════ */

function ProductPageSection({ product }: { product: PresProduct }) {
  return (
    <SectionShell id="product-page" bg="mint" ambient="light">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center">
          <Reveal>
            <Float amplitude={9} duration={6}>
              <PhoneFrame>
                <ProductScreen product={product} />
              </PhoneFrame>
            </Float>
          </Reveal>
        </div>
        <div>
          <Eyebrow>Страница товара</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fs-graphite leading-tight mb-5">
            <WordReveal text="Покупка с телефона за секунды" highlight={["секунды"]} />
          </h2>
          <Reveal delay={0.2}>
            <p className="text-base text-fs-gray leading-relaxed mb-8 max-w-md">
              Страница товара адаптирована под покупку с телефона: минимум лишних действий, максимум ясности.
            </p>
          </Reveal>
          <Stagger className="space-y-3">
            {[
              { icon: Smartphone, t: "Крупное фото сверху" },
              { icon: CheckCircle2, t: "Цена и описание без скролла" },
              { icon: ShoppingCart, t: "Sticky-кнопка «В корзину» снизу" },
            ].map(({ icon: Icon, t }) => (
              <StaggerItem key={t}>
                <div className="flex items-center gap-3 rounded-xl bg-fs-white/70 backdrop-blur border border-fs-border px-4 py-3">
                  <Icon size={18} className="text-fs-primary shrink-0" />
                  <span className="text-sm font-semibold text-fs-graphite">{t}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </SectionShell>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 7 — CART BOTTOM SHEET
   ════════════════════════════════════════════════════════════════════════ */

function CartSection({ products }: { products: PresProduct[] }) {
  return (
    <SectionShell id="cart" bg="graphite" ambient="dark">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Eyebrow dark>Корзина</Eyebrow>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight mb-5">
            <WordReveal text="Корзина как в приложении" highlight={["приложении"]} />
          </h2>
          <Reveal delay={0.2}>
            <p className="text-base text-white/55 leading-relaxed mb-8 max-w-md">
              Снизу выезжает bottom sheet, количество меняется одним тапом, итог пересчитывается мгновенно.
            </p>
          </Reveal>
          <Stagger className="space-y-3">
            {[
              "Bottom sheet выезжает снизу",
              "Количество меняется тапом",
              "Итог пересчитывается в реальном времени",
              "Кнопка «Оформить заказ» всегда под рукой",
            ].map((t) => (
              <StaggerItem key={t}>
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircle2 size={18} className="text-fs-accent shrink-0" />
                  <span className="text-sm font-medium">{t}</span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <div className="flex justify-center">
          <Reveal>
            <PhoneFrame>
              <CartScreen products={products} />
            </PhoneFrame>
          </Reveal>
        </div>
      </div>

      {/* ANIMATED PRODUCT JOURNEY */}
      <ProductJourney product={products[0]} />
    </SectionShell>
  )
}

/* Animated path: товар → летит в корзину → сумма → оформление → подтверждение */
function ProductJourney({ product }: { product: PresProduct }) {
  const stages = [
    { icon: Sparkles, label: "Товар", sub: product.title.split(" ").slice(0, 2).join(" ") },
    { icon: ShoppingCart, label: "В корзину", sub: "+1" },
    { icon: CreditCard, label: "Сумма", sub: product.price },
    { icon: Truck, label: "Оформление", sub: "Доставка" },
    { icon: CheckCircle2, label: "Готово", sub: "Заказ принят" },
  ]
  return (
    <Reveal className="mt-16 lg:mt-20">
      <GlassPanel dark className="p-5 sm:p-7">
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-fs-accent">Путь заказа</span>
          <h3 className="mt-1 text-lg sm:text-xl font-black text-white">От витрины до подтверждения</h3>
        </div>

        <div className="relative">
          {/* connecting line (desktop) */}
          <div className="hidden sm:block absolute left-0 right-0 top-6 h-px bg-white/10" />
          <motion.div
            className="hidden sm:block absolute left-0 top-6 h-px bg-gradient-to-r from-fs-accent to-emerald-300 origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%" }}
          />

          <div className="relative grid grid-cols-5 gap-1.5 sm:gap-3">
            {stages.map((s, i) => (
              <motion.div
                key={s.label}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 16, scale: 0.85 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.25 + i * 0.28, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-fs-primary flex items-center justify-center shadow-[0_8px_24px_rgba(0,91,70,0.4)]"
                  initial={{ boxShadow: "0 0 0 0 rgba(13,158,118,0)" }}
                  whileInView={{ boxShadow: ["0 0 0 0 rgba(13,158,118,0.5)", "0 0 0 10px rgba(13,158,118,0)"] }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: 0.25 + i * 0.28, duration: 0.7 }}
                >
                  <s.icon size={18} className="text-white" />
                </motion.div>
                <span className="mt-2 text-[10px] sm:text-xs font-bold text-white leading-tight">{s.label}</span>
                <span className="text-[9px] sm:text-[10px] text-white/45 leading-tight line-clamp-1">{s.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassPanel>
    </Reveal>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 8 — CHECKOUT FLOW
   ════════════════════════════════════════════════════════════════════════ */

const STEPS = [
  { icon: User, t: "Контакты", d: "Имя и телефон" },
  { icon: MapPin, t: "Адрес", d: "Куда доставить" },
  { icon: Clock, t: "Время доставки", d: "Удобный интервал" },
  { icon: CreditCard, t: "Оплата", d: "Картой или наличными" },
  { icon: CheckCircle2, t: "Подтверждение", d: "Заказ оформлен" },
]

function CheckoutSection() {
  return (
    <SectionShell id="checkout" ambient="light" className="fs-page-bg">
      <div className="text-center mb-12">
        <Eyebrow>Оформление заказа</Eyebrow>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fs-graphite leading-tight">
          <WordReveal text="Открыл, выбрал, оформил" highlight={["оформил"]} />
        </h2>
      </div>

      <Stagger className="relative grid sm:grid-cols-2 lg:grid-cols-5 gap-4" amount={0.1}>
        {STEPS.map(({ icon: Icon, t, d }, i) => (
          <StaggerItem key={t}>
            <div className="relative h-full rounded-2xl bg-fs-white border border-fs-border p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-fs-primary/10 flex items-center justify-center">
                  <Icon size={20} className="text-fs-primary" />
                </div>
                <span className="text-2xl font-black text-fs-border">{i + 1}</span>
              </div>
              <h3 className="text-[15px] font-bold text-fs-graphite">{t}</h3>
              <p className="text-xs text-fs-gray mt-1">{d}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight size={16} className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-fs-primary/40" />
              )}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 9 — MOBILE FIRST
   ════════════════════════════════════════════════════════════════════════ */

const MOBILE_FEATURES = [
  "Нет горизонтального скролла",
  "Нижняя навигация",
  "Крупные tap targets",
  "Каталог в 2 колонки",
  "Корзина снизу",
  "Sticky CTA",
]

function MobileFirstSection({ products }: { products: PresProduct[] }) {
  const widths = ["360px", "390px", "412px", "430px"]
  return (
    <SectionShell id="mobile-first" bg="white" ambient="light">
      <div className="text-center mb-12">
        <Eyebrow>Mobile-first</Eyebrow>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fs-graphite leading-tight">
          <WordReveal text="Идеально на любом телефоне" highlight={["любом"]} />
        </h2>
      </div>

      {/* device row */}
      <Reveal>
        <div className="flex gap-5 sm:gap-8 justify-start lg:justify-center overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 scrollbar-none">
          {widths.map((w, i) => (
            <div key={w} className="shrink-0 flex flex-col items-center gap-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="scale-[0.78] sm:scale-90 origin-top"
              >
                <PhoneFrame glow={i === 1}>
                  {i % 2 === 0 ? <CatalogScreen products={products} /> : <ProductScreen product={products[0]} />}
                </PhoneFrame>
              </motion.div>
              <span className="rounded-pill bg-fs-primary/8 border border-fs-primary/15 px-3 py-1 text-xs font-bold text-fs-primary">
                {w}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* feature chips */}
      <Stagger className="flex flex-wrap justify-center gap-2.5 mt-10">
        {MOBILE_FEATURES.map((f) => (
          <StaggerItem key={f}>
            <span className="inline-flex items-center gap-2 rounded-pill bg-fs-white border border-fs-border px-4 py-2 text-sm font-semibold text-fs-graphite">
              <CheckCircle2 size={15} className="text-fs-primary" />
              {f}
            </span>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 10 — ADMIN / BUSINESS LAYER
   ════════════════════════════════════════════════════════════════════════ */

const BUSINESS = [
  { icon: Package, t: "Управление товарами", d: "Добавление, редактирование, остатки." },
  { icon: ShoppingCart, t: "Заказы", d: "Статусы, история, отмены в реальном времени." },
  { icon: User, t: "Клиенты", d: "База покупателей и программа лояльности." },
  { icon: Bell, t: "Уведомления", d: "Push и email на каждом этапе заказа." },
  { icon: TrendingUp, t: "Аналитика", d: "Продажи, популярные товары, динамика." },
  { icon: Send, t: "Telegram-уведомления", d: "Мгновенные оповещения о новых заказах." },
]

function BusinessSection() {
  return (
    <SectionShell id="business" bg="graphite" ambient="dark">
      <div className="text-center mb-12">
        <Eyebrow dark>Бизнес-слой</Eyebrow>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight max-w-2xl mx-auto">
          <WordReveal text="Не просто витрина, а система" highlight={["система"]} />
        </h2>
      </div>

      <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BUSINESS.map(({ icon: Icon, t, d }) => (
          <StaggerItem key={t}>
            <div className="h-full rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm p-6 transition-colors hover:bg-white/[0.07]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-fs-accent/15 flex items-center justify-center">
                  <Icon size={20} className="text-fs-accent" />
                </div>
                <ArrowRight size={16} className="text-white/20" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">{t}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{d}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 11 — TECHNOLOGY STACK
   ════════════════════════════════════════════════════════════════════════ */

const STACK = [
  { name: "Next.js", d: "App Router, RSC", mono: "▲" },
  { name: "TypeScript", d: "Типобезопасность", mono: "TS" },
  { name: "Tailwind CSS", d: "Дизайн-система", mono: "~" },
  { name: "Zustand", d: "Состояние корзины", mono: "Z" },
  { name: "Supabase", d: "База данных", mono: "S" },
  { name: "Vercel", d: "Production хостинг", mono: "△" },
  { name: "PWA", d: "Установка на телефон", mono: "◎" },
  { name: "Telegram API", d: "Уведомления", mono: "✈" },
]

function StackSection() {
  return (
    <SectionShell id="stack" ambient="light" className="fs-page-bg">
      <div className="text-center mb-12">
        <Eyebrow>Технологии</Eyebrow>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fs-graphite leading-tight">
          <WordReveal text="Современный production-ready стек" highlight={["production-ready"]} />
        </h2>
      </div>

      <Stagger className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" amount={0.1}>
        {STACK.map((s) => (
          <StaggerItem key={s.name}>
            <GlassPanel className="h-full p-5 flex flex-col items-start gap-3 transition-transform hover:-translate-y-1">
              <span className="w-11 h-11 rounded-xl bg-fs-primary text-white flex items-center justify-center text-lg font-black">
                {s.mono}
              </span>
              <div>
                <div className="text-[15px] font-bold text-fs-graphite">{s.name}</div>
                <div className="text-xs text-fs-gray mt-0.5">{s.d}</div>
              </div>
            </GlassPanel>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 12 — ROADMAP
   ════════════════════════════════════════════════════════════════════════ */

const DONE = [
  "Каталог из 387 товаров", "Карточки товаров", "Мобильная версия",
  "Корзина (bottom sheet)", "Оформление заказа", "Адаптация под телефоны",
  "Vercel production deployment",
]
const NEXT = [
  "Финальный аудит ассортимента", "Подключение домена", "Онлайн-оплата",
  "Push-уведомления", "UGC / promo-контент", "Личный кабинет клиента",
  "История заказов",
]

function RoadmapSection() {
  return (
    <SectionShell id="roadmap" bg="mint" ambient="light">
      <div className="text-center mb-12">
        <Eyebrow>Roadmap</Eyebrow>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fs-graphite leading-tight">
          <WordReveal text="Путь продукта к запуску" highlight={["запуску"]} />
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* done */}
        <Reveal>
          <div className="rounded-2xl bg-fs-white border border-fs-border p-6 sm:p-8 h-full">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-9 h-9 rounded-xl bg-fs-primary/10 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-fs-primary" />
              </span>
              <h3 className="text-lg font-black text-fs-graphite">Готово</h3>
            </div>
            <ul className="space-y-3.5">
              {DONE.map((d, i) => (
                <motion.li
                  key={d}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="flex items-center gap-3 text-sm text-fs-graphite"
                >
                  <CheckCircle2 size={16} className="text-fs-primary shrink-0" />
                  {d}
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* next */}
        <Reveal delay={0.15}>
          <div className="rounded-2xl bg-fs-white border border-dashed border-fs-primary/30 p-6 sm:p-8 h-full">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock size={18} className="text-amber-500" />
              </span>
              <h3 className="text-lg font-black text-fs-graphite">В работе · следующий этап</h3>
            </div>
            <ul className="space-y-3.5">
              {NEXT.map((d, i) => (
                <motion.li
                  key={d}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="flex items-center gap-3 text-sm text-fs-gray"
                >
                  <span className="w-4 h-4 shrink-0 rounded-full border-2 border-amber-400/60" />
                  {d}
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   SECTION 13 — FINAL
   ════════════════════════════════════════════════════════════════════════ */

function FinalSection({ products }: { products: PresProduct[] }) {
  const floats = products.slice(0, 5)
  return (
    <SectionShell id="final" bg="graphite" ambient="strong-dark" className="text-center">
      {/* cinematic light rays from top */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[60vh] z-[1] pointer-events-none"
        style={{
          background:
            "conic-gradient(from 180deg at 50% -10%, transparent 0deg, rgba(13,158,118,0.16) 25deg, transparent 50deg, rgba(52,211,153,0.12) 75deg, transparent 110deg)",
        }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* floating product cards */}
      <div className="hidden sm:block">
        {floats.map((p, i) => {
          const pos = [
            "top-[12%] left-[8%]", "top-[20%] right-[10%]", "bottom-[18%] left-[12%]",
            "bottom-[14%] right-[14%]", "top-[44%] left-[3%]",
          ][i]
          return (
            <Float key={p.id} className={`absolute ${pos} z-0`} amplitude={10} duration={5 + i} delay={i * 0.5}>
              <div className="flex items-center gap-2 rounded-pill bg-white/[0.06] backdrop-blur-md border border-white/10 pl-2 pr-3.5 py-1.5">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-base overflow-hidden relative">
                  {p.image ? <Image src={p.image} alt="" fill sizes="28px" className="object-contain p-0.5" /> : p.emoji}
                </span>
                <span className="text-[11px] font-bold text-white/80">{p.price}</span>
              </div>
            </Float>
          )
        })}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <Reveal>
          <div className="mb-8"><BrandMark white size={56} /></div>
        </Reveal>

        <h2 className="text-[2.75rem] sm:text-6xl lg:text-8xl font-black tracking-tight text-white leading-[0.98]">
          <WordReveal text="Food Service Kazakhstan" highlight={["Service"]} />
        </h2>

        <MaskReveal delay={0.4} className="mt-6">
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent max-w-2xl">
            Будущее доставки продуктов в Шымкенте.
          </p>
        </MaskReveal>

        <Reveal delay={0.6}>
          <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-pill bg-white px-7 py-3.5 text-sm font-bold text-fs-dark transition-transform hover:scale-[1.03] active:scale-95">
              Открыть сайт <ArrowRight size={16} />
            </Link>
            <Link href="/catalog" className="inline-flex items-center justify-center gap-2 rounded-pill bg-fs-primary px-7 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.03] active:scale-95">
              Открыть каталог <Grid3x3 size={16} />
            </Link>
            <Link href="/checkout" className="inline-flex items-center justify-center gap-2 rounded-pill border border-white/20 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
              Оформление заказа <ShoppingCart size={16} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.8}>
          <div className="mt-12 flex items-center gap-2 text-white/40 text-xs font-medium">
            <ShieldCheck size={14} />
            Production-ready · Mobile-first · Premium experience
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   ROOT
   ════════════════════════════════════════════════════════════════════════ */

export default function Presentation({
  products,
  featured,
}: {
  products: PresProduct[]
  featured: PresProduct
}) {
  return (
    <main className="relative w-full overflow-x-clip bg-[var(--page-bg)] mb-[-6rem] lg:mb-0">
      <ScrollProgress />
      <HeroSection products={products} />
      <ProblemSection />
      <SolutionSection products={products} />
      <CatalogSection products={products} />
      <ProductCardSection product={featured} />
      <ProductPageSection product={featured} />
      <CartSection products={products} />
      <CheckoutSection />
      <MobileFirstSection products={products} />
      <BusinessSection />
      <StackSection />
      <RoadmapSection />
      <FinalSection products={products} />
    </main>
  )
}
