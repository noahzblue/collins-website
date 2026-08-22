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
  // `/lab/` is the dev-only component preview harness
  // (docs/site-expansion/14 §15.7). The build is static, so those routes emit
  // HTML whether or not anything links to them — the filter here and the
  // `noindex` prop on Base.astro are what keep them out of the index. Both go
  // when the harness is deleted before launch (see todo.md).
  integrations: [sitemap({ filter: (page) => !page.includes("/lab/") })],

  vite: {
    plugins: [tailwindcss()],
  },
});
