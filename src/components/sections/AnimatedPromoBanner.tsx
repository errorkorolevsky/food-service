"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLang } from "@/locales"

const BANNER_COLORS = [
  { from: "#005B46", to: "#0A7A5C" },
  { from: "#1D4ED8", to: "#2563EB" },
  { from: "#7C3AED", to: "#9333EA" },
  { from: "#B45309", to: "#D97706" },
  { from: "#BE185D", to: "#EC4899" },
]

export default function AnimatedPromoBanner() {
  const { t }   = useLang()
  const banners = t.promo.banners
  const [idx, setIdx]     = useState(0)
  const [dir, setDir]     = useState(1)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((next: number, direction: number) => {
    setDir(direction)
    setIdx(next)
  }, [])

  const prev = () => goTo((idx - 1 + banners.length) % banners.length, -1)
  const next = () => goTo((idx + 1) % banners.length, 1)

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => goTo((idx + 1) % banners.length, 1), 4500)
    return () => clearInterval(timer)
  }, [idx, paused, banners.length, goTo])

  const banner = banners[idx]
  const colors = BANNER_COLORS[idx % BANNER_COLORS.length]

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  }

  return (
    <div
      className="w-full relative overflow-hidden select-none"
      style={{ minHeight: "auto" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={idx}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 flex items-center"
          style={{
            background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
          }}
        >
          {/* NOISE TEXTURE */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }} />

          {/* GLOW ORB */}
          <motion.div
            className="absolute top-[-30%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.10)", filter: "blur(80px)" }}
            animate={{ scale: [1, 1.12, 1], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="fs-container py-8 sm:py-12 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div>
              {/* BADGE */}
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4 backdrop-blur-sm">
                {banner.badge}
              </span>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                {banner.title}
              </h2>
              <p className="text-white/75 mt-2 text-base">
                {banner.subtitle}
              </p>
            </div>

            <Link
              href="/catalog"
              className="
                flex-shrink-0
                inline-flex items-center gap-2
                bg-white text-gray-900
                font-semibold px-6 py-3 rounded-xl
                hover:bg-white/90 active:scale-[0.97]
                transition-all duration-200
                shadow-[0_8px_24px_rgba(0,0,0,0.25)]
                whitespace-nowrap
              "
            >
              {banner.cta}
              <ChevronRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* NAV ARROWS */}
      <button
        onClick={prev}
        className="
          absolute left-4 top-1/2 -translate-y-1/2 z-20
          w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20
          flex items-center justify-center text-white
          hover:bg-white/25 transition-all duration-200
        "
      >
        <ChevronLeft size={16} strokeWidth={2} />
      </button>
      <button
        onClick={next}
        className="
          absolute right-4 top-1/2 -translate-y-1/2 z-20
          w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/20
          flex items-center justify-center text-white
          hover:bg-white/25 transition-all duration-200
        "
      >
        <ChevronRight size={16} strokeWidth={2} />
      </button>

      {/* DOTS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > idx ? 1 : -1)}
            className={`
              rounded-full transition-all duration-300
              ${i === idx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"}
            `}
          />
        ))}
      </div>
    </div>
  )
}
