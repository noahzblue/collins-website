/**
 * The server's own reading of a quote request. Pure — no I/O, no astro:env.
 *
 * The browser validates the form (`validate.ts`) and builds the payload
 * (`compose.ts`), but anything can POST to `/api/quote`, so nothing the
 * browser sends is trusted. `parseQuote()` takes the raw JSON body and either
 * rebuilds a `QuotePayload` from scratch or says why it would not.
 *
 * What "rebuilds" means here:
 *   - Every enum (mode, duration, emirate, …) must be a `value` in the same
 *     option list the form renders from (`options.ts`).
 *   - The category must exist in `categories.json`, and its name comes from
 *     there, not from the client. Same for the rating: the label must be one of
 *     that category's ranges, and its power type and availability are copied
 *     from the catalogue — a client cannot mark a size "in yard".
 *   - Strings are capped, stripped of control and bidi-override characters,
 *     and single-line fields may not contain a line break at all (so nothing
 *     typed can reach a mail header).
 *   - Terms that belong to the other mode are dropped. The form ships
 *     defaults for both modes (`transport: "deliver"`, `destination: "uae"`),
 *     so their presence is not an error — they are simply not this request.
 *   - `submittedAt` is the server's clock, passed in as `now`. The client's
 *     timestamp is not evidence of anything.
 *
 * Unknown top-level keys are ignored, not rejected, and they never reach the
 * stored payload because it is rebuilt field by field. That keeps a client
 * that adds a field from failing every request before the server learns it,
 * and costs nothing: an ignored key cannot be stored or emailed. `message`
 * (the old client's pre-composed email) is one of them — the server writes
 * its own, in `email.ts`.
 *
 * `website` is the honeypot. `isSpam()` checks it before anything else, so a
 * bot gets a 200 and nothing is stored or sent.
 */

import categories from "@/content/equipment/categories.json";
import type { Availability } from "@/lib/equipment";
import {
  CHANNELS,
  CONDITIONS,
  DESTINATIONS,
  DURATIONS,
  EMIRATES,
  MODES,
  TIMEFRAMES,
  TRANSPORT,
  type Option,
} from "./options";
import {
  PAYLOAD_VERSION,
  type Channel,
  type QuoteMode,
  type QuotePayload,
  type QuoteVariant,
} from "./schema";

/** A real request is a few KB; anything far larger is not one. */
export const MAX_BODY_BYTES = 32_000;

/** Per-field length caps, in characters, after trimming. */
export const LIMITS = {
  name: 100,
  company: 120,
  phone: 32,
  email: 254,
  otherItem: 200,
  duty: 2000,
  attachments: 300,
  notes: 4000,
  page: 300,
} as const;

/** The honeypot's body key. Empty for a person; a bot fills every field. */
export const HONEYPOT_FIELD = "website";

export type ParseResult =
  | { ok: true; payload: QuotePayload }
  | { ok: false; field: string; reason: string };

/** Thrown inside the parser, caught once at the top. */
class Invalid extends Error {
  constructor(
    readonly field: string,
    readonly reason: string,
  ) {
    super(`${field}: ${reason}`);
  }
}

const fail = (field: string, reason: string): never => {
  throw new Invalid(field, reason);
};

/* ── Text ───────────────────────────────────────────────────────── */

/* C0 controls except tab and line feed, DEL, C1 controls, and the Unicode
   bidi overrides/isolates that can make an email line read backwards. */
const CONTROL =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const LINE_BREAK = /[\r\n\u2028\u2029\u0085]/;

/** Normalises newlines, strips control characters, trims. */
export const clean = (value: string) =>
  value.replace(/\r\n?/g, "\n").replace(CONTROL, "").trim();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * A string field. `null`/absent/blank → null unless `required`.
 * `multiline` fields keep line feeds; every other field rejects a line break.
 */
function text(
  value: unknown,
  field: string,
  max: number,
  opts: { required?: boolean; multiline?: boolean } = {},
): string | null {
  if (value === undefined || value === null) {
    return opts.required ? fail(field, "required") : null;
  }
  if (typeof value !== "string") return fail(field, "not a string");
  // Checked before cleaning, so a line break cannot be "cleaned" into a pass.
  if (!opts.multiline && LINE_BREAK.test(value.trim())) {
    return fail(field, "line break in a single-line field");
  }
  const out = clean(value);
  if (out === "") return opts.required ? fail(field, "required") : null;
  if (out.length > max) return fail(field, `longer than ${max} characters`);
  return out;
}

/** An option `value`, or null. */
function choice(
  value: unknown,
  field: string,
  options: Option[],
  required = false,
): string | null {
  if (value === undefined || value === null || value === "") {
    return required ? fail(field, "required") : null;
  }
  if (typeof value !== "string" || !options.some((o) => o.value === value)) {
    return fail(field, "not one of the options");
  }
  return value;
}

/* ── Specific shapes ────────────────────────────────────────────── */

/* Plain enough to reject anything a mail header or a link would mind: no
   spaces, quotes, angle brackets, commas or semicolons anywhere. */
const EMAIL = /^[^\s@<>()[\]\\",;:]+@[^\s@<>()[\]\\",;:]+\.[A-Za-z]{2,}$/;
const PHONE_CHARS = /^\+?[0-9 ()\-.]+$/;
/* A same-site path: one leading slash, never two (that is a host), and only
   URL path/query/fragment characters — no spaces, no backslashes, no scheme. */
const PAGE = /^\/(?![/\\])[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#]*$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function phone(value: unknown): string {
  const out = text(value, "contact.phone", LIMITS.phone, { required: true })!;
  if (!PHONE_CHARS.test(out)) return fail("contact.phone", "bad characters");
  const digits = out.replace(/\D/g, "").length;
  if (digits < 7 || digits > 20) return fail("contact.phone", "7–20 digits");
  return out.replace(/\s+/g, " ");
}

function email(value: unknown): string | null {
  const out = text(value, "contact.email", LIMITS.email);
  if (out !== null && !EMAIL.test(out)) return fail("contact.email", "format");
  return out;
}

/** `YYYY-MM-DD`, a real calendar day, within a sane window of `now`. */
function date(value: unknown, field: string, now: Date): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return fail(field, "not a string");
  const match = DATE.exec(value);
  if (!match) return fail(field, "not YYYY-MM-DD");
  const [, y, m, d] = match.map(Number);
  const day = new Date(Date.UTC(y!, m! - 1, d!));
  if (day.getUTCMonth() !== m! - 1 || day.getUTCDate() !== d!) {
    return fail(field, "not a calendar date");
  }
  const year = now.getUTCFullYear();
  if (y! < year - 1 || y! > year + 5) return fail(field, "out of range");
  return value;
}

function page(value: unknown): string {
  const out = text(value, "source.page", LIMITS.page, { required: true })!;
  if (!PAGE.test(out)) return fail("source.page", "not a same-site path");
  return out;
}

/* ── The catalogue ──────────────────────────────────────────────── */

interface CatalogueRange {
  label: string;
  powerType?: string;
  availability: string;
}
const CATALOGUE = new Map(
  (categories as { id: string; name: string; ranges: CatalogueRange[] }[]).map(
    (c) => [c.id, c],
  ),
);

/**
 * The rating, resolved against the category's ranges.
 *
 * A label is not unique inside a category (forklifts list "3 ton" twice,
 * diesel and electric — see `rangeKey()`), so the client's power type picks
 * between duplicates. Whatever it says, the power type and availability that
 * come back are the catalogue's.
 */
function rating(
  value: unknown,
  ranges: CatalogueRange[],
): QuotePayload["request"]["rating"] {
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) return fail("request.rating", "not an object");
  const label = text(value.label, "request.rating.label", 60, {
    required: true,
  });
  const wanted =
    typeof value.powerType === "string" ? value.powerType : undefined;
  const matches = ranges.filter((r) => r.label === label);
  const range =
    matches.find((r) => (r.powerType ?? null) === (wanted ?? null)) ??
    matches[0] ??
    fail("request.rating", "not a size this category lists");
  return {
    label: range.label,
    powerType: range.powerType ?? null,
    availability: range.availability as Availability,
  };
}

/* ── The payload ────────────────────────────────────────────────── */

/** True when the honeypot is filled. Check before `parseQuote`. */
export const isSpam = (body: unknown) => {
  if (!isRecord(body)) return false;
  const trap = body[HONEYPOT_FIELD];
  return trap !== undefined && trap !== null && trap !== "";
};

function build(body: unknown, now: Date): QuotePayload {
  if (!isRecord(body)) return fail("body", "not an object");
  if (body.v !== PAYLOAD_VERSION) return fail("v", "unknown payload version");

  const source = isRecord(body.source)
    ? body.source
    : fail("source", "required");
  const variant = (
    source.variant === "dialog" || source.variant === "inline"
      ? source.variant
      : fail("source.variant", "not dialog or inline")
  ) as QuoteVariant;

  /* 01 — what you need */
  const req = isRecord(body.request)
    ? body.request
    : fail("request", "required");
  const mode = choice(req.mode, "request.mode", MODES, true) as QuoteMode;

  let category: QuotePayload["request"]["category"] = null;
  let otherItem: string | null = null;
  let ratingOut: QuotePayload["request"]["rating"] = null;
  if (req.category !== null && req.category !== undefined) {
    if (!isRecord(req.category) || typeof req.category.id !== "string") {
      return fail("request.category", "not a category");
    }
    const entry =
      CATALOGUE.get(req.category.id) ??
      fail("request.category", "unknown category");
    category = { id: entry.id, name: entry.name };
    ratingOut = rating(req.rating, entry.ranges);
  } else {
    otherItem = text(req.otherItem, "request.otherItem", LIMITS.otherItem, {
      required: true,
    });
    if (req.rating !== undefined && req.rating !== null) {
      return fail("request.rating", "no sizes without a category");
    }
  }

  const duty = text(req.duty, "request.duty", LIMITS.duty, { multiline: true });
  // A listed machine needs a size, or a description of the duty to size it.
  if (category && !ratingOut && !duty) {
    return fail("request.rating", "a size or a duty description");
  }

  const quantity =
    req.quantity === undefined || req.quantity === null ? 1 : req.quantity;
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 999
  ) {
    return fail("request.quantity", "a whole number from 1 to 999");
  }
  const attachments = text(
    req.attachments,
    "request.attachments",
    LIMITS.attachments,
  );

  /* 03 — the terms; only this mode's */
  const t = isRecord(body.terms) ? body.terms : {};
  const hire = mode === "hire";
  const buy = mode === "buy";
  const docs = t.docs ?? false;
  if (typeof docs !== "boolean") return fail("terms.docs", "not a boolean");
  // Validated whichever mode it is, so a junk value is never waved through.
  const terms: QuotePayload["terms"] = {
    startDate: date(t.startDate, "terms.startDate", now),
    duration: choice(t.duration, "terms.duration", DURATIONS, hire),
    emirate: choice(t.emirate, "terms.emirate", EMIRATES, hire),
    transport: choice(t.transport, "terms.transport", TRANSPORT),
    condition: choice(t.condition, "terms.condition", CONDITIONS, buy),
    timeframe: choice(t.timeframe, "terms.timeframe", TIMEFRAMES, buy),
    destination: choice(t.destination, "terms.destination", DESTINATIONS),
    docs,
  };
  if (!hire) {
    terms.startDate = terms.duration = terms.emirate = terms.transport = null;
  }
  if (!buy) {
    terms.condition = terms.timeframe = terms.destination = null;
    terms.docs = false;
  }

  /* 04 — where to send it */
  const c = isRecord(body.contact) ? body.contact : fail("contact", "required");
  const contact: QuotePayload["contact"] = {
    name: text(c.name, "contact.name", LIMITS.name, { required: true })!,
    company: text(c.company, "contact.company", LIMITS.company),
    phone: phone(c.phone),
    email: email(c.email),
    channel: choice(c.channel, "contact.channel", CHANNELS, true) as Channel,
  };
  // Required whatever the channel, as the form requires it (validate.ts).
  if (!contact.email) return fail("contact.email", "required");

  return {
    v: PAYLOAD_VERSION,
    submittedAt: now.toISOString(),
    source: { page: page(source.page), variant },
    request: {
      mode,
      category,
      otherItem,
      rating: ratingOut,
      duty,
      quantity,
      attachments,
    },
    terms,
    contact,
    notes: text(body.notes, "notes", LIMITS.notes, { multiline: true }),
  };
}

/** The whole check. `now` is the server's clock — it becomes `submittedAt`. */
export function parseQuote(body: unknown, now: Date): ParseResult {
  try {
    return { ok: true, payload: build(body, now) };
  } catch (error) {
    if (error instanceof Invalid) {
      return { ok: false, field: error.field, reason: error.reason };
    }
    throw error;
  }
}
