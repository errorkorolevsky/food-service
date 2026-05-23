"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Flame } from "lucide-react"

import ProductCard from "@/components/cards/ProductCard"
import FadeIn from "@/components/ui/FadeIn"
import SectionTitle from "@/components/ui/SectionTitle"
import { useLang } from "@/locales"
import { products } from "@/data/products"

const saleProducts = products
  .filter((p) => p.discountPercent && p.discountPercent > 0)
  .slice(0, 8)

export default function LiveOffersSection() {
  const { t } = useLang()

  if (saleProducts.length === 0) return null

  return (
    <section className="fs-section relative overflow-hidden">
      {/* SUBTLE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, #fff8f0 0%, #ffffff 100%)" }}
      />

      <div className="fs-container py-10 sm:py-16 lg:py-20 relative z-10">

        <FadeIn>
          <div className="flex items-end justify-between mb-6 sm:mb-10">
            <div className="flex items-start gap-4">
              <div className="
                w-12 h-12 rounded-2xl flex-shrink-0
                bg-red-50 border border-red-100
                flex items-center justify-center mt-1
              ">
                <Flame size={22} className="text-red-500" strokeWidth={1.5} />
              </div>
              <SectionTitle
                title={t.promo.sectionTitle}
                subtitle={t.promo.sectionSubtitle}
              />
            </div>

            <Link
              href="/catalog?sale=true"
              className="hidden sm:inline-flex items-center gap-2 text-caption font-medium text-fs-gray hover:text-fs-primary transition-colors duration-200 group mb-1"
            >
              {t.promo.viewAll}
              <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {saleProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0, 0, 0.2, 1] }}
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
          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/catalog?sale=true"
              className="inline-flex items-center gap-2 text-caption font-medium text-fs-gray hover:text-fs-primary transition-colors duration-200 group"
            >
              {t.promo.viewAll}
              <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
