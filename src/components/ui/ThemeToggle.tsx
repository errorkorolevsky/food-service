"use client"

import { Sun, Moon, Monitor } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme, type Theme } from "@/components/ui/ThemeProvider"

type Variant = "navbar" | "mobile"

const THEMES: { value: Theme; icon: React.ElementType; label: string }[] = [
  { value: "light",  icon: Sun,     label: "Светлая" },
  { value: "system", icon: Monitor, label: "Системная" },
  { value: "dark",   icon: Moon,    label: "Тёмная" },
]

export default function ThemeToggle({ variant = "navbar" }: { variant?: Variant }) {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    const idx  = THEMES.findIndex((t) => t.value === theme)
    const next = THEMES[(idx + 1) % THEMES.length]
    setTheme(next.value)
  }

  const current = THEMES.find((t) => t.value === theme) ?? THEMES[1]
  const Icon    = current.icon

  if (variant === "mobile") {
    return (
      <button
        onClick={cycle}
        aria-label={`Тема: ${current.label}`}
        className={`
          px-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide
          transition-all duration-150
          text-fs-gray hover:text-fs-graphite
        `}
      >
        <Icon size={13} strokeWidth={2} />
      </button>
    )
  }

  return (
    <button
      onClick={cycle}
      aria-label={`Тема: ${current.label}`}
      className="
        relative w-8 h-8 rounded-lg
        border border-white/[0.12] bg-white/[0.06]
        hover:bg-white/[0.12] hover:border-white/20
        flex items-center justify-center
        transition-all duration-200
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
          transition={{ duration: 0.18 }}
        >
          <Icon size={14} strokeWidth={2} className="text-white/70" />
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
