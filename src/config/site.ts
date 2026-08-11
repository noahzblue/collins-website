/**
 * Company-wide facts and contact details — the single source of truth.
 * Edit anything here (phone, email, address, social, SEO) and it updates
 * across the header, footer, floating buttons, quote band and <head>.
 */

import type { IconName } from "../components/ui/icons";

export interface ContactLink {
  /** Human-readable text shown on the page. */
  display: string;
  /** The `href` used for the link (tel:/mailto:/https:). */
  href: string;
}

export interface SocialLink {
  /** Full network name — used as the link's accessible label. */
  label: string;
  /** Icon key from the shared icon set (see components/ui/icons.ts). */
  icon: IconName;
  href: string;
}

export const site = {
  name: "Collins Equipments",
  legalName: "Collins Equipments LLC",

  /** Two-line wordmark used by the logo. */
  wordmark: { line1: "COLLINS", line2: "EQUIPMENTS LLC" },

  /** Short description used in the footer brand column. */
  blurb:
    "Reliable industrial & heavy machinery sales & rental across the UAE — generators, forklifts, cranes and more.",

  phone: {
    display: "(+971) 052 399 5373",
    href: "tel:+971523995373",
  } satisfies ContactLink,

  whatsapp: {
    display: "WhatsApp",
    href: "https://wa.me/971523995373",
  } satisfies ContactLink,

  email: "info@collinscouae.com",
  hours: "Mon–Fri 8:00–6:30",
  locations: "Dubai · Sharjah",
  address: "Ras Al Khor 2, Dubai, UAE",

  social: [
    {
      label: "Instagram",
      icon: "instagram",
      href: "https://www.instagram.com/collinsequipments/",
    },
    { label: "Facebook", icon: "facebook", href: "#" },
    { label: "YouTube", icon: "youtube", href: "#" },
    { label: "LinkedIn", icon: "linkedin", href: "#" },
  ] satisfies SocialLink[],

  /** Credit shown in the footer bar. */
  credit: "Design by Aurene",

  /** Default document metadata; individual pages may override via props. */
  seo: {
    title: "Collins Equipments | Heavy Machinery Rental & Sales in the UAE",
    description:
      "Excellence in industrial & heavy machinery rental and sales — generators, forklifts, air compressors, cranes and more, to buy or rent, delivered fast across the UAE.",
  },
} as const;

export type Site = typeof site;
