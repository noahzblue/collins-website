/**
 * Display strings for the equipment slice.
 *
 * These live here rather than in categories.json so a wording change is one
 * edit instead of twelve — the JSON carries facts, this file carries copy.
 */

import { site } from "@/config/site";
import { slug } from "@/lib/forms";

export type Mode = "hire" | "buy";
export type Availability = "yard" | "on_request" | "sourced";

/** Same three states, read differently depending on whether you're hiring or buying. */
export const AVAILABILITY_LABEL: Record<Mode, Record<Availability, string>> = {
  hire: {
    yard: "In yard",
    on_request: "On request",
    sourced: "To order",
  },
  buy: {
    yard: "Ready stock",
    on_request: "Short lead",
    sourced: "Sourced to spec",
  },
};

/** Dot colour on the availability pill — strongest for what's on the ground today. */
export const AVAILABILITY_TONE: Record<Availability, string> = {
  yard: "bg-brand",
  on_request: "bg-muted",
  sourced: "bg-faint",
};

/**
 * "Hire" / "Buy" chips for a category. `long` is the wordier pair used on the
 * category banner, where there is room for it.
 */
export const availabilityBadges = (
  category: { availableHire: boolean; availableSale: boolean },
  style: "short" | "long" = "short",
) =>
  [
    category.availableHire && (style === "long" ? "For hire" : "Hire"),
    category.availableSale && (style === "long" ? "For sale" : "Buy"),
  ].filter(Boolean) as string[];

export const INCLUDED: Record<Mode, readonly string[]> = {
  hire: [
    "Delivery and collection included in the rate",
    "Serviced, fuelled and function tested before dispatch",
    "Signed condition report at handover",
    "Breakdown response and scheduled servicing during hire",
    "Day, week, month or project duration",
  ],
  buy: [
    "Sourced direct from manufacturers and authorised distributors",
    "Commissioned and handed over ready to work",
    "Operator handover on site",
    "Documentation for finance or insurance",
    "Parts inventory and servicing after handover",
  ],
};

export const INCLUDED_HEADING: Record<Mode, string> = {
  hire: "What the hire rate includes",
  buy: "What comes with the purchase",
};

export const CTA_LABEL: Record<Mode, string> = {
  hire: "Check availability",
  buy: "Request quotation",
};

/**
 * "Generators" -> "generator". Every one of the twelve category names is a
 * plain plural, so dropping the trailing "s" is enough to make an enquiry read
 * "a 250 kVA generator" rather than "a 250 kVA generators".
 */
export const singular = (name: string) => name.toLowerCase().replace(/s$/, "");

/**
 * Enquiry link for a category, optionally for one specific size.
 *
 * The quote form still has no backend (see todo.md), so enquiries go to
 * WhatsApp with the machine already named — with this audience that likely
 * converts better than a form anyway. Swap the return value for
 * `/request-quote?item=…&rating=…&mode=…` once the endpoint exists.
 */
export const enquireHref = (name: string, mode: Mode, rangeLabel?: string) => {
  const verb = mode === "buy" ? "buying" : "hiring";
  const item = rangeLabel
    ? `a ${rangeLabel} ${singular(name)}`
    : name.toLowerCase();
  const text = `Hi Collins, I'm interested in ${verb} ${item}.`;
  return `${site.whatsapp.href}?text=${encodeURIComponent(text)}`;
};

/**
 * A stable key for one size within its category.
 *
 * **`label` alone is not unique.** Forklifts list "3 ton" twice — diesel and
 * electric — and scissor lifts and boom lifts do the same at "12 m" and
 * "20 m". Keying a radio on the label gives two controls the same id and the
 * same value, so `<label for>` binds to the wrong row and the payload cannot
 * say which of the two was asked for. The power type is what separates them,
 * and it is the only thing that ever does.
 *
 * The label still travels in the payload beside this — it is the quotable
 * string, and "250 kVA" is what goes on the quotation (docs 14 §12).
 */
export const rangeKey = (range: { label: string; powerType?: string }) =>
  slug([range.label, range.powerType].filter(Boolean).join(" "));

/**
 * Group categories under their family, preserving the order they arrive in.
 *
 * Families come out in the order they first appear, so a list already sorted
 * by `sortOrder` produces Power & air, Material handling, Lifting, Access,
 * Earthmoving — the catalogue's own order, with no second list to keep in
 * step with it. Used by the quote form's picker, which groups under five
 * headings on a phone (docs/site-expansion/14 §5).
 */
export const groupByFamily = <T extends { family: string }>(categories: T[]) =>
  categories.reduce<{ family: string; items: T[] }[]>((groups, category) => {
    const group = groups.find((g) => g.family === category.family);
    if (group) group.items.push(category);
    else groups.push({ family: category.family, items: [category] });
    return groups;
  }, []);

/**
 * The attributes any "Request a quotation" control carries.
 *
 *   <Button {...quoteTrigger(id, "hire", range)}>Check availability</Button>
 *
 * The dialog reads them, pre-answers sections 01 and 02 and opens on 03. Call
 * it with nothing and the control simply opens the form at the start
 * (docs/site-expansion/14 §9a).
 *
 * `enquireHref()` below is still the `href` on most of these, and stays: it is
 * what happens when the script has not run, and what a control rendered
 * outside the dialog's reach falls back to. One control, two behaviours, and
 * the better one wins when it can.
 */
export const quoteTrigger = (
  category?: string,
  mode?: Mode,
  range?: { label: string; powerType?: string },
) => ({
  "data-quote-open": true,
  ...(category ? { "data-quote-item": category } : {}),
  ...(mode ? { "data-quote-mode": mode } : {}),
  ...(range ? { "data-quote-rating": rangeKey(range) } : {}),
});

/**
 * Resolve equipment category ids to `{ id, name, href }`, throwing on an id
 * that isn't in the collection.
 *
 * `industries.ts` stores category ids rather than display names so an
 * industry's "commonly supplied" list links to the real category page. The
 * throw is the point: a typo fails `bun run build` the same way a bad
 * `related` slug does, instead of shipping a dead link nobody notices.
 */
export const resolveCategories = (
  ids: string[],
  all: { id: string; data: { name: string } }[],
) =>
  ids.map((id) => {
    const match = all.find((category) => category.id === id);
    if (!match) {
      throw new Error(
        `Unknown equipment category id "${id}". Valid ids: ${all
          .map((c) => c.id)
          .join(", ")}`,
      );
    }
    return { id, name: match.data.name, href: `/equipment/${id}` };
  });
