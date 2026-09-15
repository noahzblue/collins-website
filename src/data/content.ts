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
  eyebrow: "Sales & Rental",
  /** Title is split so the closing phrase can be colour-emphasised. The dash
   *  opens the blue run rather than closing the white one — it is the hinge
   *  between the two halves of the sentence, and reading white it looks like
   *  punctuation the colour forgot. The full stop lives inside `emphasis` for
   *  the same reason: left in `tail` it renders as an orphan white dot after
   *  the blue run, which at display size reads as a glitch. */
  title: {
    lead: "Heavy equipment, power and transport ",
    emphasis: "— for sale and for hire.",
    tail: "",
  },
  sub: "Generators up to 1250 KVA, forklifts, cranes and compressors — supplied outright or on hire, across the UAE and the GCC.",
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
  statement: "Reliable equipment, ready when you need it.",
  /** Constant headline over the photo card; tabs swap image + copy below it. */
  cardTitle: ["Built to keep", "your site moving."],
};

/** "Sales or hire" — the profile's core positioning (p.2), previously
 *  nowhere on the site. Sales is listed first because it is the main business. */
export const supplyModes = {
  eyebrow: "How we supply",
  title: ["Equipment to buy.", "Equipment to hire.", "One trusted partner."],
  modes: [
    {
      label: "Sales",
      lead: "SOURCE. SUPPLY. DELIVER",
      body: "From project-specific requirements to complete equipment purchases, we source the right machine through trusted supply channels and deliver it ready for work.",
      cta: { label: "Buy", href: "/services#equipment-sales" },
    },
    {
      label: "Rental",
      lead: "HIRE. DEPLOY. GET TO WORK",
      body: "Day, week, month or project duration — flexible hire for projects of every length, on straightforward terms, with reliable delivery and responsive support.",
      cta: { label: "Hire terms", href: "/services#equipment-rental" },
    },
  ],
  /** profile p.8, verbatim. */
  footnote: "Whatever the requirement — buy it, hire it, or let us source it.",
};

/** Equipment categories grid. */
export const fleet = {
  eyebrow: "Equipment",
  title: ["Built for the job,", "ready when you are."],
  intro: "Machines that work on day one — to buy or to hire.",
  viewAll: { label: "View all 13 categories", href: "/equipment" },
};

/** /equipment hub — the full thirteen, listed in sortOrder. */
export const equipmentHub = {
  eyebrow: "Equipment",
  title: ["Everything we supply,", "to buy or to hire."],
  intro:
    "Every category below is sourced direct from manufacturers and authorised distributors, supplied with commissioning, operator handover and parts support — and available for outright purchase or for hire.",
  seoTitle: "Equipment for Sale & Hire in the UAE | Collins Equipments",
  seoDescription:
    "Thirteen categories of industrial and heavy equipment to buy or hire — generators, forklifts, cranes, access platforms, earthmoving, material handling and trailers, delivered across the UAE and the GCC.",
  closing: {
    title: "Not seeing the machine you need?",
    body: "The thirteen above are what we carry day to day. Tell us the job and we'll source to spec — most enquiries come back the same day.",
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
    "Six services across the life of a machine — equipment sales, rental, sourcing and procurement, transport and trailers, maintenance and spares, logistics and export, across the UAE and the wider GCC.",
  /** The band that ties /services back to the catalogue. */
  crossSell: {
    body: "Every service above runs on the same thirteen categories — 10 KVA to 1250 KVA of generation, 1.4 to 15 ton of handling, 50 to 600 ton of lift.",
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
    "Eight sectors supplied from two yards — construction, oil and gas, marine and ports, events, facilities, mining, infrastructure and manufacturing. Equipment sales and rental across the UAE and the GCC.",
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
     enough to run to a third line at the statement size in AboutTeaser, or the
     block reads as a banner rather than as prose.

     The three words are the business: buy, sell, service. Everything else on
     the homepage is detail underneath them, so this is the one place that
     says them plainly and stops. */
  title: ["Buy. Sell. Service.", "One supplier,", "start to finish."],
  body: "Buy the machine outright or hire it by the day — either way we service it, and you deal with one person throughout.",
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
    "Who we are: licensed activities, our yards in Dubai and Sharjah, our leadership team, and what Collins sells, hires and services across the UAE and the GCC.",
  /** The photograph over the page heading.
   *
   *  Separate from `whoWeAre.image` on purpose: the two used to be one field,
   *  so the banner and the "Who we are" block showed the identical picture a
   *  screen apart. That reads as a page with one photograph, not as a page
   *  with a point of view.
   *
   *  **Rendered, not photographed** — which is why it sits in `images/` with
   *  the rest of the site's generated imagery rather than in `images/yard/`,
   *  where every file is a real photograph of the real yards. Keep that split:
   *  it is the only thing recording which pictures are evidence and which are
   *  decoration. The machines here are deliberately unbranded, as the rest of
   *  the rendered set is — a generated logo is a fabricated one. */
  banner: "/images/about-banner.jpg",
  /** profile p.1 cover — the best one-liner in the document. */
  tagline:
    "Heavy equipment, power generation and transport for sale and for hire.",
};

/** Contact CTA band on the homepage. */
export const contactSection = {
  eyebrow: "Get in touch",
  title: ["Let's get your", "equipment moving."],
  body: "Send us the machine, the duty and the dates — or just describe the job and we'll specify it for you.",
  /** Heads the three buy/hire links that open the quote form. The options
   *  themselves are not here — they are `MODES` in `lib/quote/options.ts`, so
   *  the homepage cannot word the question differently to the form. */
  start: "Start here",
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
