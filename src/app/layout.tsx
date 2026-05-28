import type { Metadata, Viewport } from "next"

import MobileNav from "@/components/layout/MobileNav"
import ServiceWorkerRegister from "@/components/ui/ServiceWorker"
import SessionProviderWrapper from "@/components/ui/SessionProviderWrapper"
import AnimatedLayout from "@/components/ui/AnimatedLayout"
import CursorAura from "@/components/ui/CursorAura"
import SmoothScroll from "@/components/ui/SmoothScroll"
import NavigationProgress from "@/components/ui/NavigationProgress"
import ScrollToTop from "@/components/ui/ScrollToTop"
import LangHtmlSync from "@/components/ui/LangHtmlSync"
import FavoritesSync from "@/components/ui/FavoritesSync"
import ProductQuickView from "@/components/ui/ProductQuickView"
import { ThemeProvider } from "@/components/ui/ThemeProvider"
import { BASE_URL, META_RU, LANG_ALTERNATES } from "@/lib/seo"

import "./globals.css"

export const viewport: Viewport = {
  themeColor:   "#005B46",
  width:        "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title:        META_RU.home.title,
  description:  META_RU.home.description,
  keywords:     ["food service", "доставка продуктов", "онлайн магазин", "продукты Шымкент", "доставка еды", "Kazakhstan", "Шымкент", "азық-түлік жеткізу"],
  robots:       { index: true, follow: true },
  manifest:     "/manifest.json",
  alternates:   LANG_ALTERNATES,
  appleWebApp: {
    capable:        true,
    statusBarStyle: "black-translucent",
    title:          "Food Service",
  },
  openGraph: {
    title:       META_RU.home.title,
    description: META_RU.home.description,
    siteName:    "Food Service",
    locale:      "ru_RU",
    alternateLocale: ["kk_KZ"],
    type:        "website",
    url:         BASE_URL,
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Food Service — Продукты с доставкой · Шымкент",
    description: "Свежие продукты и готовая еда с доставкой на дом в Шымкенте.",
  },
}

/* Inline script: prevents flash-of-wrong-theme + patches any external-script
   globals (like window.ja) to safe no-ops before third-party code can fail. */
const themeInitScript = `(function(){try{var t=localStorage.getItem('fs-theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();if(typeof window!=='undefined'&&typeof window.ja!=='function'){window.ja=function(){};}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-[var(--page-bg)] text-fs-graphite antialiased font-sans pb-24 lg:pb-0 transition-colors duration-200">
        <ThemeProvider>
          <SessionProviderWrapper>
            <AnimatedLayout>
              {children}
            </AnimatedLayout>
            <FavoritesSync />
            <ProductQuickView />
            <MobileNav />
          </SessionProviderWrapper>
          <NavigationProgress />
          <ScrollToTop />
          <SmoothScroll />
          <CursorAura />
          <ServiceWorkerRegister />
          <LangHtmlSync />
          {/* YandexMetrica disabled — external script (mc.yandex.ru/metrika/tag.js)
              creates window.ja as array then calls it as function → TypeError.
              Re-enable after verifying production stability. */}
        </ThemeProvider>
      </body>
    </html>
  )
}
