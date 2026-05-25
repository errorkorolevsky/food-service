"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

import ProductCard from "@/components/cards/ProductCard"
import SectionTitle from "@/components/ui/SectionTitle"
import FadeIn from "@/components/ui/FadeIn"
import { useLang } from "@/locales"
import type { Product } from "@/types"

export default function PopularSection({ products }: { products: Product[] }) {
  const popularProducts = products
  const { t }     = useLang()
  const scrollRef   = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" })
  }

  return (
    <section className="fs-section relative overflow-hidden">
      {/* Cool sky-blue background — contrasts with warm/mint sections */}
      <div className="absolute inset-0" style={{ background: "var(--section-sky-bg)" }} />
      {/* Green glow top-right */}
      <div className="absolute -top-16 right-[5%] w-[550px] h-[400px] pointer-events-none" style={{
        background: "radial-gradient(ellipse 65% 55% at 78% 12%, rgba(0,91,70,0.28) 0%, transparent 65%)",
      }} />
      {/* Accent glow bottom center */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[280px] pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 50% at 50% 100%, rgba(14,165,233,0.18) 0%, transparent 70%)",
      }} />
      {/* Sky-blue top accent strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none" style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.5) 30%, rgba(14,165,233,0.75) 50%, rgba(14,165,233,0.5) 70%, transparent 100%)",
      }} />
      {/* Noise */}
      <div className="absolute inset-0 noise-overlay" style={{ opacity: 0.03 }} />

      <div className="fs-container py-10 sm:py-16 lg:py-24 relative z-10">

        <FadeIn>
          <div className="flex items-end justify-between mb-8">
            <SectionTitle
              title={t.sections.popular}
              subtitle={t.sections.popular_sub}
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
                {t.sections.viewAll}
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
          {popularProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[260px] sm:w-[280px]"
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
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

        <FadeIn delay={0.3}>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/catalog"
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
