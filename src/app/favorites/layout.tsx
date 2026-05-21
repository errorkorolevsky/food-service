import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Избранное — Food Service",
  description: "Ваши избранные товары в Food Service HoReCa платформе.",
  robots: { index: false, follow: false },
}

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children
}
