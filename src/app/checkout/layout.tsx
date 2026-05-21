import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Оформление заказа — Food Service",
  description: "Оформите заказ на доставку HoReCa продуктов и ингредиентов для вашего ресторана или кофейни.",
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
