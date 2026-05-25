"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

import CategoryCard from "@/components/cards/CategoryCard"
import SectionTitle from "@/components/ui/SectionTitle"
import FadeIn from "@/components/ui/FadeIn"
import { CATEGORY_ICONS } from "@/components/ui/CategoryIcons"
import { useLang } from "@/locales"

import { categories, CATEGORY_FILTER, CATEGORY_COLORS } from "@/data/categories"

export default function CategoriesSection({ categoryCounts }: { categoryCounts: Record<string, number> }) {
  const { t }     = useLang()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" })
  }

  return (
    <section className="fs-section relative overflow-hidden">
      {/* Mint green background — clearly distinct */}
      <div className="absolute inset-0" style={{ background: "var(--section-mint-bg)" }} />
      {/* Green glow top-right */}
      <div className="absolute -top-16 -right-16 w-[550px] h-[450px] pointer-events-none" style={{
        background: "radial-gradient(ellipse 65% 58% at 85% 15%, rgba(0,91,70,0.32) 0%, transparent 68%)",
      }} />
      {/* Accent glow bottom-left */}
      <div className="absolute -bottom-10 -left-10 w-[450px] h-[350px] pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 55% at 15% 85%, rgba(13,158,118,0.22) 0%, transparent 70%)",
      }} />
      {/* Green top accent strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none" style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(0,91,70,0.5) 30%, rgba(13,158,118,0.75) 50%, rgba(0,91,70,0.5) 70%, transparent 100%)",
      }} />
      {/* Noise */}
      <div className="absolute inset-0 noise-overlay" style={{ opacity: 0.03 }} />

      <div className="fs-container py-10 sm:py-16 lg:py-24 relative z-10">

        <FadeIn>
          <div className="flex items-end justify-between mb-8">
            <SectionTitle
              title={t.categories.title}
              subtitle={t.categories.subtitle}
            />

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1">
                <motion.button
                  onClick={() => scrollBy(-1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="
                    w-9 h-9 rounded-xl
                    border border-fs-border bg-fs-white
                    flex items-center justify-center
                    text-fs-gray hover:text-fs-primary hover:border-fs-primary/30
                    transition-colors duration-200 shadow-sm
                  "
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </motion.button>
                <motion.button
                  onClick={() => scrollBy(1)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="
                    w-9 h-9 rounded-xl
                    border border-fs-border bg-fs-white
                    flex items-center justify-center
                    text-fs-gray hover:text-fs-primary hover:border-fs-primary/30
                    transition-colors duration-200 shadow-sm
                  "
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </motion.button>
              </div>

              <Link
                href="/catalog"
                className="hidden sm:inline-flex items-center gap-2 text-caption font-medium text-fs-gray hover:text-fs-primary transition-colors duration-200 group"
              >
                {t.categories.viewAll}
                <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </FadeIn>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-none pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((category, i) => {
            const filterName = CATEGORY_FILTER[category.id]
            const count = filterName
              ? (categoryCounts[filterName] ?? 0)
              : undefined
            const color = CATEGORY_COLORS[category.id] ?? "#005B46"
            const item  = t.categories.items[category.id as keyof typeof t.categories.items]

            return (
              <motion.div
                key={category.id}
                className="flex-shrink-0 w-[260px] sm:w-[280px]"
                initial={{ opacity: 0, y: 32, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0, 0, 0.2, 1] }}
              >
                <CategoryCard
                  emoji={category.emoji}
                  icon={CATEGORY_ICONS[category.id]}
                  title={item?.title ?? category.title}
                  description={item?.description ?? category.description}
                  href={filterName ? `/catalog?category=${encodeURIComponent(filterName)}` : "/catalog"}
                  count={count}
                  color={color}
                  index={i}
                />
              </motion.div>
            )
          })}
        </div>

        <FadeIn delay={0.3}>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 text-caption font-medium text-fs-gray hover:text-fs-primary transition-colors duration-200 group"
            >
              {t.categories.viewAll}
              <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
