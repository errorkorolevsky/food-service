"use client"

import { create } from "zustand"

type CartUIStore = {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const useCartUI = create<CartUIStore>()((set) => ({
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}))
