"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, Heart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { useQuickViewStore } from "@/store/quickViewStore"
import { useCartStore } from "@/store/cartStore"
import { useToastStore } from "@/store/toastStore"
import { useFavoritesStore } from "@/store/favoritesStore"
import { syncFavoriteToggle } from "@/hooks/useFavoritesSync"
import { useLang } from "@/locales"
import { CATEGORY_COLORS_BY_NAME } from "@/data/categories"
import Badge from "@/components/ui/Badge"

export default function ProductQuickView() {
  const { product, close } = useQuickViewStore()
  const addItem            = useCartStore((s) => s.addItem)
  const increaseQuantity   = useCartStore((s) => s.increaseQuantity)
  const decreaseQuantity   = useCartStore((s) => s.decreaseQuantity)
  const cartItem           = useCartStore((s) => product ? s.items.find((i) => i.id === product.id) : undefined)
  const quantity           = cartItem?.quantity ?? 0
  const showToast          = useToastStore((s) => s.show)
  const toggle             = useFavoritesStore((s) => s.toggle)
  const isFav              = useFavoritesStore((s) => s.isFav)
  const { t }              = useLang()

  const favorited = product ? isFav(product.id) : false

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [close])

  // Lock body scroll while open
  useEffect(() => {
    if (product) document.body.style.overflow = "hidden"
    else          document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [product])

  const handleAdd = () => {
    if (!product) return
    addItem({ id: product.id, title: product.title, price: product.priceNum, emoji: product.emoji, image: product.image })
    showToast(product.title, product.emoji)
  }

  const categoryColor = product ? (CATEGORY_COLORS_BY_NAME[product.category] ?? "#005B46") : "#005B46"

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* BACKDROP */}
          <motion.div
            key="qv-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[80]"
          />

          {/* MODAL */}
          <motion.div
            key="qv-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="
              fixed inset-x-4 sm:inset-x-auto
              sm:left-1/2 sm:-translate-x-1/2
              top-1/2 -translate-y-1/2
              sm:w-[600px] z-[81]
              bg-fs-white rounded-3xl overflow-hidden
              shadow-[0_24px_80px_rgba(0,0,0,0.22)]
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={close}
              aria-label={t.close}
              className="
                absolute top-4 right-4 z-10
                w-9 h-9 rounded-xl
                bg-fs-white/90 backdrop-blur-sm
                border border-fs-border
                flex items-center justify-center
                text-fs-gray hover:text-fs-graphite
                transition-colors duration-150
                shadow-sm
              "
            >
              <X size={16} strokeWidth={2} />
            </button>

            {/* CATEGORY STRIPE */}
            <div className="h-1 w-full" style={{ background: categoryColor }} />

            <div className="flex flex-col sm:flex-row">

              {/* IMAGE */}
              <div
                className="sm:w-[240px] flex-shrink-0 h-52 sm:h-auto flex items-center justify-center relative overflow-hidden"
                style={{ background: `radial-gradient(ellipse 80% 70% at 50% 55%, ${categoryColor}18 0%, var(--page-bg) 100%)` }}
              >
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain p-4"
                    sizes="240px"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 opacity-25">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-fs-gray">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <circle cx="12" cy="11" r="3.5"/>
                      <path d="M3 17l4-4 3 3 4-5 4 6"/>
                    </svg>
                    <span className="text-[10px] font-medium text-fs-gray tracking-widest uppercase">Фото скоро</span>
                  </div>
                )}

                {/* DISCOUNT BADGE */}
                {product.discountPercent && (
                  <div className="absolute top-3 left-3">
                    <span className="text-label font-bold px-2.5 py-1 rounded-pill bg-red-500 text-white shadow-sm">
                      -{product.discountPercent}%
                    </span>
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="flex-1 p-6 flex flex-col gap-4 min-w-0">

                {/* BADGES */}
                <div className="flex items-center gap-2 flex-wrap">
                  {product.isNew  && <Badge variant="default">{t.product.new}</Badge>}
                  {product.isHit  && <Badge variant="warning">{t.product.hit}</Badge>}
                  {product.discountPercent && <Badge variant="error">{t.product.sale}</Badge>}
                  {product.inStock === false && <Badge variant="error">{t.product.outOfStock}</Badge>}
                  <span className="text-[11px] text-fs-muted ml-auto">{product.category}</span>
                </div>

                {/* TITLE */}
                <h2 className="text-[20px] font-black text-fs-graphite leading-tight">
                  {product.title}
                </h2>

                {/* PRICE */}
                <div className="flex items-baseline gap-3">
                  <span className="text-[22px] font-black text-fs-primary">{product.price}</span>
                  {product.oldPriceNum && (
                    <span className="text-[15px] text-fs-muted line-through">
                      ₸{product.oldPriceNum.toLocaleString()}
                    </span>
                  )}
                  {product.unit && (
                    <span className="text-[13px] text-fs-gray">{t.product.per} {product.unit}</span>
                  )}
                </div>

                {/* RATING */}
                {product.rating && parseFloat(product.rating) > 0 && (
                  <div className="flex items-center gap-1.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        strokeWidth={1.5}
                        className="text-amber-400"
                        fill={s <= Math.round(parseFloat(product.rating!)) ? "currentColor" : "none"}
                      />
                    ))}
                    <span className="text-[12px] text-fs-gray ml-1">{parseFloat(product.rating).toFixed(1)}</span>
                  </div>
                )}

                {/* DESCRIPTION */}
                {product.description && (
                  <p className="text-[13px] text-fs-gray leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                )}

                {/* ACTIONS */}
                <div className="flex items-center gap-3 mt-auto pt-2">
                  {/* CART CONTROLS */}
                  {product.inStock === false ? (
                    <div className="flex-1 py-3 rounded-xl bg-fs-offwhite border border-fs-border text-center text-[13px] text-fs-gray font-semibold">
                      {t.product.outOfStock}
                    </div>
                  ) : quantity === 0 ? (
                    <button
                      onClick={handleAdd}
                      className="
                        flex-1 flex items-center justify-center gap-2
                        py-3 rounded-xl
                        bg-fs-primary text-white text-[14px] font-bold
                        hover:opacity-90 transition-opacity duration-150
                      "
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      {t.product.addToCart}
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-between gap-3 bg-fs-white border border-fs-green rounded-xl px-4 py-2.5">
                      <button
                        onClick={() => decreaseQuantity(product.id)}
                        aria-label={t.cart.decrease}
                        className="w-8 h-8 rounded-lg bg-fs-offwhite border border-fs-border flex items-center justify-center text-fs-graphite hover:bg-fs-border transition-colors"
                      >
                        <Minus size={14} strokeWidth={2} />
                      </button>
                      <span className="text-[16px] font-black text-fs-graphite tabular-nums">{quantity}</span>
                      <button
                        onClick={() => increaseQuantity(product.id)}
                        aria-label={t.cart.increase}
                        className="w-8 h-8 rounded-lg bg-fs-primary text-white flex items-center justify-center"
                      >
                        <Plus size={14} strokeWidth={2} />
                      </button>
                    </div>
                  )}

                  {/* FAVORITE */}
                  <button
                    onClick={() => {
                      const p = { id: product.id, title: product.title, price: product.price, priceNum: product.priceNum, emoji: product.emoji, category: product.category as import("@/types").ProductCategory, description: product.description, rating: product.rating ?? "0", inStock: product.inStock ?? true }
                      toggle(p)
                      syncFavoriteToggle(p, favorited)
                    }}
                    aria-label={favorited ? t.product.removeFromFavorites : t.product.addToFavorites}
                    aria-pressed={favorited}
                    className={`
                      w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0
                      transition-all duration-200
                      ${favorited
                        ? "bg-red-500/10 border-red-500/40 text-red-400"
                        : "bg-fs-offwhite border-fs-border text-fs-gray hover:border-fs-subtle hover:text-fs-primary"
                      }
                    `}
                  >
                    <Heart size={18} strokeWidth={1.5} fill={favorited ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* DETAILS LINK */}
                <Link
                  href={`/product/${product.id}`}
                  onClick={close}
                  className="text-[12px] text-fs-gray hover:text-fs-primary transition-colors duration-150 self-start"
                >
                  {t.product.quickViewDetails}
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
