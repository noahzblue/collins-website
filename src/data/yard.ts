/**
 * /yard — "Two yards. Ready stock."
 *
 * The only page on the site that says where the machines physically are, what
 * happens to them before dispatch, and how fast they leave. Two yards, Dubai
 * and Sharjah, both holding stock — the page used to argue "one yard, one
 * roof, one delivery", which was the wrong argument and also untrue. Everything else is
 * a claim a competitor could also make; this is the one that isn't.
 *
 * Copy is verbatim from the company profile, pages 6 and 8. The headline and
 * kicker are the profile's own and better than anything we'd write.
 *
 * ── PHOTOGRAPHY ──────────────────────────────────────────────────────────
 * Every `image` below is now a real photograph of Collins plant, shot on a
 * phone in the yards (`public/images/yard/`). That clears the stock-photo
 * debt this page carried, and it is the page where it mattered most — a page
 * about a physical place is only as credible as its photographs.
 *
 * Two things still outstanding, both resolution rather than authenticity:
 * `mixed-plant.jpg` is 720px on its long edge (it is the only wide shot of
 * both yards' stock together) and `sharjah-gate.jpg` is 960px. Neither can be
 * AI-upscaled — the models rewrite the signboard and the fleet decals into
 * nonsense, inventing phone numbers and manufacturer names. They need
 * re-shooting, not enhancing. The brief (docs/site-expansion/09) still stands
 * for the rest: one morning at each yard, consistent time of day.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const yardPage = {
  /** profile p.8. */
  title: "Two yards. Ready stock.",
  kicker: "Yards: Dubai & Sharjah, U.A.E.",
  banner: "/images/yard/workshop-genset.jpg",
  seoTitle:
    "Our Yards in Dubai & Sharjah | Ready Stock, Inspected Before Dispatch",
  seoDescription:
    "Two yards, Dubai and Sharjah: generators, forklifts, telehandlers, cranes and trailers held ready, serviced and function tested before dispatch, within reach of the UAE's main construction corridors.",
};

/** The five points, verbatim from p.8. One pinned photograph, five frames. */
export const yardPoints = [
  {
    title: "One fleet, two yards.",
    body: "Generators, forklifts, telehandlers, cranes and trailers stand across both yards, so a mixed order is still one agreement, one quotation and one point of contact.",
    image: "/images/yard/stacker-scissor.jpg",
    alt: "An electric pallet stacker, a scissor lift and a canopied generator standing together in the Collins yard.",
  },
  {
    title: "Inspected before dispatch.",
    body: "Units are serviced, fuelled and function tested in our workshop, and handed over with a signed condition report.",
    image: "/images/yard/genset-engine.jpg",
    alt: "A generator set with its side panel open on the diesel engine, fuel lines and filters in view before dispatch.",
  },
  {
    title: "Fast mobilisation.",
    body: "Dubai and Sharjah put stock within reach of the main construction corridors, Jebel Ali and the northern Emirates.",
    image: "/images/yard/sharjah-gate.jpg",
    alt: "The gate of the Collins yard in Sharjah, the company signboard mounted on the wall above it.",
  },
  {
    title: "Buy or hire.",
    body: "Move from a trial hire to a purchase, or straight to a purchase, without changing supplier, paperwork or point of contact.",
    image: "/images/yard/scissor-lift.jpg",
    alt: "A scissor lift folded down in the yard beside an electric stacker, available either to buy or on hire.",
  },
  {
    title: "Support after handover.",
    body: "Breakdown response, scheduled servicing and parts held for the equipment we supply.",
    image: "/images/yard/rating-plate.jpg",
    alt: "The rating plate on a Collins generator set, listing model, serial number and prime and standby output.",
  },
];

/** profile p.6 — the four fleet groups and their ranges, each feeding the
 *  catalogue rather than dead-ending in a lightbox. */
export const galleryIntro =
  "A look at the fleet leaving our yards — the same units supplied outright or made available on hire, every one Collins branded and inspected before dispatch.";

export const fleetGroups = [
  {
    label: "Generators",
    range: "10 KVA – 1250 KVA",
    image: "/images/yard/generator-150kva.jpg",
    href: "/equipment/generators",
  },
  {
    label: "Forklifts",
    range: "1.4 – 15 ton",
    image: "/images/yard/forklift.jpg",
    href: "/equipment/forklifts",
  },
  {
    label: "Air compressors",
    range: "135 – 1050 CFM",
    image: "/images/yard/compressor.jpg",
    href: "/equipment/air-compressors",
  },
  {
    label: "Cranes & plant",
    range: "Telehandlers, excavators & skid steers",
    image: "/images/yard/mixed-plant.jpg",
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
  { id: "the-yard", label: "The yards" },
  { id: "the-fleet", label: "The fleet" },
  { id: "mobilisation", label: "Mobilisation" },
];
