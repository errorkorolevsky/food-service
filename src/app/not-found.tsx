"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles, Grid3x3, Package, Home } from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import FadeIn from "@/components/ui/FadeIn"

const quickLinks = [
  { href: "/",          icon: Home,      label: "Главная",        desc: "Назад на старт"           },
  { href: "/catalog",   icon: Grid3x3,   label: "Каталог",        desc: "Весь ассортимент"          },
  { href: "/ai",        icon: Sparkles,  label: "AI Ассистент",   desc: "Подберём что нужно"        },
  { href: "/tracking",  icon: Package,   label: "Отследить заказ", desc: "Статус доставки"          },
]

export default function NotFound() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <CartDrawer />

      <div className="fs-container py-24 flex flex-col items-center text-center">

        {/* BADGE */}
        <FadeIn>
          <Badge variant="ai" dot className="mb-10">
            Страница не найдена
          </Badge>
        </FadeIn>

        {/* 404 GLITCH */}
        <FadeIn delay={0.05}>
          <div className="relative select-none mb-6">
            {/* shadow layers */}
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
            {/* main */}
            <div className="relative text-[120px] lg:text-[180px] font-black leading-none text-fs-graphite">
              404
            </div>
          </div>
        </FadeIn>

        {/* TEXT */}
        <FadeIn delay={0.1}>
          <h1 className="text-heading text-fs-graphite">
            Такой страницы нет
          </h1>
          <p className="text-body text-fs-gray mt-4 max-w-sm leading-relaxed">
            Она могла переехать или никогда не существовала.
            Выберите куда отправиться дальше.
          </p>
        </FadeIn>

        {/* CTA BUTTONS */}
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <Link href="/">
              <Button size="lg">
                <ArrowLeft size={16} strokeWidth={1.5} />
                На главную
              </Button>
            </Link>
            <Link href="/catalog">
              <Button variant="secondary" size="lg">
                Открыть каталог
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* QUICK LINKS */}
        <FadeIn delay={0.2}>
          <div className="mt-16 w-full max-w-2xl">
            <p className="text-label text-fs-subtle uppercase tracking-widest mb-6">
              Куда пойти
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {quickLinks.map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.15 }}
                    className="
                      bg-white border border-fs-border rounded-xl
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
