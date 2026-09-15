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
 * ── PHOTOGRAPHY DEBT ─────────────────────────────────────────────────────
 * Every `image` below is still a placeholder from `public/images/`. This is
 * the page where the photographs ARE the argument — a page about a physical
 * place is only as credible as its pictures — so the debt matters most here.
 *
 * The raw material now exists: real phone photographs of both yards sit in
 * `public/images/yard/`, and three of them are already live on /about. They
 * are NOT wired in here yet, on purpose. Dropped in as shot they are worse
 * than the placeholders — a close crop of one generator where the page needs
 * an establishing view of the yard. They are being worked through one at a
 * time; wire each one in only once it earns its slot.
 *
 * **Do not reach for an AI upscaler on them.** It was tried at both 2K and
 * 4K: the model rewrites any text too small to resolve and invents
 * replacements, turning the gate signboard into "Collins IOWPMUCS WVHIVI",
 * changing a published phone number by three digits, and relabelling a Kaeser
 * compressor "Teblie6". Collins brands its whole fleet, so almost every frame
 * is exposed. Only the Dubai office survived, because its wall lettering is
 * large. Resize, crop and colour-grade freely; do not let a model redraw
 * anything with a word on it.
 *
 * The brief (docs/site-expansion/09) still stands: one morning at each yard,
 * one wide establishing shot, five point images, 8–16 fleet frames, two
 * workshop details, one loaded flatbed at the gate. Consistent time of day
 * matters more than count.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const yardPage = {
  /** profile p.8. */
  title: "Two yards. Ready stock.",
  kicker: "Yards: Dubai & Sharjah, U.A.E.",
  banner: "/images/hero-yard.jpg",
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
    image: "/images/hero-yard.jpg",
    alt: "Wide view of the Collins yard with generators, forklifts and a telehandler standing in the same compound.",
  },
  {
    title: "Inspected before dispatch.",
    body: "Units are serviced, fuelled and function tested in our workshop, and handed over with a signed condition report.",
    image: "/images/why-reliability.jpg",
    alt: "An engineer running a function test on a canopied generator set in the workshop before it leaves the yard.",
  },
  {
    title: "Fast mobilisation.",
    body: "Dubai and Sharjah put stock within reach of the main construction corridors, Jebel Ali and the northern Emirates.",
    image: "/images/why-delivery.jpg",
    alt: "A loaded flatbed carrying plant out through the yard gate at first light.",
  },
  {
    title: "Buy or hire.",
    body: "Move from a trial hire to a purchase, or straight to a purchase, without changing supplier, paperwork or point of contact.",
    image: "/images/why-brands.jpg",
    alt: "A line of branded machines standing ready in the yard, available either to buy or on hire.",
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
  "A look at the fleet leaving our yards — the same units supplied outright or made available on hire, every one Collins branded and inspected before dispatch.";

export const fleetGroups = [
  {
    label: "Generators",
    range: "10 KVA – 1250 KVA",
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
    range: "135 – 1050 CFM",
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
  { id: "the-yard", label: "The yards" },
  { id: "the-fleet", label: "The fleet" },
  { id: "mobilisation", label: "Mobilisation" },
];
