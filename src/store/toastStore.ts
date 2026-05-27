"use client"

import { create } from "zustand"

type ToastStore = {
  message:     string
  emoji:       string
  visible:     boolean
  actionLabel: string
  onAction:    (() => void) | null
  show: (message: string, emoji: string, opts?: { actionLabel?: string; onAction?: () => void }) => void
  hide: () => void
}

let timer: ReturnType<typeof setTimeout>

export const useToastStore = create<ToastStore>((set) => ({
  message:     "",
  emoji:       "",
  visible:     false,
  actionLabel: "",
  onAction:    null,

  show: (message, emoji, opts) => {
    clearTimeout(timer)
    set({ message, emoji, visible: true, actionLabel: opts?.actionLabel ?? "", onAction: opts?.onAction ?? null })
    timer = setTimeout(() => set({ visible: false }), 2500)
  },

  hide: () => {
    clearTimeout(timer)
    set({ visible: false })
  },
}))
