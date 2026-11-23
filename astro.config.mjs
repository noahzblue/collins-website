// @ts-check
import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // No `output` — Astro's default is `static`, so every page is prerendered to
  // HTML at build time. Keep it that way. The adapter exists for one route:
  // `src/pages/api/quote.ts` opts out with `prerender = false` and runs as a
  // Vercel function, because sending mail needs a server and SMTP credentials
  // must never reach the browser.
  // `maxDuration` is the function's hard time limit in seconds. `lib/mail.ts`
  // stops retrying at 20s, so the platform never cuts a send.
  adapter: vercel({ maxDuration: 30 }),

  // Read at request time, never inlined into the bundle. All optional so the
  // site still builds without them; the endpoint answers 500 until they are
  // set (in Vercel: Project → Settings → Environment Variables).
  env: {
    schema: {
      SMTP_HOST: envField.string({
        context: "server",
        access: "secret",
        default: "smtpout.secureserver.net", // GoDaddy Professional Email
      }),
      SMTP_PORT: envField.number({
        context: "server",
        access: "secret",
        default: 465,
      }),
      SMTP_USER: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      SMTP_PASSWORD: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      // Postgres connection string: Neon in production, db/compose.yml
      // locally. Every quote request is stored here before it is emailed
      // (db/migrations). Unset, requests are emailed but not kept.
      DATABASE_URL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      // Where quote requests land. Comma-separated for more than one.
      // Unset, they go to `site.email`.
      QUOTE_TO_EMAIL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },

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
