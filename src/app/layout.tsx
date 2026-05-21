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
  title:       "Food Service Kazakhstan — HoReCa поставки",
  description: "Профессиональные поставки продуктов для ресторанов, кофеен и dark kitchen в Шымкенте. AI-powered HoReCa ecosystem.",
  keywords:    ["food service", "horeca", "delivery", "AI supply", "restaurant supply", "Kazakhstan", "Шымкент"],
  robots:      { index: true, follow: true },
  manifest:    "/manifest.json",
  appleWebApp: {
    capable:    true,
    statusBarStyle: "black-translucent",
    title:      "Food Service",
  },
  openGraph: {
    title:       "Food Service Kazakhstan — HoReCa поставки",
    description: "Профессиональные поставки для ресторанов и кофеен Шымкента.",
    siteName:    "Food Service Kazakhstan",
    locale:      "ru_RU",
    type:        "website",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Food Service Kazakhstan",
    description: "Профессиональные поставки для HoReCa в Шымкенте.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="bg-white text-fs-graphite antialiased font-sans">
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
