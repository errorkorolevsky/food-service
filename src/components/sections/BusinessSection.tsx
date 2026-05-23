"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, ArrowRight } from "lucide-react"
import FadeIn from "@/components/ui/FadeIn"
import { useLang } from "@/locales"

export default function BusinessSection() {
  const { t } = useLang()

  return (
    <section className="fs-section bg-fs-dark overflow-hidden relative">
      {/* GRID PATTERN */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* ORB */}
      <motion.div
        className="absolute top-[-20%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,91,70,0.25) 0%, transparent 70%)", filter: "blur(80px)" }}
        animate={{ scale: [1, 1.08, 1], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="fs-container py-24 relative z-10">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <div className="
              inline-flex items-center justify-center
              w-16 h-16 rounded-2xl
              bg-white/[0.07] border border-white/[0.12]
              mb-8 mx-auto
            ">
              <Building2 size={28} className="text-white/70" strokeWidth={1.5} />
            </div>

            <h2 className="text-heading text-white">
              {t.business.title}
            </h2>

            <p className="text-body-lg text-white/60 mt-6 leading-relaxed max-w-xl mx-auto">
              {t.business.subtitle}
            </p>

            <div className="mt-10">
              <Link href="/ai">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="
                    inline-flex items-center gap-3
                    bg-white text-fs-dark
                    font-semibold px-8 py-4 rounded-2xl
                    hover:bg-white/90
                    transition-colors duration-200
                    shadow-[0_8px_32px_rgba(0,0,0,0.3)]
                  "
                >
                  {t.business.cta}
                  <ArrowRight size={18} strokeWidth={2} />
                </motion.button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
