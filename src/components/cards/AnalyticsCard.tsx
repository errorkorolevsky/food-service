type AnalyticsCardProps = {
  title: string
  subtitle: string
  value: string
  valueColor?: string
}

export default function AnalyticsCard({
  title,
  subtitle,
  value,
  valueColor = "text-white",
}: AnalyticsCardProps) {
  return (
    <div className="
      bg-white/10 border border-white/15 rounded-xl
      p-6
      flex items-center justify-between
    ">
      <div>
        <h4 className="text-body font-bold text-white">
          {title}
        </h4>
        <p className="text-caption text-white/55 mt-1">
          {subtitle}
        </p>
      </div>

      <span className={`text-title font-black flex-shrink-0 ml-4 ${valueColor}`}>
        {value}
      </span>
    </div>
  )
}
