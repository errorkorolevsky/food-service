"use client"

import { useSyncExternalStore, useEffect, useRef, useState } from "react"
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

  const count        = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0
  const prevCountRef = useRef(count)
  const [bump, setBump] = useState(false)

  useEffect(() => {
    const prev = prevCountRef.current
    prevCountRef.current = count
    if (count > prev && count > 0) {
      setBump(true)
      const timer = setTimeout(() => setBump(false), 400)
      return () => clearTimeout(timer)
    }
  }, [count])

  const badgeAnim = bump
    ? { scale: [1, 1.55, 0.88, 1.12, 1] as number[], opacity: 1 }
    : { scale: 1, opacity: 1 }

  const badgeTransition = bump
    ? { duration: 0.38, times: [0, 0.28, 0.55, 0.78, 1] }
    : { type: "spring" as const, stiffness: 400, damping: 20 }

  if (variant === "navbar") {
    return (
      <motion.button
        onClick={openCart}
        animate={bump ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
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
              animate={badgeAnim}
              exit={{ scale: 0, opacity: 0 }}
              transition={badgeTransition}
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
      aria-label={t.nav.cart}
      animate={bump ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="
        fixed bottom-[88px] right-4 z-[997]
        lg:hidden
        w-14 h-14 rounded-xl
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
            animate={badgeAnim}
            exit={{ scale: 0, opacity: 0 }}
            transition={badgeTransition}
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
