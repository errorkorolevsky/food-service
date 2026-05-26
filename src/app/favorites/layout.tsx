import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Избранное — Food Service",
  description: "Ваши избранные товары — быстрый доступ к сохранённым продуктам в Food Service.",
  robots: { index: false, follow: false },
}

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children
}
