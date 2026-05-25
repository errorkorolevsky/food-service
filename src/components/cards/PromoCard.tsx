"use client"

import { motion } from "framer-motion"

type PromoCardProps = {
  title: string
  subtitle: string
  emoji: string
}

export default function PromoCard({
  title,
  subtitle,
  emoji,
}: PromoCardProps) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="
        bg-fs-white border border-fs-border rounded-xl
        px-5 py-4
        flex items-center justify-between
        hover:border-fs-primary/30 transition-colors duration-200
        shadow-sm
      "
    >
      <div>
        <h3 className="text-body font-bold text-fs-graphite">
          {title}
        </h3>

        <p className="text-caption text-fs-gray mt-0.5">
          {subtitle}
        </p>
      </div>

      <span className="text-2xl flex-shrink-0 ml-4">
        {emoji}
      </span>
    </motion.div>
  )
}
