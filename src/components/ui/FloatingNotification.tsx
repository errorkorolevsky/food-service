"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Check, ShoppingCart } from "lucide-react"

import { useToastStore } from "@/store/toastStore"
import { useCartUI } from "@/store/cartUIStore"
import { useLang } from "@/locales"

const TOAST_MS = 2500

export default function FloatingNotification() {
  const { visible, message, emoji, actionLabel, onAction, hide } = useToastStore()
  const openCart = useCartUI((state) => state.openCart)
  const { t } = useLang()

  const handleAction = () => {
    if (onAction) { onAction() } else { openCart() }
    hide()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            role="status"
            aria-live="polite"
            className="bg-fs-white border border-fs-border rounded-2xl overflow-hidden shadow-card-hover"
          >
            <div className="px-5 py-3.5 flex items-center gap-4">
              <span className="text-2xl leading-none flex-shrink-0">{emoji}</span>

              <div className="min-w-0">
                <p className="text-caption font-bold text-fs-graphite truncate max-w-[160px]">
                  {message}
                </p>
                <p className="text-label text-fs-gray mt-0.5 flex items-center gap-1.5">
                  <Check size={12} strokeWidth={2.5} className="text-fs-primary flex-shrink-0" />
                  {t.cart.addedToCart}
                </p>
              </div>

              <button
                onClick={handleAction}
                className="
                  flex-shrink-0 flex items-center gap-1.5
                  px-3 py-1.5 rounded-xl
                  bg-fs-primary text-white
                  text-[11px] font-bold whitespace-nowrap
                  hover:opacity-90 active:scale-95
                  transition-all duration-150
                "
              >
                <ShoppingCart size={12} strokeWidth={2} />
                {actionLabel || t.cart.title}
              </button>
            </div>

            <motion.div
              className="h-[3px] bg-fs-primary origin-left"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: TOAST_MS / 1000, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
