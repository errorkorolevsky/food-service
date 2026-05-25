"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useLang } from "@/locales"

type MorphNumberProps = {
  value:      number
  className?: string
  // prefix shown before the number (e.g. "₸")
  prefix?:    string
  // suffix shown after (e.g. " шт")
  suffix?:    string
  // format the number (default: toLocaleString)
  format?:    (n: number) => string
}

/**
 * Renders a number that morphs digit-by-digit when the value changes.
 * Each digit slides up/down like a slot machine — up if value increased,
 * down if decreased.
 */
export default function MorphNumber({
  value,
  className = "",
  prefix    = "",
  suffix    = "",
  format,
}: MorphNumberProps) {
  const { lang } = useLang()
  const defaultFormat = (n: number) => (n ?? 0).toLocaleString(lang === "kz" ? "kk-KZ" : "ru-RU")
  const fmt = format ?? defaultFormat
  const safeValue = value ?? 0
  const [display, setDisplay] = useState(safeValue)
  const direction = safeValue >= display ? 1 : -1

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setDisplay(safeValue) }, [safeValue])

  const formatted = fmt(display)

  return (
    <span className={`inline-flex items-baseline overflow-hidden ${className}`}>
      {prefix && <span>{prefix}</span>}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={formatted}
          initial={{ y: direction * -18, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0,               opacity: 1, filter: "blur(0px)" }}
          exit={{    y: direction * 18,   opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.28, ease: [0.34, 1.26, 0.64, 1] }}
        >
          {formatted}
        </motion.span>
      </AnimatePresence>
      {suffix && <span>{suffix}</span>}
    </span>
  )
}
