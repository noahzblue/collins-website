/**
 * Company-wide facts and contact details — the single source of truth.
 * Edit anything here (phone, email, address, social, SEO) and it updates
 * across the header, footer, floating buttons, quote band, /contact, the
 * LocalBusiness JSON-LD and <head>.
 *
 * Every fact below is traceable to `collins business profil.pdf` (see
 * docs/site-expansion/03). Nothing here is a guess.
 */

import type { IconName } from "@/components/ui/icons";

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

export interface Place {
  /** Short label — "Head office" / "Yard". */
  tag: string;
  city: string;
  address: string;
  /** What actually happens here — the question a customer is really asking. */
  role: string;
  geo: { lat: string; lng: string };
}

/** Declared outside `site` so `site.phone` can point at the first entry
 *  without a getter — one number, one place to change it. */
const phones: ContactLink[] = [
  { display: "+971 54 438 0684", href: "tel:+971544380684" },
  { display: "+971 52 399 5373", href: "tel:+971523995373" },
  { display: "+971 50 913 2703", href: "tel:+971509132703" },
];

export const site = {
  name: "Collins Equipments",
  /** Profile cover + footer. The p.2 credentials box drops "Sales &". */
  legalName: "Collins Equipments Sales & Rental L.L.C",
  domain: "collinscouae.com",
  url: "https://www.collinscouae.com",

  /** Short description used in the footer brand column. */
  blurb:
    "Heavy equipment, power generation and transport for sale and for hire across the UAE and the GCC: generators, forklifts, cranes, compressors and more.",

  /** All three numbers from the profile, in the profile's order. */
  phones,
  /** The primary line — what the floating call button and single-number
   *  slots (footer, hero) dial. */
  phone: phones[0],

  whatsapp: {
    display: "WhatsApp",
    href: "https://wa.me/971523995373",
  } satisfies ContactLink,

  email: "info@collinscouae.com",

  /** The UAE working week runs Mon–Sat — Friday is a working day here. */
  hours: "Mon–Sat 8:00–18:30",
  hoursLong: "Monday to Saturday, 8:00 am – 6:30 pm",
  /** schema.org openingHours form, for the LocalBusiness JSON-LD. */
  hoursSchema: "Mo-Sa 08:00-18:30",

  /** The commitment made in the profile's contact spread. It belongs next to
   *  every quote CTA on the site. */
  quotePromise: "Quotations are issued the same working day wherever possible.",

  locations: "Dubai · Sharjah",

  /** Two yards, one of which is also the head office.
   *
   *  **Keyed by city, not by function.** These used to be `office` and `yard`,
   *  which encoded the one thing that is no longer the difference between
   *  them: both hold equipment. A key called `office` for a place with stock
   *  on the ground is the kind of name that quietly misleads the next person
   *  to read it. `dubai` carries the commercial function on top, and says so
   *  in its `tag` and `role` rather than in its key. */
  places: {
    dubai: {
      tag: "Head office & yard",
      city: "Dubai",
      address: "Ras Al Khor 2, Dubai, U.A.E.",
      role: "Commercial, quotations and accounts, with stock on the ground.",
      geo: { lat: "25.1776", lng: "55.3488" },
    },
    sharjah: {
      tag: "Yard",
      city: "Sharjah",
      address: "Sajjah, Sharjah, U.A.E.",
      role: "Stock, workshop, collection and dispatch.",
      geo: { lat: "25.2854", lng: "55.6789" },
    },
  } satisfies Record<string, Place>,

  /** Head-office address — kept for the hero tag and footer one-liners. */
  address: "Ras Al Khor 2, Dubai, U.A.E.",

  /** Head-office coordinates — used for the hero's technical detail tag. */
  geo: { lat: "25.1776", lng: "55.3488" },

  /** The local equivalent of an ISO badge: a checkable licence. */
  register: "2766346",
  licensingAuthority: "Dubai Department of Economy & Tourism",

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

  /** Default document metadata; individual pages may override via props.
   *  Sales leads — it is the core of the business (profile p.2). */
  seo: {
    title: "Collins Equipments | Heavy Machinery Sales & Rental in the UAE",
    description:
      "Heavy equipment, power generation and transport for sale and for hire: generators to 1250 KVA, forklifts, cranes and compressors, supplied outright or on hire across the UAE and the GCC.",
  },
} as const;

export type Site = typeof site;

/** Google Maps directions link for either place. */
export const directionsHref = (place: Place) =>
  `https://maps.google.com/?q=${place.geo.lat},${place.geo.lng}`;
