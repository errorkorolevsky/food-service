"use client"

import { motion } from "framer-motion"
import Link from "next/link"

const MotionLink = motion(Link)

type ButtonProps = {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "ghost" | "white"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
  disabled?: boolean
  type?: "button" | "submit"
  href?: string
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
  type = "button",
  href,
}: ButtonProps) {

  const sizes = {
    sm: "px-5 py-2.5 text-sm rounded-md",
    md: "px-6 py-3.5 text-body rounded-lg",
    lg: "px-8 py-5 text-body-lg rounded-xl",
  }

  const variants = {
    primary:   "bg-fs-primary text-white font-bold hover:bg-fs-soft shadow-green hover:shadow-[0_8px_28px_rgba(0,91,70,0.45)]",
    secondary: "border border-fs-border text-fs-graphite font-medium bg-fs-white hover:bg-fs-offwhite hover:border-fs-primary/30",
    ghost:     "text-fs-gray font-medium hover:text-fs-graphite hover:bg-fs-offwhite",
    white:     "bg-fs-white text-fs-primary font-bold hover:bg-fs-offwhite shadow-lg shadow-black/15",
  }

  const sharedClassName = `
    inline-flex items-center justify-center gap-2
    transition-all duration-200
    ${sizes[size]}
    ${variants[variant]}
    ${className}
  `

  if (href) {
    return (
      <MotionLink
        href={href}
        className={sharedClassName}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15, ease: "easeOut" as const }}
      >
        {children}
      </MotionLink>
    )
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" as const }}
      className={`${sharedClassName} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </motion.button>
  )
}
