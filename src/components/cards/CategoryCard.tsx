"use client"

import Link from "next/link"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useRef } from "react"
import { useCursorAware } from "@/hooks/useCursorAware"
import { useLang } from "@/locales"

type CategoryCardProps = {
  emoji:       string
  icon?:       React.ComponentType<{ size?: number; color?: string }>
  title:       string
  description: string
  href?:       string
  count?:      number
  color?:      string
  wide?:       boolean
  index?:      number
}

export default function CategoryCard({
  emoji,
  icon: IconComponent,
  title,
  description,
  href,
  count,
  color = "#005B46",
  wide  = false,
  index = 0,
}: CategoryCardProps) {
  const tiltRef = useRef<HTMLDivElement>(null)
  const { cursor } = useCursorAware(tiltRef)
  const { t } = useLang()

  // 3D TILT
  const mouseX   = useMotionValue(0)
  const mouseY   = useMotionValue(0)
  const rotateX  = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]),  { stiffness: 280, damping: 28 })
  const rotateY  = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]),  { stiffness: 280, damping: 28 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = tiltRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5)
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5)
  }
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0) }

  const lightGradient = cursor.active
    ? `radial-gradient(ellipse 75% 65% at ${cursor.x * 100}% ${cursor.y * 100}%, rgba(0,91,70,0.09) 0%, transparent 68%)`
    : "none"

  const borderGlow = cursor.active
    ? `0 0 0 1px rgba(0,91,70,${0.08 + (1 - cursor.dist) * 0.20}), 0 6px 28px rgba(0,91,70,${0.03 + (1 - cursor.dist) * 0.09})`
    : undefined

  const inner = (
    <motion.div
      ref={tiltRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{ rotateX, rotateY, transformPerspective: 900, boxShadow: borderGlow }}
      className={`
        group relative overflow-hidden
        border border-fs-border rounded-2xl p-7 h-full
        bg-fs-white shadow-card
        transition-shadow duration-300
        cursor-pointer flex flex-col
        ${wide ? "md:col-span-2" : ""}
      `}
    >
      {/* CURSOR-AWARE LIGHT */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-all duration-200"
        style={{ background: lightGradient }}
      />

      {/* FLOOD FILL */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        whileHover={{ clipPath: "inset(0% 0 0 0)" }}
        transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
        style={{ background: color, opacity: 0.08 }}
      />

      {/* DECORATIVE INDEX NUMBER */}
      <span
        className="absolute top-4 right-5 text-[4rem] font-black leading-none select-none pointer-events-none"
        style={{ color, opacity: 0.06 }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* ICON */}
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12` }}
        whileHover={{ scale: 1.12, rotate: -3 }}
        transition={{ type: "spring", stiffness: 350, damping: 18 }}
      >
        {IconComponent ? (
          <IconComponent size={26} color={color} />
        ) : (
          <span className="text-3xl">{emoji}</span>
        )}
      </motion.div>

      <h3 className="text-base font-semibold text-fs-graphite mt-5 leading-snug relative z-10">
        {title}
      </h3>

      <p className="text-caption text-fs-gray mt-2 leading-relaxed flex-1 relative z-10">
        {description}
      </p>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-fs-border relative z-10">
        {count !== undefined ? (
          <span className="text-caption font-medium" style={{ color }}>
            {count} {t.categories.count}
          </span>
        ) : (
          <span />
        )}

        <motion.div
          whileHover={{ x: 3 }}
          transition={{ duration: 0.15 }}
        >
          <ArrowRight
            size={15}
            strokeWidth={2}
            className="text-fs-muted group-hover:text-fs-primary transition-colors duration-200"
          />
        </motion.div>
      </div>
    </motion.div>
  )

  if (href) {
    return <Link href={href} className={`block h-full ${wide ? "md:col-span-2" : ""}`}>{inner}</Link>
  }

  return inner
}
