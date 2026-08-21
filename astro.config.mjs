// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // No adapter and no `output` — Astro's default is `static`, so every route
  // is prerendered to HTML at build time. Keep it that way.

  // Links are fetched before they're clicked, so the client router has the
  // next page in cache and navigation costs no round trip.
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },

  vite: {
    plugins: [tailwindcss()],
  },
});
