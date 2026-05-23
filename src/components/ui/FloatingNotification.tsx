"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Check } from "lucide-react"

import { useToastStore } from "@/store/toastStore"
import { useLang } from "@/locales"

const TOAST_MS = 2500

export default function FloatingNotification() {
  const { visible, message, emoji } = useToastStore()
  const { t } = useLang()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          className="
            fixed bottom-28 left-1/2 -translate-x-1/2
            z-50 pointer-events-none
          "
        >
          <div className="
            bg-fs-white border border-fs-border rounded-2xl
            overflow-hidden
            shadow-card-hover
          ">
            {/* CONTENT */}
            <div className="px-6 py-4 flex items-center gap-4 whitespace-nowrap">
              <span className="text-2xl leading-none">{emoji}</span>

              <div>
                <p className="text-caption font-bold text-fs-graphite">
                  {message}
                </p>
                <p className="text-label text-fs-gray mt-0.5 flex items-center gap-1.5">
                  <Check size={12} strokeWidth={2.5} className="text-fs-primary" />
                  {t.cart.addedToCart}
                </p>
              </div>
            </div>

            {/* PROGRESS BAR */}
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
