"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X } from "lucide-react"
import Image from "next/image"
import { useLang } from "@/locales"

export type SearchSuggestion = {
  id:        string
  title:     string
  emoji:     string
  image?:    string
  category:  string
  price:     string
}

type SearchBarProps = {
  value:               string
  onChange:            (value: string) => void
  placeholder?:        string
  className?:          string
  suggestions?:        SearchSuggestion[]
  onSuggestionSelect?: (s: SearchSuggestion) => void
}

export default function SearchBar({
  value,
  onChange,
  placeholder,
  className = "",
  suggestions,
  onSuggestionSelect,
}: SearchBarProps) {
  const { t } = useLang()
  const [focused, setFocused] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resolvedPlaceholder = placeholder ?? t.catalog.searchPlaceholder

  const handleFocus = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setFocused(true)
  }

  const handleBlur = () => {
    hideTimer.current = setTimeout(() => setFocused(false), 120)
  }

  const showSuggestions = focused && !!suggestions && suggestions.length > 0 && value.length >= 2

  return (
    <motion.div
      className={`relative w-full ${className}`}
      animate={{ scale: focused ? 1.012 : 1 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
    >
      {/* GLOW RING */}
      <AnimatePresence>
        {focused && (
          <motion.div
            key="glow"
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ boxShadow: "0 0 0 3px rgba(0,91,70,0.14), 0 4px 20px rgba(0,91,70,0.10)" }}
          />
        )}
      </AnimatePresence>

      {/* ICON LEFT */}
      <motion.div
        className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
        animate={{ color: focused ? "#005B46" : "#6B7280" }}
        transition={{ duration: 0.2 }}
      >
        <Search size={20} strokeWidth={1.5} />
      </motion.div>

      <input
        type="search"
        aria-label={resolvedPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={resolvedPlaceholder}
        className={`
          w-full bg-fs-white border rounded-xl
          pl-14 pr-14 py-4
          text-body text-fs-graphite
          placeholder:text-fs-gray
          outline-none transition-colors duration-200
          shadow-sm
          ${focused ? "border-fs-primary" : "border-fs-border hover:border-fs-muted"}
        `}
      />

      {/* CLEAR */}
      <AnimatePresence>
        {value && (
          <motion.button
            key="clear"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            onClick={() => onChange("")}
            aria-label={t.close}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-fs-gray hover:text-fs-graphite transition-colors duration-200 z-10"
          >
            <X size={18} strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* SUGGESTIONS DROPDOWN */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 right-0 top-full mt-2 z-50 bg-fs-white border border-fs-border rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden"
          >
            {suggestions!.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12, delay: i * 0.03 }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSuggestionSelect?.(s)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-fs-offwhite transition-colors duration-150 text-left border-b border-fs-border last:border-b-0"
              >
                {s.image ? (
                  <Image
                    src={s.image}
                    alt={s.title}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-fs-offwhite"
                  />
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center text-xl flex-shrink-0 bg-fs-offwhite rounded-lg">
                    {s.emoji}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-fs-graphite truncate">{s.title}</p>
                  <p className="text-[11px] text-fs-gray">{s.category}</p>
                </div>
                <span className="text-[13px] font-bold text-fs-primary flex-shrink-0">{s.price}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
