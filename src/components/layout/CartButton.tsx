"use client"

import { useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart } from "lucide-react"

import { useCartStore } from "@/store/cartStore"
import { useCartUI } from "@/store/cartUIStore"
import { useLang } from "@/locales"

type CartButtonProps = {
  variant?: "fab" | "navbar"
}

export default function CartButton({ variant = "fab" }: CartButtonProps) {
  const items    = useCartStore((state) => state.items)
  const openCart = useCartUI((state) => state.openCart)
  const mounted  = useSyncExternalStore(() => () => {}, () => true, () => false)
  const { t }    = useLang()

  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0

  if (variant === "navbar") {
    return (
      <motion.button
        onClick={openCart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="
          relative
          flex items-center gap-2
          px-4 py-2 rounded-lg
          bg-fs-primary text-white
          text-caption font-bold
          hover:bg-fs-soft transition-colors duration-200
        "
      >
        <ShoppingCart size={16} strokeWidth={2} />
        {t.nav.cart}
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key="count"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="
                absolute -top-2 -right-2
                w-5 h-5 rounded-full
                bg-white text-fs-primary
                text-xs font-black
                flex items-center justify-center
                border border-fs-primary/20
              "
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    )
  }

  // FAB (floating)
  return (
    <motion.button
      onClick={openCart}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="
        fixed bottom-[88px] right-4 z-[997]
        lg:bottom-8 lg:right-8
        w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl
        bg-fs-primary text-white
        flex items-center justify-center
        shadow-green-lg
      "
    >
      <ShoppingCart size={22} strokeWidth={2} />

      <AnimatePresence>
        {count > 0 && (
          <motion.div
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="
              absolute -top-2 -right-2
              w-6 h-6 rounded-full
              bg-white text-fs-primary
              text-xs font-black
              flex items-center justify-center
              border border-fs-primary/20
            "
          >
            {count}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
