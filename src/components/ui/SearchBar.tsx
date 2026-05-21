"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X } from "lucide-react"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Поиск товаров, брендов, категорий...",
  className = "",
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)

  return (
    <motion.div
      className={`relative w-full ${className}`}
      animate={{
        scale: focused ? 1.012 : 1,
      }}
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
            style={{
              boxShadow: "0 0 0 3px rgba(0,91,70,0.14), 0 4px 20px rgba(0,91,70,0.10)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ICON LEFT */}
      <motion.div
        className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ color: focused ? "#005B46" : "#6B7280" }}
        transition={{ duration: 0.2 }}
      >
        <Search size={20} strokeWidth={1.5} />
      </motion.div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`
          w-full bg-white border rounded-xl
          pl-14 pr-14 py-4
          text-body text-fs-graphite
          placeholder:text-fs-gray
          outline-none transition-colors duration-200
          shadow-sm
          ${focused
            ? "border-fs-primary"
            : "border-fs-border hover:border-fs-muted"
          }
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
            className="
              absolute right-5 top-1/2 -translate-y-1/2
              text-fs-gray hover:text-fs-graphite
              transition-colors duration-200
            "
          >
            <X size={18} strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
