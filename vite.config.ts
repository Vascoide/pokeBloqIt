import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "PokéBloqIt",
        short_name: "PokéBloqIt",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb", // tailwind blue-600
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],

        runtimeCaching: [
          // Cache PokeAPI calls
          {
            urlPattern: /^https:\/\/pokeapi\.co\/api\/v2\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "pokeapi-cache",
              expiration: { maxEntries: 200 },
            },
          },

          // Cache sprites & images
          {
            urlPattern: /^https:\/\/raw.githubusercontent.com\/PokeAPI/,
            handler: "CacheFirst",
            options: {
              cacheName: "sprite-cache",
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
});
