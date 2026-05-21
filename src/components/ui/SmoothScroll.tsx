"use client"

import { useEffect } from "react"
import Lenis from "lenis"

/**
 * Mounts Lenis smooth scroll once on the client.
 * Renders nothing — pure side-effect component.
 * Touch devices are left alone (Lenis auto-detects).
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration:   1.1,
      easing:     (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    const id = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])

  return null
}
