/**
 * Editable marketing copy for each page section.
 * Multi-line headings are arrays — each item renders on its own line.
 *
 * Voice: calm, confident, sentence case — matched to the minimal premium
 * design. Placeholder stats & testimonials are marked; swap for real ones.
 */

export const hero = {
  eyebrow: "Industrial & Heavy Machinery · Sales & Rental · UAE",
  /** Title is split so the middle phrase can be colour-emphasised. */
  title: {
    lead: "Excellence in ",
    emphasis: "industrial & heavy machinery",
    tail: " rental and sales.",
  },
  sub: "Reliable, top-quality branded equipment — generators, forklifts, compressors and cranes — to buy or rent, delivered fast across the UAE.",
  ctas: [
    { label: "Request a quote", href: "/#contact", variant: "primary" as const },
    { label: "Explore equipment", href: "/#equipment", variant: "outline" as const },
  ],
};

/** "Why Collins" — big statement + tabbed proof card. */
export const trust = {
  eyebrow: "What we do",
  statement: "We Offer Expert Equipment Sourcing and Global Export Solutions",
  /** Constant headline over the photo card; tabs swap image + copy below it. */
  cardTitle: ["Built to keep", "your site moving."],
};

/** Equipment categories grid. */
export const fleet = {
  eyebrow: "Equipment",
  title: ["Built for the job,", "ready when you are."],
  intro:
    "Twelve categories to buy or rent, with per-unit enquiry built in — from a single generator to a full fleet. Six of them below.",
  viewAll: { label: "View all 12 categories", href: "/equipment" },
};

/** /equipment hub — the full twelve, listed in sortOrder. */
export const equipmentHub = {
  eyebrow: "Equipment",
  title: ["Everything we supply,", "to buy or to hire."],
  intro:
    "Twelve categories across power, lifting, access, earthmoving and material handling — every size we carry, with availability on the line and a direct enquiry beside it.",
  seoTitle: "Equipment for Sale & Hire in the UAE | Collins Equipments",
  seoDescription:
    "Twelve categories of industrial and heavy equipment to buy outright or hire — generators, forklifts, cranes, access platforms, earthmoving and material handling, delivered across the UAE.",
  closing: {
    title: "Not seeing the machine you need?",
    body: "The twelve above are what we carry day to day. Tell us the job and we'll source to spec — most enquiries come back the same day.",
  },
};

/** Services overview. */
export const servicesSection = {
  eyebrow: "Services",
  title: ["What we do", "beyond the sale."],
  intro:
    "Trading, rental and logistics under one roof — structured around your project timeline.",
};

/** Accessible label for the manufacturer wordmark strip in the hero. */
export const partnersLabel = "Trusted by the world's leading manufacturers";

/** Industries photo grid. */
export const industriesSection = {
  eyebrow: "Industries",
  title: ["Wherever the work is,", "we're already there."],
  intro:
    "Eight sectors, one supplier — power, lifting, access and parts matched to how your industry actually works.",
};

/** Testimonials — split photo + rotating pull quote. */
export const testimonialsSection = {
  eyebrow: "Case studies",
  imageAlt:
    "Generator and tower light running on a construction site at dawn",
};

/** About teaser — mission line, stats and head-office info. */
export const aboutSection = {
  eyebrow: "About Collins",
  title: ["A partner built for", "uptime and scale."],
  body: "We deliver high-performance power solutions and heavy machinery built to exceed industrial standards — where innovation meets execution.",
  cta: { label: "Read our story", href: "#" },
  office: {
    tag: "Head Office",
    city: "Dubai",
    address: "Ras Al Khor 2, Dubai, UAE",
    hours: "Mon–Fri, 8:00am–6:30pm",
  },
};

/** Contact CTA band. */
export const contactSection = {
  eyebrow: "Get in touch",
  title: ["Let's get your", "equipment moving."],
  body: "Tell us what you need and how long you need it for — our team responds with pricing and availability within one business day.",
};
