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
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as [number,number,number,number] } },
}

export default function HeroSection() {
  const { t } = useLang()
  const CATEGORY_PILLS   = t.hero.categoryPills
  const FLOATING_PILLS   = t.hero.floatingPills
  const [orderCount, setOrderCount] = useState<number | null>(null)

  const { scrollY } = useScroll()
  const rawHeadingY = useTransform(scrollY, [0, 600], [0, -80])
  const rawOrbY1    = useTransform(scrollY, [0, 600], [0, -140])
  const rawOrbY2    = useTransform(scrollY, [0, 600], [0, -70])
  const rawCardY    = useTransform(scrollY, [0, 600], [0, -40])
  const rawOpacity  = useTransform(scrollY, [0, 500], [1, 0.25])

  const headingY = useSpring(rawHeadingY, { stiffness: 80, damping: 20 })
  const orb1Y    = useSpring(rawOrbY1,    { stiffness: 60, damping: 18 })
  const orb2Y    = useSpring(rawOrbY2,    { stiffness: 50, damping: 16 })
  const cardY    = useSpring(rawCardY,    { stiffness: 70, damping: 20 })

  useEffect(() => {
    const load = async () => {
      try {
        const { count, error } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
        if (!error && count !== null) setOrderCount(count)
      } catch { /* network / Supabase unavailable */ }
    }
    load()
  }, [])

  return (
    <section
      className="relative overflow-hidden min-h-[78vh] sm:min-h-[88vh] lg:min-h-[92vh] flex flex-col"
      style={{
        background: "radial-gradient(ellipse 140% 100% at 65% -15%, #12916C 0%, #005B46 25%, #003D30 55%, #001810 100%)",
      }}
    >
      {/* NOISE */}
      <div className="absolute inset-0 noise-overlay" style={{ opacity: 0.04 }} />

      {/* GRID */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }} />

      {/* BOTTOM FADE to page */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{
        background: "linear-gradient(to bottom, transparent 0%, var(--page-bg) 100%)",
      }} />

      {/* WATERMARK */}
      <motion.div
        className="absolute left-[-2rem] top-0 bottom-0 flex items-center pointer-events-none select-none"
        style={{ y: orb2Y }}
      >
        <span className="text-white/[0.03] font-black uppercase tracking-[0.3em] whitespace-nowrap" style={{
          fontSize: "clamp(5rem, 13vw, 11rem)",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          lineHeight: 1,
        }}>
          FOOD SERVICE
        </span>
      </motion.div>

      {/* ORB 1 — top right, vivid */}
      <motion.div
        className="absolute top-[-20%] right-[-10%] w-[750px] h-[750px] rounded-full pointer-events-none"
        style={{ y: orb1Y, background: "radial-gradient(circle, rgba(18,145,108,0.55) 0%, rgba(0,91,70,0.20) 50%, transparent 70%)", filter: "blur(70px)" }}
        animate={{ scale: [1, 1.1, 1], x: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ORB 2 — bottom left */}
      <motion.div
        className="absolute bottom-[-15%] left-[-8%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ y: orb2Y, background: "radial-gradient(circle, rgba(13,158,118,0.40) 0%, rgba(0,91,70,0.15) 50%, transparent 70%)", filter: "blur(60px)" }}
        animate={{ scale: [1, 1.12, 1], x: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* ORB 3 — center accent */}
      <motion.div
        className="absolute top-[35%] left-[30%] w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,91,70,0.22) 0%, transparent 70%)", filter: "blur(80px)" }}
        animate={{ scale: [1, 1.18, 1], y: [0, -25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />

      {/* ─── FLOATING PRODUCT PILLS — absolute, above everything ─── */}
      <div className="absolute inset-0 pointer-events-none z-20 hidden lg:block">
        {FLOATING_PILLS.map((pill, i) => (
          <motion.div
            key={pill.label}
            className="absolute"
            style={{
              top:   i === 0 ? "18%" : i === 1 ? "34%" : i === 2 ? "50%" : "66%",
              right: i % 2 === 0 ? "3%" : "5%",
            }}
            initial={{ opacity: 0, x: 30, scale: 0.8 }}
            animate={{
              opacity: 1, x: 0, scale: 1,
              y: [0, -(8 + i * 3), 0],
            }}
            transition={{
              opacity: { duration: 0.5, delay: 0.9 + i * 0.2 },
              x:       { duration: 0.5, delay: 0.9 + i * 0.2 },
              scale:   { duration: 0.5, delay: 0.9 + i * 0.2 },
              y:       { duration: 4.5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 },
            }}
          >
            <div style={{
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "999px",
              padding: "7px 14px 7px 8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
              whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: "18px", lineHeight: 1 }}>{pill.emoji}</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.92)" }}>{pill.label}</span>
              <span style={{
                fontSize: "10px", fontWeight: 700,
                background: pill.color,
                color: "#fff",
                borderRadius: "999px",
                padding: "2px 7px",
              }}>{pill.badge}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fs-container relative z-10 pt-14 pb-8 sm:pt-20 sm:pb-10 lg:pt-28 lg:pb-14 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-12 items-center">

          {/* LEFT */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ y: headingY, opacity: rawOpacity }}
          >
            {/* BADGES */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="inline-flex items-center gap-1.5 border border-white/[0.16] bg-white/[0.08] px-3.5 py-1.5 rounded-full text-xs font-medium text-white/85 backdrop-blur-md">
                <MapPin size={12} className="text-emerald-400" />
                {t.topbar.city}
              </span>
              <span className="inline-flex items-center gap-1.5 border border-white/[0.12] bg-white/[0.06] px-3.5 py-1.5 rounded-full text-xs font-medium text-white/70">
                <Clock size={12} className="text-blue-400" />
                {t.topbar.hours}
              </span>
              <span className="inline-flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.topbar.delivery}
              </span>
            </motion.div>

            {/* HEADING */}
            <motion.h1
              variants={itemVariants}
              className="leading-[0.88]"
              style={{ fontSize: "clamp(2.4rem, 9vw, 8rem)", letterSpacing: "-0.04em" }}
            >
              <span className="block font-black text-white">{t.hero.title1}</span>
              <span className="block font-extralight text-white/45" style={{ letterSpacing: "-0.02em" }}>{t.hero.title2}</span>
              <span
                className="block font-black"
                style={{
                  background: "linear-gradient(100deg, #ffffff 10%, #6ee7c0 50%, #0D9E76 80%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "gradient-shift 5s ease infinite",
                }}
              >
                {t.hero.title3}
              </span>
            </motion.h1>

            {/* SUBTITLE */}
            <motion.p variants={itemVariants} className="text-base text-white/50 mt-6 max-w-lg leading-relaxed">
              {t.hero.subtitle}
            </motion.p>

            {/* CTA */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mt-8">
              <Link href="/catalog">
                <MagneticButton className="ripple-btn inline-flex items-center gap-2.5 bg-white text-fs-dark font-semibold px-7 py-3.5 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                  {t.hero.cta1}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </MagneticButton>
              </Link>
              <Link href="/catalog?sale=true">
                <MagneticButton className="ripple-btn inline-flex items-center gap-2.5 border border-white/20 text-white bg-white/[0.10] backdrop-blur-md font-semibold px-7 py-3.5 rounded-xl hover:bg-white/[0.18] hover:border-white/30 active:scale-[0.98] transition-all duration-200">
                  <Tag size={16} strokeWidth={2} />
                  {t.hero.cta2}
                </MagneticButton>
              </Link>
            </motion.div>

            {/* STATS */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 sm:gap-6 mt-10 pt-6 border-t border-white/[0.10]">
              {[
                { icon: ShieldCheck, value: 500,  suffix: "+",    label: t.hero.stat_items,    color: "text-emerald-400" },
                { icon: Clock,       value: 30,   suffix: " мин", label: t.hero.stat_delivery, color: "text-blue-400"    },
                { icon: Truck,       value: orderCount ?? 150, suffix: "+", label: t.hero.stat_orders, color: "text-amber-400" },
              ].map(({ icon: Icon, value, suffix, label, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.08] border border-white/[0.10] flex items-center justify-center flex-shrink-0">
                    <Icon size={16} strokeWidth={1.5} className={color} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-white leading-none">
                      <AnimatedCounter value={value} suffix={suffix} />
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">{label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — GLASS CARD */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0, 0, 0.2, 1] }}
            style={{ y: cardY }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute -inset-[1px] rounded-3xl pointer-events-none" style={{
                background: "linear-gradient(135deg, rgba(13,158,118,0.5) 0%, rgba(255,255,255,0.08) 50%, rgba(0,91,70,0.3) 100%)",
                borderRadius: "26px",
                animation: "gradient-shift 4s ease infinite",
                backgroundSize: "200% 200%",
              }} />

              <div className="relative overflow-hidden bg-white/[0.07] backdrop-blur-2xl border border-white/[0.10] rounded-3xl p-7 shadow-[0_32px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)]">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(13,158,118,0.28) 0%, transparent 70%)" }} />

                {/* HEADER */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{t.hero.cardTitle}</p>
                    <p className="text-base font-bold text-white">{t.categories.subtitle}</p>
                  </div>
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/[0.10] flex items-center justify-center"
                    animate={{ rotate: [0, 6, -6, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Truck size={18} className="text-emerald-400" strokeWidth={1.5} />
                  </motion.div>
                </div>

                {/* CATEGORY PILLS — staggered */}
                <motion.div
                  className="flex flex-wrap gap-1.5 mb-5"
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.6 } } }}
                >
                  {CATEGORY_PILLS.map((cat) => (
                    <motion.span
                      key={cat}
                      variants={{
                        hidden: { opacity: 0, scale: 0.75 },
                        show:   { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] as [number,number,number,number] } },
                      }}
                      className="text-xs font-medium bg-white/[0.07] border border-white/[0.10] text-white/75 px-3 py-1.5 rounded-lg hover:bg-white/[0.14] hover:text-white transition-all duration-150 cursor-default"
                    >
                      {cat}
                    </motion.span>
                  ))}
                </motion.div>

                <div className="border-t border-white/[0.08] mb-5" />

                {/* FEATURES */}
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.9 } } }}
                >
                  {t.hero.features.map((feat, i) => {
                    const icons = [<ShieldCheck key={0} size={14} />, <Clock key={1} size={14} />, <Tag key={2} size={14} />]
                    return (
                      <motion.div
                        key={i}
                        variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.4 } } }}
                        className="flex items-center gap-3 text-xs text-white/65"
                      >
                        <span className={`${feat.color} flex-shrink-0`}>{icons[i]}</span>
                        {feat.text}
                      </motion.div>
                    )
                  })}
                </motion.div>

                {/* CTA */}
                <Link href="/catalog" className="block mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    className="w-full bg-white text-fs-dark font-semibold py-3.5 rounded-xl hover:bg-white/90 transition-colors duration-200 text-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                  >
                    {t.hero.cta1} →
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
