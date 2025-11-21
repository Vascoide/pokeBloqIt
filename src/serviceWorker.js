// In production you'd use Workbox build-time to precache assets.
// Minimal runtime caching:
self.addEventListener("install", (evt) => {
  self.skipWaiting();
});
self.addEventListener("activate", (evt) => {
  clients.claim();
});
self.addEventListener("fetch", (evt) => {
  const url = new URL(evt.request.url);
  // cache API responses for GET requests to pokeapi.co
  if (url.host.includes("pokeapi.co")) {
    evt.respondWith(
      caches.open("pokeapi-v1").then(async (cache) => {
        const cached = await cache.match(evt.request);
        if (cached) return cached;
        try {
          const res = await fetch(evt.request);
          if (res && res.ok) cache.put(evt.request, res.clone());
          return res;
        } catch (err) {
          return cached || new Response(null, { status: 503 });
        }
      })
    );
  }
});
