import type { Metadata } from "next"
import { META_RU, BASE_URL, buildAlternates } from "@/lib/seo"

export const metadata: Metadata = {
  title:       META_RU.ai.title,
  description: META_RU.ai.description,
  alternates:  buildAlternates("/ai"),
  openGraph: {
    title:       META_RU.ai.title,
    description: "Умный помощник по закупкам для HoReCa бизнеса.",
    url:         `${BASE_URL}/ai`,
    locale:      "ru_RU",
    alternateLocale: ["kk_KZ"],
  },
}

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return children
}
