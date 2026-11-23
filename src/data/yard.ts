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
 * The banner and the five `yardPoints` images are **AI-rendered, not
 * photographs of the real yards.** Read that again before you treat them as documentary. They were
 * generated on 2026-09-15 (Higgsfield, `gpt_image_2_5`, 4:5, 2K) from the real
 * phone photographs in this folder, plus the brand wordmark, as references — `mixed-plant`, `forklift`,
 * `workshop-genset`, `genset-engine`, `compressor` and `sharjah-gate` — so the
 * machines, the livery, the paver-block ground and the hazy UAE light match
 * the actual yards. Nothing in them depicts a specific real event.
 *
 * They replace the generic placeholders from `public/images/` that stood here
 * before, which is a clear improvement — but they are a bridge, not the
 * finish. The real shoot still retires them. This page argues "here is the
 * physical place"; a rendered frame can carry that argument only until a real
 * one exists.
 *
 * **Why they are safe to publish and the upscaled originals were not.** The
 * earlier failure was an AI *upscaler* let loose on the real photographs: it
 * rewrote every piece of text too small to resolve and invented replacements —
 * the gate signboard became "Collins IOWPMUCS WVHIVI", a published phone
 * number moved by three digits, a Kaeser compressor was relabelled "Teblie6".
 * Collins brands its whole fleet, so almost every real frame is exposed. That
 * rule still stands for the real photographs: resize, crop and colour-grade
 * freely, but never let a model redraw anything with a word on it.
 *
 * The generated frames dodge it a different way, in two parts.
 *
 * 1. **The wordmark is passed in as artwork, not described in words.** The
 *    first reference image on every branded frame is `assets/collins-logo.svg`
 *    rasterised — so the model copies the real mark instead of inventing one.
 *    Described in prose alone it reliably produced a *separate* hexagon badge
 *    sitting next to the word COLLINS, which is not the mark: the hexagon IS
 *    the letter O inside the word, with two angled slashes in it, and
 *    EQUIPMENTS LLC tracked beneath. Every prompt says that in as many words
 *    too, because the reference alone was not enough.
 *
 *    Regenerate the raster with (no host node, so QuickLook does it — the
 *    square viewBox is needed because qlmanage thumbnails are square and will
 *    otherwise crop the wordmark):
 *
 *      viewBox="0 0 277 277", art wrapped in translate(0,92.5), fill #0050f0
 *      on a white rect, then: qlmanage -t -s 1660 -o <dir> <file>.svg
 *
 * 2. **All other text is banned outright** — no phone numbers, no rating
 *    plates, no readable warning stickers, no signboard copy, no number
 *    plates; anything too small to read must render as a blank shape.
 *
 * Each frame was then checked by eye before it was wired in. **If you
 * regenerate any of these, keep all of it and check the result — a garbled
 * wordmark on the page that argues Collins is real is the one error that
 * undoes the site.**
 *
 * The brief (docs/site-expansion/09) still stands and is still unshot: one
 * morning at each yard, one wide establishing shot, five point images, 8–16
 * fleet frames, two workshop details, one loaded flatbed at the gate.
 * Consistent time of day matters more than count.
 *
 * The real photographs stay in this folder untouched — three of them are live
 * on /about, and they are the reference material for the shoot.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const yardPage = {
  /** profile p.8. */
  title: "Two yards. Ready stock.",
  kicker: "Yards: Dubai & Sharjah, U.A.E.",
  /** Rendered, like the five point images below — see the photography note
   *  at the top. Not `hero-yard.jpg`: that file is the homepage hero's
   *  poster frame and video still, and this page wanted a wide
   *  establishing view of stock rather than a single machine.
   *
   *  Shipped as rendered — warm sunrise, full contrast. Two quieter versions
   *  were tried and both rejected: a darkened, cooled curve applied here, and
   *  a re-prompted flat-haze relight from the model. Chosen deliberately, so
   *  don't "fix" the warmth on the grounds that it is louder than the rest of
   *  the palette. */
  banner: "/images/yard/yard-banner.jpg",
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
    image: "/images/yard/fleet-line.jpg",
    alt: "Generators, a telehandler and a forklift in Collins livery standing together on the yard apron, the Dubai skyline hazy behind the boundary wall.",
  },
  {
    title: "Inspected before dispatch.",
    body: "Units are serviced, fuelled and function tested in our workshop, and handed over with a signed condition report.",
    image: "/images/yard/workshop-inspection.jpg",
    alt: "An engineer at the control panel of a canopied generator set in the workshop, its doors open on the engine, before the machine leaves the yard.",
  },
  {
    title: "Fast mobilisation.",
    body: "Dubai and Sharjah put stock within reach of the main construction corridors, Jebel Ali and the northern Emirates.",
    image: "/images/yard/gate-dispatch.jpg",
    alt: "A flatbed loaded with a chained-down generator set pulling out through the open yard gate at first light.",
  },
  {
    title: "Buy or hire.",
    body: "Move from a trial hire to a purchase, or straight to a purchase, without changing supplier, paperwork or point of contact.",
    image: "/images/yard/compressor-row.jpg",
    alt: "Towable air compressors parked nose to tail in Collins livery, a row of forklifts behind them, all available either to buy or on hire.",
  },
  {
    title: "Support after handover.",
    body: "Breakdown response, scheduled servicing and parts held for the equipment we supply.",
    image: "/images/yard/parts-store.jpg",
    alt: "An engineer lifting a filter from the parts store shelving, stocked with filters, hoses and belts for the machines Collins supplies.",
  },
];

/** profile p.6 — the four fleet groups and their ranges, each feeding the
 *  catalogue rather than dead-ending in a lightbox. */
export const galleryIntro =
  "A look at the fleet leaving our yards: the same units supplied outright or made available on hire, every one Collins branded and inspected before dispatch.";

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
