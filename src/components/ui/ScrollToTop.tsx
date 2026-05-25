"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp } from "lucide-react"
import { useLang } from "@/locales"

export default function ScrollToTop() {
  const { t }             = useLang()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-top"
          onClick={scrollUp}
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          exit={{    opacity: 0, scale: 0.7, y: 12 }}
          transition={{ type: "spring", stiffness: 340, damping: 24 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.92 }}
          className="
            fixed bottom-28 right-5 z-40
            w-11 h-11 rounded-xl
            bg-fs-white border border-fs-border
            shadow-card-hover
            flex items-center justify-center
            text-fs-gray hover:text-fs-primary hover:border-fs-primary/30
            transition-colors duration-200
            md:bottom-8 md:right-8
          "
          aria-label={t.scrollTop}
        >
          <ArrowUp size={18} strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
