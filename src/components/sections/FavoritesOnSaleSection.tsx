"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

import ProductCard from "@/components/cards/ProductCard"
import FadeIn from "@/components/ui/FadeIn"
import { useFavoritesStore } from "@/store/favoritesStore"
import { useLang } from "@/locales"
import type { Product } from "@/types"

export default function FavoritesOnSaleSection({ products }: { products: Product[] }) {
  const favoriteIds = useFavoritesStore((state) => state.ids)
  const { t }       = useLang()
  const scrollRef   = useRef<HTMLDivElement>(null)

  const onSale = products.filter(
    (p) => favoriteIds.includes(p.id) && !!p.discountPercent && p.inStock
  )

  if (onSale.length === 0) return null

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" })
  }

  return (
    <section className="fs-section relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--section-warm-bg)" }} />
      {/* Red heart ambient glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[300px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(ellipse 60% 50% at 80% 20%, rgba(239,68,68,0.4) 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 noise-overlay" style={{ opacity: 0.02 }} />

      <div className="fs-container py-10 sm:py-16 relative z-10">
        <FadeIn>
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-start gap-4">
              <motion.div
                className="w-12 h-12 rounded-2xl flex-shrink-0 bg-red-50 border border-red-100 flex items-center justify-center mt-1"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart size={20} className="text-red-500" strokeWidth={1.5} fill="currentColor" />
              </motion.div>
              <div>
                <p className="text-label text-fs-gray uppercase tracking-widest mb-1">
                  {t.favorites.title}
                </p>
                <h2 className="text-[22px] sm:text-[26px] font-black text-fs-graphite leading-tight">
                  {t.promo.sectionTitle}
                </h2>
                <p className="text-[14px] text-fs-gray mt-1">{t.favorites.countIn} · {onSale.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1">
                <motion.button onClick={() => scrollBy(-1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-9 h-9 rounded-xl border border-fs-border bg-fs-white flex items-center justify-center text-fs-gray hover:text-fs-primary hover:border-fs-primary/30 transition-colors shadow-sm"
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </motion.button>
                <motion.button onClick={() => scrollBy(1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-9 h-9 rounded-xl border border-fs-border bg-fs-white flex items-center justify-center text-fs-gray hover:text-fs-primary hover:border-fs-primary/30 transition-colors shadow-sm"
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </motion.button>
              </div>
              <Link href="/favorites" className="hidden sm:inline-flex items-center gap-2 text-caption font-medium text-fs-gray hover:text-fs-primary transition-colors group">
                {t.sections.viewAll}
                <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </FadeIn>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-none pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {onSale.map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[260px] sm:w-[280px]"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0, 0, 0.2, 1] }}
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
      </div>
    </section>
  )
}
