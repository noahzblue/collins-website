/**
 * Editable marketing copy for each page section.
 * Multi-line headings are arrays — each item renders on its own line, and
 * `reveal.ts`'s line-mask variant masks them one line at a time.
 *
 * Voice: calm, confident, sentence case — matched to the minimal premium
 * design. Copy marked "profile p.N" is verbatim from the company profile
 * (docs/site-expansion/03); don't paraphrase it, it is better than we'd write.
 */

export const hero = {
  eyebrow: "Sales & Rental · Dubai & Sharjah · UAE",
  /** Title is split so the closing phrase can be colour-emphasised. The full
   *  stop lives inside `emphasis`: left in `tail` it renders as an orphan
   *  white dot after the blue run, which at display size reads as a glitch. */
  title: {
    lead: "Heavy equipment, power and transport — ",
    emphasis: "for sale and for hire.",
    tail: "",
  },
  sub: "Generators to 1,250 kVA, forklifts, cranes and compressors — supplied outright or on hire from our Sajjah yard, across the UAE.",
  ctas: [
    {
      label: "Request a quote",
      href: "/contact",
      variant: "primary" as const,
    },
    {
      label: "Explore equipment",
      href: "/equipment",
      variant: "outline" as const,
    },
  ],
};

/** "Why Collins" — big statement + tabbed proof card. */
export const trust = {
  eyebrow: "What drives us",
  statement:
    "The first call in the Emirates for equipment that has to work on the day it arrives.",
  /** Constant headline over the photo card; tabs swap image + copy below it. */
  cardTitle: ["Built to keep", "your site moving."],
};

/** "Sales or hire" — the profile's core positioning (p.2), previously
 *  nowhere on the site. Sales is listed first because it is the main business. */
export const supplyModes = {
  eyebrow: "How we supply",
  title: ["Buy it, or hire", "the same machine."],
  modes: [
    {
      label: "Sales",
      lead: "Our main business",
      body: "Supplied outright, sourced direct from manufacturers and authorised distributors, handed over commissioned, documented and ready to work.",
      cta: { label: "Buy outright", href: "/services#equipment-sales" },
    },
    {
      label: "Rental",
      lead: "The same fleet",
      body: "Day, week, month or project duration — delivery and collection included in the rate, supported by the same engineers and held to the same standard.",
      cta: { label: "Hire terms", href: "/services#equipment-rental" },
    },
  ],
  /** profile p.8, verbatim. */
  footnote:
    "Move from a trial hire to a purchase, or straight to a purchase, without changing supplier, paperwork or point of contact.",
};

/** Equipment categories grid. */
export const fleet = {
  eyebrow: "Equipment",
  title: ["Built for the job,", "ready when you are."],
  intro:
    "Sourced direct from manufacturers and authorised distributors, supplied with commissioning, operator handover and parts support — to buy outright or to hire. Six of the twelve categories below.",
  viewAll: { label: "View all 12 categories", href: "/equipment" },
};

/** /equipment hub — the full twelve, listed in sortOrder. */
export const equipmentHub = {
  eyebrow: "Equipment",
  title: ["Everything we supply,", "to buy or to hire."],
  intro:
    "Every category below is sourced direct from manufacturers and authorised distributors, supplied with commissioning, operator handover and parts support — and available for outright purchase or for hire.",
  seoTitle: "Equipment for Sale & Hire in the UAE | Collins Equipments",
  seoDescription:
    "Twelve categories of industrial and heavy equipment to buy outright or hire — generators, forklifts, cranes, access platforms, earthmoving and material handling, delivered across the UAE.",
  closing: {
    title: "Not seeing the machine you need?",
    body: "The twelve above are what we carry day to day. Tell us the job and we'll source to spec — most enquiries come back the same day.",
  },
};

/** Services — the homepage teaser and the /services hub share this copy. */
export const servicesSection = {
  eyebrow: "Services",
  title: ["What we do", "beyond the sale."],
  intro:
    "Six services that cover the whole life of a machine on your project: supplying it, getting it there, keeping it running, and taking it away again.",
  viewAll: { label: "View all services", href: "/services" },
  seoTitle: "Equipment Sales, Rental, Transport & Maintenance | Collins",
  seoDescription:
    "Six services across the life of a machine — equipment sales, rental, sourcing and procurement, transport and haulage, maintenance and spares, logistics and export, across the UAE and the wider region.",
  /** The band that ties /services back to the catalogue. */
  crossSell: {
    body: "Every service above runs on the same twelve categories — 10 kVA to 1,250 kVA of generation, 1.4 to 15 ton of handling, 50 to 600 ton of lift.",
    cta: { label: "View the equipment", href: "/equipment" },
  },
};

/** Accessible label for the manufacturer wordmark strip in the hero. */
export const partnersLabel = "Trusted by the world's leading manufacturers";

/** Industries photo grid + the /industries hub. */
export const industriesSection = {
  eyebrow: "Industries",
  title: ["Wherever the work is,", "we're already there."],
  intro:
    "Eight sectors, one supplier — power, lifting, access and parts matched to how your industry actually works.",
  viewAll: { label: "View all industries", href: "/industries" },
  seoTitle: "Industries We Supply | Collins Equipments UAE",
  seoDescription:
    "Eight sectors supplied from one yard — construction, oil and gas, marine and ports, events, facilities, mining, infrastructure and manufacturing. Equipment sales and rental across the UAE.",
  /** The industry × category coverage table — the hub's real payload. */
  matrix: {
    eyebrow: "Coverage",
    title: ["What we supply,", "sector by sector."],
    intro:
      "The categories most requested by each sector. Every marked cell links straight to that category.",
  },
};

/** The proof band — one named quote, no rotation. */
export const quoteSection = {
  eyebrow: "In our own words",
  imageAlt: "Generator and tower light running on a construction site at dawn",
};

/** About teaser — mission line, stats and the two locations. */
export const aboutSection = {
  eyebrow: "About Collins",
  /* Rendered as one paragraph (`.join(" ")`), not as fixed lines — the array
     is only here because the rest of this file uses one. It is written long
     on purpose: at the statement size in AboutTeaser it has to run to a third
     line, or the block reads as a banner rather than as prose. */
  title: [
    "A partner built for uptime,",
    "sized for scale,",
    "and measured by the machines still running.",
  ],
  body: "We deliver high-performance power solutions and heavy machinery engineered to exceed industrial standards — and we keep them running long after the invoice is settled.",
  cta: { label: "Read our story", href: "/about" },
  office: {
    tag: "Head Office",
    city: "Dubai",
  },
};

/** /about page copy. */
export const aboutPage = {
  seoTitle: "About Collins Equipments | Sales & Rental L.L.C, Dubai",
  seoDescription:
    "Who we are: licensed activities, the Sajjah yard, our leadership team and register 2766346, licensed by the Dubai Department of Economy & Tourism.",
  /** profile p.1 cover — the best one-liner in the document. */
  tagline:
    "Heavy equipment, power generation and transport for sale and for hire.",
};

/** Contact CTA band on the homepage. */
export const contactSection = {
  eyebrow: "Get in touch",
  title: ["Let's get your", "equipment moving."],
  body: "Send us the machine, the duty and the dates — or just describe the job and we'll specify it for you.",
};

/** /contact page — no photo banner; this one opens straight into content. */
export const contactPage = {
  eyebrow: "Contact",
  title: "Let's talk about your next project.",
  body: "Send us the machine, the duty and the dates, or just describe the job and we will specify it for you.",
  seoTitle: "Contact Collins Equipments | Dubai & Sharjah",
  seoDescription:
    "Three lines, two locations and Mon–Sat 8:00–18:30. Quotations are issued the same working day wherever possible.",
};

/** The closing CTA that ends /about, /services, /industries and /yard.
 *  Verbatim from profile p.9 — identical everywhere, on purpose. */
export const pageCta = {
  title: "Let's talk about your next project.",
  body: "Send us the machine, the duty and the dates, or just describe the job and we will specify it for you.",
};
