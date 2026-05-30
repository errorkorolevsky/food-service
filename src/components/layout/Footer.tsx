"use client"

import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import { MapPin, Clock, AtSign, Phone } from "lucide-react"
import Logo from "@/components/ui/Logo"
import { useLang } from "@/locales"
import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from "@/config/commerce"

const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] } },
}

export default function Footer() {
  const { t } = useLang()

  const navCols = [
    {
      title: t.footer.col.catalog,
      links: [
        { label: t.footer.links.seafood,       href: "/catalog?category=%D0%A0%D1%8B%D0%B1%D0%B0%20%D0%B8%20%D0%BC%D0%BE%D1%80%D0%B5%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D1%8B" },
        { label: t.footer.links.meat,          href: "/catalog?category=%D0%9C%D1%8F%D1%81%D0%BE%20%D0%B8%20%D0%BF%D1%82%D0%B8%D1%86%D0%B0"                                        },
        { label: t.footer.links.coffee,        href: "/catalog?category=%D0%9A%D0%BE%D1%84%D0%B5%2C%20%D1%87%D0%B0%D0%B9%20%D0%B8%20%D0%BA%D0%B0%D0%BA%D0%B0%D0%BE"               },
        { label: t.footer.links.confectionery, href: "/catalog?category=%D0%9A%D0%BE%D0%BD%D0%B4%D0%B8%D1%82%D0%B5%D1%80%D1%81%D0%BA%D0%B8%D0%B5%20%D0%B8%D0%B7%D0%B4%D0%B5%D0%BB%D0%B8%D1%8F" },
        { label: t.footer.links.packaging,     href: "/catalog?category=%D0%A3%D0%BF%D0%B0%D0%BA%D0%BE%D0%B2%D0%BA%D0%B0%20HoReCa"                                                 },
      ],
    },
    {
      title: t.footer.col.platform,
      links: [
        { label: t.footer.links.ai,        href: "/ai"        },
        { label: t.footer.links.catalog,   href: "/catalog"   },
        { label: t.footer.links.favorites, href: "/favorites" },
        { label: t.footer.links.tracking,  href: "/tracking"  },
        { label: t.footer.links.dashboard, href: "/admin"     },
      ],
    },
    {
      title: t.footer.col.company,
      links: [
        { label: t.footer.links.about,    href: "/"         },
        { label: t.footer.links.delivery, href: "/tracking" },
        { label: t.footer.links.profile,  href: "/profile"  },
        { label: t.footer.links.login,    href: "/login"    },
      ],
    },
  ]

  return (
    <footer className="border-t border-fs-border bg-fs-dark relative overflow-hidden">
      {/* Noise */}
      <div className="absolute inset-0 noise-overlay" />
      {/* FSK WATERMARK */}
      <div
        className="absolute bottom-0 right-0 select-none pointer-events-none leading-none"
        style={{
          fontSize: "clamp(6rem, 18vw, 16rem)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: "rgba(255,255,255,0.03)",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        FSK
      </div>

      <div className="fs-container py-10 lg:py-16 relative z-10">

        {/* TOP */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10 lg:gap-14"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >

          {/* LEFT — BRAND */}
          <motion.div variants={fadeUp}>
            <Logo variant="white" />

            <p className="text-body text-white/65 mt-6 leading-relaxed">
              {t.footer.tagline}
            </p>

            {/* CONTACTS */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-caption text-white/60">
                <MapPin size={14} className="text-white/40 flex-shrink-0" strokeWidth={1.5} />
                {t.footer.city}
              </div>
              <div className="flex items-center gap-3 text-caption text-white/60">
                <Clock size={14} className="text-white/40 flex-shrink-0" strokeWidth={1.5} />
                {t.footer.schedule}
              </div>
              <div className="flex items-center gap-3 text-caption text-white/60">
                <AtSign size={14} className="text-white/40 flex-shrink-0" strokeWidth={1.5} />
                @foodservice.kz
              </div>
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-caption text-white/60 hover:text-white/90 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/40 flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="flex items-center gap-3 text-caption text-white/60 hover:text-white/90 transition-colors"
              >
                <Phone size={14} className="text-white/40 flex-shrink-0" strokeWidth={1.5} />
                {SUPPORT_PHONE}
              </a>
            </div>

            {/* STATUS PILLS */}
            <div className="flex flex-wrap gap-2 mt-7">
              <div className="
                px-3.5 py-2 rounded-lg
                border border-white/10 bg-white/5
                text-label text-white/60
                flex items-center gap-2
              ">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {t.footer.aiActive}
              </div>
              <div className="
                px-3.5 py-2 rounded-lg
                border border-white/10 bg-white/5
                text-label text-white/60
              ">
                {t.footer.delivery}
              </div>
            </div>
          </motion.div>

          {/* RIGHT — NAV (2-col on mobile, 3-col desktop) */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
            {navCols.map((col) => (
              <div key={col.title}>
                <p className="text-label text-white/40 uppercase tracking-widest mb-5">
                  {col.title}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-caption text-white/55 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* BOTTOM */}
        <div className="border-t border-white/10 mt-10 lg:mt-14 pt-6 lg:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-label text-white/40">
            {t.footer.copyright}
          </p>
          <div className="flex items-center gap-6 text-label text-white/40">
            <Link href="/privacy" className="hover:text-white/70 transition-colors duration-200">{t.footer.privacy}</Link>
            <Link href="/terms"   className="hover:text-white/70 transition-colors duration-200">{t.footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
