"use client"

/**
 * PhoneMockup — a premium device frame with real Food Service UI screens
 * rendered inside. Used across the presentation to show the actual mobile
 * experience (home, catalog, product, cart, checkout). All screens are
 * presentational replicas built from the real design tokens + product data.
 */

import Image from "next/image"
import {
  motion, AnimatePresence, useScroll, useTransform,
  useMotionValueEvent, useReducedMotion,
} from "framer-motion"
import { Search, Plus, Minus, Star, ChevronLeft, ShoppingBag } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useIsMobile } from "./primitives"
import type { PresProduct } from "./types"

/* ─── DEVICE FRAME ───────────────────────────────────────────────────────── */

export function PhoneFrame({
  children,
  className = "",
  glow = true,
}: {
  children: ReactNode
  className?: string
  glow?: boolean
}) {
  return (
    <div className={`relative ${className}`}>
      {glow && (
        <div
          className="absolute -inset-8 -z-10 rounded-full opacity-60 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(13,158,118,0.35) 0%, transparent 70%)",
          }}
        />
      )}
      <div
        className="
          relative mx-auto
          w-[244px] sm:w-[270px]
          rounded-[2.6rem] p-[3px]
          bg-gradient-to-b from-[#2a2a2e] via-[#0e0e10] to-[#1a1a1d]
          shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset]
        "
      >
        <div className="relative rounded-[2.35rem] bg-black p-[6px]">
          {/* SCREEN */}
          <div className="relative aspect-[9/19.2] w-full overflow-hidden rounded-[1.9rem] bg-[#F8FAF9]">
            {/* notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 h-5 w-24 rounded-b-2xl bg-black" />
            {children}
          </div>
        </div>
        {/* side buttons */}
        <div className="absolute -left-[2px] top-24 h-12 w-[3px] rounded-l bg-[#2a2a2e]" />
        <div className="absolute -left-[2px] top-40 h-8 w-[3px] rounded-l bg-[#2a2a2e]" />
        <div className="absolute -right-[2px] top-32 h-16 w-[3px] rounded-r bg-[#2a2a2e]" />
      </div>
    </div>
  )
}

/* ─── STATUS BAR ─────────────────────────────────────────────────────────── */

function StatusBar({ dark = false }: { dark?: boolean }) {
  const c = dark ? "text-white" : "text-fs-graphite"
  return (
    <div className={`flex items-center justify-between px-5 pt-2 pb-1 text-[10px] font-semibold ${c}`}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <div className="flex gap-[2px] items-end h-2.5">
          <span className={`w-[2px] h-1.5 rounded-sm ${dark ? "bg-white" : "bg-fs-graphite"}`} />
          <span className={`w-[2px] h-2 rounded-sm ${dark ? "bg-white" : "bg-fs-graphite"}`} />
          <span className={`w-[2px] h-2.5 rounded-sm ${dark ? "bg-white" : "bg-fs-graphite"}`} />
        </div>
        <div className={`w-5 h-2.5 rounded-[3px] border ${dark ? "border-white/70" : "border-fs-graphite/60"} relative`}>
          <div className={`absolute inset-[1.5px] right-1.5 rounded-[1px] ${dark ? "bg-white" : "bg-fs-graphite"}`} />
        </div>
      </div>
    </div>
  )
}

/* ─── MINI PRODUCT IMAGE ─────────────────────────────────────────────────── */

function MiniImage({ p, size = 80 }: { p: PresProduct; size?: number }) {
  const [err, setErr] = useState(false)
  const show = p.image && !err
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl"
      style={{
        aspectRatio: "1 / 1",
        background:
          "radial-gradient(ellipse 85% 65% at 50% 70%, rgba(0,91,70,0.08) 0%, #F0F4F2 100%)",
      }}
    >
      {show ? (
        <Image
          src={p.image!}
          alt={p.title}
          fill
          sizes={`${size}px`}
          className="object-contain p-1.5"
          onError={() => setErr(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {p.emoji}
        </div>
      )}
    </div>
  )
}

/* ─── CATALOG / HOME SCREEN ──────────────────────────────────────────────── */

const CHIPS = ["Всё", "Мясо", "Молочное", "Овощи", "Выпечка", "Напитки"]

export function CatalogScreen({ products }: { products: PresProduct[] }) {
  const [active, setActive] = useState(0)
  return (
    <div className="flex h-full flex-col bg-[#F8FAF9]">
      <StatusBar />
      {/* header */}
      <div className="px-3.5 pt-1.5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-fs-primary">Доставка · Шымкент</div>
            <div className="text-[13px] font-black text-fs-graphite leading-tight">Каталог</div>
          </div>
          <div className="w-7 h-7 rounded-xl bg-fs-primary flex items-center justify-center">
            <ShoppingBag size={13} className="text-white" />
          </div>
        </div>
        {/* search */}
        <div className="flex items-center gap-2 rounded-xl bg-white border border-fs-border px-2.5 py-1.5 shadow-sm">
          <Search size={12} className="text-fs-gray" />
          <span className="text-[9px] text-fs-gray">Поиск продуктов…</span>
        </div>
      </div>
      {/* chips */}
      <div className="flex gap-1.5 overflow-hidden px-3.5 pb-2">
        {CHIPS.slice(0, 5).map((c, i) => (
          <button
            key={c}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-pill px-2.5 py-1 text-[8.5px] font-bold transition-colors ${
              active === i
                ? "bg-fs-primary text-white"
                : "bg-white border border-fs-border text-fs-gray"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {/* grid */}
      <div className="grid grid-cols-2 gap-2 px-3.5 pb-4 overflow-hidden">
        {products.slice(0, 4).map((p) => (
          <div key={p.id} className="rounded-xl bg-white border border-fs-border p-1.5 shadow-sm">
            <MiniImage p={p} />
            <div className="mt-1 text-[9px] font-bold text-fs-graphite leading-tight line-clamp-2 min-h-[22px]">
              {p.title}
            </div>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-[10px] font-black text-fs-graphite">{p.price}</span>
              <div className="w-5 h-5 rounded-lg bg-fs-primary flex items-center justify-center">
                <Plus size={11} className="text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── PRODUCT DETAIL SCREEN ──────────────────────────────────────────────── */

export function ProductScreen({ product }: { product: PresProduct }) {
  return (
    <div className="relative flex h-full flex-col bg-[#F8FAF9]">
      <StatusBar />
      {/* back bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5">
        <div className="w-7 h-7 rounded-full bg-white border border-fs-border flex items-center justify-center shadow-sm">
          <ChevronLeft size={14} className="text-fs-graphite" />
        </div>
        <div className="w-7 h-7 rounded-full bg-white border border-fs-border flex items-center justify-center shadow-sm">
          <Star size={12} className="text-amber-500" fill="currentColor" strokeWidth={0} />
        </div>
      </div>
      {/* big image */}
      <div className="px-5">
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{
            aspectRatio: "1 / 1",
            background:
              "radial-gradient(ellipse 85% 65% at 50% 65%, rgba(0,91,70,0.1) 0%, #F0F4F2 100%)",
          }}
        >
          <MiniImageLarge product={product} />
        </div>
      </div>
      {/* info */}
      <div className="flex-1 px-4 pt-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[8px] font-bold uppercase tracking-wider text-fs-primary">
            {product.category}
          </span>
          <span className="flex items-center gap-0.5 text-amber-500 text-[9px] font-bold">
            <Star size={9} fill="currentColor" strokeWidth={0} />
            {product.rating}
          </span>
        </div>
        <div className="text-[14px] font-black text-fs-graphite leading-tight">
          {product.title}
        </div>
        <p className="mt-1.5 text-[9px] leading-relaxed text-fs-gray line-clamp-3">
          {product.description}
        </p>
      </div>
      {/* sticky CTA */}
      <div className="sticky bottom-0 border-t border-fs-border bg-white/90 backdrop-blur-md px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[14px] font-black text-fs-graphite leading-none">{product.price}</div>
            {product.unit && <div className="text-[8px] text-fs-gray mt-0.5">/ {product.unit}</div>}
          </div>
          <div className="flex-1 rounded-xl bg-fs-primary py-2.5 text-center text-[11px] font-bold text-white shadow-[0_6px_18px_rgba(0,91,70,0.35)]">
            В корзину
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniImageLarge({ product }: { product: PresProduct }) {
  const [err, setErr] = useState(false)
  const show = product.image && !err
  return show ? (
    <Image
      src={product.image!}
      alt={product.title}
      fill
      sizes="240px"
      className="object-contain p-4"
      onError={() => setErr(true)}
    />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center text-6xl">
      {product.emoji}
    </div>
  )
}

/* ─── CART BOTTOM SHEET SCREEN (animated) ────────────────────────────────── */

export function CartScreen({ products }: { products: PresProduct[] }) {
  const items = products.slice(0, 3)
  // animated quantity for the first item + recalculating total
  const [qty, setQty] = useState(1)
  const [sheetIn, setSheetIn] = useState(false)

  useEffect(() => {
    setSheetIn(true)
    const t = setInterval(() => setQty((q) => (q >= 3 ? 1 : q + 1)), 1600)
    return () => clearInterval(t)
  }, [])

  const total =
    items.reduce((sum, p, i) => sum + p.priceNum * (i === 0 ? qty : 1), 0)

  return (
    <div className="relative flex h-full flex-col bg-[#0A0F0D]">
      <StatusBar dark />
      {/* dimmed catalog behind */}
      <div className="flex-1 px-3.5 pt-2 opacity-30 grayscale">
        <div className="grid grid-cols-2 gap-2">
          {products.slice(0, 2).map((p) => (
            <div key={p.id} className="rounded-xl bg-white p-1.5">
              <MiniImage p={p} />
            </div>
          ))}
        </div>
      </div>

      {/* bottom sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: sheetIn ? "0%" : "100%" }}
        transition={{ type: "spring", stiffness: 220, damping: 28 }}
        className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-4 pt-2.5 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
      >
        <div className="mx-auto mb-2.5 h-1 w-9 rounded-full bg-fs-muted" />
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[12px] font-black text-fs-graphite">Корзина</span>
          <span className="text-[9px] font-semibold text-fs-gray">{items.length} товара</span>
        </div>

        <div className="space-y-2 mb-3">
          {items.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2.5">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-[#F0F4F2] overflow-hidden relative">
                {p.image ? (
                  <Image src={p.image} alt={p.title} fill sizes="36px" className="object-contain p-0.5" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-base">{p.emoji}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[9.5px] font-bold text-fs-graphite truncate">{p.title}</div>
                <div className="text-[9px] font-black text-fs-primary">{p.price}</div>
              </div>
              {i === 0 ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-fs-offwhite border border-fs-border flex items-center justify-center">
                    <Minus size={9} className="text-fs-gray" strokeWidth={3} />
                  </div>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={qty}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-3 text-center text-[10px] font-black text-fs-graphite"
                    >
                      {qty}
                    </motion.span>
                  </AnimatePresence>
                  <div className="w-5 h-5 rounded-md bg-fs-primary flex items-center justify-center">
                    <Plus size={9} className="text-white" strokeWidth={3} />
                  </div>
                </div>
              ) : (
                <span className="text-[9px] font-bold text-fs-gray">×1</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-fs-border pt-2.5 mb-2.5">
          <span className="text-[10px] font-semibold text-fs-gray">Итого</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={total}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-[14px] font-black text-fs-graphite"
            >
              ₸{total.toLocaleString("ru-RU")}
            </motion.span>
          </AnimatePresence>
        </div>

        <motion.div
          animate={{ boxShadow: ["0 6px 18px rgba(0,91,70,0.3)", "0 8px 26px rgba(0,91,70,0.5)", "0 6px 18px rgba(0,91,70,0.3)"] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-xl bg-fs-primary py-2.5 text-center text-[11px] font-bold text-white"
        >
          Оформить заказ
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ─── SCROLL PHONE — rotates, scales & swaps screens as you scroll ────────── */

export function ScrollPhone({
  screens,
  className = "",
  labels,
}: {
  /** ordered screen contents; the phone scrubs through them on scroll */
  screens: ReactNode[]
  className?: string
  /** optional captions shown under the device, synced to the active screen */
  labels?: string[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const mobile = useIsMobile()
  const heavy = !reduced && !mobile // scroll-scrub transforms only on capable viewports

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // device tilts and breathes through the viewport pass
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [9, 0, -9])
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-8, 0, 8])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.02, 0.9])
  const y = useTransform(scrollYProgress, [0, 1], [28, -28])

  const [idx, setIdx] = useState(0)
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (screens.length < 2) return
    // bias the active window to the centre of the pass for a natural swap
    const t = Math.min(0.999, Math.max(0, (v - 0.18) / 0.64))
    const i = Math.min(screens.length - 1, Math.max(0, Math.floor(t * screens.length)))
    setIdx((prev) => (prev === i ? prev : i))
  })

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={
          heavy
            ? { rotate, rotateY, scale, y, transformPerspective: 1300 }
            : undefined
        }
        className="will-change-transform"
      >
        <PhoneFrame>
          <div className="relative h-full w-full">
            {screens.map((s, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: i === idx ? 1 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ pointerEvents: i === idx ? "auto" : "none" }}
              >
                {s}
              </motion.div>
            ))}
          </div>
        </PhoneFrame>
      </motion.div>

      {labels && labels.length > 0 && (
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {labels.map((l, i) => (
            <span
              key={l}
              className={`rounded-pill px-3 py-1 text-[11px] font-bold transition-colors duration-300 ${
                i === idx
                  ? "bg-fs-primary text-white"
                  : "bg-fs-primary/10 text-fs-primary/60"
              }`}
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
