"use client"

import { create } from "zustand"

export type QuickViewProduct = {
  id:              string
  category:        string
  title:           string
  description:     string
  price:           string
  priceNum:        number
  oldPriceNum?:    number
  discountPercent?: number
  unit?:           string
  rating?:         string
  emoji:           string
  image?:          string
  isNew?:          boolean
  isHit?:          boolean
  inStock?:        boolean
}

type QuickViewStore = {
  product: QuickViewProduct | null
  open:    (p: QuickViewProduct) => void
  close:   () => void
}

export const useQuickViewStore = create<QuickViewStore>()((set) => ({
  product: null,
  open:    (p) => set({ product: p }),
  close:   ()  => set({ product: null }),
}))
