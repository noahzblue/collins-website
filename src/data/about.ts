/**
 * /about — who we are, mission and vision, the leadership team, and the
 * licensed activities.
 *
 * Every line here is verbatim (or lightly trimmed) from the company profile,
 * pages 2 to 4. Nothing is invented: no founding year, no "over 15 years", no
 * client count. If a fact isn't in the profile it isn't on this page.
 *
 * Lives here rather than in content.ts because that file is documented as
 * "section headings, eyebrows, intro paragraphs" — a five-record team array is
 * structured data and doesn't belong in it.
 */

/** profile p.2 — the only place on the site that explains what the company
 *  actually does. Use all three paragraphs; do not compress them. */
export const whoWeAre = {
  eyebrow: "Who we are",
  title: ["A small team,", "close to the yard."],
  paragraphs: [
    "Collins Equipments Sales & Rental L.L.C sells, hires and maintains the machines that keep projects moving across the United Arab Emirates: power generation, material handling, earthmoving, lifting and heavy haulage.",
    "Generators, forklifts, cranes, compressors, access equipment and earthmoving plant are supplied outright, sourced direct from manufacturers and authorised distributors, and handed over commissioned, documented and ready to work. Where a contractor needs the same machine for weeks rather than years, it is available from the identical fleet on hire, supported by the same engineers and held to the same standard.",
    "Our licence covers construction equipment, heavy and light machinery, lifting and loading plant, and alternative energy equipment. That is the full spread a live site actually needs, from a single tower light to a 1,250 KVA generator set on a flatbed.",
  ],
  /** Pulled out as a display line between paragraphs 1 and 2. */
  pullQuote: "Sales are the core of the business.",
  image: "/images/hero-yard.jpg",
  imageAlt:
    "Mixed plant standing in the Collins yard at Sajjah — generators, forklifts and a telehandler lined up ready for dispatch.",
};

/** profile p.3. */
export const missionVision = [
  {
    label: "Our mission",
    body: "To deliver high performance power solutions and heavy machinery engineered to exceed industrial standards, and to keep them running long after the invoice is settled. Durability, precision and uptime are what we sell; the machine is how we deliver it.",
    /** Rendered on its own line, in brand-bright. */
    closer: "",
  },
  {
    label: "Our vision",
    body: "To be the first call in the Emirates for equipment that has to work on the day it arrives. We grow by being the supplier a site manager trusts on a tight programme,",
    closer: "not by being the cheapest quote in the inbox.",
  },
];

/** profile p.4. Five people, five remits — no portraits. */
export interface Leader {
  name: string;
  role: string;
  remit: string;
}

export const leadershipIntro =
  "A small, hands on team that stays close to the yard. Between them they cover ownership, commercial direction, operations, fleet condition and procurement. That is why decisions on a hire, a price or a replacement machine come back the same day rather than the same week.";

export const leadership: Leader[] = [
  {
    name: "Robert C",
    role: "Founder & Chief Executive Officer",
    remit:
      "Sets the direction of the business and holds ownership of long term investment in fleet, facilities and partnerships.",
  },
  {
    name: "Rohan Robert",
    role: "Managing Director",
    remit:
      "Runs the company day to day: commercial strategy, key accounts and the standard every machine is held to before it goes out.",
  },
  {
    name: "Akbar Nizamudeen",
    role: "Executive Director",
    remit:
      "Oversees operations and client delivery, from site surveys and mobilisation through to on hire support.",
  },
  {
    name: "Thamanna Adhinal",
    role: "Executive Director",
    remit:
      "Leads business development and corporate governance, keeping licensing, compliance and growth planning aligned.",
  },
  {
    name: "Alphonsa Ruby Mathew",
    role: "Admin & Procurement Manager",
    remit:
      "Manages sourcing, supplier relationships, documentation and the administration behind every hire and sale.",
  },
];

/** p.4's callout — a real differentiator against the big rental houses, and
 *  too good to bury inside the leadership grid. */
export const onePointOfContact = {
  title: "One point of contact",
  body: "Every account is assigned a named contact from this team. You will not be passed between departments during a project.",
};

/** profile p.2 — the eight licensed activities, which pair cleanly into four
 *  sale/rental rows. That pairing is itself the argument the page has been
 *  making: same licence, same fleet, two ways to get it.
 *
 *  Procurement departments read this block; nobody else does; it costs one
 *  section and it wins tenders. */
export const licensedActivities: { sale: string; rental: string }[] = [
  {
    sale: "Construction equipment & machinery",
    rental: "Construction equipment & machinery rental",
  },
  {
    sale: "Heavy & light machinery & equipment",
    rental: "Heavy & light machinery & equipment rental",
  },
  {
    sale: "Loading, lifting & construction equipment",
    rental: "Loading, lifting & construction equipment with wheels & motors",
  },
  {
    sale: "Alternative energy equipment & supplies",
    rental: "Alternative energy equipment & supplies",
  },
];

/** The page's five blocks, in order — feeds the sticky index rail. */
export const aboutBlocks = [
  { id: "who-we-are", label: "Who we are" },
  { id: "mission-vision", label: "Mission & vision" },
  { id: "leadership", label: "Leadership" },
  { id: "the-yard", label: "The yard" },
  { id: "credentials", label: "Credentials" },
];
