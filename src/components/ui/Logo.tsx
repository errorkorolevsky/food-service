import Link from "next/link"

type LogoProps = {
  size?: "sm" | "md" | "lg"
  href?: string
  variant?: "default" | "white"
}

export default function Logo({
  size = "md",
  href = "/",
  variant = "default",
}: LogoProps) {

  const iconSize = { sm: 32, md: 40, lg: 52 }[size]
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size]
  const subSize  = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" }[size]

  const isWhite = variant === "white"

  return (
    <Link href={href} className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 min-w-0">

      {/* FSK ICON — rounded square with F lettermark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 group-hover:opacity-90 transition-opacity duration-200"
      >
        {/* Rounded square background */}
        <rect width="80" height="80" rx="18" fill={isWhite ? "rgba(255,255,255,0.15)" : "#005B46"} />
        {/* Inner lighter square (logo detail) */}
        <rect x="8" y="8" width="64" height="64" rx="14" fill={isWhite ? "rgba(255,255,255,0.1)" : "#006B54"} />
        {/* F lettermark — horizontal bars */}
        <rect x="20" y="20" width="38" height="8"  rx="4" fill="white" />
        <rect x="20" y="34" width="28" height="7"  rx="3.5" fill="white" />
        {/* F lettermark — vertical bar */}
        <rect x="20" y="20" width="8"  height="40" rx="4" fill="white" />
      </svg>

      {/* WORDMARK */}
      <div className="leading-none">
        <div className={`
          ${textSize}
          font-bold tracking-tight
          ${isWhite ? "text-white" : "text-fs-graphite"}
          group-hover:opacity-90 transition-opacity duration-200
        `}>
          Food Service
        </div>
        <div className={`
          ${subSize}
          font-semibold tracking-widest uppercase mt-0.5
          hidden sm:block
          ${isWhite ? "text-white/70" : "text-fs-primary"}
        `}>
          Kazakhstan
        </div>
      </div>
    </Link>
  )
}
