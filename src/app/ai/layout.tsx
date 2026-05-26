import type { Metadata } from "next"
import { META_RU, BASE_URL, buildAlternates } from "@/lib/seo"

export const metadata: Metadata = {
  title:       META_RU.ai.title,
  description: META_RU.ai.description,
  alternates:  buildAlternates("/ai"),
  openGraph: {
    title:       META_RU.ai.title,
    description: "AI ассистент Food Service — подбор продуктов, рекомендации и ответы на вопросы о каталоге.",
    url:         `${BASE_URL}/ai`,
    locale:      "ru_RU",
    alternateLocale: ["kk_KZ"],
  },
}

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return children
}
