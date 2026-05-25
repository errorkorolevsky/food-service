"use client"

import { useEffect, useState } from "react"

const KEY    = "fs-recently-viewed"
const MAX    = 8

type Stub = { id: string; title: string; emoji: string; price: string; category: string; image?: string }

function load(): Stub[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Stub[]) : []
  } catch {
    return []
  }
}

function save(items: Stub[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)) } catch {}
}

export function useRecentlyViewed(current?: Stub): Stub[] {
  const [items, setItems] = useState<Stub[]>([])

  useEffect(() => {
    const stored = load()
    if (current) {
      const filtered = stored.filter((i) => i.id !== current.id)
      const updated  = [current, ...filtered].slice(0, MAX)
      save(updated)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(updated.filter((i) => i.id !== current.id).slice(0, 6))
    } else {
      setItems(stored.slice(0, 6))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id])

  return items
}
