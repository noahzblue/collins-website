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
    body: "Serviced, fuelled and load tested stock standing in the Sajjah yard. Mobilisation is measured in hours, not weeks \u2014 most units leave the same day they're confirmed.",
    image: "/images/why-readiness.jpg",
  },
  {
    icon: "award",
    title: "Reliability",
    body: "Branded units from established manufacturers, maintained on schedule and documented. Every machine is function tested and handed over with a signed condition report.",
    image: "/images/why-reliability.jpg",
  },
  {
    icon: "phone",
    title: "Accountability",
    body: "One named contact from enquiry to off hire \u2014 you won't be passed between departments mid-project. Breakdowns are ours to fix, not yours to chase.",
    image: "/images/why-accountability.jpg",
  },
  {
    icon: "tag",
    title: "Fair dealing",
    body: "Clear rates, honest condition reports and no charges that were not on the agreement. Quotations are issued the same working day wherever possible.",
    image: "/images/why-fair-dealing.jpg",
  },
];

/* ---------- Manufacturer wordmarks (hero base strip) ---------- */

export const partners: string[] = [
  "PERKINS",
  "KALMAR",
  "JCB",
  "CUMMINS",
  "DEUTZ",
  "TADANO",
];

/* ---------- Stats + testimonials (placeholder — confirm figures) ---------- */

export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: "15+", label: "Years of expertise in the UAE" },
  { value: "500+", label: "Machines available to buy or rent" },
  { value: "24h", label: "Typical quote turnaround" },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Collins had a 250 KVA generator on our site within hours — exactly the spec we asked for, with zero downtime.",
    name: "Site Manager",
    role: "Construction · Dubai",
    rating: 5,
  },
  {
    quote:
      "We rent forklifts across two projects. Reliable machines, flexible terms, and a team that actually picks up the phone.",
    name: "Operations Lead",
    role: "Logistics · Sharjah",
    rating: 5,
  },
  {
    quote:
      "From sourcing to delivery they handled everything — the easiest equipment partner we've worked with in the region.",
    name: "Procurement Head",
    role: "Facilities · Abu Dhabi",
    rating: 5,
  },
];
