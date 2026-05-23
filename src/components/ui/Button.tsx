"use client"

import { motion } from "framer-motion"

type ButtonProps = {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "ghost" | "white"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
  type = "button",
}: ButtonProps) {

  const sizes = {
    sm: "px-5 py-2.5 text-sm rounded-md",
    md: "px-6 py-3.5 text-body rounded-lg",
    lg: "px-8 py-5 text-body-lg rounded-xl",
  }

  const variants = {
    primary:   "bg-fs-primary text-white font-bold hover:bg-fs-soft shadow-green",
    secondary: "border border-fs-border text-fs-graphite font-medium bg-fs-white hover:bg-fs-offwhite hover:border-fs-primary/30",
    ghost:     "text-fs-gray font-medium hover:text-fs-graphite hover:bg-fs-offwhite",
    white:     "bg-fs-white text-fs-primary font-bold hover:bg-fs-offwhite shadow-lg shadow-black/15",
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`
        inline-flex items-center justify-center gap-2
        transition-colors duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizes[size]}
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
