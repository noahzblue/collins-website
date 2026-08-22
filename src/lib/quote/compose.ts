/**
 * One state object, two outputs.
 *
 *   toPayload()  stable keys, nested, versioned — for the POST.
 *   toMessage()  human-readable lines — for the WhatsApp handoff and the
 *                email body.
 *   flatten()    the payload as flat key/value, for a hosted form service.
 *
 * They are separate because they answer to different readers. The prototype
 * pushed display strings ("1–4 weeks", en dash and all) straight into a URL,
 * which is fine for a person reading WhatsApp and useless to a backend
 * (docs/site-expansion/14 §12).
 *
 * Everything here is pure. The facts the state does not carry — the category's
 * name, the range's power type and availability, the page, the timestamp —
 * arrive as a `QuoteContext` rather than being looked up, so this file imports
 * no data and calls no clock.
 */

import { AVAILABILITY_LABEL } from "@/lib/equipment";
import {
  CHANNELS,
  CONDITIONS,
  DESTINATIONS,
  DURATIONS,
  EMIRATES,
  MODES,
  RATING_UNSURE,
  SUMMARY,
  TIMEFRAMES,
  TRANSPORT,
  labelOf,
} from "./options";
import {
  OTHER_CATEGORY,
  PAYLOAD_VERSION,
  UNSURE_RATING,
  availabilityMode,
  type QuoteContext,
  type QuotePayload,
  type QuoteState,
} from "./schema";

const trimmed = (value: string) => {
  const text = value.trim();
  return text === "" ? null : text;
};

export const toPayload = (
  state: QuoteState,
  context: QuoteContext,
): QuotePayload => ({
  v: PAYLOAD_VERSION,
  submittedAt: context.submittedAt,
  source: context.source,
  request: {
    mode: state.mode,
    category: state.category === OTHER_CATEGORY ? null : context.category,
    otherItem:
      state.category === OTHER_CATEGORY ? trimmed(state.otherItem) : null,
    // Both the key and the label travel, because the label is the quotable
    // string — "250 kVA" is what goes on the quotation.
    rating:
      context.rating && state.rating !== UNSURE_RATING
        ? {
            label: context.rating.label,
            powerType: context.rating.powerType ?? null,
            availability: context.rating.availability ?? null,
          }
        : null,
    duty: trimmed(state.duty),
    quantity: state.quantity,
    attachments: trimmed(state.attachments),
  },
  terms: {
    startDate: trimmed(state.startDate),
    duration: state.duration,
    emirate: state.emirate,
    transport: state.transport,
    condition: state.condition,
    timeframe: state.timeframe,
    destination: state.destination,
    docs: state.docs,
  },
  contact: {
    name: state.name.trim(),
    company: trimmed(state.company),
    phone: state.phone.trim(),
    email: trimmed(state.email),
    channel: state.channel,
  },
  notes: trimmed(state.notes),
});

/**
 * The same request as lines a person can read.
 *
 * Mode decides which term lines exist, so a buyer's message never carries an
 * empty "Duration:" and a hirer's never carries "Condition:".
 */
export const toMessage = (state: QuoteState, context: QuoteContext): string => {
  const machine =
    state.category === OTHER_CATEGORY
      ? trimmed(state.otherItem)
      : (context.category?.name ?? null);

  const size = (() => {
    if (state.rating === UNSURE_RATING) return "Not sure — please size it";
    if (!context.rating) return null;
    const { label, powerType, availability } = context.rating;
    const type = powerType ? ` (${powerType})` : "";
    const stock = availability
      ? ` — ${AVAILABILITY_LABEL[availabilityMode(state.mode)][availability]}`
      : "";
    return `${label}${type}${stock}`;
  })();

  const terms =
    state.mode === "hire"
      ? [
          state.startDate && `Start: ${state.startDate}`,
          state.duration && `Duration: ${labelOf(DURATIONS, state.duration)}`,
          state.emirate && `Location: ${labelOf(EMIRATES, state.emirate)}`,
          state.transport &&
            `Transport: ${labelOf(TRANSPORT, state.transport)}`,
        ]
      : state.mode === "buy"
        ? [
            state.condition &&
              `Condition: ${labelOf(CONDITIONS, state.condition)}`,
            state.timeframe && `When: ${labelOf(TIMEFRAMES, state.timeframe)}`,
            state.destination &&
              `Destination: ${labelOf(DESTINATIONS, state.destination)}`,
            state.docs && "Documentation for finance or insurance: yes",
          ]
        : [
            state.timeframe && `When: ${labelOf(TIMEFRAMES, state.timeframe)}`,
            state.emirate && `Location: ${labelOf(EMIRATES, state.emirate)}`,
          ];

  return [
    "Quotation request — collinscouae.com",
    state.mode && `Buy or hire: ${labelOf(MODES, state.mode)}`,
    machine && `Equipment: ${machine}`,
    size && `Size: ${size}`,
    trimmed(state.duty) && `Duty: ${state.duty.trim()}`,
    state.quantity > 1 && `Quantity: ${state.quantity}`,
    trimmed(state.attachments) && `Attachments: ${state.attachments.trim()}`,
    ...terms,
    "",
    `Name: ${state.name.trim()}${trimmed(state.company) ? ` (${state.company.trim()})` : ""}`,
    `Phone: ${state.phone.trim()}`,
    trimmed(state.email) && `Email: ${state.email.trim()}`,
    `Reply by: ${labelOf(CHANNELS, state.channel)}`,
    trimmed(state.notes) && `Notes: ${state.notes.trim()}`,
  ]
    .filter((line) => line !== false && line !== null && line !== undefined)
    .join("\n");
};

/** One line of the summary rail. `value` is null until it is answered. */
export interface SummarySlot {
  key: keyof typeof SUMMARY.labels;
  label: string;
  value: string | null;
}

/**
 * What the summary rail shows, in reading order.
 *
 * The slot *set* is fixed per mode and only the values fill in, so the rail
 * does not reflow as it is answered — a summary that changes height while you
 * read it is a summary you stop reading. Which slots a mode uses is decided
 * here rather than in the component, for the same reason every other derived
 * string is: one place to change it (docs/site-expansion/14 §14.1c, §15.4).
 */
export const toSummary = (
  state: QuoteState,
  context: QuoteContext,
): SummarySlot[] => {
  const slot = (
    key: SummarySlot["key"],
    value: string | null,
  ): SummarySlot => ({
    key,
    label: SUMMARY.labels[key],
    value: value === "" ? null : value,
  });

  const machine =
    state.category === OTHER_CATEGORY
      ? trimmed(state.otherItem)
      : (context.category?.name ?? null);

  const size =
    state.rating === UNSURE_RATING
      ? RATING_UNSURE.label
      : (context.rating?.label ?? null);

  const terms: SummarySlot[] =
    state.mode === "hire"
      ? [
          slot("duration", labelOf(DURATIONS, state.duration)),
          slot("startDate", trimmed(state.startDate)),
          slot("emirate", labelOf(EMIRATES, state.emirate)),
          slot("transport", labelOf(TRANSPORT, state.transport)),
        ]
      : state.mode === "buy"
        ? [
            slot("condition", labelOf(CONDITIONS, state.condition)),
            slot("timeframe", labelOf(TIMEFRAMES, state.timeframe)),
            slot("destination", labelOf(DESTINATIONS, state.destination)),
          ]
        : state.mode === "unsure"
          ? [
              slot("timeframe", labelOf(TIMEFRAMES, state.timeframe)),
              slot("emirate", labelOf(EMIRATES, state.emirate)),
            ]
          : [];

  return [
    slot("mode", labelOf(MODES, state.mode)),
    slot("category", machine),
    // There is no size ladder for a machine we have not been told about yet.
    ...(state.category === OTHER_CATEGORY ? [] : [slot("rating", size)]),
    ...(state.quantity > 1 ? [slot("quantity", String(state.quantity))] : []),
    ...terms,
    slot("channel", labelOf(CHANNELS, state.channel)),
  ];
};

/**
 * The payload as flat `request.mode` / `contact.name` keys.
 *
 * Formspree, Web3Forms and the rest want key/value rather than nested JSON.
 * Swapping to one of them should touch `submit.ts` and nothing else — which is
 * why this lives here rather than being invented at the call site. Add
 * `toMessage()` alongside as `message` if the service emails the fields.
 */
export const flatten = (
  payload: QuotePayload,
  prefix = "",
): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value === null || value === undefined) out[path] = "";
    else if (typeof value === "object")
      Object.assign(out, flatten(value as never, path));
    else out[path] = String(value);
  }
  return out;
};
