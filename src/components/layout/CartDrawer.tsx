"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"

import { useCartStore } from "@/store/cartStore"
import { useCartUI } from "@/store/cartUIStore"
import MorphNumber from "@/components/ui/MorphNumber"

export default function CartDrawer() {
  const isOpen  = useCartUI((state) => state.isOpen)
  const onClose = useCartUI((state) => state.closeCart)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

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
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
          />
        )}
      </AnimatePresence>

      {/* DRAWER */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? "0%" : "100%" }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="
          fixed top-0 right-0 h-screen w-full max-w-[440px]
          bg-white border-l border-fs-border
          z-[999] flex flex-col shadow-xl
        "
      >

        {/* HEADER */}
        <div className="p-6 border-b border-fs-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-fs-graphite">
              Корзина
            </h2>
            <p className="text-caption text-fs-gray mt-1">
              {getTotalItems()} {pluralize(getTotalItems(), ["товар", "товара", "товаров"])}
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              w-9 h-9 rounded-lg
              border border-fs-border bg-fs-offwhite
              flex items-center justify-center
              text-fs-gray hover:text-fs-graphite hover:bg-fs-light
              transition-all duration-200
            "
          >
            <X size={17} strokeWidth={2} />
          </button>
        </div>

        {/* EMPTY STATE */}
        {items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <div className="
              w-20 h-20 rounded-2xl
              bg-fs-light border border-fs-border
              flex items-center justify-center
              mb-6
            ">
              <ShoppingBag size={32} strokeWidth={1.5} className="text-fs-primary/40" />
            </div>

            <h3 className="text-lg font-semibold text-fs-graphite">
              Корзина пустая
            </h3>

            <p className="text-body text-fs-gray mt-3">
              Добавьте товары из каталога
            </p>

            <Link
              href="/catalog"
              onClick={onClose}
              className="
                mt-8 px-6 py-3 rounded-lg
                bg-fs-primary text-white
                text-caption font-semibold
                hover:bg-fs-soft
                transition-colors duration-200
              "
            >
              Перейти в каталог
            </Link>
          </div>
        )}

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
                    exit={{ opacity: 0, x: 48, scale: 0.95, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ layout: { type: "spring", stiffness: 340, damping: 28 }, duration: 0.22 }}
                    className="bg-fs-offwhite border border-fs-border rounded-xl p-4"
                  >
                    <div className="flex items-start gap-4">

                      {/* EMOJI */}
                      <div className="
                        w-13 h-13 rounded-lg flex-shrink-0
                        bg-white border border-fs-border
                        flex items-center justify-center
                        text-3xl w-14 h-14
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
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="
                              w-7 h-7 rounded-md
                              border border-fs-border bg-white
                              flex items-center justify-center
                              text-fs-gray hover:text-fs-graphite hover:border-fs-primary/30
                              transition-all duration-150
                            "
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>

                          <span className="text-sm font-bold text-fs-graphite w-7 text-center flex justify-center">
                            <MorphNumber value={item.quantity} format={(n) => String(n)} />
                          </span>

                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="
                              w-7 h-7 rounded-md
                              bg-fs-primary text-white
                              flex items-center justify-center
                              hover:bg-fs-soft transition-colors duration-150
                            "
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>

                          <span className="text-caption text-fs-gray ml-1">
                            = <MorphNumber value={item.price * item.quantity} prefix="₸" />
                          </span>
                        </div>
                      </div>

                      {/* REMOVE */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="
                          w-8 h-8 rounded-md flex-shrink-0
                          flex items-center justify-center
                          text-fs-muted hover:text-red-500 hover:bg-red-50
                          transition-all duration-150
                        "
                      >
                        <X size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* FOOTER */}
            <div className="border-t border-fs-border p-5 space-y-3 flex-shrink-0 bg-fs-offwhite">

              {/* TOTAL */}
              <div className="flex items-center justify-between py-1">
                <span className="text-body text-fs-gray">
                  Итого
                </span>
                <MorphNumber
                  value={getTotalPrice()}
                  prefix="₸"
                  className="text-xl font-bold text-fs-graphite"
                />
              </div>

              {/* CHECKOUT */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="
                  w-full bg-fs-primary text-white
                  py-3.5 rounded-xl
                  font-semibold text-body
                  flex items-center justify-center
                  hover:bg-fs-soft active:scale-[0.98]
                  transition-all duration-200 shadow-green
                "
              >
                Оформить заказ
              </Link>

              {/* CLEAR */}
              <button
                onClick={clearCart}
                className="
                  w-full flex items-center justify-center gap-2
                  border border-fs-border rounded-xl py-2.5
                  text-caption font-medium text-fs-gray bg-white
                  hover:text-red-500 hover:border-red-200 hover:bg-red-50
                  transition-all duration-200
                "
              >
                <Trash2 size={13} strokeWidth={1.5} />
                Очистить корзину
              </button>
            </div>
          </>
        )}
      </motion.div>
    </>
  )
}

function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}
