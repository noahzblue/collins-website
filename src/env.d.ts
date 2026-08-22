/// <reference types="astro/client" />

/**
 * Public environment variables. `PUBLIC_` is Astro's prefix for values that
 * are safe to inline into the client bundle.
 *
 * `PUBLIC_QUOTE_ENDPOINT` — where the quote form POSTs. Unset today, which is
 * the supported state: `lib/quote/submit.ts` resolves `{ ok: true }` without a
 * request and the WhatsApp handoff carries the enquiry
 * (docs/site-expansion/14 §12).
 */
interface ImportMetaEnv {
  readonly PUBLIC_QUOTE_ENDPOINT?: string;
}
