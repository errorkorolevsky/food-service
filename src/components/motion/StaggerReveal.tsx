"use client"

import { motion, type Variants } from "framer-motion"
import { staggerChild } from "@/lib/animations"

type ContainerProps = {
  children:   React.ReactNode
  className?: string
  stagger?:   number
  delay?:     number
  amount?:    number
}

export default function StaggerReveal({
  children,
  className = "",
  stagger   = 0.08,
  delay     = 0.1,
  amount    = 0.1,
}: ContainerProps) {
  const container: Variants = {
    hidden: {},
    show:   { transition: { staggerChildren: stagger, delayChildren: delay } },
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={container}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerChild({
  children,
  className = "",
  variants,
}: {
  children:   React.ReactNode
  className?: string
  variants?:  Variants
}) {
  return (
    <motion.div variants={variants ?? staggerChild} className={className}>
      {children}
    </motion.div>
  )
}
