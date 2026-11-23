/** Evidence that Collins can do the job — the four "why us" points, the
 *  manufacturer wordmarks, the headline numbers and client quotes.
 *
 *  Equipment categories are NOT here: they live in the `equipment` content
 *  collection (src/content/equipment/categories.json). Services live in
 *  src/data/services.ts. */

import type { IconName } from "@/components/ui/icons";

/* ---------- "Why Collins": four proof points (tabbed photo card) ---------- */

export interface Feature {
  icon: IconName;
  title: string;
  body: string;
  /** Photo shown while this tab is active in the "Why Collins" card. */
  image: string;
}

export const trustFeatures: Feature[] = [
  {
    icon: "clock",
    title: "Readiness",
    body: "Serviced, fuelled and load-tested stock in both yards. Most units leave the day you confirm.",
    image: "/images/why-readiness.jpg",
  },
  {
    icon: "award",
    title: "Reliability",
    body: "Established brands, serviced on schedule. Every machine is tested and handed over with a signed condition report.",
    image: "/images/why-reliability.jpg",
  },
  {
    icon: "phone",
    title: "Accountability",
    body: "One named contact from enquiry to off-hire. Breakdowns are ours to fix, not yours to chase.",
    image: "/images/why-accountability.jpg",
  },
  {
    icon: "tag",
    title: "Fair dealing",
    body: "Clear rates, honest condition reports and no hidden charges. Quotes go out the same working day where possible.",
    image: "/images/why-fair-dealing.jpg",
  },
];

/* ---------- Manufacturer wordmarks (hero base strip) ---------- */

/**
 * UNVERIFIED. The company profile names no manufacturer at all, so these six
 * are not sourced from it. They run in the hero as a "trusted by" signal —
 * confirm Collins is an authorised or regular channel for each before they
 * stay (docs/site-expansion/03 §Part A).
 */
export const partners: string[] = [
  "PERKINS",
  "KALMAR",
  "JCB",
  "CUMMINS",
  "DEUTZ",
  "TADANO",
];

/* ---------- Headline numbers (profile p.8 — real and checkable) ---------- */

export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: "2", label: "Yards in Dubai & Sharjah" },
  { value: "13", label: "Equipment categories" },
  { value: "7", label: "Emirates served" },
  { value: "1250 KVA", label: "Max generator output" },
];

/* ---------- The proof quote ---------- */

/**
 * One real, named quote (profile p.3) standing where three placeholder client
 * testimonials used to. The placeholders read as customer testimony and were
 * not — see docs/site-expansion/03 §A5.
 *
 * `emphasis` is the clause the profile itself bolds; keep that weight.
 * When real client quotes exist, they go in an array beside this one and this
 * quote moves to /about (docs/site-expansion/10).
 */
export interface Quote {
  lead: string;
  emphasis: string;
  tail: string;
  name: string;
  role: string;
}

export const founderQuote: Quote = {
  lead: "We would rather turn down a job ",
  emphasis: "than send out a machine we have not checked ourselves.",
  tail: "",
  name: "Rohan Robert",
  role: "Managing Director",
};

/**
 * Real client quotes. Empty until there are some.
 *
 * Three placeholders used to live here, attributed to "Site Manager ·
 * Construction · Dubai" and similar. `Testimonials.astro` renders nothing
 * while this array is empty, so the rotation logic survives for the day real
 * quotes land — put them here, add the section back to the homepage, and move
 * `founderQuote` to /about. A quote qualifies when it has a named person, a
 * role and a company (docs/site-expansion/10 §The gate).
 */
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

export const testimonials: Testimonial[] = [];
