type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

export function rateLimit(
  key:      string,
  limit:    number,
  windowMs: number,
): boolean {
  const now   = Date.now()
  const entry = store.get(key)

  // Lazy eviction — prevent unbounded growth
  if (store.size > 5_000) {
    for (const [k, v] of store) {
      if (v.resetAt <= now) store.delete(k)
    }
  }

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

export function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for")
  return xff ? xff.split(",")[0].trim() : "unknown"
}
