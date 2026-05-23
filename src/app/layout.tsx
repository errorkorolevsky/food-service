import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"

import MobileNav from "@/components/layout/MobileNav"
import ServiceWorkerRegister from "@/components/ui/ServiceWorker"
import SessionProviderWrapper from "@/components/ui/SessionProviderWrapper"
import AnimatedLayout from "@/components/ui/AnimatedLayout"
import CursorAura from "@/components/ui/CursorAura"
import SmoothScroll from "@/components/ui/SmoothScroll"
import NavigationProgress from "@/components/ui/NavigationProgress"
import ScrollToTop from "@/components/ui/ScrollToTop"

import "./globals.css"

const inter = Inter({
  subsets:  ["latin", "cyrillic"],
  variable: "--font-inter",
  display:  "swap",
})

export const viewport: Viewport = {
  themeColor:        "#005B46",
  width:             "device-width",
  initialScale:      1,
  maximumScale:      1,
  userScalable:      false,
}

export const metadata: Metadata = {
  title:       "Food Service — Продукты с доставкой на дом · Шымкент",
  description: "Онлайн-магазин продуктов и готовой еды с доставкой на дом в Шымкенте. Свежие продукты, мясо, молочное, напитки, заморозка и многое другое.",
  keywords:    ["food service", "доставка продуктов", "онлайн магазин", "продукты Шымкент", "доставка еды", "Kazakhstan", "Шымкент"],
  robots:      { index: true, follow: true },
  manifest:    "/manifest.json",
  appleWebApp: {
    capable:    true,
    statusBarStyle: "black-translucent",
    title:      "Food Service",
  },
  openGraph: {
    title:       "Food Service — Продукты с доставкой на дом · Шымкент",
    description: "Онлайн-магазин продуктов и готовой еды с доставкой на дом в Шымкенте.",
    siteName:    "Food Service",
    locale:      "ru_RU",
    type:        "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Food Service — Продукты с доставкой · Шымкент",
    description: "Свежие продукты и готовая еда с доставкой на дом в Шымкенте.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="bg-white text-fs-graphite antialiased font-sans pb-24 lg:pb-0">
        <SessionProviderWrapper>
          <AnimatedLayout>
            {children}
          </AnimatedLayout>
        </SessionProviderWrapper>
        <NavigationProgress />
        <ScrollToTop />
        <SmoothScroll />
        <CursorAura />
        <MobileNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
