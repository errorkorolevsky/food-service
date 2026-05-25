"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import Link from "next/link"

const MotionLink = motion.create(Link)

type MagneticButtonProps = {
  children:  React.ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  href?: string
}

type MagneticDivProps = {
  children:  React.ReactNode
  className?: string
  strength?: number
}

export function MagneticDiv({ children, className = "", strength = 0.28 }: MagneticDivProps) {
  const ref  = useRef<HTMLDivElement>(null)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x    = useSpring(rawX, { stiffness: 320, damping: 24, mass: 0.5 })
  const y    = useSpring(rawY, { stiffness: 320, damping: 24, mass: 0.5 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set((e.clientX - rect.left - rect.width  / 2) * strength)
    rawY.set((e.clientY - rect.top  - rect.height / 2) * strength)
  }

  return (
    <motion.div ref={ref} style={{ x, y }} onMouseMove={onMove} onMouseLeave={() => { rawX.set(0); rawY.set(0) }} className={className}>
      {children}
    </motion.div>
  )
}

export default function MagneticButton({
  children,
  className = "",
  strength = 0.38,
  onClick,
  type = "button",
  disabled = false,
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Snappy spring — feels physical, not floaty
  const x = useSpring(rawX, { stiffness: 280, damping: 22, mass: 0.6 })
  const y = useSpring(rawY, { stiffness: 280, damping: 22, mass: 0.6 })

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    rawX.set((e.clientX - rect.left - rect.width  / 2) * strength)
    rawY.set((e.clientY - rect.top  - rect.height / 2) * strength)
  }

  const handleMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  if (href) {
    return (
      <MotionLink
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        style={{ x, y }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {children}
      </MotionLink>
    )
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  )
}
