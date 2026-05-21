"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

// ─── RIPPLE ───────────────────────────────────────────────────────────────────

interface Ripple { id: number; x: number; y: number }

function ClickRipple({ x, y }: Ripple) {
  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9990] rounded-full"
      style={{
        translateX: "-50%",
        translateY: "-50%",
        x,
        y,
        border: "1px solid rgba(0,91,70,0.35)",
      }}
      initial={{ width: 8,  height: 8,  opacity: 0.55 }}
      animate={{ width: 64, height: 64, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
    />
  )
}

// ─── CURSOR AURA ─────────────────────────────────────────────────────────────
// Does NOT replace the native cursor.
// Adds only: a soft ambient glow that follows the mouse (desktop only)
// and a subtle click-ripple pulse.

export default function CursorAura() {
  const [mounted,  setMounted]  = useState(false)
  const [hovering, setHovering] = useState(false)
  const [ripples,  setRipples]  = useState<Ripple[]>([])
  const rippleId  = useRef(0)
  const isTouch   = useRef(false)

  const mouseX = useMotionValue(-600)
  const mouseY = useMotionValue(-600)

  // Very slow glow — feels like ambient light, not a cursor
  const glowX = useSpring(mouseX, { stiffness: 55, damping: 20, mass: 1.6 })
  const glowY = useSpring(mouseY, { stiffness: 55, damping: 20, mass: 1.6 })

  const addRipple = useCallback((x: number, y: number) => {
    const id = ++rippleId.current
    setRipples(p => [...p, { id, x, y }])
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 700)
  }, [])

  useEffect(() => {
    isTouch.current = window.matchMedia("(pointer: coarse)").matches
    if (isTouch.current) return
    setMounted(true)

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const isInteractive = !!t.closest("a, button, [role='button'], label, [data-cursor]")
      setHovering(isInteractive)
    }

    const onDown = (e: MouseEvent) => addRipple(e.clientX, e.clientY)

    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseover", onOver, { passive: true })
    window.addEventListener("mousedown", onDown)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseover", onOver)
      window.removeEventListener("mousedown", onDown)
    }
  }, [mouseX, mouseY, addRipple])

  if (!mounted) return null

  return (
    <>
      {/* ── AMBIENT GLOW — slow-moving light under the native cursor ───── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9989] rounded-full"
        style={{
          x:          glowX,
          y:          glowY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgba(0,91,70,0.28) 0%, rgba(0,91,70,0.10) 40%, transparent 70%)",
          filter:     "blur(18px)",
        }}
        animate={{
          width:   hovering ? 160 : 110,
          height:  hovering ? 160 : 110,
          opacity: hovering ? 0.22 : 0.12,
        }}
        transition={{
          width:   { type: "spring", stiffness: 120, damping: 22 },
          height:  { type: "spring", stiffness: 120, damping: 22 },
          opacity: { duration: 0.35 },
        }}
      />

      {/* ── CLICK RIPPLES ────────────────────────────────────────────────── */}
      {ripples.map(r => <ClickRipple key={r.id} {...r} />)}
    </>
  )
}
