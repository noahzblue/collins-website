/** Equipment catalogue data — products, features, services, partners, proof. */

import type { IconName } from "../components/ui/icons";

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
    icon: "award",
    title: "Top international brands",
    body: "Perkins, Cummins, JCB, Kalmar, Deutz and more — every unit sourced to spec from manufacturers we trust, so the machine that arrives is exactly the machine you ordered.",
    image: "/images/why-brands.jpg",
  },
  {
    icon: "tag",
    title: "Flexible sales & rental",
    body: "Buy outright or rent by the day, week or month. Terms flex around your project timeline, so the fleet scales up or down as the job changes.",
    image: "/images/why-rental.jpg",
  },
  {
    icon: "layers",
    title: "Wide equipment range",
    body: "Generators to cranes, compressors to tower lights — one supplier and one point of contact for the whole site, with genuine spare parts to keep it all running.",
    image: "/images/why-range.jpg",
  },
  {
    icon: "truck",
    title: "Fast delivery & ready stock",
    body: "Local UAE stock dispatched fast — most units leave our Dubai yard within hours of confirmation, with export handling across the wider region.",
    image: "/images/why-delivery.jpg",
  },
];

/* ---------- Equipment categories grid ---------- */

export interface Product {
  /** Two-digit index shown in the card corner. */
  num: string;
  title: string;
  /** Spec / range line under the title. */
  sub: string;
  href: string;
  /** Photo tile shown in the equipment grid. */
  image: string;
}

export const products: Product[] = [
  { num: "01", title: "Generators", sub: "10 KVA – 1250 KVA", href: "/#equipment", image: "/images/equipment-generators.jpg" },
  { num: "02", title: "Forklifts", sub: "1.4T – 15T · Diesel & Electric", href: "/#equipment", image: "/images/equipment-forklifts.jpg" },
  { num: "03", title: "Air Compressors", sub: "135 – 1050 CFM", href: "/#equipment", image: "/images/equipment-compressors.jpg" },
  { num: "04", title: "Heavy Equipment", sub: "Cranes, Dozers, Excavators", href: "/#equipment", image: "/images/equipment-heavy.jpg" },
  { num: "05", title: "Tower Lights", sub: "Site & Event Lighting", href: "/#equipment", image: "/images/equipment-tower-lights.jpg" },
  { num: "06", title: "Spare Parts", sub: "Genuine OEM & Aftermarket", href: "/#equipment", image: "/images/equipment-spare-parts.jpg" },
];

/* ---------- Services overview ---------- */

export interface Service {
  icon: IconName;
  title: string;
  body: string;
  /** Photo shown while this service is active in the accordion. */
  image: string;
  /** Floating mini data-card over the photo. */
  stat: { title: string; line: string };
}

export const services: Service[] = [
  {
    icon: "refresh",
    title: "General trading & rental",
    body: "Flexible buy-or-rent terms across every equipment category, structured around your project timeline.",
    image: "/images/service-rental.jpg",
    stat: { title: "Flexible terms", line: "Day, week or month — scale up or down anytime." },
  },
  {
    icon: "search",
    title: "Equipment sourcing",
    body: "Direct access to trusted manufacturers — Perkins, Kalmar, JCB, Cummins, Deutz — sourced to spec.",
    image: "/images/service-sourcing.jpg",
    stat: { title: "Sourced to spec", line: "Direct from the manufacturers we trust." },
  },
  {
    icon: "globe",
    title: "Logistics & export",
    body: "Regional delivery and export handling across the UAE, Oman, Saudi Arabia, Qatar and Africa.",
    image: "/images/service-logistics.jpg",
    stat: { title: "Regional reach", line: "UAE · Oman · KSA · Qatar · Africa." },
  },
];

/* ---------- Partners ---------- */

export const partners: string[] = [
  "PERKINS",
  "KALMAR",
  "JCB",
  "CUMMINS",
  "DEUTZ",
  "TADANO",
];

/* ---------- Proof: stats + testimonials (placeholder — confirm figures) ---------- */

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

/* ---------- Quote form options ---------- */

export const equipmentCategories: string[] = [
  "Generators",
  "Forklifts",
  "Air Compressors",
  "Heavy Equipment",
  "Tower Lights",
];
