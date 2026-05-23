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

import PromoTicker from "@/components/ui/PromoTicker";
import LoadingScreen from "@/components/ui/LoadingScreen";
import GlowBackground from "@/components/ui/GlowBackground";
import FloatingNotification from "@/components/ui/FloatingNotification";

function SectionDivider({ variant = "green" }: { variant?: "green" | "warm" | "neutral" }) {
  const gradients = {
    green:   "from-transparent via-[rgba(0,91,70,0.45)] to-transparent",
    warm:    "from-transparent via-[rgba(245,158,11,0.45)] to-transparent",
    neutral: "from-transparent via-[rgba(107,114,128,0.30)] to-transparent",
  }
  return (
    <div className={`h-[2px] bg-gradient-to-r ${gradients[variant]}`} />
  )
}

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="text-fs-graphite min-h-screen relative" style={{ overflowX: "clip" }}>

        <HeroSection />

        <PromoTicker />

        <SectionDivider variant="warm" />
        <LiveOffersSection />

        <SectionDivider variant="warm" />
        <AnimatedPromoBanner />

        <SectionDivider variant="green" />
        <CategoriesSection />

        <SectionDivider variant="neutral" />
        <PopularSection />

        <SectionDivider variant="warm" />
        <NewArrivalsSection />

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
