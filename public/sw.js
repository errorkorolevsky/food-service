const CACHE = "fs-v3"

// ─── INSTALL ─────────────────────────────────────────────────────────────────

self.addEventListener("install", () => {
  self.skipWaiting()
})

// ─── ACTIVATE — clear every old cache ────────────────────────────────────────

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ─── PUSH ─────────────────────────────────────────────────────────────────────

self.addEventListener("push", (e) => {
  const data = e.data?.json?.() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? "Food Service", {
      body:    data.body  ?? "",
      icon:    data.icon  ?? "/icon-192.png",
      badge:   "/icon-72.png",
      data:    { url: data.url ?? "/" },
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

// ─── FETCH — static public assets only ────────────────────────────────────────
// Navigation requests (HTML) are NEVER intercepted — browser fetches them directly.
// API routes are NEVER intercepted.
// Next.js internal chunks (/_next/) are NEVER intercepted.
// Only /public static files (images, icons, manifest) use cache-first.
// respondWith ALWAYS returns a valid Response — never undefined.

self.addEventListener("fetch", (e) => {
  const url = e.request.url

  if (
    e.request.method  !== "GET"       ||
    e.request.mode    === "navigate"  ||
    !url.startsWith(self.location.origin) ||
    url.includes("/api/")             ||
    url.includes("/_next/")
  ) return

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached
      return fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone()
            caches.open(CACHE).then((c) => c.put(e.request, clone))
          }
          return res
        })
        .catch(() => new Response("", { status: 503 }))
    })
  )
})
