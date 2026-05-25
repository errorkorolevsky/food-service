"use client"

import { useRef, useState, useEffect, useCallback } from "react"

interface CursorAwareState {
  x:      number
  y:      number
  active: boolean
  dist:   number
}

const OUTSIDE: CursorAwareState = { x: 0.5, y: 0.5, active: false, dist: 1 }

function isCoarsePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
}

export function useCursorAware<T extends HTMLElement = HTMLDivElement>(
  externalRef?: React.RefObject<T | null>
): { ref: React.RefObject<T | null>; cursor: CursorAwareState; isTouch: boolean } {
  const internalRef = useRef<T>(null)
  const activeRef   = (externalRef ?? internalRef) as React.RefObject<T | null>

  // Stable check — coarse pointer never changes during a session
  const [isTouch]       = useState(isCoarsePointer)
  const [cursor, setCursor] = useState<CursorAwareState>(OUTSIDE)

  const onMove = useCallback((e: MouseEvent) => {
    const el = activeRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nx   = (e.clientX - rect.left) / rect.width
    const ny   = (e.clientY - rect.top)  / rect.height
    const dx   = nx - 0.5
    const dy   = ny - 0.5
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy) * 2, 1)
    setCursor({ x: nx, y: ny, active: true, dist })
  // activeRef is a stable ref object — no need to list in deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onLeave = useCallback(() => setCursor(OUTSIDE), [])

  useEffect(() => {
    // Skip event listener registration on touch devices — mousemove never fires there anyway
    if (isTouch) return
    const el = activeRef.current
    if (!el) return
    el.addEventListener("mousemove",  onMove,  { passive: true })
    el.addEventListener("mouseleave", onLeave, { passive: true })
    return () => {
      el.removeEventListener("mousemove",  onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [isTouch, activeRef, onMove, onLeave])

  return { ref: internalRef, cursor, isTouch }
}
