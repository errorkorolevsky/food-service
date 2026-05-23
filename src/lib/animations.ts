import type { Variants } from "framer-motion"

const E: [number, number, number, number] = [0, 0, 0.2, 1]

// ─── ENTER VARIANTS ──────────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.55, ease: E } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  show:   { opacity: 1, scale: 1,    filter: "blur(0px)", transition: { duration: 0.5, ease: E } },
}

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 36, filter: "blur(4px)" },
  show:   { opacity: 1, x: 0,  filter: "blur(0px)", transition: { duration: 0.5, ease: E } },
}

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -36, filter: "blur(4px)" },
  show:   { opacity: 1, x: 0,   filter: "blur(0px)", transition: { duration: 0.5, ease: E } },
}

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.55, ease: E } },
}

// ─── STAGGER ORCHESTRATION ───────────────────────────────────────────────────

export const staggerContainer = (stagger = 0.08, delay = 0.1): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: stagger, delayChildren: delay } },
})

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.5, ease: E } },
}

export const staggerFast: Variants   = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }
export const staggerMedium: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }
export const staggerSlow: Variants   = { hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.2  } } }

// ─── SPRING CONFIGS ──────────────────────────────────────────────────────────

export const spring = {
  snappy:  { type: "spring" as const, stiffness: 420, damping: 28 },
  default: { type: "spring" as const, stiffness: 280, damping: 24 },
  gentle:  { type: "spring" as const, stiffness: 180, damping: 22 },
  drawer:  { type: "spring" as const, stiffness: 340, damping: 36, mass: 0.8 },
}

// ─── HOVER / TAP ─────────────────────────────────────────────────────────────

export const cardHover = {
  whileHover: { y: -8, scale: 1.018 },
  whileTap:   { scale: 0.98 },
  transition: spring.default,
}

export const buttonHover = {
  whileHover: { scale: 1.04, y: -1 },
  whileTap:   { scale: 0.96 },
  transition: spring.snappy,
}

export const iconHover = {
  whileHover: { scale: 1.15, rotate: -5 },
  whileTap:   { scale: 0.9 },
  transition: spring.snappy,
}

// ─── INFINITE FLOAT ──────────────────────────────────────────────────────────

export const floatY = (amplitude = 8, duration = 4) => ({
  animate: { y: [`0px`, `-${amplitude}px`, `0px`] },
  transition: { duration, repeat: Infinity, ease: "easeInOut" as const },
})

export const floatOrb = (duration = 16, dx = 30) => ({
  animate: { scale: [1, 1.08, 1], x: [0, dx, 0] },
  transition: { duration, repeat: Infinity, ease: "easeInOut" as const },
})
