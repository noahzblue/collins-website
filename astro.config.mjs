// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // No adapter and no `output` — Astro's default is `static`, so every route
  // is prerendered to HTML at build time. Keep it that way.

  // Required by the sitemap integration and by Base.astro's canonical URLs.
  // Keep it in step with `site.url` in src/config/site.ts.
  site: "https://www.collinscouae.com",

  // Links are fetched before they're clicked, so the client router has the
  // next page in cache and navigation costs no round trip. The page transition
  // (styles/global.css) depends on this: a ~290ms fade is only honest if the
  // next page is already in memory when the fade ends.
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },

  // 30+ pages after the site expansion — a sitemap stops being optional.
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
