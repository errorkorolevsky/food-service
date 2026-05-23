"use client"

import { motion, type Variants } from "framer-motion"
import { fadeUp } from "@/lib/animations"

type Props = {
  children:  React.ReactNode
  variants?: Variants
  delay?:    number
  duration?: number
  className?: string
  amount?:   number
  once?:     boolean
}

export default function AnimateOnScroll({
  children,
  variants,
  delay    = 0,
  duration,
  className = "",
  amount    = 0.15,
  once      = true,
}: Props) {
  const base = variants ?? fadeUp

  // Build overrides only if needed, preserving original variant types
  const resolved: Variants =
    delay || duration
      ? {
          hidden: base.hidden,
          show: {
            ...((typeof base.show === "object" ? base.show : {}) as object),
            transition: {
              ...(typeof base.show === "object" && "transition" in base.show
                ? (base.show as { transition?: object }).transition ?? {}
                : {}),
              ...(delay    ? { delay    } : {}),
              ...(duration ? { duration } : {}),
            },
          },
        }
      : base

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={resolved}
      className={className}
    >
      {children}
    </motion.div>
  )
}
