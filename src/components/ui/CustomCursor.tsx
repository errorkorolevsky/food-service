"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useVelocity,
  useTransform,
  AnimatePresence,
  type MotionValue,
} from "framer-motion"

// ─── TYPES ───────────────────────────────────────────────────────────────────

type CursorState = "default" | "hover" | "click" | "text"

// ─── FS MONOGRAM (SVG inline — matches Logo.tsx F lettermark) ────────────────

function FSMonogram({ opacity }: { opacity: number }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity, transition: "opacity 0.25s ease" }}
    >
      {/* F — horizontal bars */}
      <rect x="20" y="20" width="38" height="8"  rx="4" fill="rgba(255,255,255,0.90)" />
      <rect x="20" y="34" width="28" height="7"  rx="3.5" fill="rgba(255,255,255,0.70)" />
      {/* F — vertical bar */}
      <rect x="20" y="20" width="8"  height="40" rx="4" fill="rgba(255,255,255,0.90)" />
    </svg>
  )
}

// ─── CLICK RIPPLE ────────────────────────────────────────────────────────────

function ClickRipple({ x, y, id }: { x: number; y: number; id: number }) {
  return (
    <motion.div
      key={id}
      className="fixed top-0 left-0 pointer-events-none z-[9995] rounded-full"
      style={{
        translateX: "-50%",
        translateY: "-50%",
        x,
        y,
        border: "1px solid rgba(0,91,70,0.45)",
        background: "transparent",
      }}
      initial={{ width: 12, height: 12, opacity: 0.6 }}
      animate={{ width: 72, height: 72, opacity: 0 }}
      transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
    />
  )
}

// ─── MAIN CURSOR ─────────────────────────────────────────────────────────────

export default function CustomCursor() {
  const [mounted, setMounted]     = useState(false)
  const [state,   setState]       = useState<CursorState>("default")
  const [label,   setLabel]       = useState<string | null>(null)
  const [ripples, setRipples]     = useState<{ x: number; y: number; id: number }[]>([])
  const rippleId                  = useRef(0)
  const isTouch                   = useRef(false)

  // ── Raw position ────────────────────────────────────────────────────────
  const mouseX = useMotionValue(-300)
  const mouseY = useMotionValue(-300)

  // ── Orb: medium lag — the "glass orb" layer ─────────────────────────────
  const orbX = useSpring(mouseX, { stiffness: 160, damping: 22, mass: 0.9 })
  const orbY = useSpring(mouseY, { stiffness: 160, damping: 22, mass: 0.9 })

  // ── Dot: snappy — true cursor position indicator ─────────────────────────
  const dotX = useSpring(mouseX, { stiffness: 900, damping: 55, mass: 0.35 })
  const dotY = useSpring(mouseY, { stiffness: 900, damping: 55, mass: 0.35 })

  // ── Glow: very slow — ambient halo ──────────────────────────────────────
  const glowX = useSpring(mouseX, { stiffness: 70, damping: 18, mass: 1.4 })
  const glowY = useSpring(mouseY, { stiffness: 70, damping: 18, mass: 1.4 })

  // ── Velocity → morph distortion on the orb ──────────────────────────────
  const vx       = useVelocity(orbX)
  const vy       = useVelocity(orbY)
  const morphX   = useTransform(vx, [-1400, 0, 1400], [0.72, 1, 1.30])
  const morphY   = useTransform(vy, [-1400, 0, 1400], [0.72, 1, 1.30])
  const morphRot = useTransform([vx, vy] as MotionValue<number>[], ([lx, ly]: number[]) =>
    Math.atan2(ly, lx) * (180 / Math.PI)
  )

  // ── Ripple helper ────────────────────────────────────────────────────────
  const addRipple = useCallback((x: number, y: number) => {
    const id = ++rippleId.current
    setRipples(prev => [...prev, { x, y, id }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)
  }, [])

  // ── Event listeners ──────────────────────────────────────────────────────
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
      if (t.closest("input, textarea, select")) {
        setState("text"); setLabel(null); return
      }
      const el = t.closest(
        "a, button, [role='button'], label, [data-cursor]"
      ) as HTMLElement | null
      if (el) {
        setState("hover")
        setLabel(el.dataset.cursorLabel ?? null)
        return
      }
      setState("default"); setLabel(null)
    }

    const onDown = (e: MouseEvent) => {
      setState(s => (s === "hover" || s === "default") ? "click" : s)
      addRipple(e.clientX, e.clientY)
    }
    const onUp = () => setState(s => s === "click" ? "default" : s)

    window.addEventListener("mousemove",  onMove, { passive: true })
    window.addEventListener("mouseover",  onOver, { passive: true })
    window.addEventListener("mousedown",  onDown)
    window.addEventListener("mouseup",    onUp)
    return () => {
      window.removeEventListener("mousemove",  onMove)
      window.removeEventListener("mouseover",  onOver)
      window.removeEventListener("mousedown",  onDown)
      window.removeEventListener("mouseup",    onUp)
    }
  }, [mouseX, mouseY, addRipple])

  if (!mounted) return null

  const isHover = state === "hover"
  const isClick = state === "click"
  const isText  = state === "text"

  // Orb diameter per state
  const orbSize  = isClick ? 30 : isHover ? 58 : 38

  // Dot diameter per state — disappears inside text fields
  const dotSize  = isText ? 0 : isClick ? 3 : 4

  return (
    <>
      {/* ── CLICK RIPPLES ─────────────────────────────────────────────────── */}
      {ripples.map(r => <ClickRipple key={r.id} {...r} />)}

      {/* ── AMBIENT GLOW — slowest layer ──────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9993] rounded-full"
        style={{
          x:          glowX,
          y:          glowY,
          translateX: "-50%",
          translateY: "-50%",
          width:      isHover ? 110 : 80,
          height:     isHover ? 110 : 80,
          background: "radial-gradient(circle, rgba(0,91,70,0.18) 0%, rgba(0,91,70,0.06) 50%, transparent 72%)",
          filter:     "blur(14px)",
          opacity:    isText ? 0 : isClick ? 0.5 : 0.35,
          transition: "width 0.4s ease, height 0.4s ease, opacity 0.3s ease",
        }}
      />

      {/* ── GLASS ORB — main cursor body ──────────────────────────────────── */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center overflow-hidden"
        style={{
          x:          orbX,
          y:          orbY,
          translateX: "-50%",
          translateY: "-50%",
          // velocity morph — disabled in hover/click/text so it doesn't fight the animate
          scaleX:     isHover || isClick || isText ? 1 : morphX,
          scaleY:     isHover || isClick || isText ? 1 : morphY,
          rotate:     isHover || isClick || isText ? 0 : morphRot,
        }}
        animate={{
          width:  orbSize,
          height: orbSize,
          // glass fill — white/5 default, green tint hover
          backgroundColor: isHover
            ? "rgba(0, 91, 70, 0.12)"
            : isClick
            ? "rgba(0, 91, 70, 0.22)"
            : "rgba(255, 255, 255, 0.05)",
          // border
          borderWidth: isText ? 0 : 1,
          borderColor: isHover || isClick
            ? "rgba(0, 91, 70, 0.55)"
            : "rgba(0, 0, 0, 0.18)",
          // inner glow on hover via shadow
          boxShadow: isHover
            ? "0 0 0 1px rgba(0,91,70,0.20), 0 4px 20px rgba(0,91,70,0.18), inset 0 1px 0 rgba(255,255,255,0.22)"
            : isClick
            ? "0 0 0 1px rgba(0,91,70,0.35), 0 2px 10px rgba(0,91,70,0.28), inset 0 1px 0 rgba(255,255,255,0.18)"
            : "0 0 0 0.5px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.25)",
          scale:  isClick ? 0.84 : 1,
          opacity: isText ? 0 : 1,
        }}
        transition={{
          width:           { type: "spring", stiffness: 320, damping: 26 },
          height:          { type: "spring", stiffness: 320, damping: 26 },
          scale:           { type: "spring", stiffness: 550, damping: 28 },
          backgroundColor: { duration: 0.22 },
          borderColor:     { duration: 0.22 },
          boxShadow:       { duration: 0.25 },
          opacity:         { duration: 0.18 },
        }}
      >
        {/* ── FS MONOGRAM — fades in when orb is large enough ──────────── */}
        <FSMonogram opacity={isHover ? 0.85 : isClick ? 0.65 : 0} />
      </motion.div>

      {/* ── PRECISION DOT — snappy, always on top ─────────────────────────── */}
      <AnimatePresence>
        {!isText && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
            style={{
              x:          dotX,
              y:          dotY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={{
              width:           dotSize,
              height:          dotSize,
              backgroundColor: isHover || isClick ? "#005B46" : "#1E1E1E",
              boxShadow:       isHover || isClick
                ? "0 0 6px rgba(0,91,70,0.6)"
                : "none",
              scale: isClick ? 0.5 : 1,
            }}
            transition={{
              width:           { type: "spring", stiffness: 700, damping: 38 },
              height:          { type: "spring", stiffness: 700, damping: 38 },
              scale:           { type: "spring", stiffness: 700, damping: 28 },
              backgroundColor: { duration: 0.12 },
              boxShadow:       { duration: 0.15 },
            }}
            exit={{ opacity: 0, scale: 0 }}
          />
        )}
      </AnimatePresence>

      {/* ── TEXT I-BEAM ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isText && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center"
            style={{
              x:          dotX,
              y:          dotY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ opacity: 0, scaleY: 0.5 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{    opacity: 0, scaleY: 0.5 }}
            transition={{ duration: 0.14 }}
          >
            <div
              className="w-[1.5px] h-[18px] rounded-full bg-fs-primary"
              style={{ animation: "text-cursor-blink 1s ease-in-out infinite" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CURSOR LABEL (data-cursor-label attr) ─────────────────────────── */}
      <AnimatePresence>
        {label && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999]"
            style={{
              x:          orbX,
              y:          orbY,
              translateX: "-50%",
              translateY: "calc(-50% + 38px)",
            }}
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{    opacity: 0, y: 3, scale: 0.95 }}
            transition={{ duration: 0.16, ease: [0, 0, 0.2, 1] }}
          >
            <span className="
              block whitespace-nowrap
              bg-fs-graphite/90 backdrop-blur-sm text-white
              text-[10px] font-semibold tracking-wider uppercase
              px-2.5 py-1 rounded-md shadow-lg
            ">
              {label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
