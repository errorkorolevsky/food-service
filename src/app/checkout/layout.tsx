import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Оформление заказа — Food Service",
  description: "Оформите заказ на доставку свежих продуктов на дом по Шымкенту — быстро и удобно.",
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
