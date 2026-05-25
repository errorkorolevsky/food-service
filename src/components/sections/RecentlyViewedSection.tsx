"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, ChevronLeft, ChevronRight } from "lucide-react"

import { useRecentlyViewed } from "@/hooks/useRecentlyViewed"
import { useLang } from "@/locales"

export default function RecentlyViewedSection() {
  const items     = useRecentlyViewed()
  const { t }     = useLang()
  const scrollRef = useRef<HTMLDivElement>(null)

  if (items.length === 0) return null

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" })
  }

  return (
    <section className="fs-section relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--section-warm-bg)" }} />
      <div className="absolute inset-0 noise-overlay" style={{ opacity: 0.025 }} />

      <div className="fs-container py-10 sm:py-14 relative z-10">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-fs-primary/10 border border-fs-primary/20 flex items-center justify-center flex-shrink-0">
              <Clock size={16} strokeWidth={1.5} className="text-fs-primary" />
            </div>
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-black text-fs-graphite leading-tight">
                {t.catalog.recentlyViewed}
              </h2>
              <p className="text-[13px] text-fs-gray mt-0.5">{t.catalog.recentlyViewedSub}</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <motion.button
              onClick={() => scrollBy(-1)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              aria-label={t.catalog.filter.prevCategories}
              className="w-9 h-9 rounded-xl border border-fs-border bg-fs-white hover:border-fs-primary hover:text-fs-primary text-fs-gray flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={16} strokeWidth={2} />
            </motion.button>
            <motion.button
              onClick={() => scrollBy(1)}
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              aria-label={t.catalog.filter.nextCategories}
              className="w-9 h-9 rounded-xl border border-fs-border bg-fs-white hover:border-fs-primary hover:text-fs-primary text-fs-gray flex items-center justify-center transition-colors"
            >
              <ChevronRight size={16} strokeWidth={2} />
            </motion.button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.22, delay: i * 0.05 }}
              className="flex-shrink-0 snap-start w-[148px] sm:w-[160px]"
            >
              <Link href={`/product/${item.id}`} className="block group">
                <div className="bg-fs-white border border-fs-border rounded-2xl overflow-hidden hover:border-fs-primary/40 hover:shadow-md transition-all duration-200">
                  <div className="h-28 bg-fs-offwhite relative overflow-hidden flex items-center justify-center text-4xl">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="160px"
                      />
                    ) : (
                      <span>{item.emoji}</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[12px] font-semibold text-fs-graphite line-clamp-2 leading-tight mb-1">{item.title}</p>
                    <p className="text-[13px] font-black text-fs-primary">{item.price}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
