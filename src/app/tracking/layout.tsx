import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Отслеживание заказа — Food Service",
  description: "Отслеживайте статус вашего заказа в режиме реального времени. Введите номер заказа или телефон.",
  openGraph: {
    title: "Отслеживание заказа — Food Service",
    description: "Live-трекинг статуса заказа для клиентов Food Service.",
  },
}

export default function TrackingLayout({ children }: { children: React.ReactNode }) {
  return children
}
