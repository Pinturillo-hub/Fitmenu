/**
 * Service worker for the static export served from /Fitmenu/.
 *
 * - Navigations are network-first so a new deploy is picked up, with the
 *   cached shell as the offline fallback.
 * - Static assets are stale-while-revalidate, which keeps repeat launches fast
 *   without pinning old hashed files forever.
 *
 * Bump CACHE when the caching strategy or precache list changes.
 */
const BASE = '/Fitmenu/'
const CACHE = 'fitmenu-v2'
const PRECACHE = [
  BASE,
  `${BASE}manifest.webmanifest`,
  `${BASE}pwa-192.png`,
  `${BASE}pwa-512.png`,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          PRECACHE.map((url) => cache.add(url).catch(() => undefined))
        )
      )
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // A proxy or hosting error is not a usable page: fall back to the
          // cached shell instead of replacing it with the error document.
          if (!response.ok) throw new Error(`Navigation failed: ${response.status}`)
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(BASE, copy))
          return response
        })
        .catch(async () => {
          return (await caches.match(request)) || (await caches.match(BASE)) || Response.error()
        })
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached || Response.error())

      return cached || network
    })
  )
})
