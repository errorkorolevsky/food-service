"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import CategoryCard from "@/components/cards/CategoryCard"
import SectionTitle from "@/components/ui/SectionTitle"
import FadeIn from "@/components/ui/FadeIn"
import { StaggerGrid, StaggerItem } from "@/components/ui/StaggerGrid"
import { CATEGORY_ICONS } from "@/components/ui/CategoryIcons"

import { categories, CATEGORY_FILTER, CATEGORY_COLORS } from "@/data/categories"
import { products } from "@/data/products"

export default function CategoriesSection() {
  return (
    <section className="fs-section bg-white">
      <div className="fs-container py-24 relative z-10">

        <FadeIn>
          <SectionTitle
            title="Категории"
            subtitle="Ассортимент"
          />
        </FadeIn>

        {/* BENTO GRID — первая карточка double-wide */}
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-10">
          {categories.map((category, i) => {
            const filterName = CATEGORY_FILTER[category.id]
            const count = filterName
              ? products.filter((p) => p.category === filterName).length
              : undefined
            const color = CATEGORY_COLORS[category.id] ?? "#005B46"
            const wide  = i === 0

            return (
              <StaggerItem key={category.id} className={wide ? "md:col-span-2" : ""}>
                <CategoryCard
                  emoji={category.emoji}
                  icon={CATEGORY_ICONS[category.id]}
                  title={category.title}
                  description={category.description}
                  href={filterName ? `/catalog?category=${encodeURIComponent(filterName)}` : "/catalog"}
                  count={count}
                  color={color}
                  wide={wide}
                  index={i}
                />
              </StaggerItem>
            )
          })}
        </StaggerGrid>

        <FadeIn delay={0.35}>
          <div className="mt-10 text-center">
            <Link
              href="/catalog"
              className="
                inline-flex items-center gap-2
                text-body font-medium text-fs-gray
                hover:text-fs-primary
                transition-colors duration-200
                group
              "
            >
              Смотреть весь каталог
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
