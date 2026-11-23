/// <reference types="astro/client" />

/*
 * No public environment variables. The quote form posts to `/api/quote`, and
 * its settings (SMTP, recipients, database) are server secrets declared in
 * `astro.config.mjs` `env` and read through `astro:env/server`. The full list
 * is in `.env.example`.
 */
