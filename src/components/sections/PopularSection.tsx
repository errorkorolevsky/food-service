"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import ProductCard from "@/components/cards/ProductCard"
import SectionTitle from "@/components/ui/SectionTitle"
import FadeIn from "@/components/ui/FadeIn"
import { StaggerGrid, StaggerItem } from "@/components/ui/StaggerGrid"
import { useLang } from "@/locales"

import { products } from "@/data/products"

const popularProducts = products.filter((p) => p.isPopular).slice(0, 8)

export default function PopularSection() {
  const { t } = useLang()

  return (
    <section className="fs-section relative overflow-hidden bg-fs-offwhite">
      <div className="fs-container py-10 sm:py-16 lg:py-24 relative z-10">

        <FadeIn>
          <div className="flex items-end justify-between mb-2">
            <SectionTitle
              title={t.sections.popular}
              subtitle={t.sections.popular_sub}
            />
            <Link
              href="/catalog"
              className="hidden sm:inline-flex items-center gap-2 text-caption font-medium text-fs-gray hover:text-fs-primary transition-colors duration-200 group mb-1"
            >
              {t.sections.viewAll}
              <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </FadeIn>

        <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mt-6 sm:mt-10">
          {popularProducts.map((product) => (
            <StaggerItem key={product.id}>
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
            </StaggerItem>
          ))}
        </StaggerGrid>

        <FadeIn delay={0.3}>
          <div className="mt-10 text-center sm:hidden">
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
