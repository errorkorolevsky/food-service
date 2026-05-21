import { ArrowRight } from "lucide-react"

type SectionTitleProps = {
  title: string
  subtitle?: string
  buttonText?: string
  onButtonClick?: () => void
}

export default function SectionTitle({
  title,
  subtitle,
  buttonText,
  onButtonClick,
}: SectionTitleProps) {
  return (
    <div className="flex items-end justify-between mb-14">

      <div>
        {subtitle && (
          <p className="text-label text-fs-gray uppercase tracking-widest mb-3">
            {subtitle}
          </p>
        )}

        <h2 className="text-heading text-fs-graphite">
          {title}
        </h2>
      </div>

      {buttonText && (
        <button
          onClick={onButtonClick}
          className="
            flex items-center gap-2
            text-fs-gray hover:text-fs-primary
            text-body font-medium
            transition-colors duration-200
            group
          "
        >
          {buttonText}
          <ArrowRight
            size={16}
            strokeWidth={1.5}
            className="group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>
      )}
    </div>
  )
}
