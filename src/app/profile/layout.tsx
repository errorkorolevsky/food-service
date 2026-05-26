import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Профиль — Food Service",
  description: "Ваш профиль, история заказов и избранные товары в Food Service Kazakhstan.",
  robots: { index: false, follow: false },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
