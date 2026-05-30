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
import YandexMetrica from "@/components/ui/YandexMetrica"
import PWAInstallPrompt from "@/components/ui/PWAInstallPrompt"
import { BASE_URL, META_RU, LANG_ALTERNATES } from "@/lib/seo"

import "./globals.css"

export const viewport: Viewport = {
  themeColor:   "#005B46",
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit:  "cover",
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

/* Inline script: prevents flash-of-wrong-theme + protects window.ja via
   Object.defineProperty so tag.js (YM) cannot overwrite it with an array.
   The setter silently ignores non-function assignments, preventing the
   "window.ja is not a function" crash even after tag.js runs its IIFE. */
const themeInitScript = `(function(){try{var t=localStorage.getItem('fs-theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();try{var _jaFn=typeof window.ja==='function'?window.ja:function(){};Object.defineProperty(window,'ja',{configurable:true,enumerable:true,get:function(){return _jaFn;},set:function(v){if(typeof v==='function')_jaFn=v;}});}catch(e){if(typeof window.ja!=='function')window.ja=function(){};}`

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
          <YandexMetrica />
          <PWAInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  )
}
