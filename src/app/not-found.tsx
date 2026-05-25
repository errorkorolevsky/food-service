"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles, Grid3x3, Package, Home } from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import FadeIn from "@/components/ui/FadeIn"
import { useLang } from "@/locales"

export default function NotFound() {
  const { t } = useLang()

  const quickLinks = [
    { href: "/",         icon: Home,     label: t.nav.home,     desc: t.errors.goHome      },
    { href: "/catalog",  icon: Grid3x3,  label: t.nav.catalog,  desc: t.errors.openCatalog },
    { href: "/ai",       icon: Sparkles, label: t.nav.ai,       desc: t.ai.placeholder     },
    { href: "/tracking", icon: Package,  label: t.nav.tracking, desc: t.tracking.subtitle  },
  ]

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <CartDrawer />

      <div className="fs-container py-24 flex flex-col items-center text-center">

        {/* BADGE */}
        <FadeIn>
          <Badge variant="ai" dot className="mb-10">
            {t.errors.notFound}
          </Badge>
        </FadeIn>

        {/* 404 GLITCH */}
        <FadeIn delay={0.05}>
          <div className="relative select-none mb-6">
            <motion.div
              className="absolute inset-0 text-[120px] lg:text-[180px] font-black leading-none text-fs-green/10"
              animate={{ x: [0, -4, 4, 0], y: [0, 2, -2, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
            >
              404
            </motion.div>
            <motion.div
              className="absolute inset-0 text-[120px] lg:text-[180px] font-black leading-none text-red-500/10"
              animate={{ x: [0, 4, -4, 0], y: [0, -2, 2, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut", delay: 0.05 }}
            >
              404
            </motion.div>
            <div className="relative text-[120px] lg:text-[180px] font-black leading-none text-fs-graphite">
              404
            </div>
          </div>
        </FadeIn>

        {/* TEXT */}
        <FadeIn delay={0.1}>
          <h1 className="text-heading text-fs-graphite">
            {t.errors.notFoundTitle}
          </h1>
          <p className="text-body text-fs-gray mt-4 max-w-sm leading-relaxed">
            {t.errors.notFoundDesc}
          </p>
        </FadeIn>

        {/* CTA BUTTONS */}
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <Button href="/" size="lg">
              <ArrowLeft size={16} strokeWidth={1.5} />
              {t.errors.goHome}
            </Button>
            <Button href="/catalog" variant="secondary" size="lg">
              {t.errors.openCatalog}
            </Button>
          </div>
        </FadeIn>

        {/* QUICK LINKS */}
        <FadeIn delay={0.2}>
          <div className="mt-16 w-full max-w-2xl">
            <p className="text-label text-fs-subtle uppercase tracking-widest mb-6">
              {t.errors.whereToGo}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {quickLinks.map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="
                      bg-fs-white border border-fs-border rounded-xl
                      p-5 flex flex-col items-center gap-3
                      hover:border-fs-subtle transition-colors duration-200
                      cursor-pointer
                    "
                  >
                    <div className="
                      w-10 h-10 rounded-xl
                      bg-fs-offwhite border border-fs-border
                      flex items-center justify-center
                    ">
                      <Icon size={18} strokeWidth={1.5} className="text-fs-gray" />
                    </div>
                    <div>
                      <p className="text-caption font-bold text-fs-graphite">{label}</p>
                      <p className="text-label text-fs-gray mt-0.5">{desc}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>

      </div>
    </main>
  )
}
