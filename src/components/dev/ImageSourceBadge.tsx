"use client"

/**
 * DEV-ONLY overlay on product cards showing image source + verification status.
 * Rendered only when process.env.NODE_ENV === "development" AND
 * the URL query param ?img_debug=1 is present.
 *
 * Shows:
 *   - Status badge (real_verified / matched_unverified / placeholder / missing)
 *   - Source type (magnum_cdn / openfoodfacts / manufacturer)
 *   - Note if flagged
 */

import { useSearchParams } from "next/navigation"

type ImageStatus = "real_verified" | "matched_unverified" | "placeholder" | "missing"

type Props = {
  productId:   string
  status?:     ImageStatus
  sourceType?: string | null
  sourceName?: string
  note?:       string
}

const STATUS_STYLE: Record<ImageStatus, string> = {
  real_verified:      "bg-green-600 text-white",
  matched_unverified: "bg-amber-500 text-white",
  placeholder:        "bg-gray-500 text-white",
  missing:            "bg-red-600 text-white",
}

const STATUS_LABEL: Record<ImageStatus, string> = {
  real_verified:      "✓ verified",
  matched_unverified: "~ unverified",
  placeholder:        "○ placeholder",
  missing:            "✗ missing",
}

export default function ImageSourceBadge({ productId, status, sourceType, sourceName, note }: Props) {
  const params = useSearchParams()

  if (process.env.NODE_ENV !== "development") return null
  if (params?.get("img_debug") !== "1") return null

  const effectiveStatus: ImageStatus = status ?? "placeholder"

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none p-1.5">
      <div className="rounded-lg overflow-hidden text-[9px] font-mono leading-tight bg-black/80 backdrop-blur-sm">
        <div className={`px-2 py-0.5 font-bold ${STATUS_STYLE[effectiveStatus]}`}>
          {STATUS_LABEL[effectiveStatus]}
        </div>
        {sourceType && (
          <div className="px-2 py-0.5 text-gray-300">
            {sourceType.replace("_", " ")}
          </div>
        )}
        {sourceName && (
          <div className="px-2 py-0.5 text-gray-400 truncate max-w-full">
            {sourceName.slice(0, 35)}
          </div>
        )}
        {note && (
          <div className="px-2 py-0.5 text-red-300 truncate">
            ⚠ {note.slice(0, 40)}
          </div>
        )}
      </div>
    </div>
  )
}
