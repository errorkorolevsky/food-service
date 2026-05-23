"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react"

import { useCartStore } from "@/store/cartStore"
import { useCartUI } from "@/store/cartUIStore"
import { useLang } from "@/locales"
import MorphNumber from "@/components/ui/MorphNumber"

const FREE_DELIVERY_THRESHOLD = 10000

function pluralizeItems(n: number, forms: [string, string, string]): string {
  const mod10  = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return forms[2]
  if (mod10 === 1)                   return forms[0]
  if (mod10 >= 2 && mod10 <= 4)     return forms[1]
  return forms[2]
}

export default function CartDrawer() {
  const isOpen  = useCartUI((state) => state.isOpen)
  const onClose = useCartUI((state) => state.closeCart)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const { t }   = useLang()

  const {
    items,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore()

  if (!mounted) return null

  const totalItems = getTotalItems()
  const itemLabel  = pluralizeItems(totalItems, [t.cart.items_one, t.cart.items_few, t.cart.items_many])

  return (
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

      {/* DRAWER — spring physics */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? "0%" : "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 36, mass: 0.8 }}
        className="
          fixed top-0 right-0 h-screen w-full max-w-[440px]
          bg-fs-white border-l border-fs-border
          z-[999] flex flex-col
          shadow-[0_0_60px_rgba(0,0,0,0.15)] dark:shadow-[0_0_80px_rgba(0,0,0,0.5)]
        "
      >
        {/* Top green accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-fs-dark via-fs-accent to-fs-primary" />

        {/* HEADER */}
        <div className="p-6 border-b border-fs-border flex items-center justify-between flex-shrink-0">
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
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layoutId={`cart-item-${item.id}`}
                    layout="position"
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{ opacity: 0, x: 56, scale: 0.93, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ layout: { type: "spring", stiffness: 340, damping: 28 }, duration: 0.22 }}
                    className="bg-fs-offwhite border border-fs-border rounded-xl p-4"
                  >
                    <div className="flex items-start gap-4">

                      {/* EMOJI */}
                      <div className="
                        w-14 h-14 rounded-lg flex-shrink-0
                        bg-fs-white border border-fs-border
                        flex items-center justify-center
                        text-3xl
                      ">
                        {item.emoji}
                      </div>

                      {/* INFO */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-fs-graphite leading-snug">
                          {item.title}
                        </h4>

                        <p className="text-sm font-bold text-fs-primary mt-1">
                          <MorphNumber value={item.price} prefix="₸" />
                        </p>

                        {/* QUANTITY */}
                        <div className="flex items-center gap-2 mt-3">
                          <motion.button
                            onClick={() => decreaseQuantity(item.id)}
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.88 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="
                              w-7 h-7 rounded-md
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
                            onClick={() => increaseQuantity(item.id)}
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.88 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="
                              w-7 h-7 rounded-md
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
                        </div>
                      </div>

                      {/* REMOVE */}
                      <motion.button
                        onClick={() => removeItem(item.id)}
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
                ))}
              </AnimatePresence>
            </div>

            {/* FOOTER */}
            <div className="border-t border-fs-border p-5 space-y-3 flex-shrink-0 bg-fs-offwhite">

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
    </>
  )
}
