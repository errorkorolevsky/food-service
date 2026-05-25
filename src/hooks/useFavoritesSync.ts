"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useFavoritesStore } from "@/store/favoritesStore"
import type { Product } from "@/types"

export function useFavoritesSync() {
  const { data: session } = useSession()
  const email     = session?.user?.email ?? null
  const addProduct = useFavoritesStore((state) => state.addProduct)
  const synced     = useRef(false)

  // On login: pull favorites from Supabase and merge into local store
  useEffect(() => {
    if (!email || synced.current) return
    synced.current = true

    fetch("/api/favorites")
      .then((r) => r.ok ? r.json() : [])
      .then((data: Product[]) => {
        if (Array.isArray(data)) data.forEach((p) => addProduct(p))
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [email, addProduct])

  // Reset sync flag on logout so next login re-syncs
  useEffect(() => {
    if (!email) synced.current = false
  }, [email])
}

// Wrapper: toggle favorite + sync to Supabase if logged in
export async function syncFavoriteToggle(
  product: Product,
  isCurrentlyFav: boolean,
  userEmail: string | null | undefined,
) {
  if (!userEmail) return
  try {
    if (isCurrentlyFav) {
      await fetch(`/api/favorites?id=${encodeURIComponent(product.id)}`, { method: "DELETE" })
    } else {
      await fetch("/api/favorites", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(product),
      })
    }
  } catch {
    // Silent — local store already updated optimistically
  }
}
