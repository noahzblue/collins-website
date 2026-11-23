/**
 * /about — who we are, mission and vision, the leadership team, and the
 * licensed activities.
 *
 * Every fact here comes from the company profile, pages 2 to 4. Most lines are
 * verbatim or lightly trimmed; a few are rewritten for readability, and those
 * say so above themselves. Nothing is invented: no founding year, no "over 15
 * years", no client count. If a fact isn't in the profile it isn't on this page.
 *
 * Lives here rather than in content.ts because that file is documented as
 * "section headings, eyebrows, intro paragraphs" — a five-record team array is
 * structured data and doesn't belong in it.
 */

/** profile p.2 — the only place on the site that explains what the company
 *  actually does. Three paragraphs, and all three stay.
 *
 *  Paragraphs 2 and 3 are cut down from the profile's wording, not quoted from
 *  it. The profile wrote each as one sentence of four clauses; that is roughly
 *  twice what anyone reads standing next to a machine. Every fact survives —
 *  the fleet, buy-or-rent, the sourcing, the licence, the tower-light-to-1250
 *  KVA span — in short declarative sentences that lead with the words a buyer
 *  searches for. Keep them short. Length here is not detail, it is friction. */
export const whoWeAre = {
  eyebrow: "Who we are",
  title: ["Hands on,", "close to the yards."],
  paragraphs: [
    "Collins Equipments Sales & Rental L.L.C sells, hires and maintains the machines that keep projects moving across the UAE and the wider GCC: power generation, material handling, earthmoving, lifting and heavy transport.",
    "Generators, forklifts, cranes, air compressors, access equipment and earthmoving machinery. Buy outright or rent by the week, anywhere in the UAE. Every machine comes direct from manufacturers and authorised distributors, commissioned and ready to work.",
    "Licensed for construction equipment, heavy and light machinery, lifting and loading plant, and alternative energy. Everything a live site needs, from one tower light to a 1250 KVA generator.",
  ],
  /** Pulled out as a display line between paragraphs 1 and 2. */
  pullQuote:
    "Sales, hire and service: the same machines, held to the same standard.",
  /** The "Who we are" block only. The page banner is `aboutPage.banner`.
   *
   *  Rendered, like the banner and the rest of the site's non-photographic
   *  imagery — hence `images/`, not `images/yard/`, which holds real
   *  photographs of the real yards and nothing else. Shot 4:5 because that is
   *  the slot's aspect; the plant sits across the vertical middle so the 16:10
   *  crop below the `nav` breakpoint still lands on it. */
  image: "/images/about-who-we-are.jpg",
  imageAlt:
    "A line of canopied diesel generators, a forklift, a towable compressor and a lighting mast parked on a yard apron at first light.",
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
