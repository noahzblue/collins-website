/**
 * The only thing in this feature that knows how a request leaves the browser.
 *
 * It POSTs to `pages/api/quote.ts`, which stores the request and emails it to
 * Collins. That is the whole delivery: there is no WhatsApp or mailto handoff
 * behind it (docs/site-expansion/14 §12), so the result decides between the
 * success panel and the error panel.
 *
 * The endpoint already retries the mail send on the server, so a 4xx/5xx here
 * is final. Only a dropped connection is retried from the browser — a request
 * that reached the server is never sent twice from here.
 */

import type { QuotePayload, SubmitResult } from "./schema";

const ENDPOINT = "/api/quote";

/**
 * `message` is `toMessage()`'s output — the body of the email Collins
 * receives. It rides beside the payload, not inside it: the payload is the
 * versioned record, the message is how a person reads it.
 */
export async function submitQuote(
  payload: QuotePayload,
  message: string,
  retries = 1,
): Promise<SubmitResult> {
  const body = JSON.stringify({ ...payload, message });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      });

      if (!response.ok) {
        return {
          ok: false,
          error: "server",
          message: `${response.status} ${response.statusText}`,
        };
      }

      const ref = await response
        .json()
        .then((data: { ref?: string }) => data?.ref)
        .catch(() => undefined);

      return ref ? { ok: true, ref } : { ok: true };
    } catch (error) {
      if (attempt === retries) {
        return {
          ok: false,
          error: "network",
          message: error instanceof Error ? error.message : undefined,
        };
      }
    }
  }

  // Unreachable — the loop either returns or exhausts its retries above.
  return { ok: false, error: "config" };
}
