"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function NavigationProgress() {
  const pathname   = usePathname()
  const [active, setActive]     = useState(false)
  const [progress, setProgress] = useState(0)
  const prevPath   = useRef(pathname)
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (prevPath.current === pathname) return

    prevPath.current = pathname
    setActive(true)
    setProgress(10)

    // Simulate progress
    const steps = [30, 55, 70, 85, 95]
    steps.forEach((val, i) => {
      timerRef.current = setTimeout(() => setProgress(val), 80 * (i + 1))
    })

    // Complete
    const done = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setActive(false), 300)
    }, 500)

    return () => {
      clearTimeout(done)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="nprogress"
          aria-hidden="true"
          className="fixed top-0 left-0 z-[9999] h-[3px] pointer-events-none"
          style={{ width: `${progress}%` }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ width: { duration: 0.25, ease: "easeOut" } }}
        >
          <div
            className="h-full w-full"
            style={{
              background: "linear-gradient(90deg, #005B46, #0D9E76)",
              boxShadow: "0 0 8px rgba(13,158,118,0.7)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
