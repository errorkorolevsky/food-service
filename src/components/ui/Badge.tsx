type BadgeProps = {
  children:  React.ReactNode
  variant?:  "default" | "success" | "warning" | "gold" | "ai" | "error"
  dot?:      boolean
  className?: string
}

export default function Badge({
  children,
  variant = "default",
  dot = false,
  className = "",
}: BadgeProps) {

  const variants = {
    default: "border-fs-border bg-fs-offwhite text-fs-gray",
    success: "border-green-500/20 bg-green-500/10 text-green-600",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    gold:    "border-fs-gold/30 bg-fs-gold/10 text-fs-gold",
    ai:      "border-purple-500/20 bg-purple-500/10 text-purple-600",
    error:   "border-red-500/20 bg-red-500/10 text-red-500",
  }

  const dotColors = {
    default: "bg-fs-muted",
    success: "bg-green-500",
    warning: "bg-amber-500",
    gold:    "bg-fs-gold",
    ai:      "bg-purple-500",
    error:   "bg-red-500",
  }

  return (
    <div className={`
      inline-flex items-center gap-2
      border rounded-pill
      px-4 py-2
      text-caption font-medium
      ${variants[variant]}
      ${className}
    `}>

      {dot && (
        <span className="relative flex-shrink-0 w-1.5 h-1.5">
          {variant === "success" && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColors[variant]} opacity-60`} />
          )}
          <span className={`relative inline-flex w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
        </span>
      )}

      {children}
    </div>
  )
}
