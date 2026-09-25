/* Minimal SW so Chrome treats the app as installable. */
const CACHE = "earn-pk-v1";
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/icon-192.png", "/icon-512.png"]).catch(() => {})));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  // Network-first; offline fallback to cache for navigations only
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/") || caches.match(event.request)),
    );
  }
});
