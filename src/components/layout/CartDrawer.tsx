"use client"

import { useSyncExternalStore, useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight, MessageSquare } from "lucide-react"

import { useCartStore } from "@/store/cartStore"
import { useCartUI } from "@/store/cartUIStore"
import { useLang } from "@/locales"
import { FREE_DELIVERY_THRESHOLD } from "@/config/commerce"
import MorphNumber from "@/components/ui/MorphNumber"
import type { CartItem } from "@/types"

type RecProduct = {
  id:        string
  title:     string
  emoji:     string
  image?:    string
  price:     string
  price_num: number
  category:  string
}

// ─── CART ITEM THUMBNAIL with loading skeleton ───────────────────────────────

function ItemThumbnail({ image, title, emoji }: Pick<CartItem, "image" | "title" | "emoji">) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="
      w-14 h-14 rounded-lg flex-shrink-0 relative
      bg-fs-white border border-fs-border
      flex items-center justify-center
      overflow-hidden text-3xl
    ">
      {image ? (
        <>
          {!loaded && (
            <div className="absolute inset-0 skeleton-green" />
          )}
          <Image
            src={image}
            alt={title}
            width={56}
            height={56}
            className={`w-full h-full object-cover transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
          />
        </>
      ) : (
        emoji
      )}
    </div>
  )
}

// Mobile breakpoint hook (lg = 1024px). SSR-safe: defaults to desktop.
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)")
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return isMobile
}

function pluralizeItems(n: number, forms: [string, string, string]): string {
  const mod10  = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return forms[2]
  if (mod10 === 1)                   return forms[0]
  if (mod10 >= 2 && mod10 <= 4)     return forms[1]
  return forms[2]
}

// ─── CART ITEM ROW with note support ─────────────────────────────────────────

function CartItemRow({
  item,
  onDecrease,
  onIncrease,
  onRemove,
  onNoteChange,
}: {
  item: CartItem
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
  onNoteChange: (note: string) => void
}) {
  const { t } = useLang()
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteValue, setNoteValue] = useState(item.note ?? "")

  const handleNoteSave = () => {
    onNoteChange(noteValue)
    setNoteOpen(false)
  }

  const handleNoteCancel = () => {
    setNoteValue(item.note ?? "")
    setNoteOpen(false)
  }

  return (
    <motion.div
      layoutId={`cart-item-${item.id}`}
      layout="position"
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{ opacity: 0, x: 56, scale: 0.93, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ layout: { type: "spring", stiffness: 340, damping: 28 }, duration: 0.22 }}
      className="bg-fs-offwhite border border-fs-border rounded-xl p-4"
    >
      <div className="flex items-start gap-4">

        {/* THUMBNAIL */}
        <ItemThumbnail image={item.image} title={item.title} emoji={item.emoji} />

        {/* INFO */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-fs-graphite leading-snug">
            {item.title}
          </h4>

          <p className="text-sm font-bold text-fs-primary mt-1">
            <MorphNumber value={item.price} prefix="₸" />
          </p>

          {/* QUANTITY + NOTE TOGGLE */}
          <div className="flex items-center gap-2 mt-3">
            <motion.button
              onClick={onDecrease}
              aria-label={t.cart.decrease}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="
                w-9 h-9 rounded-lg
                border border-fs-border bg-fs-white
                flex items-center justify-center
                text-fs-gray hover:text-fs-graphite hover:border-fs-primary/30
                transition-colors duration-150
              "
            >
              <Minus size={12} strokeWidth={2.5} />
            </motion.button>

            <span className="text-sm font-bold text-fs-graphite w-7 text-center flex justify-center">
              <MorphNumber value={item.quantity} format={(n) => String(n)} />
            </span>

            <motion.button
              onClick={onIncrease}
              aria-label={t.cart.increase}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="
                w-9 h-9 rounded-lg
                bg-fs-primary text-white
                flex items-center justify-center
                hover:bg-fs-soft transition-colors duration-150
              "
            >
              <Plus size={12} strokeWidth={2.5} />
            </motion.button>

            <span className="text-caption text-fs-gray ml-1">
              = <MorphNumber value={item.price * item.quantity} prefix="₸" />
            </span>

            {/* NOTE BUTTON */}
            <motion.button
              onClick={() => setNoteOpen((v) => !v)}
              aria-label={t.cart.noteAdd}
              aria-pressed={noteOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.12 }}
              className={`
                ml-auto w-8 h-8 rounded-md flex items-center justify-center
                transition-colors duration-150
                ${item.note
                  ? "text-fs-primary bg-fs-primary/10"
                  : "text-fs-muted hover:text-fs-primary hover:bg-fs-primary/5"
                }
              `}
            >
              <MessageSquare size={12} strokeWidth={1.8} />
            </motion.button>
          </div>

          {/* EXISTING NOTE CHIP */}
          <AnimatePresence>
            {item.note && !noteOpen && (
              <motion.button
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 6 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setNoteOpen(true)}
                className="w-full text-left"
              >
                <span className="inline-flex items-center gap-1.5 text-[11px] text-fs-gray bg-fs-white border border-fs-border rounded-lg px-2.5 py-1 leading-tight max-w-full">
                  <MessageSquare size={10} strokeWidth={1.5} className="flex-shrink-0 text-fs-primary" />
                  <span className="truncate">{item.note}</span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* NOTE INPUT */}
          <AnimatePresence>
            {noteOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <textarea
                  autoFocus
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder={t.cart.notePlaceholder}
                  maxLength={120}
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleNoteSave() }
                    if (e.key === "Escape") handleNoteCancel()
                  }}
                  className="
                    w-full bg-fs-white border border-fs-border rounded-lg
                    px-3 py-2 text-[12px] text-fs-graphite
                    placeholder:text-fs-subtle
                    resize-none focus:outline-none focus:border-fs-primary/40
                    transition-colors duration-200
                  "
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    onClick={handleNoteSave}
                    className="text-[11px] font-semibold text-fs-primary hover:text-fs-soft transition-colors"
                  >
                    {t.cart.noteSave}
                  </button>
                  <span className="text-[10px] text-fs-border">·</span>
                  <button
                    onClick={handleNoteCancel}
                    className="text-[11px] text-fs-gray hover:text-fs-graphite transition-colors"
                  >
                    {t.cart.noteCancel}
                  </button>
                  <span className="ml-auto text-[10px] text-fs-subtle">{noteValue.length}/120</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* REMOVE */}
          <motion.button
            onClick={onRemove}
            aria-label={`${t.cart.remove} ${item.title}`}
            whileHover={{ scale: 1.1, color: "#ef4444" }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="
              w-8 h-8 rounded-md flex-shrink-0
              flex items-center justify-center
              text-fs-muted hover:bg-red-50 dark:hover:bg-red-950/30
              transition-colors duration-150
            "
          >
            <X size={14} strokeWidth={2} />
          </motion.button>
        </div>
    </motion.div>
  )
}

export default function CartDrawer() {
  const isOpen   = useCartUI((state) => state.isOpen)
  const onClose  = useCartUI((state) => state.closeCart)
  const mounted  = useSyncExternalStore(() => () => {}, () => true, () => false)
  const isMobile = useIsMobile()
  const { t }    = useLang()
  // Drag-to-dismiss only engages when the items list is scrolled to the top, so
  // it never steals scroll from a long cart.
  const [atTop, setAtTop] = useState(true)

  const {
    items,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    setItemNote,
    clearCart,
    getTotalPrice,
    getTotalItems,
    addItem,
  } = useCartStore()

  const [recommended, setRecommended] = useState<RecProduct[]>([])

  const fetchRecommended = useCallback(() => {
    if (items.length === 0) { setRecommended([]); return }
    const exclude = items.map((i) => i.id).join(",")
    fetch(`/api/products/recommended?exclude=${encodeURIComponent(exclude)}`)
      .then((r) => r.json())
      // eslint-disable-next-line react-hooks/set-state-in-effect
      .then((d) => setRecommended(d.products ?? []))
      .catch(() => null)
  }, [items])

  useEffect(() => {
    if (isOpen && items.length > 0) {
      fetchRecommended()
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecommended([])
    }
  }, [isOpen, items.length, fetchRecommended])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (isOpen) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!mounted) return null

  const totalItems = getTotalItems()
  const itemLabel  = pluralizeItems(totalItems, [t.cart.items_one, t.cart.items_few, t.cart.items_many])

  // Portal to <body> so the fixed drawer/sheet escapes any transformed
  // ancestor (AnimatedLayout) — otherwise position:fixed anchors to that
  // ancestor and the bottom-sheet flies to the document bottom.
  return createPortal(
    <>
      {/* OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-sm z-[998]"
          />
        )}
      </AnimatePresence>

      {/* DRAWER — mounts on open so drag never fights a persistent animate.
          Right-side on desktop; bottom-sheet with swipe-to-dismiss on mobile. */}
      <AnimatePresence>
      {isOpen && (
      <motion.div
        key="cart-drawer"
        initial={isMobile ? { y: "100%" } : { x: "100%" }}
        animate={isMobile ? { y: 0 } : { x: 0 }}
        exit={isMobile ? { y: "100%" } : { x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 36, mass: 0.8 }}
        drag={isMobile ? "y" : false}
        dragDirectionLock
        dragListener={isMobile && atTop}
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.12, bottom: 0 }}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          const sheet = window.innerHeight * 0.9   // 90dvh
          if (info.offset.y > sheet * 0.3 || info.velocity.y > 700) onClose()
        }}
        className={`
          fixed z-[999] flex flex-col bg-fs-white touch-pan-y
          ${isMobile
            ? "inset-x-0 bottom-0 w-full max-w-full h-[90dvh] rounded-t-2xl border-t border-fs-border shadow-[0_-10px_50px_rgba(0,0,0,0.22)]"
            : "top-0 right-0 h-dvh w-full max-w-[440px] border-l border-fs-border shadow-[0_0_60px_rgba(0,0,0,0.15)] dark:shadow-[0_0_80px_rgba(0,0,0,0.5)]"
          }
        `}
      >
        {/* Top accent line / mobile grabber */}
        {isMobile ? (
          <div className="flex-shrink-0 flex justify-center pt-2.5 pb-1">
            <span className="w-10 h-1.5 rounded-full bg-fs-border" />
          </div>
        ) : (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-fs-dark via-fs-accent to-fs-primary" />
        )}

        {/* HEADER */}
        <div className="px-5 py-4 lg:p-6 border-b border-fs-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-fs-graphite">
              {t.cart.title}
            </h2>
            <p className="text-caption text-fs-gray mt-1">
              {totalItems} {itemLabel}
            </p>
          </div>

          <motion.button
            onClick={onClose}
            aria-label={t.close}
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="
              w-9 h-9 rounded-lg
              border border-fs-border bg-fs-offwhite
              flex items-center justify-center
              text-fs-gray hover:text-fs-graphite hover:bg-fs-light
              transition-colors duration-150
            "
          >
            <X size={17} strokeWidth={2} />
          </motion.button>
        </div>

        {/* EMPTY STATE */}
        <AnimatePresence mode="wait">
          {items.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
              className="flex-1 flex flex-col items-center justify-center text-center px-10"
            >
              <motion.div
                className="
                  w-20 h-20 rounded-2xl
                  bg-fs-light border border-fs-border
                  flex items-center justify-center
                  mb-6
                "
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ShoppingBag size={32} strokeWidth={1.5} className="text-fs-primary/40" />
              </motion.div>

              <h3 className="text-lg font-semibold text-fs-graphite">
                {t.cart.empty}
              </h3>

              <p className="text-body text-fs-gray mt-3">
                {t.cart.emptyHint}
              </p>

              <Link
                href="/catalog"
                onClick={onClose}
                className="mt-8"
              >
                <motion.span
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="
                    inline-flex items-center gap-2
                    px-6 py-3 rounded-xl
                    bg-fs-primary text-white
                    text-caption font-semibold
                    hover:bg-fs-soft
                    transition-colors duration-200
                    shadow-green
                  "
                >
                  {t.cart.goToCatalog}
                  <ArrowRight size={14} strokeWidth={2} />
                </motion.span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ITEMS */}
        {items.length > 0 && (
          <>
            <div
              className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-3"
              onScroll={(e) => setAtTop(e.currentTarget.scrollTop <= 0)}
            >
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onDecrease={() => decreaseQuantity(item.id)}
                    onIncrease={() => increaseQuantity(item.id)}
                    onRemove={() => removeItem(item.id)}
                    onNoteChange={(note) => setItemNote(item.id, note)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* FOOTER */}
            <div
              className="border-t border-fs-border p-5 space-y-3 flex-shrink-0 bg-fs-offwhite"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)" }}
            >

              {/* FREE DELIVERY PROGRESS */}
              {(() => {
                const total  = getTotalPrice()
                const pct    = Math.min((total / FREE_DELIVERY_THRESHOLD) * 100, 100)
                const remain = FREE_DELIVERY_THRESHOLD - total
                const isFree = total >= FREE_DELIVERY_THRESHOLD
                return (
                  <div className={`rounded-xl px-3.5 py-3 ${isFree ? "bg-emerald-50 dark:bg-emerald-900/25 border border-emerald-200/60 dark:border-emerald-700/40" : "bg-fs-white border border-fs-border"}`}>
                    {isFree ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-emerald-500 text-base">🚚</span>
                        <span className="text-[13px] font-semibold text-emerald-600">{t.cart.freeDelivery}!</span>
                      </motion.div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[12px] text-fs-gray">{t.cart.addMore} <span className="font-semibold text-fs-graphite">₸{remain.toLocaleString()}</span> {t.cart.forFreeDelivery}</span>
                        </div>
                        <div className="h-1.5 bg-fs-border rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-fs-primary to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )
              })()}

              {/* RECOMMENDED UPSELL — hidden on a long mobile cart so the
                  items list keeps usable height */}
              <AnimatePresence>
                {recommended.length > 0 && !(isMobile && items.length >= 4) && (
                  <motion.div
                    key="upsell"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="text-[11px] font-semibold text-fs-gray uppercase tracking-wider mb-2">
                      {t.cart.recommended}
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
                      {recommended.map((p, i) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18, delay: i * 0.04 }}
                          className="flex-shrink-0 snap-start w-[100px] bg-fs-white border border-fs-border rounded-xl p-2 flex flex-col items-center gap-1"
                        >
                          <div className="w-12 h-12 rounded-lg bg-fs-offwhite flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                            {p.image ? (
                              <Image
                                src={p.image}
                                alt={p.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{p.emoji}</span>
                            )}
                          </div>
                          <p className="text-[10px] font-medium text-fs-graphite text-center leading-tight line-clamp-2 w-full">{p.title}</p>
                          <p className="text-[11px] font-bold text-fs-primary">{p.price}</p>
                          <motion.button
                            onClick={() => addItem({ id: p.id, title: p.title, price: p.price_num, emoji: p.emoji, image: p.image })}
                            aria-label={`${t.cart.addedToCart} ${p.title}`}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="w-full bg-fs-primary/10 hover:bg-fs-primary text-fs-primary hover:text-white rounded-lg py-1 text-[11px] font-semibold transition-colors duration-150 flex items-center justify-center gap-1"
                          >
                            <Plus size={10} strokeWidth={2.5} />
                            {t.cart.add}
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SAVINGS BADGE */}
              {(() => {
                const savings = items.reduce((s, i) => {
                  if (i.oldPrice && i.oldPrice > i.price) return s + (i.oldPrice - i.price) * i.quantity
                  return s
                }, 0)
                return savings > 0 ? (
                  <AnimatePresence>
                    <motion.div
                      key="savings"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                    >
                      <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {t.cart.savings}
                      </span>
                      <span className="text-[13px] font-black text-emerald-600 dark:text-emerald-400">
                        −₸{savings.toLocaleString()}
                      </span>
                    </motion.div>
                  </AnimatePresence>
                ) : null
              })()}

              {/* TOTAL */}
              <div className="flex items-center justify-between py-1">
                <span className="text-body text-fs-gray">
                  {t.cart.total}
                </span>
                <MorphNumber
                  value={getTotalPrice()}
                  prefix="₸"
                  className="text-xl font-bold text-fs-graphite"
                />
              </div>

              {/* CHECKOUT */}
              <Link href="/checkout" onClick={onClose} className="block">
                <motion.span
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  className="
                    w-full bg-fs-primary text-white
                    py-3.5 rounded-xl
                    font-semibold text-body
                    flex items-center justify-center gap-2
                    hover:bg-fs-soft
                    transition-colors duration-200 shadow-green
                    relative overflow-hidden
                  "
                >
                  {t.cart.checkout}
                  <ArrowRight size={16} strokeWidth={2} />
                </motion.span>
              </Link>

              {/* CLEAR */}
              <motion.button
                onClick={clearCart}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="
                  w-full flex items-center justify-center gap-2
                  border border-fs-border rounded-xl py-2.5
                  text-caption font-medium text-fs-gray bg-fs-white
                  hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30
                  transition-all duration-200
                "
              >
                <Trash2 size={13} strokeWidth={1.5} />
                {t.cart.clearCart}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
      )}
      </AnimatePresence>
    </>,
    document.body,
  )
}
