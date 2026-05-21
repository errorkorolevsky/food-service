import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import CartButton from "@/components/layout/CartButton";
import CartDrawer from "@/components/layout/CartDrawer";

import HeroSection from "@/components/sections/HeroSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import PopularSection from "@/components/sections/PopularSection";
import AISection from "@/components/sections/AISection";
import PromoTicker from "@/components/ui/PromoTicker";

import LoadingScreen from "@/components/ui/LoadingScreen";
import GlowBackground from "@/components/ui/GlowBackground";
import FloatingNotification from "@/components/ui/FloatingNotification";

export default function HomePage() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen overflow-hidden relative">

      <GlowBackground />

      <LoadingScreen />

      <Navbar />

      <HeroSection />

      <PromoTicker />

      <CategoriesSection />

      <PopularSection />

      <AISection />

      <CartDrawer />

      <CartButton />

      <FloatingNotification />

      <Footer />
    </main>
  );
}