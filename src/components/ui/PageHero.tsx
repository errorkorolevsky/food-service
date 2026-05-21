"use client"

import { motion } from "framer-motion"
import FadeIn from "@/components/ui/FadeIn"

type Stat = {
  value: string
  label: string
  icon?: React.ReactNode
}

type PageHeroProps = {
  badge?:    string
  badgeDot?: boolean
  title:     React.ReactNode
  subtitle?: string
  stats?:    Stat[]
  children?: React.ReactNode
}

export default function PageHero({ badge, badgeDot = true, title, subtitle, stats, children }: PageHeroProps) {
  return (
    <div className="fs-section relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-60 pointer-events-none" />

      {/* ORBS */}
      <motion.div
        className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-white/5 blur-[100px] pointer-events-none"
        animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] rounded-full bg-fs-accent/20 blur-[80px] pointer-events-none"
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="fs-container py-16 relative z-10">
        <FadeIn>
          {badge && (
            <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 text-white px-4 py-2 rounded-pill text-caption font-medium mb-6 backdrop-blur-sm">
              {badgeDot && <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-ping-once" />}
              {badge}
            </div>
          )}

          <h1 className="text-heading text-white">
            {title}
          </h1>

          {subtitle && (
            <p className="text-body-lg text-white/70 mt-5 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </FadeIn>

        {stats && stats.length > 0 && (
          <FadeIn delay={0.15}>
            <div className={`grid gap-4 mt-10 max-w-lg`} style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)` }}>
              {stats.map(({ value, label, icon }) => (
                <div
                  key={label}
                  className="bg-white/10 border border-white/20 rounded-xl p-4 text-center backdrop-blur-sm"
                >
                  {icon && <div className="text-white/70 flex justify-center mb-2">{icon}</div>}
                  <p className="text-title font-black text-white">{value}</p>
                  <p className="text-label text-white/60 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {children && (
          <FadeIn delay={0.2}>
            <div className="mt-8">{children}</div>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
