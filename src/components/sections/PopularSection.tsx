import ProductCard from "@/components/cards/ProductCard"
import SectionTitle from "@/components/ui/SectionTitle"
import FadeIn from "@/components/ui/FadeIn"
import { StaggerGrid, StaggerItem } from "@/components/ui/StaggerGrid"

import { products } from "@/data/products"

const popularProducts = products.filter((p) => p.isPopular).slice(0, 8)

export default function PopularSection() {
  return (
    <section className="fs-section relative overflow-hidden bg-fs-offwhite">

      <div className="fs-container py-24 relative z-10">

        <FadeIn>
          <SectionTitle
            title="Популярное"
            subtitle="Топ позиции"
            buttonText="Смотреть всё"
          />
        </FadeIn>

        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
          {popularProducts.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard
                id={product.id}
                emoji={product.emoji}
                category={product.category}
                title={product.title}
                description={product.description}
                price={product.price}
                priceNum={product.priceNum}
                rating={product.rating}
                isNew={product.isNew}
                inStock={product.inStock}
              />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}
