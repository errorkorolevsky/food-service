"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Product } from "@/types"

type FavoritesStore = {
  ids: string[]
  toggle:    (product: Product) => void
  isFav:     (id: string) => boolean
  products:  Product[]
  addProduct:(product: Product) => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      ids:      [],
      products: [],

      toggle: (product) => {
        const { ids, products } = get()
        if (ids.includes(product.id)) {
          set({
            ids:      ids.filter((id) => id !== product.id),
            products: products.filter((p) => p.id !== product.id),
          })
        } else {
          set({
            ids:      [...ids, product.id],
            products: [...products, product],
          })
        }
      },

      isFav: (id) => get().ids.includes(id),

      addProduct: (product) => {
        const { ids, products } = get()
        if (!ids.includes(product.id)) {
          set({ ids: [...ids, product.id], products: [...products, product] })
        }
      },
    }),
    { name: "fs-favorites" }
  )
)
