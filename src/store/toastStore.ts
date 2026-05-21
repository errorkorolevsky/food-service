"use client"

import { create } from "zustand"

type ToastStore = {
  message:   string
  emoji:     string
  visible:   boolean
  show: (message: string, emoji: string) => void
  hide: () => void
}

let timer: ReturnType<typeof setTimeout>

export const useToastStore = create<ToastStore>((set) => ({
  message: "",
  emoji:   "",
  visible: false,

  show: (message, emoji) => {
    clearTimeout(timer)
    set({ message, emoji, visible: true })
    timer = setTimeout(() => set({ visible: false }), 2500)
  },

  hide: () => {
    clearTimeout(timer)
    set({ visible: false })
  },
}))
