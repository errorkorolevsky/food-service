"use client"

import { useEffect } from "react"
import { useLang } from "@/locales"

// Syncs the Zustand lang state (localStorage) → <html lang="..."> after hydration.
// kz locale maps to BCP-47 "kk" (Kazakh language code, not "kz" country code).
export default function LangHtmlSync() {
  const lang = useLang((s) => s.lang)
  useEffect(() => {
    document.documentElement.lang = lang === "kz" ? "kk" : "ru"
  }, [lang])
  return null
}
