import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Войти — Food Service",
  description: "Войдите через Google для доступа к истории заказов, AI рекомендациям и персонализированному каталогу.",
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
