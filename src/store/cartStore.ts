"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { CartItem } from "@/types"

export type { CartItem }

type CartStore = {
  items: CartItem[]

  addItem: (
    item: Omit<CartItem, "quantity">
  ) => void

  removeItem: (id: string) => void

  increaseQuantity: (id: string) => void

  decreaseQuantity: (id: string) => void

  setItemNote: (id: string, note: string) => void

  clearCart: () => void

  getTotalPrice: () => number

  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existingItem = get().items.find(
          (i) => i.id === item.id
        )

        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    quantity: i.quantity + 1,
                  }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...get().items,
              {
                ...item,
                quantity: 1,
              },
            ],
          })
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter(
            (item) => item.id !== id
          ),
        })
      },

      increaseQuantity: (id) => {
        set({
          items: get().items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item
          ),
        })
      },

      decreaseQuantity: (id) => {
        set({
          items: get().items
            .map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item
            )
            .filter((item) => item.quantity > 0),
        })
      },

      setItemNote: (id, note) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, note: note.trim() || undefined } : item
          ),
        })
      },

      clearCart: () => {
        set({
          items: [],
        })
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) =>
            total + item.price * item.quantity,
          0
        )
      },

      getTotalItems: () => {
        return get().items.reduce(
          (total, item) =>
            total + item.quantity,
          0
        )
      },
    }),
    {
      name: "fs-cart",
      merge(persisted, current) {
        const p = persisted as typeof current
        return {
          ...current,
          items: Array.isArray(p?.items)
            ? p.items.filter(
                (i) =>
                  i &&
                  typeof i.id       === "string" &&
                  typeof i.title    === "string" &&
                  typeof i.price    === "number" &&
                  typeof i.quantity === "number" && i.quantity > 0 &&
                  typeof i.emoji    === "string"
              )
            : [],
        }
      },
    }
  )
)