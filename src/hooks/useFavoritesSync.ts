"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useFavoritesStore } from "@/store/favoritesStore"
import type { Product } from "@/types"

// Module-level email ref — set by FavoritesSync, read by syncFavoriteToggle
// This avoids calling useSession() in deeply-nested client components
let _currentEmail: string | null = null

export function setCurrentEmail(email: string | null) {
  _currentEmail = email
}

export function useFavoritesSync() {
  const { data: session } = useSession() ?? {}
  const email     = session?.user?.email ?? null
  const addProduct = useFavoritesStore((state) => state.addProduct)
  const synced     = useRef(false)

  // Keep module-level ref in sync with session
  useEffect(() => {
    setCurrentEmail(email)
  }, [email])

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

// Sync favorite toggle to Supabase — uses module-level email (no hook needed)
export async function syncFavoriteToggle(product: Product, isCurrentlyFav: boolean) {
  if (!_currentEmail) return
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
