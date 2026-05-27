const CACHE = "fs-v2"

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

// ─── PUSH ─────────────────────────────────────────────────────────────────────

self.addEventListener("push", (e) => {
  const data = e.data?.json?.() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? "Food Service", {
      body:  data.body  ?? "",
      icon:  data.icon  ?? "/icon-192.png",
      badge: "/icon-72.png",
      data:  { url: data.url ?? "/" },
      vibrate: [100, 50, 100],
    })
  )
})

self.addEventListener("notificationclick", (e) => {
  e.notification.close()
  const url = e.notification.data?.url ?? "/"
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
      const existing = cs.find((c) => c.url === url && "focus" in c)
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
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
