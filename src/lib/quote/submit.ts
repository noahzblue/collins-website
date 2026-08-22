/**
 * The only thing in this feature that knows how a request leaves the browser.
 *
 * There is no email/form service yet (todo.md). Rather than leave the client
 * half-built, the whole path is built against this contract and the endpoint
 * is a single environment variable:
 *
 *   PUBLIC_QUOTE_ENDPOINT unset (today)  resolves { ok: true } without a
 *                                        request. The WhatsApp handoff is the
 *                                        whole delivery, exactly as now — no
 *                                        regression, no dead UI.
 *   PUBLIC_QUOTE_ENDPOINT set (later)    it POSTs. Nothing else in the feature
 *                                        changes.
 *
 * This is the one file in `lib/` that reads `import.meta.env` and the one that
 * calls `fetch`, and that is the point: swapping the backend means opening it
 * and nothing else (docs/site-expansion/14 §12, §15.6).
 */

import { flatten } from "./compose";
import type { QuotePayload, SubmitResult } from "./schema";

/** How the endpoint wants the body. Hosted services want flat form fields;
 *  an own endpoint wants the nested JSON. */
type Encoding = "json" | "form";

const ENDPOINT: string = import.meta.env.PUBLIC_QUOTE_ENDPOINT ?? "";

const body = (payload: QuotePayload, encoding: Encoding, message?: string) => {
  if (encoding === "json") {
    return {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    };
  }
  const form = new FormData();
  for (const [key, value] of Object.entries(flatten(payload))) {
    form.append(key, value);
  }
  // Hosted services email the fields as-is; the composed lines are what makes
  // that email readable.
  if (message) form.append("message", message);
  return { headers: undefined, body: form };
};

/**
 * Send the request.
 *
 * `keepalive` matters: the WhatsApp handoff opens in the same gesture and the
 * tab loses focus immediately after, which would otherwise cancel the request
 * in flight.
 *
 * One automatic retry on a network failure, then it gives up and reports. A
 * failed POST behind a successful WhatsApp handoff is the caller's decision to
 * swallow — the enquiry did arrive by another route (docs 14 §12).
 *
 * `message` is `toMessage()`'s output. Pass it with `encoding: "form"` so a
 * hosted service's notification email is readable; the JSON path does not need
 * it, because the payload already carries every field.
 */
export async function submitQuote(
  payload: QuotePayload,
  options: { encoding?: Encoding; retries?: number; message?: string } = {},
): Promise<SubmitResult> {
  if (!ENDPOINT) return { ok: true };

  const { encoding = "json", retries = 1, message } = options;
  const { headers, body: payloadBody } = body(payload, encoding, message);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers,
        body: payloadBody,
        keepalive: true,
      });

      if (!response.ok) {
        // A 4xx/5xx is the server's answer, not a dropped connection —
        // retrying it would only send the same rejected request again.
        return {
          ok: false,
          error: "server",
          message: `${response.status} ${response.statusText}`,
        };
      }

      const ref = await response
        .clone()
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
