/**
 * Display strings for the equipment slice.
 *
 * These live here rather than in categories.json so a wording change is one
 * edit instead of twelve — the JSON carries facts, this file carries copy.
 */

import { site } from '../config/site';

export const FAMILIES = [
  'Power & air',
  'Material handling',
  'Access',
  'Lifting',
  'Earthmoving',
] as const;

export type Family = (typeof FAMILIES)[number];
export type Mode = 'hire' | 'buy';
export type Availability = 'yard' | 'on_request' | 'sourced';

/** "Power & air" -> "power-air" — the anchor id for a family on the hub. */
export const familyId = (family: Family) =>
  family
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** One line on what a family is for, under its heading on the hub. */
export const FAMILY_LINE: Record<Family, string> = {
  'Power & air': 'Run a site with no mains supply — power, air and light.',
  'Material handling': 'Move and place material, indoors or across the yard.',
  Access: 'Get people and tools safely to height.',
  Lifting: 'Road-mobile and crawler lifting, 50 to 600 ton.',
  Earthmoving: 'Dig, load and clear, from confined sites to bulk earthworks.',
};

/** Same three states, read differently depending on whether you're hiring or buying. */
export const AVAILABILITY_LABEL: Record<Mode, Record<Availability, string>> = {
  hire: {
    yard: 'In yard',
    on_request: 'On request',
    sourced: 'To order',
  },
  buy: {
    yard: 'Ready stock',
    on_request: 'Short lead',
    sourced: 'Sourced to spec',
  },
};

/** Dot colour on the availability pill — strongest for what's on the ground today. */
export const AVAILABILITY_TONE: Record<Availability, string> = {
  yard: 'bg-brand',
  on_request: 'bg-muted',
  sourced: 'bg-faint',
};

export const INCLUDED: Record<Mode, readonly string[]> = {
  hire: [
    'Delivery and collection included in the rate',
    'Serviced, fuelled and function tested before dispatch',
    'Signed condition report at handover',
    'Breakdown response and scheduled servicing during hire',
    'Day, week, month or project duration',
  ],
  buy: [
    'Sourced direct from manufacturers and authorised distributors',
    'Commissioned and handed over ready to work',
    'Operator handover on site',
    'Documentation for finance or insurance',
    'Parts inventory and servicing after handover',
  ],
};

export const INCLUDED_HEADING: Record<Mode, string> = {
  hire: 'What the hire rate includes',
  buy: 'What comes with the purchase',
};

export const CTA_LABEL: Record<Mode, string> = {
  hire: 'Check availability',
  buy: 'Request quotation',
};

/**
 * "Generators" -> "generator". Every one of the twelve category names is a
 * plain plural, so dropping the trailing "s" is enough to make an enquiry read
 * "a 250 kVA generator" rather than "a 250 kVA generators".
 */
export const singular = (name: string) =>
  name.toLowerCase().replace(/s$/, '');

/**
 * Enquiry link for a category, optionally for one specific size.
 *
 * The quote form still has no backend (see todo.md), so enquiries go to
 * WhatsApp with the machine already named — with this audience that likely
 * converts better than a form anyway. Swap the return value for
 * `/request-quote?item=…&rating=…&mode=…` once the endpoint exists.
 */
export const enquireHref = (name: string, mode: Mode, rangeLabel?: string) => {
  const verb = mode === 'buy' ? 'buying' : 'hiring';
  const item = rangeLabel
    ? `a ${rangeLabel} ${singular(name)}`
    : name.toLowerCase();
  const text = `Hi Collins, I'm interested in ${verb} ${item}.`;
  return `${site.whatsapp.href}?text=${encodeURIComponent(text)}`;
};
