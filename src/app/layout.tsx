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

/* Inline script prevents flash-of-wrong-theme before React hydrates */
const themeInitScript = `(function(){try{var t=localStorage.getItem('fs-theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`

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
          </SessionProviderWrapper>
          <NavigationProgress />
          <ScrollToTop />
          <SmoothScroll />
          <CursorAura />
          <MobileNav />
          <ServiceWorkerRegister />
          <LangHtmlSync />
        </ThemeProvider>
      </body>
    </html>
  )
}
