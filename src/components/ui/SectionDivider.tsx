type Variant = "green" | "warm" | "neutral"

const gradients: Record<Variant, string> = {
  green:   "from-transparent via-[rgba(0,91,70,0.45)] to-transparent",
  warm:    "from-transparent via-[rgba(245,158,11,0.45)] to-transparent",
  neutral: "from-transparent via-[rgba(107,114,128,0.30)] to-transparent",
}

export default function SectionDivider({ variant = "green" }: { variant?: Variant }) {
  return (
    <div className={`h-[2px] bg-gradient-to-r ${gradients[variant]}`} />
  )
}
