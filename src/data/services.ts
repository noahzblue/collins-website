/** The six services, from the company profile p.7 — the whole life of a
 *  machine on a project: supplying it, getting it there, keeping it running,
 *  and taking it away again.
 *
 *  This file used to hold three, and two of the six ("Transport & trailers",
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
    body: "New and inspected used equipment supplied outright across power, handling, lifting and earthmoving, commissioned, handed over to your operators and documented.",
    points: [
      "New and inspected used units",
      "Commissioned before handover",
      "Operator handover on site",
      "Full handover documentation",
    ],
    image: "/images/service-sales.jpg",
    stat: {
      title: "Commissioned on handover",
      line: "Operator handover plus the full documentation pack.",
    },
    cta: "Request a quotation",
  },
  {
    slug: "equipment-rental",
    icon: "refresh",
    title: "Equipment rental",
    lead: "Short, long or project duration.",
    body: "Short term, long term and project duration hire, with delivery and collection quoted separately so you can see exactly what the movement costs.",
    points: [
      "Day, week, month or project duration",
      "Delivery and collection quoted separately",
      "Serviced and function tested before dispatch",
      "Breakdown response during hire",
    ],
    image: "/images/why-rental.jpg",
    stat: {
      title: "Delivery quoted separately",
      line: "You see the movement cost before you commit to it.",
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
      "New or inspected used, whichever suits the budget",
      "Specified against your duty, not a catalogue",
      "Lead times confirmed before you commit",
    ],
    image: "/images/service-sourcing.jpg",
    stat: {
      title: "Sourced to spec",
      line: "Direct from manufacturers and authorised distributors.",
    },
    cta: "Send us a spec",
  },
  {
    slug: "transport-trailers",
    icon: "truck",
    title: "Transport & trailers",
    lead: "Flatbed and low-bed movement across the GCC.",
    body: "Flatbed and low bed movement of plant and cargo across the GCC, including permits and escorts for out of gauge loads.",
    points: [
      "Flatbed, low bed and extendable",
      "Permits arranged",
      "Escorts for out-of-gauge loads",
      "Point to point across the GCC",
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
    body: "Scheduled servicing, breakdown response and a parts inventory for generators, forklifts, compressors and heavy equipment.",
    points: [
      "Scheduled servicing to interval",
      "Breakdown response",
      "Parts held for what we supply",
      "Generators, forklifts, compressors and heavy equipment",
    ],
    image: "/images/equipment-spare-parts.jpg",
    stat: {
      title: "Parts held",
      line: "For generators, forklifts, compressors and heavy equipment.",
    },
    cta: "Talk to service",
  },
  {
    slug: "logistics-export",
    icon: "globe",
    title: "Logistics & export",
    lead: "Regional delivery and export handling.",
    body: "Regional delivery and export handling for equipment moving to Oman, Saudi Arabia, Qatar, African markets and beyond.",
    points: [
      "Regional delivery across the GCC",
      "Export documentation handled",
      "Oman, Saudi Arabia, Qatar",
      "African markets and other countries",
    ],
    image: "/images/why-delivery.jpg",
    stat: {
      title: "UAE · OMAN · KSA · QATAR · AFRICA · BEYOND",
      line: "Export documentation handled.",
    },
    cta: "Discuss a shipment",
  },
];
