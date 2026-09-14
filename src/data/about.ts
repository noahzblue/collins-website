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
  title: ["Hands on,", "close to the yards."],
  paragraphs: [
    "Collins Equipments Sales & Rental L.L.C sells, hires and maintains the machines that keep projects moving across the UAE and the wider GCC: power generation, material handling, earthmoving, lifting and heavy transport.",
    "Generators, forklifts, cranes, compressors, access equipment and earthmoving plant are supplied outright, sourced direct from manufacturers and authorised distributors, and handed over commissioned, documented and ready to work. Where a contractor needs the same machine for weeks rather than years, it is available on hire, supported by the same engineers and held to the same standard.",
    "Our licence covers construction equipment, heavy and light machinery, lifting and loading plant, and alternative energy equipment. That is the full spread a live site actually needs, from a single tower light to a 1250 KVA generator set on a flatbed.",
  ],
  /** Pulled out as a display line between paragraphs 1 and 2. */
  pullQuote:
    "Sales, hire and service — the same machines, held to the same standard.",
  image: "/images/yard/fleet-wide.jpg",
  imageAlt:
    "A Hangcha forklift and a JCB backhoe loader standing side by side in the Collins yard.",
};

/** profile p.3, cut to the bone.
 *
 *  The profile's own wording ran to three clauses each and said the same
 *  thing twice. One sentence per block is the whole of it — a site manager
 *  reads it once and remembers it, which a paragraph nobody finishes cannot
 *  claim. `closer` renders a second line in brand colour beneath the body
 *  when it has one; both are deliberately empty, because a claim this short
 *  does not need a line underneath repeating it. */
export const missionVision = [
  {
    label: "Our mission",
    body: "Machines that work the day they arrive, and keep working long after the invoice is paid.",
    /** Rendered on its own line, in brand colour. */
    closer: "",
  },
  {
    label: "Our vision",
    body: "To be the first call in the GCC when the equipment has to work.",
    closer: "",
  },
];

/** profile p.4. Five people, five remits — no portraits. */
export interface Leader {
  name: string;
  role: string;
  remit: string;
}

/** Two sentences: who they are, and what that gets you.
 *
 *  The middle sentence this used to carry — "between them they cover
 *  ownership, commercial direction, operations, fleet condition and
 *  procurement" — is the remit column of the table directly below it, written
 *  out as a list of job functions. Saying it twice cost the reader the one
 *  line that actually matters to them.
 *
 *  **No turnaround time here, deliberately.** It used to end "come back the
 *  same day rather than the same week", which is a commitment a customer can
 *  hold the company to on a bad week, and the only unhedged one on the site —
 *  every other timing claim says "wherever possible", "usually" or "most".
 *  The structural fact underneath it is the real differentiator and is true
 *  on every week: these five decide, so nothing is referred upward. Keep it
 *  that way. If a turnaround ever goes back in, hedge it and get it signed
 *  off by operations first (see the same note in `data/yard.ts`). */
export const leadershipIntro =
  "A hands on team that stays close to the yards. A hire, a price or a replacement machine is decided by the people you are already talking to, not referred somewhere else.";

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
  body: "Every account is assigned a named contact from our team. You will not be passed between departments during a project.",
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

/** The page's blocks, in order — feeds the sticky index rail. Credentials is
 *  absent because that article is commented out in `pages/about.astro`; put
 *  both back together or the rail scrolls to nothing. */
export const aboutBlocks = [
  { id: "who-we-are", label: "Who we are" },
  { id: "mission-vision", label: "Mission & vision" },
  { id: "leadership", label: "Leadership" },
  { id: "the-yard", label: "The yards" },
];
