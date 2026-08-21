/** The six services, from the company profile p.7 — the whole life of a
 *  machine on a project: supplying it, getting it there, keeping it running,
 *  and taking it away again.
 *
 *  This file used to hold three, and two of the six ("Transport & haulage",
 *  "Maintenance & spares") are real revenue lines that had no presence on the
 *  website at all. `body` is verbatim from the profile — don't paraphrase it.
 *
 *  Add one here and the homepage follower list, the /services hub, the hub's
 *  index rail and its deep links all pick it up.
 */

import type { IconName } from "@/components/ui/icons";

export interface Service {
  /** Anchor on /services, and the URL segment if detail pages get built. */
  slug: string;
  icon: IconName;
  title: string;
  /** One line for the list row and the homepage teaser. */
  lead: string;
  /** The profile's paragraph — the hub block and any future detail page. */
  body: string;
  /** Three or four scannable capability lines. Not from the profile. */
  points: string[];
  image: string;
  /** Floating mini data-card over the photo. */
  stat: { title: string; line: string };
  /** Label on the block's primary button. */
  cta: string;
}

export const services: Service[] = [
  {
    slug: "equipment-sales",
    icon: "tag",
    title: "Equipment sales",
    lead: "Supplied outright, commissioned and documented.",
    body: "New and inspected used equipment supplied outright across power, handling, lifting and earthmoving, with commissioning, operator handover and documentation for finance or insurance.",
    points: [
      "New and inspected used units",
      "Commissioned before handover",
      "Operator handover on site",
      "Documentation for finance or insurance",
    ],
    image: "/images/why-brands.jpg",
    stat: {
      title: "Commissioned on handover",
      line: "Operator handover plus documentation for finance or insurance.",
    },
    cta: "Request a quotation",
  },
  {
    slug: "equipment-rental",
    icon: "refresh",
    title: "Equipment rental",
    lead: "Short, long or project duration — the same fleet.",
    body: "Short term, long term and project duration hire from the same fleet, with delivery and collection included in the rate.",
    points: [
      "Day, week, month or project duration",
      "Delivery and collection in the rate",
      "The identical fleet we sell from",
      "Breakdown response during hire",
    ],
    image: "/images/why-rental.jpg",
    stat: {
      title: "Delivery included",
      line: "Delivery and collection are in the rate, not on top of it.",
    },
    cta: "Check availability",
  },
  {
    slug: "sourcing-procurement",
    icon: "search",
    title: "Sourcing & procurement",
    lead: "Specification-led sourcing when it isn't standard stock.",
    body: "Specification led sourcing direct from manufacturers and authorised distributors when the unit you need is not standard stock.",
    points: [
      "Direct from manufacturers and authorised distributors",
      "Specified against your duty, not a catalogue",
      "Lead times confirmed before you commit",
      "Handled end to end, one point of contact",
    ],
    image: "/images/service-sourcing.jpg",
    stat: {
      title: "Sourced to spec",
      line: "Direct from manufacturers and authorised distributors.",
    },
    cta: "Send us a spec",
  },
  {
    slug: "transport-haulage",
    icon: "truck",
    title: "Transport & haulage",
    lead: "Flatbed and low-bed movement across the Emirates.",
    body: "Flatbed and low bed movement of plant and cargo across the Emirates, including permits and escorts for out of gauge loads.",
    points: [
      "Flatbed and low bed",
      "Permits arranged",
      "Escorts for out-of-gauge loads",
      "All seven emirates",
    ],
    image: "/images/service-logistics.jpg",
    stat: {
      title: "Permits & escorts",
      line: "Out-of-gauge loads handled end to end.",
    },
    cta: "Request transport",
  },
  {
    slug: "maintenance-spares",
    icon: "wrench",
    title: "Maintenance & spares",
    lead: "Servicing, breakdown response and a parts inventory.",
    body: "Scheduled servicing, breakdown response and a parts inventory for generators, forklifts, compressors and heavy plant.",
    points: [
      "Scheduled servicing to interval",
      "Breakdown response",
      "Parts held for what we supply",
      "Generators, forklifts, compressors and heavy plant",
    ],
    image: "/images/equipment-spare-parts.jpg",
    stat: {
      title: "Parts held",
      line: "For generators, forklifts, compressors and heavy plant.",
    },
    cta: "Talk to service",
  },
  {
    slug: "logistics-export",
    icon: "globe",
    title: "Logistics & export",
    lead: "Regional delivery and export handling.",
    body: "Regional delivery and export handling for equipment moving to Oman, Saudi Arabia, Qatar and African markets.",
    points: [
      "Regional delivery across the GCC",
      "Export documentation handled",
      "Oman, Saudi Arabia, Qatar",
      "African markets",
    ],
    image: "/images/why-delivery.jpg",
    stat: {
      title: "UAE · Oman · KSA · Qatar · Africa",
      line: "Export documentation handled.",
    },
    cta: "Discuss a shipment",
  },
];
