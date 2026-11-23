/**
 * POST /api/quote — stores one quote request and emails it to Collins.
 *
 * The only route on the site that is not prerendered; it runs as a Vercel
 * function. The browser side is `lib/quote/submit.ts`, which posts here.
 *
 * Nothing in the body is trusted. In order:
 *   1. POST only (405), `content-type: application/json` only (415), at most
 *      `MAX_BODY_BYTES` (413), parseable JSON (400).
 *   2. Honeypot: a filled `website` field answers 200 `{ ok: true }` and
 *      stops — no row, no email, nothing a bot can learn from.
 *   3. `parseQuote` rebuilds the payload against the option lists and the
 *      catalogue, or answers 400 (`lib/quote/parse.ts`).
 *   4. Rate limit: at most `RATE.max` stored requests per sender in
 *      `RATE.minutes`, counted in Postgres by a SHA-256 of the address (the
 *      raw IP is never stored). Past it, 429. With no database it allows.
 *   5. Save the request as 'pending', with the server's own text of it.
 *   6. Email it — built here from the parsed payload, never from the
 *      client's `message`, which is accepted and ignored so an older client
 *      keeps working. `sendMail` retries a transient SMTP failure inside a
 *      20s budget so Vercel's 30s limit never cuts it off mid-send.
 *   7. Mark the row 'sent' or 'failed' and answer 200 (with a short `ref`
 *      when stored) or 502 so the browser keeps the form filled in. A row the
 *      function dies before marking stays 'pending' — still findable.
 *
 * The sender's address comes from `x-forwarded-for` (first entry) or
 * `x-real-ip`. On Vercel both are set by the platform, not the client; on any
 * host that passes them through unchanged they are spoofable, and the limit
 * is a speed bump, not a wall.
 */

import type { APIRoute } from "astro";
import { QUOTE_TO_EMAIL } from "astro:env/server";
import { site } from "@/config/site";
import { SendError, mailConfigured, sendMail } from "@/lib/mail";
import { refOf, toEmail, toText } from "@/lib/quote/email";
import { MAX_BODY_BYTES, isSpam, parseQuote } from "@/lib/quote/parse";
import { recentFrom, recordOutcome, saveRequest } from "@/lib/quote/store";

export const prerender = false;

/** Generous for a person — five real requests in ten minutes is a lot. */
const RATE = { max: 5, minutes: 10 };

const json = (
  status: number,
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

/** The sender's address, as the platform reports it. */
function clientIp(request: Request, fallback: () => string): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const ip = forwarded?.trim() || request.headers.get("x-real-ip")?.trim();
  if (ip) return ip;
  try {
    return fallback() || null;
  } catch {
    return null;
  }
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(`collins-quote:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export const ALL: APIRoute = () =>
  json(405, { ok: false, error: "method" }, { allow: "POST" });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const type = request.headers.get("content-type") ?? "";
  if (!/^application\/json\s*(;|$)/i.test(type)) {
    return json(415, { ok: false, error: "type" });
  }
  const declared = Number(request.headers.get("content-length"));
  if (declared > MAX_BODY_BYTES) return json(413, { ok: false, error: "size" });
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return json(413, { ok: false, error: "size" });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, error: "invalid" });
  }

  if (isSpam(body)) return json(200, { ok: true });

  const parsed = parseQuote(body, new Date());
  if (!parsed.ok) {
    // The field and reason, never the value — a log line is not a place
    // for a stranger's text.
    console.warn(`[quote] rejected: ${parsed.field} (${parsed.reason})`);
    return json(400, { ok: false, error: "invalid", field: parsed.field });
  }
  const payload = parsed.payload;

  const ip = clientIp(request, () => clientAddress);
  const ipHash = ip ? await sha256(ip) : null;
  if (ipHash && (await recentFrom(ipHash, RATE.minutes)) >= RATE.max) {
    return json(
      429,
      { ok: false, error: "rate" },
      { "retry-after": String(RATE.minutes * 60) },
    );
  }

  const to = (QUOTE_TO_EMAIL ?? site.email)
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  const message = toText(payload);
  const id = await saveRequest(payload, message, ipHash);
  const mail = toEmail(payload, { id });

  try {
    // Checked after saving, so a missing setting still keeps the request.
    if (!mailConfigured())
      throw new SendError("SMTP_USER / SMTP_PASSWORD are not set", 0);
    const sent = await sendMail({
      ...mail,
      to,
      fromName: `${site.name} website`,
    });
    await recordOutcome(id, { sent: true, ...sent });
    return json(200, id ? { ok: true, ref: refOf(id) } : { ok: true });
  } catch (error) {
    const reason = (error as Error)?.message ?? String(error);
    const attempts = error instanceof SendError ? error.attempts : 0;
    await recordOutcome(id, { sent: false, error: reason, attempts });
    console.error(
      `[quote] send failed after ${attempts} attempt(s): ${reason}`,
      id
        ? `\nstored as quote_requests.id = ${id}`
        : `\nNOT stored — recover by hand:\n${message}`,
    );
    return json(502, { ok: false, error: "server" });
  }
};
