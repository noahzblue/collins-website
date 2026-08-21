/**
 * /yard — "One yard. Ready stock."
 *
 * The only page on the site that says where the machines physically are, what
 * happens to them before dispatch, and how fast they leave. Everything else is
 * a claim a competitor could also make; this is the one that isn't.
 *
 * Copy is verbatim from the company profile, pages 6 and 8. The headline and
 * kicker are the profile's own and better than anything we'd write.
 *
 * ── PHOTOGRAPHY DEBT ─────────────────────────────────────────────────────
 * Every `image` below currently points at a photo already in `public/images/`.
 * They are placeholders standing in for a proper shoot, and this is the page
 * where the images ARE the argument — a page about a physical place is only
 * as credible as its photographs. The brief (docs/site-expansion/09) is one
 * morning at Sajjah: one wide establishing shot, five point images, 8–16 fleet
 * frames, two workshop details, one loaded flatbed at the gate. Consistent
 * time of day matters more than count.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const yardPage = {
  /** profile p.8. */
  title: "One yard. Ready stock.",
  kicker: "Yard: Sajjah, Sharjah, U.A.E.",
  banner: "/images/hero-yard.jpg",
  seoTitle: "Our Sajjah Yard | Ready Stock, Inspected Before Dispatch",
  seoDescription:
    "One yard in Sajjah, Sharjah: generators, forklifts, telehandlers, cranes and trailers under one roof, serviced and function tested before dispatch, within reach of Dubai's main construction corridors.",
};

/** The five points, verbatim from p.8. One pinned photograph, five frames. */
export const yardPoints = [
  {
    title: "Everything under one roof.",
    body: "Generators, forklifts, telehandlers, cranes and trailers stand in the same yard, so a mixed order arrives on one delivery, on one agreement.",
    image: "/images/hero-yard.jpg",
    alt: "Wide view of the Sajjah yard with generators, forklifts and a telehandler standing in the same compound.",
  },
  {
    title: "Inspected before dispatch.",
    body: "Units are serviced, fuelled and function tested in our workshop, and handed over with a signed condition report.",
    image: "/images/why-reliability.jpg",
    alt: "An engineer running a function test on a canopied generator set in the workshop before it leaves the yard.",
  },
  {
    title: "Fast mobilisation.",
    body: "Sajjah sits within reach of Dubai's main construction corridors, Jebel Ali and the northern Emirates.",
    image: "/images/why-delivery.jpg",
    alt: "A loaded flatbed carrying plant out through the yard gate at first light.",
  },
  {
    title: "Buy outright or hire.",
    body: "Move from a trial hire to a purchase, or straight to a purchase, without changing supplier, paperwork or point of contact.",
    image: "/images/why-brands.jpg",
    alt: "A line of branded machines standing ready in the yard, available either to buy outright or on hire.",
  },
  {
    title: "Support after handover.",
    body: "Breakdown response, scheduled servicing and parts held for the equipment we supply.",
    image: "/images/equipment-spare-parts.jpg",
    alt: "Parts shelving in the workshop stocked for the generators, forklifts and compressors Collins supplies.",
  },
];

/** profile p.6 — the four fleet groups and their ranges, each feeding the
 *  catalogue rather than dead-ending in a lightbox. */
export const galleryIntro =
  "A look at the fleet leaving the Sajjah yard — the same units supplied outright or made available on hire, every one Collins branded and inspected before dispatch.";

export const fleetGroups = [
  {
    label: "Generators",
    range: "10 kVA – 1,250 kVA",
    image: "/images/equipment/generators-hero.jpg",
    href: "/equipment/generators",
  },
  {
    label: "Forklifts",
    range: "1.4 – 15 ton",
    image: "/images/equipment/forklifts-hero.jpg",
    href: "/equipment/forklifts",
  },
  {
    label: "Air compressors",
    range: "135 – 1,050 CFM",
    image: "/images/equipment/air-compressors-hero.jpg",
    href: "/equipment/air-compressors",
  },
  {
    label: "Cranes & plant",
    range: "Telehandlers, excavators & skid steers",
    image: "/images/equipment/telehandlers-hero.jpg",
    href: "/equipment/telehandlers",
  },
];

/**
 * What happens when you call. Not in the profile — it is the synthesis of p.8
 * and p.9's same-working-day promise, and it turns the page from "we have a
 * yard" into "here is what happens next".
 *
 * NEEDS SIGN-OFF FROM OPERATIONS before launch: step 02 publishes a timing
 * commitment. Don't ship a promise operations hasn't agreed to.
 */
export const mobilisation = [
  {
    label: "Enquiry",
    body: "You send the machine, the duty and the dates.",
  },
  {
    label: "Quote",
    body: "Issued the same working day wherever possible.",
  },
  {
    label: "Inspection",
    body: "Serviced, fuelled and function tested.",
  },
  {
    label: "Dispatch",
    body: "Loaded, delivered, signed condition report on handover.",
  },
];

/** The page's blocks, in order — feeds the sticky index rail. */
export const yardBlocks = [
  { id: "the-yard", label: "The yard" },
  { id: "the-fleet", label: "The fleet" },
  { id: "mobilisation", label: "Mobilisation" },
];
