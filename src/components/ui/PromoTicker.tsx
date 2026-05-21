"use client"

import { useRef } from "react"
import { motion, useAnimationFrame, useMotionValue } from "framer-motion"
import { useLang } from "@/locales"

export default function PromoTicker() {
  const { t } = useLang()
  const items  = t.promo.ticker
  const doubled = [...items, ...items]

  const x        = useMotionValue(0)
  const speed    = 0.5 // px per frame
  const widthRef = useRef<number>(0)
  const ref      = useRef<HTMLDivElement>(null)

  useAnimationFrame(() => {
    if (!ref.current) return
    if (!widthRef.current) widthRef.current = ref.current.scrollWidth / 2
    const next = x.get() - speed
    x.set(next < -widthRef.current ? 0 : next)
  })

  return (
    <div className="w-full overflow-hidden bg-fs-primary/95 border-y border-fs-soft/20 py-2.5 select-none">
      <motion.div
        ref={ref}
        className="flex gap-0 whitespace-nowrap"
        style={{ x }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center text-white text-xs font-medium px-6 after:content-['·'] after:mx-4 after:opacity-40 after:text-white"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
