import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import CartButton from "@/components/layout/CartButton";
import CartDrawer from "@/components/layout/CartDrawer";

import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import PopularSection from "@/components/sections/PopularSection";
import NewArrivalsSection from "@/components/sections/NewArrivalsSection";
import LiveOffersSection from "@/components/sections/LiveOffersSection";
import AnimatedPromoBanner from "@/components/sections/AnimatedPromoBanner";
import BusinessSection from "@/components/sections/BusinessSection";
import RecentlyViewedSection from "@/components/sections/RecentlyViewedSection";

import PromoTicker from "@/components/ui/PromoTicker";
import FloatingNotification from "@/components/ui/FloatingNotification";
import SectionDivider from "@/components/ui/SectionDivider";

import { getAllProducts } from "@/lib/db/products";
import { CATEGORY_FILTER } from "@/data/categories";

export default async function HomePage() {
  const allProducts = await getAllProducts();

  const popularProducts = allProducts.filter((p) => p.isPopular).slice(0, 8);
  const newProducts     = allProducts.filter((p) => p.isNew).slice(0, 8);
  const saleProducts    = allProducts.filter((p) => !!p.discountPercent).slice(0, 8);

  const categoryCounts: Record<string, number> = {};
  for (const filterName of Object.values(CATEGORY_FILTER)) {
    if (filterName) {
      categoryCounts[filterName] = allProducts.filter((p) => p.category === filterName).length;
    }
  }
  return (
    <>
      <Navbar />

      <main className="text-fs-graphite min-h-screen relative" style={{ overflowX: "clip" }}>

        <HeroSection />

        <PromoTicker />

        <SectionDivider variant="warm" />
        <LiveOffersSection products={saleProducts} />

        <SectionDivider variant="warm" />
        <AnimatedPromoBanner />

        <SectionDivider variant="green" />
        <CategoriesSection categoryCounts={categoryCounts} />

        <SectionDivider variant="neutral" />
        <PopularSection products={popularProducts} />

        <SectionDivider variant="warm" />
        <NewArrivalsSection products={newProducts} />

        <SectionDivider variant="neutral" />
        <RecentlyViewedSection />

        <SectionDivider variant="neutral" />
        <BusinessSection />

        <CartDrawer />
        <CartButton />
        <FloatingNotification />

        <Footer />
      </main>
    </>
  );
}
