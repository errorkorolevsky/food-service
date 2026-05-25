"use client"

import { useFavoritesSync } from "@/hooks/useFavoritesSync"

export default function FavoritesSync() {
  useFavoritesSync()
  return null
}
