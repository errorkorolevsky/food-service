"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Flame, ChevronLeft, ChevronRight } from "lucide-react"

import ProductCard from "@/components/cards/ProductCard"
import FadeIn from "@/components/ui/FadeIn"
import SectionTitle from "@/components/ui/SectionTitle"
import { useLang } from "@/locales"
import { products } from "@/data/products"

const saleProducts = products
  .filter((p) => p.discountPercent && p.discountPercent > 0)
  .slice(0, 8)

export default function LiveOffersSection() {
  const { t }     = useLang()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" })
  }

  if (saleProducts.length === 0) return null

  return (
    <section className="fs-section relative overflow-hidden">
      {/* Warm amber background — clearly distinct from white page */}
      <div className="absolute inset-0" style={{ background: "var(--section-warm-bg)" }} />
      {/* Amber glow top-right */}
      <div className="absolute -top-20 right-0 w-[500px] h-[400px] pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 55% at 90% 10%, rgba(245,158,11,0.35) 0%, transparent 65%)",
      }} />
      {/* Green brand glow bottom-left */}
      <div className="absolute -bottom-10 -left-10 w-[400px] h-[300px] pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 50% at 10% 90%, rgba(0,91,70,0.25) 0%, transparent 70%)",
      }} />
      {/* Amber top accent strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none" style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.6) 30%, rgba(245,158,11,0.85) 50%, rgba(245,158,11,0.6) 70%, transparent 100%)",
      }} />
      <div className="absolute inset-0 noise-overlay" style={{ opacity: 0.025 }} />

      <div className="fs-container py-10 sm:py-16 lg:py-20 relative z-10">

        <FadeIn>
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-start gap-4">
              {/* Animated flame */}
              <motion.div
                className="w-12 h-12 rounded-2xl flex-shrink-0 bg-red-50 border border-red-100 flex items-center justify-center mt-1"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Flame size={22} className="text-red-500" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
              <SectionTitle
                title={t.promo.sectionTitle}
                subtitle={t.promo.sectionSubtitle}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1">
                <button onClick={() => scrollBy(-1)} className="w-9 h-9 rounded-xl border border-fs-border bg-fs-white flex items-center justify-center text-fs-gray hover:text-fs-primary hover:border-fs-primary/30 transition-all duration-200 shadow-sm">
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
                <button onClick={() => scrollBy(1)} className="w-9 h-9 rounded-xl border border-fs-border bg-fs-white flex items-center justify-center text-fs-gray hover:text-fs-primary hover:border-fs-primary/30 transition-all duration-200 shadow-sm">
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
              <Link href="/catalog?sale=true" className="hidden sm:inline-flex items-center gap-2 text-caption font-medium text-fs-gray hover:text-fs-primary transition-colors duration-200 group">
                {t.promo.viewAll}
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
          {saleProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[260px] sm:w-[280px]"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0, 0, 0.2, 1] }}
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
            <Link href="/catalog?sale=true" className="inline-flex items-center gap-2 text-caption font-medium text-fs-gray hover:text-fs-primary transition-colors duration-200 group">
              {t.promo.viewAll}
              <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
