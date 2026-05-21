import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Ассистент — Food Service",
  description: "AI-powered procurement assistant для HoReCa. Умные рекомендации по закупкам, ценам и ассортименту для ресторанов и кофеен Шымкента.",
  openGraph: {
    title: "AI Ассистент — Food Service",
    description: "Умный помощник по закупкам для HoReCa бизнеса.",
  },
}

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return children
}
