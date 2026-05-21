type CardProps = {
  children: React.ReactNode
  className?: string
  variant?: "default" | "elevated" | "glass"
  padding?: "none" | "sm" | "md" | "lg"
}

export default function Card({
  children,
  className = "",
  variant = "default",
  padding = "none",
}: CardProps) {

  const variants = {
    default:  "bg-white border border-fs-border",
    elevated: "bg-white border border-fs-border shadow-card",
    glass:    "fs-glass",
  }

  const paddings = {
    none: "",
    sm:   "p-5",
    md:   "p-7",
    lg:   "p-10",
  }

  return (
    <div className={`
      rounded-xl
      ${variants[variant]}
      ${paddings[padding]}
      ${className}
    `}>
      {children}
    </div>
  )
}
