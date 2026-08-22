/**
 * Every option list and every piece of copy the quote form shows.
 *
 * The prototype wrote each chip by hand — six near-identical blocks per group
 * across five groups — which welded the option list into markup, repeated the
 * styling per option, and put display strings (with an en dash) into the
 * payload. Here the list is data and one component renders it, so adding a
 * duration is a one-line edit that cannot break markup and cannot leak a
 * display string into the POST (docs/site-expansion/14 §15.3c).
 *
 * `value` is a stable key. `label` is what the customer reads. They are never
 * the same string.
 *
 * Not here: the five equipment families and the twelve categories. Those are
 * facts in `content/equipment/categories.json` and reach the form through the
 * composition layer, because a second hand-written copy is exactly how the
 * prototype's catalogue drifted before anyone reviewed it (docs 14 §13).
 */

import type { Option } from "@/lib/forms";
import type { FieldName, SectionId } from "./schema";

/** Re-exported so a quote file needs one import, not two. */
export type { Option };

/* ── 01 · What you need ─────────────────────────────────────────── */

/**
 * The opening question, and the site's core distinction. "Not sure yet" is
 * here on purpose: customers move between hire and purchase, and forcing an
 * undecided buyer to guess produces worse data than an honest "not sure"
 * (docs 14 §7).
 *
 * The hints are `services.ts` compressed to a line — equipment sales,
 * equipment rental, and the sourcing service that answers the third. The form
 * itself does not show them: `ui/ChipGroup.astro` renders one hint for the
 * group, not one per option. `sections/ContactCTA.astro` does, because a cell
 * on the homepage has room to say what the difference is and the chip at the
 * top of the form does not. They live here rather than in `data/content.ts` so
 * that what "Hire" means is written once, in the same object as the word.
 */
export const MODES: Option[] = [
  {
    value: "buy",
    label: "Buy outright",
    hint: "New or inspected used, commissioned before handover.",
  },
  {
    value: "hire",
    label: "Hire",
    hint: "Day, week, month or project duration — delivery included.",
  },
  {
    value: "unsure",
    label: "Not sure yet",
    hint: "Describe the job and we'll specify it and price it both ways.",
  },
];

/**
 * The thirteenth tile, last in the picker.
 *
 * Not an error state — a service. `services.ts` sells specification-led
 * sourcing "direct from manufacturers and authorised distributors when the
 * unit you need is not standard stock", so a machine outside the twelve is
 * something Collins does, not something the form cannot take (docs 14 §10a).
 */
export const OTHER_TILE = {
  label: "Something else",
  note: "We source to spec",
};

/* ── 02 · What size ─────────────────────────────────────────────── */

/** The last row of every rating list — the escape when no listed size fits. */
export const RATING_UNSURE: Option = {
  value: "unsure",
  label: "Not sure — size it for me",
  hint: "Describe the duty and we'll specify it.",
};

/* ── 03 · The terms ─────────────────────────────────────────────── */

export const DURATIONS: Option[] = [
  { value: "under-1-week", label: "Under a week" },
  { value: "1-4-weeks", label: "1–4 weeks" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-12-months", label: "3–12 months" },
  { value: "12-months-plus", label: "12 months +" },
  { value: "not-fixed", label: "Not fixed yet" },
];

/** The same seven /contact already uses, in the same order. */
export const EMIRATES: Option[] = [
  { value: "dubai", label: "Dubai" },
  { value: "sharjah", label: "Sharjah" },
  { value: "abu-dhabi", label: "Abu Dhabi" },
  { value: "ajman", label: "Ajman" },
  { value: "ras-al-khaimah", label: "Ras Al Khaimah" },
  { value: "fujairah", label: "Fujairah" },
  { value: "umm-al-quwain", label: "Umm Al Quwain" },
];

export const TRANSPORT: Option[] = [
  { value: "deliver", label: "Deliver to site" },
  { value: "collect", label: "We'll collect" },
];

export const CONDITIONS: Option[] = [
  { value: "new", label: "New" },
  { value: "used", label: "Inspected used" },
  { value: "both", label: "Price me both" },
];

export const TIMEFRAMES: Option[] = [
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
  { value: "this-quarter", label: "This quarter" },
  { value: "budgeting", label: "Budgeting only" },
];

/** Anything but the first is an export, and reveals `EXPORT_NOTE`. */
export const DESTINATIONS: Option[] = [
  { value: "uae", label: "Inside the UAE" },
  { value: "oman", label: "Oman" },
  { value: "saudi-arabia", label: "Saudi Arabia" },
  { value: "qatar", label: "Qatar" },
  { value: "africa", label: "Africa" },
  { value: "elsewhere", label: "Elsewhere" },
];

/* ── 04 · Where to send it ──────────────────────────────────────── */

/** WhatsApp first — in the UAE plant trade it is the channel, not a fallback. */
export const CHANNELS: Option[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
];

/* ── Copy ───────────────────────────────────────────────────────── */

/** The four sections. `QuoteForm` decides their order and numbering. */
export const SECTIONS: Record<SectionId, { title: string; hint: string }> = {
  need: {
    title: "What you need",
    hint: "Whether you're buying or hiring, and which machine.",
  },
  size: {
    title: "What size",
    hint: "Pick a rating — or describe the duty and we'll size it for you.",
  },
  terms: {
    title: "The terms",
    hint: "When you need it, and where it's going.",
  },
  contact: {
    title: "Where to send it",
    hint: "How to reach you, and how you'd like us to reply.",
  },
};

export interface FieldCopy {
  label: string;
  placeholder?: string;
  hint?: string;
}

/**
 * Every label, legend, placeholder and hint in the form. Leaf components take
 * these as props — a component containing the string "Under a week" cannot be
 * reused, and the person who needs to change it has to go looking (docs 14
 * §15.3a).
 */
export const FIELD_COPY = {
  mode: { label: "Buy or hire" },
  category: { label: "Which machine" },
  otherItem: {
    label: "What do you need?",
    placeholder: "e.g. a 4-inch diesel water pump, or a 400 amp welding set",
    hint: "We source to spec, direct from manufacturers and distributors.",
  },
  family: {
    label: "Closest to",
    hint: "Optional — it routes your enquiry to the right desk.",
  },
  rating: { label: "Size / rating" },
  duty: {
    label: "What has it got to run?",
    placeholder:
      "Powering four site cabins, a welding set and a tower crane. No mains.",
  },
  quantity: { label: "How many" },
  attachments: {
    label: "Attachments",
    placeholder: "Breaker, auger, forks, sweeper…",
  },
  startDate: { label: "Start date", hint: "Approximate is fine." },
  duration: { label: "How long" },
  emirate: { label: "Where it's going" },
  transport: { label: "Transport" },
  condition: { label: "Condition" },
  timeframe: { label: "When" },
  destination: { label: "Destination" },
  docs: { label: "Documentation for finance or insurance" },
  name: { label: "Name", placeholder: "Your name" },
  company: { label: "Company", hint: "Optional." },
  phone: { label: "Phone", placeholder: "+971 …" },
  email: { label: "Email", placeholder: "you@company.com" },
  channel: { label: "How should we reply?" },
  notes: {
    label: "Anything else",
    placeholder:
      "Access restrictions, ground conditions, shift pattern, LPO process…",
  },
} satisfies Partial<Record<FieldName, FieldCopy>>;

/**
 * The dialog's own chrome — the heading focus lands on, and the confirm that
 * stands between a dirty form and an accidental Escape.
 *
 * The confirm is in-panel and not `window.confirm()`: a browser confirm is
 * unstyled, cannot say what is at stake, and on a phone reads as an error
 * (docs 14 §4).
 */
export const DIALOG = {
  title: "Request a quotation",
  close: "Close the quote request",
  discard: {
    title: "Discard this request?",
    body: "Everything you have filled in so far will be cleared.",
    keep: "Keep editing",
    discard: "Discard",
  },
};

/**
 * The two places a section has nothing to show yet.
 *
 * Section 02's questions depend on which machine was picked and section 03's
 * on buy or hire, so both can be reached before they have anything in them.
 * An empty panel reads as broken; a line saying what unlocks it does not.
 */
export const SECTION_EMPTY: Record<"size" | "terms", string> = {
  size: "Pick a machine in section 01 and its sizes appear here.",
  terms:
    "Choose buy or hire in section 01 and the right questions appear here.",
};

/** The `dutyGuide` accordion under a rating list. One category has one. */
export const DUTY_GUIDE_LABEL = "Not sure which size? Read the sizing guide";

/**
 * The running spec line — the summary rail at ≥1240px and the sticky bar
 * below it. Slots are fixed per mode so the rail does not jump as it fills;
 * an unanswered slot is greyed rather than absent (docs 14 §14.1c).
 */
export const SUMMARY = {
  title: "Your request",
  submit: "Send request",
  submitting: "Sending…",
  /** Under the button, so the promise sits with the action. */
  labels: {
    mode: "Buy or hire",
    category: "Machine",
    rating: "Size",
    quantity: "Quantity",
    duration: "Duration",
    startDate: "Start",
    emirate: "Location",
    transport: "Transport",
    condition: "Condition",
    timeframe: "When",
    destination: "Destination",
    channel: "Reply by",
  },
  /** What a slot reads before it is answered. */
  pending: "—",
};

/**
 * The chip that appears when a trigger answered sections 01 and 02 for the
 * customer — "Generators · 250 kVA · Hire   [change]".
 *
 * Below 900px only. Above it the summary rail already says all of this, and
 * two summaries of one request is one too many (docs 14 §9a).
 */
export const PREFILL = {
  change: "Change",
  /** Read by a screen reader when the form opens pre-answered. */
  announce: "Answered from your last page. Opening at the terms.",
};

/** The mobile step bar and its two buttons. */
export const NAV = {
  back: "Back",
  next: "Continue",
  /** Announced politely on every step change (docs 14 §4). */
  announce: (index: number, total: number, title: string) =>
    `Step ${index} of ${total}, ${title}`,
  counter: (index: number, total: number) =>
    `${String(index).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
};

/** Subject line when the customer asks to be answered by email (docs 14 §12). */
export const EMAIL_SUBJECT = "Quotation request";

/** After a successful send. The panel body is replaced by this (docs 14 §12). */
export const SUCCESS = {
  title: "Request sent",
  body: "We have your request. If WhatsApp opened in another tab, send the message there and we will pick it up straight away.",
  refLabel: "Reference",
  again: "Send another request",
};

/** In-flight failure, with the manual routes offered rather than described. */
export const SUBMIT_ERROR = {
  title: "That did not send",
  body: "Nothing is lost — everything you filled in is still here. Try again, or reach us directly.",
  retry: "Try again",
};

/**
 * The honeypot. A field no person can see and no person will fill; a bot
 * fills every input it finds. Proportionate here, and unlike a CAPTCHA it
 * costs the customer nothing (docs 14 §8, §12).
 */
export const HONEYPOT = "company-website";

/** Shown when any export destination is chosen — it is a real service. */
export const EXPORT_NOTE =
  "Export documentation and handling quoted with the machine.";

/** Shown under the "Not sure yet" terms panel, so the choice is not a dead end. */
export const UNSURE_NOTE = "We'll price it both ways so you can compare.";

/** Return an option's display label, falling back to the raw value. */
export const labelOf = (options: Option[], value: string | null) =>
  (value && options.find((option) => option.value === value)?.label) ??
  value ??
  "";
