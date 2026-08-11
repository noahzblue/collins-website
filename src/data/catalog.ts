/** Equipment catalogue data — products, capabilities, partners and form options. */

export interface Product {
  /** Two-digit index shown in the card corner. */
  num: string;
  title: string;
  /** Spec / range line under the title. */
  sub: string;
  href: string;
}

export const products: Product[] = [
  { num: "01", title: "Generators", sub: "10 KVA – 1250 KVA", href: "#" },
  { num: "02", title: "Forklifts", sub: "1.4T – 15T · Diesel & Electric", href: "#" },
  { num: "03", title: "Air Compressors", sub: "135 – 1050 CFM", href: "#" },
  { num: "04", title: "Heavy Equipment", sub: "Cranes, Dozers, Excavators", href: "#" },
  { num: "05", title: "Tower Lights", sub: "Site & Event Lighting", href: "#" },
  { num: "06", title: "Spare Parts", sub: "Lexus · BMW · Audi · Range Rover", href: "#" },
];

export interface Capability {
  num: string;
  title: string;
  body: string;
}

export const capabilities: Capability[] = [
  {
    num: "01",
    title: "General Trading & Rental",
    body: "Flexible buy-or-rent terms across every equipment category, structured around your project timeline.",
  },
  {
    num: "02",
    title: "Equipment Sourcing",
    body: "Direct access to trusted manufacturers — Perkins, Kalmar, JCB, Cummins, Deutz — sourced to spec.",
  },
  {
    num: "03",
    title: "Logistics & Export",
    body: "Regional delivery and export handling across the UAE, Oman, Saudi Arabia, Qatar and Africa.",
  },
];

/** Manufacturer names for the partners strip. */
export const partners: string[] = [
  "PERKINS",
  "KALMAR",
  "JCB",
  "CUMMINS",
  "DEUTZ",
  "TADANO",
];

/** Options for the quote form's equipment category dropdown. */
export const equipmentCategories: string[] = [
  "Generators",
  "Forklifts",
  "Air Compressors",
  "Heavy Equipment",
  "Tower Lights",
];
