// Cache names (version these when behavior changes)
const API_CACHE = "pokeapi-v1";
const IMAGE_CACHE = "pokemon-images-v1";

// Install immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Take control of existing clients
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  /* ---------------- PokéAPI JSON ---------------- */
  if (url.hostname.includes("pokeapi.co")) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;

        try {
          const res = await fetch(req);
          if (res && res.ok) {
            cache.put(req, res.clone());
          }
          return res;
        } catch {
          return cached || new Response(null, { status: 503 });
        }
      })
    );
    return;
  }

  /* ---------------- Pokémon Sprites ---------------- */
  // examples:
  // https://raw.githubusercontent.com/PokeAPI/sprites/...
  // https://img.pokemondb.net/sprites/...
  if (
    url.hostname.includes("raw.githubusercontent.com") ||
    url.hostname.includes("pokemondb.net")
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;

        try {
          const res = await fetch(req);
          if (res && res.ok) {
            cache.put(req, res.clone());
          }
          return res;
        } catch {
          return cached || new Response(null, { status: 404 });
        }
      })
    );
    return;
  }
});
