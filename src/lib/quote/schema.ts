/**
 * The quote request contract — types and constants, no behaviour.
 *
 * Two shapes live here and they are deliberately different:
 *
 *   QuoteState    what one instance of the form knows while it is being
 *                 filled in. Flat, serialisable, every value a stable key or
 *                 raw user text — never a display label. This is what
 *                 `scripts/quote/draft.ts` writes to sessionStorage and what
 *                 `validate.ts` reads.
 *   QuotePayload  what leaves the browser. Nested, versioned, and enriched
 *                 with facts the state does not carry (the category's name,
 *                 the range's power type and availability) because those come
 *                 from the content collection, not from the customer.
 *
 * `compose.ts` is the only thing that turns one into the other, and it takes
 * the enrichment as an explicit `QuoteContext` so it stays pure — no data
 * imports, no `new Date()`, testable without a browser (docs 14 §15.4).
 *
 * See docs/site-expansion/14 §7 (the field inventory) and §12 (the payload).
 */

import type { Availability } from "@/lib/equipment";

/** Bumped when the payload shape changes, so a later schema change cannot
 *  silently corrupt a stored lead (docs 14 §12). */
export const PAYLOAD_VERSION = 1;

/**
 * Buy / hire is the site's core distinction and the form's opening question,
 * which is why it carries a third value the equipment slice does not need.
 * `lib/equipment.ts` `Mode` is the two-value version used for availability
 * vocabulary — see `availabilityMode` below.
 */
export type QuoteMode = "buy" | "hire" | "unsure";

/** How the customer wants to be answered. Decides the handoff (docs 14 §12). */
export type Channel = "whatsapp" | "call" | "email";

/** Which mount the request came from — one dialog, one inline (docs 14 §2). */
export type QuoteVariant = "dialog" | "inline";

/** The four sections. Their order is `QuoteForm`'s decision, not this file's. */
export type SectionId = "need" | "size" | "terms" | "contact";

/** `category` when the machine is not one of the twelve (docs 14 §10a). */
export const OTHER_CATEGORY = "other";

/** `rating` when no listed size fits — opens the duty field (docs 14 §10b). */
export const UNSURE_RATING = "unsure";

/**
 * Everything one instance of the form knows.
 *
 * Values are stable keys, not display strings: `"1-3-months"`, never
 * `"1–3 months"`. The en dash belongs in the label, in `options.ts`.
 */
export interface QuoteState {
  /* 01 — what you need */
  mode: QuoteMode | null;
  /** Category id from the content collection, or `OTHER_CATEGORY`. */
  category: string | null;
  /** Free text, required when `category` is `OTHER_CATEGORY`. */
  otherItem: string;
  /** One of the five families, to route an "something else" enquiry. */
  family: string;

  /* 02 — what size */
  /** A range `label` as quoted ("250 kVA"), or `UNSURE_RATING`. */
  rating: string | null;
  /** The duty description, required when `rating` is `UNSURE_RATING`. */
  duty: string;
  quantity: number;
  attachments: string;

  /* 03 — the terms. Only the chosen mode's fields are ever filled. */
  startDate: string;
  duration: string | null;
  emirate: string | null;
  transport: string | null;
  condition: string | null;
  timeframe: string | null;
  destination: string | null;
  docs: boolean;

  /* 04 — where to send it */
  name: string;
  company: string;
  phone: string;
  email: string;
  channel: Channel;
  notes: string;
}

/**
 * A blank form. Also the field manifest — `FIELD_NAMES` is derived from it, so
 * adding a field here is the only edit needed for the draft to persist it.
 */
export const EMPTY_STATE: QuoteState = {
  mode: null,
  category: null,
  otherItem: "",
  family: "",
  rating: null,
  duty: "",
  quantity: 1,
  attachments: "",
  startDate: "",
  duration: null,
  emirate: null,
  /* The two fields that ship pre-answered. They are here, and not only in the
     markup, because "is this form blank?" is asked against this object — and a
     default that lives in one place and not the other makes a pristine form
     look edited, which would arm the dismissal guard on an untouched dialog
     (docs 14 §7 "deliver to site (default)", "inside the UAE (default)"). */
  transport: "deliver",
  condition: null,
  timeframe: null,
  destination: "uae",
  docs: false,
  name: "",
  company: "",
  phone: "",
  email: "",
  channel: "whatsapp",
  notes: "",
};

export type FieldName = keyof QuoteState;

/** Every field, once. `draft.ts` iterates this rather than the DOM. */
export const FIELD_NAMES = Object.keys(EMPTY_STATE) as FieldName[];

/**
 * Which availability vocabulary the rating list should speak.
 *
 * `AVAILABILITY_LABEL` is keyed by the two-value equipment mode. "Not sure
 * yet" has no vocabulary of its own, so it borrows hire's: "In yard / On
 * request / To order" states where the machine physically is, which is true
 * either way — buy's "Ready stock / Short lead" is sales language addressed to
 * someone who has already decided.
 */
export const availabilityMode = (mode: QuoteMode | null) =>
  mode === "buy" ? ("buy" as const) : ("hire" as const);

/**
 * One equipment category as the form's presentation layer needs it.
 *
 * The composition layer shapes the content collection into this and passes it
 * down, which is what lets `CategoryPicker` render server-side inside the
 * dialog and on `/contact` without importing `astro:content` or branching
 * (docs 14 §15.3b). It is a subset on purpose: a picker that took the whole
 * entry would quietly gain the ability to read anything on it.
 */
export interface QuoteCategory {
  id: string;
  name: string;
  /** One of the five families. Groups the picker's rows on a phone. */
  family: string;
  /** The spec line that replaces the photo below 600px (docs 14 §5). */
  rangeLabel: string;
  heroImage?: string;
}

/** One quotable size. The collection's shape, restated so a presentation
 *  component never has to import `astro:content` to be typed. */
export interface QuoteRange {
  /** The rating as it is quoted — "250 kVA", "5 ton", "12 m". */
  label: string;
  powerType?: string;
  typicalDuty?: string;
  availability: Availability;
}

/** What section 02 needs on top of what the picker does. */
export interface QuoteCategoryDetail extends QuoteCategory {
  ranges: QuoteRange[];
  /** Sizing advice. One of the twelve has any, so nothing may depend on it. */
  dutyGuide: { situation: string; advice: string }[];
  /** Whether to ask about attachments — four of the twelve (docs 14 §7). */
  attachments: boolean;
}

/**
 * What a trigger or a shared link asks the form to pre-answer.
 *
 * Someone who has already read a category page and clicked its CTA has
 * answered two of the four sections; making them answer again is the fastest
 * way to lose them. This is the single largest conversion lever in the
 * feature (docs 14 §9).
 *
 * Every field is optional and every value is checked against the catalogue
 * before it is used — a bad link opens the form at section 01 rather than
 * producing an error state.
 */
export interface QuoteIntent {
  /** A category id, or `OTHER_CATEGORY`. */
  item?: string;
  /** `rangeKey()` of a range, or the range's display label. */
  rating?: string;
  /** `buy` / `hire` / `unsure`. */
  mode?: string;
}

/** The facts `compose.ts` needs that the state does not carry. */
export interface QuoteContext {
  /** Resolved from the content collection. `null` for "something else". */
  category: { id: string; name: string } | null;
  /** The selected range, resolved from the same collection. */
  rating: {
    label: string;
    powerType?: string;
    availability?: Availability;
  } | null;
  /** Where the request was made from. */
  source: { page: string; variant: QuoteVariant };
  /** ISO timestamp, passed in so the composer stays pure. */
  submittedAt: string;
}

/**
 * The POST body. Nulls rather than absent keys throughout: a backend reading
 * a stored lead should see the same shape for every request, whatever mode it
 * was (docs 14 §12).
 */
export interface QuotePayload {
  v: number;
  submittedAt: string;
  source: { page: string; variant: QuoteVariant };
  request: {
    mode: QuoteMode | null;
    category: { id: string; name: string } | null;
    otherItem: string | null;
    rating: {
      /** The quotable string — travels alongside the key for that reason. */
      label: string;
      powerType: string | null;
      availability: Availability | null;
    } | null;
    duty: string | null;
    quantity: number;
    attachments: string | null;
  };
  terms: {
    startDate: string | null;
    duration: string | null;
    emirate: string | null;
    transport: string | null;
    condition: string | null;
    timeframe: string | null;
    destination: string | null;
    docs: boolean;
  };
  contact: {
    name: string;
    company: string | null;
    phone: string;
    email: string | null;
    channel: Channel;
  };
  notes: string | null;
}

export type SubmitResult =
  | { ok: true; ref?: string }
  | { ok: false; error: "network" | "server" | "config"; message?: string };
