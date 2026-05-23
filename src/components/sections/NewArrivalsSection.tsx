"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

import ProductCard from "@/components/cards/ProductCard"
import SectionTitle from "@/components/ui/SectionTitle"
import FadeIn from "@/components/ui/FadeIn"
import { useLang } from "@/locales"
import { products } from "@/data/products"

const newProducts = products.filter((p) => p.isNew).slice(0, 8)

export default function NewArrivalsSection() {
  const { t }       = useLang()
  const scrollRef   = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" })
  }

  if (newProducts.length === 0) return null

  return (
    <section className="fs-section relative overflow-hidden">
      {/* Warm amber background — alternates with mint/sky */}
      <div className="absolute inset-0" style={{ background: "var(--section-warm-bg)" }} />
      {/* Purple/violet glow — new arrivals = freshness accent */}
      <div className="absolute -top-16 left-[10%] w-[500px] h-[380px] pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 55% at 20% 10%, rgba(139,92,246,0.20) 0%, transparent 65%)",
      }} />
      <div className="absolute -bottom-10 right-[5%] w-[450px] h-[300px] pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 50% at 80% 90%, rgba(0,91,70,0.22) 0%, transparent 70%)",
      }} />
      {/* Violet/purple top accent strip — "new" color */}
      <div className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none" style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.55) 30%, rgba(168,85,247,0.80) 50%, rgba(139,92,246,0.55) 70%, transparent 100%)",
      }} />
      <div className="absolute inset-0 noise-overlay" style={{ opacity: 0.025 }} />
      <div className="fs-container py-10 sm:py-16 lg:py-20 relative z-10">

        <FadeIn>
          <div className="flex items-end justify-between mb-8">
            <SectionTitle
              title={t.sections.new}
              subtitle={t.sections.new_sub}
            />

            <div className="flex items-center gap-3">
              {/* SCROLL ARROWS */}
              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => scrollBy(-1)}
                  className="
                    w-9 h-9 rounded-xl
                    border border-fs-border bg-fs-white
                    flex items-center justify-center
                    text-fs-gray hover:text-fs-primary hover:border-fs-primary/30
                    transition-all duration-200 shadow-sm
                  "
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => scrollBy(1)}
                  className="
                    w-9 h-9 rounded-xl
                    border border-fs-border bg-fs-white
                    flex items-center justify-center
                    text-fs-gray hover:text-fs-primary hover:border-fs-primary/30
                    transition-all duration-200 shadow-sm
                  "
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>

              <Link
                href="/catalog?new=true"
                className="hidden sm:inline-flex items-center gap-2 text-caption font-medium text-fs-gray hover:text-fs-primary transition-colors duration-200 group"
              >
                {t.sections.viewAll}
                <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* HORIZONTAL SCROLL TRACK */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-none pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {newProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[260px] sm:w-[280px]"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0, 0, 0.2, 1] }}
            >
              <ProductCard
                id={product.id}
                emoji={product.emoji}
                image={product.image}
                category={product.category}
                title={product.title}
                description={product.description}
                price={product.price}
                priceNum={product.priceNum}
                oldPriceNum={product.oldPriceNum}
                discountPercent={product.discountPercent}
                unit={product.unit}
                rating={product.rating}
                isNew={product.isNew}
                isHit={product.isHit}
                inStock={product.inStock}
              />
            </motion.div>
          ))}
        </div>

        {/* MOBILE VIEW ALL */}
        <FadeIn delay={0.3}>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/catalog?new=true"
              className="inline-flex items-center gap-2 text-caption font-medium text-fs-gray hover:text-fs-primary transition-colors duration-200 group"
            >
              {t.sections.viewAll}
              <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
