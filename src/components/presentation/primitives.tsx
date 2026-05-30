"use client"

/**
 * Presentation primitives — self-contained animation + layout building blocks
 * for the /presentation showcase. Pure client components, no business logic.
 * Built on Framer Motion (already a project dependency). Mobile-first, GPU-safe
 * (transform/opacity only), and respectful of prefers-reduced-motion.
 */

import {
  motion,
  useScroll,
  useSpring,
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
  type Variants,
} from "framer-motion"
import { useEffect, useRef, useState, type ReactNode } from "react"

/* ─── EASING ─────────────────────────────────────────────────────────────── */

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1] // cinematic ease-out

/* ─── REVEAL — fade + rise when scrolled into view ───────────────────────── */

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
  amount?: number
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 28,
  once = true,
  amount = 0.3,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ─── STAGGER — animate a list of children in sequence ───────────────────── */

const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
}

export function Stagger({
  children,
  className = "",
  amount = 0.2,
}: {
  children: ReactNode
  className?: string
  amount?: number
}) {
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  )
}

/* ─── WORD REVEAL — headline that unfolds word by word ───────────────────── */

export function WordReveal({
  text,
  className = "",
  delay = 0,
  highlight,
}: {
  text: string
  className?: string
  delay?: number
  /** words to render with the brand gradient */
  highlight?: string[]
}) {
  const words = text.split(" ")
  const hl = new Set(highlight ?? [])

  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => {
        const isHl = hl.has(word.replace(/[.,]/g, ""))
        return (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className={`inline-block ${isHl ? "text-gradient-green" : ""}`}
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.8,
                ease: EASE_OUT,
                delay: delay + i * 0.07,
              }}
              aria-hidden
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

/* ─── SECTION SHELL — consistent full-height section frame ───────────────── */

export type AmbientVariant =
  | "none"
  | "light"
  | "dark"
  | "strong-light"
  | "strong-dark"

export function SectionShell({
  children,
  id,
  className = "",
  bg = "transparent",
  ambient = "none",
  full = true,
}: {
  children: ReactNode
  id?: string
  className?: string
  bg?: "transparent" | "graphite" | "mint" | "white"
  ambient?: AmbientVariant
  full?: boolean
}) {
  const bgClass =
    bg === "graphite"
      ? "bg-[#0A0F0D] text-white"
      : bg === "mint"
        ? "bg-[#ECFDF5] dark:bg-[#061810]"
        : bg === "white"
          ? "bg-fs-white"
          : ""

  return (
    <section
      id={id}
      className={`
        relative w-full overflow-hidden
        ${full ? "min-h-screen" : ""}
        flex flex-col justify-center
        px-5 sm:px-8 lg:px-12
        py-20 sm:py-24 lg:py-28
        ${bgClass} ${className}
      `}
    >
      {ambient !== "none" && <LivingBackground variant={ambient} />}
      {/* cinematic top/bottom fade so sections flow into one another */}
      <SectionEdgeFade bg={bg} />
      <div className="relative z-10 w-full max-w-6xl mx-auto">{children}</div>
    </section>
  )
}

/** Soft gradient that fades the section's own colour at its top & bottom edges,
 *  so consecutive sections bleed together instead of cutting hard. */
function SectionEdgeFade({ bg }: { bg: "transparent" | "graphite" | "mint" | "white" }) {
  if (bg === "transparent") return null
  const color =
    bg === "graphite" ? "10,15,13" : bg === "mint" ? "236,253,245" : "255,255,255"
  return (
    <>
      <div
        className="absolute inset-x-0 top-0 h-24 z-[1] pointer-events-none"
        style={{ background: `linear-gradient(to bottom, rgba(${color},0.6), transparent)` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24 z-[1] pointer-events-none"
        style={{ background: `linear-gradient(to top, rgba(${color},0.6), transparent)` }}
      />
    </>
  )
}

/* ─── EYEBROW — small section label pill ─────────────────────────────────── */

export function Eyebrow({
  children,
  dark = false,
}: {
  children: ReactNode
  dark?: boolean
}) {
  return (
    <Reveal>
      <span
        className={`
          inline-flex items-center gap-2 mb-5
          px-4 py-1.5 rounded-pill
          text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em]
          ${
            dark
              ? "bg-white/8 border border-white/12 text-emerald-300"
              : "bg-fs-primary/8 border border-fs-primary/15 text-fs-primary"
          }
        `}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-fs-accent animate-pulse" />
        {children}
      </span>
    </Reveal>
  )
}

/* ─── AMBIENT GLOW — decorative blurred brand blobs ──────────────────────── */

export function AmbientGlow({
  variant = "default",
}: {
  variant?: "default" | "strong" | "dark"
}) {
  const opacity = variant === "strong" ? 0.5 : variant === "dark" ? 0.35 : 0.28
  return (
    <div className="absolute inset-0 -z-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute -top-[10%] -left-[15%] w-[55vw] h-[55vw] max-w-[640px] max-h-[640px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(13,158,118,0.9) 0%, transparent 70%)",
          opacity,
          filter: "blur(80px)",
        }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[15%] -right-[10%] w-[50vw] h-[50vw] max-w-[560px] max-h-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,91,70,0.85) 0%, transparent 70%)",
          opacity: opacity * 0.9,
          filter: "blur(90px)",
        }}
        animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

/* ─── COUNTER — count-up number when scrolled into view ──────────────────── */

export function Counter({
  to,
  suffix = "",
  prefix = "",
  duration = 1.8,
  decimals = 0,
  className = "",
}: {
  to: number
  suffix?: string
  prefix?: string
  duration?: number
  decimals?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (!inView) return
    const controls = animate(mv, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        setDisplay(
          v.toLocaleString("ru-RU", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        )
      },
    })
    return () => controls.stop()
  }, [inView, to, duration, decimals, mv])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}

/* ─── GLASS PANEL — frosted card surface ─────────────────────────────────── */

export function GlassPanel({
  children,
  className = "",
  dark = false,
}: {
  children: ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <div
      className={`
        relative rounded-2xl
        ${
          dark
            ? "bg-white/[0.04] border border-white/10 backdrop-blur-xl"
            : "bg-white/70 dark:bg-white/[0.04] border border-white/60 dark:border-white/10 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,91,70,0.08)]"
        }
        ${className}
      `}
    >
      {children}
    </div>
  )
}

/* ─── SCROLL PROGRESS — thin top bar tracking page scroll ────────────────── */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left bg-gradient-to-r from-fs-primary via-fs-accent to-emerald-400"
      style={{ scaleX }}
    />
  )
}

/* ─── FLOAT — gentle infinite floating wrapper ───────────────────────────── */

export function Float({
  children,
  className = "",
  amplitude = 12,
  duration = 6,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  amplitude?: number
  duration?: number
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

/* ─── useIsMobile — viewport-aware, SSR-safe ─────────────────────────────── */

export function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [breakpoint])
  return mobile
}

/* ─── BLUR REVEAL — focus-pull reveal ────────────────────────────────────── */

export function BlurReveal({
  children,
  className = "",
  delay = 0,
  y = 18,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y, filter: "blur(14px)" }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ─── MASK REVEAL — cinematic clip-path wipe ─────────────────────────────── */

export function MaskReveal({
  children,
  className = "",
  delay = 0,
  direction = "left",
}: {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "left" | "up"
}) {
  const from =
    direction === "up" ? "inset(100% 0 0 0)" : "inset(0 100% 0 0)"
  return (
    <motion.div
      className={className}
      initial={{ clipPath: from, opacity: 0.4 }}
      whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 1, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ─── LIVING BACKGROUND — moving gradients + drifting particles ──────────── */

// Deterministic particle field (no Math.random → no hydration drift)
const PARTICLES = [
  { x: 8, y: 18, s: 4, d: 9, delay: 0 }, { x: 22, y: 62, s: 3, d: 11, delay: 1.2 },
  { x: 35, y: 30, s: 5, d: 8, delay: 0.5 }, { x: 48, y: 75, s: 3, d: 12, delay: 2 },
  { x: 62, y: 22, s: 4, d: 10, delay: 0.8 }, { x: 74, y: 58, s: 3, d: 9, delay: 1.6 },
  { x: 85, y: 35, s: 5, d: 13, delay: 0.3 }, { x: 92, y: 70, s: 3, d: 8, delay: 2.4 },
  { x: 15, y: 85, s: 4, d: 11, delay: 1 }, { x: 55, y: 48, s: 2, d: 10, delay: 0.6 },
  { x: 30, y: 90, s: 3, d: 9, delay: 1.8 }, { x: 68, y: 88, s: 4, d: 12, delay: 0.9 },
  { x: 5, y: 50, s: 3, d: 10, delay: 1.4 }, { x: 45, y: 12, s: 4, d: 11, delay: 0.2 },
  { x: 80, y: 14, s: 3, d: 9, delay: 2.1 }, { x: 95, y: 48, s: 2, d: 13, delay: 1.1 },
]

export function LivingBackground({
  variant = "light",
}: {
  variant?: Exclude<AmbientVariant, "none">
}) {
  const reduced = useReducedMotion()
  const mobile = useIsMobile()

  const dark = variant === "dark" || variant === "strong-dark"
  const strong = variant === "strong-light" || variant === "strong-dark"
  const intensity = strong ? 1 : 0.6

  const particleColor = dark
    ? "rgba(255,255,255,0.5)"
    : "rgba(13,158,118,0.55)"
  const count = reduced ? 0 : mobile ? 5 : 14

  const blob = (c: string) =>
    `radial-gradient(circle, ${c} 0%, transparent 70%)`

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* moving gradient blobs */}
      <motion.div
        className="absolute -top-[12%] -left-[12%] w-[60vw] h-[60vw] max-w-[680px] max-h-[680px] rounded-full"
        style={{
          background: blob(dark ? "rgba(13,158,118,0.9)" : "rgba(13,158,118,0.8)"),
          opacity: 0.3 * intensity,
          filter: "blur(80px)",
        }}
        animate={reduced ? undefined : { x: [0, 50, 0], y: [0, 36, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[15%] -right-[10%] w-[55vw] h-[55vw] max-w-[600px] max-h-[600px] rounded-full"
        style={{
          background: blob(dark ? "rgba(0,91,70,0.95)" : "rgba(0,91,70,0.7)"),
          opacity: 0.28 * intensity,
          filter: "blur(90px)",
        }}
        animate={reduced ? undefined : { x: [0, -40, 0], y: [0, -44, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      {strong && (
        <motion.div
          className="absolute top-[35%] left-[40%] w-[40vw] h-[40vw] max-w-[460px] max-h-[460px] rounded-full"
          style={{
            background: blob("rgba(52,211,153,0.7)"),
            opacity: 0.22 * intensity,
            filter: "blur(70px)",
          }}
          animate={reduced ? undefined : { x: [0, 30, -20, 0], y: [0, -20, 24, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* drifting particles */}
      {PARTICLES.slice(0, count).map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            background: particleColor,
          }}
          animate={{ y: [0, -22, 0], x: [0, 8, 0], opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}

      {/* fine grain for filmic texture */}
      <div className="absolute inset-0 noise-overlay" />
    </div>
  )
}
