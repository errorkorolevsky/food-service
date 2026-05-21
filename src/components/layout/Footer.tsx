"use client"

import Link from "next/link"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import Logo from "@/components/ui/Logo"
import { MapPin, Clock, AtSign } from "lucide-react"

const nav = [
  {
    title: "Каталог",
    links: [
      { label: "Рыба и морепродукты",  href: "/catalog?category=%D0%A0%D1%8B%D0%B1%D0%B0+%D0%B8+%D0%BC%D0%BE%D1%80%D0%B5%D0%BF%D1%80%D0%BE%D0%B4%D1%83%D0%BA%D1%82%D1%8B" },
      { label: "Суши ингредиенты",     href: "/catalog?category=%D0%A1%D1%83%D1%88%D0%B8+%D0%B8%D0%BD%D0%B3%D1%80%D0%B5%D0%B4%D0%B8%D0%B5%D0%BD%D1%82%D1%8B"            },
      { label: "Кофе и бар",           href: "/catalog?category=%D0%9A%D0%BE%D1%84%D0%B5+%D0%B8+%D0%B1%D0%B0%D1%80"                                                       },
      { label: "Кондитерское",         href: "/catalog?category=%D0%9A%D0%BE%D0%BD%D0%B4%D0%B8%D1%82%D0%B5%D1%80%D1%81%D0%BA%D0%BE%D0%B5"                                 },
      { label: "Упаковка HoReCa",      href: "/catalog?category=%D0%A3%D0%BF%D0%B0%D0%BA%D0%BE%D0%B2%D0%BA%D0%B0+HoReCa"                                                  },
    ],
  },
  {
    title: "Платформа",
    links: [
      { label: "AI рекомендации", href: "/ai"       },
      { label: "Каталог",         href: "/catalog"  },
      { label: "Избранное",       href: "/favorites"},
      { label: "Отслеживание",    href: "/tracking" },
      { label: "Dashboard",       href: "/admin"    },
    ],
  },
  {
    title: "Компания",
    links: [
      { label: "О нас",     href: "/"         },
      { label: "Доставка",  href: "/tracking" },
      { label: "Профиль",   href: "/profile"  },
      { label: "Войти",     href: "/login"    },
    ],
  },
]

export default function Footer() {
  const { scrollYProgress } = useScroll()
  const rawY = useTransform(scrollYProgress, [0.7, 1], [80, 0])
  const y     = useSpring(rawY, { stiffness: 80, damping: 20 })
  const opacity = useTransform(scrollYProgress, [0.7, 0.85], [0, 1])

  return (
    <motion.footer
      style={{ y, opacity }}
      className="border-t border-fs-border bg-fs-dark relative overflow-hidden">

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

      <div className="fs-container py-16 relative z-10">

        {/* TOP */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-14">

          {/* LEFT — BRAND */}
          <div>
            <Logo variant="white" />

            <p className="text-body text-white/65 mt-6 leading-relaxed">
              Профессиональные поставки продуктов для HoReCa.
              Рестораны, кофейни, кондитерские и dark kitchen Шымкента.
            </p>

            {/* CONTACTS */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-caption text-white/60">
                <MapPin size={14} className="text-white/40 flex-shrink-0" strokeWidth={1.5} />
                Шымкент, Казахстан
              </div>
              <div className="flex items-center gap-3 text-caption text-white/60">
                <Clock size={14} className="text-white/40 flex-shrink-0" strokeWidth={1.5} />
                Пн–Сб: 08:00 – 20:00
              </div>
              <div className="flex items-center gap-3 text-caption text-white/60">
                <AtSign size={14} className="text-white/40 flex-shrink-0" strokeWidth={1.5} />
                @foodservice.kz
              </div>
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
                AI активен
              </div>
              <div className="
                px-3.5 py-2 rounded-lg
                border border-white/10 bg-white/5
                text-label text-white/60
              ">
                🚚 Доставка 15–30 мин
              </div>
            </div>
          </div>

          {/* RIGHT — NAV */}
          <div className="grid grid-cols-3 gap-8">
            {nav.map((col) => (
              <div key={col.title}>
                <p className="text-label text-white/40 uppercase tracking-widest mb-5">
                  {col.title}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-caption text-white/55 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="border-t border-white/10 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-label text-white/40">
            © 2026 Food Service Kazakhstan. Все права защищены.
          </p>
          <div className="flex items-center gap-6 text-label text-white/40">
            <span className="hover:text-white/70 cursor-pointer transition-colors duration-200">Конфиденциальность</span>
            <span className="hover:text-white/70 cursor-pointer transition-colors duration-200">Условия</span>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
