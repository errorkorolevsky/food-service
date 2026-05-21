"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform, useSpring, type Variants } from "framer-motion"
import Link from "next/link"
import { ArrowRight, MapPin, Clock, Truck, ShieldCheck, Tag } from "lucide-react"

import { supabase } from "@/lib/supabase"
import { useLang } from "@/locales"
import MagneticButton from "@/components/ui/MagneticButton"
import AnimatedCounter from "@/components/ui/AnimatedCounter"

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.55, ease: [0, 0, 0.2, 1] } },
}

const CATEGORY_PILLS = ["🥛 Молочное", "🍗 Мясо", "🥦 Овощи", "🧃 Напитки", "🍫 Сладости", "❄️ Заморозка", "🍞 Выпечка", "📦 HoReCa"]

export default function HeroSection() {
  const { t } = useLang()
  const [orderCount, setOrderCount] = useState<number | null>(null)

  const { scrollY } = useScroll()
  const rawHeadingY = useTransform(scrollY, [0, 500], [0, -70])
  const rawOrbY1    = useTransform(scrollY, [0, 500], [0, -120])
  const rawOrbY2    = useTransform(scrollY, [0, 500], [0, -60])
  const rawCardY    = useTransform(scrollY, [0, 500], [0, -35])
  const rawOpacity  = useTransform(scrollY, [0, 300], [1, 0])

  const headingY = useSpring(rawHeadingY, { stiffness: 80, damping: 20 })
  const orb1Y    = useSpring(rawOrbY1,    { stiffness: 60, damping: 18 })
  const orb2Y    = useSpring(rawOrbY2,    { stiffness: 50, damping: 16 })
  const cardY    = useSpring(rawCardY,    { stiffness: 70, damping: 20 })

  useEffect(() => {
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => { if (count !== null) setOrderCount(count) })
  }, [])

  return (
    <section className="relative overflow-hidden min-h-[92vh] flex flex-col" style={{
      background: "radial-gradient(ellipse 130% 90% at 60% -10%, #0A7A5C 0%, #005B46 28%, #003D30 58%, #001A14 100%)",
    }}>

      {/* NOISE */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: "128px",
      }} />

      {/* GRID */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      {/* BOTTOM AMBIENT */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[60%] pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(13,158,118,0.15) 0%, transparent 70%)",
      }} />

      {/* WATERMARK */}
      <motion.div
        className="absolute left-[-1.5rem] top-0 bottom-0 flex items-center pointer-events-none select-none"
        style={{ y: orb2Y }}
      >
        <span className="text-white/[0.025] font-black uppercase tracking-[0.3em] whitespace-nowrap" style={{
          fontSize: "clamp(5rem, 13vw, 11rem)",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          lineHeight: 1,
        }}>
          FOOD SERVICE
        </span>
      </motion.div>

      {/* ORB 1 */}
      <motion.div
        className="absolute top-[-15%] right-[-8%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ y: orb1Y, background: "radial-gradient(circle, rgba(10,122,92,0.32) 0%, transparent 70%)", filter: "blur(80px)" }}
        animate={{ scale: [1, 1.08, 1], x: [0, 35, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ORB 2 */}
      <motion.div
        className="absolute bottom-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{ y: orb2Y, background: "radial-gradient(circle, rgba(13,158,118,0.22) 0%, transparent 70%)", filter: "blur(70px)" }}
        animate={{ scale: [1, 1.1, 1], x: [0, -25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div className="fs-container relative z-10 pt-20 pb-10 lg:pt-28 lg:pb-14 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-center">

          {/* LEFT */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ y: headingY, opacity: rawOpacity }}
          >
            {/* TOPBAR BADGE */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 border border-white/[0.14] bg-white/[0.07] px-3.5 py-1.5 rounded-full text-xs font-medium text-white/80 backdrop-blur-md">
                <MapPin size={12} className="text-fs-accent" />
                {t.topbar.city}
              </span>
              <span className="inline-flex items-center gap-1.5 border border-white/[0.10] bg-white/[0.05] px-3.5 py-1.5 rounded-full text-xs font-medium text-white/70">
                <Clock size={12} className="text-blue-400" />
                {t.topbar.hours}
              </span>
              <span className="inline-flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.topbar.delivery}
              </span>
            </motion.div>

            {/* HEADING */}
            <motion.h1
              variants={itemVariants}
              className="leading-[0.90]"
              style={{ fontSize: "clamp(3.2rem, 8.5vw, 7.5rem)", letterSpacing: "-0.04em" }}
            >
              <span className="block font-black text-white">{t.hero.title1}</span>
              <span className="block font-extralight text-white/50" style={{ letterSpacing: "-0.02em" }}>{t.hero.title2}</span>
              <span className="block font-black" style={{
                background: "linear-gradient(105deg, #ffffff 0%, rgba(13,158,118,0.95) 55%, rgba(10,122,92,0.75) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {t.hero.title3}
              </span>
            </motion.h1>

            {/* SUBTITLE */}
            <motion.p
              variants={itemVariants}
              className="text-base text-white/55 mt-6 max-w-lg leading-relaxed"
            >
              {t.hero.subtitle}
            </motion.p>

            {/* CTA */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mt-8">
              <Link href="/catalog">
                <MagneticButton className="ripple-btn inline-flex items-center gap-2.5 bg-white text-fs-dark font-semibold px-7 py-3.5 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  {t.hero.cta1}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </MagneticButton>
              </Link>
              <Link href="/catalog?sale=true">
                <MagneticButton className="ripple-btn inline-flex items-center gap-2.5 border border-white/[0.14] text-white/90 bg-white/[0.07] backdrop-blur-md font-semibold px-7 py-3.5 rounded-xl hover:bg-white/[0.13] hover:border-white/25 active:scale-[0.98] transition-all duration-200">
                  <Tag size={16} strokeWidth={2} />
                  {t.hero.cta2}
                </MagneticButton>
              </Link>
            </motion.div>

            {/* STATS */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/[0.08]"
            >
              {[
                { icon: ShieldCheck, value: 500,  suffix: "+",    label: t.hero.stat_items,    color: "text-fs-accent"  },
                { icon: Clock,       value: 30,   suffix: " мин", label: t.hero.stat_delivery, color: "text-blue-400"   },
                { icon: Truck,       value: orderCount ?? 150, suffix: "+", label: t.hero.stat_orders, color: "text-amber-400" },
              ].map(({ icon: Icon, value, suffix, label, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.07] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <Icon size={16} strokeWidth={1.5} className={color} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-white leading-none">
                      <AnimatedCounter value={value} suffix={suffix} />
                    </div>
                    <div className="text-xs text-white/45 mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — GLASS CARD */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0, 0, 0.2, 1] }}
            style={{ y: cardY }}
            className="hidden lg:block"
          >
            <div className="relative overflow-hidden bg-white/[0.06] backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-7 shadow-[0_32px_80px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(13,158,118,0.18) 0%, transparent 70%)" }} />

              {/* HEADER */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Все категории</p>
                  <p className="text-base font-bold text-white">{t.categories.subtitle}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/[0.09] flex items-center justify-center">
                  <Truck size={18} className="text-white/70" strokeWidth={1.5} />
                </div>
              </div>

              {/* CATEGORY PILLS */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {CATEGORY_PILLS.map((cat) => (
                  <span key={cat} className="text-xs font-medium bg-white/[0.06] border border-white/[0.08] text-white/70 px-3 py-1.5 rounded-lg hover:bg-white/[0.10] hover:text-white/90 transition-all duration-150 cursor-default">
                    {cat}
                  </span>
                ))}
              </div>

              <div className="border-t border-white/[0.07] mb-5" />

              {/* FEATURES */}
              <div className="space-y-3">
                {[
                  { icon: <ShieldCheck size={14} />, text: "Свежие продукты с доставкой",  col: "text-fs-accent"  },
                  { icon: <Clock size={14} />,       text: "Доставка 30 мин по Шымкенту", col: "text-blue-400"   },
                  { icon: <Tag size={14} />,          text: "Акции и скидки каждый день",  col: "text-amber-400" },
                ].map(({ icon, text, col }) => (
                  <div key={text} className="flex items-center gap-3 text-xs text-white/65">
                    <span className={`${col} flex-shrink-0`}>{icon}</span>
                    {text}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link href="/catalog" className="block mt-6">
                <button className="w-full bg-white text-fs-dark font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors duration-200 text-sm shadow-[0_4px_16px_rgba(0,0,0,0.25)]">
                  {t.hero.cta1} →
                </button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>

      {/* BOTTOM FADE */}
      <div className="relative h-16 pointer-events-none" style={{
        background: "linear-gradient(to bottom, transparent, #ffffff)",
      }} />
    </section>
  )
}
