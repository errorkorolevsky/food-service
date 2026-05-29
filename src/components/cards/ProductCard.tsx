"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { Plus, Minus, Star, Heart } from "lucide-react"
import { useRef, useState } from "react"

import { useCartStore } from "@/store/cartStore"
import { useToastStore } from "@/store/toastStore"
import { useFavoritesStore } from "@/store/favoritesStore"
import { useQuickViewStore } from "@/store/quickViewStore"
import { syncFavoriteToggle } from "@/hooks/useFavoritesSync"
import { useCursorAware } from "@/hooks/useCursorAware"
import { useLang } from "@/locales"
import { CATEGORY_COLORS_BY_NAME } from "@/data/categories"
import type { Product } from "@/types"

type ProductCardProps = Pick<Product,
  "id" | "category" | "title" | "description" | "price" | "priceNum" |
  "rating" | "emoji" | "image" | "isNew" | "isHit" | "inStock" | "oldPriceNum" | "discountPercent" | "unit"
>

export default function ProductCard({
  id,
  category,
  title,
  description,
  price,
  priceNum,
  oldPriceNum,
  discountPercent,
  unit,
  rating,
  emoji,
  image,
  isNew,
  isHit,
  inStock,
}: ProductCardProps) {
  const addItem          = useCartStore((state) => state.addItem)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const cartItem         = useCartStore((state) => state.items.find((i) => i.id === id))
  const quantity         = cartItem?.quantity ?? 0
  const showToast        = useToastStore((state) => state.show)
  const toggle           = useFavoritesStore((state) => state.toggle)
  const isFav            = useFavoritesStore((state) => state.isFav)
  const favorited        = isFav(id)
  const openQuickView    = useQuickViewStore((state) => state.open)
  const { t, lang }      = useLang()

  // 3D TILT + CURSOR-AWARE LIGHTING share the same ref
  const ref = useRef<HTMLDivElement>(null)
  const { cursor, isTouch } = useCursorAware(ref)
  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 40 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 40 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const [shining,    setShining]    = useState(false)
  const [burst,      setBurst]      = useState(false)
  const [imgError,   setImgError]   = useState(false)
  const showImage = !!image && !imgError

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setShining(false)
  }

  const handleAddToCart = () => {
    addItem({ id, title, price: priceNum, oldPrice: oldPriceNum, emoji, image })
    showToast(title, emoji)
    setBurst(true)
    setTimeout(() => setBurst(false), 600)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    const product = { id, title, price, priceNum, emoji, category, description, rating, inStock } as Product
    toggle(product)
    syncFavoriteToggle(product, favorited)
  }

  // Cursor-aware gradient origin (follows cursor inside card) — desktop only
  const lightGradient = (!isTouch && cursor.active)
    ? `radial-gradient(ellipse 80% 70% at ${cursor.x * 100}% ${cursor.y * 100}%, rgba(0,91,70,0.07) 0%, transparent 70%)`
    : "none"

  // Border glow intensity driven by cursor proximity to center — desktop only
  const borderGlow = (!isTouch && cursor.active)
    ? `0 0 0 1px rgba(0,91,70,${0.10 + (1 - cursor.dist) * 0.22}), 0 4px 24px rgba(0,91,70,${0.04 + (1 - cursor.dist) * 0.10})`
    : undefined

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { if (!isTouch) setShining(true) }}
      onMouseLeave={handleMouseLeave}
      style={isTouch
        ? { boxShadow: undefined }
        : { rotateX, rotateY, transformPerspective: 900, boxShadow: borderGlow }
      }
      whileHover={{ y: -8, scale: 1.018 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="
        group
        bg-fs-white border border-fs-border rounded-2xl
        overflow-hidden shadow-card
        transition-shadow duration-300
        flex flex-col relative
      "
    >
      {/* CATEGORY COLOR STRIPE */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-30 pointer-events-none"
        style={{ background: CATEGORY_COLORS_BY_NAME[category] ?? "#005B46" }}
      />

      {/* CURSOR-AWARE LIGHT LAYER */}
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-2xl transition-all duration-200"
        style={{ background: lightGradient }}
      />

      {/* SHINE OVERLAY — desktop only */}
      {(!isTouch && shining) && (
        <div
          className="absolute inset-0 z-20 pointer-events-none rounded-2xl overflow-hidden"
          style={{ animation: "card-shine 0.55s ease forwards" }}
        />
      )}

      {/* IMAGE FRAME — fixed 1:1 ratio, consistent across all breakpoints */}
      <Link href={`/product/${id}`}>
        <div
          className="relative w-full overflow-hidden cursor-pointer"
          style={{
            aspectRatio: "1 / 1",
            // Always-on radial glow anchored at bottom of image — same for all cards
            background: `radial-gradient(ellipse 85% 65% at 50% 70%, ${CATEGORY_COLORS_BY_NAME[category] ?? "#005B46"}14 0%, rgb(var(--fs-light)) 100%)`,
          }}
        >
          {/* hover glow — intensifies the ambient on interaction */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 65% 55% at 50% 65%, ${CATEGORY_COLORS_BY_NAME[category] ?? "#005B46"}20 0%, transparent 75%)`,
            }}
          />

          {showImage ? (
            <Image
              src={image!}
              alt={title}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
              priority={false}
            />
          ) : (
            // Placeholder — same background as image cards, subtle centred icon
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 select-none">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: `${CATEGORY_COLORS_BY_NAME[category] ?? "#005B46"}12` }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"
                  style={{ color: CATEGORY_COLORS_BY_NAME[category] ?? "#005B46", opacity: 0.45 }}>
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
              <span
                className="text-[9px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: CATEGORY_COLORS_BY_NAME[category] ?? "#005B46", opacity: 0.35 }}
              >
                Фото скоро
              </span>
            </div>
          )}

          {/* BADGES */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
            {discountPercent && (
              <span className="text-label font-bold px-2.5 py-1 rounded-pill bg-red-500 text-white shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {isNew && !discountPercent && (
              <span className="text-label font-bold px-2.5 py-1 rounded-pill bg-fs-primary text-white shadow-sm">
                {t.product.new}
              </span>
            )}
            {isHit && !discountPercent && (
              <span className="text-label font-bold px-2.5 py-1 rounded-pill bg-amber-500 text-white shadow-sm">
                {t.product.hit}
              </span>
            )}
            {!inStock && (
              <span className="text-label font-bold px-2.5 py-1 rounded-pill bg-red-50 border border-red-200 text-red-500">
                {t.product.outOfStock}
              </span>
            )}
          </div>

          {/* FAVORITE */}
          <motion.button
            onClick={handleFavorite}
            aria-label={favorited ? t.product.removeFromFavorites : t.product.addToFavorites}
            aria-pressed={favorited}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            transition={{ duration: 0.15 }}
            className="
              absolute top-3 right-3 z-20
              w-8 h-8 rounded-lg
              bg-white/90 dark:bg-[#1C2128]/90 backdrop-blur-sm border border-fs-border shadow-sm
              flex items-center justify-center
              hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20
              transition-all duration-200
            "
          >
            <Heart
              size={14}
              strokeWidth={2}
              className={favorited ? "text-red-500 fill-red-500" : "text-fs-gray"}
            />
          </motion.button>

          {/* QUICK VIEW — desktop hover only */}
          {!isTouch && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                openQuickView({ id, category, title, description, price, priceNum, oldPriceNum, discountPercent, unit, rating, emoji, image, isNew, isHit, inStock })
              }}
              aria-label={t.product.quickView}
              className="
                absolute bottom-3 left-1/2 -translate-x-1/2 z-20
                px-3.5 py-1.5 rounded-full
                bg-white/90 dark:bg-[#1C2128]/90 backdrop-blur-sm border border-fs-border shadow-sm
                text-[11px] font-semibold text-fs-graphite
                opacity-0 group-hover:opacity-100
                translate-y-2 group-hover:translate-y-0
                transition-all duration-200
                whitespace-nowrap
              "
            >
              {t.product.quickView}
            </button>
          )}
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">

        <div className="flex items-center justify-between mb-2.5">
          <span className="text-label uppercase tracking-widest font-bold" style={{ color: CATEGORY_COLORS_BY_NAME[category] ?? "#005B46" }}>
            {t.categories.labels[category as keyof typeof t.categories.labels] ?? category}
          </span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={11} fill="currentColor" strokeWidth={0} />
            <span className="text-caption font-semibold text-fs-gray">{rating}</span>
          </div>
        </div>

        <Link href={`/product/${id}`}>
          <h3 className="text-base font-bold text-fs-graphite hover:text-fs-primary transition-colors duration-200 cursor-pointer leading-snug">
            {title}
          </h3>
        </Link>

        <p className="text-caption text-fs-gray mt-2 flex-1 leading-relaxed line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-fs-border">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-lg font-black ${discountPercent ? "text-red-500" : "text-fs-graphite"}`}>
                {price}
              </span>
              {oldPriceNum && (
                <span className="text-sm text-fs-gray line-through">
                  ₸{oldPriceNum.toLocaleString(lang === "kz" ? "kk-KZ" : "ru-RU")}
                </span>
              )}
            </div>
            {unit && (
              <span className="text-label text-fs-gray">/ {unit}</span>
            )}
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-1.5">
              <motion.button
                onClick={() => decreaseQuantity(id)}
                aria-label={t.cart.decrease}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="
                  w-8 h-8 rounded-lg
                  bg-fs-offwhite border border-fs-border
                  flex items-center justify-center
                  text-fs-gray hover:text-fs-graphite hover:border-fs-primary/30
                  transition-all duration-150
                "
              >
                <Minus size={13} strokeWidth={2.5} />
              </motion.button>

              <span className="text-sm font-black text-fs-graphite w-7 text-center">
                {quantity}
              </span>

              <motion.button
                onClick={() => increaseQuantity(id)}
                aria-label={t.cart.increase}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="
                  w-8 h-8 rounded-lg
                  bg-fs-primary text-white
                  flex items-center justify-center
                  hover:bg-fs-soft transition-colors duration-150
                  shadow-sm
                "
              >
                <Plus size={13} strokeWidth={2.5} />
              </motion.button>
            </div>
          ) : (
            <div className="relative">
              {/* BURST PARTICLES */}
              {burst && (
                <>
                  {[0, 60, 120, 180, 240, 300].map((angle) => (
                    <motion.div
                      key={angle}
                      className="absolute w-2 h-2 rounded-full bg-fs-primary pointer-events-none z-10"
                      style={{ top: "50%", left: "50%", marginTop: -4, marginLeft: -4 }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos((angle * Math.PI) / 180) * 24,
                        y: Math.sin((angle * Math.PI) / 180) * 24,
                        opacity: 0,
                        scale: 0.3,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  ))}
                </>
              )}
              <motion.button
                onClick={handleAddToCart}
                aria-label={t.product.addToCart}
                disabled={!inStock}
                whileHover={{ scale: inStock ? 1.1 : 1, y: inStock ? -1 : 0 }}
                whileTap={{ scale: inStock ? 0.9 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="
                  w-10 h-10 rounded-xl
                  bg-fs-primary text-white
                  flex items-center justify-center
                  hover:bg-fs-soft transition-colors duration-200
                  disabled:opacity-30 disabled:cursor-not-allowed
                  shadow-[0_4px_14px_rgba(0,91,70,0.35)]
                "
              >
                <Plus size={17} strokeWidth={2.5} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
