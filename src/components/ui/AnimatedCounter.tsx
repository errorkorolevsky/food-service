"use client"

import { useEffect, useRef } from "react"
import { useInView, useMotionValue, animate } from "framer-motion"

type AnimatedCounterProps = {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export default function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1.6,
  className = "",
}: AnimatedCounterProps) {
  const ref     = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)
  const inView  = useInView(ref, { once: true, margin: "-40px" })

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${Math.round(v)}${suffix}`
        }
      },
    })
    return controls.stop
  }, [inView, motionVal, value, duration, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  )
}
