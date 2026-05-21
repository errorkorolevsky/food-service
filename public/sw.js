const CACHE = "fs-v1"

const PRECACHE = [
  "/",
  "/catalog",
  "/manifest.json",
]

// ─── INSTALL ─────────────────────────────────────────────────────────────────

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

// ─── ACTIVATE ────────────────────────────────────────────────────────────────

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ─── FETCH — network first, cache fallback ────────────────────────────────────

self.addEventListener("fetch", (e) => {
  // Только GET, только same-origin, не API
  if (
    e.request.method !== "GET" ||
    !e.request.url.startsWith(self.location.origin) ||
    e.request.url.includes("/api/")
  ) return

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((cache) => cache.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
