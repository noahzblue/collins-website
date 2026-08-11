/**
 * Editable marketing copy for each page section.
 * Multi-line headings are arrays — each item renders on its own line.
 */

export const hero = {
  eyebrow: "INDUSTRIAL & HEAVY MACHINERY · SALES & RENTAL · UAE",
  /** Title is split so the middle phrase can be colour-emphasised. */
  title: {
    lead: "Excellence in ",
    emphasis: "Industrial & Heavy Machinery",
    tail: " Rental and Sales Solutions",
  },
  sub: "We provide the most reliable, top-quality branded equipment — built around your industry-specific needs, from Ras Al Khor to Sharjah and beyond.",
  ctas: [
    { label: "Request a Quote", href: "#quote", variant: "primary" as const },
    { label: "Explore Equipment", href: "#products", variant: "outline-white" as const },
  ],
};

export const trustPoints: string[] = [
  "Top International Brands",
  "Flexible Sales & Rental",
  "Wide Equipment Range",
  "Fast Delivery & Ready Stock",
];

export const fleet = {
  eyebrow: "Our Fleet",
  title: ["Equipment Built", "For The Job"],
  intro:
    "Explore our full catalogue — every category available for both purchase and rental, with per-unit enquiry built in.",
};

export const capabilitiesSection = {
  eyebrow: "Capabilities",
  title: ["What We", "Do More"],
};

export const partnersLabel = "Trusted By Leading Manufacturers";

export const buyRent = {
  eyebrow: "Per-Product Flow",
  title: ["Buy It. Or", "Rent It. Your Call."],
  body: "Every product page carries a clear intent toggle instead of one generic enquiry form — the equipment name and your choice (Buy or Rent) pre-fill automatically.",
  points: [
    "Intent captured before the form loads",
    "Equipment name auto-filled, zero re-typing",
    "Routed straight to the sales team on submit",
  ],
  sample: {
    imageLabel: "GENERATOR — PRODUCT PHOTO",
    title: "Diesel Generator 250 KVA",
    spec: "Silent canopy · Cummins engine · Auto-start ready",
    /** First option is the default active toggle. */
    toggles: ["Rent", "Buy"],
    ctaPrefix: "Enquire to",
  },
};

export const quoteBand = {
  eyebrow: "Request A Quote",
  title: ["Get Our Catalogue", "& Pricing"],
  body: "Tell us what you need and how long you need it for — our team responds with pricing and availability within one business day.",
  callPrompt: "Prefer to talk?",
  formLabel: "Fill In The Form Below",
};

export const branchesSection = {
  eyebrow: "Location",
  title: ["Our Branch"],
  intro: "Our Dubai branch holds local stock and handles sales, rental and support across the UAE.",
};

export const about = {
  eyebrow: "A Message From Leadership",
  quote:
    "“At Collins Equipments, we deliver high-performance power solutions and heavy machinery built to exceed industrial standards — where innovation meets execution.”",
  author: "Rohan Robert",
  role: "Managing Director",
  photoCaption: {
    name: "ROHAN ROBERT",
    title: "Managing Director, Collins Equipments",
  },
  cta: { label: "Read Our Full Story", href: "#" },
};
