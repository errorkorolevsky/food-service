"use client"

import { motion, type Variants } from "framer-motion"
import { Building2, ArrowRight, CheckCircle } from "lucide-react"
import Button from "@/components/ui/Button"
import { useLang } from "@/locales"

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as [number, number, number, number] } },
}

export default function BusinessSection() {
  const { t } = useLang()
  const PERKS = t.business.perks

  return (
    <section className="fs-section bg-fs-dark overflow-hidden relative">
      {/* GRID PATTERN */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      {/* Noise */}
      <div className="absolute inset-0 noise-overlay opacity-[0.018]" />

      {/* ORB 1 — top right */}
      <motion.div
        className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,91,70,0.28) 0%, transparent 70%)", filter: "blur(80px)" }}
        animate={{ scale: [1, 1.08, 1], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ORB 2 — bottom left */}
      <motion.div
        className="absolute bottom-[-10%] left-[-8%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(13,158,118,0.18) 0%, transparent 70%)", filter: "blur(70px)" }}
        animate={{ scale: [1, 1.12, 1], y: [0, -15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      <div className="fs-container py-24 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          {/* ICON */}
          <motion.div variants={itemVariants}>
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.07] border border-white/[0.12] mb-8 mx-auto"
              whileHover={{ scale: 1.08, rotate: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
              <Building2 size={28} className="text-white/70" strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          {/* TITLE */}
          <motion.h2 variants={itemVariants} className="text-heading text-white">
            {t.business.title}
          </motion.h2>

          {/* SUBTITLE */}
          <motion.p variants={itemVariants} className="text-body-lg text-white/60 mt-6 leading-relaxed max-w-xl mx-auto">
            {t.business.subtitle}
          </motion.p>

          {/* PERKS */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
          >
            {PERKS.map((perk) => (
              <span
                key={perk}
                className="inline-flex items-center gap-2 text-xs font-medium text-white/60 border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 rounded-full"
              >
                <CheckCircle size={12} className="text-fs-accent flex-shrink-0" strokeWidth={2} />
                {perk}
              </span>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={itemVariants} className="mt-10">
            <Button href="/ai" variant="white" size="lg">
              {t.business.cta}
              <ArrowRight size={18} strokeWidth={2} />
            </Button>
          </motion.div>

          {/* Decorative divider lines */}
          <motion.div
            variants={itemVariants}
            className="mt-16 flex items-center gap-4 opacity-20"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/40" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">B2B</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
