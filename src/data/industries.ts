/**
 * Industries served — powers the homepage photo grid, the /industries hub,
 * the coverage matrix and the per-industry pages at /industries/[slug].
 * Add an entry here and all four update.
 *
 * `categories` holds equipment collection **ids**, not display names. That is
 * deliberate: the names are looked up from the collection at build time, so a
 * "commonly supplied" item links to the real category page instead of bouncing
 * to a homepage anchor, and a typo fails the build rather than shipping a dead
 * link (see `industryCategories` in lib/equipment.ts).
 */

export interface Industry {
  /** URL segment: /industries/<slug> */
  slug: string;
  name: string;
  /** One-liner under the name on the tile and the page banner. */
  tagline: string;
  /** Body copy for the industry page. */
  body: string;
  /**
   * The specific thing this sector needs that the others don't. This is what
   * makes the page look like it was written for its reader rather than
   * find-and-replaced.
   */
  duty: { title: string; body: string };
  /** Photo tile / page banner. */
  image: string;
  /** Equipment category ids, most requested first. */
  categories: string[];
}

export const industries: Industry[] = [
  {
    slug: "construction",
    name: "Construction",
    tagline: "Power, lifting and light for every stage of the build.",
    body: "From enabling works to handover, construction sites run on temporary power and reliable lifting. We keep generators, tower lights, forklifts and heavy machinery ready to dispatch from our Sajjah yard — sized to your load schedule, on terms that flex as the programme moves, to buy outright or on hire.",
    duty: {
      title: "Sized on starting load, not running load",
      body: "A tower crane and a batching plant draw far more at start-up than they do in service. We specify against the largest starting load on your schedule, so the set you take actually starts what you run — and we re-size free when the programme changes.",
    },
    image: "/images/industry-construction.jpg",
    categories: ["generators", "tower-lights", "forklifts", "telehandlers"],
  },
  {
    slug: "oil-gas",
    name: "Oil & Gas",
    tagline: "Dependable equipment for energy sites, onshore and off.",
    body: "Energy projects demand equipment that performs in heat, dust and continuous duty. We supply generators, air compressors and genuine spare parts specified for demanding environments, with the documentation and turnaround energy contractors expect.",
    duty: {
      title: "Continuous duty, and dust",
      body: "A prime-rated set running 24 hours is a different machine from a standby one, and filtration is what decides whether it reaches its service interval. Units for energy sites go out on continuous duty ratings with uprated filtration and a servicing schedule attached.",
    },
    image: "/images/industry-oil-gas.jpg",
    categories: ["generators", "air-compressors", "tower-lights"],
  },
  {
    slug: "marine-ports",
    name: "Marine & Ports",
    tagline: "Container handling and quayside power that keeps cargo moving.",
    body: "Port operations can't wait on equipment. We provide heavy-duty forklifts, container-handling machinery and quayside power with fast replacement and service support, so vessels turn around on schedule.",
    duty: {
      title: "Container weight, not pallet weight",
      body: "Quayside handling starts where general warehouse handling stops. The forklifts we send to ports are specified at the top of our range — up to 15 ton — with the mast and attachment configuration matched to the box, not to a pallet.",
    },
    image: "/images/industry-marine-ports.jpg",
    categories: ["forklifts", "mobile-cranes", "generators"],
  },
  {
    slug: "events-entertainment",
    name: "Events & Entertainment",
    tagline: "Quiet power and lighting for shows, festivals and venues.",
    body: "Outdoor shows need dependable, low-noise power and lighting that installs fast and disappears faster. Our generators and tower lights cover build-up, show nights and de-rig — with standby units on call for the moments that matter.",
    duty: {
      title: "Low noise, and a set you never hear about",
      body: "Canopied sets and a considered position do most of the work; the rest is redundancy. For show nights we hold a standby unit against the primary, because the failure you plan for is the one that never makes it into the audience's evening.",
    },
    image: "/images/industry-events.jpg",
    categories: ["generators", "tower-lights", "scissor-lifts"],
  },
  {
    slug: "facilities-management",
    name: "Facilities Management",
    tagline: "Standby power and maintenance equipment for critical buildings.",
    body: "Hotels, hospitals, malls and towers rely on standby power and planned maintenance. We supply and service standby generators, compressors and genuine spare parts on contract terms built around uptime.",
    duty: {
      title: "Standby that has actually been run",
      body: "A standby set that sits untested for a year is a liability, not a backup. Units on a facilities contract go on a scheduled servicing interval with periodic load testing, so the first time it carries the building isn't the first time it has run under load.",
    },
    image: "/images/industry-facilities.jpg",
    categories: ["generators", "air-compressors", "scissor-lifts"],
  },
  {
    slug: "mining-quarrying",
    name: "Mining & Quarrying",
    tagline: "Heavy-duty machines built for abrasive, high-utilisation work.",
    body: "Quarries and aggregate operations wear equipment hard. We source and supply excavators, dozers, compressors and site power rated for continuous duty, with the parts backup to keep utilisation high.",
    duty: {
      title: "Wear parts on the shelf, not on order",
      body: "In abrasive ground the machine is rarely what fails first — the wear parts are. We hold consumables for the plant we supply into quarry work, so a ground engaging tool or a filter set is a same-day collection rather than a two-week lead time.",
    },
    image: "/images/industry-mining.jpg",
    categories: [
      "excavators",
      "air-compressors",
      "generators",
      "backhoe-loaders",
    ],
  },
  {
    slug: "infrastructure-government",
    name: "Infrastructure & Government",
    tagline: "Fleet capacity for roads, bridges and public works at scale.",
    body: "Public works run to fixed milestones and strict specifications. We provide fleet-scale supply and rental — machinery, site power and lighting — with the compliance paperwork and delivery reliability that government contracts require.",
    duty: {
      title: "Paperwork that survives an audit",
      body: "On public works the machine is half the requirement and the file is the other half. Every unit goes out with its condition report, and our trade licence, register number and licensed activities are published on this site so a procurement officer can check them without asking.",
    },
    image: "/images/industry-infrastructure.jpg",
    categories: ["excavators", "generators", "tower-lights", "mobile-cranes"],
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    tagline: "Backup power and material handling for production lines.",
    body: "A production line standing still is money burning. We keep manufacturers running with standby generators, electric and diesel forklifts, and genuine spare parts — delivered and installed around your shift pattern.",
    duty: {
      title: "Electric indoors, diesel in the yard",
      body: "Indoor handling and yard handling are two different specifications, and running one machine for both costs you either emissions compliance or duty cycle. We split the fleet: electric counterbalance inside, diesel outside, delivered around your shift pattern rather than across it.",
    },
    image: "/images/industry-manufacturing.jpg",
    categories: ["generators", "forklifts", "scissor-lifts"],
  },
];

/** Every category id referenced above, in catalogue order — the columns of the
 *  coverage matrix on the hub. */
export const matrixCategoryIds = [
  ...new Set(industries.flatMap((i) => i.categories)),
];
