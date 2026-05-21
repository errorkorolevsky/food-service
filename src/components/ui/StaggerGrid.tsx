"use client"

import { motion } from "framer-motion"

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren:  0.07,
      delayChildren:    0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)", scale: 0.97 },
  show:   {
    opacity: 1,
    y:       0,
    filter:  "blur(0px)",
    scale:   1,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] },
  },
}

type StaggerGridProps = {
  children:  React.ReactNode
  className?: string
  // pass-through to the container div
  style?: React.CSSProperties
}

/**
 * Wraps a grid of items so they animate in as a staggered cascade
 * the moment the container enters the viewport.
 *
 * Usage — replace bare <div className="grid ..."> with:
 *   <StaggerGrid className="grid grid-cols-...">
 *     {items.map(i => <StaggerGrid.Item key={i.id}>...</StaggerGrid.Item>)}
 *   </StaggerGrid>
 */
export function StaggerGrid({ children, className = "", style }: StaggerGridProps) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = "",
}: {
  children:  React.ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  )
}
