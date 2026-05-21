"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ru } from "./ru"
import { kz } from "./kz"

export type Lang = "ru" | "kz"

interface LangStore {
  lang: Lang
  setLang: (l: Lang) => void
  t: typeof ru
}

export const useLang = create<LangStore>()(
  persist(
    (set) => ({
      lang: "ru",
      t:    ru,
      setLang: (l) => set({ lang: l, t: l === "ru" ? ru : kz }),
    }),
    {
      name:    "fs-lang",
      onRehydrateStorage: () => (state) => {
        if (state) state.t = state.lang === "kz" ? kz : ru
      },
    }
  )
)
