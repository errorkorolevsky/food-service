"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/locales"

const SESSION_KEY = "fs-loading-shown"

export default function LoadingScreen() {
  const { t }      = useLang()
  const [progress, setProgress] = useState(0)
  const [stage,    setStage]    = useState(0)
  const [visible,  setVisible]  = useState(false)

  const STAGES = [
    { progress: 30,  label: t.loading.catalog, delay: 0   },
    { progress: 60,  label: t.loading.ai,      delay: 280 },
    { progress: 85,  label: t.loading.data,    delay: 560 },
    { progress: 100, label: t.loading.ready,   delay: 800 },
  ]

  useEffect(() => {
    // Skip on repeat visits within the same browser session
    if (sessionStorage.getItem(SESSION_KEY)) return

    // Skip if page is already fully loaded (fast connection / cache hit)
    if (document.readyState === "complete") return

    setVisible(true)
    sessionStorage.setItem(SESSION_KEY, "1")

    STAGES.forEach(({ progress: p, delay }, i) => {
      setTimeout(() => {
        setProgress(p)
        setStage(i)
      }, delay)
    })

    const MIN_DISPLAY = 900
    const start = Date.now()

    const dismiss = () => {
      const remaining = Math.max(0, MIN_DISPLAY - (Date.now() - start))
      setTimeout(() => setVisible(false), remaining)
    }

    // Dismiss as soon as page is loaded, but never before MIN_DISPLAY
    window.addEventListener("load", dismiss, { once: true })

    // Hard fallback — never block the user longer than 3s
    const fallback = setTimeout(() => setVisible(false), 3000)

    return () => {
      window.removeEventListener("load", dismiss)
      clearTimeout(fallback)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
          className="
            fixed inset-0 z-[9999]
            bg-gradient-to-br from-fs-dark via-fs-primary to-fs-soft
            flex items-center justify-center
            pointer-events-none
          "
        >
          <div className="flex flex-col items-center gap-8">

            {/* MONOGRAM */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="
                w-20 h-20 rounded-2xl
                bg-white text-fs-primary
                flex items-center justify-center
                text-2xl font-black tracking-tighter
              "
            >
              FS
            </motion.div>

            {/* WORDMARK */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0, 0, 0.2, 1] }}
              className="text-center"
            >
              <h1 className="text-title text-white tracking-tight">
                FOOD SERVICE
              </h1>
              <p className="text-label text-white/60 tracking-widest mt-2">
                {t.loading.tagline}
              </p>
            </motion.div>

            {/* PROGRESS BAR */}
            <div className="w-48 flex flex-col items-center gap-3">
              <div className="w-full h-[2px] bg-white/15 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full origin-left"
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
              <div className="flex items-center justify-between w-full">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={stage}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-label text-white/50"
                  >
                    {STAGES[stage]?.label}
                  </motion.span>
                </AnimatePresence>
                <span className="text-label text-white/40 tabular-nums">
                  {progress}%
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
